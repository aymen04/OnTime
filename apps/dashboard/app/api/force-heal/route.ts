import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    // 1. On récupère juste les organisations (sans include)
    const orgs = await prisma.organization.findMany();

    let fixedCount = 0;
    const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

    for (const org of orgs) {
      // 2. On compte combien de jours cette orga possède
      const hoursCount = await prisma.workHours.count({
        where: { organizationId: org.id }
      });

      // 3. Si elle n'a aucun jour, on génère la semaine
      if (hoursCount === 0) {
        await prisma.workHours.createMany({
          data: DAYS.map(day => ({
            organizationId: org.id,
            dayOfWeek: day
          }))
        });
        fixedCount++;
      }
    }

    revalidatePath('/', 'layout');

    return NextResponse.json({ 
      success: true, 
      message: `${fixedCount} organisation(s) réparée(s) avec succès ! Cache purgé.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}