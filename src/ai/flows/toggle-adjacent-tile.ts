'use server';

/**
 * @fileOverview A flow to randomly toggle an adjacent tile in a 3x3 grid.
 *
 * - toggleAdjacentTile - A function that handles the logic to toggle an adjacent tile.
 * - ToggleAdjacentTileInput - The input type for the toggleAdjacentTile function.
 * - ToggleAdjacentTileOutput - The return type for the toggleAdjacentTile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ToggleAdjacentTileInputSchema = z.object({
  row: z.number().int().min(0).max(2).describe('The row index of the clicked tile (0-2).'),
  col: z.number().int().min(0).max(2).describe('The column index of the clicked tile (0-2).'),
});
export type ToggleAdjacentTileInput = z.infer<typeof ToggleAdjacentTileInputSchema>;

const ToggleAdjacentTileOutputSchema = z.object({
  adjacentRow: z.number().int().min(0).max(2).describe('The row index of the adjacent tile that was toggled (0-2).'),
  adjacentCol: z.number().int().min(0).max(2).describe('The column index of the adjacent tile that was toggled (0-2).'),
});
export type ToggleAdjacentTileOutput = z.infer<typeof ToggleAdjacentTileOutputSchema>;

export async function toggleAdjacentTile(input: ToggleAdjacentTileInput): Promise<ToggleAdjacentTileOutput> {
  return toggleAdjacentTileFlow(input);
}

const pickAdjacentTileTool = ai.defineTool({
  name: 'pickAdjacentTile',
  description: 'Given a tile in a 3x3 grid, picks a valid adjacent tile to it at random.',
  inputSchema: z.object({
    row: z.number().int().min(0).max(2).describe('The row index of the tile (0-2).'),
    col: z.number().int().min(0).max(2).describe('The column index of the tile (0-2).'),
  }),
  outputSchema: z.object({
    adjacentRow: z.number().int().min(0).max(2).describe('The row index of the adjacent tile (0-2).'),
    adjacentCol: z.number().int().min(0).max(2).describe('The column index of the adjacent tile (0-2).'),
  }),
},
async (input) => {
  const {row, col} = input;
  const possibleAdjacentTiles: {adjacentRow: number, adjacentCol: number}[] = [];

  if (row > 0) {
    possibleAdjacentTiles.push({adjacentRow: row - 1, adjacentCol: col});
  }
  if (row < 2) {
    possibleAdjacentTiles.push({adjacentRow: row + 1, adjacentCol: col});
  }
  if (col > 0) {
    possibleAdjacentTiles.push({adjacentRow: row, adjacentCol: col - 1});
  }
  if (col < 2) {
    possibleAdjacentTiles.push({adjacentRow: row, adjacentCol: col + 1});
  }

  const randomIndex = Math.floor(Math.random() * possibleAdjacentTiles.length);
  return possibleAdjacentTiles[randomIndex];
});

const toggleAdjacentTilePrompt = ai.definePrompt({
  name: 'toggleAdjacentTilePrompt',
  tools: [pickAdjacentTileTool],
  input: {schema: ToggleAdjacentTileInputSchema},
  output: {schema: ToggleAdjacentTileOutputSchema},
  prompt: `You are part of a puzzle game called Shifting Maze. The user has clicked on tile ({{{row}}}, {{{col}}}). Randomly pick one adjacent tile to toggle using the pickAdjacentTile tool. Return the row and column of the toggled tile. Focus on picking a valid adjacent tile and returning its coordinates.  Return ONLY the coordinates of the adjacent tile that was picked and toggled. Do not return any other information.`,
});

const toggleAdjacentTileFlow = ai.defineFlow(
  {
    name: 'toggleAdjacentTileFlow',
    inputSchema: ToggleAdjacentTileInputSchema,
    outputSchema: ToggleAdjacentTileOutputSchema,
  },
  async input => {
    const {output} = await toggleAdjacentTilePrompt(input);
    return output!;
  }
);
