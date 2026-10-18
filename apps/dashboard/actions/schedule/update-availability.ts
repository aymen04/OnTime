'use server';

import { z } from 'zod';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

// Le schéma attend un tableau d'objets contenant le jour et les minutes
const availabilitySchema = z.array(z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startMinutes: z.number().min(0).max(1440),
  endMinutes: z.number().min(0).max(1440),
})).refine(data => data.every(item => item.startMinutes < item.endMinutes), {
  message: "L'heure de fin doit être après l'heure de début",
});

export async function updateAvailabilities(orgId: string, rawData: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");
    const userId = session.user.id;

    // Validation des données
    const validatedData = availabilitySchema.parse(rawData);

    // Transaction Prisma : On supprime les anciennes et on insère les nouvelles d'un coup
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: { organizationId: orgId, userId: userId }
      }),
      prisma.availability.createMany({
        data: validatedData.map(avail => ({
          organizationId: orgId,
          userId: userId,
          dayOfWeek: avail.dayOfWeek,
          startMinutes: avail.startMinutes,
          endMinutes: avail.endMinutes,
        }))
      })
    ]);

    // Purge du cache
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { slug: true }
    });

    if (org) {
      revalidatePath(`/organizations/${org.slug}/availabilities`);
    }

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error.message || "Erreur lors de la mise à jour" };
  }
}