import * as React from 'react';
import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CalendarIcon, ClockIcon } from 'lucide-react'; // <-- Les icônes Pro

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from '@workspace/ui/components/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';

import { CreateShiftForm } from './_components/create-shift-form';
import { getDailyAttendances } from '~/data/schedule/get-daily-attendances';

export const metadata: Metadata = {
  title: 'Planificateur',
};

export default async function SchedulePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true }
  });

  if (!organization) notFound();

  const role = await getCurrentWorkRole(organization.id, session.user.id);
  if (role?.name !== 'manager') {
    redirect(`/organizations/${params.slug}`);
  }

  const employees = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          organizationId: organization.id,
          workRole: { name: 'employee' }
        }
      }
    },
    select: { id: true, name: true, email: true }
  });

  const upcomingShifts = await prisma.shift.findMany({
    where: {
      organizationId: organization.id,
      startTime: { gte: new Date() }
    },
    include: {
      employee: { select: { name: true } }
    },
    orderBy: { startTime: 'asc' },
    take: 10,
  });

  const attendances = await getDailyAttendances(organization.id);

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Gestion du Temps"
              info="Gérez les emplois du temps et suivez les présences en temps réel."
            />
          </PagePrimaryBar>
        </PageHeader>
        
        <PageBody>
          <div className="mx-auto max-w-5xl p-6">
            
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  Planning
                </TabsTrigger>
                <TabsTrigger value="attendances" className="flex items-center gap-2">
                  <ClockIcon className="size-4" />
                  Présences du jour
                </TabsTrigger>
              </TabsList>

              {/* ONGLET 1 : LE PLANNING */}
              <TabsContent value="planning" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <CreateShiftForm orgId={organization.id} employees={employees} />
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg tracking-tight">Prochains shifts planifiés</h3>
                    
                    {upcomingShifts.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">
                        Aucun shift planifié à venir. Utilisez le formulaire pour commencer.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {upcomingShifts.map(shift => (
                          <div key={shift.id} className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {shift.employee.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{shift.employee.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {new Date(shift.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center rounded-md border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ONGLET 2 : LES PRÉSENCES */}
              <TabsContent value="attendances" className="mt-0">
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold tracking-tight">Pointages d'aujourd'hui</h2>
                    <p className="text-sm text-muted-foreground">Vue en temps réel de l'activité de l'équipe.</p>
                  </div>
                  
                  {attendances.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm">Aucun pointage enregistré aujourd'hui.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Employé</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Prévu (Shift)</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Arrivée Réelle</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Départ Réel</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendances.map((entry) => {
                            const clockIn = new Date(entry.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            const clockOut = entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
                            const shiftStart = entry.shift ? new Date(entry.shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Non assigné';
                            const shiftEnd = entry.shift ? new Date(entry.shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                            
                            const isWorking = !entry.clockOutTime;

                            return (
                              <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium">{entry.employee.name}</td>
                                <td className="px-6 py-4 text-muted-foreground">{shiftStart} - {shiftEnd}</td>
                                <td className="px-6 py-4 font-medium">{clockIn}</td>
                                <td className="px-6 py-4 text-muted-foreground">{clockOut}</td>
                                <td className="px-6 py-4">
                                  {isWorking ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                      <span className="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                      En poste
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted/50">
                                      Terminé
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}