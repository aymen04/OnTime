import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { createCompany, joinCompany } from '@/lib/services/authService';
import { colors } from '@/lib/theme';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function JoinCompanyScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }
  if (profile?.company_id) {
    return <Redirect href="/(app)" />;
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'create') {
        await createCompany(name);
      } else {
        await joinCompany(slug);
      }
      await refreshProfile();
      router.replace('/(app)');
    } catch (e: any) {
      console.log('ERREUR COMPLÈTE:', JSON.stringify(e, null, 2));
      const message = e?.message || e?.error_description || 'Impossible de continuer';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Ton commerce" subtitle="Crée-le ou rejoins-le avec un code.">
      <View style={styles.row}>
        <Text onPress={() => setMode('join')} style={[styles.tab, mode === 'join' && styles.tabOn]}>
          Rejoindre
        </Text>
        <Text onPress={() => setMode('create')} style={[styles.tab, mode === 'create' && styles.tabOn]}>
          Créer
        </Text>
      </View>
      {mode === 'create' ? (
        <Field label="Nom du commerce" value={name} onChangeText={setName} autoCapitalize="words" />
      ) : (
        <Field label="Code d’invitation" value={slug} onChangeText={setSlug} placeholder="cafe-leonard-a1b2c3" />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label={busy ? 'Un instant…' : mode === 'create' ? 'Créer le commerce' : 'Rejoindre'}
        onPress={submit}
        disabled={busy}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16 },
  tab: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  tabOn: { color: colors.teal, textDecorationLine: 'underline' },
  error: { color: colors.danger, fontWeight: '600' },
});
