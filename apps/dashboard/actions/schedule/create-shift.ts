'use server';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';
import { getDay } from 'date-fns';

const JS_DAY_TO_PRISMA = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export async function createShift(orgId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    // 1. Extraction sécurisée des données du formulaire
    const employeeId = formData.get('employeeId') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    // Sécurité : on vérifie que tout est bien rempli avant de continuer
    if (!employeeId || !date || !startTime || !endTime) {
      throw new Error("Veuillez remplir tous les champs du formulaire.");
    }

    const shiftStart = new Date(`${date}T${startTime}:00`);
    let shiftEnd = new Date(`${date}T${endTime}:00`);
    
    // Si l'heure de fin est avant l'heure de début (ex: 22h00 -> 02h00), c'est le lendemain
    if (shiftEnd < shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    // --- VÉRIFICATION DES DISPONIBILITÉS ---
    const dayOfWeek = JS_DAY_TO_PRISMA[getDay(shiftStart)];
    
    // Conversion en minutes depuis minuit
    const [startH, startM] = startTime.split(':').map(Number);
    const requestedStartMins = startH * 60 + startM;
    
    let [endH, endM] = endTime.split(':').map(Number);
    
    // Si le shift se termine le lendemain, ou à 00:00, on considère que pour CE jour-là, la contrainte s'arrête à 1440 (minuit)
    const requestedEndMins = (shiftEnd > new Date(`${date}T23:59:59`)) 
      ? 1440 
      : (endH === 0 && endM === 0 ? 1440 : endH * 60 + endM);

    // On cherche la disponibilité enregistrée en base
    const availability = await prisma.availability.findFirst({
      where: {
        organizationId: orgId,
        userId: employeeId,
        dayOfWeek: dayOfWeek,
      }
    });

    if (!availability) {
      throw new Error(`L'employé n'est pas disponible les ${dayOfWeek.toLowerCase()}s.`);
    }

    // Si le shift demandé déborde des horaires de disponibilité
    if (requestedStartMins < availability.startMinutes || requestedEndMins > availability.endMinutes) {
      const formatTime = (mins: number) => {
        if (mins === 1440) return '00:00';
        return `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
      };
      throw new Error(`Hors disponibilités. (Dispo ce jour-là : ${formatTime(availability.startMinutes)} à ${formatTime(availability.endMinutes)})`);
    }
    // --- FIN DE LA VÉRIFICATION ---

    // 4. Tout est vert, on crée le shift !
    await prisma.shift.create({
      data: {
        organizationId: orgId,
        employeeId: employeeId,
        startTime: shiftStart,
        endTime: shiftEnd,
        createdById: session.user.id,
      }
    });

    // 5. Mise à jour de l'interface
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { slug: true } });
    if (org) revalidatePath(`/organizations/${org.slug}/schedule`);

    return { success: true };
  } catch (error: any) {
    // On renvoie l'erreur proprement au composant Client pour qu'il l'affiche en rouge
    return { success: false, error: error.message || "Erreur lors de la création du shift" };
  }
}