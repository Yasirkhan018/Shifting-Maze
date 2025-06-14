
'use server';

/**
 * @fileOverview A flow to randomly toggle an adjacent tile in a NxN grid.
 *
 * - toggleAdjacentTile - A function that handles the logic to toggle an adjacent tile.
 * - ToggleAdjacentTileInput - The input type for the toggleAdjacentTile function.
 * - ToggleAdjacentTileOutput - The return type for the toggleAdjacentTile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ToggleAdjacentTileInputSchema = z.object({
  row: z.number().int().min(0).describe('The row index of the clicked tile (0-indexed).'),
  col: z.number().int().min(0).describe('The column index of the clicked tile (0-indexed).'),
  gridSize: z.number().int().min(3).describe('The dimension of the square grid (e.g., 3 for 3x3, 4 for 4x4).'),
});
export type ToggleAdjacentTileInput = z.infer<typeof ToggleAdjacentTileInputSchema>;

const ToggleAdjacentTileOutputSchema = z.object({
  adjacentRow: z.number().int().min(0).describe('The row index of the adjacent tile that was toggled (0-indexed).'),
  adjacentCol: z.number().int().min(0).describe('The column index of the adjacent tile that was toggled (0-indexed).'),
});
export type ToggleAdjacentTileOutput = z.infer<typeof ToggleAdjacentTileOutputSchema>;

export async function toggleAdjacentTile(input: ToggleAdjacentTileInput): Promise<ToggleAdjacentTileOutput> {
  if (input.row >= input.gridSize || input.col >= input.gridSize) {
    throw new Error(`Invalid row (${input.row}) or col (${input.col}) for gridSize (${input.gridSize}).`);
  }
  return toggleAdjacentTileFlow(input);
}

const pickAdjacentTileTool = ai.defineTool({
  name: 'pickAdjacentTile',
  description: 'Given a tile in a NxN grid and the gridSize N, picks a valid adjacent tile to it at random.',
  inputSchema: z.object({
    row: z.number().int().min(0).describe('The row index of the tile (0-indexed).'),
    col: z.number().int().min(0).describe('The column index of the tile (0-indexed).'),
    gridSize: z.number().int().min(3).describe('The dimension of the square grid (N).'),
  }),
  outputSchema: z.object({
    adjacentRow: z.number().int().min(0).describe('The row index of the adjacent tile (0-indexed).'),
    adjacentCol: z.number().int().min(0).describe('The column index of the adjacent tile (0-indexed).'),
  }),
},
async (input) => {
  const {row, col, gridSize} = input;

  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    // This should ideally be caught by the flow's input validation or earlier.
    // Throwing an error here ensures the tool itself is robust.
    throw new Error(`Tool received invalid row/col for gridSize. Row: ${row}, Col: ${col}, GridSize: ${gridSize}`);
  }
  
  const possibleAdjacentTiles: {adjacentRow: number, adjacentCol: number}[] = [];

  // Up
  if (row > 0) {
    possibleAdjacentTiles.push({adjacentRow: row - 1, adjacentCol: col});
  }
  // Down
  if (row < gridSize - 1) {
    possibleAdjacentTiles.push({adjacentRow: row + 1, adjacentCol: col});
  }
  // Left
  if (col > 0) {
    possibleAdjacentTiles.push({adjacentRow: row, adjacentCol: col - 1});
  }
  // Right
  if (col < gridSize - 1) {
    possibleAdjacentTiles.push({adjacentRow: row, adjacentCol: col + 1});
  }

  if (possibleAdjacentTiles.length === 0) {
    // Should not happen in a grid of size >= 2x2, but good to handle.
    // For a 1x1 grid (which we don't support based on min(3)), this would be an issue.
    // For a single cell in a larger grid, this path won't be taken.
    throw new Error(`No adjacent tiles found for row: ${row}, col: ${col} in a ${gridSize}x${gridSize} grid. This is unexpected.`);
  }

  const randomIndex = Math.floor(Math.random() * possibleAdjacentTiles.length);
  return possibleAdjacentTiles[randomIndex];
});

const toggleAdjacentTilePrompt = ai.definePrompt({
  name: 'toggleAdjacentTilePrompt',
  tools: [pickAdjacentTileTool],
  input: {schema: ToggleAdjacentTileInputSchema},
  output: {schema: ToggleAdjacentTileOutputSchema},
  prompt: `You are part of a puzzle game called Shifting Maze. The game grid is {{{gridSize}}}x{{{gridSize}}}. The user has clicked on tile ({{{row}}}, {{{col}}}). Randomly pick one adjacent tile to toggle using the pickAdjacentTile tool. Return the row and column of the toggled tile. Focus on picking a valid adjacent tile and returning its coordinates. Return ONLY the coordinates of the adjacent tile that was picked and toggled. Do not return any other information.`,
});

const toggleAdjacentTileFlow = ai.defineFlow(
  {
    name: 'toggleAdjacentTileFlow',
    inputSchema: ToggleAdjacentTileInputSchema,
    outputSchema: ToggleAdjacentTileOutputSchema,
  },
  async input => {
    const {output} = await toggleAdjacentTilePrompt(input);
    if (!output) {
      throw new Error('AI failed to return an output for toggling adjacent tile.');
    }
    if (output.adjacentRow === undefined || output.adjacentCol === undefined) {
      throw new Error('AI output is missing adjacentRow or adjacentCol.');
    }
     if (output.adjacentRow < 0 || output.adjacentRow >= input.gridSize || output.adjacentCol < 0 || output.adjacentCol >= input.gridSize) {
      console.error("AI returned out-of-bounds tile, attempting fallback (though ideally tool prevents this):", output);
      // Fallback or error. For now, let's throw. Tool should prevent this.
      throw new Error(`AI returned out-of-bounds adjacent tile: (${output.adjacentRow}, ${output.adjacentCol}) for gridSize ${input.gridSize}`);
    }
    return output;
  }
);

