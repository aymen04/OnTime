import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useRole } from '@/lib/context/RoleContext';
import { colors } from '@/lib/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';


export default function TabLayout() {
  const { isManager } = useRole();
  const personIcon = useClientOnlyValue('person-outline', 'person-outline');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Horaires',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Dispos',
          href: isManager ? null : undefined,
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Équipe',
          href: isManager ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name={personIcon} size={22} color={color} />,
        }}
      />
       <Tabs.Screen
        name="time-entries"
        options={{
          title: 'Pointages',
          href: isManager ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons name="location-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
