
"use client";

import { useState, useEffect, useCallback } from "react";
import { GameGrid } from "@/components/shifting-maze/GameGrid";
import { GameControls } from "@/components/shifting-maze/GameControls";
import { RulesDisplay } from "@/components/shifting-maze/RulesDisplay";
import { WinDialog } from "@/components/shifting-maze/WinDialog";
import { HintDisplay } from "@/components/shifting-maze/HintDisplay";
// LeaderboardTable and LeaderboardEntry are no longer used here
import type { GridState } from "@/lib/types";
import { MIN_GRID_SIZE, MAX_GRID_SIZE, getInitialRules, createGrid } from "@/lib/types";
import { toggleAdjacentTile } from "@/ai/flows/toggle-adjacent-tile";
import { mutateRules } from "@/ai/flows/mutate-rules";
import { generateHint } from "@/ai/flows/generate-hint-flow";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lightbulb, Loader2 } from "lucide-react"; // Removed RefreshCw
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function ShiftingMazePage() {
  const [gridSize, setGridSize] = useState<number>(MIN_GRID_SIZE);
  const [grid, setGrid] = useState<GridState>(() => createGrid(MIN_GRID_SIZE));
  const [currentRules, setCurrentRules] = useState<string>(() => getInitialRules(gridSize));
  const [rulesReasoning, setRulesReasoning] = useState<string | undefined>(undefined);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [toggledByAi, setToggledByAi] = useState<{row: number, col: number}[]>([]);
  const [currentHint, setCurrentHint] = useState<string | undefined>(undefined);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
  // currentUser state is removed as it's now on the welcome page
  // Leaderboard related states are removed
  // const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  // const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);
  // const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const { toast } = useToast();

  // fetchLeaderboard is removed

  const convertGridToString = (currentGrid: GridState): string => {
    return currentGrid.map(row => row.map(tile => (tile ? '1' : '0')).join('')).join('\\n');
  };

  const resetGridAndRules = useCallback((size: number) => {
    setGrid(createGrid(size));
    setCurrentRules(getInitialRules(size));
    setRulesReasoning(undefined);
    setMoveCount(0);
    setIsLoading(false);
    setIsGameWon(false);
    setToggledByAi([]);
    setCurrentHint(undefined);
    setIsHintLoading(false);
  }, []);

  useEffect(() => {
    resetGridAndRules(gridSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const checkWinCondition = useCallback((currentGrid: GridState) => {
    if (!currentGrid || currentGrid.length === 0) return false;
    return currentGrid.every(row => row.every(tile => tile === true));
  }, []);

  useEffect(() => {
    if (checkWinCondition(grid) && moveCount > 0 && !isLoading) {
      setIsGameWon(true);
      setCurrentHint(undefined); 
    }
  }, [grid, checkWinCondition, moveCount, isLoading]);

  const resetCurrentLevel = useCallback(() => {
    resetGridAndRules(gridSize);
  }, [gridSize, resetGridAndRules]);

  // submitScore function is removed
  // const submitScore = async (completedGridSize: number, finalMoveCount: number) => { ... };

  const setupNextLevel = useCallback(() => {
    // const completedLevelSize = gridSize; 
    // const finalMoveCount = moveCount;
    // submitScore(completedLevelSize, finalMoveCount); // Call to submitScore is removed
    
    let newSize = gridSize + 1;
    if (newSize > MAX_GRID_SIZE) {
      newSize = MIN_GRID_SIZE; 
      toast({
        title: "Cycle Complete!",
        description: `You've mastered all grid sizes! Back to ${MIN_GRID_SIZE}x${MIN_GRID_SIZE}.`,
      });
    }
    setGridSize(newSize); 
  }, [gridSize, toast]); // Removed moveCount and fetchLeaderboard from dependencies


  const handleTileClick = async (row: number, col: number) => {
    if (isLoading || isGameWon) return;

    setIsLoading(true);
    setRulesReasoning(undefined); 
    setToggledByAi([]);
    
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    let tempGrid = grid.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? !c : c))
    );
    setGrid(tempGrid); 
    setToggledByAi([{row, col}]);

    try {
      const adjacentToggleResult = await toggleAdjacentTile({ row, col, gridSize });
      const { adjacentRow, adjacentCol } = adjacentToggleResult;
      
      tempGrid = tempGrid.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === adjacentRow && cIdx === adjacentCol ? !c : c))
      );
      setGrid(tempGrid); 
      setToggledByAi(prev => [...prev, {row: adjacentRow, col: adjacentCol}]);

      const ruleMutationResult = await mutateRules({ currentRules, moveNumber: newMoveCount, gridSize });
      setCurrentRules(ruleMutationResult.newRules);
      setRulesReasoning(ruleMutationResult.reasoning); 

      if (newMoveCount > 0 && !checkWinCondition(tempGrid)) {
         const shouldGenerateHint = (newMoveCount >= 15) || (newMoveCount < 15 && newMoveCount % 5 === 0);

        if (shouldGenerateHint) {
          setIsHintLoading(true);
          setCurrentHint(undefined);
          try {
            const gridStateString = convertGridToString(tempGrid);
            const hintResult = await generateHint({
              gridStateString,
              currentRules: ruleMutationResult.newRules,
              moveCount: newMoveCount,
              gridSize,
            });
            setCurrentHint(hintResult.hintText);
          } catch (hintError) {
            console.error("Hint Generation Error:", hintError);
            toast({
              title: "Hint Error",
              description: "Could not generate a hint at this time.",
              variant: "destructive",
            });
            setCurrentHint(undefined);
          } finally {
            setIsHintLoading(false);
          }
        } else {
          setCurrentHint(undefined);
        }
      } else if (checkWinCondition(tempGrid)) {
        setIsGameWon(true);
        setCurrentHint(undefined);
      }


    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "AI Error",
        description: (error as Error).message || "Could not process game logic. Please try again.",
        variant: "destructive",
      });
      setCurrentHint(undefined); 
      setRulesReasoning(undefined); 
    } finally {
      setIsLoading(false);
      if (checkWinCondition(tempGrid) && !isGameWon) { 
        setIsGameWon(true);
      }
    }
  };

  const showRulesUpdateCard = (isLoading && moveCount > 0 && !isHintLoading && !isGameWon) || rulesReasoning;
  const isRuleMutationLoading = isLoading && moveCount > 0 && !isHintLoading && !rulesReasoning && !isGameWon;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 sm:space-y-8 bg-background text-foreground">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-headline flex items-center justify-center">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mr-2 sm:mr-3 text-accent" />
          Shifting Maze
        </h1>
        <p className="text-sm sm:text-md text-muted-foreground mt-1 sm:mt-2">The unsolvable {gridSize}x{gridSize} puzzle where rules change with every move!</p>
        {/* currentUser display removed */}
         <Link href="/" passHref>
            <Button variant="link" className="text-xs text-accent mt-1 p-0 h-auto">
              &larr; Back to Welcome
            </Button>
          </Link>
      </motion.header>

      <motion.main 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-6 sm:space-y-8 w-full"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start justify-center w-full px-2 sm:px-4 max-w-5xl">
          <RulesDisplay rules={currentRules} />
          
          {showRulesUpdateCard && (
            <Card className="w-full max-w-md shadow-lg bg-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-center text-primary font-headline">
                  {isRuleMutationLoading && <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />}
                  Rules Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rulesReasoning ? (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Alert className="bg-secondary border-primary/50">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <AlertTitle className="text-primary font-semibold">Rules Mutated!</AlertTitle>
                        <AlertDescription className="text-secondary-foreground whitespace-pre-line">
                          {rulesReasoning}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  </AnimatePresence>
                ) : isRuleMutationLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-sm text-secondary-foreground">Checking for rule changes...</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          <HintDisplay hint={currentHint} isLoading={isHintLoading} />
        </div>
        
        <GameGrid 
          grid={grid}
          gridSize={gridSize}
          onTileClick={handleTileClick} 
          isInteractive={!isLoading && !isGameWon}
          toggledTiles={toggledByAi}
        />
        
        <GameControls 
          moveCount={moveCount} 
          onReset={resetCurrentLevel} 
          isInteractive={!isLoading}
          isLoading={(isLoading && moveCount > 0) || isHintLoading}
        />

        {/* LeaderboardTable and refresh button removed */}
        {/* <LeaderboardTable entries={leaderboardEntries} isLoading={isLeaderboardLoading} error={leaderboardError} /> */}
        {/* <Button onClick={fetchLeaderboard} variant="outline" disabled={isLeaderboardLoading} className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLeaderboardLoading ? 'animate-spin' : ''}`} />
            Refresh Leaderboard
        </Button> */}

      </motion.main>

      <WinDialog 
        isOpen={isGameWon} 
        onClose={() => {
          setIsGameWon(false); 
          setCurrentHint(undefined); 
        }} 
        onReset={() => {
          setupNextLevel(); 
          setCurrentHint(undefined); 
        }} />
      
      <footer className="text-center text-xs text-muted-foreground mt-4 py-4">
        <p>&copy; 2025 Shifting Maze. Designed to be delightfully frustrating.</p>
      </footer>
    </div>
  );
}
