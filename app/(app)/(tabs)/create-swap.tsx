import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import {
  createSwapRequest,
  listCompanyColleagues,
  listMyShiftsForSwap,
} from '@/lib/services/shiftSwapService';
import { formatRange, formatDayHeading } from '@/lib/time';
import { colors, space } from '@/lib/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CreateSwapScreen() {
  const { profile } = useAuth();
  const [shifts, setShifts] = useState<any[]>([]);
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [selectedColleague, setSelectedColleague] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile?.id || !profile?.company_id) return;
      setLoading(true);
      try {
        const [myShifts, myColleagues] = await Promise.all([
          listMyShiftsForSwap(profile.id),
          listCompanyColleagues(profile.company_id, profile.id),
        ]);
        setShifts(myShifts);
        setColleagues(myColleagues);
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.id, profile?.company_id]);

  async function handleSubmit() {
    if (!selectedShift || !selectedColleague || !profile?.id || !profile?.company_id) return;
    setSaving(true);
    setError(null);
    try {
      await createSwapRequest({
        companyId: profile.company_id,
        shiftId: selectedShift.id,
        requesterId: profile.id,
        targetEmployeeId: selectedColleague.id,
        message: message.trim() || undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’envoyer la demande');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Proposer un échange" subtitle="Choisis un shift et un collègue" loading={loading}>
      <Text style={styles.label}>Ton shift</Text>
      {shifts.length === 0 ? (
        <Text style={styles.empty}>Aucun shift à venir</Text>
      ) : (
        shifts.map((shift) => (
          <Pressable key={shift.id} onPress={() => setSelectedShift(shift)}>
            <Card style={[styles.option, selectedShift?.id === shift.id && styles.optionActive]}>
              <Text style={styles.optionTitle}>{formatDayHeading(new Date(shift.start_time))}</Text>
              <Text style={styles.optionSub}>{formatRange(shift.start_time, shift.end_time)}</Text>
            </Card>
          </Pressable>
        ))
      )}

      <Text style={styles.label}>Proposer à</Text>
      {colleagues.length === 0 ? (
        <Text style={styles.empty}>Aucun collègue disponible</Text>
      ) : (
        colleagues.map((c: any) => (
          <Pressable key={c.id} onPress={() => setSelectedColleague(c)}>
            <Card style={[styles.option, selectedColleague?.id === c.id && styles.optionActive]}>
              <Text style={styles.optionTitle}>{c.full_name}</Text>
            </Card>
          </Pressable>
        ))
      )}

      <Field
        label="Message (optionnel)"
        value={message}
        onChangeText={setMessage}
        placeholder="Pourquoi cet échange ?"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={saving ? 'Envoi…' : 'Envoyer la demande'}
        onPress={handleSubmit}
        disabled={saving || !selectedShift || !selectedColleague}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '800', color: colors.ink, fontSize: 15, marginTop: space.sm },
  empty: { color: colors.muted, marginBottom: space.sm },
  option: { marginBottom: space.sm },
  optionActive: { borderColor: colors.teal, borderWidth: 2 },
  optionTitle: { fontWeight: '700', color: colors.ink },
  optionSub: { color: colors.muted, marginTop: 2 },
  error: { color: colors.danger, fontWeight: '600', marginVertical: space.sm },
});