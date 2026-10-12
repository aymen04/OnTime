'use client';

import * as React from 'react';
import { useTransition } from 'react';

// On importe le bouton de ton design system
import { Button } from '@workspace/ui/components/button';

import { approveSwapRequest } from '../../../../../actions/shift-swap/approve-swap-request';
import { rejectSwapRequest } from '../../../../../actions/shift-swap/reject-swap-request';

export function ManagerSwapView({ requests }: { requests: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (requestId: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      try {
        if (action === 'approve') {
          await approveSwapRequest({ requestId });
        } else {
          await rejectSwapRequest({ requestId });
        }
        window.location.reload();
      } catch (error) {
        console.error("Erreur lors de l'action", error);
        alert('Une erreur est survenue.');
      }
    });
  };

  if (requests.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aucune demande en attente d'approbation.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div>
            <p className="font-medium">
              {req.requester.name} souhaite donner son shift à{' '}
              {req.targetEmployee.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Shift du {new Date(req.shift.startTime).toLocaleDateString()} ({' '}
              {new Date(req.shift.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}{' '}
              -{' '}
              {new Date(req.shift.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}{' '}
              )
            </p>
            {req.message && (
              <p className="text-sm italic mt-1 text-muted-foreground">
                "{req.message}"
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleAction(req.id, 'reject')}
              disabled={isPending}
            >
              Refuser
            </Button>
            <Button
              variant="default"
              onClick={() => handleAction(req.id, 'approve')}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approuver
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
