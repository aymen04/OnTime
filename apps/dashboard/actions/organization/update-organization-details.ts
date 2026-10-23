'use server';

import { revalidateTag } from 'next/cache';

import { BillingProvider } from '@workspace/billing/provider';
import { prisma } from '@workspace/database/client';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey, UserCacheKey } from '~/data/caching';
import { updateOrganizationDetailsSchema } from '~/schemas/organization/update-organization-details-schema';

// --- FONCTION GRATUITE DE GÉOCODAGE (OpenStreetMap) ---
async function getCoordinates(address: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'OnTime-SaaS-App' // Requis par Nominatim
      }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon) 
      };
    }
  } catch (error) {
    console.error("Erreur de géocodage:", error);
  }
  return null;
}

export const updateOrganizationDetails = authOrganizationActionClient
  .metadata({ actionName: 'updateOrganizationDetails' })
  .inputSchema(updateOrganizationDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    
    // 1. Calcul des coordonnées GPS si une adresse est fournie
    let latitude = null;
    let longitude = null;
    
    if (parsedInput.address) {
      const coords = await getCoordinates(parsedInput.address);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    // 2. Sauvegarde de l'organisation avec ses coordonnées
    await prisma.organization.update({
      where: { id: ctx.organization.id },
      data: {
        name: parsedInput.name,
        address: parsedInput.address,
        phone: parsedInput.phone,
        email: parsedInput.email,
        website: parsedInput.website,
        latitude: latitude,    // <-- AJOUT GPS
        longitude: longitude,  // <-- AJOUT GPS
      },
      select: {
        id: true // SELECT NONE
      }
    });

    if (ctx.organization.name !== parsedInput.name) {
      if (ctx.organization.billingCustomerId) {
        try {
          await BillingProvider.updateCustomerName({
            customerId: ctx.organization.billingCustomerId,
            name: parsedInput.name
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        console.warn('Billing customer ID is missing');
      }
    }

    for (const membership of ctx.organization.memberships) {
      revalidateTag(
        Caching.createUserTag(UserCacheKey.Organizations, membership.userId)
      );
    }

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.OrganizationDetails,
        ctx.organization.id
      )
    );
  });