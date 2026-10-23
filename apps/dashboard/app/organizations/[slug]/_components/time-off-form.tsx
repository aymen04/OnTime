'use client';

import { useState, useTransition } from 'react';
// 1. ON IMPORTE USEPARAMS ICI 👇
import { useParams } from 'next/navigation';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { CalendarPlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { submitTimeOffRequest } from '../../../../actions/time-off/time-off-actions';

export function TimeOffForm({ orgId }: { orgId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // 2. ON RÉCUPÈRE LE SLUG DE L'URL 👇
  const params = useParams();
  const slug = params.slug as string;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const reason = formData.get('reason') as string;

    startTransition(async () => {
      // 3. ON RAJOUTE LE SLUG EN DEUXIÈME POSITION ICI 👇
      const result = await submitTimeOffRequest(orgId, slug, startDate, endDate, reason);
      if (result && result.success) {
        setMessage({ text: "Demande envoyée avec succès !", type: 'success' });
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ text: "Erreur : " + result?.error, type: 'error' });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <CalendarPlusIcon className="size-4" />
          Faire une demande
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Demander des congés</DialogTitle>
          <DialogDescription>
            Soumettez vos dates d'absence pour validation par votre manager.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Début</label>
              <Input type="date" name="startDate" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Fin</label>
              <Input type="date" name="endDate" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Motif (Optionnel)</label>
            <Input type="text" name="reason" placeholder="Vacances, RDV médical..." />
          </div>
          <Button type="submit" disabled={isPending} className="w-full mt-2">
            {isPending ? 'Envoi en cours...' : 'Soumettre la demande'}
          </Button>
          {message && (
            <p className={`text-sm mt-2 text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}