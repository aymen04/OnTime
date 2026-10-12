'use server';

import { authOrganizationActionClient } from '../safe-action';
import { respondSwapRequestSchema } from '../../schemas/shift-swap/respond-swap-request-schema';
import { prisma } from '@workspace/database/client';
import { PreConditionError, ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { getCurrentWorkRole } from '@workspace/auth/work-role';
// import { revalidateTag } from 'next/cache';

const actionName = 'respondSwapRequest';

export const respondSwapRequest = authOrganizationActionClient
  .metadata({ actionName })
  .schema(respondSwapRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { requestId, accept } = parsedInput;
    const organizationId = ctx.organization.id;
    const userId = ctx.session.user.id;

    // 1. Vérification du rôle (Doit être un employé)
    const currentRole = await getCurrentWorkRole(organizationId, userId);
    if (currentRole?.name !== 'employee') {
      throw new ForbiddenError("Seuls les employés peuvent répondre à une demande d'échange.");
    }

    // 2. Récupération de la demande
    const request = await prisma.shiftSwapRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.organizationId !== organizationId) {
      throw new NotFoundError("La demande est introuvable.");
    }

    // 3. Sécurité : Seul le destinataire ciblé peut répondre
    if (request.targetEmployeeId !== userId) {
      throw new ForbiddenError("Vous n'êtes pas autorisé à répondre à cette demande.");
    }

    // 4. Sécurité : La demande doit être en attente de l'employé
    if (request.status !== 'PENDING_EMPLOYEE') {
      throw new PreConditionError("Cette demande a déjà été traitée ou n'est plus valide.");
    }

    // 5. Calcul du nouveau statut
    // Si accept = true -> PENDING_MANAGER
    // Si accept = false -> REJECTED
    const newStatus = accept ? 'PENDING_MANAGER' : 'REJECTED';

    // 6. Mise à jour en base de données
    const updatedRequest = await prisma.shiftSwapRequest.update({
      where: { id: requestId },
      data: { status: newStatus }
    });

    // 7. Invalidation du cache (à décommenter et adapter plus tard)
    // revalidateTag(...)

    return updatedRequest;
  });