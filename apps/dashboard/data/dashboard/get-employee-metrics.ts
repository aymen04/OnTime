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

  // 1. On récupère les IDs des shifts qui ont DÉJÀ été pointés par l'employé
  const existingEntries = await prisma.timeEntry.findMany({
    where: { employeeId: userId }, // userId est bien reçu en paramètre de la fonction
    select: { shiftId: true }
  });
  
  // On crée un tableau propre avec uniquement les IDs
  const pointedShiftIds = existingEntries
    .map(entry => entry.shiftId)
    .filter(Boolean) as string[];

  // 2. Le tout prochain shift (dont l'ID n'est PAS dans la liste de ceux déjà pointés)
  const nextShift = await prisma.shift.findFirst({
    where: {
      organizationId: orgId,
      employeeId: userId,
      endTime: { gte: now }, // Le shift n'est pas encore fini
      id: { notIn: pointedShiftIds } // Exclut les shifts déjà pointés
    },
    orderBy: { startTime: 'asc' },
  });

  // 3. Les shifts de la semaine en cours
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      employeeId: userId,
      startTime: { gte: startOfWeek, lte: endOfWeek },
    },
    orderBy: { startTime: 'asc' },
  });

  // 4. Calcul du volume horaire de la semaine
  const weeklyHours = weeklyShifts.reduce((total, shift) => {
    const durationMs = new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime();
    return total + (durationMs / (1000 * 60 * 60));
  }, 0);

  // 5. Vérifier s'il y a un pointage en cours
  const activeTimeEntry = await prisma.timeEntry.findFirst({
    where: {
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