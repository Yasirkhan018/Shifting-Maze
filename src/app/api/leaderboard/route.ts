
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  console.log('[API/leaderboard GET] Received request.');

  if (!db) {
    console.error('[API/leaderboard GET] Firestore database instance (db) is NOT AVAILABLE. Firebase Admin SDK might not have initialized correctly. Check server logs for [FirebaseAdmin] messages.');
    return NextResponse.json({ 
      message: 'Server Configuration Error: Database service not initialized. Please check server logs for Firebase Admin SDK issues.', 
      error: 'DB_ADMIN_SDK_INIT_FAILURE' 
    }, { status: 503 }); // 503 Service Unavailable - more specific than a generic 500
  }
  console.log('[API/leaderboard GET] Firestore db instance appears to be available.');

  try {
    console.log('[API/leaderboard GET] Attempting to query leaderboard collection...');
    const leaderboardRef = db.collection('leaderboard');
    const snapshot = await leaderboardRef
      .orderBy('highestLevel', 'desc')
      .orderBy('movesAtHighestLevel', 'asc')
      .orderBy('lastPlayed', 'desc') 
      .limit(10) 
      .get();
    console.log(`[API/leaderboard GET] Firestore query executed. Snapshot empty: ${snapshot.empty}`);

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const leaderboardData = snapshot.docs.map(doc => {
      const data = doc.data();
      // Basic check for expected fields to prevent runtime errors if data is malformed
      if (typeof data.username !== 'string' || typeof data.highestLevel !== 'number' || typeof data.movesAtHighestLevel !== 'number') {
        console.warn(`[API/leaderboard GET] Document ${doc.id} has malformed data:`, data);
        // Skip this entry or return a default, here we skip
        return null;
      }
      return {
        username: data.username,
        highestLevel: data.highestLevel,
        moves: data.movesAtHighestLevel,
      };
    }).filter(entry => entry !== null); // Filter out any null entries from malformed data

    console.log('[API/leaderboard GET] Successfully fetched and processed leaderboard data.');
    return NextResponse.json(leaderboardData, { status: 200 });

  } catch (error) {
    const err = error as Error & { code?: string | number }; // Firestore errors often have a 'code' property
    console.error(`[API/leaderboard GET] Firestore query or data processing error. Name: ${err.name}, Message: ${err.message}, Code: ${err.code || 'N/A'}, Stack:`, err.stack || 'No stack available');
    
    let userMessage = 'Failed to fetch leaderboard due to a server-side error.';
    if (err.code === 'permission-denied' || (typeof err.message === 'string' && err.message.toLowerCase().includes('permission denied'))) {
        userMessage = 'Failed to fetch leaderboard: Firestore permission denied. Check Firestore rules and Admin SDK permissions.';
    } else if (err.code === 'unimplemented' || (typeof err.message === 'string' && err.message.toLowerCase().includes('indexes'))) {
        userMessage = 'Failed to fetch leaderboard: Firestore query requires an index. Please check server logs for a link to create it in the Firebase console.';
    }

    return NextResponse.json({ 
      message: userMessage, 
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      details: 'Check server logs for [API/leaderboard GET] for the full error stack trace.'
    }, { status: 500 });
  }
}

