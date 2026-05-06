import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  kicker: string;
  title: string;
  text: string;
};

export function PlaceholderScreen({ kicker, title, text }: Props) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.screenTitle}>{title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.placeholderText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  screenTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 3,
  },
  card: {
    padding: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
