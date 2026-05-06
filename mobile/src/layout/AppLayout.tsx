import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';
import type { LoggedUser } from '../types';

type Props = {
  user: LoggedUser;
  tabs: string[];
  activeTab: string;
  children: ReactNode;
  onLogout: () => void;
  onTabPress: (tab: string) => void;
};

export function AppLayout({
  user,
  tabs,
  activeTab,
  children,
  onLogout,
  onTabPress,
}: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>AutoSerwis</Text>
            <Text style={styles.headerSubtitle}>
              {user.role === 'customer' ? 'Panel klienta' : 'Panel pracownika'} - {user.displayName}
            </Text>
          </View>

          <Pressable onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Wyloguj</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.bottomNavigation}>
          {tabs.map((tab) => {
            const active = tab === activeTab;

            return (
              <Pressable
                key={tab}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => onTabPress(tab)}
              >
                <Text style={[styles.navText, active && styles.navTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
    marginTop: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  bottomNavigation: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navItem: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: colors.background,
  },
  navText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  navTextActive: {
    color: colors.blue,
  },
});
