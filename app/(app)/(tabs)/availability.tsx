import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TimeRangeSlider } from '@/components/TimeRangeSlider';
import { confirmAction } from '@/lib/confirm';
import { useAuth } from '@/lib/context/AuthContext';
import { createAvailability, deleteAvailability, listAvailability } from '@/lib/services/availabilityService';
import { colors, radius } from '@/lib/theme';
import { minutesToLabel } from '@/lib/time';
import { DAY_LABELS, WEEK_ORDER, type Availability } from '@/lib/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AvailabilityScreen() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Availability[]>([]);
  const [day, setDay] = useState(1);
  const [start, setStart] = useState(9 * 60);
  const [end, setEnd] = useState(18 * 60);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      setRows(await listAvailability(profile.id));
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function add() {
    setError(null);
    if (!profile?.id || !profile.company_id) return;
    if (end <= start) {
      setError('L’heure de fin doit être après l’heure de début (le lendemain compte jusqu’à 6 AM).');
      return;
    }
    await createAvailability({
      employee_id: profile.id,
      company_id: profile.company_id,
      day_of_week: day,
      start_minutes: start,
      end_minutes: end,
    });
    await load();
  }

  return (
    <Screen title="Disponibilités" subtitle="H24 · hors heures légales (6 AM–6 AM) en orange" loading={loading}>
      <Text style={styles.label}>Jour</Text>
      <View style={styles.row}>
        {WEEK_ORDER.map((dow) => (
          <Pressable key={dow} onPress={() => setDay(dow)} style={[styles.pill, day === dow && styles.pillOn]}>
            <Text style={[styles.pillText, day === dow && styles.pillTextOn]}>{DAY_LABELS[dow]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Plage horaire</Text>
      <TimeRangeSlider
        start={start}
        end={end}
        onChange={(nextStart, nextEnd) => {
          setStart(nextStart);
          setEnd(nextEnd);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Enregistrer cette dispo" onPress={add} />

      {rows.map((row) => (
        <Card key={row.id} style={styles.item}>
          <View>
            <Text style={styles.itemTitle}>{DAY_LABELS[row.day_of_week]}</Text>
            <Text style={styles.meta}>
              {minutesToLabel(row.start_minutes)} – {minutesToLabel(row.end_minutes)}
            </Text>
          </View>
          <Text
            style={styles.trash}
            onPress={() =>
              confirmAction('Supprimer cette dispo ?', `${DAY_LABELS[row.day_of_week]} ${minutesToLabel(row.start_minutes)}`, async () => {
                await deleteAvailability(row.id);
                await load();
              })
            }
          >
            🗑
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pillOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  pillText: { fontWeight: '700', color: colors.ink, fontSize: 12 },
  pillTextOn: { color: colors.white },
  error: { color: colors.danger, fontWeight: '700' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted, marginTop: 2 },
  trash: { fontSize: 16, padding: 8 },
});
