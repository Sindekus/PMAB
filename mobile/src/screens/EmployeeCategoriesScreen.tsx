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
import type { ServiceCategory } from '../types';

type FormState = {
  id: number | null;
  name: string;
  description: string;
};

const emptyForm: FormState = { id: null, name: '', description: '' };

type Props = {
  onBack?: () => void;
};

export function EmployeeCategoriesScreen({ onBack }: Props = {}) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/service-categories`);

      if (!response.ok) {
        setError('Nie udalo sie pobrac kategorii.');
        return;
      }

      setCategories(await response.json());
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

  function openEdit(category: ServiceCategory) {
    setError('');
    setForm({
      id: category.id,
      name: category.name,
      description: category.description,
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.description.trim()) {
      setError('Uzupelnij nazwe i opis kategorii.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        form.id
          ? `${API_BASE_URL}/api/service-categories/${form.id}`
          : `${API_BASE_URL}/api/service-categories`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
          }),
        });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie zapisac kategorii.');
        return;
      }

      const saved: ServiceCategory = await response.json();

      setCategories((current) => {
        if (!form.id) {
          return [...current, saved].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
        }

        return current
          .map((c) => (c.id === saved.id ? saved : c))
          .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(category: ServiceCategory) {
    Alert.alert('Usunac kategorie?', `Kategoria ${category.name} zostanie ukryta.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => void deleteCategory(category.id) },
    ]);
  }

  async function deleteCategory(id: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/service-categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await safeMessage(response);
        setError(message ?? 'Nie udalo sie usunac kategorii.');
        return;
      }

      setCategories((current) => current.filter((c) => c.id !== id));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <ScreenHeader
        kicker="Slownik"
        title="Kategorie uslug"
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
          {categories.length === 0 ? (
            <EmptyState text="Brak kategorii do wyswietlenia." />
          ) : (
            categories.map((category) => (
              <Card key={category.id}>
                <Text style={styles.title}>{category.name}</Text>
                <Text style={styles.description}>{category.description}</Text>
                <View style={styles.actionsRow}>
                  <SecondaryButton label="Edytuj" onPress={() => openEdit(category)} fillRow />
                  <DangerButton label="Usun" onPress={() => confirmDelete(category)} fillRow />
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      <SheetModal
        visible={modalVisible}
        kicker={form.id ? 'Edycja' : 'Nowa kategoria'}
        title={form.id ? 'Edytuj kategorie' : 'Dodaj kategorie'}
        onClose={closeModal}
      >
        <FormField
          label="Nazwa"
          value={form.name}
          onChangeText={(value) => setForm((f) => ({ ...f, name: value }))}
          placeholder="np. Hamulce"
        />

        <FormField
          label="Opis"
          value={form.description}
          onChangeText={(value) => setForm((f) => ({ ...f, description: value }))}
          placeholder="Krotka charakterystyka kategorii"
          multiline
        />

        <PrimaryButton
          label={form.id ? 'Zapisz zmiany' : 'Dodaj kategorie'}
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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
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
