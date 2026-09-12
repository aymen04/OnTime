import { supabase } from '@/lib/supabase';
import { distanceInMeters, isWithinRadius } from '@/lib/services/locationService';

const CLOCK_IN_WINDOW_MINUTES_BEFORE = 15;

export async function getActiveShiftForNow(employeeId: string, companyId: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 4 * 60 * 60 * 1000); // marge large pour shifts en cours
  const windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('company_id', companyId)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .order('start_time', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  // Trouve un shift dont l'heure de début est proche (fenêtre de tolérance)
  const nowMs = now.getTime();
  const eligible = data.find((shift) => {
    const start = new Date(shift.start_time).getTime();
    const end = new Date(shift.end_time).getTime();
    const clockInWindowStart = start - CLOCK_IN_WINDOW_MINUTES_BEFORE * 60 * 1000;
    return nowMs >= clockInWindowStart && nowMs <= end;
  });

  return eligible ?? null;
}

export async function hasOpenTimeEntry(employeeId: string, shiftId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('shift_id', shiftId)
    .is('clock_out_time', null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function clockIn(params: {
  companyId: string;
  employeeId: string;
  shiftId: string;
  lat: number;
  lng: number;
  companyLat: number;
  companyLng: number;
}) {
  const distance = distanceInMeters(params.lat, params.lng, params.companyLat, params.companyLng);
  const flagged = !isWithinRadius(distance);

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      company_id: params.companyId,
      employee_id: params.employeeId,
      shift_id: params.shiftId,
      clock_in_lat: params.lat,
      clock_in_lng: params.lng,
      clock_in_distance_meters: distance,
      clock_in_flagged: flagged,
    })
    .select()
    .single();

  if (error) throw error;
  return { entry: data, distance, flagged };
}

export async function clockOut(params: {
  entryId: string;
  lat: number;
  lng: number;
  companyLat: number;
  companyLng: number;
}) {
  const distance = distanceInMeters(params.lat, params.lng, params.companyLat, params.companyLng);
  const flagged = !isWithinRadius(distance);

  const { error } = await supabase
    .from('time_entries')
    .update({
      clock_out_time: new Date().toISOString(),
      clock_out_lat: params.lat,
      clock_out_lng: params.lng,
      clock_out_distance_meters: distance,
      clock_out_flagged: flagged,
    })
    .eq('id', params.entryId);

  if (error) throw error;
  return { distance, flagged };
}

export async function listCompanyTimeEntries(companyId: string, sinceISO: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, employee:employee_id(full_name), shift:shift_id(start_time, end_time, position_label)')
      .eq('company_id', companyId)
      .gte('clock_in_time', sinceISO)
      .order('clock_in_time', { ascending: false });
  
    if (error) throw error;
    return data ?? [];
  }

  export async function listEmployeeTimeEntries(employeeId: string, sinceISO: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('clock_in_time', sinceISO)
      .order('clock_in_time', { ascending: false })
      .limit(5);
  
    if (error) throw error;
    return data ?? [];
  }