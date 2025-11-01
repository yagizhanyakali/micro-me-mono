import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;

