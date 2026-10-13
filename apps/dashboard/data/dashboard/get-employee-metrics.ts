import { prisma } from '@workspace/database/client';

export async function getEmployeeMetrics(orgId: string, userId: string) {
  const now = new Date();
  
  // Date de début et fin de semaine (Lundi à Dimanche)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 1. Le tout prochain shift (à partir de maintenant)
  const nextShift = await prisma.shift.findFirst({
    where: {
      organizationId: orgId,
      employeeId: userId,
      startTime: { gte: now },
    },
    orderBy: { startTime: 'asc' },
  });

  // 2. Les shifts de la semaine en cours
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      employeeId: userId,
      startTime: { gte: startOfWeek, lte: endOfWeek },
    },
    orderBy: { startTime: 'asc' },
  });

  // 3. Calcul du volume horaire de la semaine
  const weeklyHours = weeklyShifts.reduce((total, shift) => {
    const durationMs = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    return total + (durationMs / (1000 * 60 * 60));
  }, 0);

  return {
    nextShift,
    weeklyShifts,
    weeklyHours: Math.round(weeklyHours * 10) / 10,
  };
}