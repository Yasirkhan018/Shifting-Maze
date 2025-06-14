export type TileState = boolean; // true for green, false for red
export type GridState = TileState[][];

export const INITIAL_GRID_SIZE = 3;
export const INITIAL_RULES = "Clicking a tile toggles its state (green to red, red to green). This also randomly toggles one adjacent tile (up, down, left, or right). Your goal is to turn all 9 tiles green.";

export const createInitialGrid = (): GridState => 
  Array(INITIAL_GRID_SIZE).fill(null).map(() => 
    Array(INITIAL_GRID_SIZE).fill(false) // false for red
  );
