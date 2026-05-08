import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  text: string;
};

export function EmptyState({ text }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  text: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
