import { colors, radius, space } from '@/lib/theme';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ label, variant = 'primary', disabled, style, ...props }: Props) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={(state) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={[styles.text, variant === 'secondary' || variant === 'ghost' ? styles.textDark : styles.textLight]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  primary: { backgroundColor: colors.teal },
  secondary: { backgroundColor: colors.tealSoft },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 16, fontWeight: '700' },
  textLight: { color: colors.white },
  textDark: { color: colors.ink },
});
