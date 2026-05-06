export type Role = 'customer' | 'employee';

export type CustomerTab = 'Auta' | 'Wizyty' | 'Uslugi';

export type EmployeeTab = 'Dzisiaj' | 'Klienci' | 'Uslugi';

export type LoggedUser = {
  userAccountId: number;
  role: Role;
  displayName: string;
  customerId: number | null;
  employeeId: number | null;
};

export type AppointmentStatus = 'Nowa' | 'Potwierdzona' | 'W trakcie';

export type Appointment = {
  id: number;
  time: string;
  customer?: string;
  vehicle: string;
  registrationNumber: string;
  services: string;
  date?: string;
  status: AppointmentStatus;
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
