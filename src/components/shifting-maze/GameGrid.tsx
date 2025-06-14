
"use client";

import type { GridState } from "@/lib/types";
import { Tile } from "./Tile";
import { MIN_GRID_SIZE } from "@/lib/types"; // Import for default column count

interface GameGridProps {
  grid: GridState;
  gridSize: number;
  onTileClick: (row: number, col: number) => void;
  isInteractive: boolean;
  toggledTiles?: { row: number; col: number }[];
}

export function GameGrid({ grid, gridSize, onTileClick, isInteractive, toggledTiles }: GameGridProps) {
  const cols = grid && grid.length > 0 ? grid[0].length : gridSize || MIN_GRID_SIZE;
  
  return (
    <div
      className={`grid grid-cols-${cols} gap-1 sm:gap-2 p-1 sm:p-2 bg-card rounded-lg shadow-lg`}
      role="grid"
      aria-label="Game Grid"
    >
      {grid.map((rowState, rowIndex) =>
        rowState.map((isGreen, colIndex) => {
          const isRecentlyToggled = toggledTiles?.some(t => t.row === rowIndex && t.col === colIndex);
          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              isGreen={isGreen}
              onClick={() => onTileClick(rowIndex, colIndex)}
              isInteractive={isInteractive}
              rowIndex={rowIndex}
              colIndex={colIndex}
              gridSize={gridSize}
              isRecentlyToggled={isRecentlyToggled}
            />
          );
        })
      )}
    </div>
  );
}
