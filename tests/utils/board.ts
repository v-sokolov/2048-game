// Shared board/tile fixtures for the engine, store, and hook tests.
// One canonical factory so a change to the GameState/Tile shape — or the board
// dimension — ripples through a single file instead of every spec.

import { BOARD_SIZE, type GameState, type Tile } from "@/services/engine";

export const CELLS = BOARD_SIZE * BOARD_SIZE;

export function tileAt(id: string, row: number, col: number, value = 2): Tile {
  return { id, value, row, col };
}

export function makeState(
  tiles: Tile[],
  score = 0,
  status: GameState["status"] = "playing",
): GameState {
  return { tiles, score, status };
}

/** Build from compact [value, row, col] triples, auto-assigning `seed-N` ids. */
export function boardFrom(
  cells: Array<[number, number, number]>,
  score = 0,
): GameState {
  return makeState(
    cells.map(([value, row, col], i) => tileAt(`seed-${i}`, row, col, value)),
    score,
  );
}

/** Build from a row-major list of values (length CELLS), auto-assigning `c-N` ids. */
export function boardOf(values: number[], score = 0): GameState {
  return makeState(
    values.map((value, i) =>
      tileAt(`c${i}`, Math.floor(i / BOARD_SIZE), i % BOARD_SIZE, value),
    ),
    score,
  );
}

/** Row-major values for a full board, each cell computed from its row/col. */
function filledBy(valueAt: (row: number, col: number) => number): number[] {
  return Array.from({ length: CELLS }, (_, i) =>
    valueAt(Math.floor(i / BOARD_SIZE), i % BOARD_SIZE),
  );
}

export const emptyState = (): GameState => makeState([]);

export const fullState = (value = 2): GameState =>
  boardOf(filledBy(() => value));

/**
 * A full board with no equal neighbours: a 2/4 checkerboard keyed on (row+col)
 * parity, so every orthogonal neighbour differs and no move is possible — the
 * game is lost. Fills any N×N board.
 */
export const deadlockState = (score = 0): GameState =>
  boardOf(filledBy((row, col) => ((row + col) % 2 === 0 ? 2 : 4)), score);
