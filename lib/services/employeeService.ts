import { supabase } from '@/lib/supabase';
import { hoursBetween, startOfWeek } from '@/lib/time';
import type { Profile, Shift } from '@/lib/types';

export async function listCompanyEmployees(companyId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('company_id', companyId)
    .order('full_name');
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function setEmployeeActive(userId: string, isActive: boolean) {
  const { error } = await supabase.from('users').update({ is_active: isActive }).eq('id', userId);
  if (error) throw error;
}

export function employeeHoursThisWeek(shifts: Shift[]) {
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return shifts
    .filter((shift) => {
      const t = new Date(shift.start_time);
      return t >= start && t < end;
    })
    .reduce((sum, shift) => sum + hoursBetween(shift.start_time, shift.end_time), 0);
}

export function nextShift(shifts: Shift[]) {
  const now = Date.now();
  return shifts
    .filter((shift) => new Date(shift.end_time).getTime() >= now)
    .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time))[0];
}
