"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";

interface GameControlsProps {
  moveCount: number;
  onReset: () => void;
  isInteractive: boolean;
  isLoading: boolean;
}

export function GameControls({ moveCount, onReset, isInteractive, isLoading }: GameControlsProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-primary font-headline">Game Info</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Moves</p>
          <p className="text-3xl font-bold text-primary">{moveCount}</p>
        </div>
        <Button
          onClick={onReset}
          disabled={!isInteractive || isLoading}
          variant="outline"
          className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          aria-label="Reset Game"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
          Reset Game
        </Button>
      </CardContent>
    </Card>
  );
}
