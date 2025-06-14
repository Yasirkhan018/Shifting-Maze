
"use client";

import { useState, useEffect, useCallback } from "react";
import { GameGrid } from "@/components/shifting-maze/GameGrid";
import { GameControls } from "@/components/shifting-maze/GameControls";
import { RulesDisplay } from "@/components/shifting-maze/RulesDisplay";
import { WinDialog } from "@/components/shifting-maze/WinDialog";
import { HintDisplay } from "@/components/shifting-maze/HintDisplay";
import type { GridState } from "@/lib/types";
import { MIN_GRID_SIZE, MAX_GRID_SIZE, getInitialRules, createGrid } from "@/lib/types";
import { toggleAdjacentTile } from "@/ai/flows/toggle-adjacent-tile";
import { mutateRules } from "@/ai/flows/mutate-rules";
import { generateHint } from "@/ai/flows/generate-hint-flow";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";


export default function ShiftingMazePage() {
  const [gridSize, setGridSize] = useState<number>(MIN_GRID_SIZE);
  const [grid, setGrid] = useState<GridState>(() => createGrid(gridSize));
  const [currentRules, setCurrentRules] = useState<string>(() => getInitialRules(gridSize));
  const [rulesReasoning, setRulesReasoning] = useState<string | undefined>(undefined);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [toggledByAi, setToggledByAi] = useState<{row: number, col: number}[]>([]);
  const [currentHint, setCurrentHint] = useState<string | undefined>(undefined);
  const [isHintLoading, setIsHintLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const convertGridToString = (currentGrid: GridState): string => {
    return currentGrid.map(row => row.map(tile => (tile ? '1' : '0')).join('')).join('\\n');
  };

  const resetGridAndRules = useCallback((size: number) => {
    let initialGrid = createGrid(size);
    if (size === MIN_GRID_SIZE) {
      if (initialGrid.length === 3 && initialGrid[0].length === 3) {
        initialGrid[0][0] = true; 
        initialGrid[2][2] = true; 
      }
    }
    setGrid(initialGrid);
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
      setCurrentHint(undefined); // Clear hint on win
    }
  }, [grid, checkWinCondition, moveCount, isLoading]);

  const resetCurrentLevel = useCallback(() => {
    resetGridAndRules(gridSize);
  }, [gridSize, resetGridAndRules]);

  const setupNextLevel = useCallback(() => {
    let newSize = gridSize + 1;
    if (newSize > MAX_GRID_SIZE) {
      newSize = MIN_GRID_SIZE; 
    }
    setGridSize(newSize); 
  }, [gridSize]);


  const handleTileClick = async (row: number, col: number) => {
    if (isLoading || isGameWon) return;

    setIsLoading(true);
    setRulesReasoning(undefined);
    setToggledByAi([]);
    // Don't clear hint immediately, only if not a hint turn or on new hint fetch

    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    let tempGrid = grid.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? !c : c))
    );
    setGrid(tempGrid); // Optimistic update for clicked tile
    setToggledByAi([{row, col}]);

    try {
      const adjacentToggleResult = await toggleAdjacentTile({ row, col, gridSize });
      const { adjacentRow, adjacentCol } = adjacentToggleResult;
      
      tempGrid = tempGrid.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === adjacentRow && cIdx === adjacentCol ? !c : c))
      );
      setGrid(tempGrid); // Update for AI toggled tile
      setToggledByAi(prev => [...prev, {row: adjacentRow, col: adjacentCol}]);

      const ruleMutationResult = await mutateRules({ currentRules, moveNumber: newMoveCount, gridSize });
      setCurrentRules(ruleMutationResult.newRules);
      setRulesReasoning(ruleMutationResult.reasoning);

      // Hint generation logic
      if (newMoveCount > 0 && !checkWinCondition(tempGrid)) {
        if (newMoveCount % 5 === 0) {
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
          // If it's not a hint turn, clear any previous hint as rules changed.
          setCurrentHint(undefined);
        }
      } else if (checkWinCondition(tempGrid)) {
        setIsGameWon(true);
        setCurrentHint(undefined); // Clear hint if game won on this move
      }


    } catch (error) {
      console.error("AI Error:", error);
      toast({
        title: "AI Error",
        description: "Could not process game logic. Please try again.",
        variant: "destructive",
      });
      setCurrentHint(undefined); // Clear hint on general error
    } finally {
      setIsLoading(false);
      if (checkWinCondition(tempGrid) && !isGameWon) { // Ensure isGameWon is not already true
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
        <p className="text-sm sm:text-md text-muted-foreground mt-1 sm:mt-2">The unsolvable {gridSize}x{gridSize} puzzle where rules change with every move!</p>
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
          isLoadingMutation={isLoading && moveCount > 0 && !isHintLoading} 
        />

        <HintDisplay hint={currentHint} isLoading={isHintLoading} />
        
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
      </motion.main>

      <WinDialog 
        isOpen={isGameWon} 
        onClose={() => {
          setIsGameWon(false); 
          setCurrentHint(undefined); // Clear hint when closing win dialog
        }} 
        onReset={() => {
          setupNextLevel();
          setCurrentHint(undefined); // Clear hint when starting next level
        }} />
      
      <footer className="text-center text-xs text-muted-foreground mt-4">
        <p>&copy; {new Date().getFullYear()} Shifting Maze. Designed to be delightfully frustrating.</p>
      </footer>
    </div>
  );
}
