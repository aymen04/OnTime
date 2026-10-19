import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    // 1. On récupère toutes les organisations de ta base de données
    const orgs = await prisma.organization.findMany({
      include: { workHours: true }
    });

    let fixedCount = 0;
    const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

    for (const org of orgs) {
      // 2. Si l'organisation n'a aucun jour, on la répare
      if (org.workHours.length === 0) {
        await prisma.workHours.createMany({
          data: DAYS.map(day => ({
            organizationId: org.id,
            dayOfWeek: day
          }))
        });
        fixedCount++;
      }
    }

    // 3. LE PLUS IMPORTANT : On ordonne à Vercel de vider tout son cache !
    revalidatePath('/', 'layout');

    return NextResponse.json({ 
      success: true, 
      message: `${fixedCount} organisation(s) réparée(s) avec succès ! Cache purgé.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}