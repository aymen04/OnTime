import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';

export async function GET() {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: 'testfactory' }
    });

    if (!org) throw new Error("Organisation testfactory introuvable");

    const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

    for (const day of DAYS) {
      // 1. On cherche ou on crée le jour (WorkHours)
      let workHour = await prisma.workHours.findFirst({
        where: { organizationId: org.id, dayOfWeek: day }
      });

      if (!workHour) {
        workHour = await prisma.workHours.create({
          data: { organizationId: org.id, dayOfWeek: day }
        });
      }

      // 2. LE SECRET EST ICI : On crée un créneau horaire (WorkTimeSlot) pour les jours de semaine
      const isWeekend = day === 'SATURDAY' || day === 'SUNDAY';
      
      if (!isWeekend) {
        const existingSlot = await prisma.workTimeSlot.findFirst({
          where: { workHoursId: workHour.id }
        });

        if (!existingSlot) {
          await prisma.workTimeSlot.create({
            data: {
              workHoursId: workHour.id,
              startTime: '09:00',
              endTime: '17:00'
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "✅ Horaires et créneaux générés avec succès !" 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}