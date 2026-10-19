import { NextResponse } from 'next/server';
import { prisma } from '@workspace/database/client';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const hashedPassword = await hash('MotDePasse123!', 10);

    // 1. L'organisation
    const org = await prisma.organization.upsert({
      where: { slug: 'testfactory' },
      update: {},
      create: { name: 'Test Factory', slug: 'testfactory' },
    });

    // 2. Les rôles
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

    // 3. Le Manager
    const manager = await prisma.user.upsert({
      where: { email: 'manager@gmail.com' },
      update: { password: hashedPassword, completedOnboarding: true },
      create: { email: 'manager@gmail.com', name: 'Le Boss', password: hashedPassword, completedOnboarding: true },
    });

    // 4. L'Employé
    const employee = await prisma.user.upsert({
      where: { email: 'employe1@gmail.com' },
      update: { password: hashedPassword, completedOnboarding: true },
      create: { email: 'employe1@gmail.com', name: 'Employé Test', password: hashedPassword, completedOnboarding: true },
    });

    // 5. Les Memberships
    await prisma.membership.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: manager.id } },
      update: { role: 'ADMIN', isOwner: true, workRoleId: managerRole.id },
      create: { organizationId: org.id, userId: manager.id, role: 'ADMIN', isOwner: true, workRoleId: managerRole.id },
    });

    await prisma.membership.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: employee.id } },
      update: { role: 'MEMBER', isOwner: false, workRoleId: employeeRole.id },
      create: { organizationId: org.id, userId: employee.id, role: 'MEMBER', isOwner: false, workRoleId: employeeRole.id },
    });

    // 6. Créer un shift pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(18, 0, 0, 0);

    await prisma.shift.create({
      data: { organizationId: org.id, employeeId: employee.id, startTime: tomorrow, endTime: tomorrowEnd }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Base de données mise à jour avec succès !",
      comptes: {
        manager: "manager@gmail.com / MotDePasse123!",
        employe: "employe1@gmail.com / MotDePasse123!"
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}