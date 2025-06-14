
export type TileState = boolean; // true for green, false for red
export type GridState = TileState[][];

export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 4;

export const getInitialRules = (gridSize: number): string => {
  const totalTiles = gridSize * gridSize;
  return `Clicking a tile toggles its state (green to red, red to green). This also randomly toggles one adjacent tile (up, down, left, or right). Your goal is to turn all ${totalTiles} tiles green.`;
}

export const createGrid = (size: number): GridState => 
  Array(size).fill(null).map(() => 
    Array(size).fill(false) // false for red
  );
