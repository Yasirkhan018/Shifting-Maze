"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface RulesDisplayProps {
  rules: string;
  reasoning?: string;
  isLoadingMutation: boolean;
}

export function RulesDisplay({ rules, reasoning, isLoadingMutation }: RulesDisplayProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-primary font-headline">
          {isLoadingMutation && <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />}
          Current Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-foreground whitespace-pre-line">{rules}</p>
        <AnimatePresence>
          {reasoning && (
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
                  {reasoning}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
