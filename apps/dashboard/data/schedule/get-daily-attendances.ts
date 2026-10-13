import { prisma } from '@workspace/database/client';

export async function getDailyAttendances(orgId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // On récupère les pointages qui ont commencé aujourd'hui
  return await prisma.timeEntry.findMany({
    where: {
      organizationId: orgId,
      clockInTime: {
        gte: today,
        lt: tomorrow,
      }
    },
    include: {
      employee: {
        select: { name: true, email: true }
      },
      shift: true, // On ramène le shift pour comparer le Prévu vs Réel
    },
    orderBy: { clockInTime: 'desc' }
  });
}