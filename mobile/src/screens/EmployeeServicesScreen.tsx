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
import type { ServiceCategory, WorkshopService } from '../types';

type ServiceFormState = {
  id: number | null;
  serviceCategoryId: number | null;
  name: string;
  description: string;
  basePrice: string;
  estimatedDurationMinutes: string;
};

const emptyForm: ServiceFormState = {
  id: null,
  serviceCategoryId: null,
  name: '',
  description: '',
  basePrice: '',
  estimatedDurationMinutes: '',
};

export function EmployeeServicesScreen() {
  const [services, setServices] = useState<WorkshopService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setError('');
    setIsLoading(true);

    try {
      const [servicesResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/workshop-services`),
        fetch(`${API_BASE_URL}/api/service-categories`),
      ]);

      if (!servicesResponse.ok || !categoriesResponse.ok) {
        setError('Nie udalo sie pobrac uslug.');
        return;
      }

      const servicesData = await servicesResponse.json();
      const categoriesData = await categoriesResponse.json();

      setServices(servicesData);
      setCategories(categoriesData);
      setForm((currentForm) => ({
        ...currentForm,
        serviceCategoryId: currentForm.serviceCategoryId ?? categoriesData[0]?.id ?? null,
      }));
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
      serviceCategoryId: categories[0]?.id ?? null,
    });
    setModalVisible(true);
  }

  function openEditModal(service: WorkshopService) {
    setError('');
    setForm({
      id: service.id,
      serviceCategoryId: service.serviceCategoryId,
      name: service.name,
      description: service.description,
      basePrice: Number(service.basePrice).toFixed(2),
      estimatedDurationMinutes: String(service.estimatedDurationMinutes),
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.serviceCategoryId) {
      setError('Wybierz kategorie uslugi.');
      return;
    }

    const price = Number(form.basePrice.replace(',', '.'));
    const duration = Number(form.estimatedDurationMinutes);

    if (!form.name.trim() || !form.description.trim() || Number.isNaN(price) || Number.isNaN(duration)) {
      setError('Uzupelnij wszystkie pola formularza.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = {
      serviceCategoryId: form.serviceCategoryId,
      name: form.name,
      description: form.description,
      basePrice: price,
      estimatedDurationMinutes: duration,
    };

    try {
      const response = await fetch(
        form.id
          ? `${API_BASE_URL}/api/workshop-services/${form.id}`
          : `${API_BASE_URL}/api/workshop-services`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

      if (!response.ok) {
        setError('Nie udalo sie zapisac uslugi.');
        return;
      }

      const savedService = await response.json();

      setServices((currentServices) => {
        if (!form.id) {
          return [...currentServices, savedService];
        }

        return currentServices.map((service) =>
          service.id === savedService.id ? savedService : service);
      });

      closeModal();
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(serviceId: number) {
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/workshop-services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError('Nie udalo sie usunac uslugi.');
        return;
      }

      setServices((currentServices) =>
        currentServices.filter((service) => service.id !== serviceId));
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.kicker}>Warsztat</Text>
          <Text style={styles.screenTitle}>Uslugi</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={openCreateModal}>
          <Text style={styles.primaryButtonText}>Dodaj</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.blue} />
        </View>
      ) : (
        <View style={styles.cardList}>
          {services.length === 0 ? (
            <View style={styles.serviceCard}>
              <Text style={styles.emptyText}>Brak uslug do wyswietlenia.</Text>
            </View>
          ) : (
            services.map((service) => (
              <EmployeeServiceCard
                key={service.id}
                service={service}
                onEdit={() => openEditModal(service)}
                onDelete={() => handleDelete(service.id)}
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
                <Text style={styles.kicker}>{form.id ? 'Edycja' : 'Nowa usluga'}</Text>
                <Text style={styles.modalTitle}>{form.id ? 'Edytuj usluge' : 'Dodaj usluge'}</Text>
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
                <Text style={styles.inputLabel}>Kategoria</Text>
                <View style={styles.optionGrid}>
                  {categories.map((category) => {
                    const selected = category.id === form.serviceCategoryId;

                    return (
                      <Pressable
                        key={category.id}
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                        onPress={() => setForm((currentForm) => ({
                          ...currentForm,
                          serviceCategoryId: category.id,
                        }))}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Nazwa</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => setForm((currentForm) => ({
                    ...currentForm,
                    name: value,
                  }))}
                  placeholder="np. Wymiana oleju"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Opis</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(value) => setForm((currentForm) => ({
                    ...currentForm,
                    description: value,
                  }))}
                  placeholder="Krotki opis uslugi"
                  placeholderTextColor={colors.muted}
                  multiline
                  style={[styles.textInput, styles.textArea]}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Cena</Text>
                  <TextInput
                    value={form.basePrice}
                    onChangeText={(value) => setForm((currentForm) => ({
                      ...currentForm,
                      basePrice: value,
                    }))}
                    keyboardType="decimal-pad"
                    placeholder="199.99"
                    placeholderTextColor={colors.muted}
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.formColumn}>
                  <Text style={styles.inputLabel}>Minuty</Text>
                  <TextInput
                    value={form.estimatedDurationMinutes}
                    onChangeText={(value) => setForm((currentForm) => ({
                      ...currentForm,
                      estimatedDurationMinutes: value,
                    }))}
                    keyboardType="number-pad"
                    placeholder="60"
                    placeholderTextColor={colors.muted}
                    style={styles.textInput}
                  />
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
                  <Text style={styles.submitButtonText}>Zapisz</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EmployeeServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: WorkshopService;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleArea}>
          <Text style={styles.categoryText}>{service.serviceCategoryName}</Text>
          <Text style={styles.serviceTitle}>{service.name}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{formatPrice(service.basePrice)}</Text>
        </View>
      </View>

      <Text style={styles.description}>{service.description}</Text>
      <Text style={styles.duration}>{service.estimatedDurationMinutes} min</Text>

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

function formatPrice(price: number) {
  return `${Number(price).toFixed(2)} zl`;
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
  primaryButton: {
    minHeight: 38,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
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
  serviceCard: {
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
  cardTitleArea: {
    flex: 1,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  serviceTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  priceBadge: {
    minHeight: 34,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7F1FF',
    borderRadius: 8,
  },
  priceText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
  },
  duration: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formColumn: {
    flex: 1,
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
  textArea: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
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
