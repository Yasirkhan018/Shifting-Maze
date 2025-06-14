
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
  gridSize: z.number().int().min(3).describe('The dimension of the square grid (e.g., 3 for 3x3, 4 for 4x4).'),
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

The game involves a {{{gridSize}}}x{{{gridSize}}} grid of tiles. Clicking a tile toggles its state (green <-> red) and randomly toggles one adjacent tile. The game is designed to be unsolvable by mutating the rules after every move.

You are given the current game rules, the current move number, and the grid size. Your task is to generate new, mutated rules for the game.

Here are the current rules:
{{{currentRules}}}

Move Number: {{{moveNumber}}}
Grid Size: {{{gridSize}}}x{{{gridSize}}}

**Difficulty Scaling Guidance:**
- **Initial Level (Smallest Grid, e.g., 3x3):** If the current \`gridSize\` is small (e.g., 3) AND the \`moveNumber\` is very low (e.g., less than 3), the rule changes should be VERY SUBTLE and straightforward. The goal is to ease the player into the game. Focus on minimal tweaks that don't drastically alter the core "click tile, one adjacent flips" mechanic. For example, a minor change to scoring (if there was any), a slight visual feedback alteration, or a simple condition that's easy to understand.
- **Progressive Complexity:** As the \`gridSize\` increases (player progresses to higher levels, e.g., 4x4, 5x5), OR as the \`moveNumber\` increases on any given level, the rule mutations should become SIGNIFICANTLY MORE COMPLEX, CHAOTIC, and introduce more UNPREDICTABLE elements.
- **For larger grids, be creative! Examples of more complex/random mutations:**
    - Tiles might change color based on a new pattern (e.g., their row/column number, number of green neighbors).
    - Clicking a tile might affect tiles in a diagonal pattern, or skip a tile, or affect a 2-tile radius.
    - Introduce a small, clearly stated chance that a *second* random adjacent tile is affected, or even a distant tile under specific conditions.
    - The win condition itself could be subtly altered (e.g., "all but one corner tile must be green," or "create a specific pattern of green tiles").
- The rules must always be described in a way that is understandable to the player, even if the effects are wild and hard to predict.
- Ensure the game remains "unsolvable" in the long run due to these constant, escalating mutations.
- Always ensure new rules are appropriate for the current {{{gridSize}}}x{{{gridSize}}} grid.

Output the new rules as a string, and your reasoning behind the changes, explicitly considering this difficulty scaling.
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
    if (!output) {
      throw new Error('AI failed to return an output for mutating rules.');
    }
    return output;
  }
);

