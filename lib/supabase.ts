import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR_PROJECT'));

const isServer = Platform.OS === 'web' && typeof window === 'undefined';

// Stub minimal utilisé UNIQUEMENT pendant le rendu serveur (SSR web).
// Il ne doit jamais réellement être appelé côté client réel.
const serverStub = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Not available during SSR') }),
    signUp: async () => ({ data: null, error: new Error('Not available during SSR') }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
  }),
  rpc: async () => ({ data: null, error: new Error('Not available during SSR') }),
} as unknown as SupabaseClient;

function createRealSupabaseClient(): SupabaseClient {
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

export const supabase: SupabaseClient = isServer ? serverStub : createRealSupabaseClient();