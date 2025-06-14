
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

// This tool contains the direct logic to pick an adjacent tile.
const pickAdjacentTileTool = ai.defineTool({
  name: 'pickAdjacentTile',
  description: 'Given a tile in a NxN grid and the gridSize N, picks a valid adjacent tile to it at random.',
  inputSchema: ToggleAdjacentTileInputSchema, // Re-using the flow's input schema
  outputSchema: ToggleAdjacentTileOutputSchema, // Re-using the flow's output schema
},
async (input) => {
  const {row, col, gridSize} = input;

  // Input validation is already done in the exported `toggleAdjacentTile` function
  // and by the flow's inputSchema, but re-checking here makes the tool robust if used elsewhere.
  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
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
    // This case should not be reachable in a grid of size >= 2x2
    // For a 1x1 grid (which isn't supported by min(3) gridSize), this would be an issue.
    throw new Error(`No adjacent tiles found for row: ${row}, col: ${col} in a ${gridSize}x${gridSize} grid. This is unexpected.`);
  }

  const randomIndex = Math.floor(Math.random() * possibleAdjacentTiles.length);
  return possibleAdjacentTiles[randomIndex];
});

// The AI prompt is no longer needed for this flow.
// const toggleAdjacentTilePrompt = ai.definePrompt({ ... });

const toggleAdjacentTileFlow = ai.defineFlow(
  {
    name: 'toggleAdjacentTileFlow',
    inputSchema: ToggleAdjacentTileInputSchema,
    outputSchema: ToggleAdjacentTileOutputSchema,
  },
  async (input: ToggleAdjacentTileInput): Promise<ToggleAdjacentTileOutput> => {
    // Directly use the logic from pickAdjacentTileTool by invoking the tool.
    // The 'pickAdjacentTileTool' is a callable Genkit tool.
    const output = await pickAdjacentTileTool(input);

    if (!output) {
      // This should ideally not happen if the tool logic is sound and always returns a value.
      throw new Error('pickAdjacentTileTool failed to return an output.');
    }
    
    // Validate output structure (though Zod schema validation within the tool should cover this)
    if (output.adjacentRow === undefined || output.adjacentCol === undefined) {
      throw new Error('Tool output is missing adjacentRow or adjacentCol.');
    }

    // Validate output bounds (also should be covered by tool logic but good for safety)
    if (output.adjacentRow < 0 || output.adjacentRow >= input.gridSize || output.adjacentCol < 0 || output.adjacentCol >= input.gridSize) {
      console.error("Tool returned out-of-bounds tile:", output);
      throw new Error(`Tool returned out-of-bounds adjacent tile: (${output.adjacentRow}, ${output.adjacentCol}) for gridSize ${input.gridSize}`);
    }
    
    return output;
  }
);

