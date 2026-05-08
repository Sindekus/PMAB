import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  kicker: string;
  title: string;
  trailing?: ReactNode;
};

export function ScreenHeader({ kicker, title, trailing }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titleArea}>
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  titleArea: {
    flexShrink: 1,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 3,
  },
});
