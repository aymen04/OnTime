import * as React from 'react';
import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import {
  Page,
  PageBody,
  PageHeader,
  PagePrimaryBar,
} from '@workspace/ui/components/page';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { TransitionProvider } from '~/hooks/use-transition-context';

import { CreateShiftForm } from './_components/create-shift-form';

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

  // Vérification de sécurité : Seul le manager accède à cette page
  const role = await getCurrentWorkRole(organization.id, session.user.id);
  if (role?.name !== 'manager') {
    redirect(`/organizations/${params.slug}`); // On renvoie l'employé sur le dashboard
  }

  // 1. Récupérer tous les employés de l'organisation pour le formulaire
  // (Adapté selon la structure classique de ton projet, on cherche les rôles 'employee')
  const employees = await prisma.user.findMany({
    where: {
      memberships: {
        some: {
          organizationId: organization.id,
          workRole: {
            name: 'employee' // C'est ici qu'on vérifie le nom du rôle !
          }
        }
      }
    },
    select: { id: true, name: true, email: true }
  });

  // 2. Récupérer les 10 prochains shifts prévus pour avoir un aperçu immédiat
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

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Planificateur"
              info="Gérez les emplois du temps de votre équipe"
            />
          </PagePrimaryBar>
        </PageHeader>
        
        <PageBody>
          <div className="mx-auto max-w-5xl space-y-8 p-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Colonne de gauche : Le Formulaire (prend 1 tiers) */}
              <div className="lg:col-span-1">
                <CreateShiftForm orgId={organization.id} employees={employees} />
              </div>

              {/* Colonne de droite : Liste des prochains shifts (prend 2 tiers) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-lg tracking-tight">Prochains shifts planifiés</h3>
                
                {upcomingShifts.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/10">
                    Aucun shift planifié à venir. Utilisez le formulaire pour commencer.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcomingShifts.map(shift => (
                      <div key={shift.id} className="flex justify-between items-center p-4 border rounded-lg bg-card shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {shift.employee.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{shift.employee.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {new Date(shift.startTime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium">
                            {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}