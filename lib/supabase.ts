import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT'));

const isServer = Platform.OS === 'web' && typeof window === 'undefined';

function createSupabaseClient(): SupabaseClient {
  if (isServer) {
    // Client "vide" côté serveur, sans storage du tout
    return createClient(url ?? 'https://example.supabase.co', anonKey ?? 'public-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  const storage = Platform.OS === 'web' ? window.localStorage : AsyncStorage;

  return createClient(url ?? 'https://example.supabase.co', anonKey ?? 'public-anon-key', {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient();