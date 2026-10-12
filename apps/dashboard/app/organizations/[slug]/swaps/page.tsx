import * as React from 'react';
import { type Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import { getExchangeableShifts } from '~/data/shift-swap/get-exchangeable-shifts';
import { getEligibleCoworkers } from '~/data/shift-swap/get-eligible-coworkers';
import { getSentSwapRequests, getReceivedSwapRequests } from '~/data/shift-swap/get-employee-swap-requests';
import { getManagerPendingRequests } from '~/data/shift-swap/get-manager-pending-requests';

import { EmployeeSwapView } from './_components/employee-swap-view';
import { ManagerSwapView } from './_components/manager-swap-view';

export const metadata: Metadata = {
  title: 'Échanges de Shifts',
};

export default async function SwapsPage(props: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Vérification de l'organisation
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true }
  });

  if (!organization) {
    notFound();
  }

  const userId = session.user.id;
  const orgId = organization.id;

  // Récupération du rôle
  const role = await getCurrentWorkRole(orgId, userId);

  if (!role) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <p className="text-destructive font-medium">
          Vous n'avez pas de rôle défini dans cette organisation. Accès refusé.
        </p>
      </div>
    );
  }

  // Rendu Manager
  if (role.name === 'manager') {
    const pendingRequests = await getManagerPendingRequests(orgId);
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Gestion des Échanges (Manager)</h1>
        <ManagerSwapView requests={pendingRequests} />
      </div>
    );
  }

  // Rendu Employé
  if (role.name === 'employee') {
    const [futureShifts, coworkers, sentRequests, receivedRequests] = await Promise.all([
      getExchangeableShifts(orgId, userId),
      getEligibleCoworkers(orgId, userId),
      getSentSwapRequests(orgId, userId),
      getReceivedSwapRequests(orgId, userId)
    ]);

    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Mes Échanges de Shifts</h1>
        <EmployeeSwapView 
          futureShifts={futureShifts} 
          coworkers={coworkers} 
          sentRequests={sentRequests} 
          receivedRequests={receivedRequests} 
        />
      </div>
    );
  }

  return <></>;
}