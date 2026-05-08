import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  fillRow?: boolean;
};

export function DangerButton({ label, onPress, fillRow }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.button, fillRow && styles.fillRow]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E6',
    borderRadius: 8,
  },
  fillRow: {
    flex: 1,
  },
  label: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '700',
  },
});
