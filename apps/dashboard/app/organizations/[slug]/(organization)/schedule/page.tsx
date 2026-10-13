import * as React from 'react';
import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CalendarIcon, ClockIcon, CalendarOffIcon, CheckIcon, XIcon } from 'lucide-react';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import { Page, PageBody, PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';

import { CreateShiftForm } from './_components/create-shift-form';
import { getDailyAttendances } from '~/data/schedule/get-daily-attendances';
import { updateTimeOffStatus } from '../../../../../actions/time-off/time-off-actions';

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
  if (role?.name !== 'manager') redirect(`/organizations/${params.slug}`);

  // 1. Employés
  const employees = await prisma.user.findMany({
    where: { memberships: { some: { organizationId: organization.id, workRole: { name: 'employee' } } } },
    select: { id: true, name: true, email: true }
  });

  // 2. Prochains Shifts
  const upcomingShifts = await prisma.shift.findMany({
    where: { organizationId: organization.id, startTime: { gte: new Date() } },
    include: { employee: { select: { name: true } } },
    orderBy: { startTime: 'asc' },
    take: 10,
  });

  // 3. Présences
  const attendances = await getDailyAttendances(organization.id);

  // 4. Congés (Nouveau)
  const timeOffRequests = await prisma.timeOffRequest.findMany({
    where: { organizationId: organization.id },
    include: { employee: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle title="Gestion du Temps" info="Gérez les plannings, présences et congés." />
          </PagePrimaryBar>
        </PageHeader>
        
        <PageBody>
          <div className="mx-auto max-w-5xl p-6">
            
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8">
                <TabsTrigger value="planning" className="flex items-center gap-2">
                  <CalendarIcon className="size-4" /> Planning
                </TabsTrigger>
                <TabsTrigger value="attendances" className="flex items-center gap-2">
                  <ClockIcon className="size-4" /> Présences
                </TabsTrigger>
                <TabsTrigger value="timeoff" className="flex items-center gap-2">
                  <CalendarOffIcon className="size-4" /> Congés
                </TabsTrigger>
              </TabsList>

              {/* ONGLET 1 : PLANNING */}
              <TabsContent value="planning" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <CreateShiftForm orgId={organization.id} employees={employees} />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg tracking-tight">Prochains shifts</h3>
                    {upcomingShifts.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">Aucun shift planifié.</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {upcomingShifts.map(shift => (
                          <div key={shift.id} className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm">
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

              {/* ONGLET 2 : PRÉSENCES (Code réduit pour la lisibilité, mais identique visuellement) */}
              <TabsContent value="attendances" className="mt-0">
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6">
                  <h2 className="text-lg font-semibold tracking-tight mb-4">Pointages d'aujourd'hui</h2>
                  {attendances.length === 0 ? <p className="text-muted-foreground text-sm">Aucun pointage.</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                         {/* (Ton tableau de présences est resté intact) */}
                         <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Employé</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Arrivée</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendances.map((entry) => (
                            <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium">{entry.employee.name}</td>
                              <td className="px-6 py-4 font-medium">{new Date(entry.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                              <td className="px-6 py-4">
                                {!entry.clockOutTime ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600">En poste</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs text-muted-foreground bg-muted/50">Terminé</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ONGLET 3 : CONGÉS (Le tout nouveau !) */}
              <TabsContent value="timeoff" className="mt-0">
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold tracking-tight">Demandes de congés</h2>
                    <p className="text-sm text-muted-foreground">Approuvez ou refusez les demandes de votre équipe.</p>
                  </div>
                  
                  {timeOffRequests.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">Aucune demande de congé.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Employé</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Dates</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Motif</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground">Statut</th>
                            <th className="h-10 px-6 font-medium text-muted-foreground text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeOffRequests.map((req) => (
                            <tr key={req.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium">{req.employee.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">
                                {new Date(req.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {new Date(req.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{req.reason || '-'}</td>
                              <td className="px-6 py-4">
                                {req.status === 'pending' && <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-600">En attente</span>}
                                {req.status === 'approved' && <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-600">Approuvé</span>}
                                {req.status === 'rejected' && <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-600">Refusé</span>}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {req.status === 'pending' && (
                                  <div className="flex justify-end gap-2">
                                    <form action={async () => { 'use server'; await updateTimeOffStatus(organization.id, req.id, 'approved'); }}>
                                      <Button size="sm" variant="outline" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"><CheckIcon className="size-4" /></Button>
                                    </form>
                                    <form action={async () => { 'use server'; await updateTimeOffStatus(organization.id, req.id, 'rejected'); }}>
                                      <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"><XIcon className="size-4" /></Button>
                                    </form>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
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