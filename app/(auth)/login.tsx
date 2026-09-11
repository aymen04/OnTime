import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { signIn, signUp } from '@/lib/services/authService';
import { colors, space } from '@/lib/theme';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const { session, profile, configured, refreshProfile } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (configured && session && profile?.company_id) {
    return <Redirect href="/(app)" />;
  }
  if (configured && session && !profile?.company_id) {
    return <Redirect href="/join-company" />;
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp({ email, password, fullName, companyCode: companyCode || undefined });
      }
      await refreshProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="OnTime" subtitle="Planning d’équipe, sans tableur.">
      {!configured ? (
        <Text style={styles.warn}>
          Ajoute EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans un fichier .env, puis applique
          supabase/migrations/001_init.sql dans le SQL editor Supabase.
        </Text>
      ) : null}

      <View style={styles.toggle}>
        <Text onPress={() => setMode('signin')} style={[styles.toggleItem, mode === 'signin' && styles.toggleOn]}>
          Connexion
        </Text>
        <Text onPress={() => setMode('signup')} style={[styles.toggleItem, mode === 'signup' && styles.toggleOn]}>
          Inscription
        </Text>
      </View>

      {mode === 'signup' ? (
        <Field label="Nom" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
      ) : null}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      {mode === 'signup' ? (
        <Field
          label="Code commerce (optionnel)"
          value={companyCode}
          onChangeText={setCompanyCode}
          autoCapitalize="none"
          placeholder="ex. cafe-leonard-a1b2c3"
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={busy ? 'Un instant…' : mode === 'signin' ? 'Entrer' : 'Créer le compte'} onPress={submit} disabled={busy || !configured} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: space.md, marginBottom: 4 },
  toggleItem: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  toggleOn: { color: colors.teal, textDecorationLine: 'underline' },
  error: { color: colors.danger, fontWeight: '600' },
  warn: { color: colors.warning, lineHeight: 22 },
});
