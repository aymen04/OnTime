import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs'; // Change en 'bcrypt' si c'est ce que tu as installé

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données locale...');

  // Le mot de passe universel pour tes tests
  const hashedPassword = await hash('MotDePasse123!', 10);

  // 1. Création de l'Organisation
  const org = await prisma.organization.upsert({
    where: { slug: 'testfactory' },
    update: {},
    create: {
      name: 'Test Factory',
      slug: 'testfactory',
    },
  });

  // 2. Création des Rôles (Manager / Employé)
  const managerRole = await prisma.workRole.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'manager' } },
    update: {},
    create: { organizationId: org.id, name: 'manager' },
  });

  const employeeRole = await prisma.workRole.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'employee' } },
    update: {},
    create: { organizationId: org.id, name: 'employee' },
  });

  // 3. Création du Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@gmail.com' },
    update: { password: hashedPassword, completedOnboarding: true },
    create: {
      email: 'manager@gmail.com',
      name: 'Le Boss',
      password: hashedPassword,
      completedOnboarding: true,
    },
  });

  // 4. Création de l'Employé
  const employee = await prisma.user.upsert({
    where: { email: 'employe1@gmail.com' },
    update: { password: hashedPassword, completedOnboarding: true },
    create: {
      email: 'employe1@gmail.com',
      name: 'Employé Test',
      password: hashedPassword,
      completedOnboarding: true,
    },
  });

  // 5. Relier le Manager à l'Organisation (Membership)
  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: manager.id } },
    update: { role: 'ADMIN', isOwner: true, workRoleId: managerRole.id },
    create: {
      organizationId: org.id,
      userId: manager.id,
      role: 'ADMIN',
      isOwner: true,
      workRoleId: managerRole.id,
    },
  });

  // 6. Relier l'Employé à l'Organisation
  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: employee.id } },
    update: { role: 'MEMBER', isOwner: false, workRoleId: employeeRole.id },
    create: {
      organizationId: org.id,
      userId: employee.id,
      role: 'MEMBER',
      isOwner: false,
      workRoleId: employeeRole.id,
    },
  });

  // 7. Vider les anciennes dispos/shifts de l'employé pour repartir à zéro
  await prisma.availability.deleteMany({ where: { userId: employee.id } });
  await prisma.shift.deleteMany({ where: { employeeId: employee.id } });

  // 8. Création des Disponibilités par défaut (Lundi -> Vendredi, 09h à 17h)
  const availabilities = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].map(day => ({
    organizationId: org.id,
    userId: employee.id,
    dayOfWeek: day as any,
    startMinutes: 540, // 09:00 en minutes
    endMinutes: 1020,  // 17:00 en minutes
  }));
  await prisma.availability.createMany({ data: availabilities });

  // 9. Création d'un Shift de test pour demain (10h00 - 18h00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(18, 0, 0, 0);

  await prisma.shift.create({
    data: {
      organizationId: org.id,
      employeeId: employee.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
    }
  });

  console.log('✅ SEED TERMINÉ AVEC SUCCÈS ! Base de données locale prête.');
  console.log('👔 Compte Manager : manager@gmail.com / MotDePasse123!');
  console.log('👷 Compte Employé : employe1@gmail.com / MotDePasse123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });