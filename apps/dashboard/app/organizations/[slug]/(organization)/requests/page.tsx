import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { redirect } from 'next/navigation';
import { CheckIcon, XIcon } from 'lucide-react';

// ⚠️ IMPORTANT : Vérifie que le chemin vers ton fichier d'actions est correct !
import { updateTimeOffStatus, updateSwapStatus } from '~/actions/time-off/time-off-actions';

export default async function RequestsPage({
  params
}: {
  params: { slug: string };
}) {
  // On "await" les params pour éviter les erreurs avec Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Récupérer l'organisation
  const org = await prisma.organization.findUnique({
    where: { slug: slug }
  });

  if (!org) redirect('/');

  // Vérifier si l'utilisateur est Manager
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: { organizationId: org.id, userId: session.user.id }
    },
    include: { workRole: true }
  });

  if (membership?.workRole?.name !== 'manager') {
    return <div className="p-8 text-red-500">Accès refusé. Vous devez être manager.</div>;
  }

  // Récupérer les requêtes en attente
  const pendingTimeOff = await prisma.timeOffRequest.findMany({
    where: { organizationId: org.id, status: 'pending' },
    include: { employee: true }
  });

  const pendingSwaps = await prisma.shiftSwapRequest.findMany({
    where: { organizationId: org.id, status: 'PENDING_MANAGER' },
    include: { requester: true, targetEmployee: true, shift: true }
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demandes & Approbations</h1>
        <p className="text-muted-foreground">
          Gérez les congés et les échanges de shifts de votre équipe.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section Congés */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Congés en attente ({pendingTimeOff.length})</h3>
          </div>
          <div className="p-6 pt-0">
            {pendingTimeOff.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune demande de congé à traiter.</p>
            ) : (
              <ul className="space-y-4">
                {pendingTimeOff.map((req) => (
                  <li key={req.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">{req.employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Du {req.startDate.toLocaleDateString()} au {req.endDate.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Boutons d'action pour les congés */}
                    <div className="flex gap-2">
                      <form action={updateTimeOffStatus.bind(null, slug, req.id, 'approved')}>
                        <button type="submit" className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors" title="Approuver">
                          <CheckIcon className="size-4" />
                        </button>
                      </form>
                      <form action={updateTimeOffStatus.bind(null, slug, req.id, 'rejected')}>
                        <button type="submit" className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors" title="Refuser">
                          <XIcon className="size-4" />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section Échanges */}
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Échanges de Shifts ({pendingSwaps.length})</h3>
          </div>
          <div className="p-6 pt-0">
            {pendingSwaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun échange en attente.</p>
            ) : (
              <ul className="space-y-4">
                {pendingSwaps.map((swap) => (
                  <li key={swap.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">{swap.requester.name} ➡️ {swap.targetEmployee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Shift du {swap.shift.startTime.toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Boutons d'action pour les échanges */}
                    <div className="flex gap-2">
                      <form action={updateSwapStatus.bind(null, slug, swap.id, 'APPROVED')}>
                        <button type="submit" className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors" title="Approuver">
                          <CheckIcon className="size-4" />
                        </button>
                      </form>
                      <form action={updateSwapStatus.bind(null, slug, swap.id, 'REJECTED')}>
                        <button type="submit" className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors" title="Refuser">
                          <XIcon className="size-4" />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}