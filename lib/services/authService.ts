import { supabase } from '@/lib/supabase';
import type { Company, Profile } from '@/lib/types';

export async function fetchProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*, role:roles(*), company:companies!users_company_id_fkey(*)')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

async function waitForProfile() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const profile = await fetchProfile();
    if (profile) return profile;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Profil encore en création. Réessaie dans un instant.');
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signUp(params: {
  email: string;
  password: string;
  fullName: string;
  companyCode?: string;
}) {
  const { error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: { full_name: params.fullName.trim() },
    },
  });
  if (error) throw error;

  if (params.companyCode?.trim()) {
    await waitForProfile();
    await joinCompany(params.companyCode.trim());
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createCompany(name: string): Promise<Company> {
  await waitForProfile();
  const { data, error } = await supabase.rpc('create_company', { p_name: name.trim() });
  if (error) throw error;
  return data as Company;
}

export async function joinCompany(slug: string): Promise<Company> {
  await waitForProfile();
  const { data, error } = await supabase.rpc('join_company', { p_slug: slug.trim() });
  if (error) throw error;
  return data as Company;
}

export async function updateFullName(userId: string, fullName: string) {
  const { error } = await supabase.from('users').update({ full_name: fullName.trim() }).eq('id', userId);
  if (error) throw error;
}
