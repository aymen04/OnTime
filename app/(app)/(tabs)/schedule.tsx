import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TimeRangeSlider } from '@/components/TimeRangeSlider';
import { confirmAction } from '@/lib/confirm';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { listCompanyAvailability } from '@/lib/services/availabilityService';
import { listCompanyEmployees } from '@/lib/services/employeeService';
import { createShift, deleteShift, groupShiftsByDay, listCompanyShifts, listEmployeeShifts } from '@/lib/services/shiftService';
import { colors, radius, space } from '@/lib/theme';
import {
  addDays,
  bestOverlap,
  dateFromMinutes,
  formatDayHeading,
  formatRange,
  isoDay,
  minutesToLabel,
  startOfWeek,
} from '@/lib/time';
import { DAY_LABELS, WEEK_ORDER, type Availability, type Profile, type Shift } from '@/lib/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ScheduleScreen() {
  const { isManager } = useRole();
  return isManager ? <WeeklyPlanning /> : <EmployeeCalendar />;
}

function EmployeeCalendar() {
  const { profile } = useAuth();
  const [view, setView] = useState<'list' | 'week'>('list');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const weekStart = useMemo(() => startOfWeek(new Date()), []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
          const rows = await listEmployeeShifts(profile.id, addDays(weekStart, -7).toISOString());
          if (active) setShifts(rows);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [profile?.id]),
  );

  const grouped = groupShiftsByDay(shifts);
  const weekDays = WEEK_ORDER.map((dow, index) => addDays(weekStart, index));

  return (
    <Screen title="Calendrier" subtitle="Tes shifts à venir" loading={loading}>
      <View style={styles.toggle}>
        <Chip label="Liste" active={view === 'list'} onPress={() => setView('list')} />
        <Chip label="Semaine" active={view === 'week'} onPress={() => setView('week')} />
      </View>
      {view === 'list'
        ? grouped.map(([day, items]) => (
            <View key={day} style={{ gap: 8 }}>
              <Text style={styles.dayTitle}>{formatDayHeading(new Date(`${day}T12:00:00`))}</Text>
              {items.map((shift) => (
                <Card key={shift.id}>
                  <Text style={styles.shiftTime}>{formatRange(shift.start_time, shift.end_time)}</Text>
                  {shift.position_label ? <Text style={styles.meta}>{shift.position_label}</Text> : null}
                </Card>
              ))}
            </View>
          ))
        : weekDays.map((date) => {
            const key = isoDay(date);
            const items = shifts.filter((s) => s.start_time.startsWith(key));
            return (
              <Card key={key}>
                <Text style={styles.dayTitle}>{formatDayHeading(date)}</Text>
                {items.length === 0 ? (
                  <Text style={styles.meta}>—</Text>
                ) : (
                  items.map((shift) => (
                    <Text key={shift.id} style={styles.shiftTime}>
                      {formatRange(shift.start_time, shift.end_time)}
                    </Text>
                  ))
                )}
              </Card>
            );
          })}
      {shifts.length === 0 && !loading ? <Text style={styles.meta}>Aucun shift pour le moment.</Text> : null}
    </Screen>
  );
}

