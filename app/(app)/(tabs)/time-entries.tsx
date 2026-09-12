import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { listCompanyTimeEntries } from '@/lib/services/timeEntryService';
import { colors, space } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TimeEntriesScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!profile?.company_id) return;
        setLoading(true);
        try {
          const since = new Date();
          since.setDate(since.getDate() - 7);
          const data = await listCompanyTimeEntries(profile.company_id, since.toISOString());
          if (active) setEntries(data);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [profile?.company_id]),
  );

  return (
    <Screen title="Pointages" subtitle="7 derniers jours" loading={loading}>
      <View style={{ gap: space.sm }}>
        {entries.length === 0 ? (
          <Text style={styles.empty}>Aucun pointage enregistré</Text>
        ) : (
          entries.map((entry) => <TimeEntryCard key={entry.id} entry={entry} />)
        )}
      </View>
    </Screen>
  );
}

function TimeEntryCard({ entry }: { entry: any }) {
  const clockIn = new Date(entry.clock_in_time);
  const clockOut = entry.clock_out_time ? new Date(entry.clock_out_time) : null;
  const flagged = entry.clock_in_flagged || entry.clock_out_flagged;

  return (
    <Card style={[styles.card, flagged ? styles.cardFlagged : null]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{entry.employee?.full_name ?? 'Employé'}</Text>
        {flagged ? <Text style={styles.badge}>⚠️ À vérifier</Text> : null}
      </View>

      <Text style={styles.meta}>
        Entrée : {clockIn.toLocaleString('fr-FR')} ({Math.round(entry.clock_in_distance_meters)}m)
      </Text>

      {clockOut ? (
        <Text style={styles.meta}>
          Sortie : {clockOut.toLocaleString('fr-FR')} ({Math.round(entry.clock_out_distance_meters ?? 0)}m)
        </Text>
      ) : (
        <Text style={styles.metaOngoing}>En cours…</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  cardFlagged: { borderColor: '#d97706', borderWidth: 1.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  badge: { color: '#d97706', fontWeight: '700', fontSize: 12 },
  meta: { color: colors.muted },
  metaOngoing: { color: colors.teal, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});