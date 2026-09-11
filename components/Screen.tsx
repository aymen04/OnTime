import { colors, space } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  scroll?: boolean;
};

export function Screen({ title, subtitle, loading, scroll = true, children, style }: Props) {
  const body = loading ? (
    <View style={styles.center}>
      <ActivityIndicator color={colors.teal} />
    </View>
  ) : (
    children
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, style]} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.fill, style]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  subtitle: { marginTop: 4, fontSize: 15, color: colors.muted },
  content: { padding: space.lg, paddingBottom: 40, gap: space.md },
  fill: { flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
