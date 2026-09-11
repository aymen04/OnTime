import { supabase } from '@/lib/supabase';
import type { Shift } from '@/lib/types';

export async function listCompanyShifts(companyId: string, fromIso: string, toIso: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*, employee:users!shifts_employee_id_fkey(id, full_name, email)')
    .eq('company_id', companyId)
    .gte('start_time', fromIso)
    .lt('start_time', toIso)
    .order('start_time');
  if (error) throw error;
  return (data ?? []) as Shift[];
}

export async function listEmployeeShifts(employeeId: string, fromIso?: string) {
  let query = supabase
    .from('shifts')
    .select('*, employee:users!shifts_employee_id_fkey(id, full_name, email)')
    .eq('employee_id', employeeId)
    .order('start_time');
  if (fromIso) {
    query = query.gte('start_time', fromIso);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Shift[];
}

export async function createShift(row: {
  company_id: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  created_by: string;
  position_label?: string;
  notes?: string;
}) {
  const { data, error } = await supabase.from('shifts').insert(row).select('*').single();
  if (error) throw error;
  return data as Shift;
}

export async function deleteShift(id: string) {
  const { error } = await supabase.from('shifts').delete().eq('id', id);
  if (error) throw error;
}

export function groupShiftsByDay(shifts: Shift[]) {
  const groups = new Map<string, Shift[]>();
  for (const shift of shifts) {
    const key = shift.start_time.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(shift);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
