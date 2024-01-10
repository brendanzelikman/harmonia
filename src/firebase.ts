import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import {
  FIREBASE_LIVE_API_KEY,
  FIREBASE_MODE,
  FIREBASE_TEST_API_KEY,
} from "utils/constants";

const firebaseLiveConfig = {
  apiKey: FIREBASE_LIVE_API_KEY,
  authDomain: "harmonia-408805.firebaseapp.com",
  projectId: "harmonia-408805",
  storageBucket: "harmonia-408805.appspot.com",
  messagingSenderId: "246715639784",
  appId: "1:246715639784:web:97c5ccdd1a274c040b265d",
  measurementId: "G-SVZDMC9CQZ",
};
const firebaseTestConfig = {
  apiKey: FIREBASE_TEST_API_KEY,
  authDomain: "harmonia-test-e236b.firebaseapp.com",
  projectId: "harmonia-test-e236b",
  storageBucket: "harmonia-test-e236b.appspot.com",
  messagingSenderId: "906706564723",
  appId: "1:906706564723:web:d328d924f85996bfe61c06",
};

// Set Firebase Config based on mode
export const firebaseConfig =
  FIREBASE_MODE === "live" ? firebaseLiveConfig : firebaseTestConfig;

// Create a Google Provider
export const googleProvider = new GoogleAuthProvider();

// Create an Apple Provider
export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// Create a Microsoft Provider
export const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({ prompt: "consent" });
microsoftProvider.addScope("User.Read");

// Export Firebase App
export const firebaseApp = initializeApp(firebaseConfig);
export type FirebaseApp = typeof firebaseApp;
