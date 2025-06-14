
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { gridSize, moveCount } = await request.json();

    if (typeof gridSize !== 'number' || typeof moveCount !== 'number' || gridSize < MIN_GRID_SIZE || moveCount <= 0) {
      return NextResponse.json({ message: 'Invalid score data provided.' }, { status: 400 });
    }

    const headerList = headers();
    const ipAddress = (headerList.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

    if (!ipAddress) {
      return NextResponse.json({ message: 'Could not determine user IP.' }, { status: 400 });
    }

    const usersRef = db.collection('users');
    const leaderboardRef = db.collection('leaderboard');
    const metadataRef = db.collection('metadata').doc('gameStats');

    let username: string;
    let userId: number;

    const userQuery = await usersRef.where('ipAddress', '==', ipAddress).limit(1).get();

    if (userQuery.empty) {
      // New user, generate username
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

    // Record score
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
    console.error('Error submitting score:', error);
    return NextResponse.json({ message: 'Failed to submit score.', error: (error as Error).message }, { status: 500 });
  }
}

// Constants from src/lib/types.ts (cannot import directly in API route easily without module aliasing complexities for this simple case)
const MIN_GRID_SIZE = 3;
