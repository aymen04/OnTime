import { prisma } from '@workspace/database/client';

export async function getSentSwapRequests(organizationId: string, userId: string) {
  return prisma.shiftSwapRequest.findMany({
    where: { organizationId, requesterId: userId },
    include: {
      shift: true,
      targetEmployee: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getReceivedSwapRequests(organizationId: string, userId: string) {
  return prisma.shiftSwapRequest.findMany({
    where: { organizationId, targetEmployeeId: userId },
    include: {
      shift: true,
      requester: { select: { id: true, name: true, image: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}