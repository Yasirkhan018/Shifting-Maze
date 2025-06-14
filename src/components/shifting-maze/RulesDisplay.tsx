
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RulesDisplayProps {
  rules: string;
}

export function RulesDisplay({ rules }: RulesDisplayProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-primary font-headline">
          Current Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-center text-foreground whitespace-pre-line">{rules}</p>
      </CardContent>
    </Card>
  );
}
