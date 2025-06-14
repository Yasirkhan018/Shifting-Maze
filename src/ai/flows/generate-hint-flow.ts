
'use server';
/**
 * @fileOverview AI flow for generating hints for the Shifting Maze game.
 *
 * - generateHint - A function that generates a hint for the player.
 * - GenerateHintInput - The input type for the generateHint function.
 * - GenerateHintOutput - The return type for the generateHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHintInputSchema = z.object({
  gridStateString: z
    .string()
    .describe(
      'The current state of the game grid as a string, where 1 represents a green tile and 0 represents a red tile. Rows are separated by newlines (e.g., "101\\n010\\n110").'
    ),
  currentRules: z
    .string()
    .describe('The current rules of the game as a string.'),
  moveCount: z.number().describe('The current move number.'),
  gridSize: z.number().int().min(3).describe('The dimension of the square grid (e.g., 3 for 3x3).'),
});
export type GenerateHintInput = z.infer<typeof GenerateHintInputSchema>;

const GenerateHintOutputSchema = z.object({
  hintText: z
    .string()
    .describe('A helpful, non-obvious hint for the player.'),
});
export type GenerateHintOutput = z.infer<typeof GenerateHintOutputSchema>;

export async function generateHint(input: GenerateHintInput): Promise<GenerateHintOutput> {
  return generateHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHintPrompt',
  input: {schema: GenerateHintInputSchema},
  output: {schema: GenerateHintOutputSchema},
  prompt: `You are a helpful AI assistant for a puzzle game called Shifting Maze.
The game involves a {{{gridSize}}}x{{{gridSize}}} grid of tiles. Clicking a tile toggles its state (green <-> red) and randomly toggles one adjacent tile. The rules of the game can change after every move. The goal is to turn all tiles green.

The player has requested a hint. Here is the current game state:
Grid (1s are green, 0s are red, rows are top to bottom):
{{{gridStateString}}}

Current Rules:
{{{currentRules}}}

Move Number: {{{moveCount}}}

Your task is to provide a concise, helpful hint (1-2 sentences).
- Do NOT give an exact "click row X, col Y" solution.
- Instead, suggest a general strategy, a tile or area to focus on, or an observation about the current grid in relation to the current rules.
- Encourage strategic thinking.
- If the grid is very close to being solved, your hint can be a bit more direct but still avoid exact coordinates.
- If the grid is far from solved, or if the move count is low (e.g., less than 10 on a 3x3), offer a broader strategic tip or a simple observation.
- Remember that the rules can change on the next player move, so make your hint relevant to the *current* rules and state.
- Example hints: "Consider how the current rules might affect tiles in the corners." or "Look for a move that could flip multiple red tiles to green based on the adjacent flip mechanic." or "Sometimes focusing on a stubborn red tile can reveal new opportunities."

Generate a hint for the player.
`,
});

const generateHintFlow = ai.defineFlow(
  {
    name: 'generateHintFlow',
    inputSchema: GenerateHintInputSchema,
    outputSchema: GenerateHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to return an output for generating a hint.');
    }
    return output;
  }
);
