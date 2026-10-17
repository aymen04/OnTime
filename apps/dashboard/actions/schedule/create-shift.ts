'use server';

import { z } from 'zod';
import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';
import { revalidatePath } from 'next/cache';

// On sécurise les données envoyées par le formulaire avec Zod
const createShiftSchema = z.object({
  employeeId: z.string().min(1, "L'employé est requis"),
  startTime: z.string().min(1, "L'heure de début est requise"),
  endTime: z.string().min(1, "L'heure de fin est requise"),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["endTime"],
});

export async function createShift(orgId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // 1. Vérifier que l'utilisateur est bien un manager
    const role = await getCurrentWorkRole(orgId, session.user.id);
    if (role?.name !== 'manager') {
      throw new Error("Seul un manager peut créer des shifts");
    }

    // 2. Extraire et valider les données avec Zod
    const data = {
      employeeId: formData.get('employeeId') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
    };

    const validatedData = createShiftSchema.parse(data);
    const shiftStart = new Date(validatedData.startTime);
    const shiftEnd = new Date(validatedData.endTime);

    // 3. VÉRIFICATION DE SÉCURITÉ : L'employé est-il en congé approuvé sur ces dates ?
    const conflictingTimeOff = await prisma.timeOffRequest.findFirst({
      where: {
        organizationId: orgId,
        employeeId: validatedData.employeeId,
        status: 'approved',
        // Logique de chevauchement
        startDate: { lte: shiftEnd },
        endDate: { gte: shiftStart },
      }
    });

    // S'il y a un conflit, on bloque la création
    if (conflictingTimeOff) {
      throw new Error("Impossible : L'employé a un congé approuvé sur cette période.");
    }

    // 4. CRÉATION DU SHIFT
    await prisma.shift.create({
      data: {
        organizationId: orgId,
        employeeId: validatedData.employeeId,
        startTime: shiftStart,
        endTime: shiftEnd,
      },
    });

    // 5. Rafraîchir les pages pour que le nouveau shift apparaisse partout
    revalidatePath(`/organizations/${orgId}`);
    revalidatePath(`/organizations/${orgId}/schedule`);

    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error.message || "Une erreur est survenue lors de la création du shift" };
  }
}