import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/lib/context/AuthContext';
import { useRole } from '@/lib/context/RoleContext';
import { signOut } from '@/lib/services/authService';
import { colors } from '@/lib/theme';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { roleName } = useRole();

  return (
    <Screen title="Profil" subtitle="Compte et commerce">
      <Card style={{ gap: 8 }}>
        <Text style={styles.name}>{profile?.full_name ?? '—'}</Text>
        <Text style={styles.meta}>{profile?.email}</Text>
        <Text style={styles.meta}>{roleName === 'manager' ? 'Manager' : 'Employé'}</Text>
        <Text style={styles.meta}>{profile?.company?.name}</Text>
        {roleName === 'manager' && profile?.company?.slug ? (
          <Text style={styles.code}>Code : {profile.company.slug}</Text>
        ) : null}
      </Card>
      <Button
        label="Se déconnecter"
        variant="ghost"
        onPress={async () => {
          await signOut();
          router.replace('/(auth)/login');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted },
  code: { marginTop: 8, fontWeight: '800', color: colors.teal },
});
