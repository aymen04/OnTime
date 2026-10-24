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
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const org = await prisma.organization.findUnique({
    where: { slug: slug }
  });

  if (!org) redirect('/');

  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: { organizationId: org.id, userId: session.user.id }
    },
    include: { workRole: true }
  });

  if (membership?.workRole?.name !== 'manager') {
    return <div className="p-8 text-red-500">Accès refusé. Vous devez être manager.</div>;
  }

  // --- REQUÊTES EN ATTENTE ---
  const pendingTimeOff = await prisma.timeOffRequest.findMany({
    where: { organizationId: org.id, status: 'pending' },
    include: { employee: true }
  });

  const pendingSwaps = await prisma.shiftSwapRequest.findMany({
    where: { organizationId: org.id, status: 'PENDING_MANAGER' },
    include: { requester: true, targetEmployee: true, shift: true }
  });

  // --- HISTORIQUE (TRAITÉES) ---
  const historyTimeOff = await prisma.timeOffRequest.findMany({
    where: { organizationId: org.id, status: { not: 'pending' } },
    include: { employee: true },
    orderBy: { id: 'desc' }
  });

  const historySwaps = await prisma.shiftSwapRequest.findMany({
    where: { organizationId: org.id, status: { notIn: ['PENDING_MANAGER', 'PENDING_EMPLOYEE'] } },
    include: { requester: true, targetEmployee: true, shift: true },
    orderBy: { id: 'desc' }
  });

  return (
    // AJOUT : h-full max-h-screen overflow-y-auto pb-24 pour débloquer le scroll mobile + p-4 sur petits écrans
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 h-full max-h-screen overflow-y-auto pb-24">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Demandes & Approbations</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez les congés et les échanges de shifts de votre équipe.
        </p>
      </div>

      {/* --- SECTION 1 : EN ATTENTE --- */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">À traiter</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          
          {/* Congés en attente */}
          <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="p-4 sm:p-6 pb-3 border-b">
              <h3 className="font-semibold text-sm sm:text-base">Congés ({pendingTimeOff.length})</h3>
            </div>
            <div className="p-4 sm:p-6">
              {pendingTimeOff.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune demande.</p>
              ) : (
                <ul className="space-y-4">
                  {pendingTimeOff.map((req) => (
                    <li key={req.id} className="flex justify-between items-center gap-3 border-b pb-4 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{req.employee.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground break-words">
                          Du {req.startDate.toLocaleDateString()} au {req.endDate.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <form action={updateTimeOffStatus.bind(null, slug, req.id, 'approved') as any}>
                          <button type="submit" className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors" title="Approuver">
                            <CheckIcon className="size-4" />
                          </button>
                        </form>
                        <form action={updateTimeOffStatus.bind(null, slug, req.id, 'rejected') as any}>
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

          {/* Échanges en attente */}
          <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="p-4 sm:p-6 pb-3 border-b">
              <h3 className="font-semibold text-sm sm:text-base">Échanges ({pendingSwaps.length})</h3>
            </div>
            <div className="p-4 sm:p-6">
              {pendingSwaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun échange.</p>
              ) : (
                <ul className="space-y-4">
                  {pendingSwaps.map((swap) => (
                    <li key={swap.id} className="flex justify-between items-center gap-3 border-b pb-4 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base break-words leading-snug">
                          {swap.requester.name} <span className="inline-block mx-0.5">➡️</span> {swap.targetEmployee.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Shift du {swap.shift.startTime.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <form action={updateSwapStatus.bind(null, slug, swap.id, 'APPROVED') as any}>
                          <button type="submit" className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors" title="Approuver">
                            <CheckIcon className="size-4" />
                          </button>
                        </form>
                        <form action={updateSwapStatus.bind(null, slug, swap.id, 'REJECTED') as any}>
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

      {/* --- SECTION 2 : HISTORIQUE --- */}
      <div className="mt-2 opacity-90">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Historique de l'équipe</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          
          {/* Historique Congés */}
          <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="p-4 sm:p-6 pb-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Congés traités</h3>
            </div>
            <div className="p-4 sm:p-6 max-h-[300px] overflow-y-auto">
              {historyTimeOff.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun historique.</p>
              ) : (
                <ul className="space-y-4">
                  {historyTimeOff.map((req) => (
                    <li key={req.id} className="flex justify-between items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{req.employee.name}</p>
                        <p className="text-xs text-muted-foreground break-words">
                          Du {req.startDate.toLocaleDateString()} au {req.endDate.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-md ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {req.status === 'approved' ? 'Approuvé' : 'Refusé'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Historique Échanges */}
          <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
            <div className="p-4 sm:p-6 pb-3 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Échanges traités</h3>
            </div>
            <div className="p-4 sm:p-6 max-h-[300px] overflow-y-auto">
              {historySwaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun historique.</p>
              ) : (
                <ul className="space-y-4">
                  {historySwaps.map((swap) => (
                    <li key={swap.id} className="flex justify-between items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm break-words leading-snug">
                          {swap.requester.name} <span className="inline-block mx-0.5">➡️</span> {swap.targetEmployee.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Shift du {swap.shift.startTime.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-md ${swap.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {swap.status === 'APPROVED' ? 'Approuvé' : 'Refusé'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}