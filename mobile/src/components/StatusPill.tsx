import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

type Props = {
  label: string;
  tone: StatusTone;
};

const tonePalette: Record<StatusTone, { background: string; text: string }> = {
  neutral: { background: '#ECECF1', text: colors.text },
  info: { background: '#E7F1FF', text: colors.text },
  success: { background: '#E8F8EE', text: '#136F3D' },
  warning: { background: '#FFF3DF', text: '#8A5A00' },
  danger: { background: '#FFE8E6', text: colors.red },
};

export function StatusPill({ label, tone }: Props) {
  const palette = tonePalette[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.background }]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
