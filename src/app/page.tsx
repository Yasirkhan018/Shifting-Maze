
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, ListChecks, Gamepad2, UserCircle, LogIn, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { getInitialRules, MIN_GRID_SIZE } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomePage() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const initialRules = getInitialRules(MIN_GRID_SIZE);

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
        
        {loading && (
          <div className="mt-4 flex items-center justify-center text-md text-accent">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Authenticating...
          </div>
        )}
        {!loading && user && (
          <div className="mt-4 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center text-md text-accent">
              <UserCircle className="mr-2 h-5 w-5" />
              Signed in as: {user.displayName || user.email}
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
        {!loading && !user && (
           <div className="mt-4">
            <Button onClick={signInWithGoogle} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <LogIn className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
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
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-7 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150">
              <Gamepad2 className="mr-3 h-6 w-6 sm:h-7 sm:h-7" />
              Start Playing!
            </Button>
          </Link>
        </div>
      </motion.div>

      <footer className="text-center text-xs sm:text-sm text-muted-foreground mt-10 py-4">
        <p>Lale &amp; Co | &copy; 2025 Shifting Maze. Embrace the chaos.</p>
      </footer>
    </div>
  );
}
