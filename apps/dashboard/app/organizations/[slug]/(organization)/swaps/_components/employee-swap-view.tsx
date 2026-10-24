'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { createSwapRequest } from '../../../../../../actions/shift-swap/create-swap-request';
import { respondSwapRequest } from '../../../../../../actions/shift-swap/respond-swap-request-schema';

import { Button } from '@workspace/ui/components/button';

export function EmployeeSwapView({ futureShifts, coworkers, sentRequests, receivedRequests }: any) {
  const [isPending, startTransition] = useTransition();
  const [shiftId, setShiftId] = useState('');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createSwapRequest({ shiftId, targetEmployeeId, message });
        setShiftId('');
        setTargetEmployeeId('');
        setMessage('');
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la création de la demande.");
      }
    });
  };

  const handleResponse = (requestId: string, accept: boolean) => {
    startTransition(async () => {
      try {
        await respondSwapRequest({ requestId, accept });
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la réponse.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING_EMPLOYEE': return <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs px-2.5 py-1 rounded-full font-medium border border-yellow-500/20">En attente du collègue</span>;
      case 'PENDING_MANAGER': return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-500/20">En attente du manager</span>;
      case 'APPROVED': return <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs px-2.5 py-1 rounded-full font-medium border border-green-500/20">Approuvé</span>;
      case 'REJECTED': return <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2.5 py-1 rounded-full font-medium border border-red-500/20">Refusé</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Formulaire de proposition */}
      <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
        <h2 className="text-xl font-semibold mb-6 tracking-tight">Proposer un échange</h2>
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Mon shift à échanger</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={shiftId} 
              onChange={(e) => setShiftId(e.target.value)} 
              required
            >
              <option value="">-- Choisir mon shift --</option>
              {futureShifts.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.startTime).toLocaleDateString()} ({new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Collègue remplaçant</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={targetEmployeeId} 
              onChange={(e) => setTargetEmployeeId(e.target.value)} 
              required
            >
              <option value="">-- Choisir un collègue --</option>
              {coworkers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Message (optionnel)</label>
            <input 
              type="text" 
              placeholder="Ex: Salut, peux-tu me dépanner ce jour-là ?" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !shiftId || !targetEmployeeId}
            className="w-fit mt-2"
          >
            {isPending ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 2. Demandes reçues */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Demandes reçues</h2>
          {receivedRequests.length === 0 && <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-dashed">Aucune demande reçue.</p>}
          {receivedRequests.map((req: any) => (
            <div key={req.id} className="p-5 border rounded-xl bg-card shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{req.requester.name}</p>
                  <p className="text-sm text-muted-foreground">Propose son shift du {new Date(req.shift.startTime).toLocaleDateString()}</p>
                </div>
                {req.status !== 'PENDING_EMPLOYEE' && getStatusBadge(req.status)}
              </div>
              
              {req.message && <p className="text-sm italic text-muted-foreground bg-muted/50 p-2 rounded-md">"{req.message}"</p>}
              
              {req.status === 'PENDING_EMPLOYEE' && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleResponse(req.id, false)} disabled={isPending}>Refuser</Button>
                  <Button size="sm" onClick={() => handleResponse(req.id, true)} disabled={isPending}>Accepter</Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. Demandes envoyées */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Demandes envoyées</h2>
          {sentRequests.length === 0 && <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-dashed">Aucune demande envoyée.</p>}
          {sentRequests.map((req: any) => (
            <div key={req.id} className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold text-sm">Vers : {req.targetEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(req.shift.startTime).toLocaleDateString()}</p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}