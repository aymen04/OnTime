import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import {
  listIncomingSwapRequests,
  listMySentSwapRequests,
  respondAsEmployee,
} from '@/lib/services/shiftSwapService';
import { formatDayHeading, formatRange } from '@/lib/time';
import { colors, space } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATUS_LABELS: Record<string, string> = {
  pending_employee: 'En attente de réponse',
  pending_manager: 'En attente du manager',
  approved: 'Approuvé',
  rejected: 'Refusé',
};

export default function SwapRequestsScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        listIncomingSwapRequests(profile.id),
        listMySentSwapRequests(profile.id),
      ]);
      setIncoming(inc);
      setSent(out);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function respond(requestId: string, accept: boolean) {
    setBusyId(requestId);
    try {
      await respondAsEmployee(requestId, accept);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen title="Échanges de shift" loading={loading}>
      <Text style={styles.section}>Demandes reçues</Text>
      {incoming.length === 0 ? (
        <Text style={styles.empty}>Aucune demande en attente</Text>
      ) : (
        incoming.map((req) => (
          <Card key={req.id} style={styles.card}>
            <Text style={styles.title}>{req.requester?.full_name} te propose son shift</Text>
            <Text style={styles.meta}>{formatDayHeading(new Date(req.shift?.start_time))}</Text>
            <Text style={styles.meta}>{formatRange(req.shift?.start_time, req.shift?.end_time)}</Text>
            {req.message ? <Text style={styles.message}>« {req.message} »</Text> : null}
            <View style={styles.actions}>
              <Button
                label="Refuser"
                variant="ghost"
                onPress={() => respond(req.id, false)}
                disabled={busyId === req.id}
              />
              <Button
                label="Accepter"
                onPress={() => respond(req.id, true)}
                disabled={busyId === req.id}
              />
            </View>
          </Card>
        ))
      )}

      <Text style={styles.section}>Mes demandes envoyées</Text>
      {sent.length === 0 ? (
        <Text style={styles.empty}>Aucune demande envoyée</Text>
      ) : (
        sent.map((req) => (
          <Card key={req.id} style={styles.card}>
            <Text style={styles.title}>Proposé à {req.target?.full_name}</Text>
            <Text style={styles.meta}>{formatDayHeading(new Date(req.shift?.start_time))}</Text>
            <Text style={styles.status}>{STATUS_LABELS[req.status] ?? req.status}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontWeight: '800', color: colors.ink, fontSize: 16, marginTop: space.md },
  empty: { color: colors.muted, marginBottom: space.sm },
  card: { gap: 4, marginBottom: space.sm },
  title: { fontWeight: '700', color: colors.ink },
  meta: { color: colors.muted },
  message: { fontStyle: 'italic', color: colors.muted, marginTop: 4 },
  status: { marginTop: 6, fontWeight: '700', color: colors.teal },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
});