import { buildGrid } from "./grid";
import { BOARD_SIZE, type GameState, WIN_VALUE } from "./types";

/** True once any tile has reached the win threshold (2048) - O(tiles). */
export function isWon(state: GameState): boolean {
  return state.tiles.some((tile) => tile.value >= WIN_VALUE);
}

/**
 * True when no move is possible: the board is full AND no two adjacent tiles are equal.
 * A direct structural check — never trial-runs the four moves - O(board).
 */
export function isLost(state: GameState): boolean {
  if (state.tiles.length < BOARD_SIZE * BOARD_SIZE) {
    return false;
  }

  const grid = buildGrid(state.tiles);

  function valueAt(row: number, col: number) {
    return grid[row][col]?.value;
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const currentValue = valueAt(row, col);

      // Right + below visit every adjacent pair exactly once; left/up are symmetric duplicates.
      const rightValue =
        col + 1 < BOARD_SIZE ? valueAt(row, col + 1) : undefined;
      const belowValue =
        row + 1 < BOARD_SIZE ? valueAt(row + 1, col) : undefined;
      const hasEqualNeighbour =
        currentValue === rightValue || currentValue === belowValue;

      if (hasEqualNeighbour) {
        return false;
      }
    }
  }

  return true;
}
