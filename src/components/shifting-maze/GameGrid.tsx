"use client";

import type { GridState } from "@/lib/types";
import { Tile } from "./Tile";

interface GameGridProps {
  grid: GridState;
  onTileClick: (row: number, col: number) => void;
  isInteractive: boolean;
  toggledTiles?: { row: number; col: number }[];
}

export function GameGrid({ grid, onTileClick, isInteractive, toggledTiles }: GameGridProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2 p-2 bg-card rounded-lg shadow-lg"
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
              isRecentlyToggled={isRecentlyToggled}
            />
          );
        })
      )}
    </div>
  );
}
