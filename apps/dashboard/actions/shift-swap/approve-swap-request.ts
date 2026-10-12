'use server';

import { authOrganizationActionClient } from '../safe-action';
import { approveSwapRequestSchema } from '../../schemas/shift-swap/approve-swap-request-schema';
import { prisma } from '@workspace/database/client';
import { PreConditionError, ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

const actionName = 'approveSwapRequest';

export const approveSwapRequest = authOrganizationActionClient
  .metadata({ actionName })
  .schema(approveSwapRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { requestId } = parsedInput;
    const organizationId = ctx.organization.id;
    const userId = ctx.session.user.id;

    // 1. Vérification du rôle manager
    const currentRole = await getCurrentWorkRole(organizationId, userId);
    if (currentRole?.name !== 'manager') {
      throw new ForbiddenError("Seuls les managers peuvent approuver une demande d'échange.");
    }

    // 2. On inclut le shift pour vérifier ses données
    const request = await prisma.shiftSwapRequest.findUnique({
      where: { id: requestId },
      include: { shift: true }
    });

    if (!request || request.organizationId !== organizationId) {
      throw new NotFoundError("La demande est introuvable.");
    }

    // 3. Application de toutes tes règles de sécurité
    if (request.status !== 'PENDING_MANAGER') {
      throw new PreConditionError("Cette demande n'est pas prête pour l'approbation.");
    }

    if (request.shift.employeeId !== request.requesterId) {
      throw new PreConditionError("Le demandeur n'est plus le propriétaire de ce shift.");
    }

    if (request.shift.startTime < new Date()) {
      throw new PreConditionError("Le shift est déjà passé, l'échange est impossible.");
    }

    // 4. Exécution de la transaction sécurisée
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Transfert officiel du shift au nouveau collègue
      await tx.shift.update({
        where: { id: request.shift.id },
        data: { employeeId: request.targetEmployeeId }
      });

      // B. Validation de cette demande
      const approvedRequest = await tx.shiftSwapRequest.update({
        where: { id: request.id },
        data: { status: 'APPROVED' }
      });

      // C. Annulation automatique de toute autre demande en conflit
      await tx.shiftSwapRequest.updateMany({
        where: {
          shiftId: request.shift.id,
          id: { not: request.id },
          status: { in: ['PENDING_EMPLOYEE', 'PENDING_MANAGER'] }
        },
        data: { status: 'REJECTED' }
      });

      return approvedRequest;
    });

    return result;
  });