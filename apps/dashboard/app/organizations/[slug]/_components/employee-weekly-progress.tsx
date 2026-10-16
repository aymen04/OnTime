import { TargetIcon } from 'lucide-react';
import { Progress } from '@workspace/ui/components/progress';
import { getEmployeeWeeklyHours } from '../../../../data/dashboard/get-employee-weekly-hours';

export async function EmployeeWeeklyProgress({ orgId, employeeId }: { orgId: string, employeeId: string }) {
  const data = await getEmployeeWeeklyHours(orgId, employeeId);
  
  // Calcul du pourcentage (plafonné à 100%)
  const percentage = data.plannedHours > 0 
    ? Math.min(Math.round((data.workedHours / data.plannedHours) * 100), 100)
    : 0;

  return (
    <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TargetIcon className="size-5 text-primary" />
          <h3 className="font-semibold text-foreground">Objectif de la semaine</h3>
        </div>
        <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          {percentage}%
        </span>
      </div>

      <Progress value={percentage} className="h-3 mb-3" />

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          <span className="font-bold text-foreground">{data.workedHours}h</span> travaillées
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{data.plannedHours}h</span> prévues
        </p>
      </div>
    </div>
  );
}