import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
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
import type { CustomerSummary } from '../types';

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
  onOpenCustomer: (customerId: number) => void;
};

export function EmployeeCustomersScreen({ onOpenCustomer }: Props) {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function loadCustomers() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac listy klientow.');
        return;
      }

      setCustomers(await response.json());
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

  function openEdit(customer: CustomerSummary) {
    setError('');
    setForm({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
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
          ? `${API_BASE_URL}/api/customers/${form.id}`
          : `${API_BASE_URL}/api/customers`,
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
        setError(message ?? 'Nie udalo sie zapisac klienta.');
        return;
      }

      const saved: CustomerSummary = await response.json();

      setCustomers((current) => {
        if (!form.id) {
          return [...current, saved].sort(byLastNameThenFirst);
        }

        return current
          .map((c) => (c.id === saved.id ? saved : c))
          .sort(byLastNameThenFirst);
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(customer: CustomerSummary) {
    Alert.alert(
      'Usunac klienta?',
      `${customer.firstName} ${customer.lastName} zostanie ukryty na liscie.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usun', style: 'destructive', onPress: () => void deleteCustomer(customer.id) },
      ]);
  }

  async function deleteCustomer(id: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac klienta.');
        return;
      }

      setCustomers((current) => current.filter((c) => c.id !== id));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Warsztat"
        title="Klienci"
        trailing={<PrimaryButton label="Dodaj" onPress={openCreate} />}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <Loader />
      ) : (
        <View style={styles.list}>
          {customers.length === 0 ? (
            <EmptyState text="Brak klientow do wyswietlenia." />
          ) : (
            customers.map((customer) => (
              <Card key={customer.id} onPress={() => onOpenCustomer(customer.id)}>
                <Text style={styles.name}>
                  {customer.firstName} {customer.lastName}
                </Text>
                <Text style={styles.contact}>{customer.email}</Text>
                <Text style={styles.contact}>{customer.phoneNumber}</Text>
                <Text style={styles.vehiclesMeta}>
                  Auta: {customer.vehiclesCount}
                </Text>
                <View style={styles.actionsRow}>
                  <SecondaryButton label="Edytuj" onPress={() => openEdit(customer)} fillRow />
                  <DangerButton label="Usun" onPress={() => confirmDelete(customer)} fillRow />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      <SheetModal
        visible={modalVisible}
        kicker={form.id ? 'Edycja' : 'Nowy klient'}
        title={form.id ? 'Edytuj klienta' : 'Dodaj klienta'}
        onClose={closeModal}
      >
        <FormField
          label="Imie"
          value={form.firstName}
          onChangeText={(value) => setForm((f) => ({ ...f, firstName: value }))}
          placeholder="np. Jan"
          autoCapitalize="words"
        />

        <FormField
          label="Nazwisko"
          value={form.lastName}
          onChangeText={(value) => setForm((f) => ({ ...f, lastName: value }))}
          placeholder="np. Kowalski"
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
          label={form.id ? 'Zapisz zmiany' : 'Dodaj klienta'}
          onPress={handleSave}
          loading={isSubmitting}
          variant="full"
        />
      </SheetModal>
    </View>
  );
}

function byLastNameThenFirst(a: CustomerSummary, b: CustomerSummary) {
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
  vehiclesMeta: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
