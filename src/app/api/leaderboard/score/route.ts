
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { MIN_GRID_SIZE } from "@/lib/types";
import { randomUUID } from 'crypto'; // For generating clientId

export async function POST(request: NextRequest) {
  let username: string | undefined = undefined;
  let clientId: string | undefined = undefined;

  try {
    if (!db) {
      console.error('[API/leaderboard/score POST] Firestore database instance (db) is not available. Check Firebase Admin SDK initialization in server logs.');
      return NextResponse.json({ message: 'Server configuration error: Database service not initialized.', error: 'DB_INIT_FAILURE' }, { status: 500 });
    }

    const requestBody = await request.json();
    const providedClientId = requestBody.clientId as string | undefined;
    const { gridSize, moveCount } = requestBody;

    const usersRef = db.collection('users');
    const leaderboardRef = db.collection('leaderboard');

    if (providedClientId) {
      const userDoc = await usersRef.doc(providedClientId).get();
      if (userDoc.exists) {
        clientId = providedClientId;
        username = userDoc.data()?.username;
      }
    }

    if (!username || !clientId) {
      // Generate a new clientId and username
      clientId = randomUUID();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      username = `MazeRunner${randomSuffix}`;
      
      // Ensure username is unique (highly unlikely to collide with UUID, but good for username itself)
      // For simplicity, we'll assume MazeRunnerXXXX is unique enough for this app's scale.
      // A more robust system might check for username collisions and regenerate.
      
      await usersRef.doc(clientId).set({ 
        username, 
        createdAt: FieldValue.serverTimestamp() 
      });
      console.log(`[API/leaderboard/score POST] New user created. ClientId: ${clientId}, Username: ${username}`);
    } else {
      console.log(`[API/leaderboard/score POST] Existing user identified. ClientId: ${clientId}, Username: ${username}`);
    }

    // If gridSize is invalid, it's a request for username only, don't record score.
    if (typeof gridSize !== 'number' || gridSize < MIN_GRID_SIZE || typeof moveCount !== 'number' || moveCount <= 0) {
      return NextResponse.json({ 
        success: true, 
        username, 
        clientId, // Return clientId to the client
        message: 'User identified.'
      }, { status: 200 });
    }

    // Proceed with score recording only if gridSize is valid for a score
    // (This part is currently not actively used by the UI but kept for future use)
    const userLeaderboardDocRef = leaderboardRef.doc(clientId); 
    const userLeaderboardDoc = await userLeaderboardDocRef.get();

    let shouldUpdate = true;
    if (userLeaderboardDoc.exists) {
      const existingData = userLeaderboardDoc.data();
      if (existingData) {
        if (gridSize < existingData.highestLevel) {
          shouldUpdate = false;
        } else if (gridSize === existingData.highestLevel && moveCount >= existingData.movesAtHighestLevel) {
          shouldUpdate = false;
        }
      }
    }

    if (shouldUpdate) {
      await userLeaderboardDocRef.set({
        username, // ensure username is part of the doc data for display
        highestLevel: gridSize,
        movesAtHighestLevel: moveCount,
        lastPlayed: FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`[API/leaderboard/score POST] Score updated for clientId: ${clientId}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      username,
      clientId, // Return clientId
      message: shouldUpdate ? 'Score updated!' : 'Score recorded, but not better than previous.' 
    }, { status: 200 });

  } catch (error) {
    console.error('[API/leaderboard/score POST] Error processing request:', (error as Error).stack || error);
    return NextResponse.json({ 
      message: 'Failed to process request.', 
      error: (error as Error).message,
      username: username, // Include username if available
      clientId: clientId,   // Include clientId if available
    }, { status: 500 });
  }
}
