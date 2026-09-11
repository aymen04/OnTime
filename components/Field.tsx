import { colors, radius, space } from '@/lib/theme';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & { label: string };

export function Field({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 48,
    fontSize: 16,
    color: colors.ink,
  },
});
