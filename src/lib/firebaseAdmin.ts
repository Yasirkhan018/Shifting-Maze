
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // IMPORTANT: In a real project, use environment variables for service account credentials
    // For example, set GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or load from a secure configuration management system.
    // Avoid hardcoding credentials.
    //
    // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });
    //
    // For Firebase Hosting with backend, often GOOGLE_APPLICATION_CREDENTIALS is automatically populated.
    // If not, and for local dev without GOOGLE_APPLICATION_CREDENTIALS, you might initialize like this:
    // (Ensure your service account JSON file path is correct and secure)
    // import serviceAccountKey from './serviceAccountKey.json'; // You'd need to add this file
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccountKey)
    // });
    //
    // If GOOGLE_APPLICATION_CREDENTIALS is set in the environment (e.g. Cloud Run, App Engine, Firebase Functions),
    // initializeApp() without arguments will use it.
     admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
