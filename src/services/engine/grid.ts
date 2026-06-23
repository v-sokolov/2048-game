import { BOARD_SIZE, type Tile } from "./types";

export type Cell = { row: number; col: number };

/** A fresh BOARD_SIZE×BOARD_SIZE grid of nulls — every row is its own array. */
function createEmptyGrid(): (Tile | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<Tile | null>(BOARD_SIZE).fill(null),
  );
}

/**
 * Lay the tile list onto a row/col grid for spatial logic; empty cells are null.
 * A throwaway view — the Tile[] stays the source of truth, emptiness is derived.
 */
export function buildGrid(tiles: readonly Tile[]): (Tile | null)[][] {
  const grid = createEmptyGrid();

  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile;
  }

  return grid;
}

/** Cells holding no tile, in row-major order. Derived from the grid. */
export function getEmptyCells(tiles: readonly Tile[]): Cell[] {
  const grid = buildGrid(tiles);
  const cells: Cell[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!grid[row][col]) {
        cells.push({ row, col });
      }
    }
  }

  return cells;
}
