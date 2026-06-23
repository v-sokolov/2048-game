import { spawn } from "./spawn";
import type { GameState } from "./types";

const INITIAL_TILE_COUNT = 2;

export function createInitialState(): GameState {
  let state: GameState = { tiles: [], score: 0, status: "playing" };

  for (let i = 0; i < INITIAL_TILE_COUNT; i++) {
    state = spawn(state).state;
  }

  return state;
}
