import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { listCompanyAvailability } from '@/lib/services/availabilityService';
import { listCompanyEmployees, setEmployeeActive } from '@/lib/services/employeeService';
import { listEmployeeTimeEntries } from '@/lib/services/timeEntryService';
import { colors, space } from '@/lib/theme';
import { minutesToLabel } from '@/lib/time';
import { DAY_LABELS, type Availability, type Profile } from '@/lib/types';
import { Redirect, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function EmployeesScreen() {
  const { isManager } = useRole();
  const { profile } = useAuth();
  const [people, setPeople] = useState<Profile[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [emps, avails] = await Promise.all([
        listCompanyEmployees(profile.company_id),
        listCompanyAvailability(profile.company_id),
      ]);
      setPeople(emps);
      setAvailability(avails);
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function toggleExpand(personId: string) {
    if (expandedId === personId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(personId);
    setLoadingEntries(true);
    try {
      const since = new Date();
      since.setDate(since.getDate() - 14); // 2 dernières semaines
      const entries = await listEmployeeTimeEntries(personId, since.toISOString());
      setTimeEntries(entries);
    } finally {
      setLoadingEntries(false);
    }
  }

  if (!isManager) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Screen title="Équipe" subtitle={`${people.length} personnes`} loading={loading}>
      {people.map((person) => {
        const windows = availability.filter((a) => a.employee_id === person.id);
        const isExpanded = expandedId === person.id;

        return (
          <Card key={person.id} style={{ gap: 6 }}>
            <Pressable onPress={() => toggleExpand(person.id)}>
              <Text style={styles.name}>{person.full_name ?? person.email}</Text>
              <Text style={styles.meta}>
                {person.role?.name === 'manager' ? 'Manager' : 'Employé'} · {person.is_active ? 'actif' : 'inactif'}
              </Text>
              <Text style={styles.meta}>
                {windows.length
                  ? windows.map((w) => `${DAY_LABELS[w.day_of_week]} ${minutesToLabel(w.start_minutes)}–${minutesToLabel(w.end_minutes)}`).join(' · ')
                  : 'Pas de dispo'}
              </Text>
            </Pressable>

            {person.role?.name === 'employee' ? (
              <Pressable
                onPress={async () => {
                  await setEmployeeActive(person.id, !person.is_active);
                  await load();
                }}
              >
                <Text style={styles.action}>{person.is_active ? 'Désactiver' : 'Réactiver'}</Text>
              </Pressable>
            ) : null}

            <Pressable onPress={() => toggleExpand(person.id)}>
              <Text style={styles.expandLink}>
                {isExpanded ? '▲ Masquer les pointages' : '▼ Voir les pointages récents'}
              </Text>
            </Pressable>

            {isExpanded ? (
              <View style={styles.entriesBox}>
                {loadingEntries ? (
                  <Text style={styles.meta}>Chargement…</Text>
                ) : timeEntries.length === 0 ? (
                  <Text style={styles.meta}>Aucun pointage récent</Text>
                ) : (
                  timeEntries.map((entry) => {
                    const flagged = entry.clock_in_flagged || entry.clock_out_flagged;
                    return (
                      <View key={entry.id} style={styles.entryRow}>
                        <Text style={[styles.entryText, flagged && styles.entryFlagged]}>
                          {new Date(entry.clock_in_time).toLocaleString('fr-FR')}
                          {flagged ? ' ⚠️' : ''}
                          {' · '}
                          {Math.round(entry.clock_in_distance_meters)}m
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  meta: { color: colors.muted },
  action: { color: colors.teal, fontWeight: '800', marginTop: 4 },
  expandLink: { color: colors.teal, fontWeight: '600', marginTop: 6, fontSize: 13 },
  entriesBox: { marginTop: space.sm, gap: 4, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.line },
  entryRow: {},
  entryText: { color: colors.muted, fontSize: 13 },
  entryFlagged: { color: '#d97706', fontWeight: '600' },
});