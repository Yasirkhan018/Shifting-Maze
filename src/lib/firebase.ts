// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwk6aerUm_UapYx2-1bwPn7L8-fInN7Wk",
  authDomain: "shifting-maze.firebaseapp.com",
  projectId: "shifting-maze",
  storageBucket: "shifting-maze.firebasestorage.app",
  messagingSenderId: "485365483029",
  appId: "1:485365483029:web:7c48d8722d896f5da8301c"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Firebase client initialization error", e);
    // app will be undefined if init fails
  }
} else {
  app = getApps()[0];
}

const auth = getAuth(app!); // Add ! to assert app is initialized, handle error if not
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export type { User };
