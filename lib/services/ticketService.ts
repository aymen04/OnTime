import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStatus, TicketType } from '@/lib/types';

export async function listTickets(companyId: string, authorId?: string) {
  let query = supabase
    .from('tickets')
    .select('*, author:users!tickets_author_id_fkey(id, full_name, email)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  if (authorId) {
    query = query.eq('author_id', authorId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Ticket[];
}

export async function createTicket(row: {
  company_id: string;
  author_id: string;
  type: TicketType;
  title: string;
  body?: string;
}) {
  const { data, error } = await supabase.from('tickets').insert(row).select('*').single();
  if (error) throw error;
  return data as Ticket;
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function countPendingTickets(companyId: string) {
  const { count, error } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'pending');
  if (error) throw error;
  return count ?? 0;
}
