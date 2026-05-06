import { useState } from 'react';
import { CustomerAppointmentsScreen } from './src/screens/CustomerAppointmentsScreen';
import { CustomerServicesScreen } from './src/screens/CustomerServicesScreen';
import { CustomerVehiclesScreen } from './src/screens/CustomerVehiclesScreen';
import { EmployeeServicesScreen } from './src/screens/EmployeeServicesScreen';
import { EmployeeTodayScreen } from './src/screens/EmployeeTodayScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { AppLayout } from './src/layout/AppLayout';
import type { CustomerTab, EmployeeTab, LoggedUser } from './src/types';

const customerTabs: CustomerTab[] = ['Auta', 'Wizyty', 'Uslugi'];
const employeeTabs: EmployeeTab[] = ['Dzisiaj', 'Klienci', 'Uslugi'];

export default function App() {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('Wizyty');
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<EmployeeTab>('Dzisiaj');

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const tabs = user.role === 'customer' ? customerTabs : employeeTabs;
  const activeTab = user.role === 'customer' ? activeCustomerTab : activeEmployeeTab;

  return (
    <AppLayout
      user={user}
      tabs={tabs}
      activeTab={activeTab}
      onLogout={() => setUser(null)}
      onTabPress={(tab) => {
        if (user.role === 'customer') {
          setActiveCustomerTab(tab as CustomerTab);
          return;
        }

        setActiveEmployeeTab(tab as EmployeeTab);
      }}
    >
      {user.role === 'customer'
        ? renderCustomerScreen(activeCustomerTab, user)
        : renderEmployeeScreen(activeEmployeeTab)}
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

  return <CustomerAppointmentsScreen />;
}

function renderEmployeeScreen(activeTab: EmployeeTab) {
  if (activeTab === 'Klienci') {
    return (
      <PlaceholderScreen
        kicker="Warsztat"
        title="Klienci"
        text="Brak klientow do wyswietlenia."
      />
    );
  }

  if (activeTab === 'Uslugi') {
    return <EmployeeServicesScreen />;
  }

  return <EmployeeTodayScreen />;
}
