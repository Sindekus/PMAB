import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  DangerButton,
  EmptyState,
  FormField,
  Loader,
  PrimaryButton,
  ScreenHeader,
  SegmentedOptions,
  SheetModal,
  StatusPill,
  type StatusTone,
} from '../components';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type {
  CustomerAppointmentSummary,
  Vehicle,
  WorkshopService,
} from '../types';

type FormState = {
  vehicleId: number | null;
  serviceIds: number[];
  date: string;
  time: string;
  notes: string;
};

const emptyForm: FormState = {
  vehicleId: null,
  serviceIds: [],
  date: '',
  time: '',
  notes: '',
};

type Props = {
  customerId: number | null;
};

export function CustomerAppointmentsScreen({ customerId }: Props) {
  const [appointments, setAppointments] = useState<CustomerAppointmentSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<WorkshopService[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadData();
  }, [customerId]);

  async function loadData() {
    if (!customerId) {
      setError('Brak powiazanego klienta dla zalogowanego konta.');
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const [appointmentsResponse, vehiclesResponse, servicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/appointments`),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/vehicles`),
        fetch(`${API_BASE_URL}/api/workshop-services`),
      ]);

      if (!appointmentsResponse.ok || !vehiclesResponse.ok || !servicesResponse.ok) {
        setError('Nie udalo sie pobrac danych wizyt.');
        return;
      }

      setAppointments(await appointmentsResponse.json());
      setVehicles(await vehiclesResponse.json());
      setServices(await servicesResponse.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  const upcomingSummary = useMemo(() => {
    const upcoming = appointments
      .filter((a) => a.statusCode !== 'Cancelled' && a.statusCode !== 'Completed')
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

    return upcoming[0] ?? null;
  }, [appointments]);

  function openCreate() {
    if (vehicles.length === 0) {
      Alert.alert('Brak aut', 'Najpierw dodaj auto w zakladce Auta.');
      return;
    }

    setError('');
    setForm({
      vehicleId: vehicles[0].id,
      serviceIds: [],
      date: defaultDateString(),
      time: '09:00',
      notes: '',
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!customerId || !form.vehicleId) {
      setError('Wybierz auto.');
      return;
    }

    if (form.serviceIds.length === 0) {
      setError('Wybierz przynajmniej jedna usluge.');
      return;
    }

    const scheduledAt = parseScheduledAt(form.date, form.time);

    if (!scheduledAt) {
      setError('Podaj prawidlowa date (YYYY-MM-DD) i godzine (HH:mm).');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          vehicleId: form.vehicleId,
          employeeId: null,
          scheduledAt,
          customerNotes: form.notes,
          workshopServiceIds: form.serviceIds,
        }),
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie utworzyc wizyty.');
        return;
      }

      closeModal();
      await loadData();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmCancel(appointment: CustomerAppointmentSummary) {
    Alert.alert(
      'Anulowac wizyte?',
      `${formatDate(appointment.scheduledAt)} - ${appointment.vehicleBrandName} ${appointment.vehicleModel}`,
      [
        { text: 'Wroc', style: 'cancel' },
        { text: 'Anuluj wizyte', style: 'destructive', onPress: () => void cancelAppointment(appointment.id) },
      ]);
  }

  async function cancelAppointment(appointmentId: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusCode: 'Cancelled' }),
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie anulowac wizyty.');
        return;
      }

      await loadData();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  function toggleService(serviceId: number) {
    setForm((current) => {
      if (current.serviceIds.includes(serviceId)) {
        return { ...current, serviceIds: current.serviceIds.filter((id) => id !== serviceId) };
      }

      return { ...current, serviceIds: [...current.serviceIds, serviceId] };
    });
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Moje konto"
        title="Wizyty"
        trailing={<PrimaryButton label="Umow" onPress={openCreate} />}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {upcomingSummary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Najblizsza wizyta</Text>
          <Text style={styles.summaryValue}>{formatDate(upcomingSummary.scheduledAt)}</Text>
          <Text style={styles.summaryMeta}>
            {upcomingSummary.vehicleBrandName} {upcomingSummary.vehicleModel}
          </Text>
        </View>
      ) : null}

      <Text style={styles.heading}>Historia</Text>

      {isLoading ? (
        <Loader />
      ) : appointments.length === 0 ? (
        <EmptyState text="Nie masz jeszcze umowionych wizyt." />
      ) : (
        <View style={styles.list}>
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <View style={styles.cardHeader}>
                <Text style={styles.appointmentDate}>{formatDate(appointment.scheduledAt)}</Text>
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
              {appointment.statusCode !== 'Cancelled' && appointment.statusCode !== 'Completed' ? (
                <View style={styles.actionsRow}>
                  <DangerButton label="Anuluj" onPress={() => confirmCancel(appointment)} fillRow />
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <SheetModal
        visible={modalVisible}
        kicker="Nowa wizyta"
        title="Umow wizyte"
        onClose={closeModal}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Auto</Text>
          <SegmentedOptions
            options={vehicles.map((vehicle) => ({
              value: vehicle.id,
              label: `${vehicle.brandName} ${vehicle.model}`,
            }))}
            selectedValue={form.vehicleId}
            onSelect={(value) => setForm((f) => ({ ...f, vehicleId: value }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Uslugi</Text>
          <View style={styles.servicesList}>
            {services.map((service) => {
              const selected = form.serviceIds.includes(service.id);

              return (
                <Card
                  key={service.id}
                  onPress={() => toggleService(service.id)}
                  style={selected ? styles.serviceCardSelected : undefined}
                >
                  <Text style={[styles.serviceName, selected && styles.serviceNameSelected]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.serviceMeta, selected && styles.serviceMetaSelected]}>
                    {service.serviceCategoryName} - {formatPrice(service.basePrice)} - {service.estimatedDurationMinutes} min
                  </Text>
                </Card>
              );
            })}
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={styles.formColumn}>
            <FormField
              label="Data"
              value={form.date}
              onChangeText={(value) => setForm((f) => ({ ...f, date: value }))}
              placeholder="2026-05-10"
            />
          </View>
          <View style={styles.formColumn}>
            <FormField
              label="Godzina"
              value={form.time}
              onChangeText={(value) => setForm((f) => ({ ...f, time: value }))}
              placeholder="09:00"
            />
          </View>
        </View>

        <FormField
          label="Uwagi"
          value={form.notes}
          onChangeText={(value) => setForm((f) => ({ ...f, notes: value }))}
          placeholder="Dodatkowe informacje dla warsztatu"
          multiline
        />

        <PrimaryButton
          label="Zapisz wizyte"
          onPress={handleSubmit}
          loading={isSubmitting}
          variant="full"
        />
      </SheetModal>
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

function formatPrice(value: number) {
  return `${Number(value).toFixed(2)} zl`;
}

function defaultDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${month}-${day}`;
}

function parseScheduledAt(date: string, time: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim());

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const [, year, month, day] = dateMatch;
  const [, hour, minute] = timeMatch;

  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const offsetMinutes = parsed.getTimezoneOffset();
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMin = String(absOffset % 60).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:00${offsetSign}${offsetHours}:${offsetMin}`;
}

async function safeMessage(response: Response): Promise<string | null> {
  try {
    const body = await response.json();
    return typeof body?.message === 'string' ? body.message : null;
  } catch {
    return null;
  }
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
  summaryCard: {
    padding: 16,
    backgroundColor: colors.text,
    borderRadius: 8,
  },
  summaryLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 8,
  },
  summaryMeta: {
    color: '#E5E5EA',
    fontSize: 14,
    marginTop: 6,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  appointmentDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
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
    marginTop: 12,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  formGroup: {
    gap: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  servicesList: {
    gap: 10,
  },
  serviceCardSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  serviceName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  serviceNameSelected: {
    color: colors.surface,
  },
  serviceMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
  },
  serviceMetaSelected: {
    color: '#E5E5EA',
  },
});
