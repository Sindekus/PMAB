import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function Loader() {
  return (
    <View style={styles.card}>
      <ActivityIndicator color={colors.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
});
