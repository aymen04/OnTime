import { CalendarDaysIcon, ClockIcon } from 'lucide-react';

export function EmployeeUpcomingShifts({ weeklyShifts, nextShiftId }: { weeklyShifts: any[], nextShiftId?: string }) {
  // On filtre pour ne garder que les shifts dans le futur, et on exclut le "nextShift" qui est déjà affiché en gros sur le dashboard
  const upcomingShifts = weeklyShifts
    .filter(shift => new Date(shift.startTime) > new Date() && shift.id !== nextShiftId)
    .slice(0, 3); // On n'en garde que 3 maximum

  return (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDaysIcon className="size-5 text-primary" />
        <h3 className="font-semibold tracking-tight text-lg">Prochains jours</h3>
      </div>
      
      {upcomingShifts.length > 0 ? (
        <div className="space-y-3">
          {upcomingShifts.map((shift) => (
            <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-medium capitalize">
                  {new Date(shift.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ClockIcon className="size-3" />
                  {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-muted/20 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">Rien d'autre de prévu cette semaine.</p>
        </div>
      )}
    </div>
  );
}