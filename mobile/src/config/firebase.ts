import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a custom persistence using AsyncStorage for React Native
const customPersistence = {
  type: 'LOCAL' as const,
  async _get(key: string) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  async _set(key: string, value: unknown) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async _remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
  _isAvailable: async () => true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _addListener: (_callback: () => void) => {
    // Not implemented for AsyncStorage
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _removeListener: (_callback: () => void) => {
    // Not implemented for AsyncStorage
  },
};

// Initialize Firebase Authentication with custom AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: customPersistence,
});

export default app;

