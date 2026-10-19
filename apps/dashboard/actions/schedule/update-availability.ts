'use server';

import { z } from 'zod';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

const availabilitySchema = z.array(z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startMinutes: z.number().min(0).max(1440),
  endMinutes: z.number().min(0).max(1440),
})).refine(data => data.every(item => item.startMinutes < item.endMinutes), {
  message: "L'heure de fin doit être après l'heure de début",
});

export async function updateAvailabilities(slug: string, rawData: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");
    const userId = session.user.id;

    // 1. On récupère l'organisation via le slug
    const org = await prisma.organization.findUnique({
      where: { slug }
    });

    if (!org) throw new Error("Organisation introuvable");

    const validatedData = availabilitySchema.parse(rawData);

    // 2. On utilise le vrai org.id pour la transaction
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: { organizationId: org.id, userId: userId }
      }),
      prisma.availability.createMany({
        data: validatedData.map(avail => ({
          organizationId: org.id,
          userId: userId,
          dayOfWeek: avail.dayOfWeek,
          startMinutes: avail.startMinutes,
          endMinutes: avail.endMinutes,
        }))
      })
    ]);

    revalidatePath(`/organizations/${slug}/availabilities`);

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error.message || "Erreur lors de la mise à jour" };
  }
}