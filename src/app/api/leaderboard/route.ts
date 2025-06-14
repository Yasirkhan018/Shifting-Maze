
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    if (!db) {
      console.error('[API/leaderboard GET] Firestore database instance (db) is not available. Check Firebase Admin SDK initialization in server logs.');
      return NextResponse.json({ message: 'Server configuration error: Database service not initialized.', error: 'DB_INIT_FAILURE' }, { status: 500 });
    }

    const leaderboardRef = db.collection('leaderboard');
    const snapshot = await leaderboardRef
      .orderBy('highestLevel', 'desc')
      .orderBy('movesAtHighestLevel', 'asc')
      .orderBy('lastPlayed', 'desc') 
      .limit(10) 
      .get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const leaderboardData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        username: data.username,
        highestLevel: data.highestLevel,
        moves: data.movesAtHighestLevel,
      };
    });

    return NextResponse.json(leaderboardData, { status: 200 });
  } catch (error) {
    console.error('[API/leaderboard GET] Error fetching leaderboard:', (error as Error).stack || error);
    return NextResponse.json({ message: 'Failed to fetch leaderboard.', error: (error as Error).message }, { status: 500 });
  }
}
