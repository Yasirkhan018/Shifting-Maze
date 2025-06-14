
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/shifting-maze/LeaderboardTable";
import { Zap, Gamepad2, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { getInitialRules, MIN_GRID_SIZE } from "@/lib/types";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const commonRules = getInitialRules(MIN_GRID_SIZE) + 
    "\n\nThe rules can mutate after every move, making the game unpredictably challenging. The goal is to turn all tiles green.";

  const fetchLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        let errorText = `Failed to fetch leaderboard: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || errorText;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const rawText = await response.text();
            errorText += `\nServer Response: ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`;
          } catch (textError) {
            // Ignore if text cannot be read
          }
        }
        throw new Error(errorText);
      }
      const data: LeaderboardEntry[] = await response.json();
      setLeaderboardEntries(data);
    } catch (error) {
      console.error("Leaderboard Fetch Error:", error);
      setLeaderboardError((error as Error).message || "Could not load leaderboard.");
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center space-y-2"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary font-headline flex items-center justify-center">
          <Zap className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mr-3 sm:mr-4 text-accent" />
          Shifting Maze
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          The ever-changing puzzle challenge!
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl space-y-8"
      >
        <Card className="shadow-xl border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-primary font-headline flex items-center">
              <Gamepad2 className="mr-3 h-7 w-7 text-accent" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-md sm:text-lg text-card-foreground whitespace-pre-line leading-relaxed">
              {commonRules}
            </p>
            <div className="mt-4 p-3 bg-secondary/50 border border-primary/20 rounded-md">
                <p className="text-sm text-secondary-foreground flex items-start">
                    <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 shrink-0 text-primary/80"/>
                    <span>The core mechanic: Click a tile to flip its color (green to red, or red to green). This also randomly flips ONE adjacent (up, down, left, or right) tile. The rules can change after EACH move!</span>
                </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/play" passHref>
            <Button size="lg" className="px-10 py-6 text-xl sm:text-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transform hover:scale-105 transition-transform duration-150 ease-out">
              <Zap className="mr-2 h-6 w-6" />
              Start Playing!
            </Button>
          </Link>
        </div>
        
        <Card className="shadow-xl border-primary/30 bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl sm:text-3xl text-primary font-headline flex items-center">
                    <Users className="mr-3 h-7 w-7 text-accent" />
                    Top Players
                </CardTitle>
                 <Button onClick={fetchLeaderboard} variant="outline" size="sm" disabled={isLeaderboardLoading} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLeaderboardLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                 <LeaderboardTable entries={leaderboardEntries} isLoading={isLeaderboardLoading} error={leaderboardError} />
            </CardContent>
        </Card>

      </motion.div>

      <footer className="text-center text-xs text-muted-foreground mt-6 py-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Prepare for delightful chaos.</p>
      </footer>
    </div>
  );
}
