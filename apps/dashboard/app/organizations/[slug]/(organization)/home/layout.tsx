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
import { ManagerAlertsWidget } from '../../_components/manager-alerts-widget';
import { EmployeeWeeklyProgress } from '../../_components/employee-weekly-progress';
import { CalendarPlusIcon, CalendarIcon } from 'lucide-react';
// Vérifie que le nom de ce fichier correspond bien au nom de ton composant
import { EmployeeNotificationBanner } from '../../_components/employee-notification-banner';
import { EmployeeUpcomingShifts } from '../../_components/employee-upcoming-shifts';

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
                
                {/* 1. WIDGET : Actions Requises */}
                <ManagerAlertsWidget orgId={organization.id} slug={params.slug} />

                {/* 2. QUICK ACTIONS (Raccourcis visuels) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <Link href={`/organizations/${params.slug}/schedule`} className={buttonVariants({ variant: 'default', size: 'lg' })}>
                    <CalendarPlusIcon className="mr-2 size-5" /> Créer un nouveau shift
                  </Link>
                  <Link href={`/organizations/${params.slug}/schedule`} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    <CalendarIcon className="mr-2 size-5" /> Voir le planning de la semaine
                  </Link>
                </div>

                {/* 3. WIDGET : L'Équipe Aujourd'hui (Live Status) */}
                <div className="p-6 rounded-xl border bg-card shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg mb-4 text-primary">L'Équipe Aujourd'hui</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x">
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className="text-4xl font-bold text-foreground">{managerMetrics.liveStatus.prevus}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Prévus aujourd'hui</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">{managerMetrics.liveStatus.enPoste}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="size-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-500">En poste actuellement</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className={`text-4xl font-bold ${managerMetrics.liveStatus.enRetard > 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                        {managerMetrics.liveStatus.enRetard}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">En retard / Absents</p>
                    </div>
                  </div>
                </div>

                {/* 4. Roster Détaillé (Le planning du jour) */}
                <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg mb-4">Planning du jour détaillé</h3>
                  {managerMetrics.todayRoster.length > 0 ? (
                    <div className="divide-y">
                      {managerMetrics.todayRoster.map((shift: any) => (
                        <div key={shift.id} className="py-4 flex justify-between items-center hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-lg">
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
                
                {/* 1. NOTIFICATIONS ÉPHÉMÈRES */}
                <EmployeeNotificationBanner requests={timeOffRequests} />

                {/* LIGNE 1 : Actions immédiates et Objectifs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Prochain Shift + Bouton de pointage (Hero Card) */}
                  <div className="flex flex-col justify-center p-8 rounded-xl border-2 border-primary/20 bg-primary/5 text-card-foreground shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    
                    {employeeMetrics.activeTimeEntry ? (
                      <div>
                        <h3 className="font-semibold tracking-tight text-lg text-red-500 mb-3">Action Requise</h3>
                        <p className="text-xl font-bold mb-2">Shift en cours non clôturé</p>
                        <p className="text-muted-foreground mb-6">
                          Vous avez un pointage actif. Veuillez pointer votre départ pour enregistrer vos heures.
                        </p>
                        <ClockButton 
                          orgId={orgId} 
                          nextShift={employeeMetrics.nextShift} 
                          activeTimeEntry={employeeMetrics.activeTimeEntry} 
                        />
                      </div>
                    ) : employeeMetrics.nextShift ? (
                      <div>
                        <h3 className="font-semibold tracking-tight text-lg text-primary mb-3">Mon prochain shift</h3>
                        <p className="text-3xl font-bold mb-2 capitalize">
                          {new Date(employeeMetrics.nextShift.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-xl font-medium text-muted-foreground mb-6">
                          {new Date(employeeMetrics.nextShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          {' - '} 
                          {new Date(employeeMetrics.nextShift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <ClockButton 
                          orgId={orgId} 
                          nextShift={employeeMetrics.nextShift} 
                          activeTimeEntry={null} 
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold tracking-tight text-lg text-primary mb-3">Mon prochain shift</h3>
                        <p className="text-muted-foreground">Vous n'avez aucun shift à venir. Profitez du repos !</p>
                      </div>
                    )}
                  </div>

                  {/* Objectif de la semaine */}
                  <EmployeeWeeklyProgress employeeId={session.user.id} orgId={organization.id} />

                </div>

                {/* LIGNE 2 : Suivi & Historique (Grille équilibrée) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Colonne Gauche (1/3) : Prochains Jours & Demandes */}
                  <div className="space-y-6 md:col-span-1">
                    <EmployeeUpcomingShifts 
                      weeklyShifts={employeeMetrics.weeklyShifts} 
                    />

                    {/* Demandes reçues */}
                    <div className="p-6 rounded-xl border bg-card shadow-sm">
                      <h3 className="font-semibold tracking-tight text-sm text-muted-foreground mb-3">Échanges de shifts</h3>
                      {pendingEmployeeRequests.length > 0 ? (
                        <p className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                          {pendingEmployeeRequests.length} demande(s)
                        </p>
                      ) : (
                        <p className="text-sm font-medium">Aucune demande en attente</p>
                      )}
                    </div>
                  </div>

                  {/* Colonne Droite (2/3) : Administratif (Congés) */}
                  <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-full md:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold tracking-tight text-lg">Mes congés</h3>
                      <TimeOffForm orgId={organization.id} />
                    </div>
                    <div className="flex-1">
                      <TimeOffList requests={timeOffRequests} />
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}