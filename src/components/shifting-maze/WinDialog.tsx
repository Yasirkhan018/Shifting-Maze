"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";

interface WinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function WinDialog({ isOpen, onClose, onReset }: WinDialogProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-primary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-primary font-headline flex items-center justify-center">
            <PartyPopper className="mr-2 h-8 w-8 text-accent" />
            You Solved It!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-foreground">
            Amazing! You managed to turn all tiles green in the Shifting Maze.
            <br />
            That's quite a feat, considering the rules kept changing!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <Button onClick={onReset} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Play Again
          </Button>
          <AlertDialogAction onClick={onClose} asChild>
            <Button variant="outline">Close</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
