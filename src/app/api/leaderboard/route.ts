
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const leaderboardRef = db.collection('leaderboard');
    const snapshot = await leaderboardRef
      .orderBy('highestLevel', 'desc')
      .orderBy('movesAtHighestLevel', 'asc')
      .orderBy('lastPlayed', 'desc') // Secondary sort for ties
      .limit(10) // Get top 10
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
        // rank will be determined by order
      };
    });

    return NextResponse.json(leaderboardData, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ message: 'Failed to fetch leaderboard.', error: (error as Error).message }, { status: 500 });
  }
}
