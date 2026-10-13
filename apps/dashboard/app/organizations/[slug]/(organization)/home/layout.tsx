import * as React from 'react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import { buttonVariants } from '@workspace/ui/components/button';
import {
  Page,
  PageActions,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from '@workspace/ui/components/page';

import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';
import { createTitle } from '~/lib/formatters';
import { ClockButton } from '../../_components/clock-button';
import { TimeOffForm } from '../../_components/time-off-form';
import { getEmployeeTimeOffRequests } from '../../../../../data/time-off/get-employee-time-off';
import { TimeOffList } from '../../../../../app/organizations/[slug]/_components/time-off-list';

// Imports de nos actions et métriques
import { getManagerPendingRequests } from '~/data/shift-swap/get-manager-pending-requests';
import { getReceivedSwapRequests } from '~/data/shift-swap/get-employee-swap-requests';
import { getEmployeeMetrics } from '~/data/dashboard/get-employee-metrics';
import { getManagerMetrics } from '~/data/dashboard/get-manager-metrics';


export const metadata: Metadata = {
  title: createTitle('Tableau de bord')
};

export default async function HomeLayout(props: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true }
  });

  if (!organization) {
    notFound();
  }

  const userId = session.user.id;
  const orgId = organization.id;

  const role = await getCurrentWorkRole(orgId, userId);
  const isManager = role?.name === 'manager';

  const timeOffRequests = await getEmployeeTimeOffRequests(organization.id, session.user.id);

  // Préparation des données (Data Layer)
  let pendingManagerRequests = [];
  let managerMetrics = null;
  
  let pendingEmployeeRequests = [];
  let employeeMetrics = null;

  if (isManager) {
    pendingManagerRequests = await getManagerPendingRequests(orgId);
    managerMetrics = await getManagerMetrics(orgId);
  } else if (role?.name === 'employee') {
    const allReceived = await getReceivedSwapRequests(orgId, userId);
    pendingEmployeeRequests = allReceived.filter((req: any) => req.status === 'PENDING_EMPLOYEE');
    employeeMetrics = await getEmployeeMetrics(orgId, userId);
  }

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Tableau de bord"
              info={isManager ? "Vue d'ensemble de votre équipe" : "Aperçu de votre planning personnel"}
            />
            <PageActions>
              <Link
                href="swaps"
                className={buttonVariants({ variant: 'default' })}
              >
                Gérer les échanges de shifts
              </Link>
            </PageActions>
          </PagePrimaryBar>
        </PageHeader>
        
        <PageBody>
          <div className="mx-auto max-w-6xl space-y-8 p-6">
            
            {/* =========================================
                VUE MANAGER (La Tour de Contrôle)
            ========================================= */}
            {isManager && managerMetrics && (
              <div className="space-y-6">
                
                {/* Ligne 1 : Indicateurs Clés (KPI) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* KPI 1 : Action Center */}
                  <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold tracking-tight text-lg">Approbations requises</h3>
                    {pendingManagerRequests.length > 0 ? (
                      <>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {pendingManagerRequests.length}
                        </p>
                        <p className="text-sm text-muted-foreground">demande(s) d'échange en attente</p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">Toutes les demandes ont été traitées.</p>
                    )}
                  </div>

                  {/* KPI 2 : Heures semaine équipe */}
                  <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold tracking-tight text-lg">Volume d'équipe (Semaine)</h3>
                    <p className="text-3xl font-bold">{managerMetrics.totalTeamHours} <span className="text-xl font-medium text-muted-foreground">h</span></p>
                    <p className="text-sm text-muted-foreground">
                      Réparties sur {managerMetrics.totalWeeklyShifts} shifts prévus
                    </p>
                  </div>
                  
                  {/* KPI 3 : Présences du jour */}
                  <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold tracking-tight text-lg">Effectif du jour</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                      {managerMetrics.todayRoster.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      employé(s) planifié(s) aujourd'hui
                    </p>
                  </div>
                </div>

                {/* Ligne 2 : Roster Détaillé (Le planning du jour) */}
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg mb-4">Planning du jour</h3>
                  {managerMetrics.todayRoster.length > 0 ? (
                    <div className="divide-y">
                      {managerMetrics.todayRoster.map((shift: any) => (
                        <div key={shift.id} className="py-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{shift.employee.name}</p>
                            <p className="text-sm text-muted-foreground">{shift.employee.email}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm font-medium ring-1 ring-inset ring-secondary/50">
                              {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Personne n'est planifié aujourd'hui.</p>
                  )}
                </div>
              </div>
            )}


            {/* =========================================
                VUE EMPLOYÉ (L'Assistant Personnel)
            ========================================= */}
            {!isManager && employeeMetrics && (
              <div className="space-y-6">
                
                {/* Ligne 1 : Prochain shift en HIGHLIGHT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Prochain Shift (Hero Card) */}
                  <div className="flex flex-col justify-center p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-card-foreground shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <h3 className="font-semibold tracking-tight text-lg text-primary mb-3">Mon prochain shift</h3>
                    {employeeMetrics.nextShift ? (
                      <div>
                        <p className="text-3xl font-bold mb-2 capitalize">
                          {new Date(employeeMetrics.nextShift.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xl font-medium text-muted-foreground">
                          {new Date(employeeMetrics.nextShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          {" - "} 
                          {new Date(employeeMetrics.nextShift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <ClockButton 
                          orgId={orgId} 
                          nextShift={employeeMetrics.nextShift} 
                          activeTimeEntry={employeeMetrics.activeTimeEntry} 
                        />
                
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Vous n'avez aucun shift à venir. Profitez du repos !</p>
                    )}
                  </div>
                    
                  <div className="grid grid-rows-2 gap-6">
                    {/* Demandes reçues */}
                    <div className="flex flex-col justify-center p-6 rounded-xl border bg-card shadow-sm">
                      <h3 className="font-semibold tracking-tight text-sm text-muted-foreground mb-1">Demandes d'échange reçues</h3>
                      {pendingEmployeeRequests.length > 0 ? (
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                          {pendingEmployeeRequests.length} nouvelle(s) demande(s)
                        </p>
                      ) : (
                        <p className="text-lg font-medium">Aucune demande en attente</p>
                      )}
                    </div>
                    
                    {/* Volume horaire semaine */}
                    <div className="flex flex-col justify-center p-6 rounded-xl border bg-card shadow-sm">
                      <h3 className="font-semibold tracking-tight text-sm text-muted-foreground mb-1">Ma semaine (heures)</h3>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{employeeMetrics.weeklyHours} <span className="text-lg font-medium text-muted-foreground">h</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Réparties sur {employeeMetrics.weeklyShifts.length} shifts</p>
                    </div>
                  </div>
                </div>
                <TimeOffForm orgId={organization.id} />
                <TimeOffList requests={timeOffRequests} />
                {/* Ligne 2 : Planning de la semaine (Grille) */}
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg mb-4">Mes shifts de la semaine</h3>
                  {employeeMetrics.weeklyShifts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {employeeMetrics.weeklyShifts.map((shift: any) => (
                        <div key={shift.id} className="p-4 border rounded-lg bg-background flex flex-col justify-center items-center text-center shadow-sm">
                          <p className="font-medium capitalize text-sm mb-1">
                            {new Date(shift.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                            <br/>
                            <span className="text-muted-foreground font-normal">à</span>
                            <br/>
                            {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun shift prévu cette semaine.</p>
                  )}
                </div>

              </div>
            )}

          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}