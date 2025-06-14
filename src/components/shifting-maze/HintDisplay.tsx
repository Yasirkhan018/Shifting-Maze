
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface HintDisplayProps {
  hint?: string;
  isLoading: boolean;
}

export function HintDisplay({ hint, isLoading }: HintDisplayProps) {
  if (!hint && !isLoading) {
    return null;
  }

  return (
    <Card className="w-full max-w-md shadow-lg bg-secondary border-primary/30">
      <CardHeader>
        <CardTitle className="text-center text-primary font-headline">
          {isLoading && <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />}
          Hint
        </CardTitle>
      </CardHeader>
      <AnimatePresence>
        {(hint || isLoading) && (
          <motion.div
            key={isLoading ? "loading" : "hint"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-sm text-secondary-foreground">Generating hint...</p>
                </div>
              )}
              {hint && !isLoading && (
                <Alert className="bg-card border-primary/50">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">💡 Wise Words:</AlertTitle>
                  <AlertDescription className="text-card-foreground whitespace-pre-line">
                    {hint}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
