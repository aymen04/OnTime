import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Cette page n’existe pas.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Retour à l’accueil</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink },
  link: { marginTop: 16 },
  linkText: { color: colors.teal, fontWeight: '700' },
});
