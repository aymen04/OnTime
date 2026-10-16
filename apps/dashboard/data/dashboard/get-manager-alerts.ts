import { prisma } from '@workspace/database/client';

export async function getManagerAlerts(orgId: string) {
  // 1. Compter les demandes de congés en attente
  const pendingTimeOffs = await prisma.timeOffRequest.count({
    where: {
      organizationId: orgId,
      status: 'pending'
    }
  });

  // 2. Compter les anomalies de pointage (shifts non clôturés de la VEILLE ou avant)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Minuit aujourd'hui

  const missingClockOuts = await prisma.timeEntry.count({
    where: {
      organizationId: orgId,
      clockOutTime: null,
      clockInTime: {
        lt: today // Tout pointage ouvert qui date d'avant aujourd'hui est une anomalie
      }
    }
  });

  return {
    pendingTimeOffs,
    missingClockOuts
  };
}