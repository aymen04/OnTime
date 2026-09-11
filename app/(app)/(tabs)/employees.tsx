import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { listCompanyAvailability } from '@/lib/services/availabilityService';
import { listCompanyEmployees, setEmployeeActive } from '@/lib/services/employeeService';
import { colors } from '@/lib/theme';
import { minutesToLabel } from '@/lib/time';
import { DAY_LABELS, type Availability, type Profile } from '@/lib/types';
import { Redirect } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function EmployeesScreen() {
  const { isManager } = useRole();
  const { profile } = useAuth();
  const [people, setPeople] = useState<Profile[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!isManager) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Screen title="Équipe" subtitle={`${people.length} personnes`} loading={loading}>
      {people.map((person) => {
        const windows = availability.filter((a) => a.employee_id === person.id);
        return (
          <Card key={person.id} style={{ gap: 6 }}>
            <Text style={styles.name}>{person.full_name ?? person.email}</Text>
            <Text style={styles.meta}>
              {person.role?.name === 'manager' ? 'Manager' : 'Employé'} · {person.is_active ? 'actif' : 'inactif'}
            </Text>
            <Text style={styles.meta}>
              {windows.length
                ? windows.map((w) => `${DAY_LABELS[w.day_of_week]} ${minutesToLabel(w.start_minutes)}–${minutesToLabel(w.end_minutes)}`).join(' · ')
                : 'Pas de dispo'}
            </Text>
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
});
