import { prisma } from '@workspace/database/client';

export async function getEmployeeTimeOffRequests(orgId: string, employeeId: string) {
  return await prisma.timeOffRequest.findMany({
    where: {
      organizationId: orgId,
      employeeId: employeeId,
    },
    orderBy: { createdAt: 'desc' }, // Les plus récentes en premier
  });
}