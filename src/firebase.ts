import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Ensure critical configuration is present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Missing Firebase configuration in environment variables.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(
  app,
  import.meta.env.VITE_FIREBASE_DATABASE_ID || "datacollectionportal",
);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Initialize Firebase App Check (Web)
if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
  if (recaptchaKey) {
    if (import.meta.env.DEV) {
      // Allow debug token for development and staging tests
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN =
        import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
    }
    try {
      const { initializeAppCheck, ReCaptchaV3Provider } =
        await import("firebase/app-check");
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e) {
      console.warn("Firebase App Check initialization failed:", e);
    }
  }
}

// Use Emulators if in development mode and VITE_USE_FIREBASE_EMULATOR is true
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    console.log("Firebase Emulators connected.");
  } catch (e) {
    console.error("Failed to connect to Firebase Emulators:", e);
  }
}
