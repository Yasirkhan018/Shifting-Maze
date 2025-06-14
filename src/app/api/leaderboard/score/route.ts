
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { MIN_GRID_SIZE } from "@/lib/types";
import { randomUUID } from 'crypto'; // For generating clientId

export async function POST(request: NextRequest) {
  let username: string | undefined = undefined;
  let clientId: string | undefined = undefined;
  let requestBody: any;

  try {
    requestBody = await request.json();
    console.log('[API/leaderboard/score POST] Received request. Body:', JSON.stringify(requestBody));
  } catch (e) {
    console.error('[API/leaderboard/score POST] Error parsing request JSON:', (e as Error).stack || e);
    return NextResponse.json({ 
      message: 'Invalid request body.', 
      error: (e as Error).message 
    }, { status: 400 });
  }

  try {
    if (!db) {
      console.error('[API/leaderboard/score POST] Firestore database instance (db) is not available. Check Firebase Admin SDK initialization in server logs.');
      return NextResponse.json({ 
        message: 'Server configuration error: Database service not initialized.', 
        error: 'DB_INIT_FAILURE',
        username, 
        clientId 
      }, { status: 500 });
    }
    console.log('[API/leaderboard/score POST] Firestore db instance appears to be available.');

    const providedClientId = requestBody.clientId as string | undefined;
    const { gridSize, moveCount } = requestBody;

    const usersRef = db.collection('users');
    // Leaderboard collection is not used in this flow if scores are not being submitted actively
    // const leaderboardRef = db.collection('leaderboard'); 

    if (providedClientId) {
      console.log(`[API/leaderboard/score POST] ClientId provided: ${providedClientId}. Attempting to fetch user.`);
      const userDoc = await usersRef.doc(providedClientId).get();
      if (userDoc.exists) {
        clientId = providedClientId;
        username = userDoc.data()?.username;
        console.log(`[API/leaderboard/score POST] User found for clientId ${clientId}: Username ${username}`);
      } else {
        console.log(`[API/leaderboard/score POST] No user found for provided clientId: ${providedClientId}. A new user will be created.`);
      }
    } else {
       console.log('[API/leaderboard/score POST] No ClientId provided. A new user will be created.');
    }

    if (!username || !clientId) {
      const newClientId = randomUUID();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newUsername = `MazeRunner${randomSuffix}`;
      
      await usersRef.doc(newClientId).set({ 
        username: newUsername, 
        createdAt: FieldValue.serverTimestamp() 
      });
      clientId = newClientId;
      username = newUsername;
      console.log(`[API/leaderboard/score POST] New user created. ClientId: ${clientId}, Username: ${username}`);
    } else {
      console.log(`[API/leaderboard/score POST] Existing user identified. ClientId: ${clientId}, Username: ${username}`);
    }

    // This part handles requests that are only for username retrieval (gridSize 0)
    // or actual score submissions (commented out for now)
    if (typeof gridSize !== 'number' || gridSize < MIN_GRID_SIZE || typeof moveCount !== 'number' || moveCount < 0) {
      console.log(`[API/leaderboard/score POST] Request identified as username fetch or invalid score. gridSize: ${gridSize}, moveCount: ${moveCount}. Returning user info.`);
      return NextResponse.json({ 
        success: true, 
        username, 
        clientId, 
        message: 'User identified/created.'
      }, { status: 200 });
    }

    // Actual score recording logic is currently not active in the UI.
    // If re-enabled, this part would handle it.
    // const userLeaderboardDocRef = leaderboardRef.doc(clientId); 
    // const userLeaderboardDoc = await userLeaderboardDocRef.get();
    // let shouldUpdate = true;
    // if (userLeaderboardDoc.exists) {
    //   const existingData = userLeaderboardDoc.data();
    //   if (existingData) {
    //     if (gridSize < existingData.highestLevel) {
    //       shouldUpdate = false;
    //     } else if (gridSize === existingData.highestLevel && moveCount >= existingData.movesAtHighestLevel) {
    //       shouldUpdate = false;
    //     }
    //   }
    // }
    // if (shouldUpdate) {
    //   await userLeaderboardDocRef.set({
    //     username, 
    //     highestLevel: gridSize,
    //     movesAtHighestLevel: moveCount,
    //     lastPlayed: FieldValue.serverTimestamp(),
    //   }, { merge: true });
    //   console.log(`[API/leaderboard/score POST] Score updated for clientId: ${clientId}`);
    // }
    
    console.log(`[API/leaderboard/score POST] Successfully processed. Returning username: ${username}, clientId: ${clientId}`);
    return NextResponse.json({ 
      success: true, 
      username,
      clientId, 
      message: 'Score processing logic (currently inactive) would go here.'
      // message: shouldUpdate ? 'Score updated!' : 'Score recorded, but not better than previous.' 
    }, { status: 200 });

  } catch (error) {
    console.error('[API/leaderboard/score POST] Error processing request:', (error as Error).stack || error);
    return NextResponse.json({ 
      message: 'Failed to process request due to a server error.', 
      error: (error as Error).message,
      errorName: (error as Error).name,
      username: username, 
      clientId: clientId,   
    }, { status: 500 });
  }
}
