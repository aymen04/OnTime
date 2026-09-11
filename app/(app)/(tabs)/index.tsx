import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { employeeHoursThisWeek, listCompanyEmployees, nextShift } from '@/lib/services/employeeService';
import { listCompanyShifts, listEmployeeShifts } from '@/lib/services/shiftService';
import { countPendingTickets } from '@/lib/services/ticketService';
import { addDays, formatDayHeading, formatRange, startOfWeek } from '@/lib/time';
import { colors, space } from '@/lib/theme';
import type { Shift } from '@/lib/types';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { isManager } = useRole();
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState<{ hours: number; count: number; next: Shift | undefined }>({
    hours: 0,
    count: 0,
    next: undefined,
  });
  const [managerStats, setManagerStats] = useState({ employees: 0, shifts: 0, pending: 0 });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!profile?.id || !profile.company_id) return;
        setLoading(true);
        try {
          if (isManager) {
            const weekStart = startOfWeek(new Date());
            const [people, shifts, pending] = await Promise.all([
              listCompanyEmployees(profile.company_id),
              listCompanyShifts(profile.company_id, weekStart.toISOString(), addDays(weekStart, 7).toISOString()),
              countPendingTickets(profile.company_id),
            ]);
            if (!active) return;
            setManagerStats({
              employees: people.filter((p) => p.role?.name === 'employee').length,
              shifts: shifts.length,
              pending,
            });
          } else {
            const shifts = await listEmployeeShifts(profile.id, startOfWeek(new Date()).toISOString());
            if (!active) return;
            setEmployeeStats({
              hours: Math.round(employeeHoursThisWeek(shifts) * 10) / 10,
              count: shifts.filter((s) => new Date(s.start_time) >= startOfWeek(new Date())).length,
              next: nextShift(shifts),
            });
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [profile, isManager]),
  );

  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi';

  return (
    <Screen
      title={isManager ? `Bonjour ${firstName}` : `Salut ${firstName}`}
      subtitle={profile?.company?.name ?? 'OnTime'}
      loading={loading}
    >
      {isManager ? (
        <>
          <View style={styles.grid}>
            <Stat label="Employés" value={String(managerStats.employees)} />
            <Stat label="Shifts cette semaine" value={String(managerStats.shifts)} />
            <Stat label="Tickets en attente" value={String(managerStats.pending)} />
          </View>
          <Text style={styles.section}>Raccourcis</Text>
          <Link href="/(app)/(tabs)/schedule" asChild>
            <Pressable>
              <Card>
                <Text style={styles.linkTitle}>Planning hebdo</Text>
                <Text style={styles.linkSub}>Assigner depuis le pool de disponibilités</Text>
              </Card>
            </Pressable>
          </Link>
          <Link href="/(app)/(tabs)/employees" asChild>
            <Pressable>
              <Card>
                <Text style={styles.linkTitle}>Équipe</Text>
                <Text style={styles.linkSub}>Actifs, dispos, rôles</Text>
              </Card>
            </Pressable>
          </Link>
        </>
      ) : (
        <>
          <Card>
            <Text style={styles.kicker}>Prochain shift</Text>
            {employeeStats.next ? (
              <>
                <Text style={styles.big}>{formatDayHeading(new Date(employeeStats.next.start_time))}</Text>
                <Text style={styles.meta}>{formatRange(employeeStats.next.start_time, employeeStats.next.end_time)}</Text>
              </>
            ) : (
              <Text style={styles.meta}>Rien de prévu pour l’instant</Text>
            )}
          </Card>
          <View style={styles.grid}>
            <Stat label="Heures cette semaine" value={`${employeeStats.hours} h`} />
            <Stat label="Shifts" value={String(employeeStats.count)} />
          </View>
          <Link href="/(app)/(tabs)/schedule" asChild>
            <Pressable>
              <Card>
                <Text style={styles.linkTitle}>Calendrier</Text>
                <Text style={styles.linkSub}>Liste et vue semaine</Text>
              </Card>
            </Pressable>
          </Link>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: { flexGrow: 1, minWidth: 140 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.ink },
  statLabel: { marginTop: 4, color: colors.muted, fontWeight: '600' },
  section: { marginTop: 8, fontWeight: '800', color: colors.ink, fontSize: 16 },
  kicker: { color: colors.muted, fontWeight: '700', marginBottom: 6 },
  big: { fontSize: 22, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 4, color: colors.muted },
  linkTitle: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  linkSub: { marginTop: 4, color: colors.muted },
});
