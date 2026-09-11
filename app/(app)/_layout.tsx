import { useAuth } from '@/lib/context/AuthContext';
import { colors } from '@/lib/theme';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AppStackLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile?.company_id) {
    return <Redirect href="/join-company" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
