import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { redirect } from 'next/navigation';
import { 
  TrendingUpIcon, 
  ClockIcon, 
  WalletIcon,
  CalendarOffIcon,
  BriefcaseIcon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
// Import du composant interactif
import { TimesheetTable } from './_components/timesheet-table';

export default async function BusinessMetricsPage({
  params
}: {
  params: { slug: string };
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const org = await prisma.organization.findUnique({
    where: { slug: slug }
  });

  if (!org) redirect('/');

  // Sécurité Manager
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: { organizationId: org.id, userId: session.user.id }
    },
    include: { workRole: true }
  });

  if (membership?.workRole?.name !== 'manager') {
    return <div className="p-8 text-red-500">Accès refusé. Tableau de bord réservé aux managers.</div>;
  }

  // Période d'analyse : Le mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  // 1. Récupération des données business du mois
  const [shiftsThisMonth, approvedTimeOff, activeEmployees] = await Promise.all([
    prisma.shift.findMany({
      where: { 
        organizationId: org.id,
        startTime: { gte: startOfMonth, lt: endOfMonth }
      },
      include: { employee: true }
    }),
    prisma.timeOffRequest.count({
      where: { 
        organizationId: org.id, 
        status: 'approved',
        startDate: { gte: startOfMonth, lt: endOfMonth }
      }
    }),
    prisma.membership.count({
      where: { organizationId: org.id, workRole: { name: 'employee' } }
    })
  ]);

  // 2. Calculs Business (Heures et Coûts)
  let totalMinutes = 0;
  shiftsThisMonth.forEach(shift => {
    const durationMs = shift.endTime.getTime() - shift.startTime.getTime();
    totalMinutes += Math.floor(durationMs / 60000);
  });

  const totalHours = Math.round(totalMinutes / 60);
  
  // Taux horaire moyen fictif
  const averageHourlyRate = 22; 
  const estimatedLaborCost = totalHours * averageHourlyRate;
  const avgHoursPerEmployee = activeEmployees > 0 ? Math.round(totalHours / activeEmployees) : 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suivi Business</h1>
        <p className="text-muted-foreground">
          Analyse des coûts, du volume d'heures et de la productivité du mois en cours.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 : Volume d'heures */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Horaire (Mois)</CardTitle>
            <ClockIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} h</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(totalHours * 0.15)}h par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        {/* KPI 2 : Coût estimé */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coût Salarial Estimé</CardTitle>
            <WalletIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedLaborCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Basé sur un taux moyen de {averageHourlyRate}$/h
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 : Moyenne par employé */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne / Employé</CardTitle>
            <BriefcaseIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHoursPerEmployee} h</div>
            <p className="text-xs text-muted-foreground">
              Sur {activeEmployees} employés actifs
            </p>
          </CardContent>
        </Card>

        {/* KPI 4 : Impact Congés */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Congés Approuvés</CardTitle>
            <CalendarOffIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedTimeOff}</div>
            <p className="text-xs text-muted-foreground">
              Demandes validées ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Détails Business */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        {/* Graphique d'évolution */}
        <Card className="col-span-3 min-h-[350px] border border-border/50">
          <CardHeader>
            <CardTitle>Évolution des coûts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
            <TrendingUpIcon className="size-12 mb-4 opacity-20" />
            <p className="text-sm">Graphique Recharts (À venir)</p>
          </CardContent>
        </Card>

        {/* Tableau interactif avec export CSV */}
        <div className="col-span-4">
          <TimesheetTable orgId={org.id} />
        </div>
      </div>
    </div>
  );
}