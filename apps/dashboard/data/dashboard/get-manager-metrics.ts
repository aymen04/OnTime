import { prisma } from '@workspace/database/client';

export async function getManagerMetrics(orgId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Shifts du jour (Prévus)
  const todayShifts = await prisma.shift.findMany({
    where: { organizationId: orgId, startTime: { gte: today, lt: tomorrow } },
    include: { employee: { select: { id: true, name: true, email: true } } },
    orderBy: { startTime: 'asc' }
  });

  // 2. Présences du jour
  const todayAttendances = await prisma.timeEntry.findMany({
    where: { organizationId: orgId, clockInTime: { gte: today, lt: tomorrow } }
  });

  // Calcul du Live Status
  const prevus = todayShifts.length;
  const enPoste = todayAttendances.filter(a => !a.clockOutTime).length;
  
  // En retard : Shifts qui ont déjà commencé, mais l'employé n'a pas de TimeEntry
  const now = new Date();
  let enRetard = 0;
  todayShifts.forEach(shift => {
    if (new Date(shift.startTime) < now) {
      const hasClockedIn = todayAttendances.some(a => a.employeeId === shift.employeeId);
      if (!hasClockedIn) enRetard++;
    }
  });

  // Calcul basique pour la semaine
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weeklyShifts = await prisma.shift.findMany({
    where: { organizationId: orgId, startTime: { gte: startOfWeek, lte: endOfWeek } }
  });

  let totalTeamHours = 0;
  weeklyShifts.forEach(s => {
    // Correction du calcul en heures
    totalTeamHours += (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
  });

  return {
    todayRoster: todayShifts,
    liveStatus: { prevus, enPoste, enRetard },
    totalTeamHours: Math.round(totalTeamHours),
    totalWeeklyShifts: weeklyShifts.length
  };
}