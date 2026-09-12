import { colors, radius, space } from '@/lib/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string; // format AAAA-MM-JJ ou ''
  onChange: (value: string) => void;
};

export function DatePickerField({ label, value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        {/* input HTML natif, disponible uniquement sur web via react-native-web */}
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={webInputStyle}
        />
      </View>
    );
  }

  const dateValue = value ? new Date(value) : new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{value || 'Choisir une date'}</Text>
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) {
              const iso = selectedDate.toISOString().split('T')[0];
              onChange(iso);
            }
          }}
        />
      ) : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  border: `1px solid ${colors.line}`,
  borderRadius: radius.md,
  padding: 10,
  fontSize: 14,
  fontFamily: 'inherit',
  color: colors.ink,
  backgroundColor: colors.card,
};

const styles = StyleSheet.create({
  container: { gap: 6, marginBottom: space.sm },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  button: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 10,
    backgroundColor: colors.card,
  },
  buttonText: { color: colors.ink },
});