import { prisma } from '@workspace/database/client';

export async function getManagerMetrics(orgId: string) {
  const now = new Date();
  
  // Aujourd'hui (Minuit à 23h59)
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Semaine en cours
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 1. Le Roster du jour (Qui travaille aujourd'hui, avec leurs infos)
  const todayRoster = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      startTime: { gte: startOfToday, lte: endOfToday },
    },
    include: {
      employee: { select: { id: true, name: true, email: true } }
    },
    orderBy: { startTime: 'asc' },
  });

  // 2. Les shifts de toute l'équipe pour la semaine
  const teamWeeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      startTime: { gte: startOfWeek, lte: endOfWeek },
    },
    select: { startTime: true, endTime: true }
  });

  // 3. Calcul de la couverture globale (total des heures planifiées de l'équipe)
  const totalTeamHours = teamWeeklyShifts.reduce((total, shift) => {
    const durationMs = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    return total + (durationMs / (1000 * 60 * 60));
  }, 0);

  return {
    todayRoster,
    totalTeamHours: Math.round(totalTeamHours * 10) / 10,
    totalWeeklyShifts: teamWeeklyShifts.length,
  };
}