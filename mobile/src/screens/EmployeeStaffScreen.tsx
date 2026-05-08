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
  SheetModal,
} from '../components';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { Employee } from '../types';

type FormState = {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

const emptyForm: FormState = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
};

type Props = {
  onBack?: () => void;
};

export function EmployeeStaffScreen({ onBack }: Props = {}) {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadStaff();
  }, []);

  async function loadStaff() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac listy zespolu.');
        return;
      }

      setStaff(await response.json());
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setError('');
    setForm(emptyForm);
    setModalVisible(true);
  }

  function openEdit(employee: Employee) {
    setError('');
    setForm({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Imie i nazwisko sa wymagane.');
      return;
    }

    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Podaj poprawny adres email.');
      return;
    }

    if (!form.phoneNumber.trim()) {
      setError('Numer telefonu jest wymagany.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        form.id
          ? `${API_BASE_URL}/api/employees/${form.id}`
          : `${API_BASE_URL}/api/employees`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: form.phoneNumber,
          }),
        });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie zapisac pracownika.');
        return;
      }

      const saved: Employee = await response.json();

      setStaff((current) => {
        if (!form.id) {
          return [...current, saved].sort(byLastNameThenFirst);
        }

        return current
          .map((e) => (e.id === saved.id ? saved : e))
          .sort(byLastNameThenFirst);
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(employee: Employee) {
    Alert.alert(
      'Usunac pracownika?',
      `${employee.firstName} ${employee.lastName} zostanie ukryty na liscie.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usun', style: 'destructive', onPress: () => void deleteEmployee(employee.id) },
      ]);
  }

  async function deleteEmployee(id: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac pracownika.');
        return;
      }

      setStaff((current) => current.filter((e) => e.id !== id));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Warsztat"
        title="Zespol"
        trailing={
          <View style={styles.headerActions}>
            {onBack ? <BackHeaderButton onPress={onBack} /> : null}
            <PrimaryButton label="Dodaj" onPress={openCreate} />
          </View>
        }
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <Loader />
      ) : (
        <View style={styles.list}>
          {staff.length === 0 ? (
            <EmptyState text="Brak pracownikow do wyswietlenia." />
          ) : (
            staff.map((employee) => (
              <Card key={employee.id}>
                <Text style={styles.name}>
                  {employee.firstName} {employee.lastName}
                </Text>
                <Text style={styles.contact}>{employee.email}</Text>
                <Text style={styles.contact}>{employee.phoneNumber}</Text>
                <View style={styles.actionsRow}>
                  <SecondaryButton label="Edytuj" onPress={() => openEdit(employee)} fillRow />
                  <DangerButton label="Usun" onPress={() => confirmDelete(employee)} fillRow />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      <SheetModal
        visible={modalVisible}
        kicker={form.id ? 'Edycja' : 'Nowy pracownik'}
        title={form.id ? 'Edytuj pracownika' : 'Dodaj pracownika'}
        onClose={closeModal}
      >
        <FormField
          label="Imie"
          value={form.firstName}
          onChangeText={(value) => setForm((f) => ({ ...f, firstName: value }))}
          placeholder="np. Adam"
          autoCapitalize="words"
        />

        <FormField
          label="Nazwisko"
          value={form.lastName}
          onChangeText={(value) => setForm((f) => ({ ...f, lastName: value }))}
          placeholder="np. Mechanik"
          autoCapitalize="words"
        />

        <FormField
          label="Email"
          value={form.email}
          onChangeText={(value) => setForm((f) => ({ ...f, email: value }))}
          placeholder="adres@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormField
          label="Telefon"
          value={form.phoneNumber}
          onChangeText={(value) => setForm((f) => ({ ...f, phoneNumber: value }))}
          placeholder="500 100 200"
          keyboardType="phone-pad"
        />

        <PrimaryButton
          label={form.id ? 'Zapisz zmiany' : 'Dodaj pracownika'}
          onPress={handleSave}
          loading={isSubmitting}
          variant="full"
        />
      </SheetModal>
    </View>
  );
}

function byLastNameThenFirst(a: Employee, b: Employee) {
  const last = a.lastName.localeCompare(b.lastName, 'pl');
  return last !== 0 ? last : a.firstName.localeCompare(b.firstName, 'pl');
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
  list: {
    gap: 12,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  contact: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
