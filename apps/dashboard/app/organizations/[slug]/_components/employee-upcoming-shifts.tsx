import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarClock } from 'lucide-react';

export function EmployeeUpcomingShifts({ weeklyShifts }: { weeklyShifts: any[] }) {
  if (!weeklyShifts || weeklyShifts.length === 0) {
    return (
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <h3 className="font-semibold tracking-tight text-lg mb-4">Prochains jours</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          <CalendarClock className="size-8 mb-2 opacity-20" />
          <p className="text-sm">Rien d'autre de prévu cette semaine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border bg-card shadow-sm">
      <h3 className="font-semibold tracking-tight text-lg mb-4">Prochains jours</h3>
      
      {/* Conteneur du Slider avec Tailwind Snap */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {weeklyShifts.map((shift) => (
          <div 
            key={shift.id} 
            className="snap-start shrink-0 w-[200px] p-4 rounded-xl border bg-background flex flex-col justify-center relative overflow-hidden shadow-sm transition-hover hover:border-primary/50"
          >
            {/* Liseré visuel sur le côté gauche */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40"></div>
            
            <p className="text-sm font-semibold capitalize text-primary mb-1">
              {format(new Date(shift.startTime), 'EEEE d MMM', { locale: fr })}
            </p>
            <p className="text-lg font-bold text-foreground">
              {format(new Date(shift.startTime), 'HH:mm')}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              à {format(new Date(shift.endTime), 'HH:mm')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}