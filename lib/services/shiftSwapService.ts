import { supabase } from '@/lib/supabase';

export async function listMyShiftsForSwap(employeeId: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('start_time', now)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listCompanyColleagues(companyId: string, excludeUserId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, role:role_id(name)')
    .eq('company_id', companyId)
    .neq('id', excludeUserId);

  if (error) throw error;
  return (data ?? []).filter((u: any) => u.role?.name === 'employee');
}

export async function createSwapRequest(params: {
  companyId: string;
  shiftId: string;
  requesterId: string;
  targetEmployeeId: string;
  message?: string;
}) {
  const { data, error } = await supabase
    .from('shift_swap_requests')
    .insert({
      company_id: params.companyId,
      shift_id: params.shiftId,
      requester_id: params.requesterId,
      target_employee_id: params.targetEmployeeId,
      message: params.message,
      status: 'pending_employee',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Demandes que JE dois accepter/refuser (je suis la cible)
export async function listIncomingSwapRequests(employeeId: string) {
  const { data, error } = await supabase
    .from('shift_swap_requests')
    .select('*, shift:shift_id(start_time, end_time, position_label), requester:requester_id(full_name)')
    .eq('target_employee_id', employeeId)
    .eq('status', 'pending_employee')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Demandes que J'AI envoyées (pour suivre leur statut)
export async function listMySentSwapRequests(employeeId: string) {
  const { data, error } = await supabase
    .from('shift_swap_requests')
    .select('*, shift:shift_id(start_time, end_time, position_label), target:target_employee_id(full_name)')
    .eq('requester_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// L'employé ciblé répond (accepte → passe en attente manager / refuse → rejected)
export async function respondAsEmployee(requestId: string, accept: boolean) {
  const { error } = await supabase
    .from('shift_swap_requests')
    .update({ status: accept ? 'pending_manager' : 'rejected' })
    .eq('id', requestId);

  if (error) throw error;
}

// Manager : liste des demandes prêtes pour validation finale
export async function listPendingManagerSwapRequests(companyId: string) {
  const { data, error } = await supabase
    .from('shift_swap_requests')
    .select(
      '*, shift:shift_id(start_time, end_time, position_label), requester:requester_id(full_name), target:target_employee_id(full_name)',
    )
    .eq('company_id', companyId)
    .eq('status', 'pending_manager')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function approveSwapRequest(requestId: string) {
  const { data, error } = await supabase.rpc('approve_shift_swap', { p_request_id: requestId });
  if (error) throw error;
  return data;
}

export async function rejectSwapRequest(requestId: string) {
  const { error } = await supabase
    .from('shift_swap_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) throw error;
}