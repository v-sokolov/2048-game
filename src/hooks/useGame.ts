import { useCallback } from "react";
import type { RefObject } from "react";
import type { Direction, GameStatus, Tile } from "@services/engine";
import { createInitialState, move, spawn } from "@services/engine";
import { useStore } from "@store/useStore";
import { useDirectionInput } from "./input/useDirectionInput";

export interface UseGame {
  tiles: readonly Tile[];
  currentScore: number;
  bestScore: number;
  status: GameStatus;
  isEmptyHistory: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  handleMove: (dir: Direction) => void;
  handleUndo: () => void;
  handleNewGame: () => void;
}

// Composition root: store + pure engine + board input (useDirectionInput).
// Impure work (move/gate/spawn) runs here in the handler, never in the reducer.
export function useGame(): UseGame {
  const { state, dispatch } = useStore();

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

  const handleNewGame = useCallback(
    () => dispatch({ type: "NEW_GAME", initial: createInitialState() }),
    [dispatch],
  );

  const handleMove = useCallback(
    (dir: Direction) => {
      if (state.game.status !== "playing") {
        return;
      }

      const { state: moved, result } = move(state.game, dir);

      if (!result.isValid) {
        return;
      }

      const { state: next } = spawn(moved);
      dispatch({ type: "COMMIT_MOVE", next });
    },
    [state, dispatch],
  );

  const boardRef = useDirectionInput(handleMove);

  return {
    boardRef,
    handleMove,
    handleUndo,
    handleNewGame,
    tiles: state.game.tiles,
    currentScore: state.game.score,
    bestScore: state.best,
    status: state.game.status,
    isEmptyHistory: state.history.length < 1,
  };
}
