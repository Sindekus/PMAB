import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

type Props = {
  customerId: number | null;
};

export function CustomerVehiclesScreen({ customerId }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engineType, setEngineType] = useState('Benzyna');
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

      if (!selectedBrandId && brandsData.length > 0) {
        setSelectedBrandId(brandsData[0].id);
      }
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddVehicle() {
    if (!customerId || !selectedBrandId) {
      setError('Wybierz marke pojazdu.');
      return;
    }

    const parsedYear = Number(year);

    if (!model.trim() || !parsedYear) {
      setError('Uzupelnij model i rok pojazdu.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleBrandId: selectedBrandId,
          model,
          year: parsedYear,
          engineType,
        }),
      });

      if (!response.ok) {
        setError('Nie udalo sie dodac auta.');
        return;
      }

      const createdVehicle = await response.json();
      setVehicles((currentVehicles) => [...currentVehicles, createdVehicle]);
      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    setModalVisible(false);
    setModel('');
    setYear('');
    setEngineType('Benzyna');
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.kicker}>Moje konto</Text>
        <Text style={styles.screenTitle}>Auta</Text>
      </View>

      <View style={styles.addButtonWrap}>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
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
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
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
                <Text style={styles.kicker}>Nowe auto</Text>
                <Text style={styles.modalTitle}>Dodaj auto</Text>
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
                    const selected = brand.id === selectedBrandId;

                    return (
                      <Pressable
                        key={brand.id}
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        onPress={() => setSelectedBrandId(brand.id)}
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
                  value={model}
                  onChangeText={setModel}
                  placeholder="np. Corolla"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Rok</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
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
                    const selected = type === engineType;

                    return (
                      <Pressable
                        key={type}
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        onPress={() => setEngineType(type)}
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
                onPress={handleAddVehicle}
                disabled={isSubmitting}
                style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Zapisz auto</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <View style={styles.vehicleCard}>
      <Text style={styles.vehicleTitle}>
        {vehicle.brandName} {vehicle.model}
      </Text>
      <View style={styles.vehicleMetaRow}>
        <Text style={styles.vehicleMeta}>{vehicle.year}</Text>
        <Text style={styles.vehicleMeta}>{vehicle.engineType}</Text>
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
