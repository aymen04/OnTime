'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

// 1. Action pour l'employé : Demander un congé
export async function submitTimeOffRequest(orgId: string, slug: string, startDate: Date, endDate: Date, reason: string) {
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
        status: 'pending',
      }
    });

    revalidatePath(`/organizations/${slug}/requests`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Action pour le manager : Approuver ou refuser un congé
export async function updateTimeOffStatus(slug: string, requestId: string, status: 'approved' | 'rejected') {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");
    
    await prisma.timeOffRequest.update({
      where: { id: requestId },
      data: { status: status }
    });

    revalidatePath(`/organizations/${slug}/requests`);
    revalidatePath(`/organizations/${slug}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Action pour le manager : Approuver ou refuser un échange de shift
export async function updateSwapStatus(slug: string, swapId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    await prisma.shiftSwapRequest.update({
      where: { id: swapId },
      data: { status }
    });
    
    revalidatePath(`/organizations/${slug}/requests`);
    revalidatePath(`/organizations/${slug}/schedule`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}