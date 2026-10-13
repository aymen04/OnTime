'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { clockIn, clockOut } from '../../../../actions/time-tracking/time-clock';
import { Button } from '@workspace/ui/components/button';

export function ClockButton({ 
  orgId, 
  nextShift, 
  activeTimeEntry 
}: { 
  orgId: string; 
  nextShift: any; 
  activeTimeEntry: any; 
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fonction pour obtenir les coordonnées GPS du navigateur
  const getPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas supportée par votre appareil."));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
    });
  };

  const handleClockIn = async () => {
    if (!nextShift) return;
    setErrorMsg(null);
    
    try {
      const position = await getPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      startTransition(async () => {
        const result = await clockIn(orgId, nextShift.id, lat, lng);
        if (result && !result.success) setErrorMsg("Erreur système: " + result.error);
      });
    } catch (err: any) {
      setErrorMsg("Veuillez autoriser l'accès à votre position pour pointer.");
    }
  };

  const handleClockOut = async () => {
    if (!activeTimeEntry) return;
    setErrorMsg(null);

    try {
      const position = await getPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      startTransition(async () => {
        const result = await clockOut(orgId, activeTimeEntry.id, lat, lng);
        if (result && !result.success) setErrorMsg("Erreur système: " + result.error);
      });
    } catch (err: any) {
      setErrorMsg("Veuillez autoriser l'accès à votre position pour terminer votre shift.");
    }
  };

  if (activeTimeEntry) {
    return (
      <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">Shift en cours ⏱️</p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80">
              Pointé à {new Date(activeTimeEntry.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
        </div>
        
        {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}
        
        <Button 
          variant="destructive" 
          onClick={handleClockOut} 
          disabled={isPending}
          className="w-full font-bold shadow-sm"
        >
          {isPending ? 'Localisation en cours...' : 'Pointer mon départ'}
        </Button>
      </div>
    );
  }

  const isShiftToday = nextShift && new Date(nextShift.startTime).toDateString() === new Date().toDateString();

  if (isShiftToday) {
    return (
      <div className="mt-6 flex flex-col gap-2">
        {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}
        <Button 
          onClick={handleClockIn} 
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-md h-12 text-md"
        >
          {isPending ? 'Localisation en cours...' : 'Pointer mon arrivée'}
        </Button>
      </div>
    );
  }

  return null;
}