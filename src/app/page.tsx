"use client";

import { useState, useEffect, useCallback } from "react";
import { GameGrid } from "@/components/shifting-maze/GameGrid";
import { GameControls } from "@/components/shifting-maze/GameControls";
import { RulesDisplay } from "@/components/shifting-maze/RulesDisplay";
import { WinDialog } from "@/components/shifting-maze/WinDialog";
import type { GridState } from "@/lib/types";
import { INITIAL_RULES, createInitialGrid } from "@/lib/types";
import { toggleAdjacentTile } from "@/ai/flows/toggle-adjacent-tile";
import { mutateRules } from "@/ai/flows/mutate-rules";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";


export default function ShiftingMazePage() {
  const [grid, setGrid] = useState<GridState>(createInitialGrid());
  const [currentRules, setCurrentRules] = useState<string>(INITIAL_RULES);
  const [rulesReasoning, setRulesReasoning] = useState<string | undefined>(undefined);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [toggledByAi, setToggledByAi] = useState<{row: number, col: number}[]>([]);

  const { toast } = useToast();

  const checkWinCondition = useCallback((currentGrid: GridState) => {
    return currentGrid.every(row => row.every(tile => tile === true));
  }, []);

  const resetGame = useCallback(() => {
    setGrid(createInitialGrid());
    setCurrentRules(INITIAL_RULES);
    setRulesReasoning(undefined);
    setMoveCount(0);
    setIsLoading(false);
    setIsGameWon(false);
    setToggledByAi([]);
  }, []);

  useEffect(() => {
    if (checkWinCondition(grid) && moveCount > 0) {
      setIsGameWon(true);
    }
  }, [grid, checkWinCondition, moveCount]);

  const handleTileClick = async (row: number, col: number) => {
    if (isLoading || isGameWon) return;

    setIsLoading(true);
    setRulesReasoning(undefined); // Clear previous reasoning
    setToggledByAi([]); // Clear previous AI toggles

    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    // 1. Toggle clicked tile
    let newGrid = grid.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? !c : c))
    );
    setGrid(newGrid);
    setToggledByAi([{row, col}]);


    try {
      // 2. Toggle adjacent tile using AI
      const adjacentToggleResult = await toggleAdjacentTile({ row, col });
      const { adjacentRow, adjacentCol } = adjacentToggleResult;
      
      newGrid = newGrid.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === adjacentRow && cIdx === adjacentCol ? !c : c))
      );
      setGrid(newGrid); // Update grid with AI toggle
      setToggledByAi(prev => [...prev, {row: adjacentRow, col: adjacentCol}]);


      // 3. Mutate rules using AI
      const ruleMutationResult = await mutateRules({ currentRules, moveNumber: newMoveCount });
      setCurrentRules(ruleMutationResult.newRules);
      setRulesReasoning(ruleMutationResult.reasoning);

    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "AI Error",
        description: "Could not process game logic. Please try again.",
        variant: "destructive",
      });
      // Potentially revert move or reset part of the state if AI fails critically
      // For this game, we might let it continue with potentially inconsistent state
      // or revert the move count.
      // setMoveCount(moveCount); // Revert move count if AI fails
    } finally {
      setIsLoading(false);
      // Re-check win condition after all updates
       if (checkWinCondition(newGrid)) {
        setIsGameWon(true);
      }
    }
  };


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
        <p className="text-sm sm:text-md text-muted-foreground mt-1 sm:mt-2">The unsolvable puzzle where rules change with every move!</p>
      </motion.header>

      <motion.main 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-6 sm:space-y-8 w-full"
      >
        <RulesDisplay 
          rules={currentRules} 
          reasoning={rulesReasoning}
          isLoadingMutation={isLoading} 
        />
        
        <GameGrid 
          grid={grid} 
          onTileClick={handleTileClick} 
          isInteractive={!isLoading && !isGameWon}
          toggledTiles={toggledByAi}
        />
        
        <GameControls 
          moveCount={moveCount} 
          onReset={resetGame} 
          isInteractive={!isLoading}
          isLoading={isLoading && moveCount > 0} // Show loader on reset if mid-AI-turn (though usually reset is separate)
        />
      </motion.main>

      <WinDialog isOpen={isGameWon} onClose={() => setIsGameWon(false)} onReset={resetGame} />
      
      <footer className="text-center text-xs text-muted-foreground mt-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Designed to be delightfully frustrating.</p>
      </footer>
    </div>
  );
}
