import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 5203;

function getDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).expoGoConfig?.debuggerHost ??
    (Constants as any).manifest?.debuggerHost ??
    null;
  return hostUri ? hostUri.split(':')[0] : null;
}

export const API_BASE_URL = (() => {
  if (Platform.OS === 'web') return `http://localhost:${PORT}`;
  const host = getDevHost();
  return host ? `http://${host}:${PORT}` : `http://localhost:${PORT}`;
})();
