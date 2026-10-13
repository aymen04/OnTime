'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

// 1. Action pour l'employé : Demander un congé
export async function submitTimeOffRequest(orgId: string, startDate: Date, endDate: Date, reason: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    if (startDate >= endDate) {
      throw new Error("La date de fin doit être postérieure à la date de début.");
    }

    await prisma.timeOffRequest.create({
      data: {
        organizationId: orgId,
        employeeId: session.user.id,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        status: 'pending', // En attente par défaut
      }
    });

    revalidatePath(`/organizations/${orgId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Action pour le manager : Approuver ou refuser
export async function updateTimeOffStatus(orgId: string, requestId: string, status: 'approved' | 'rejected') {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // Ici on pourrait rajouter une vérification pour s'assurer que l'utilisateur est bien manager
    
    await prisma.timeOffRequest.update({
      where: { id: requestId },
      data: { status: status }
    });

    revalidatePath(`/organizations/${orgId}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}