function WeeklyPlanning() {
  const { profile } = useAuth();
  const [mode, setMode] = useState<'assign' | 'overview'>('assign');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDow, setSelectedDow] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 0 : today;
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [shiftStart, setShiftStart] = useState(9 * 60);
  const [shiftEnd, setShiftEnd] = useState(18 * 60);
  const [people, setPeople] = useState<Profile[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedDate = useMemo(() => {
    const mondayIndex = selectedDow === 0 ? 6 : selectedDow - 1;
    return addDays(weekStart, mondayIndex);
  }, [weekStart, selectedDow]);

  const load = useCallback(async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [emps, avails, weekShifts] = await Promise.all([
        listCompanyEmployees(profile.company_id),
        listCompanyAvailability(profile.company_id),
        listCompanyShifts(profile.company_id, weekStart.toISOString(), addDays(weekStart, 7).toISOString()),
      ]);
      setPeople(emps.filter((p) => p.is_active && p.role?.name === 'employee'));
      setAvailability(avails);
      setShifts(weekShifts);
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id, weekStart]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pool = people
    .map((person) => ({
      person,
      windows: availability.filter((a) => a.employee_id === person.id && a.day_of_week === selectedDow),
    }))
    .filter((row) => row.windows.length > 0);

  async function assign() {
    setError(null);
    if (!selectedEmployeeId || !profile?.company_id || !profile.id) {
      setError('Choisis d’abord quelqu’un dans le pool.');
      return;
    }
    if (shiftEnd <= shiftStart) {
      setError('L’heure de fin doit être après l’heure de début.');
      return;
    }
    const windows = availability.filter((a) => a.employee_id === selectedEmployeeId && a.day_of_week === selectedDow);
    const hit = bestOverlap(windows, shiftStart, shiftEnd);
    if (!hit) {
      setError('Pas d’intersection entre la dispo et ce créneau.');
      return;
    }
    await createShift({
      company_id: profile.company_id,
      employee_id: selectedEmployeeId,
      created_by: profile.id,
      start_time: dateFromMinutes(selectedDate, hit.start).toISOString(),
      end_time: dateFromMinutes(selectedDate, hit.end).toISOString(),
    });
    await load();
  }

  const dayShifts = shifts.filter((s) => s.start_time.startsWith(isoDay(selectedDate)));
  const weekDays = WEEK_ORDER.map((dow, index) => ({ dow, date: addDays(weekStart, index) }));

  return (
    <Screen title="Planning" subtitle="Pool du jour → shift personnalisé" loading={loading} scroll>
      <View style={styles.toggle}>
        <Chip label="Assigner" active={mode === 'assign'} onPress={() => setMode('assign')} />
        <Chip label="Vue d’ensemble" active={mode === 'overview'} onPress={() => setMode('overview')} />
      </View>

      <View style={styles.weekNav}>
        <Chip label="←" active={false} onPress={() => setWeekStart(addDays(weekStart, -7))} />
        <Text style={styles.weekLabel}>
          {weekStart.getDate()}/{weekStart.getMonth() + 1}
        </Text>
        <Chip label="→" active={false} onPress={() => setWeekStart(addDays(weekStart, 7))} />
      </View>

      {mode === 'overview' ? (
        weekDays.map(({ dow, date }) => {
          const items = shifts
            .filter((s) => s.start_time.startsWith(isoDay(date)))
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <Card key={dow}>
              <Text style={styles.dayTitle}>{formatDayHeading(date)}</Text>
              {items.length === 0 ? (
                <Text style={styles.meta}>Aucun shift assigné</Text>
              ) : (
                items.map((shift) => (
                  <Text key={shift.id} style={styles.shiftTime}>
                    {(shift.employee?.full_name ?? 'Équipier') + ' · ' + formatRange(shift.start_time, shift.end_time)}
                  </Text>
                ))
              )}
            </Card>
          );
        })
      ) : (
        <>
          <View style={styles.days}>
            {WEEK_ORDER.map((dow) => (
              <Pressable key={dow} onPress={() => setSelectedDow(dow)} style={[styles.dayTab, selectedDow === dow && styles.dayTabOn]}>
                <Text style={[styles.dayTabText, selectedDow === dow && styles.dayTabTextOn]}>{DAY_LABELS[dow]}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>Disponibles {DAY_LABELS[selectedDow]}</Text>
          <View style={styles.pool}>
            {pool.length === 0 ? <Text style={styles.meta}>Personne n’a déclaré de dispo ce jour-là.</Text> : null}
            {pool.map(({ person, windows }) => (
              <Pressable
                key={person.id}
                onPress={() => setSelectedEmployeeId(person.id)}
                style={[styles.poolCard, selectedEmployeeId === person.id && styles.poolCardOn]}
              >
                <Text style={styles.poolName}>{person.full_name ?? person.email}</Text>
                <Text style={styles.meta}>
                  {windows.map((w) => `${minutesToLabel(w.start_minutes)}–${minutesToLabel(w.end_minutes)}`).join(' · ')}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.section}>Shift personnalisé</Text>
          <TimeRangeSlider
            start={shiftStart}
            end={shiftEnd}
            onChange={(nextStart, nextEnd) => {
              setShiftStart(nextStart);
              setShiftEnd(nextEnd);
            }}
          />
          <Button label="Assigner ce shift" onPress={assign} />

          <Text style={styles.section}>Shifts du jour</Text>
          {dayShifts.length === 0 ? (
            <Text style={styles.meta}>Aucun shift assigné ce jour-là.</Text>
          ) : (
            dayShifts
              .slice()
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((shift) => (
                <Card key={shift.id}>
                  <View style={styles.shiftRow}>
                    <Text style={styles.shiftTime}>
                      {(shift.employee?.full_name ?? 'Équipier') + ' · ' + formatRange(shift.start_time, shift.end_time)}
                    </Text>
                    <Pressable
                      onPress={() =>
                        confirmAction('Supprimer ce shift ?', 'Cette action est définitive.', async () => {
                          await deleteShift(shift.id);
                          await load();
                        })
                      }
                    >
                      <Text style={styles.trash}>🗑</Text>
                    </Pressable>
                  </View>
                </Card>
              ))
          )}
        </>
      )}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontWeight: '700', color: colors.ink },
  chipTextOn: { color: colors.white },
  dayTitle: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  shiftTime: { color: colors.ink, fontWeight: '600' },
  meta: { color: colors.muted },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weekLabel: { fontWeight: '800', color: colors.ink },
  days: { flexDirection: 'row', gap: 6 },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayTabOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  dayTabText: { fontWeight: '700', color: colors.muted, fontSize: 12 },
  dayTabTextOn: { color: colors.white },
  section: { fontWeight: '800', color: colors.ink },
  pool: { gap: 8 },
  poolCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  poolCardOn: { borderColor: colors.teal, backgroundColor: colors.tealSoft },
  poolName: { fontWeight: '800', color: colors.ink },
  error: { color: colors.danger, fontWeight: '700' },
  shiftRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trash: { fontSize: 16, padding: 4 },
});
