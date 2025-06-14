
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap, ListChecks, Gamepad2, UserCircle, Loader2, AlertTriangle } from "lucide-react";
import { getInitialRules, MIN_GRID_SIZE } from "@/lib/types";

const CLIENT_ID_STORAGE_KEY = 'shiftingMazeClientId';

export default function WelcomePage() {
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const initialRules = getInitialRules(MIN_GRID_SIZE);

  const fetchOrAssignUser = useCallback(async () => {
    setIsUserLoading(true);
    let storedClientId: string | null = null;
    if (typeof window !== 'undefined') {
      storedClientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    }

    try {
      const response = await fetch('/api/leaderboard/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: storedClientId, gridSize: 0, moveCount: 0 }), 
      });

      if (!response.ok) {
        let errorTitle = "User Fetch Error";
        let errorDescription = `Failed to fetch user: ${response.status} ${response.statusText}`;
        let errorDetails = "";

        try {
          const errorData = await response.json();
          errorDescription = errorData.message || errorData.error || errorDescription;
          if (errorData.username) console.warn("Welcome Page: Username from error response:", errorData.username);
          if (errorData.clientId) console.warn("Welcome Page: ClientId from error response:", errorData.clientId);
          
          let detailSource = errorData.errorName || 'N/A';
          if ((detailSource === 'N/A' || detailSource === 'Error') && errorData.error && typeof errorData.error === 'string' && errorData.error !== errorDescription) {
            // Use the server's error.message if errorName is generic and error.message provides different info
            detailSource = errorData.error;
          }
          errorDetails = ` (Server Details: ${detailSource})`;

        } catch (e) {
          // Failed to parse JSON, try to get raw text
          try {
            const rawText = await response.text();
            errorDescription = `${response.status} ${response.statusText}`; // Keep this concise
            errorDetails = `\nServer Response (limit 200 chars): ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`;
          } catch (textError) {
            // Fallback if text also fails
             errorDetails = "\nCould not parse error response from server.";
          }
        }
        
        console.error(`Welcome Page: User Fetch API Error - ${errorDescription}${errorDetails}`);
        toast({
          title: errorTitle,
          description: `${errorDescription.split('\n')[0]}${errorDetails.split('\n')[0]}`,
          variant: "destructive",
        });
        setCurrentUser(undefined);
      } else {
        const data = await response.json();
        if (data.username && data.clientId) {
          setCurrentUser(data.username);
          if (typeof window !== 'undefined') {
            localStorage.setItem(CLIENT_ID_STORAGE_KEY, data.clientId);
          }
          console.log("Welcome Page: User fetched/assigned successfully:", data.username, data.clientId);
        } else {
          console.error("Welcome Page: Username or ClientId not found in successful API response. Data:", data);
          throw new Error("Username or ClientId missing in API response.");
        }
      }
    } catch (networkOrOtherError) {
      const error = networkOrOtherError as Error;
      console.error("Welcome Page: User Fetch/Network Error:", error.stack || error);
      toast({
        title: "User Fetch Error",
        description: error.message || "Could not fetch user due to a network or unexpected error.",
        variant: "destructive",
      });
      setCurrentUser(undefined);
    } finally {
      setIsUserLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrAssignUser();
  }, [fetchOrAssignUser]);

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
        {isUserLoading && (
          <div className="mt-4 flex items-center justify-center text-md text-accent">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Identifying you in the maze...
          </div>
        )}
        {!isUserLoading && currentUser && (
          <div className="mt-4 flex items-center justify-center text-md text-accent">
            <UserCircle className="mr-2 h-5 w-5" />
            Playing as: {currentUser}
          </div>
        )}
        {!isUserLoading && !currentUser && (
           <div className="mt-4 flex items-center justify-center text-md text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Could not identify user. You can still play.
          </div>
        )}
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-xl space-y-8 md:space-y-10"
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
              <Gamepad2 className="mr-3 h-6 w-6 sm:h-7 sm:h-7" />
              Start Playing!
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Leaderboard functionality is removed */}
      {/* 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-2xl mt-8"
      >
        {isLeaderboardLoading && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
        {leaderboardError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Leaderboard Error</AlertTitle><AlertDescription>{leaderboardError}</AlertDescription></Alert>}
        {!isLeaderboardLoading && !leaderboardError && leaderboardEntries.length > 0 && (
          <LeaderboardTable entries={leaderboardEntries} isLoading={isLeaderboardLoading} error={leaderboardError} />
        )}
        {!isLeaderboardLoading && !leaderboardError && leaderboardEntries.length === 0 && (
           <div className="text-center text-muted-foreground">Leaderboard is currently empty or unavailable.</div>
        )}
      </motion.div> 
      */}

      <footer className="text-center text-xs sm:text-sm text-muted-foreground mt-10 py-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Embrace the chaos.</p>
      </footer>
    </div>
  );
}
