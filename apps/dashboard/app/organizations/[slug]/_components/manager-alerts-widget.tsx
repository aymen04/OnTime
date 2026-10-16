import { AlertCircleIcon, CalendarClockIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { getManagerAlerts } from '../../../../data/dashboard/get-manager-alerts';

export async function ManagerAlertsWidget({ orgId, slug }: { orgId: string, slug: string }) {
  const alerts = await getManagerAlerts(orgId);

  const hasAlerts = alerts.pendingTimeOffs > 0 || alerts.missingClockOuts > 0;

  // S'il n'y a aucune alerte, le widget est totalement invisible
  if (!hasAlerts) return null; 

  return (
    <div className="mb-8 p-5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircleIcon className="size-5 text-orange-600 dark:text-orange-500" />
        <h3 className="font-semibold text-orange-800 dark:text-orange-400">Actions Requises</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {alerts.pendingTimeOffs > 0 && (
          <Link href={`/organizations/${slug}/schedule`} className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm hover:border-orange-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-md text-orange-600 dark:text-orange-400">
                <CalendarClockIcon className="size-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Demandes en attente</p>
                <p className="text-xs text-muted-foreground">{alerts.pendingTimeOffs} demande(s) à traiter</p>
              </div>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-orange-600 transition-colors" />
          </Link>
        )}

        {alerts.missingClockOuts > 0 && (
          <Link href={`/organizations/${slug}/schedule`} className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm hover:border-red-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-md text-red-600 dark:text-red-400">
                <AlertCircleIcon className="size-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Pointages ouverts</p>
                <p className="text-xs text-muted-foreground">{alerts.missingClockOuts} oubli(s) de départ</p>
              </div>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
}