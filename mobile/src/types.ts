export type Role = 'customer' | 'employee';

export type CustomerTab = 'Auta' | 'Wizyty' | 'Uslugi';

export type EmployeeTab = 'Wizyty' | 'Klienci' | 'Uslugi' | 'Slowniki';

export type LoggedUser = {
  userAccountId: number;
  role: Role;
  displayName: string;
  customerId: number | null;
  employeeId: number | null;
};

export type VehicleBrand = {
  id: number;
  name: string;
};

export type Vehicle = {
  id: number;
  vehicleBrandId: number;
  brandName: string;
  model: string;
  year: number;
  engineType: string;
};

export type ServiceCategory = {
  id: number;
  name: string;
  description: string;
};

export type WorkshopService = {
  id: number;
  serviceCategoryId: number;
  serviceCategoryName: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
};

export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type CustomerSummary = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vehiclesCount: number;
};

export type VehicleSummary = {
  id: number;
  brandName: string;
  model: string;
  year: number;
  engineType: string;
};

export type CustomerDetails = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vehicles: VehicleSummary[];
};

export type AppointmentStatusOption = {
  id: number;
  code: string;
  name: string;
};

export type CustomerAppointmentSummary = {
  id: number;
  scheduledAt: string;
  vehicleId: number;
  vehicleBrandName: string;
  vehicleModel: string;
  employeeId: number | null;
  employeeName: string | null;
  appointmentStatusId: number;
  statusCode: string;
  statusName: string;
  servicesCount: number;
  totalPrice: number;
};

export type AppointmentSummary = CustomerAppointmentSummary & {
  customerId: number;
  customerName: string;
};

export type AppointmentServiceItem = {
  id: number;
  workshopServiceId: number;
  serviceName: string;
  categoryName: string;
  price: number;
  durationMinutes: number;
  notes: string | null;
};

export type AppointmentNoteItem = {
  id: number;
  content: string;
  createdAt: string;
  employeeId: number;
  employeeName: string;
};

export type AppointmentDetails = {
  id: number;
  scheduledAt: string;
  createdAt: string;
  customerNotes: string | null;
  customerId: number;
  customerName: string;
  customerPhone: string;
  vehicleId: number;
  vehicleBrandName: string;
  vehicleModel: string;
  vehicleYear: number;
  employeeId: number | null;
  employeeName: string | null;
  appointmentStatusId: number;
  statusCode: string;
  statusName: string;
  services: AppointmentServiceItem[];
  notes: AppointmentNoteItem[];
  totalPrice: number;
};
