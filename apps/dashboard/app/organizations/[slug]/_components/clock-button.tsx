'use client';

import { useState, useTransition } from 'react';
import { Button } from '@workspace/ui/components/button';
import { LogInIcon, LogOutIcon, MapPinIcon } from 'lucide-react';

// ⚠️ Assure-toi que ce chemin correspond à l'endroit où tu as sauvegardé ton fichier d'actions
import { clockIn, clockOut } from '../../../../actions/time-tracking/time-clock';

export function ClockButton({ orgId, nextShift, activeTimeEntry }: { orgId: string, nextShift: any, activeTimeEntry: any }) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fonction utilitaire pour récupérer le GPS côté client
  const getCoordinates = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas supportée."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (error) => reject(new Error("Veuillez autoriser l'accès à votre position GPS pour pointer."))
        );
      }
    });
  };

  const handleClockIn = async () => {
    setErrorMsg(null);
    setIsLoadingGPS(true);
    
    try {
      const coords = await getCoordinates();
      setIsLoadingGPS(false);
      
      startTransition(async () => {
        // nextShift.id est requis selon ta nouvelle Server Action
        const result = await clockIn(orgId, nextShift.id, coords.lat, coords.lng);
        if (result?.error) setErrorMsg(result.error);
      });
    } catch (err: any) {
      setIsLoadingGPS(false);
      setErrorMsg(err.message);
    }
  };

  const handleClockOut = async () => {
    setErrorMsg(null);
    setIsLoadingGPS(true);
    
    try {
      const coords = await getCoordinates();
      setIsLoadingGPS(false);
      
      startTransition(async () => {
        // activeTimeEntry.id est requis selon ta nouvelle Server Action
        const result = await clockOut(orgId, activeTimeEntry.id, coords.lat, coords.lng);
        if (result?.error) setErrorMsg(result.error);
      });
    } catch (err: any) {
      setIsLoadingGPS(false);
      setErrorMsg(err.message);
    }
  };

  const isWorking = isPending || isLoadingGPS;

  // CAS 1 : L'employé a un pointage ouvert -> Bouton ROUGE (Départ)
  if (activeTimeEntry) {
    return (
      <div className="flex flex-col items-start gap-2 mt-4">
        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          En poste actuellement
        </span>
        <Button 
          size="lg" 
          variant="destructive" 
          className="rounded-full px-8 shadow-lg shadow-red-900/20"
          onClick={handleClockOut}
          disabled={isWorking}
        >
          {isLoadingGPS ? <MapPinIcon className="mr-2 size-5 animate-bounce" /> : <LogOutIcon className="mr-2 size-5" />}
          {isLoadingGPS ? 'Localisation...' : isPending ? 'Enregistrement...' : 'Pointer mon départ'}
        </Button>
        {errorMsg && <p className="text-sm font-medium text-red-600 mt-1">{errorMsg}</p>}
      </div>
    );
  }

  // CAS 2 : Pas de pointage en cours -> Bouton VERT (Arrivée)
  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <Button 
        size="lg" 
        className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
        onClick={handleClockIn}
        disabled={isWorking || !nextShift}
      >
        {isLoadingGPS ? <MapPinIcon className="mr-2 size-5 animate-bounce" /> : <LogInIcon className="mr-2 size-5" />}
        {isLoadingGPS ? 'Localisation...' : isPending ? 'Enregistrement...' : 'Pointer mon arrivée'}
      </Button>
      {errorMsg && <p className="text-sm font-medium text-red-600 mt-1">{errorMsg}</p>}
    </div>
  );
}