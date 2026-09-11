import { supabase } from '@/lib/supabase';

export async function updateCompanyLocation(
  companyId: string,
  params: { address: string; latitude: number; longitude: number }
) {
  const { error } = await supabase
    .from('companies')
    .update({
      address: params.address,
      latitude: params.latitude,
      longitude: params.longitude,
    })
    .eq('id', companyId);

  if (error) throw error;
}