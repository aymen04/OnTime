import { prisma } from '@workspace/database/client';

export async function getExchangeableShifts(organizationId: string, employeeId: string) {
  return prisma.shift.findMany({
    where: {
      organizationId,
      employeeId,
      startTime: { gt: new Date() } // Uniquement les shifts dans le futur
    },
    orderBy: { startTime: 'asc' }
  });
}