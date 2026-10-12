'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { createSwapRequest } from '~/actions/shift-swap/create-swap-request';
import { respondSwapRequest } from '~/actions/shift-swap/respond-swap-request-schema';

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
      case 'PENDING_EMPLOYEE': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">En attente du collègue</span>;
      case 'PENDING_MANAGER': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">En attente du manager</span>;
      case 'APPROVED': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approuvé</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Refusé</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Formulaire de proposition */}
      <div className="p-4 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-4">Proposer un échange</h2>
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
          <select 
            className="border p-2 rounded bg-background"
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

          <select 
            className="border p-2 rounded bg-background"
            value={targetEmployeeId} 
            onChange={(e) => setTargetEmployeeId(e.target.value)} 
            required
          >
            <option value="">-- Choisir un collègue --</option>
            {coworkers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input 
            type="text" 
            placeholder="Message optionnel..." 
            className="border p-2 rounded bg-background"
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />

          <button 
            type="submit" 
            disabled={isPending || !shiftId || !targetEmployeeId}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md disabled:opacity-50 font-medium w-fit"
          >
            {isPending ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 2. Demandes reçues */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Demandes reçues</h2>
          <div className="space-y-4">
            {receivedRequests.length === 0 && <p className="text-sm text-muted-foreground">Aucune demande reçue.</p>}
            {receivedRequests.map((req: any) => (
              <div key={req.id} className="p-4 border rounded-lg bg-card space-y-2">
                <p className="font-medium text-sm">De : {req.requester.name}</p>
                <p className="text-sm text-muted-foreground">Shift : {new Date(req.shift.startTime).toLocaleDateString()}</p>
                {req.message && <p className="text-sm italic">"{req.message}"</p>}
                
                {req.status === 'PENDING_EMPLOYEE' ? (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleResponse(req.id, false)} disabled={isPending} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">Refuser</button>
                    <button onClick={() => handleResponse(req.id, true)} disabled={isPending} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Accepter</button>
                  </div>
                ) : (
                  <div className="mt-2">{getStatusBadge(req.status)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Demandes envoyées */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Demandes envoyées</h2>
          <div className="space-y-4">
            {sentRequests.length === 0 && <p className="text-sm text-muted-foreground">Aucune demande envoyée.</p>}
            {sentRequests.map((req: any) => (
              <div key={req.id} className="p-4 border rounded-lg bg-card flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Vers : {req.targetEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(req.shift.startTime).toLocaleDateString()}</p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}