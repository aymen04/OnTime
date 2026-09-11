import { supabase } from '@/lib/supabase';
import type { Availability } from '@/lib/types';

export async function listAvailability(employeeId: string) {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('employee_id', employeeId)
    .order('day_of_week')
    .order('start_minutes');
  if (error) throw error;
  return (data ?? []) as Availability[];
}

export async function listCompanyAvailability(companyId: string) {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('company_id', companyId)
    .order('day_of_week');
  if (error) throw error;
  return (data ?? []) as Availability[];
}

export async function createAvailability(row: Omit<Availability, 'id'>) {
  const { data, error } = await supabase.from('availability').insert(row).select('*').single();
  if (error) throw error;
  return data as Availability;
}

export async function deleteAvailability(id: string) {
  const { error } = await supabase.from('availability').delete().eq('id', id);
  if (error) throw error;
}
