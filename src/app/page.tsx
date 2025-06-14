
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap, ListChecks, Gamepad2, UserCircle, Loader2 } from "lucide-react"; // Added Loader2
import { getInitialRules, MIN_GRID_SIZE } from "@/lib/types";

const CLIENT_ID_STORAGE_KEY = 'shiftingMazeClientId';

export default function WelcomePage() {
  const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const initialRules = getInitialRules(MIN_GRID_SIZE);

  const fetchOrAssignUser = useCallback(async () => {
    setIsUserLoading(true);
    let clientId = null;
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    }

    try {
      const response = await fetch('/api/leaderboard/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send clientId (can be null) and dummy score data
        body: JSON.stringify({ clientId, gridSize: 0, moveCount: 0 }), 
      });

      if (!response.ok) {
        let errorText = `Failed to fetch user: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || errorText;
        } catch (e) {
          try {
            const rawText = await response.text();
            errorText += `\nServer Response: ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`;
          } catch (textError) {
            // Ignore
          }
        }
        console.warn(`Welcome Page: User Fetch API Error - ${errorText}`);
        toast({
          title: "User Fetch Error",
          description: errorText.split('\n')[0],
          variant: "destructive",
        });
        setCurrentUser(undefined); // Ensure currentUser is cleared on error
      } else {
        const data = await response.json();
        if (data.username && data.clientId) {
          setCurrentUser(data.username);
          if (typeof window !== 'undefined') {
            localStorage.setItem(CLIENT_ID_STORAGE_KEY, data.clientId);
          }
        } else {
          throw new Error("Username or ClientId not found in API response.");
        }
      }
    } catch (networkOrOtherError) {
      console.error("Welcome Page: User Fetch/Network Error:", networkOrOtherError);
      const errorMessage = (networkOrOtherError as Error).message || "Could not fetch user due to a network or unexpected error.";
      toast({
        title: "User Fetch Error",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentUser(undefined); // Ensure currentUser is cleared on error
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
        {currentUser && !isUserLoading && (
          <div className="mt-4 flex items-center justify-center text-md text-accent">
            <UserCircle className="mr-2 h-5 w-5" />
            Playing as: {currentUser}
          </div>
        )}
        {!currentUser && !isUserLoading && (
           <div className="mt-4 flex items-center justify-center text-md text-destructive">
            <UserCircle className="mr-2 h-5 w-5" />
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
              <Gamepad2 className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
              Start Playing!
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Leaderboard section is removed */}

      <footer className="text-center text-xs sm:text-sm text-muted-foreground mt-10 py-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Embrace the chaos.</p>
      </footer>
    </div>
  );
}
