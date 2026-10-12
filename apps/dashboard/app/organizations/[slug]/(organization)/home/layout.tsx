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

// Fonctions de récupération de données qu'on a créées
import { getManagerPendingRequests } from '~/data/shift-swap/get-manager-pending-requests';
import { getReceivedSwapRequests } from '~/data/shift-swap/get-employee-swap-requests';

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

  // 1. Identifier l'organisation
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true }
  });

  if (!organization) {
    notFound();
  }

  const userId = session.user.id;
  const orgId = organization.id;

  // 2. Identifier le rôle de l'utilisateur
  const role = await getCurrentWorkRole(orgId, userId);
  const isManager = role?.name === 'manager';

  // 3. Récupérer les alertes spécifiques au rôle
  let pendingManagerRequests = [];
  let pendingEmployeeRequests = [];

  if (isManager) {
    pendingManagerRequests = await getManagerPendingRequests(orgId);
  } else if (role?.name === 'employee') {
    const allReceived = await getReceivedSwapRequests(orgId, userId);
    pendingEmployeeRequests = allReceived.filter((req: any) => req.status === 'PENDING_EMPLOYEE');
  }

  return (
    <TransitionProvider>
      <Page>
        <PageHeader>
          <PagePrimaryBar>
            <OrganizationPageTitle
              title="Tableau de bord"
              info="Aperçu de votre planning et de vos activités"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Widget Manager */}
              {isManager && (
                <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg">Approbations requises</h3>
                  {pendingManagerRequests.length > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {pendingManagerRequests.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        demande(s) d'échange en attente
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      Toutes les demandes ont été traitées.
                    </p>
                  )}
                </div>
              )}

              {/* Widget Employé */}
              {!isManager && (
                <div className="flex flex-col gap-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold tracking-tight text-lg">Demandes reçues</h3>
                  {pendingEmployeeRequests.length > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                        {pendingEmployeeRequests.length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        collègue(s) souhaite(nt) vous donner un shift
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      Aucune nouvelle proposition d'échange.
                    </p>
                  )}
                </div>
              )}

              {/* Futur Widget: Prochain Shift */}
              <div className="flex flex-col gap-2 p-6 rounded-xl border border-dashed bg-muted/20 text-card-foreground shadow-sm opacity-60">
                <h3 className="font-semibold tracking-tight text-lg">Prochain shift</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  (Module en cours de développement)
                </p>
              </div>

            </div>

          </div>
        </PageBody>
      </Page>
    </TransitionProvider>
  );
}