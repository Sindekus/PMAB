import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Appointment, AppointmentStatus } from '../types';

const employeeAppointments: Appointment[] = [
  {
    id: 1,
    time: '09:00',
    customer: 'Jan Kowalski',
    vehicle: 'Toyota Corolla',
    registrationNumber: 'KR 12345',
    services: 'Wymiana oleju',
    status: 'Nowa',
  },
  {
    id: 2,
    time: '11:30',
    customer: 'Anna Nowak',
    vehicle: 'BMW 3',
    registrationNumber: 'KRA 98765',
    services: 'Diagnostyka komputerowa',
    status: 'W trakcie',
  },
];

export function EmployeeTodayScreen() {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.kicker}>Warsztat</Text>
          <Text style={styles.screenTitle}>Wizyty dzisiaj</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>06.05</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric value="6" label="Wizyty" />
        <Metric value="2" label="W trakcie" />
        <Metric value="1" label="Nowe" />
      </View>

      <Text style={styles.sectionTitle}>Harmonogram</Text>
      <View style={styles.cardList}>
        {employeeAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </View>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.appointmentTime}>{appointment.time}</Text>
          <Text style={styles.customerName}>{appointment.customer}</Text>
        </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
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
  dateBadge: {
    minHeight: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  dateBadgeText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
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
  customerName: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
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
