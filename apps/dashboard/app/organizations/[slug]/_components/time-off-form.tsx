'use client';

import { useState, useTransition } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { submitTimeOffRequest } from '../../../../actions/time-off/time-off-actions';

export function TimeOffForm({ orgId }: { orgId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const reason = formData.get('reason') as string;

    startTransition(async () => {
      const result = await submitTimeOffRequest(orgId, startDate, endDate, reason);
      if (result && result.success) {
        setMessage({ text: "Demande envoyée avec succès au manager ! ", type: 'success' });
        (e.target as HTMLFormElement).reset();
      } else {
        setMessage({ text: "Erreur : " + result?.error, type: 'error' });
      }
    });
  };

  return (
    <div className="mt-8 p-6 bg-card border rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg mb-4 text-primary">Demander des congés</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Date de début</label>
            <Input type="date" name="startDate" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Date de fin</label>
            <Input type="date" name="endDate" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Motif (Optionnel)</label>
          <Input type="text" name="reason" placeholder="Vacances, RDV médical, Maladie..." />
        </div>
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? 'Envoi...' : 'Soumettre la demande'}
        </Button>
        {message && (
          <p className={`text-sm mt-2 font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}