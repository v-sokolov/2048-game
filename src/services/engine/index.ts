export type {
  Direction,
  GameState,
  GameStatus,
  MergeEvent,
  MoveResult,
  Tile,
} from "./types";
export { BOARD_SIZE, WIN_VALUE } from "./types";
export { move } from "./move";
export { spawn } from "./spawn";
export { isLost, isWon } from "./status";
export { createInitialState } from "./init";
