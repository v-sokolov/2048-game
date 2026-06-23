import {
  type GameState,
  type GameStatus,
  isLost,
  isWon,
} from "../services/engine";
import type { Action, ReducerState } from "./actions";

function nextStatus(prevStatus: GameStatus, board: GameState): GameStatus {
  if (prevStatus !== "playing") {
    return prevStatus;
  }

  if (isLost(board)) {
    return "lost";
  }

  if (isWon(board)) {
    return "won";
  }

  return "playing";
}

/**
 * Pure recorder of committed transitions:
 * each case returns new immutable state, never mutating the input.
 */
export function reducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case "COMMIT_MOVE": {
      const status = nextStatus(state.game.status, action.next);

      return {
        game: { ...action.next, status },
        history: [...state.history, state.game],
        best: Math.max(state.best, action.next.score),
      };
    }

    case "UNDO": {
      if (state.history.length === 0) {
        return state;
      }

      const previous = state.history[state.history.length - 1];

      return {
        game: previous,
        history: state.history.slice(0, -1),
        best: state.best,
      };
    }

    case "NEW_GAME":
      return {
        game: action.initial,
        history: [],
        best: state.best,
      };

    default:
      return state;
  }
}
