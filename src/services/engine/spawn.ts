import { newId } from "./id";
import { Cell, findEmptyCells } from "./grid";
import type { GameState, Tile } from "./types";

export const PROBABILITY_OF_FOUR = 0.1;

function pickRandom<T>(items: readonly T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

/**
 * The single impure engine function:
 * places one new tile in a uniformly chosen empty cell (value 2 at ~90%, 4 at ~10%).
 * Returns new immutable state plus the spawned tile,
 * or { state, spawned: null } when the board is full.
 */
export function spawn(state: GameState): {
  state: GameState;
  spawned: Tile | null;
} {
  const emptyCells = findEmptyCells({ tiles: state.tiles });
  const isFullBoard = emptyCells.length === 0;

  if (isFullBoard) {
    return { state, spawned: null };
  }

  const value = Math.random() < PROBABILITY_OF_FOUR ? 4 : 2;
  const targetCell = pickRandom<Cell>(emptyCells);
  const spawned: Tile = { id: newId(), value, ...targetCell };

  return {
    state: { ...state, tiles: [...state.tiles, spawned] },
    spawned,
  };
}
