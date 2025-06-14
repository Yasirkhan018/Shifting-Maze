
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import type { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  console.log('[API/leaderboard GET] Received request.');

  if (!db) {
    console.error('[API/leaderboard GET] Firestore database instance (db) is NOT AVAILABLE. Firebase Admin SDK might not have initialized correctly. Check server logs for [FirebaseAdmin] messages.');
    return NextResponse.json({
      message: 'Server Configuration Error: Database service not initialized. Please check server logs for Firebase Admin SDK issues.',
      error: 'DB_ADMIN_SDK_INIT_FAILURE'
    }, { status: 503 }); // 503 Service Unavailable
  }
  console.log('[API/leaderboard GET] Firestore db instance appears to be available.');

  try {
    console.log('[API/leaderboard GET] Attempting to query leaderboard collection...');
    const leaderboardRef = db.collection('leaderboard');
    const snapshot = await leaderboardRef
      .orderBy('highestLevel', 'desc')
      .orderBy('movesAtHighestLevel', 'asc')
      .orderBy('lastPlayed', 'desc') // This field is crucial for the query
      .limit(10)
      .get();
    console.log(`[API/leaderboard GET] Firestore query executed. Snapshot empty: ${snapshot.empty}`);

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const leaderboardData = snapshot.docs.map(doc => {
      const data = doc.data();
      // Log the raw data for each document for easier debugging
      console.log(`[API/leaderboard GET] Processing document ${doc.id}, raw data:`, JSON.stringify(data));

      // Basic check for expected fields to prevent runtime errors if data is malformed
      const username = data.username;
      const highestLevel = data.highestLevel;
      const movesAtHighestLevel = data.movesAtHighestLevel;
      const lastPlayed = data.lastPlayed as Timestamp; // lastPlayed should be a Firestore Timestamp

      let isDataMalformed = false;
      let malformedReason = [];

      if (typeof username !== 'string' || username.trim() === '') {
        isDataMalformed = true;
        malformedReason.push(`username (expected non-empty string, got ${typeof username}: "${username}")`);
      }
      if (typeof highestLevel !== 'number') {
        isDataMalformed = true;
        malformedReason.push(`highestLevel (expected number, got ${typeof highestLevel})`);
      }
      if (typeof movesAtHighestLevel !== 'number') {
        isDataMalformed = true;
        malformedReason.push(`movesAtHighestLevel (expected number, got ${typeof movesAtHighestLevel})`);
      }
      // Check if lastPlayed exists and is a Firestore Timestamp
      // The Admin SDK should provide it as a Timestamp object, which has toDate method.
      if (!lastPlayed || typeof lastPlayed.toDate !== 'function') {
        isDataMalformed = true;
        malformedReason.push(`lastPlayed (expected Firestore Timestamp, got ${typeof lastPlayed})`);
      }


      if (isDataMalformed) {
        console.warn(`[API/leaderboard GET] Document ${doc.id} has malformed data. Reasons: ${malformedReason.join(', ')}. Full data snapshot:`, data);
        return null;
      }

      return {
        username: username,
        highestLevel: highestLevel,
        moves: movesAtHighestLevel,
      };
    }).filter(entry => entry !== null); // Filter out any null entries from malformed data

    console.log('[API/leaderboard GET] Successfully fetched and processed leaderboard data:', leaderboardData);
    return NextResponse.json(leaderboardData, { status: 200 });

  } catch (error) {
    const err = error as Error & { code?: string | number; details?: string }; // Firestore errors often have a 'code' and 'details'
    console.error(`[API/leaderboard GET] Firestore query or data processing error. Name: ${err.name}, Message: ${err.message}, Code: ${err.code || 'N/A'}, Details: ${err.details || 'N/A'}, Stack:`, err.stack || 'No stack available');

    let userMessage = 'Failed to fetch leaderboard due to a server-side error.';
    // Check for specific Firestore error codes or messages related to missing indexes
    const errMessageLower = (err.message || '').toLowerCase();
    const errDetailsLower = (err.details || '').toLowerCase();

    if (
        err.code === 'unimplemented' || // Often indicates a missing index for complex queries
        err.code === 'FAILED_PRECONDITION' || // Can indicate a missing index
        errMessageLower.includes('index') ||
        errMessageLower.includes('indexes') ||
        errDetailsLower.includes('index') || // Check details as well, as the link might be there
        errDetailsLower.includes('indexes')
    ) {
        userMessage = 'Failed to fetch leaderboard: The database query requires an index. Please check the server logs for a message from Firestore containing a link to create it in the Firebase console. The error message might be: ' + err.message;
        if (err.details && err.details.includes('https://console.firebase.google.com/')) {
             userMessage += ` Firestore provided a link: ${err.details.substring(err.details.indexOf('https://'))}`;
        }
    } else if (err.code === 'permission-denied' || errMessageLower.includes('permission denied')) {
        userMessage = 'Failed to fetch leaderboard: Firestore permission denied. Check Firestore rules and Admin SDK permissions.';
    }


    return NextResponse.json({
      message: userMessage,
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      errorDetails: err.details,
      guidance: 'Check server logs for [API/leaderboard GET] for the full error stack trace and look for any links from Firestore to create missing indexes.'
    }, { status: 500 });
  }
}
