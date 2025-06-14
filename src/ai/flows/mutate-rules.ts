'use server';

/**
 * @fileOverview AI flow for mutating the rules of the Shifting Maze game.
 *
 * - mutateRules - A function that mutates the game rules.
 * - MutateRulesInput - The input type for the mutateRules function.
 * - MutateRulesOutput - The return type for the mutateRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MutateRulesInputSchema = z.object({
  currentRules: z
    .string()
    .describe('The current rules of the game as a string.'),
  moveNumber: z.number().describe('The current move number.'),
});
export type MutateRulesInput = z.infer<typeof MutateRulesInputSchema>;

const MutateRulesOutputSchema = z.object({
  newRules: z
    .string()
    .describe('The new, mutated rules of the game as a string.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the rule mutation.'),
});
export type MutateRulesOutput = z.infer<typeof MutateRulesOutputSchema>;

export async function mutateRules(input: MutateRulesInput): Promise<MutateRulesOutput> {
  return mutateRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mutateRulesPrompt',
  input: {schema: MutateRulesInputSchema},
  output: {schema: MutateRulesOutputSchema},
  prompt: `You are an AI game designer responsible for creating engaging and evolving game rules for a puzzle game called Shifting Maze.

The game involves a 3x3 grid of tiles. Clicking a tile toggles its state (green <-> red) and randomly toggles one adjacent tile. The game is designed to be unsolvable by mutating the rules after every move.

You are given the current game rules and the current move number. Your task is to generate new, mutated rules for the game.

Here are the current rules:
{{{currentRules}}}

Move Number: {{{moveNumber}}}

Consider the move number to make more drastic changes over time. Explain your reasoning for the changes.

Output the new rules as a string, and your reasoning behind the changes.
`,
});

const mutateRulesFlow = ai.defineFlow(
  {
    name: 'mutateRulesFlow',
    inputSchema: MutateRulesInputSchema,
    outputSchema: MutateRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
