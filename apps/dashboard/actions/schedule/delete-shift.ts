'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';
import { revalidatePath } from 'next/cache';

export async function deleteShift(orgId: string, shiftId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // SÉCURITÉ : Seul un manager peut supprimer un shift
    const role = await getCurrentWorkRole(orgId, session.user.id);
    if (role?.name !== 'manager') {
      throw new Error("Seul un manager peut supprimer des shifts");
    }

    // Suppression en base de données
    await prisma.shift.delete({
      where: { id: shiftId },
    });

    // Purge du cache pour mettre à jour l'écran de l'employé et du manager
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
    return { success: false, error: error.message || "Erreur lors de la suppression" };
  }
}