import { useState } from 'react';
import { CustomerAppointmentsScreen } from './src/screens/CustomerAppointmentsScreen';
import { CustomerServicesScreen } from './src/screens/CustomerServicesScreen';
import { CustomerVehiclesScreen } from './src/screens/CustomerVehiclesScreen';
import { EmployeeAdminHubScreen } from './src/screens/EmployeeAdminHubScreen';
import type { AdminScreenKey } from './src/screens/EmployeeAdminHubScreen';
import { EmployeeAppointmentDetailsScreen } from './src/screens/EmployeeAppointmentDetailsScreen';
import { EmployeeAppointmentsScreen } from './src/screens/EmployeeAppointmentsScreen';
import { EmployeeBrandsScreen } from './src/screens/EmployeeBrandsScreen';
import { EmployeeCategoriesScreen } from './src/screens/EmployeeCategoriesScreen';
import { EmployeeCustomerDetailsScreen } from './src/screens/EmployeeCustomerDetailsScreen';
import { EmployeeCustomersScreen } from './src/screens/EmployeeCustomersScreen';
import { EmployeeServicesScreen } from './src/screens/EmployeeServicesScreen';
import { EmployeeStaffScreen } from './src/screens/EmployeeStaffScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppLayout } from './src/layout/AppLayout';
import type { CustomerTab, EmployeeTab, LoggedUser } from './src/types';

const customerTabs: CustomerTab[] = ['Auta', 'Wizyty', 'Uslugi'];
const employeeTabs: EmployeeTab[] = ['Wizyty', 'Klienci', 'Uslugi', 'Slowniki'];

export default function App() {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('Wizyty');
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<EmployeeTab>('Wizyty');
  const [openAppointmentId, setOpenAppointmentId] = useState<number | null>(null);
  const [openCustomerId, setOpenCustomerId] = useState<number | null>(null);
  const [openAdminScreen, setOpenAdminScreen] = useState<AdminScreenKey | null>(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const tabs = user.role === 'customer' ? customerTabs : employeeTabs;
  const activeTab = user.role === 'customer' ? activeCustomerTab : activeEmployeeTab;

  function logout() {
    setUser(null);
    setOpenAppointmentId(null);
    setOpenCustomerId(null);
    setOpenAdminScreen(null);
  }

  function selectTab(tab: string) {
    if (user!.role === 'customer') {
      setActiveCustomerTab(tab as CustomerTab);
      return;
    }

    setActiveEmployeeTab(tab as EmployeeTab);
    setOpenAppointmentId(null);
    setOpenCustomerId(null);
    setOpenAdminScreen(null);
  }

  return (
    <AppLayout
      user={user}
      tabs={tabs}
      activeTab={activeTab}
      onLogout={logout}
      onTabPress={selectTab}
    >
      {user.role === 'customer'
        ? renderCustomerScreen(activeCustomerTab, user)
        : renderEmployeeScreen(
            activeEmployeeTab,
            user,
            openAppointmentId,
            openCustomerId,
            openAdminScreen,
            {
              openAppointment: setOpenAppointmentId,
              closeAppointment: () => setOpenAppointmentId(null),
              openCustomer: setOpenCustomerId,
              closeCustomer: () => setOpenCustomerId(null),
              openAdmin: setOpenAdminScreen,
              closeAdmin: () => setOpenAdminScreen(null),
            })}
    </AppLayout>
  );
}

function renderCustomerScreen(activeTab: CustomerTab, user: LoggedUser) {
  if (activeTab === 'Auta') {
    return <CustomerVehiclesScreen customerId={user.customerId} />;
  }

  if (activeTab === 'Uslugi') {
    return <CustomerServicesScreen />;
  }

  return <CustomerAppointmentsScreen customerId={user.customerId} />;
}

type EmployeeNav = {
  openAppointment: (id: number) => void;
  closeAppointment: () => void;
  openCustomer: (id: number) => void;
  closeCustomer: () => void;
  openAdmin: (key: AdminScreenKey) => void;
  closeAdmin: () => void;
};

function renderEmployeeScreen(
  activeTab: EmployeeTab,
  user: LoggedUser,
  openAppointmentId: number | null,
  openCustomerId: number | null,
  openAdminScreen: AdminScreenKey | null,
  nav: EmployeeNav,
) {
  if (activeTab === 'Wizyty') {
    if (openAppointmentId !== null) {
      return (
        <EmployeeAppointmentDetailsScreen
          appointmentId={openAppointmentId}
          employeeId={user.employeeId}
          onBack={nav.closeAppointment}
        />
      );
    }

    return <EmployeeAppointmentsScreen onOpenAppointment={nav.openAppointment} />;
  }

  if (activeTab === 'Klienci') {
    if (openCustomerId !== null) {
      return (
        <EmployeeCustomerDetailsScreen
          customerId={openCustomerId}
          onBack={nav.closeCustomer}
        />
      );
    }

    return <EmployeeCustomersScreen onOpenCustomer={nav.openCustomer} />;
  }

  if (activeTab === 'Uslugi') {
    return <EmployeeServicesScreen />;
  }

  if (openAdminScreen === 'brands') {
    return <EmployeeBrandsScreen onBack={nav.closeAdmin} />;
  }

  if (openAdminScreen === 'categories') {
    return <EmployeeCategoriesScreen onBack={nav.closeAdmin} />;
  }

  if (openAdminScreen === 'staff') {
    return <EmployeeStaffScreen onBack={nav.closeAdmin} />;
  }

  return <EmployeeAdminHubScreen onSelect={nav.openAdmin} />;
}
