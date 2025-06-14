
import admin from 'firebase-admin';

let dbInstance: admin.firestore.Firestore | undefined;
let authInstance: admin.auth.Auth | undefined;

if (!admin.apps.length) {
  try {
    console.log("[FirebaseAdmin] Attempting to initialize Firebase Admin SDK...");
    admin.initializeApp(); // Uses GOOGLE_APPLICATION_CREDENTIALS if set, or other implicit methods.
    dbInstance = admin.firestore();
    authInstance = admin.auth();
    console.log("[FirebaseAdmin] Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('[FirebaseAdmin] Firebase admin initialization error:', error.stack);
    // dbInstance and authInstance will remain undefined
  }
} else {
  console.log(`[FirebaseAdmin] Firebase Admin SDK already initialized or admin.apps array is populated (length: ${admin.apps.length}). Reusing existing app instance(s).`);
  const existingApp = admin.apps[0]; // Get the default app if it exists
  if (existingApp) {
    try {
      dbInstance = admin.firestore(existingApp);
      authInstance = admin.auth(existingApp);
      console.log("[FirebaseAdmin] Successfully got Firestore and Auth instances from existing app.");
    } catch (error: any) {
      console.error('[FirebaseAdmin] Error getting Firestore/Auth from existing app:', error.stack);
    }
  } else {
      console.error("[FirebaseAdmin] admin.apps array is populated, but no default app (index 0) found. This is unexpected.");
  }
}

if (!dbInstance) {
    console.error("CRITICAL [FirebaseAdmin]: Firestore instance (db) is not available. Leaderboard and score submission will fail.");
}
if (!authInstance) {
    // This might be less critical if auth is not used by all parts, but still good to log.
    console.warn("Warning [FirebaseAdmin]: Firebase Auth instance (auth) is not available.");
}

// Export potentially undefined instances. Consumers must handle this.
// However, for simplicity, we'll use non-null assertion operator,
// assuming API routes will catch errors if they are indeed null.
export const db = dbInstance!;
export const auth = authInstance!;
