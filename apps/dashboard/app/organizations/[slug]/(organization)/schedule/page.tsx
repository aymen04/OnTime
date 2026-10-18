import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import { startOfWeek, endOfWeek, addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import { Page, PageBody, PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@workspace/ui/components/dropdown-menu';

// Assure-toi que le chemin d'import correspond à l'endroit où tu as sauvegardé le composant
import { CreateShiftForm } from './_components/create-shift-form'; 

export default async function SchedulePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true, employees: { select: { id: true, name: true, email: true } } }
  });

  if (!organization) notFound();

  const role = await getCurrentWorkRole(organization.id, session.user.id);
  if (role?.name !== 'manager') redirect(`/organizations/${params.slug}/home`);

  // 1. Calcul des dates de la semaine en cours (Lundi -> Dimanche)
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });

  // 2. Récupération de tous les shifts de la semaine
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: organization.id,
      startTime: { gte: start, lte: end }
    },
    include: { employee: true },
    orderBy: { startTime: 'asc' }
  });

  // 3. Groupement des shifts par jour de la semaine
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const currentDate = addDays(start, i);
    return {
      date: currentDate,
      shifts: weeklyShifts.filter(shift => isSameDay(new Date(shift.startTime), currentDate))
    };
  });

  return (
    <Page>
      <PageHeader>
        <PagePrimaryBar>
          <OrganizationPageTitle
            title="Planificateur de la semaine"
            info={`Semaine du ${format(start, 'd MMMM', { locale: fr })} au ${format(end, 'd MMMM', { locale: fr })}`}
          />
        </PagePrimaryBar>
      </PageHeader>
      
      <PageBody>
        <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : Formulaire de création */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CreateShiftForm orgId={organization.id} employees={organization.employees} />
            </div>
          </div>

          {/* COLONNE DROITE : La semaine complète */}
          <div className="lg:col-span-2 space-y-6">
            {daysOfWeek.map((day) => (
              <div key={day.date.toISOString()} className="p-6 rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="font-semibold text-lg capitalize text-primary">
                    {format(day.date, 'EEEE d MMMM', { locale: fr })}
                  </h3>
                  <span className="text-sm font-medium bg-muted px-2.5 py-0.5 rounded-full">
                    {day.shifts.length} shift{day.shifts.length > 1 ? 's' : ''}
                  </span>
                </div>

                {day.shifts.length > 0 ? (
                  <div className="divide-y">
                    {day.shifts.map((shift) => (
                      <div key={shift.id} className="py-3 flex justify-between items-center hover:bg-muted/30 px-2 -mx-2 rounded-lg transition-colors">
                        <div>
                          <p className="font-medium">{shift.employee.name || shift.employee.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* MENU D'ACTIONS DU MANAGER */}
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md transition-colors outline-none cursor-pointer">
                              <MoreHorizontal className="size-5 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 size-4" /> Modifier l'horaire
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <UserPlus className="mr-2 size-4" /> Réassigner
                              </DropdownMenuItem>
                              
                              {/* Action de suppression */}
                              <form action={async () => {
                                "use server";
                                const { deleteShift } = await import('~/actions/schedule/delete-shift');
                                await deleteShift(organization.id, shift.id);
                              }}>
                                <button type="submit" className="w-full flex items-center text-left">
                                  <DropdownMenuItem className="w-full cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30">
                                    <Trash2 className="mr-2 size-4" /> Supprimer
                                  </DropdownMenuItem>
                                </button>
                              </form>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-2">Aucun shift prévu ce jour-là.</p>
                )}
              </div>
            ))}
          </div>

        </div>
      </PageBody>
    </Page>
  );
}