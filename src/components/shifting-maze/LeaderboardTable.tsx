
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";

export interface LeaderboardEntry {
  rank?: number; // Added by client
  username: string;
  highestLevel: number;
  moves: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error?: string | null;
}

export function LeaderboardTable({ entries, isLoading, error }: LeaderboardTableProps) {
  const rankedEntries = entries.map((entry, index) => ({ ...entry, rank: index + 1 }));

  return (
    <Card className="w-full max-w-2xl shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-center text-primary font-headline flex items-center justify-center">
          <Trophy className="mr-2 h-6 w-6 text-accent" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2 text-sm text-secondary-foreground">Loading leaderboard...</p>
          </div>
        )}
        {error && !isLoading && (
          <p className="text-center text-destructive p-4">{error}</p>
        )}
        {!isLoading && !error && rankedEntries.length === 0 && (
          <p className="text-center text-muted-foreground p-4">No scores yet. Be the first!</p>
        )}
        {!isLoading && !error && rankedEntries.length > 0 && (
          <Table>
            <TableCaption>Top players in the Shifting Maze.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-center">Highest Level</TableHead>
                <TableHead className="text-center">Moves</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedEntries.map((entry) => (
                <TableRow key={entry.username}>
                  <TableCell className="font-medium text-center">{entry.rank}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell className="text-center">{entry.highestLevel}x{entry.highestLevel}</TableCell>
                  <TableCell className="text-center">{entry.moves}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
