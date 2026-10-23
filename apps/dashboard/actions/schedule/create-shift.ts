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
    const startTime = formData.get('startTime') as string; // ex: "09:00"
    const endTime = formData.get('endTime') as string;     // ex: "17:00"

    if (!employeeId || !date || !startTime || !endTime) throw new Error("Veuillez remplir tous les champs.");

    const shiftStart = new Date(`${date}T${startTime}:00`);
    let shiftEnd = new Date(`${date}T${endTime}:00`);
    if (shiftEnd < shiftStart) shiftEnd.setDate(shiftEnd.getDate() + 1);

    const dayOfWeek = JS_DAY_TO_PRISMA[getDay(shiftStart)];
    
    // Fonction simple pour convertir "HH:mm" en minutes (syntaxe corrigée)
    const timeToMins = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h === 0 && m === 0 ? 1440 : (h * 60) + m;
    };

    const requestedStartMins = timeToMins(startTime);
    const requestedEndMins = timeToMins(endTime) === 0 ? 1440 : timeToMins(endTime);

    // Récupération de l'organisation
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Organisation introuvable.");
    
    const tz = org.timezone || 'America/Toronto';
    
    // --- 1. VÉRIFICATION DES HEURES D'OUVERTURE ---
    const workHour = await prisma.workHours.findFirst({
      where: { organizationId: orgId, dayOfWeek: dayOfWeek }
    });
    if (!workHour) throw new Error(`L'entreprise est fermée les ${dayOfWeek.toLowerCase()}s.`);

    const businessSlots = await prisma.workTimeSlot.findMany({
      where: { workHoursId: workHour.id }
    });
    if (businessSlots.length === 0) throw new Error(`L'entreprise est fermée les ${dayOfWeek.toLowerCase()}s.`);

    let isWithinBusinessHours = false;
    
    // On traduit l'heure de la BD dans le fuseau de l'organisation
    const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });

    for (const slot of businessSlots) {
      const slotStartStr = timeFormatter.format(slot.start); 
      const slotEndStr = timeFormatter.format(slot.end);

      const slotStartMins = timeToMins(slotStartStr);
      let slotEndMins = timeToMins(slotEndStr);

      if (requestedStartMins >= slotStartMins && requestedEndMins <= slotEndMins) {
        isWithinBusinessHours = true;
        break;
      }
    }

    if (!isWithinBusinessHours) throw new Error("Le shift déborde des heures d'ouverture de l'entreprise.");

    // --- 2. VÉRIFICATION DES DISPONIBILITÉS DE L'EMPLOYÉ ---
    const availability = await prisma.availability.findFirst({
      where: { organizationId: orgId, userId: employeeId, dayOfWeek: dayOfWeek }
    });
    if (!availability) throw new Error(`L'employé n'est pas disponible les ${dayOfWeek.toLowerCase()}s.`);

    if (requestedStartMins < availability.startMinutes || requestedEndMins > availability.endMinutes) {
      throw new Error(`Hors disponibilités employé.`);
    }

    // --- 3. VÉRIFICATION DES CONGÉS (NOUVELLE LOGIQUE) ---
    const conflictingTimeOff = await prisma.timeOffRequest.findFirst({
      where: {
        employeeId: employeeId,
        organizationId: orgId,
        status: 'approved',
        // Croisement de dates : le congé commence avant la fin du shift et finit après son début
        startDate: { lte: shiftEnd },
        endDate: { gte: shiftStart }
      }
    });

    if (conflictingTimeOff) {
      throw new Error("Impossible d'assigner ce shift : l'employé est en congé approuvé à ces dates.");
    }

    // --- 4. CRÉATION DU SHIFT ---
    await prisma.shift.create({
      data: {
        organizationId: orgId,
        employeeId: employeeId,
        startTime: shiftStart,
        endTime: shiftEnd,
        createdById: session.user.id,
      }
    });

    revalidatePath(`/organizations/${org.slug}/schedule`);
    return { success: true };
    
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la création du shift" };
  }
}