'use client';

import { useState } from 'react';
import { PartyPopperIcon, XIcon } from 'lucide-react';

// On utilise "requests = []" par défaut pour que .find() ne plante jamais si la donnée est vide ou mal passée
export function EmployeeNotificationBanner({ requests = [] }: { requests?: any[] }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Sécurité supplémentaire : on s'assure que c'est bien un tableau
  if (!Array.isArray(requests)) return null;

  const now = new Date();
  const recentApprovedRequest = requests.find(req => 
    req.status === 'approved' && new Date(req.endDate) >= now
  );

  if (!recentApprovedRequest || !isVisible) return null;

  return (
    <div className="mb-6 flex items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20 text-green-800 dark:text-green-300 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
          <PartyPopperIcon className="size-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">Bonne nouvelle !</p>
          <p className="text-sm mt-0.5 opacity-90">
            Vos congés du {new Date(recentApprovedRequest.startDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} au {new Date(recentApprovedRequest.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} ont été approuvés par votre manager.
          </p>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="p-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors shrink-0"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}