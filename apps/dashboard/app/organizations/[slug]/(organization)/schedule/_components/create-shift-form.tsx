'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { createShift } from '../../../../../../actions/schedule/create-shift';
import { Button } from '@workspace/ui/components/button';

export function CreateShiftForm({ orgId, employees }: { orgId: string, employees: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      // On appelle la Server Action avec l'ID de l'organisation et les données
      const result = await createShift(orgId, formData);
      
      if (result && !result.success) {
        setError(result.error || "Une erreur est survenue");
      } else {
        // Succès : on vide le formulaire (tu peux aussi ajouter un Toast ici plus tard)
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded-xl bg-card shadow-sm">
      <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
      <h3 className="font-semibold text-lg tracking-tight mb-2">Assigner un nouveau shift</h3>
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Début du shift</label>
          <input 
            type="datetime-local" 
            name="startTime" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Fin du shift</label>
          <input 
            type="datetime-local" 
            name="endTime" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full md:w-auto md:self-end">
        {isPending ? 'Création...' : 'Créer le shift'}
      </Button>
    </form>
  );
}