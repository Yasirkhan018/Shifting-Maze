
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
// Firebase Admin SDK (db) is not directly used for client-side auth,
// but keeping the import structure in case it's needed for future score verification.
// import { db } from '@/lib/firebaseAdmin'; 
// import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  console.log('[API/leaderboard/score POST] Route invoked.');

  // This route's original functionality for random username assignment
  // is now superseded by Firebase Client-side Authentication.
  // If leaderboard score submission is re-enabled, this API will need to:
  // 1. Receive a Firebase ID token from the authenticated client.
  // 2. Verify the ID token using Firebase Admin SDK.
  // 3. Extract the user's UID.
  // 4. Save the score to Firestore under that UID.

  // For now, it can return a simple message or be further developed
  // for ID token verification if scores are to be submitted.

  try {
    // const requestBody = await request.json();
    // console.log('[API/leaderboard/score POST] Received request body:', requestBody);

    // Example: If this route were to handle verified scores:
    // const { idToken, gridSize, moveCount } = requestBody;
    // if (!idToken) {
    //   return NextResponse.json({ message: 'ID token required.' }, { status: 401 });
    // }
    // try {
    //   const decodedToken = await auth.verifyIdToken(idToken); // Requires Firebase Admin 'auth'
    //   const uid = decodedToken.uid;
    //   // ... save score for uid ...
    //   return NextResponse.json({ success: true, message: 'Score submitted for user ' + uid });
    // } catch (error) {
    //   console.error('[API/leaderboard/score POST] Error verifying ID token:', error);
    //   return NextResponse.json({ message: 'Invalid ID token.' }, { status: 403 });
    // }

    return NextResponse.json({ 
      success: true, 
      message: 'Score endpoint. Username assignment is now handled by client-side Firebase Auth.' 
    }, { status: 200 });

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[API/leaderboard/score POST] Error processing request:', error.stack || String(error));
    return NextResponse.json({
      message: 'Failed to process score request due to a server-side error.',
      error: error.message || 'Unknown error during processing.',
      errorName: error.name || 'UnknownError',
    }, { status: 500 });
  }
}
