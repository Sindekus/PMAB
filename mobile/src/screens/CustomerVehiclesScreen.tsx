import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { Vehicle, VehicleBrand } from '../types';

const engineTypes = ['Benzyna', 'Diesel'];

type VehicleFormState = {
  id: number | null;
  vehicleBrandId: number | null;
  model: string;
  year: string;
  engineType: string;
};

const emptyForm: VehicleFormState = {
  id: null,
  vehicleBrandId: null,
  model: '',
  year: '',
  engineType: 'Benzyna',
};

type Props = {
  customerId: number | null;
};

export function CustomerVehiclesScreen({ customerId }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
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
      const [vehiclesResponse, brandsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}/vehicles`),
        fetch(`${API_BASE_URL}/api/vehicle-brands`),
      ]);

      if (!vehiclesResponse.ok || !brandsResponse.ok) {
        setError('Nie udalo sie pobrac aut klienta.');
        return;
      }

      const vehiclesData = await vehiclesResponse.json();
      const brandsData = await brandsResponse.json();

      setVehicles(vehiclesData);
      setBrands(brandsData);
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setError('');
    setForm({
      ...emptyForm,
      vehicleBrandId: brands[0]?.id ?? null,
    });
    setModalVisible(true);
  }

  function openEditModal(vehicle: Vehicle) {
    setError('');
    setForm({
      id: vehicle.id,
      vehicleBrandId: vehicle.vehicleBrandId,
      model: vehicle.model,
      year: String(vehicle.year),
      engineType: vehicle.engineType,
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!customerId || !form.vehicleBrandId) {
      setError('Wybierz marke pojazdu.');
      return;
    }

    const parsedYear = Number(form.year);

    if (!form.model.trim() || !parsedYear) {
      setError('Uzupelnij model i rok pojazdu.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = {
      vehicleBrandId: form.vehicleBrandId,
      model: form.model,
      year: parsedYear,
      engineType: form.engineType,
    };

    try {
      const response = await fetch(
        form.id
          ? `${API_BASE_URL}/api/customers/${customerId}/vehicles/${form.id}`
          : `${API_BASE_URL}/api/customers/${customerId}/vehicles`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

      if (!response.ok) {
        setError('Nie udalo sie zapisac auta.');
        return;
      }

      const saved: Vehicle = await response.json();

      setVehicles((current) => {
        if (!form.id) {
          return [...current, saved];
        }

        return current.map((v) => (v.id === saved.id ? saved : v));
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(vehicle: Vehicle) {
    Alert.alert(
      'Usunac auto?',
      `${vehicle.brandName} ${vehicle.model} zostanie usuniete z listy.`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usun', style: 'destructive', onPress: () => void deleteVehicle(vehicle.id) },
      ]);
  }

  async function deleteVehicle(vehicleId: number) {
    if (!customerId) {
      return;
    }

    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customers/${customerId}/vehicles/${vehicleId}`,
        { method: 'DELETE' });

      if (!response.ok) {
        setError('Nie udalo sie usunac auta.');
        return;
      }

      setVehicles((current) => current.filter((v) => v.id !== vehicleId));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.kicker}>Moje konto</Text>
        <Text style={styles.screenTitle}>Auta</Text>
      </View>

      <View style={styles.addButtonWrap}>
        <Pressable style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonTitle}>Dodaj auto</Text>
          <Text style={styles.addButtonSubtitle}>Marka, model, rok i typ silnika</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Lista aut</Text>

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.blue} />
        </View>
      ) : (
        <View style={styles.cardList}>
          {vehicles.length === 0 ? (
            <View style={styles.vehicleCard}>
              <Text style={styles.emptyText}>Nie masz jeszcze dodanych aut.</Text>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={() => openEditModal(vehicle)}
                onDelete={() => confirmDelete(vehicle)}
              />
            ))
          )}
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.kicker}>{form.id ? 'Edycja' : 'Nowe auto'}</Text>
                <Text style={styles.modalTitle}>{form.id ? 'Edytuj auto' : 'Dodaj auto'}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Zamknij</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Marka</Text>
                <View style={styles.optionGrid}>
                  {brands.map((brand) => {
                    const selected = brand.id === form.vehicleBrandId;

                    return (
                      <Pressable
                        key={brand.id}
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        onPress={() => setForm((f) => ({ ...f, vehicleBrandId: brand.id }))}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                          {brand.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Model</Text>
                <TextInput
                  value={form.model}
                  onChangeText={(value) => setForm((f) => ({ ...f, model: value }))}
                  placeholder="np. Corolla"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Rok</Text>
                <TextInput
                  value={form.year}
                  onChangeText={(value) => setForm((f) => ({ ...f, year: value }))}
                  keyboardType="number-pad"
                  placeholder="np. 2019"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Silnik</Text>
                <View style={styles.optionGrid}>
                  {engineTypes.map((type) => {
                    const selected = type === form.engineType;

                    return (
                      <Pressable
                        key={type}
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        onPress={() => setForm((f) => ({ ...f, engineType: type }))}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                          {type}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                onPress={handleSave}
                disabled={isSubmitting}
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>{form.id ? 'Zapisz zmiany' : 'Zapisz auto'}</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.vehicleCard}>
      <Text style={styles.vehicleTitle}>
        {vehicle.brandName} {vehicle.model}
      </Text>
      <View style={styles.vehicleMetaRow}>
        <Text style={styles.vehicleMeta}>{vehicle.year}</Text>
        <Text style={styles.vehicleMeta}>{vehicle.engineType}</Text>
      </View>
      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryButton} onPress={onEdit}>
          <Text style={styles.secondaryButtonText}>Edytuj</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Usun</Text>
        </Pressable>
      </View>
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
  addButtonWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  addButton: {
    width: '76%',
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  addButtonTitle: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  addButtonSubtitle: {
    color: '#DCEBFF',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingCard: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  cardList: {
    gap: 12,
  },
  vehicleCard: {
    padding: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  vehicleTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  vehicleMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE8E6',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  modalPanel: {
    height: '92%',
    padding: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 3,
  },
  closeButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
  },
  modalContent: {
    gap: 16,
    paddingBottom: 28,
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: colors.surface,
  },
  submitButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
