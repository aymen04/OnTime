'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

// Fonction utilitaire pour sécuriser les coordonnées GPS
function isValidGPS(lat: any, lng: any): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

export async function clockIn(orgId: string, shiftId: string, lat: number, lng: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // SÉCURITÉ : Vérification stricte des coordonnées
    if (!isValidGPS(lat, lng)) {
      throw new Error("Coordonnées GPS invalides ou falsifiées.");
    }

    await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        employeeId: session.user.id,
        shiftId: shiftId,
        clockInTime: new Date(),
        clockInLat: lat,
        clockInLng: lng,
        clockInDistanceMeters: 0,
        clockInFlagged: false, // Plus tard, on pourra calculer la distance par rapport au magasin et mettre "true" si l'employé est trop loin
      }
    });

    revalidatePath(`/organizations/${orgId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clockOut(orgId: string, timeEntryId: string, lat: number, lng: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // SÉCURITÉ : Vérification stricte des coordonnées
    if (!isValidGPS(lat, lng)) {
      throw new Error("Coordonnées GPS invalides ou falsifiées.");
    }

    // SÉCURITÉ : Vérifier que l'employé modifie bien SON propre pointage
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: timeEntryId }
    });

    if (!existingEntry || existingEntry.employeeId !== session.user.id) {
      throw new Error("Pointage introuvable ou non autorisé.");
    }

    await prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: { 
        clockOutTime: new Date(),
        clockOutLat: lat,   
        clockOutLng: lng,   
        clockOutDistanceMeters: 0,
        clockOutFlagged: false,
      }
    });

    revalidatePath(`/organizations/${orgId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}