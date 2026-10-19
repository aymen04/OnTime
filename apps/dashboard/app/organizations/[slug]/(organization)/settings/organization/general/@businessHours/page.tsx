import * as React from 'react';
import { prisma } from '@workspace/database/client';

import { BusinessHoursCard } from '~/components/organizations/slug/settings/organization/general/business-hours-card';
import { getBusinessHours } from '~/data/organization/get-business-hours';

export default async function BusinessHoursPage(props: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const params = await props.params;
  
  // 1. On utilise ta fonction existante pour récupérer les données
  let businessHours = await getBusinessHours();

  // 2. 🔥 L'AUTO-GUÉRISON : Si le tableau est vide (organisation orpheline)
  if (!businessHours || businessHours.length === 0) {
    const org = await prisma.organization.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    });

    if (org) {
      const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
      
      // On crée les 7 jours fermés par défaut
      await prisma.workHours.createMany({
        data: DAYS.map(day => ({
          organizationId: org.id,
          dayOfWeek: day
        }))
      });

      // On relance ta fonction proprement pour recharger les données toutes neuves !
      businessHours = await getBusinessHours();
    }
  }

  // 3. On affiche ta carte normalement
  return <BusinessHoursCard businessHours={businessHours} />;
}