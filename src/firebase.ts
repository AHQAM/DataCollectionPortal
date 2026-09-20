import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAYOf8Ayqjcq-Ew-UNGivcK0PXcj_pyXAw',
  authDomain: 'landsurvey-ebb3b.firebaseapp.com',
  projectId: 'landsurvey-ebb3b',
  storageBucket: 'landsurvey-ebb3b.firebasestorage.app',
  messagingSenderId: '152016503421',
  appId: '1:152016503421:web:4ce2e5e5caf7df08f46714',
  databaseId: 'datacollectionportal',
};

function getFirebaseEnv(name: string, fallback: string): string {
  const value = import.meta.env[name];
  return (value && value.trim()) ? value : fallback;
}

const firebaseConfig = {
  apiKey: getFirebaseEnv('VITE_FIREBASE_API_KEY', DEFAULT_FIREBASE_CONFIG.apiKey),
  authDomain: getFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN', DEFAULT_FIREBASE_CONFIG.authDomain),
  projectId: getFirebaseEnv('VITE_FIREBASE_PROJECT_ID', DEFAULT_FIREBASE_CONFIG.projectId),
  storageBucket: getFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET', DEFAULT_FIREBASE_CONFIG.storageBucket),
  messagingSenderId: getFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', DEFAULT_FIREBASE_CONFIG.messagingSenderId),
  appId: getFirebaseEnv('VITE_FIREBASE_APP_ID', DEFAULT_FIREBASE_CONFIG.appId),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || 'datacollectionportal');
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Use Emulators if in development mode and VITE_USE_FIREBASE_EMULATOR is true
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('Firebase Emulators connected.');
  } catch (e) {
    console.error('Failed to connect to Firebase Emulators:', e);
  }
}
