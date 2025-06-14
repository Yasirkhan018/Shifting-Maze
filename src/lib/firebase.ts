
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Ensure this configuration EXACTLY matches your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyAwk6aerUm_UapYx2-1bwPn7L8-fInN7Wk",
  authDomain: "shifting-maze.firebaseapp.com",
  projectId: "shifting-maze",
  storageBucket: "shifting-maze.firebasestorage.app",
  messagingSenderId: "485365483029",
  appId: "1:485365483029:web:7c48d8722d896f5da8301c",
  measurementId: "G-2XPZ34MQ04"
};

// Initialize Firebase
let app: FirebaseApp | undefined; // Allow app to be undefined initially
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("[FirebaseClient] Firebase app initialized successfully with provided config.");
  } catch (e) {
    console.error("[FirebaseClient] Firebase client initialization error:", e);
    // app will remain undefined if init fails
  }
} else {
  app = getApps()[0];
  console.log("[FirebaseClient] Using existing Firebase app instance.");
}

let authInstance: import("@firebase/auth").Auth | undefined;
let googleProviderInstance: GoogleAuthProvider | undefined;

if (app) {
  try {
    authInstance = getAuth(app);
    googleProviderInstance = new GoogleAuthProvider();
    console.log("[FirebaseClient] Firebase Auth and GoogleAuthProvider initialized.");
  } catch (e) {
    console.error("[FirebaseClient] Error initializing Firebase Auth:", e);
  }
} else {
  console.error("[FirebaseClient] Firebase app is not initialized. Auth cannot be initialized.");
}

// Export potentially undefined instances; consuming code should handle this.
export { app, authInstance as auth, googleProviderInstance as googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };

