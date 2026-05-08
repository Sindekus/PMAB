import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  EmptyState,
  FormField,
  Loader,
  ScreenHeader,
  SegmentedOptions,
  StatusPill,
  type StatusTone,
} from '../components';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { AppointmentSummary } from '../types';

type DateMode = 'today' | 'tomorrow' | 'custom';

type Props = {
  onOpenAppointment: (appointmentId: number) => void;
};

export function EmployeeAppointmentsScreen({ onOpenAppointment }: Props) {
  const [mode, setMode] = useState<DateMode>('today');
  const [customDate, setCustomDate] = useState(toDateString(addDays(new Date(), 2)));
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, [mode, customDate]);

  async function load() {
    setError('');
    setIsLoading(true);

    const dateString = currentDateString(mode, customDate);

    if (!dateString) {
      setError('Podaj prawidlowa date w formacie YYYY-MM-DD.');
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments?date=${encodeURIComponent(dateString)}`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac wizyt.');
        return;
      }

      setAppointments(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  const counts = {
    total: appointments.length,
    inProgress: appointments.filter((a) => a.statusCode === 'InProgress').length,
    upcoming: appointments.filter((a) => a.statusCode === 'New' || a.statusCode === 'Confirmed').length,
  };

  return (
    <View style={styles.section}>
      <ScreenHeader kicker="Warsztat" title="Wizyty" />

      <SegmentedOptions
        options={[
          { value: 'today', label: 'Dzis' },
          { value: 'tomorrow', label: 'Jutro' },
          { value: 'custom', label: 'Inna data' },
        ]}
        selectedValue={mode}
        onSelect={setMode}
      />

      {mode === 'custom' ? (
        <FormField
          label="Data (YYYY-MM-DD)"
          value={customDate}
          onChangeText={setCustomDate}
          placeholder="2026-05-10"
        />
      ) : null}

      <View style={styles.metricsRow}>
        <Metric value={String(counts.total)} label="Wizyty" />
        <Metric value={String(counts.inProgress)} label="W trakcie" />
        <Metric value={String(counts.upcoming)} label="Nadchodzace" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.heading}>Harmonogram</Text>

      {isLoading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <EmptyState text="Brak wizyt na wybrany dzien." />
      ) : (
        <View style={styles.list}>
          {appointments.map((appointment) => (
            <Card key={appointment.id} onPress={() => onOpenAppointment(appointment.id)}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleArea}>
                  <Text style={styles.appointmentTime}>{formatTime(appointment.scheduledAt)}</Text>
                  <Text style={styles.customerName}>{appointment.customerName}</Text>
                </View>
                <StatusPill label={appointment.statusName} tone={statusTone(appointment.statusCode)} />
              </View>
              <View style={styles.divider} />
              <Text style={styles.vehicleName}>
                {appointment.vehicleBrandName} {appointment.vehicleModel}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>Uslugi: {appointment.servicesCount}</Text>
                <Text style={styles.meta}>{formatPrice(appointment.totalPrice)}</Text>
              </View>
              {appointment.employeeName ? (
                <Text style={styles.assigned}>Mechanik: {appointment.employeeName}</Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function statusTone(code: string): StatusTone {
  switch (code) {
    case 'New':
      return 'info';
    case 'Confirmed':
      return 'success';
    case 'InProgress':
      return 'warning';
    case 'Completed':
      return 'neutral';
    case 'Cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}

function currentDateString(mode: DateMode, custom: string) {
  if (mode === 'today') {
    return toDateString(new Date());
  }

  if (mode === 'tomorrow') {
    return toDateString(addDays(new Date(), 1));
  }

  if (/^(\d{4})-(\d{2})-(\d{2})$/.test(custom.trim())) {
    return custom.trim();
  }

  return null;
}

function toDateString(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatPrice(value: number) {
  return `${Number(value).toFixed(2)} zl`;
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    minHeight: 78,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleArea: {
    flexShrink: 1,
  },
  appointmentTime: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  customerName: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  vehicleName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  assigned: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
});
