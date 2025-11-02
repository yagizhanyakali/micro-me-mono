import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD_JhscpKJP2-WPJ_rjphbDnSf3ssWt32w",
  authDomain: "micro-me-67a19.firebaseapp.com",
  projectId: "micro-me-67a19",
  storageBucket: "micro-me-67a19.firebasestorage.app",
  messagingSenderId: "309753964138",
  appId: "1:309753964138:web:33253343af0526ddf74c13",
  measurementId: "G-VS5TYKBB96"
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

