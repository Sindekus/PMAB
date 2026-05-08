import { StyleSheet, Text, View } from 'react-native';
import { Card, ScreenHeader } from '../components';
import { colors } from '../theme';

export type AdminScreenKey = 'brands' | 'categories' | 'staff';

type Props = {
  onSelect: (key: AdminScreenKey) => void;
};

export function EmployeeAdminHubScreen({ onSelect }: Props) {
  return (
    <View style={styles.section}>
      <ScreenHeader kicker="Warsztat" title="Slowniki" />

      <View style={styles.list}>
        <Card onPress={() => onSelect('brands')}>
          <Text style={styles.kicker}>Slownik</Text>
          <Text style={styles.title}>Marki aut</Text>
          <Text style={styles.description}>
            Marki dostepne dla klientow przy dodawaniu auta.
          </Text>
        </Card>

        <Card onPress={() => onSelect('categories')}>
          <Text style={styles.kicker}>Slownik</Text>
          <Text style={styles.title}>Kategorie uslug</Text>
          <Text style={styles.description}>
            Grupy uslug warsztatowych widoczne w cenniku.
          </Text>
        </Card>

        <Card onPress={() => onSelect('staff')}>
          <Text style={styles.kicker}>Warsztat</Text>
          <Text style={styles.title}>Zespol</Text>
          <Text style={styles.description}>
            Pracownicy widoczni jako mechanicy przy wizytach.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  list: {
    gap: 12,
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
