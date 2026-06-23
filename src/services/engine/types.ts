export const BOARD_SIZE = 4;
export const WIN_VALUE = 2048;

export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "playing" | "won" | "lost";

export interface Tile {
  readonly id: string;
  readonly value: number;
  readonly row: number;
  readonly col: number;
}

export interface GameState {
  readonly tiles: readonly Tile[];
  readonly score: number;
  readonly status: GameStatus;
}

export interface MergeEvent {
  readonly resultId: string;
  readonly sourceIds: readonly [string, string];
  readonly value: number;
  readonly row: number;
  readonly col: number;
}

export interface MoveResult {
  readonly isValid: boolean;
  readonly direction: Direction;
  readonly scoreGained: number;
  readonly merges: readonly MergeEvent[];
  readonly spawned: Tile | null;
}
