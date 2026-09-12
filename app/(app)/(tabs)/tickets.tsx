import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { createTicket, listTickets, setTicketStatus } from '@/lib/services/ticketService';
import { colors, radius } from '@/lib/theme';
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
  const [type, setType] = useState<TicketType>('time_off');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      setTickets(await listTickets(profile.company_id, isManager ? undefined : profile.id));
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
    });
    setTitle('');
    setBody('');
    await load();
  }

  return (
    <Screen title="Tickets" subtitle={isManager ? 'Demandes de l’équipe' : 'Congés, échanges, signalements'} loading={loading}>
      {!isManager ? (
        <>
          <View style={styles.row}>
            <Pressable onPress={() => router.push('/(app)/(tabs)/create-swap')} style={styles.pill}>
              <Text style={styles.pillText}>🔄 Proposer un échange</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(app)/(tabs)/swap-requests')} style={styles.pill}>
              <Text style={styles.pillText}>📋 Mes échanges</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            {TYPES.map((item) => (
              <Pressable key={item.key} onPress={() => setType(item.key)} style={[styles.pill, type === item.key && styles.pillOn]}>
                <Text style={[styles.pillText, type === item.key && styles.pillTextOn]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Titre" value={title} onChangeText={setTitle} autoCapitalize="sentences" />
          <Field label="Détail" value={body} onChangeText={setBody} autoCapitalize="sentences" />
          <Button label="Envoyer" onPress={submit} />
        </>
      ) : null}

      {tickets.map((ticket) => (
        <Card key={ticket.id} style={{ gap: 8 }}>
          <Text style={styles.kicker}>
            {TYPES.find((t) => t.key === ticket.type)?.label} · {statusLabel(ticket.status)}
          </Text>
          <Text style={styles.title}>{ticket.title}</Text>
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
      {tickets.length === 0 && !loading ? <Text style={styles.meta}>Aucun ticket.</Text> : null}
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
});