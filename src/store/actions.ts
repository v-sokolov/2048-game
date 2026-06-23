import type { GameState } from "@services/engine";

export interface ReducerState {
  readonly game: GameState;
  readonly history: readonly GameState[];
  readonly best: number;
}

export type Action =
  | { type: "NEW_GAME"; initial: GameState }
  | { type: "COMMIT_MOVE"; next: GameState }
  | { type: "UNDO" };
