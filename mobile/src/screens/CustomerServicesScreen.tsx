import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { WorkshopService } from '../types';

export function CustomerServicesScreen() {
  const [services, setServices] = useState<WorkshopService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadServices();
  }, []);

  async function loadServices() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/workshop-services`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac uslug.');
        return;
      }

      setServices(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.kicker}>Oferta</Text>
        <Text style={styles.screenTitle}>Uslugi</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.blue} />
        </View>
      ) : (
        <View style={styles.cardList}>
          {services.length === 0 ? (
            <View style={styles.serviceCard}>
              <Text style={styles.emptyText}>Brak dostepnych uslug.</Text>
            </View>
          ) : (
            services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          )}
        </View>
      )}
    </View>
  );
}

function ServiceCard({ service }: { service: WorkshopService }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleArea}>
          <Text style={styles.categoryText}>{service.serviceCategoryName}</Text>
          <Text style={styles.serviceTitle}>{service.name}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(service.basePrice)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{service.description}</Text>
      <Text style={styles.duration}>{service.estimatedDurationMinutes} min</Text>
    </View>
  );
}

function formatPrice(price: number) {
  return `${Number(price).toFixed(2)} zl`;
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
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  cardList: {
    gap: 12,
  },
  serviceCard: {
    padding: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleArea: {
    flex: 1,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  serviceTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  priceBadge: {
    minHeight: 34,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F1FF',
    borderRadius: 8,
  },
  priceText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
  },
  duration: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
