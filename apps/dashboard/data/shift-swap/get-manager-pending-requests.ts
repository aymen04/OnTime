import { prisma } from '@workspace/database/client';

export async function getManagerPendingRequests(organizationId: string) {
  return prisma.shiftSwapRequest.findMany({
    where: {
      organizationId,
      status: 'PENDING_MANAGER'
    },
    include: {
      shift: true,
      requester: { select: { id: true, name: true, image: true } },
      targetEmployee: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
}