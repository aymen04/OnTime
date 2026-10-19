'use client';

import * as React from 'react';
import { useState, useTransition, useRef, useMemo } from 'react';
import { createShift } from '~/actions/schedule/create-shift';
import { Button } from '@workspace/ui/components/button';
import { CalendarIcon, ClockIcon, UserIcon, InfoIcon } from 'lucide-react';
import { getDay } from 'date-fns';

const JS_DAY_TO_PRISMA = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

const formatMinutes = (mins: number) => {
  if (mins === 1440) return '00:00';
  return `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
};

export function CreateShiftForm({ orgId, employees }: { orgId: string, employees: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // État local pour réagir en direct aux choix du manager
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Calcul en direct de la disponibilité
  const currentAvailability = useMemo(() => {
    if (!selectedEmpId || !selectedDate) return null;
    
    const dateObj = new Date(`${selectedDate}T12:00:00`); // Midi pour éviter les décalages horaires
    const dayOfWeek = JS_DAY_TO_PRISMA[getDay(dateObj)];
    
    const employee = employees.find(e => e.id === selectedEmpId);
    if (!employee) return null;

    const avail = employee.availabilities.find((a: any) => a.dayOfWeek === dayOfWeek);
    
    if (!avail) return { status: 'unavailable', message: " Non disponible ce jour-là" };
    return { 
      status: 'available', 
      message: ` Dispo : ${formatMinutes(avail.startMinutes)} à ${formatMinutes(avail.endMinutes)}`
    };
  }, [selectedEmpId, selectedDate, employees]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createShift(orgId, formData);
      
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess("Shift ajouté avec succès !");
        formRef.current?.reset();
        setSelectedEmpId(''); // On reset aussi nos variables locales
        setSelectedDate('');
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  };

  return (
    <div className="p-6 rounded-xl border bg-card shadow-sm">
      <h3 className="font-semibold tracking-tight text-lg mb-4">Planifier un shift</h3>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">⚠️ {error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">✅ {success}</div>}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Employé</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <select 
              name="employeeId" 
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full h-9 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">-- Sélectionner --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input 
              type="date" 
              name="date" 
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-9 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* L'INDICE VISUEL APPARAÎT ICI */}
        {currentAvailability && (
          <div className={`flex items-center gap-2 text-sm p-2 rounded border ${currentAvailability.status === 'available' ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-red-50/50 border-red-100 text-red-700'}`}>
            <InfoIcon className="size-4" />
            <span className="font-medium">{currentAvailability.message}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Début</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input type="time" name="startTime" required className="w-full h-9 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fin</label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input type="time" name="endTime" required className="w-full h-9 pl-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending || currentAvailability?.status === 'unavailable'} className="w-full mt-2">
          {isPending ? 'Vérification...' : 'Planifier'}
        </Button>
      </form>
    </div>
  );
}