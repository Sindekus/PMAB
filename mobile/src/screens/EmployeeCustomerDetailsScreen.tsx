import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BackHeaderButton,
  Card,
  EmptyState,
  Loader,
  ScreenHeader,
} from '../components';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { CustomerDetails, CustomerAppointmentSummary } from '../types';

type Props = {
  customerId: number;
  onBack: () => void;
};

export function EmployeeCustomerDetailsScreen({ customerId, onBack }: Props) {
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [appointments, setAppointments] = useState<CustomerAppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadData();
  }, [customerId]);

  async function loadData() {
    setError('');
    setIsLoading(true);

    try {
      const [detailsResponse, appointmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/appointments`),
      ]);

      if (!detailsResponse.ok) {
        setError('Nie udalo sie pobrac danych klienta.');
        return;
      }

      setDetails(await detailsResponse.json());

      if (appointmentsResponse.ok) {
        setAppointments(await appointmentsResponse.json());
      } else {
        setAppointments([]);
      }
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.section}>
        <ScreenHeader
          kicker="Klient"
          title="Szczegoly"
          trailing={<BackHeaderButton onPress={onBack} />}
        />
        <Loader />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.section}>
        <ScreenHeader
          kicker="Klient"
          title="Szczegoly"
          trailing={<BackHeaderButton onPress={onBack} />}
        />
        <EmptyState text={error || 'Brak danych klienta.'} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Klient"
        title={`${details.firstName} ${details.lastName}`}
        trailing={<BackHeaderButton onPress={onBack} />}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Card>
        <Text style={styles.sectionLabel}>Kontakt</Text>
        <Text style={styles.contact}>{details.email}</Text>
        <Text style={styles.contact}>{details.phoneNumber}</Text>
      </Card>

      <Text style={styles.heading}>Auta klienta</Text>
      {details.vehicles.length === 0 ? (
        <EmptyState text="Klient nie ma jeszcze dodanych aut." />
      ) : (
        <View style={styles.list}>
          {details.vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <Text style={styles.vehicleTitle}>
                {vehicle.brandName} {vehicle.model}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{vehicle.year}</Text>
                <Text style={styles.meta}>{vehicle.engineType}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Text style={styles.heading}>Historia wizyt</Text>
      {appointments.length === 0 ? (
        <EmptyState text="Brak wizyt powiazanych z klientem." />
      ) : (
        <View style={styles.list}>
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <Text style={styles.appointmentDate}>
                {formatDate(appointment.scheduledAt)}
              </Text>
              <Text style={styles.appointmentVehicle}>
                {appointment.vehicleBrandName} {appointment.vehicleModel}
              </Text>
              <Text style={styles.appointmentStatus}>{appointment.statusName}</Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  return `${day}.${month}.${date.getFullYear()}, ${time}`;
}

const styles = StyleSheet.create({
  section: {
    gap: 18,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  contact: {
    color: colors.text,
    fontSize: 15,
    marginTop: 8,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  vehicleTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  appointmentVehicle: {
    color: colors.text,
    fontSize: 15,
    marginTop: 6,
  },
  appointmentStatus: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
});
