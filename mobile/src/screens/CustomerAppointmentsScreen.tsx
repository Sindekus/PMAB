import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Appointment, AppointmentStatus } from '../types';

const customerAppointments: Appointment[] = [
  {
    id: 1,
    time: '10:30',
    vehicle: 'Toyota Corolla',
    registrationNumber: 'KR 12345',
    services: 'Wymiana oleju',
    date: '08.05.2026',
    status: 'Potwierdzona',
  },
  {
    id: 2,
    time: '14:00',
    vehicle: 'BMW 3',
    registrationNumber: 'KRA 98765',
    services: 'Diagnostyka komputerowa',
    date: '12.05.2026',
    status: 'Nowa',
  },
];

export function CustomerAppointmentsScreen() {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.kicker}>Moje konto</Text>
        <Text style={styles.screenTitle}>Moje wizyty</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Najblizsza wizyta</Text>
        <Text style={styles.summaryValue}>08.05.2026, 10:30</Text>
        <Text style={styles.summaryMeta}>Toyota Corolla - wymiana oleju</Text>
      </View>

      <Text style={styles.sectionTitle}>Nadchodzace</Text>
      <View style={styles.cardList}>
        {customerAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </View>
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.appointmentTime}>
          {appointment.date}, {appointment.time}
        </Text>
        <StatusBadge status={appointment.status} />
      </View>
      <View style={styles.divider} />
      <Text style={styles.vehicleName}>{appointment.vehicle}</Text>
      <Text style={styles.vehicleMeta}>{appointment.registrationNumber}</Text>
      <Text style={styles.serviceName}>{appointment.services}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const statusStyle = {
    Nowa: styles.statusNew,
    Potwierdzona: styles.statusConfirmed,
    'W trakcie': styles.statusInProgress,
  }[status];

  return (
    <View style={[styles.statusBadge, statusStyle]}>
      <Text style={styles.statusText}>{status}</Text>
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  cardList: {
    gap: 12,
  },
  card: {
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
  appointmentTime: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusNew: {
    backgroundColor: '#E7F1FF',
  },
  statusConfirmed: {
    backgroundColor: '#E8F8EE',
  },
  statusInProgress: {
    backgroundColor: '#FFF3DF',
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
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
  vehicleMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  serviceName: {
    color: colors.text,
    fontSize: 15,
    marginTop: 12,
  },
});
