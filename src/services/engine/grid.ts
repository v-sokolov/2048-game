import { BOARD_SIZE, type Tile } from "./types";

export type Cell = { row: number; col: number };

type OnCell<T> = (cell: T | undefined, row: number, col: number) => void;

/**
 * A transient, mutable N×N grid addressed by (row, col), backed by one flat
 * row-major array; an absent cell reads as `undefined`. Scratch only —
 * GameState's Tile[] is the source of truth, never a Grid.
 */
export class Grid<T> {
  private readonly cellsByIndex: (T | undefined)[];

  constructor(readonly sideLength: number) {
    this.cellsByIndex = new Array<T | undefined>(sideLength * sideLength);
  }

  isWithinBounds({ row, col }: Cell): boolean {
    const rowWithinBounds = row >= 0 && row < this.sideLength;
    const colWithinBounds = col >= 0 && col < this.sideLength;
    return rowWithinBounds && colWithinBounds;
  }

  private cellIndex({ row, col }: Cell): number {
    return row * this.sideLength + col;
  }

  /** The cell at (row, col); `undefined` when empty OR off-grid, so callers need no edge guards. */
  getCellAt(cell: Cell): T | undefined {
    if (!this.isWithinBounds(cell)) {
      return undefined;
    }

    return this.cellsByIndex[this.cellIndex(cell)];
  }

  setCellAt({ row, col, value }: Cell & { value: T | undefined }): void {
    this.cellsByIndex[this.cellIndex({ row, col })] = value;
  }

  forEachCell(onCell: OnCell<T>): void {
    for (let row = 0; row < this.sideLength; row++) {
      for (let col = 0; col < this.sideLength; col++) {
        const cell = this.cellsByIndex[this.cellIndex({ row, col })];
        onCell(cell, row, col);
      }
    }
  }
}

/** Built fresh from Entity List each call — never mutated. */
export function buildOccupiedIndices({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): Set<number> {
  const occupied = new Set<number>();

  for (const tile of tiles) {
    occupied.add(tile.row * sideLength + tile.col);
  }

  return occupied;
}

/** Materialize the tile list into a spatial grid; a throwaway view rebuilt each move. */
export function buildGridFromTiles({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): Grid<Tile> {
  const grid = new Grid<Tile>(sideLength);

  for (const tile of tiles) {
    grid.setCellAt({ row: tile.row, col: tile.col, value: tile });
  }

  return grid;
}

/** Empty cells in row-major order. O(1) per-cell membership test via Set. */
export function findEmptyCells({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): Cell[] {
  const occupied = buildOccupiedIndices({ tiles, sideLength });
  const emptyCells: Cell[] = [];

  for (let index = 0; index < sideLength * sideLength; index++) {
    if (occupied.has(index)) {
      continue;
    }

    const row = Math.floor(index / sideLength);
    const col = index % sideLength;
    emptyCells.push({ row, col });
  }

  return emptyCells;
}

/** O(1) via Set size — avoids O(N²) grid scan. */
export function isBoardFull({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): boolean {
  return (
    buildOccupiedIndices({ tiles, sideLength }).size === sideLength * sideLength
  );
}
