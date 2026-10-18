import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { startOfDay, endOfDay, addDays, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

import { auth } from '@workspace/auth';
import { prisma } from '@workspace/database/client';
import { getCurrentWorkRole } from '@workspace/auth/work-role';

import { Page, PageBody, PageHeader, PagePrimaryBar } from '@workspace/ui/components/page';
import { buttonVariants } from '@workspace/ui/components/button';
import { OrganizationPageTitle } from '~/components/organizations/slug/organization-page-title';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu';

import { CreateShiftForm } from './_components/create-shift-form';

export default async function SchedulePage(props: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string }>; // <-- NOUVEAU : Lecture de l'URL
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { 
      id: true, 
      memberships: { select: { user: { select: { id: true, name: true, email: true } } } } 
    }
  });

  if (!organization) notFound();

  const role = await getCurrentWorkRole(organization.id, session.user.id);
  if (role?.name !== 'manager') redirect(`/organizations/${params.slug}/home`);

  const employeesList = organization.memberships.map((m) => m.user);

  // 1. LOGIQUE DE NAVIGATION TEMP🔴RELLE (7 Jours Glissants)
  // Si l'URL contient "?start=2026-10-20", on utilise cette date, sinon on prend Aujourd'hui.
  const baseDate = searchParams.start ? new Date(searchParams.start) : new Date();
  
  const start = startOfDay(baseDate);
  const end = endOfDay(addDays(start, 6)); // 7 jours à partir de la date de base

  // Calcul des liens de navigation
  const prevPeriod = format(addDays(start, -7), 'yyyy-MM-dd');
  const nextPeriod = format(addDays(start, 7), 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // 2. Récupération des shifts sur cette période précise
  const weeklyShifts = await prisma.shift.findMany({
    where: {
      organizationId: organization.id,
      startTime: { gte: start, lte: end }
    },
    include: { employee: true },
    orderBy: { startTime: 'asc' }
  });

  // 3. Groupement des shifts par jour
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
            title="Planificateur"
            info={`${format(start, 'd MMMM', { locale: fr })} - ${format(end, 'd MMMM yyyy', { locale: fr })}`}
          />
          
          {/* BARRE DE NAVIGATION TEMP🔴RELLE */}
          <div className="flex items-center gap-2">
            <Link 
              href={`/organizations/${params.slug}/schedule?start=${prevPeriod}`} 
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
            >
              <ChevronLeft className="size-4" />
            </Link>
            
            <Link 
              href={`/organizations/${params.slug}/schedule?start=${todayStr}`} 
              className={buttonVariants({ variant: 'outline' })}
            >
              <CalendarDays className="mr-2 size-4" /> Aujourd'hui
            </Link>
            
            <Link 
              href={`/organizations/${params.slug}/schedule?start=${nextPeriod}`} 
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </PagePrimaryBar>
      </PageHeader>
      
      <PageBody>
        <div className="mx-auto max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CreateShiftForm orgId={organization.id} employees={employeesList} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {daysOfWeek.map((day) => {
              const isToday = isSameDay(day.date, new Date());
              return (
                <div key={day.date.toISOString()} className={`p-6 rounded-xl border bg-card shadow-sm ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h3 className={`font-semibold text-lg capitalize ${isToday ? 'text-primary' : ''}`}>
                      {format(day.date, 'EEEE d MMMM', { locale: fr })} {isToday && '(Aujourd\'hui)'}
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
                            <DropdownMenu>
                              <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md transition-colors outline-none cursor-pointer">
                                <MoreHorizontal className="size-5 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="mr-2 size-4" /> Modifier l'horaire
                                </DropdownMenuItem>
                                <form action={async () => {
                                  "use server";
                                  const { deleteShift } = await import('~/actions/schedule/delete-shift');
                                  await deleteShift(organization.id, shift.id);
                                }}>
                                  <button type="submit" className="w-full flex items-center text-left">
                                    <DropdownMenuItem className="w-full cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100">
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
                    <p className="text-sm text-muted-foreground italic py-2">Aucun shift prévu.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageBody>
    </Page>
  );
}