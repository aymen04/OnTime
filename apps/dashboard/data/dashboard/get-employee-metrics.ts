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

  // 1. Shifts déjà pointés
  const existingEntries = await prisma.timeEntry.findMany({
    where: { employeeId: userId },
    select: { shiftId: true }
  });
  
  const pointedShiftIds = existingEntries
    .map(entry => entry.shiftId)
    .filter(Boolean) as string[];

  // 2. Le tout prochain shift
  const nextShift = await prisma.shift.findFirst({
    where: {
      organizationId: orgId,
      employeeId: userId,
      endTime: { gte: now },
      id: { notIn: pointedShiftIds }
    },
    orderBy: { startTime: 'asc' },
  });

  // 3. Les prochains shifts (pour le slider "Prochains jours")
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      employeeId: userId,
      startTime: { gt: now },
      // On exclut le prochain shift pour ne pas l'afficher en double !
      ...(nextShift ? { id: { not: nextShift.id } } : {})
    },
    orderBy: { startTime: 'asc' },
    take: 10,
  });

  // 4. Calcul VRAI du volume horaire de toute la semaine (Lundi->Dimanche)
  const allShiftsThisWeek = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      employeeId: userId,
      startTime: { gte: startOfWeek, lte: endOfWeek },
    }
  });

  const weeklyHours = allShiftsThisWeek.reduce((total, shift) => {
    const durationMs = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    return total + (durationMs / (1000 * 60 * 60));
  }, 0);

  // 5. Pointage en cours
  const activeTimeEntry = await prisma.timeEntry.findFirst({
    where: {
      organizationId: orgId,
      employeeId: userId,
      clockOutTime: null,
    }
  });

  return {
    nextShift,
    weeklyShifts,
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    activeTimeEntry,
  };
}