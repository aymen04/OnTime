'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@workspace/database/client';
import { authOrganizationActionClient } from '~/actions/safe-action';
import { Caching, OrganizationCacheKey } from '~/data/caching';
import { updateBusinessHoursSchema } from '~/schemas/organization/update-business-hours-schema';

export const updateBusinessHours = authOrganizationActionClient
  .metadata({ actionName: 'updateBusinessHours' })
  .inputSchema(updateBusinessHoursSchema)
  .action(async ({ parsedInput, ctx }) => {
    
    for (const inputDay of parsedInput.businessHours) {
      
      // 1. Trouver ou créer le jour (WorkHours)
      let workHour = await prisma.workHours.findFirst({
        where: { 
          organizationId: ctx.organization.id, 
          dayOfWeek: inputDay.dayOfWeek 
        }
      });
      
      if (!workHour) {
        workHour = await prisma.workHours.create({
          data: {
            organizationId: ctx.organization.id,
            dayOfWeek: inputDay.dayOfWeek,
          }
        });
      }
      
      // 2. Nettoyer les anciens créneaux horaires de ce jour
      await prisma.workTimeSlot.deleteMany({
        where: { workHoursId: workHour.id }
      });
      
      // 3. Créer les nouveaux créneaux en forçant le format Date pour Prisma
      if (inputDay.timeSlots && inputDay.timeSlots.length > 0) {
        await prisma.workTimeSlot.createMany({
          data: inputDay.timeSlots.map((slot) => ({
            workHoursId: workHour!.id,
            start: new Date(slot.start), // <-- C'est ça qui bloquait l'enregistrement
            end: new Date(slot.end)      // <-- C'est ça qui bloquait l'enregistrement
          }))
        });
      }
    }

    revalidateTag(
      Caching.createOrganizationTag(
        OrganizationCacheKey.BusinessHours,
        ctx.organization.id
      )
    );
  });