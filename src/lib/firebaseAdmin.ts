
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app'; // Import App type for clarity

let dbInstance: admin.firestore.Firestore | undefined;
let authInstance: admin.auth.Auth | undefined;
let adminAppInstance: App | undefined; // Store the app instance

console.log("[FirebaseAdmin] Starting Firebase Admin SDK setup...");

if (!admin.apps.length) {
  try {
    console.log("[FirebaseAdmin] No existing Firebase apps. Attempting to initialize Firebase Admin SDK...");
    // Log whether GOOGLE_APPLICATION_CREDENTIALS is set, which is a common source of issues.
    // Note: process.env might not be directly accessible in all environments in the same way,
    // but this log is helpful for Node.js environments.
    if (typeof process !== 'undefined' && process.env) {
      console.log(`[FirebaseAdmin] Environment variable GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'Not set or not accessible in this context'}`);
    } else {
      console.log("[FirebaseAdmin] process.env not available, cannot log GOOGLE_APPLICATION_CREDENTIALS directly here.");
    }

    adminAppInstance = admin.initializeApp(); 
    console.log("[FirebaseAdmin] admin.initializeApp() called.");

    if (adminAppInstance) {
      console.log(`[FirebaseAdmin] Firebase Admin SDK initialized successfully. App name: ${adminAppInstance.name}`);
      try {
        dbInstance = admin.firestore(adminAppInstance);
        console.log("[FirebaseAdmin] Firestore instance obtained.");
      } catch (dbError: any) {
        console.error('[FirebaseAdmin] Error obtaining Firestore instance after app initialization:', dbError.message, dbError.code ? `Code: ${dbError.code}` : '', dbError.stack);
      }
      try {
        authInstance = admin.auth(adminAppInstance);
        console.log("[FirebaseAdmin] Auth instance obtained.");
      } catch (authError: any) {
        console.error('[FirebaseAdmin] Error obtaining Auth instance after app initialization:', authError.message, authError.code ? `Code: ${authError.code}` : '', authError.stack);
      }
    } else {
      console.error("[FirebaseAdmin] admin.initializeApp() did not return an app instance. This is highly unexpected if no error was thrown.");
    }

  } catch (initError: any) {
    console.error('[FirebaseAdmin] Firebase admin.initializeApp() CRITICAL error:', initError.message, initError.code ? `Code: ${initError.code}` : '', initError.stack);
    console.error('[FirebaseAdmin] This usually indicates a problem with service account credentials or the runtime environment setup.');
    console.error('[FirebaseAdmin] Please ensure GOOGLE_APPLICATION_CREDENTIALS is correctly set and points to a valid service account JSON key file if running in an environment that requires it (e.g., local development outside GCP, some third-party hosting).');
    console.error('[FirebaseAdmin] If running on Google Cloud (e.g., Cloud Run, Cloud Functions, App Engine), ensure the runtime service account has the necessary IAM permissions (e.g., "Cloud Datastore User", "Firebase Admin SDK Administrator Service Agent").');
    // dbInstance and authInstance will remain undefined
  }
} else {
  adminAppInstance = admin.apps[0]; // Get the default app if it exists
  console.log(`[FirebaseAdmin] Firebase Admin SDK already initialized or admin.apps array is populated (length: ${admin.apps.length}). Reusing existing app instance: ${adminAppInstance?.name || 'Unknown name'}`);
  if (adminAppInstance) {
    try {
      dbInstance = admin.firestore(adminAppInstance);
      console.log("[FirebaseAdmin] Firestore instance obtained from existing app.");
    } catch (dbError: any) {
      console.error('[FirebaseAdmin] Error getting Firestore from existing app:', dbError.message, dbError.code ? `Code: ${dbError.code}` : '', dbError.stack);
    }
    try {
      authInstance = admin.auth(adminAppInstance);
      console.log("[FirebaseAdmin] Auth instance obtained from existing app.");
    } catch (authError: any) {
      console.error('[FirebaseAdmin] Error getting Auth from existing app:', authError.message, authError.code ? `Code: ${authError.code}` : '', authError.stack);
    }
  } else {
    console.error("[FirebaseAdmin] admin.apps array is populated, but no default app (index 0) found. This is unexpected.");
  }
}

if (!dbInstance) {
  console.error("CRITICAL [FirebaseAdmin]: Firestore instance (db) is NOT AVAILABLE. Operations requiring database access will fail. Check previous logs for initialization errors.");
}
if (!authInstance) {
  console.warn("Warning [FirebaseAdmin]: Firebase Auth instance (auth) is NOT AVAILABLE.");
}

export const db = dbInstance;
export const auth = authInstance;
