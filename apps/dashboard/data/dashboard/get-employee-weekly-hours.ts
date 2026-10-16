import { prisma } from '@workspace/database/client';

export async function getEmployeeWeeklyHours(orgId: string, employeeId: string) {
  // Définir le début (Lundi) et la fin (Dimanche) de la semaine en cours
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 1. Calculer les heures prévues (Shifts)
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      employeeId: employeeId,
      startTime: { gte: startOfWeek, lte: endOfWeek }
    }
  });

  let plannedMinutes = 0;
  weeklyShifts.forEach(shift => {
    const diff = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    plannedMinutes += diff / (1000 * 60);
  });

  // 2. Calculer les heures réellement travaillées (TimeEntries)
  const weeklyEntries = await prisma.timeEntry.findMany({
    where: {
      organizationId: orgId,
      employeeId: employeeId,
      clockInTime: { gte: startOfWeek, lte: endOfWeek }
    }
  });

  let workedMinutes = 0;
  weeklyEntries.forEach(entry => {
    // Si l'employé est en poste (pas de clockOut), on calcule jusqu'à l'heure actuelle
    const end = entry.clockOutTime ? new Date(entry.clockOutTime) : new Date();
    const diff = end.getTime() - new Date(entry.clockInTime).getTime();
    workedMinutes += diff / (1000 * 60);
  });

  return {
    plannedHours: Math.round(plannedMinutes / 60 * 10) / 10,
    workedHours: Math.round(workedMinutes / 60 * 10) / 10,
  };
}