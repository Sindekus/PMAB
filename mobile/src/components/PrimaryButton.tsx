import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'compact' | 'full';
};

export function PrimaryButton({ label, onPress, loading, disabled, variant = 'compact' }: Props) {
  const isFull = variant === 'full';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isFull && styles.buttonFull, isDisabled && styles.buttonDisabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={[styles.label, isFull && styles.labelFull]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  buttonFull: {
    minHeight: 46,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  labelFull: {
    fontSize: 16,
  },
});
