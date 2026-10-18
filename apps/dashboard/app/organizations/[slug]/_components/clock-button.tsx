'use client';

import { useState, useTransition } from 'react';
import { Button } from '@workspace/ui/components/button';
import { LogInIcon, LogOutIcon, MapPinIcon, CalendarIcon } from 'lucide-react';
import { isToday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
        const result = await clockOut(orgId, activeTimeEntry.id, coords.lat, coords.lng);
        if (result?.error) setErrorMsg(result.error);
      });
    } catch (err: any) {
      setIsLoadingGPS(false);
      setErrorMsg(err.message);
    }
  };

  const isWorking = isPending || isLoadingGPS;

  // VERIFICATION DE LA DATE DU SHIFT
  // ⚠️ Remplace "startTime" par le vrai nom de ta colonne (ex: "start", "startAt") si besoin
  const shiftDate = nextShift ? new Date(nextShift.startTime) : null; 
  const isShiftToday = shiftDate ? isToday(shiftDate) : false;

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

  // CAS 2 : Pas de pointage en cours -> Bouton VERT (Arrivée) ou GRIS (Futur)
  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <Button 
        size="lg" 
        className={`rounded-full px-8 shadow-lg ${
          isShiftToday 
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        onClick={handleClockIn}
        disabled={isWorking || !nextShift || !isShiftToday}
      >
        {isLoadingGPS ? (
          <MapPinIcon className="mr-2 size-5 animate-bounce" />
        ) : isShiftToday ? (
          <LogInIcon className="mr-2 size-5" />
        ) : (
          <CalendarIcon className="mr-2 size-5" />
        )}
        
        {isLoadingGPS 
          ? 'Localisation...' 
          : isPending 
          ? 'Enregistrement...' 
          : isShiftToday 
          ? 'Pointer mon arrivée' 
          : shiftDate 
          ? `Shift prévu le ${format(shiftDate, 'dd MMM', { locale: fr })}` 
          : 'Aucun shift'}
      </Button>
      {errorMsg && <p className="text-sm font-medium text-red-600 mt-1">{errorMsg}</p>}
    </div>
  );
}