import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DatePickerField } from '@/components/DatePickerField';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { createTicket, listTickets, setTicketStatus } from '@/lib/services/ticketService';
import {
  approveSwapRequest,
  listPendingManagerSwapRequests,
  rejectSwapRequest,
} from '@/lib/services/shiftSwapService';
import { formatDayHeading, formatRange } from '@/lib/time';
import { colors, radius, space } from '@/lib/theme';
import type { Ticket, TicketType } from '@/lib/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TYPES: { key: TicketType; label: string }[] = [
  { key: 'time_off', label: 'Congé' },
  { key: 'issue', label: 'Problème' },
];

export default function TicketsScreen() {
  const { profile } = useAuth();
  const { isManager } = useRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [type, setType] = useState<TicketType>('time_off');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const results = await Promise.all([
        listTickets(profile.company_id, isManager ? undefined : profile.id),
        isManager ? listPendingManagerSwapRequests(profile.company_id) : Promise.resolve([]),
      ]);
      setTickets(results[0]);
      setSwapRequests(results[1]);
    } finally {
      setLoading(false);
    }
  }, [profile, isManager]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function submit() {
    if (!profile?.company_id || !profile.id || !title.trim()) return;
    await createTicket({
      company_id: profile.company_id,
      author_id: profile.id,
      type,
      title: title.trim(),
      body: body.trim() || undefined,
      start_date: type === 'time_off' ? startDate.trim() || undefined : undefined,
      end_date: type === 'time_off' ? endDate.trim() || undefined : undefined,
    });
    setTitle('');
    setBody('');
    setStartDate('');
    setEndDate('');
    await load();
  }

  async function handleApproveSwap(id: string) {
    setBusyId(id);
    try {
      await approveSwapRequest(id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectSwap(id: string) {
    setBusyId(id);
    try {
      await rejectSwapRequest(id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen title="Tickets" subtitle={isManager ? 'Demandes de l’équipe' : 'Congés, échanges, signalements'} loading={loading}>
      {!isManager ? (
        <>
          <View style={styles.row}>
            <Pressable onPress={() => setType('time_off')} style={[styles.pill, type === 'time_off' && styles.pillOn]}>
              <Text style={[styles.pillText, type === 'time_off' && styles.pillTextOn]}>Congé</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(app)/(tabs)/create-swap')} style={styles.pill}>
              <Text style={styles.pillText}>Échange</Text>
            </Pressable>
            <Pressable onPress={() => setType('issue')} style={[styles.pill, type === 'issue' && styles.pillOn]}>
              <Text style={[styles.pillText, type === 'issue' && styles.pillTextOn]}>Problème</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/(app)/(tabs)/swap-requests')}>
            <Text style={styles.expandLink}>📋 Voir mes échanges en cours</Text>
          </Pressable>

          {type === 'time_off' ? (
            <>
              <DatePickerField label="Date de début" value={startDate} onChange={setStartDate} />
              <DatePickerField label="Date de fin" value={endDate} onChange={setEndDate} />
            </>
          ) : null}

          <Field label="Titre" value={title} onChangeText={setTitle} autoCapitalize="sentences" />
          <Field label="Détail" value={body} onChangeText={setBody} autoCapitalize="sentences" />
          <Button label="Envoyer" onPress={submit} />
        </>
      ) : null}

      {isManager && swapRequests.length > 0 ? (
        <>
          <Text style={styles.section}>Échanges à valider</Text>
          {swapRequests.map((req) => (
            <Card key={req.id} style={{ gap: 4 }}>
              <Text style={styles.kicker}>Échange de shift</Text>
              <Text style={styles.title}>
                {req.requester?.full_name} → {req.target?.full_name}
              </Text>
              <Text style={styles.meta}>{formatDayHeading(new Date(req.shift?.start_time))}</Text>
              <Text style={styles.meta}>{formatRange(req.shift?.start_time, req.shift?.end_time)}</Text>
              {req.message ? <Text style={styles.meta}>« {req.message} »</Text> : null}
              <View style={styles.row}>
                <Button
                  label="Refuser"
                  variant="ghost"
                  onPress={() => handleRejectSwap(req.id)}
                  disabled={busyId === req.id}
                />
                <Button
                  label="Approuver"
                  variant="secondary"
                  onPress={() => handleApproveSwap(req.id)}
                  disabled={busyId === req.id}
                />
              </View>
            </Card>
          ))}
        </>
      ) : null}

      {tickets.length > 0 ? <Text style={styles.section}>Tickets</Text> : null}
      {tickets.map((ticket) => (
        <Card key={ticket.id} style={{ gap: 8 }}>
          <Text style={styles.kicker}>
            {TYPES.find((t) => t.key === ticket.type)?.label} · {statusLabel(ticket.status)}
          </Text>
          <Text style={styles.title}>{ticket.title}</Text>
          {ticket.type === 'time_off' && ticket.start_date && ticket.end_date ? (
            <Text style={styles.meta}>Du {ticket.start_date} au {ticket.end_date}</Text>
          ) : null}
          {ticket.body ? <Text style={styles.meta}>{ticket.body}</Text> : null}
          <Text style={styles.meta}>{ticket.author?.full_name ?? ticket.author?.email}</Text>
          {isManager && ticket.status === 'pending' ? (
            <View style={styles.row}>
              <Button label="Approuver" variant="secondary" onPress={async () => { await setTicketStatus(ticket.id, 'approved'); await load(); }} />
              <Button label="Refuser" variant="ghost" onPress={async () => { await setTicketStatus(ticket.id, 'rejected'); await load(); }} />
            </View>
          ) : null}
        </Card>
      ))}
      {tickets.length === 0 && swapRequests.length === 0 && !loading ? (
        <Text style={styles.meta}>Aucune demande.</Text>
      ) : null}
    </Screen>
  );
}

function statusLabel(status: Ticket['status']) {
  if (status === 'pending') return 'en attente';
  if (status === 'approved') return 'approuvé';
  return 'refusé';
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  section: { fontWeight: '800', color: colors.ink, fontSize: 16, marginTop: space.md, marginBottom: 4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pillOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  pillText: { fontWeight: '700', color: colors.ink },
  pillTextOn: { color: colors.white },
  kicker: { color: colors.muted, fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  title: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  meta: { color: colors.muted },
  expandLink: { color: colors.teal, fontWeight: '600', marginTop: 4, marginBottom: 8, fontSize: 13 },
});