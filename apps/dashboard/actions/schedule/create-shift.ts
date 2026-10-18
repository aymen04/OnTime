'use server';

import { z } from 'zod';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';
import { revalidatePath } from 'next/cache';
import { fromZonedTime } from 'date-fns-tz'; // NOUVEL IMPORT

// Mise à jour du schéma pour inclure la timezone
const createShiftSchema = z.object({
  employeeId: z.string().min(1, "L'employé est requis"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
  timezone: z.string().default('America/Toronto'), // Fallback de sécurité
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["endTime"],
});

export async function createShift(orgId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    const role = await getCurrentWorkRole(orgId, session.user.id);
    if (role?.name !== 'manager') {
      throw new Error("Seul un manager peut créer des shifts");
    }

    // Récupération des données y compris le champ caché
    const data = {
      employeeId: formData.get('employeeId') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      timezone: formData.get('timezone') as string,
    };

    const validatedData = createShiftSchema.parse(data);

    // LA MAGIE OPÈRE ICI : Conversion de l'heure locale en vraie Date pour la BDD
    const shiftStart = fromZonedTime(validatedData.startTime, validatedData.timezone);
    const shiftEnd = fromZonedTime(validatedData.endTime, validatedData.timezone);

    // Vérification des congés
    const conflictingTimeOff = await prisma.timeOffRequest.findFirst({
      where: {
        organizationId: orgId,
        employeeId: validatedData.employeeId,
        status: 'approved',
        startDate: { lte: shiftEnd },
        endDate: { gte: shiftStart },
      }
    });

    if (conflictingTimeOff) {
      throw new Error("Impossible : L'employé a un congé approuvé sur cette période.");
    }

    // Création du shift
    await prisma.shift.create({
      data: {
        organizationId: orgId,
        employeeId: validatedData.employeeId,
        startTime: shiftStart,
        endTime: shiftEnd,
      },
    });

    // Purge du cache
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { slug: true }
    });

    if (org) {
      revalidatePath(`/organizations/${org.slug}/home`);
      revalidatePath(`/organizations/${org.slug}/schedule`);
    }

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error.message || "Une erreur est survenue lors de la création du shift" };
  }
}