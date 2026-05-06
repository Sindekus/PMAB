import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import { colors } from '../theme';
import type { LoggedUser } from '../types';

type Props = {
  onLogin: (user: LoggedUser) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [login, setLogin] = useState('klient');
  const [password, setPassword] = useState('klient123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        setError('Nieprawidlowy login lub haslo.');
        return;
      }

      const data = await response.json();

      onLogin({
        userAccountId: data.userAccountId,
        role: data.role,
        displayName: data.displayName,
        customerId: data.customerId,
        employeeId: data.employeeId,
      });
    } catch {
      setError('Nie mozna polaczyc sie z API. Sprawdz, czy backend jest wlaczony.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.loginShell}>
        <View>
          <Text style={styles.appName}>AutoSerwis</Text>
          <Text style={styles.loginSubtitle}>Zaloguj sie do panelu warsztatu</Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Logowanie</Text>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Login</Text>
            <TextInput
              value={login}
              onChangeText={setLogin}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.textInput}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Haslo</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.textInput}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={isSubmitting}
            style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>Zaloguj</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.loginHint}>
          <Text style={styles.hintText}>Konta testowe</Text>
          <Text style={styles.hintText}>klient / klient123</Text>
          <Text style={styles.hintText}>pracownik / pracownik123</Text>
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
  loginShell: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 18,
    backgroundColor: colors.background,
  },
  appName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  loginSubtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 6,
  },
  loginCard: {
    gap: 16,
    padding: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  loginTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
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
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  loginButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
  },
  loginHint: {
    gap: 4,
    paddingHorizontal: 4,
  },
  hintText: {
    color: colors.muted,
    fontSize: 13,
  },
});
