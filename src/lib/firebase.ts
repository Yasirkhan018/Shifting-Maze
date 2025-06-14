// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase client initialization error", e);
  // Fallback or rethrow as needed, for now, app will be undefined if init fails
  // It's important that the rest of the app can handle 'app' being potentially uninitialized
  // if it relies on it. Currently, no client-side Firebase services are used.
}

export { app };
