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
import type { VehicleBrand } from '../types';

type FormState = {
  id: number | null;
  name: string;
};

const emptyForm: FormState = { id: null, name: '' };

type Props = {
  onBack?: () => void;
};

export function EmployeeBrandsScreen({ onBack }: Props = {}) {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadBrands();
  }, []);

  async function loadBrands() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle-brands`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac listy marek.');
        return;
      }

      setBrands(await response.json());
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

  function openEdit(brand: VehicleBrand) {
    setError('');
    setForm({ id: brand.id, name: brand.name });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    const name = form.name.trim();

    if (!name) {
      setError('Nazwa marki jest wymagana.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        form.id
          ? `${API_BASE_URL}/api/vehicle-brands/${form.id}`
          : `${API_BASE_URL}/api/vehicle-brands`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie zapisac marki.');
        return;
      }

      const saved: VehicleBrand = await response.json();

      setBrands((current) => {
        if (!form.id) {
          return [...current, saved].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
        }

        return current
          .map((b) => (b.id === saved.id ? saved : b))
          .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(brand: VehicleBrand) {
    Alert.alert('Usunac marke?', `Marka ${brand.name} zostanie ukryta.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => void deleteBrand(brand.id) },
    ]);
  }

  async function deleteBrand(id: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle-brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac marki.');
        return;
      }

      setBrands((current) => current.filter((b) => b.id !== id));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Slownik"
        title="Marki aut"
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
          {brands.length === 0 ? (
            <EmptyState text="Brak marek do wyswietlenia." />
          ) : (
            brands.map((brand) => (
              <Card key={brand.id}>
                <Text style={styles.brandName}>{brand.name}</Text>
                <View style={styles.actionsRow}>
                  <SecondaryButton label="Edytuj" onPress={() => openEdit(brand)} fillRow />
                  <DangerButton label="Usun" onPress={() => confirmDelete(brand)} fillRow />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      <SheetModal
        visible={modalVisible}
        kicker={form.id ? 'Edycja' : 'Nowa marka'}
        title={form.id ? 'Edytuj marke' : 'Dodaj marke'}
        onClose={closeModal}
      >
        <FormField
          label="Nazwa"
          value={form.name}
          onChangeText={(value) => setForm((f) => ({ ...f, name: value }))}
          placeholder="np. Toyota"
        />

        <PrimaryButton
          label={form.id ? 'Zapisz zmiany' : 'Dodaj marke'}
          onPress={handleSave}
          loading={isSubmitting}
          variant="full"
        />
      </SheetModal>
    </View>
  );
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
  brandName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
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
