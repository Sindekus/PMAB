import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5203'
  : 'http://192.168.100.7:5203';
