'use client';

import { useState, useEffect } from 'react';
import { getEmployeeHours } from '~/actions/time-tracking/timesheet-actions'; 
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { SearchIcon, DownloadIcon } from 'lucide-react';

export function TimesheetTable({ orgId }: { orgId: string }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [data, setData] = useState<{ id: string; name: string; totalHours: number; shiftCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHours = async () => {
    setIsLoading(true);
    try {
      const results = await getEmployeeHours(orgId, startDate, endDate);
      setData(results);
    } catch (error) {
      console.error("Erreur:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHours();
  }, [orgId]);

  const handleExportCSV = () => {
    if (data.length === 0) return;

    // 1. Ajout de la période en haut du fichier Excel
    const titleRow = `"Rapport d'heures : du ${startDate} au ${endDate}"\n\n`;
    
    // 2. Définir les en-têtes des colonnes
    const headers = ['Employé', 'Shifts effectués', 'Total Heures'];
    
    // 3. Transformer les données
    const csvRows = data.map(row => `"${row.name}",${row.shiftCount},${row.totalHours}`);
    
    // 4. Assembler le tout (Titre + En-têtes + Données)
    const csvContent = '\uFEFF' + titleRow + [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `heures_equipe_${startDate}_au_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mt-8 border border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Rapport d'heures par employé</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Filtrez les heures travaillées pour exporter ou préparer la paie.</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCSV} 
          disabled={data.length === 0 || isLoading}
          className="flex items-center gap-2"
        >
          <DownloadIcon className="size-4" />
          Exporter CSV
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-muted/30 rounded-lg mt-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block">Du</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">Au</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />
          </div>
          <Button onClick={fetchHours} disabled={isLoading} className="flex items-center gap-2">
            <SearchIcon className="size-4" />
            {isLoading ? "Calcul..." : "Filtrer"}
          </Button>
        </div>

        <div className="rounded-md border">
          {data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Aucun shift trouvé sur cette période.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Employé</th>
                  <th className="text-center p-3 font-medium">Shifts effectués</th>
                  <th className="text-right p-3 font-medium">Total Heures</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-medium">{row.name}</td>
                    <td className="p-3 text-center text-muted-foreground">{row.shiftCount}</td>
                    <td className="p-3 text-right font-bold">{row.totalHours} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}