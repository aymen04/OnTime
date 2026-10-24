'use client';

import * as React from 'react';
import { useState, useTransition, useMemo } from 'react';
import { updateAvailabilities } from '~/actions/schedule/update-availability';
import { Button } from '@workspace/ui/components/button';
import { Clock, SlidersHorizontal } from 'lucide-react';

// 1. Convertisseurs propres
const timeToMinutes = (time: string) => {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins: number) => {
  if (mins === 1440) return '00:00';
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

const STEP_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 15, label: '15 min' },
  { value: 10, label: '10 min' },
  { value: 5, label: '5 min' },
  { value: 1, label: '1 min' },
];

type AvailabilityRecord = {
  dayOfWeek: string;
  startMinutes: number;
  endMinutes: number;
};

type DaySchedule = {
  active: boolean;
  start: string;
  end: string;
};

// Composant TimeSelect Cranté (remplace l'input natif bancal)
function SteppedTimeSelect({
  value,
  onChange,
  step,
  timeSlots,
}: {
  value: string;
  onChange: (val: string) => void;
  step: number;
  timeSlots: string[];
}) {
  // Si l'utilisateur choisit un crantage de 1 min, ou si la valeur actuelle est hors-crantage,
  // on s'assure que la valeur reste sélectionnable dans la liste
  const options = useMemo(() => {
    if (timeSlots.includes(value)) return timeSlots;
    return [...timeSlots, value].sort();
  }, [timeSlots, value]);

  if (step === 1) {
    return (
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full sm:w-[110px] min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full sm:w-[105px] min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

export function AvailabilityForm({
  slug,
  initialData,
}: {
  slug: string;
  initialData: AvailabilityRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Crantage par défaut : 15 minutes (modifiable en 1 clic par l'utilisateur)
  const [step, setStep] = useState<number>(15);

  // Génération dynamique des créneaux horaires selon le crantage choisi
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let mins = 0; mins < 1440; mins += step) {
      slots.push(minutesToTime(mins));
    }
    return slots;
  }, [step]);

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const defaultSchedule: Record<string, DaySchedule> = DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day.id]: { active: false, start: '09:00', end: '17:00' },
      }),
      {}
    );

    initialData.forEach((avail) => {
      defaultSchedule[avail.dayOfWeek] = {
        active: true,
        start: minutesToTime(avail.startMinutes),
        end: minutesToTime(avail.endMinutes),
      };
    });

    return defaultSchedule;
  });

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId]!, active: !prev[dayId]!.active },
    }));
  };

  const updateTime = (dayId: string, field: 'start' | 'end', value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId]!, [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = Object.entries(schedule)
      .filter(([_, data]) => data.active)
      .map(([dayOfWeek, data]) => {
        const startMins = timeToMinutes(data.start);
        let endMins = timeToMinutes(data.end);

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
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-xl border bg-card shadow-sm space-y-5 max-w-full overflow-hidden">
      {message && (
        <div
          className={`p-3.5 rounded-md text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Barre de réglage du crantage horaire */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 p-3 rounded-lg border border-border/60">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
          <SlidersHorizontal className="size-4 shrink-0" />
          <span>Précision des créneaux :</span>
        </div>
        <div className="flex items-center gap-1 bg-background p-1 rounded-md border">
          {STEP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStep(opt.value)}
              className={`px-2 py-1 text-xs rounded transition-colors font-medium ${
                step === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des jours responsive */}
      <div className="divide-y border rounded-lg overflow-hidden">
        {DAYS.map((day) => {
          const dayData = schedule[day.id]!;
          const isActive = dayData.active;

          return (
            <div
              key={day.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 transition-colors ${
                isActive ? 'bg-background' : 'bg-muted/30'
              }`}
            >
              {/* Ligne du haut sur mobile : Checkbox + Jour + Badge "Non disponible" si inactif */}
              <div className="flex items-center justify-between sm:w-auto">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleDay(day.id)}
                    className="size-5 shrink-0 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  />
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {day.label}
                  </span>
                </label>

                {!isActive && (
                  <span className="text-xs sm:text-sm text-muted-foreground italic sm:hidden">
                    Non disponible
                  </span>
                )}
              </div>

              {/* Sélecteurs d'heures : passent en pleine largeur sous le jour sur mobile, alignés à droite sur PC */}
              {isActive ? (
                <div className="flex items-center gap-2 sm:gap-3 pl-8 sm:pl-0 w-full sm:w-auto">
                  <Clock className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                  <SteppedTimeSelect
                    value={dayData.start}
                    onChange={(val) => updateTime(day.id, 'start', val)}
                    step={step}
                    timeSlots={timeSlots}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground shrink-0">à</span>
                  <SteppedTimeSelect
                    value={dayData.end}
                    onChange={(val) => updateTime(day.id, 'end', val)}
                    step={step}
                    timeSlots={timeSlots}
                  />
                </div>
              ) : (
                <div className="hidden sm:block text-sm text-muted-foreground italic">
                  Non disponible
                </div>
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