
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaderboardTable, type LeaderboardEntry } from "@/components/shifting-maze/LeaderboardTable";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap, ListChecks, Trophy, RefreshCw, Gamepad2 } from "lucide-react";
import { getInitialRules, MIN_GRID_SIZE } from "@/lib/types";

export default function WelcomePage() {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const { toast } = useToast();

  const initialRules = getInitialRules(MIN_GRID_SIZE); // Get rules for base grid size

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
          if (errorData.guidance) {
            // console.warn("Server guidance:", errorData.guidance);
          }
        } catch (e) {
           try {
            const rawText = await response.text();
            errorText += `\nServer Response (first 200 chars): ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`;
          } catch (textError) {
            // Ignore if text cannot be read
          }
        }
        console.warn(`Welcome Page: Leaderboard API Error - ${errorText}`);
        setLeaderboardError(errorText);
        toast({
          title: "Leaderboard Error",
          description: errorText.split('\n')[0], // Show only primary error message
          variant: "destructive",
        });
      } else {
        const data: LeaderboardEntry[] = await response.json();
        setLeaderboardEntries(data);
      }
    } catch (networkOrOtherError) {
      console.error("Welcome Page: Leaderboard Fetch/Network Error:", networkOrOtherError);
      const errorMessage = (networkOrOtherError as Error).message || "Could not load leaderboard due to a network or unexpected error.";
      setLeaderboardError(errorMessage);
      toast({
        title: "Leaderboard Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 bg-background text-foreground">
      <motion.header 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 md:mb-12"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary font-headline flex items-center justify-center">
          <Zap className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mr-3 sm:mr-4 text-accent" />
          Shifting Maze
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mt-3 sm:mt-4">
          The unsolvable puzzle where rules change with every move!
        </p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl space-y-8 md:space-y-10"
      >
        <Card className="shadow-xl border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-primary font-headline flex items-center">
              <ListChecks className="mr-3 h-7 w-7 text-accent" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="text-base sm:text-lg text-foreground space-y-3">
            <p className="whitespace-pre-line">{initialRules}</p>
            <p>
              The core mechanic is simple, but the ever-changing rules, powered by AI, 
              will keep you on your toes. Each move can bring a new twist!
            </p>
            <p>
              Your goal is to turn all tiles green. Sound easy? Think again!
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/play" passHref>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-7 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150">
              <Gamepad2 className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
              Start Playing!
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl sm:text-3xl text-primary font-headline flex items-center">
              <Trophy className="mr-3 h-7 w-7 text-accent" />
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

      <footer className="text-center text-xs sm:text-sm text-muted-foreground mt-10 py-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Embrace the chaos.</p>
      </footer>
    </div>
  );
}
