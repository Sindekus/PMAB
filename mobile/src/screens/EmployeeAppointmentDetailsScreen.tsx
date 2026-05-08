import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  BackHeaderButton,
  Card,
  DangerButton,
  EmptyState,
  FormField,
  Loader,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SegmentedOptions,
  SheetModal,
  StatusPill,
  type StatusTone,
} from '../components';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type {
  AppointmentDetails,
  AppointmentStatusOption,
  WorkshopService,
} from '../types';

type Props = {
  appointmentId: number;
  employeeId: number | null;
  onBack: () => void;
};

export function EmployeeAppointmentDetailsScreen({ appointmentId, employeeId, onBack }: Props) {
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [statuses, setStatuses] = useState<AppointmentStatusOption[]>([]);
  const [services, setServices] = useState<WorkshopService[]>([]);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, [appointmentId]);

  async function load() {
    setError('');
    setIsLoading(true);

    try {
      const [appointmentResponse, statusesResponse, servicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`),
        fetch(`${API_BASE_URL}/api/appointment-statuses`),
        fetch(`${API_BASE_URL}/api/workshop-services`),
      ]);

      if (!appointmentResponse.ok) {
        setError('Nie udalo sie pobrac wizyty.');
        return;
      }

      setAppointment(await appointmentResponse.json());

      if (statusesResponse.ok) {
        setStatuses(await statusesResponse.json());
      }

      if (servicesResponse.ok) {
        setServices(await servicesResponse.json());
      }
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  async function changeStatus(code: string) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusCode: code }),
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie zmienic statusu.');
        return;
      }

      setAppointment(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  function openAddService() {
    if (!appointment) {
      return;
    }

    const usedIds = new Set(appointment.services.map((s) => s.workshopServiceId));
    const available = services.filter((service) => !usedIds.has(service.id));

    if (available.length === 0) {
      Alert.alert('Brak uslug', 'Wszystkie aktywne uslugi sa juz dodane do wizyty.');
      return;
    }

    setSelectedServiceId(available[0].id);
    setServiceModalVisible(true);
  }

  async function handleAddService() {
    if (!selectedServiceId) {
      return;
    }

    setIsSavingService(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopServiceId: selectedServiceId }),
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie dodac uslugi.');
        return;
      }

      setAppointment(await response.json());
      setServiceModalVisible(false);
      setSelectedServiceId(null);
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSavingService(false);
    }
  }

  function confirmRemoveService(itemId: number, name: string) {
    Alert.alert('Usunac usluge?', `Pozycja "${name}" zostanie usunieta z wizyty.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => void removeService(itemId) },
    ]);
  }

  async function removeService(itemId: number) {
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/services/${itemId}`,
        { method: 'DELETE' });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac uslugi.');
        return;
      }

      setAppointment(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  async function handleAddNote() {
    if (!noteContent.trim()) {
      setError('Wpisz tresc notatki.');
      return;
    }

    if (!employeeId) {
      setError('Konto pracownika nie jest powiazane z baza.');
      return;
    }

    setIsSavingNote(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          content: noteContent,
        }),
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie dodac notatki.');
        return;
      }

      setAppointment(await response.json());
      setNoteContent('');
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSavingNote(false);
    }
  }

  function confirmRemoveNote(noteId: number) {
    Alert.alert('Usunac notatke?', 'Notatka zostanie usunieta z wizyty.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => void removeNote(noteId) },
    ]);
  }

  async function removeNote(noteId: number) {
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/notes/${noteId}`,
        { method: 'DELETE' });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac notatki.');
        return;
      }

      setAppointment(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  if (isLoading) {
    return (
      <View style={styles.section}>
        <ScreenHeader
          kicker="Wizyta"
          title="Szczegoly"
          trailing={<BackHeaderButton onPress={onBack} />}
        />
        <Loader />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.section}>
        <ScreenHeader
          kicker="Wizyta"
          title="Szczegoly"
          trailing={<BackHeaderButton onPress={onBack} />}
        />
        <EmptyState text={error || 'Brak wizyty.'} />
      </View>
    );
  }

  const availableServices = services.filter(
    (service) => !appointment.services.some((s) => s.workshopServiceId === service.id));

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Wizyta"
        title={formatDate(appointment.scheduledAt)}
        trailing={<BackHeaderButton onPress={onBack} />}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{appointment.customerName}</Text>
          <StatusPill label={appointment.statusName} tone={statusTone(appointment.statusCode)} />
        </View>
        <Text style={styles.contact}>{appointment.customerPhone}</Text>
        <View style={styles.divider} />
        <Text style={styles.vehicleTitle}>
          {appointment.vehicleBrandName} {appointment.vehicleModel}
        </Text>
        <Text style={styles.contact}>Rocznik {appointment.vehicleYear}</Text>
        {appointment.employeeName ? (
          <Text style={styles.assigned}>Mechanik: {appointment.employeeName}</Text>
        ) : null}
        {appointment.customerNotes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Uwagi klienta</Text>
            <Text style={styles.notesContent}>{appointment.customerNotes}</Text>
          </View>
        ) : null}
      </Card>

      <Text style={styles.heading}>Status</Text>
      {statuses.length > 0 ? (
        <SegmentedOptions
          options={statuses.map((status) => ({ value: status.code, label: status.name }))}
          selectedValue={appointment.statusCode}
          onSelect={(value) => void changeStatus(value)}
        />
      ) : null}

      <View style={styles.headingRow}>
        <Text style={styles.heading}>Uslugi</Text>
        <PrimaryButton label="Dodaj usluge" onPress={openAddService} />
      </View>

      {appointment.services.length === 0 ? (
        <EmptyState text="Brak uslug w wizycie." />
      ) : (
        <View style={styles.list}>
          {appointment.services.map((service) => (
            <Card key={service.id}>
              <Text style={styles.serviceCategory}>{service.categoryName}</Text>
              <Text style={styles.serviceName}>{service.serviceName}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{service.durationMinutes} min</Text>
                <Text style={styles.meta}>{formatPrice(service.price)}</Text>
              </View>
              <View style={styles.actionsRow}>
                <DangerButton
                  label="Usun"
                  onPress={() => confirmRemoveService(service.id, service.serviceName)}
                  fillRow
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      <Card>
        <Text style={styles.totalLabel}>Suma</Text>
        <Text style={styles.totalValue}>{formatPrice(appointment.totalPrice)}</Text>
      </Card>

      <Text style={styles.heading}>Notatki</Text>

      <Card>
        <FormField
          label="Nowa notatka"
          value={noteContent}
          onChangeText={setNoteContent}
          placeholder="Co zostalo wykonane lub zauwazone"
          multiline
        />
        <View style={styles.noteButton}>
          <PrimaryButton
            label="Dodaj notatke"
            onPress={handleAddNote}
            loading={isSavingNote}
            variant="full"
          />
        </View>
      </Card>

      {appointment.notes.length === 0 ? (
        <EmptyState text="Brak notatek dla tej wizyty." />
      ) : (
        <View style={styles.list}>
          {appointment.notes.map((note) => (
            <Card key={note.id}>
              <Text style={styles.noteAuthor}>{note.employeeName}</Text>
              <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
              <Text style={styles.noteContent}>{note.content}</Text>
              <View style={styles.actionsRow}>
                <SecondaryButton
                  label="Usun notatke"
                  onPress={() => confirmRemoveNote(note.id)}
                  fillRow
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      <SheetModal
        visible={serviceModalVisible}
        kicker="Wizyta"
        title="Dodaj usluge"
        onClose={() => setServiceModalVisible(false)}
      >
        <Text style={styles.label}>Dostepne uslugi</Text>
        <SegmentedOptions
          options={availableServices.map((service) => ({
            value: service.id,
            label: service.name,
          }))}
          selectedValue={selectedServiceId}
          onSelect={setSelectedServiceId}
        />

        <PrimaryButton
          label="Dodaj do wizyty"
          onPress={handleAddService}
          loading={isSavingService}
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  customerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  contact: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  vehicleTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  assigned: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  notesBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  notesLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  notesContent: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  list: {
    gap: 12,
  },
  serviceCategory: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  serviceName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  noteButton: {
    marginTop: 12,
  },
  noteAuthor: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  noteDate: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  noteContent: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
