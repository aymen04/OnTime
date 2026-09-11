import { colors, radius, space } from '@/lib/theme';
import { StyleSheet, View, type ViewProps } from 'react-native';

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
