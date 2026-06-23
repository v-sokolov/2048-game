import { buildGridFromTiles, isBoardFull } from "./grid";
import { BOARD_SIZE, type GameState, WIN_VALUE } from "./types";

/** True once any tile has reached the win threshold (2048) - O(tiles). */
export function isWon(state: GameState): boolean {
  return state.tiles.some((tile) => tile.value >= WIN_VALUE);
}

/** True when no move is possible: board full AND no adjacent equal tiles. */
export function isLost(state: GameState): boolean {
  if (!isBoardFull({ tiles: state.tiles })) {
    return false;
  }

  const grid = buildGridFromTiles({ tiles: state.tiles });

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = grid.getCellAt({ row, col })?.value;

      // Right + below cover every adjacent pair once (left/up mirror them).
      const rightValue = grid.getCellAt({ row, col: col + 1 })?.value;
      const belowValue = grid.getCellAt({ row: row + 1, col })?.value;
      const hasEqualNeighbour = value === rightValue || value === belowValue;

      if (hasEqualNeighbour) {
        return false;
      }
    }
  }

  return true;
}
