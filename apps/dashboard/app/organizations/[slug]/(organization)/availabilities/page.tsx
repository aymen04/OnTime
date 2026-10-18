'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { updateAvailabilities } from '~/actions/schedule/update-availability';
import { Page, PageBody, PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { Button } from '@workspace/ui/components/button';
import { Clock } from 'lucide-react';

// Helpers pour convertir HH:MM en minutes et inversement
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const minutesToTime = (mins: number) => {
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

export default function AvailabilitiesPage({ params }: { params: { slug: string, orgId: string } }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // État local pour le formulaire
  const [schedule, setSchedule] = useState<Record<string, { active: boolean; start: string; end: string }>>(
    DAYS.reduce((acc, day) => ({ ...acc, [day.id]: { active: false, start: '09:00', end: '17:00' } }), {})
  );

  const toggleDay = (dayId: string) => {
    setSchedule(prev => ({ ...prev, [dayId]: { ...prev[dayId], active: !prev[dayId].active } }));
  };

  const updateTime = (dayId: string, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({ ...prev, [dayId]: { ...prev[dayId], [field]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Formatage des données pour l'action serveur (uniquement les jours actifs)
    const payload = Object.entries(schedule)
      .filter(([_, data]) => data.active)
      .map(([dayOfWeek, data]) => ({
        dayOfWeek,
        startMinutes: timeToMinutes(data.start),
        endMinutes: timeToMinutes(data.end),
      }));

    startTransition(async () => {
      // NOTE: En production, passe le vrai orgId via les props du Server Component parent
      const result = await updateAvailabilities(params.orgId || "ID_A_REMPLACER", payload);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Vos disponibilités ont été mises à jour.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur inconnue.' });
      }
    });
  };

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle title="Mes disponibilités" info="Indiquez vos horaires habituels de travail" />
        </PagePrimaryBar>
      </PageHeader>
      
      <PageBody>
        <div className="mx-auto max-w-3xl p-6">
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
                        className="size-5 rounded border-input text-primary focus:ring-primary"
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
        </div>
      </PageBody>
    </Page>
  );
}