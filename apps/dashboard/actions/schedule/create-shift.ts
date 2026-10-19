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

    const employeeId = formData.get('employeeId') as string;
    const date = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    if (!employeeId || !date || !startTime || !endTime) {
      throw new Error("Veuillez remplir tous les champs.");
    }

    const shiftStart = new Date(`${date}T${startTime}:00`);
    let shiftEnd = new Date(`${date}T${endTime}:00`);
    
    if (shiftEnd < shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    const dayOfWeek = JS_DAY_TO_PRISMA[getDay(shiftStart)];
    
    const [startH, startM] = startTime.split(':').map(Number);
    const requestedStartMins = startH * 60 + startM;
    
    let [endH, endM] = endTime.split(':').map(Number);
    const requestedEndMins = (shiftEnd > new Date(`${date}T23:59:59`)) 
      ? 1440 
      : (endH === 0 && endM === 0 ? 1440 : endH * 60 + endM);


    // --- 1. VÉRIFICATION DES HEURES D'OUVERTURE (BUSINESS HOURS) ---
    const workHour = await prisma.workHours.findFirst({
      where: { organizationId: orgId, dayOfWeek: dayOfWeek }
    });

    if (!workHour) {
      throw new Error(`L'entreprise est fermée les ${dayOfWeek.toLowerCase()}s.`);
    }

    const businessSlots = await prisma.workTimeSlot.findMany({
      where: { workHoursId: workHour.id }
    });

    if (businessSlots.length === 0) {
      throw new Error(`L'entreprise est fermée les ${dayOfWeek.toLowerCase()}s.`);
    }

    let isWithinBusinessHours = false;
    for (const slot of businessSlots) {
      // Helper blindé : lit les données qu'elles soient en string ("09:00") ou en ISO Date ("1970-01-01T09:00:00Z")
      const getMins = (val: any) => {
        if (typeof val === 'string' && val.includes(':') && !val.includes('T')) {
          const [h, m] = val.split(':').map(Number);
          return h * 60 + m;
        }
        const d = new Date(val);
        return d.getUTCHours() * 60 + d.getUTCMinutes();
      };

      // Supporte les clés 'start' (DTO) ou 'startTime' (Schema)
      const slotStartMins = getMins((slot as any).start || (slot as any).startTime);
      let slotEndMins = getMins((slot as any).end || (slot as any).endTime);
      
      if (slotEndMins === 0) slotEndMins = 1440;

      if (requestedStartMins >= slotStartMins && requestedEndMins <= slotEndMins) {
        isWithinBusinessHours = true;
        break;
      }
    }

    if (!isWithinBusinessHours) {
      throw new Error("⚠️ Le shift déborde des heures d'ouverture de l'entreprise.");
    }


    // --- 2. VÉRIFICATION DES DISPONIBILITÉS DE L'EMPLOYÉ ---
    const availability = await prisma.availability.findFirst({
      where: { organizationId: orgId, userId: employeeId, dayOfWeek: dayOfWeek }
    });

    if (!availability) {
      throw new Error(`L'employé n'est pas disponible les ${dayOfWeek.toLowerCase()}s.`);
    }

    if (requestedStartMins < availability.startMinutes || requestedEndMins > availability.endMinutes) {
      const formatTime = (mins: number) => {
        if (mins === 1440) return '00:00';
        return `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
      };
      throw new Error(`Hors disponibilités employé. (Dispo : ${formatTime(availability.startMinutes)} à ${formatTime(availability.endMinutes)})`);
    }


    // --- 3. CRÉATION DU SHIFT ---
    await prisma.shift.create({
      data: {
        organizationId: orgId,
        employeeId: employeeId,
        startTime: shiftStart,
        endTime: shiftEnd,
        createdById: session.user.id,
      }
    });

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { slug: true } });
    if (org) revalidatePath(`/organizations/${org.slug}/schedule`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la création du shift" };
  }
}