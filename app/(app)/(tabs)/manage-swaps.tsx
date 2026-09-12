import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import {
  approveSwapRequest,
  listPendingManagerSwapRequests,
  rejectSwapRequest,
} from '@/lib/services/shiftSwapService';
import { formatDayHeading, formatRange } from '@/lib/time';
import { colors, space } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ManageSwapsScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      setRequests(await listPendingManagerSwapRequests(profile.company_id));
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleApprove(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await approveSwapRequest(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible d’approuver');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await rejectSwapRequest(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de refuser');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen title="Échanges à valider" subtitle="Accord des deux employés obtenu" loading={loading}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {requests.length === 0 ? (
        <Text style={styles.empty}>Aucun échange en attente de validation</Text>
      ) : (
        requests.map((req) => (
          <Card key={req.id} style={styles.card}>
            <Text style={styles.title}>
              {req.requester?.full_name} → {req.target?.full_name}
            </Text>
            <Text style={styles.meta}>{formatDayHeading(new Date(req.shift?.start_time))}</Text>
            <Text style={styles.meta}>{formatRange(req.shift?.start_time, req.shift?.end_time)}</Text>
            {req.message ? <Text style={styles.message}>« {req.message} »</Text> : null}

            <View style={styles.actions}>
              <Button
                label="Refuser"
                variant="ghost"
                onPress={() => handleReject(req.id)}
                disabled={busyId === req.id}
              />
              <Button
                label="Approuver"
                onPress={() => handleApprove(req.id)}
                disabled={busyId === req.id}
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4, marginBottom: space.sm },
  title: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  meta: { color: colors.muted },
  message: { fontStyle: 'italic', color: colors.muted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  error: { color: colors.danger, fontWeight: '600', marginBottom: space.sm },
});