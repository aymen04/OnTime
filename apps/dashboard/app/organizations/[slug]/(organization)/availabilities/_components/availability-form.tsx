'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { updateAvailabilities } from '~/actions/schedule/update-availability';
import { Button } from '@workspace/ui/components/button';
import { Clock } from 'lucide-react';

// 1. Amélioration des convertisseurs
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins: number) => {
  if (mins === 1440) return '00:00'; // Gère correctement minuit pour l'affichage HTML
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const DAYS = [
  { id: 'MONDAY', label: 'Lundi' },
  { id: 'TUESDAY', label: 'Mardi' },
  { id: 'WEDNESDAY', label: 'Mercredi' },
  { id: 'THURSDAY', label: 'Jeudi' },
  { id: 'FRIDAY', label: 'Vendredi' },
  { id: 'SATURDAY', label: 'Samedi' },
  { id: 'SUNDAY', label: 'Dimanche' },
];

export function AvailabilityForm({ slug, initialData }: { slug: string, initialData: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Initialisation intelligente : on lit les données de la DB pour pré-remplir !
  const [schedule, setSchedule] = useState<Record<string, { active: boolean; start: string; end: string }>>(() => {
    const defaultSchedule = DAYS.reduce((acc, day) => ({ 
      ...acc, [day.id]: { active: false, start: '09:00', end: '17:00' } 
    }), {} as any);
    
    // On écrase les valeurs par défaut avec ce qui existe en base
    initialData.forEach(avail => {
      defaultSchedule[avail.dayOfWeek] = {
        active: true,
        start: minutesToTime(avail.startMinutes),
        end: minutesToTime(avail.endMinutes)
      };
    });
    
    return defaultSchedule;
  });

  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({ ...prev, [dayId]: { ...prev[dayId], active: !prev[dayId].active } }));
  };

  const updateTime = (dayId: string, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({ ...prev, [dayId]: { ...prev[dayId], [field]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = Object.entries(schedule)
      .filter(([_, data]) => data.active)
      .map(([dayOfWeek, data]) => {
        let startMins = timeToMinutes(data.start);
        let endMins = timeToMinutes(data.end);
        
        // CORRECTION : Si la fin est à minuit (0), c'est en fait la fin du jour (1440)
        if (endMins === 0) endMins = 1440;

        return {
          dayOfWeek,
          startMinutes: startMins,
          endMinutes: endMins,
        };
      });

    startTransition(async () => {
      const result = await updateAvailabilities(slug, payload);
      if (result.success) {
        setMessage({ type: 'success', text: 'Vos disponibilités ont été mises à jour.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur inconnue.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl border bg-card shadow-sm space-y-6">
      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="divide-y border rounded-lg overflow-hidden">
        {DAYS.map((day) => {
          const isActive = schedule[day.id].active;
          return (
            <div key={day.id} className={`flex items-center justify-between p-4 transition-colors ${isActive ? 'bg-background' : 'bg-muted/30'}`}>
              <div className="flex items-center gap-4 w-1/3">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={() => toggleDay(day.id)}
                  className="size-5 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <span className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {day.label}
                </span>
              </div>

              {isActive ? (
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <input 
                    type="time" 
                    value={schedule[day.id].start}
                    onChange={(e) => updateTime(day.id, 'start', e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <span className="text-muted-foreground">à</span>
                  <input 
                    type="time" 
                    value={schedule[day.id].end}
                    onChange={(e) => updateTime(day.id, 'end', e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic mr-4">Non disponible</div>
              )}
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Enregistrement...' : 'Sauvegarder mes disponibilités'}
      </Button>
    </form>
  );
}