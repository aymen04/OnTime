'use server';

import { authOrganizationActionClient } from '../safe-action';
import { createSwapRequestSchema } from '../../schemas/shift-swap/create-swap-request-schema';
import { prisma } from '@workspace/database/client';
import { PreConditionError, ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { getCurrentWorkRole } from '@workspace/auth/work-role';
import { revalidateTag } from 'next/cache';
// Ajuste le chemin des clés de cache selon ton projet, ex:
// import { Caching, OrganizationCacheKey } from '@/data/caching';

const actionName = 'createSwapRequest';

export const createSwapRequest = authOrganizationActionClient
  .metadata({ actionName })
  .schema(createSwapRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { shiftId, targetEmployeeId, message } = parsedInput;
    const organizationId = ctx.organization.id;
    const requesterId = ctx.session.user.id;

    // 1. Vérification du rôle (Doit être un employé)
    const currentRole = await getCurrentWorkRole(organizationId, requesterId);
    if (currentRole?.name !== 'employee') {
      throw new ForbiddenError("Seuls les employés peuvent proposer un échange de shift.");
    }

    // 2. Vérification que le collègue ciblé n'est pas le demandeur lui-même
    if (requesterId === targetEmployeeId) {
      throw new PreConditionError("Vous ne pouvez pas échanger un shift avec vous-même.");
    }

    // 3. Vérification du collègue ciblé (Doit être un employé actif de l'orga)
    const targetRole = await getCurrentWorkRole(organizationId, targetEmployeeId);
    if (targetRole?.name !== 'employee') {
      throw new PreConditionError("Le collègue sélectionné n'est pas un employé valide de cette organisation.");
    }

    // 4. Vérification du Shift (Doit appartenir au demandeur et être dans le futur)
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId }
    });

    if (!shift || shift.organizationId !== organizationId) {
      throw new NotFoundError("Le shift est introuvable.");
    }

    if (shift.employeeId !== requesterId) {
      throw new ForbiddenError("Vous ne pouvez proposer que vos propres shifts.");
    }

    if (shift.startTime < new Date()) {
      throw new PreConditionError("Vous ne pouvez pas échanger un shift passé ou en cours.");
    }

    // 5. Vérification des doublons (Pas de demande active pour ce même shift)
    const existingActiveRequest = await prisma.shiftSwapRequest.findFirst({
      where: {
        shiftId,
        status: { in: ['PENDING_EMPLOYEE', 'PENDING_MANAGER'] }
      }
    });

    if (existingActiveRequest) {
      throw new PreConditionError("Une demande d'échange est déjà en cours pour ce shift.");
    }

    // 6. Création de la demande
    const swapRequest = await prisma.shiftSwapRequest.create({
      data: {
        organizationId,
        shiftId,
        requesterId,
        targetEmployeeId,
        message,
        status: 'PENDING_EMPLOYEE',
      },
    });

    // 7. Invalidation du cache (ajuste les clés selon ton fichier caching.ts)
    // revalidateTag(Caching.createOrganizationTag(OrganizationCacheKey.ShiftSwaps, organizationId));

    return swapRequest;
  });