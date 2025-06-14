"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // For animations

interface TileProps {
  isGreen: boolean;
  onClick: () => void;
  isInteractive: boolean;
  rowIndex: number;
  colIndex: number;
  isRecentlyToggled?: boolean;
}

export function Tile({ isGreen, onClick, isInteractive, rowIndex, colIndex, isRecentlyToggled }: TileProps) {
  const tileColor = isGreen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";
  const disabledStyles = !isInteractive ? "opacity-50 cursor-not-allowed" : "";

  return (
    <motion.button
      key={`${rowIndex}-${colIndex}-${isGreen}`} // Add key to force re-render for animation
      aria-label={`Tile at row ${rowIndex + 1}, column ${colIndex + 1}, currently ${isGreen ? 'green' : 'red'}`}
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ease-in-out transform active:scale-95",
        tileColor,
        disabledStyles
      )}
      initial={{ scale: isRecentlyToggled ? 0.8 : 1, opacity: isRecentlyToggled ? 0.5 : 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.3 }}
    >
      <span className="sr-only">{isGreen ? "Green" : "Red"}</span>
    </motion.button>
  );
}
