'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';

export async function getEmployeeHours(orgId: string, startDateStr: string, endDateStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  // On convertit les chaînes en dates et on englobe toute la journée de fin
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const shifts = await prisma.shift.findMany({
    where: {
      organizationId: orgId,
      startTime: { gte: startDate, lte: endDate }
    },
    include: { employee: true }
  });

  // Regroupement des heures par employé
  const userStats = new Map<string, { id: string; name: string; totalHours: number; shiftCount: number }>();

  shifts.forEach(shift => {
    const durationMs = shift.endTime.getTime() - shift.startTime.getTime();
    const hours = durationMs / 3600000; // Conversion ms -> heures

    const empId = shift.employeeId;
    if (!userStats.has(empId)) {
      userStats.set(empId, { id: empId, name: shift.employee.name || 'Inconnu', totalHours: 0, shiftCount: 0 });
    }

    const current = userStats.get(empId)!;
    current.totalHours += hours;
    current.shiftCount += 1;
  });

  // Retourner un tableau trié (celui qui a le plus d'heures en premier)
  return Array.from(userStats.values())
    .map(user => ({
      ...user,
      totalHours: Math.round(user.totalHours * 100) / 100 // Arrondi à 2 décimales
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
}