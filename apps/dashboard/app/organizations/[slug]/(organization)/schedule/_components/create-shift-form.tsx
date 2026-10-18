'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
// ⚠️ Assure-toi que le chemin d'import correspond bien à ta structure
import { createShift } from '../../../../../../actions/schedule/create-shift'; 
import { Button } from '@workspace/ui/components/button';
import { CalendarIcon, ClockIcon } from 'lucide-react';

export function CreateShiftForm({ orgId, employees }: { orgId: string, employees: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // États pour séparer la Date et les Heures (Beaucoup plus intuitif pour l'utilisateur)
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);

    // On combine la date et l'heure au format ISO attendu par le serveur
    formData.set('startTime', `${date}T${startTime}`);
    formData.set('endTime', `${date}T${endTime}`);
    
    // Ajout automatique du fuseau horaire du Manager
    formData.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    startTransition(async () => {
      const result = await createShift(orgId, formData);
      
      if (result && !result.success) {
        setError(result.error || "Une erreur est survenue");
      } else {
        // Succès : on vide les champs
        setDate('');
        setStartTime('09:00');
        setEndTime('17:00');
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 border rounded-xl bg-card shadow-sm">
      <div className="border-b pb-4">
        <h3 className="font-semibold text-lg tracking-tight">Assigner un nouveau shift</h3>
        <p className="text-sm text-muted-foreground mt-1">Planifiez les horaires de votre équipe.</p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* 1. Sélection de l'employé */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Employé</label>
        <select 
          name="employeeId" 
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">-- Sélectionner un employé --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>
          ))}
        </select>
      </div>

      {/* 2. Sélection de la Date */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" /> Date du shift
        </label>
        <input 
          type="date" 
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* 3. Sélection des Heures */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ClockIcon className="size-4 text-muted-foreground" /> Heure de début
          </label>
          <input 
            type="time" 
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ClockIcon className="size-4 text-muted-foreground" /> Heure de fin
          </label>
          <input 
            type="time" 
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending || !date} className="mt-4 w-full">
        {isPending ? 'Création en cours...' : 'Planifier le shift'}
      </Button>
    </form>
  );
}