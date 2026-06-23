import { type Dispatch, useEffect, useReducer } from "react";
import { createInitialState } from "@services/engine";
import { createLocalStorage } from "@services/storage/storage";
import type { Action, ReducerState } from "./actions";
import { reducer } from "./reducer";

const storage = createLocalStorage();

const initStore = (): ReducerState => ({
  game: createInitialState(),
  history: [],
  best: storage.loadBest(),
});

export function useStore(): {
  state: ReducerState;
  dispatch: Dispatch<Action>;
} {
  const [state, dispatch] = useReducer(reducer, undefined, initStore);

  useEffect(() => {
    storage.saveBest(state.best);
  }, [state.best]);

  return { state, dispatch };
}
