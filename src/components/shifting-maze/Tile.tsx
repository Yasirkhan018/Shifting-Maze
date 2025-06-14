
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; 

interface TileProps {
  isGreen: boolean;
  onClick: () => void;
  isInteractive: boolean;
  rowIndex: number;
  colIndex: number;
  gridSize: number;
  isRecentlyToggled?: boolean;
}

export function Tile({ isGreen, onClick, isInteractive, rowIndex, colIndex, gridSize, isRecentlyToggled }: TileProps) {
  const tileColor = isGreen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
  const disabledStyles = !isInteractive ? "opacity-50 cursor-not-allowed" : "";

  // Adjust tile size based on grid size
  let tileSizeClasses = "w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24"; // Default for 3x3
  if (gridSize === 4) {
    tileSizeClasses = "w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20"; // Slightly smaller for 4x4
  } else if (gridSize === 5) {
    tileSizeClasses = "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"; // Smaller for 5x5
  } else if (gridSize > 5) {
    tileSizeClasses = "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"; // Even smaller for larger grids
  }


  return (
    <motion.button
      key={`${rowIndex}-${colIndex}-${isGreen}-${gridSize}`} 
      aria-label={`Tile at row ${rowIndex + 1}, column ${colIndex + 1}, currently ${isGreen ? 'green' : 'red'}`}
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "rounded-md sm:rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transform active:scale-95",
        tileSizeClasses,
        tileColor,
        disabledStyles
      )}
      initial={{ scale: isRecentlyToggled ? 0.75 : 1, opacity: isRecentlyToggled ? 0.6 : 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
    >
      <span className="sr-only">{isGreen ? "Green" : "Red"}</span>
    </motion.button>
  );
}
