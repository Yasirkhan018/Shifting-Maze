
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { MIN_GRID_SIZE } from "@/lib/types";
import { randomUUID } from 'crypto'; // For generating clientId

export async function POST(request: NextRequest) {
  console.log('[API/leaderboard/score POST] Route invoked.'); // Initial log

  let username: string | undefined = undefined;
  let clientId: string | undefined = undefined;
  let requestBody: any;

  try {
    try {
      requestBody = await request.json();
      console.log('[API/leaderboard/score POST] Received request. Body:', JSON.stringify(requestBody));
    } catch (e) {
      const parseError = e instanceof Error ? e : new Error(String(e));
      console.error('[API/leaderboard/score POST] Error parsing request JSON:', parseError.stack || parseError);
      return NextResponse.json({
        message: 'Invalid request body.',
        error: parseError.message
      }, { status: 400 });
    }

    if (!db) {
      console.error('[API/leaderboard/score POST] Firestore database instance (db) is not available. Check Firebase Admin SDK initialization in server logs.');
      return NextResponse.json({
        message: 'Server configuration error: Database service not initialized.',
        error: 'DB_INIT_FAILURE',
        username,
        clientId
      }, { status: 503 }); // Use 503 for service unavailable
    }
    console.log('[API/leaderboard/score POST] Firestore db instance appears to be available.');

    const providedClientId = requestBody.clientId as string | undefined;
    const { gridSize, moveCount } = requestBody;

    console.log(`[API/leaderboard/score POST] Parsed body. ClientId: ${providedClientId}, GridSize: ${gridSize}, MoveCount: ${moveCount}`);

    const usersRef = db.collection('users');

    if (providedClientId) {
      console.log(`[API/leaderboard/score POST] ClientId provided: ${providedClientId}. Attempting to fetch user from 'users' collection.`);
      const userDoc = await usersRef.doc(providedClientId).get();
      console.log(`[API/leaderboard/score POST] Firestore 'users.doc.get()' for ${providedClientId} completed. Exists: ${userDoc.exists}`);
      if (userDoc.exists) {
        clientId = providedClientId;
        username = userDoc.data()?.username;
        console.log(`[API/leaderboard/score POST] User found for clientId ${clientId}: Username ${username}`);
      } else {
        console.log(`[API/leaderboard/score POST] No user found for provided clientId: ${providedClientId}. A new user will be created.`);
        // Clear providedClientId if it didn't lead to a user, so a new one is generated
        // This case should ideally not happen if client always sends a valid one or null
      }
    } else {
       console.log('[API/leaderboard/score POST] No ClientId provided. Will create new user.');
    }

    if (!username || !clientId) {
      const newClientId = randomUUID();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newUsername = `MazeRunner${randomSuffix}`;

      console.log(`[API/leaderboard/score POST] Attempting to set new user data in 'users' collection for clientId ${newClientId}. Username: ${newUsername}`);
      await usersRef.doc(newClientId).set({
        username: newUsername,
        createdAt: FieldValue.serverTimestamp()
      });
      console.log(`[API/leaderboard/score POST] Successfully set new user data for clientId ${newClientId}.`);
      clientId = newClientId;
      username = newUsername;
    } else {
      console.log(`[API/leaderboard/score POST] Existing user identified. ClientId: ${clientId}, Username: ${username}`);
    }

    // This part handles requests that are only for username retrieval (gridSize 0 or invalid score)
    // OR actual score submissions (if logic were active)
    if (typeof gridSize !== 'number' || gridSize < MIN_GRID_SIZE || typeof moveCount !== 'number' || moveCount < 0) {
      console.log(`[API/leaderboard/score POST] Request identified as username fetch or invalid score. gridSize: ${gridSize}, moveCount: ${moveCount}. Returning user info.`);
      return NextResponse.json({
        success: true,
        username,
        clientId,
        message: 'User identified/created.'
      }, { status: 200 });
    }

    // Actual score recording logic (currently inactive in UI) would go here.
    // For now, we assume if it's not a username fetch, it's a score update attempt
    // which we are not fully implementing on the client.
    console.log(`[API/leaderboard/score POST] Successfully processed potential score submission (currently inactive). Returning username: ${username}, clientId: ${clientId}`);
    return NextResponse.json({
      success: true,
      username,
      clientId,
      message: 'Score processing logic (currently inactive) would go here.'
    }, { status: 200 });

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[API/leaderboard/score POST] Error processing request:', error.stack || String(error));
    return NextResponse.json({
      message: 'Failed to process request due to a server-side error.',
      error: error.message || 'Unknown error during processing.',
      errorName: error.name || 'UnknownError',
      username: username, // Will be undefined if error occurred before assignment
      clientId: clientId,   // Will be undefined if error occurred before assignment
    }, { status: 500 });
  }
}
