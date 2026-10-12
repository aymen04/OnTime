import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Règle 1 : Sécurité (Localhost uniquement)
  if (!databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1')) {
    console.error('❌ ERREUR FATALE : Ce script ne peut être exécuté que sur une base de données locale.');
    process.exit(1);
  }

  // Règle 2 : Paramètres (slug, email)
  const orgSlug = process.argv[2];
  const userEmail = process.argv[3];

  if (!orgSlug || !userEmail) {
    console.error('❌ Usage: npx tsx src/seed-shifts.ts <organization_slug> <user_email>');
    process.exit(1);
  }

  console.log(`🔍 Recherche de l'organisation (${orgSlug}) et de l'employé (${userEmail})...`);

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  });

  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!organization || !user) {
    console.error('❌ Organisation ou Utilisateur introuvable.');
    process.exit(1);
  }

  // Règle 4 : Idempotence (Ne pas dupliquer si des shifts futurs existent déjà)
  const now = new Date();
  const existingFutureShifts = await prisma.shift.count({
    where: {
      organizationId: organization.id,
      employeeId: user.id,
      startTime: { gt: now }
    }
  });

  if (existingFutureShifts > 0) {
    console.log(`✅ L'employé a déjà ${existingFutureShifts} shift(s) futur(s). Aucune création nécessaire (Idempotent).`);
    process.exit(0);
  }

  // Règle 3 : Création de 3 à 5 shifts futurs
  console.log('⏳ Création de 4 shifts futurs...');
  const shiftsToCreate = [];
  
  for (let i = 1; i <= 4; i++) {
    const shiftDate = new Date();
    shiftDate.setDate(now.getDate() + i); // Demain, J+2, J+3, J+4
    
    // Alterne entre le matin (06h-14h) et l'après-midi (14h-22h)
    const isMorning = i % 2 !== 0;
    
    const startTime = new Date(shiftDate.setHours(isMorning ? 6 : 14, 0, 0, 0));
    const endTime = new Date(shiftDate.setHours(isMorning ? 14 : 22, 0, 0, 0));

    shiftsToCreate.push({
      organizationId: organization.id,
      employeeId: user.id,
      startTime,
      endTime,
      positionLabel: isMorning ? 'Ouverture' : 'Fermeture',
      notes: 'Généré par seed-shifts.ts',
    });
  }

  await prisma.shift.createMany({
    data: shiftsToCreate
  });

  console.log(`🎉 4 shifts futurs créés avec succès pour ${user.name} dans ${organization.name} !`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });