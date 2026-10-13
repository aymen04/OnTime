import { CalendarClockIcon, CheckCircle2Icon, XCircleIcon, ClockIcon } from 'lucide-react';

export function TimeOffList({ requests }: { requests: any[] }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="mt-6 p-6 bg-card border rounded-xl shadow-sm text-center">
        <CalendarClockIcon className="mx-auto h-8 w-8 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">Vous n'avez fait aucune demande de congé.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-card border rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg mb-4 text-primary">Historique de mes demandes</h3>
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
            <div>
              <p className="text-sm font-medium">
                Du {new Date(req.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au {new Date(req.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
              {req.reason && <p className="text-xs text-muted-foreground mt-0.5">{req.reason}</p>}
            </div>
            <div>
              {req.status === 'pending' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600">
                  <ClockIcon className="size-3" /> En attente
                </span>
              )}
              {req.status === 'approved' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                  <CheckCircle2Icon className="size-3" /> Approuvé
                </span>
              )}
              {req.status === 'rejected' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600">
                  <XCircleIcon className="size-3" /> Refusé
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}