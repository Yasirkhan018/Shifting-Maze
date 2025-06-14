
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

// Constants from src/lib/types.ts
const MIN_GRID_SIZE = 3; 

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      console.error('[API/leaderboard/score POST] Firestore database instance (db) is not available. Check Firebase Admin SDK initialization in server logs.');
      return NextResponse.json({ message: 'Server configuration error: Database service not initialized.', error: 'DB_INIT_FAILURE' }, { status: 500 });
    }

    const { gridSize, moveCount } = await request.json();

    if (typeof gridSize !== 'number' || typeof moveCount !== 'number' || gridSize < MIN_GRID_SIZE || moveCount <= 0) {
      return NextResponse.json({ message: 'Invalid score data provided.' }, { status: 400 });
    }

    const headerList = headers();
    const ipAddress = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

    if (!ipAddress) {
      // This case is unlikely as x-forwarded-for or a direct IP should almost always be present.
      console.warn('[API/leaderboard/score POST] Could not determine user IP from headers.');
      return NextResponse.json({ message: 'Could not determine user IP.' }, { status: 400 });
    }

    const usersRef = db.collection('users');
    const leaderboardRef = db.collection('leaderboard');
    const metadataRef = db.collection('metadata').doc('gameStats');

    let username: string;
    let userId: number;

    const userQuery = await usersRef.where('ipAddress', '==', ipAddress).limit(1).get();

    if (userQuery.empty) {
      const newUserId = await db.runTransaction(async (transaction) => {
        const metadataDoc = await transaction.get(metadataRef);
        let currentMaxId = 0;
        if (metadataDoc.exists) {
          currentMaxId = metadataDoc.data()?.nextUserId || 0;
        }
        const nextId = currentMaxId + 1;
        transaction.set(metadataRef, { nextUserId: nextId }, { merge: true });
        return nextId;
      });
      userId = newUserId;
      username = `maze${userId}`;
      await usersRef.doc(username).set({ ipAddress, username, userId, createdAt: FieldValue.serverTimestamp() });
    } else {
      const userData = userQuery.docs[0].data();
      username = userData.username;
      userId = userData.userId;
    }

    const userLeaderboardDocRef = leaderboardRef.doc(username);
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
        username,
        userId,
        highestLevel: gridSize,
        movesAtHighestLevel: moveCount,
        lastPlayed: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    
    return NextResponse.json({ success: true, username, message: shouldUpdate ? 'Score updated!' : 'Score recorded, but not better than previous.' }, { status: 200 });

  } catch (error) {
    console.error('[API/leaderboard/score POST] Error submitting score:', (error as Error).stack || error);
    return NextResponse.json({ message: 'Failed to submit score.', error: (error as Error).message }, { status: 500 });
  }
}
