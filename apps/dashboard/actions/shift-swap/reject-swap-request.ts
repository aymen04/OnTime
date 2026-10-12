'use server';

import { authOrganizationActionClient } from '../safe-action';
import { rejectSwapRequestSchema } from '../../schemas/shift-swap/reject-swap-request-schema';
import { prisma } from '@workspace/database/client';
import { PreConditionError, ForbiddenError, NotFoundError } from '@workspace/common/errors';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

const actionName = 'rejectSwapRequest';

export const rejectSwapRequest = authOrganizationActionClient
  .metadata({ actionName })
  .schema(rejectSwapRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { requestId } = parsedInput;
    const organizationId = ctx.organization.id;
    const userId = ctx.session.user.id;

    const currentRole = await getCurrentWorkRole(organizationId, userId);
    if (currentRole?.name !== 'manager') {
      throw new ForbiddenError("Seuls les managers peuvent refuser une demande d'échange.");
    }

    const request = await prisma.shiftSwapRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.organizationId !== organizationId) {
      throw new NotFoundError("La demande est introuvable.");
    }

    if (request.status !== 'PENDING_MANAGER') {
      throw new PreConditionError("Cette demande n'est pas en attente d'un manager.");
    }

    const rejectedRequest = await prisma.shiftSwapRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    return rejectedRequest;
  });