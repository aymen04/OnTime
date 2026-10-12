import { prisma } from '@workspace/database/client';

export async function getEligibleCoworkers(organizationId: string, currentUserId: string) {
  // On récupère les memberships de l'orga qui ont le rôle 'employee', 
  // en excluant l'utilisateur actuel.
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId,
      userId: { not: currentUserId },
      workRole: { name: 'employee' }
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    },
    orderBy: { user: { name: 'asc' } }
  });

  return memberships.map(m => m.user);
}