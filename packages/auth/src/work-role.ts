import { prisma } from '@workspace/database/client';

export async function getCurrentWorkRole(
  organizationId: string,
  userId: string
) {
  const membership = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: {
      workRole: {
        select: { id: true, name: true, permissions: true }
      }
    }
  });

  return membership?.workRole ?? null;
}

export async function isManager(organizationId: string, userId: string) {
  const workRole = await getCurrentWorkRole(organizationId, userId);
  return workRole?.name === 'manager';
}

export const MANAGER_PERMISSIONS = {
  manage_shifts: true,
  manage_employees: true,
  manage_tickets: true
};

export const EMPLOYEE_PERMISSIONS = {
  view_own_shifts: true,
  manage_own_availability: true,
  create_tickets: true
};

export async function getEmployeeWorkRoleId(organizationId: string) {
    const role = await prisma.workRole.findUnique({
      where: { organizationId_name: { organizationId, name: 'employee' } },
      select: { id: true }
    });
  
    return role?.id ?? null;
  }