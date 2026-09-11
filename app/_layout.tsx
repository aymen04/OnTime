import { AuthProvider } from '@/lib/context/AuthContext';
import { RoleProvider } from '@/lib/context/RoleContext';
import { colors } from '@/lib/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RoleProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </RoleProvider>
    </AuthProvider>
  );
}
