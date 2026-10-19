import * as React from 'react';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { notFound, redirect } from 'next/navigation';

import { Page, PageBody, PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { AvailabilityForm } from './_components/availability-form';

export default async function AvailabilitiesPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
  });

  if (!org) notFound();

  // On récupère les disponibilités de cet employé précis
  const savedAvailabilities = await prisma.availability.findMany({
    where: {
      organizationId: org.id,
      userId: session.user.id,
    }
  });

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle title="Mes disponibilités" info="Indiquez vos horaires habituels de travail" />
        </PagePrimaryBar>
      </PageHeader>
      
      <PageBody>
        <div className="mx-auto max-w-3xl p-6">
          {/* On passe les données au formulaire interactif */}
          <AvailabilityForm slug={params.slug} initialData={savedAvailabilities} />
        </div>
      </PageBody>
    </Page>
  );
}