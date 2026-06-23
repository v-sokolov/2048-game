# Contracts: 2048 Data Layer (public TypeScript surface)

Cross-layer communication is by these types/signatures only (Constitution §IX). Dependency arrows point inward: `components → hooks → store → { engine, storage }`. The engine imports nothing from the other layers.

## `services/engine` — pure, framework-agnostic

```ts
// types.ts
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Tile {
  readonly id: string;
  readonly value: number;
  readonly row: number;   // 0–3
  readonly col: number;   // 0–3
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
  readonly spawned: Tile | null;   // null until the hook fills it after spawn()
}

// move.ts — deterministic, pure (no randomness)
export function move(state: GameState, dir: Direction): { state: GameState; result: MoveResult };

// spawn.ts — the ONLY impure engine fn (owns Math.random + 90/10 split)
export function spawn(state: GameState): { state: GameState; spawned: Tile | null };

// status.ts — cheap structural checks
export function isWon(state: GameState): boolean;   // any tile.value >= 2048
export function isLost(state: GameState): boolean;  // board full AND no equal adjacent pair

// init.ts
export function createInitialState(): GameState;    // empty board + 2 spawns; status 'playing'
```

**Guarantees**: `move` never mutates `state`, never spawns, never reads `Math.random`. On an invalid move it returns the input `state` reference and `result.isValid === false`. A merge result carries a fresh `id`; `merges` lists every merge with both `sourceIds` and `resultId`.

## `services/storage` — persistence seam

```ts
export interface GameStorage {
  loadBest(): number;          // missing/corrupt → 0
  saveBest(n: number): void;   // best-effort; try/catch, never throws
  // phase 2 (designed-for, not built): loadGame(): ReducerState | null; saveGame(s): void;
}

export function createLocalStorage(): GameStorage;   // namespaced key
```

## `store` — pure state container

```ts
// actions.ts
export type Action =
  | { type: 'COMMIT_MOVE'; next: GameState }
  | { type: 'UNDO' }
  | { type: 'NEW_GAME'; initial: GameState };                     // createInitialState() passed in (keeps reducer pure)

export interface ReducerState {
  readonly game: GameState;
  readonly history: readonly GameState[];
  readonly best: number;
}

// reducer.ts — PURE; no engine calls, no Math.random, StrictMode-safe
export function reducer(state: ReducerState, action: Action): ReducerState;

// useStore.ts — owns the useReducer + persistence wiring
export function useStore(): { state: ReducerState; dispatch: React.Dispatch<Action> };
```

**Reducer contract**: `COMMIT_MOVE` pushes `game` to history, stamps `nextStatus(state, next)` onto the committed board, updates `best = max(best, next.score)`. `UNDO` pops history into `game` (no-op if empty). `NEW_GAME` resets to `initial`, clears history, keeps `best`. Won and lost are terminal: `nextStatus` keeps a non-`playing` status until `NEW_GAME`.

## `hooks` — orchestration

```ts
// useGame.ts — composition root
export interface UseGame {
  readonly tiles: readonly Tile[];
  readonly currentScore: number;
  readonly bestScore: number;
  readonly status: GameStatus;
  readonly isEmptyHistory: boolean;
  readonly move: (dir: Direction) => void;   // = handleMove
  readonly undo: () => void;
  readonly newGame: () => void;
}
export function useGame(): UseGame;           // undo/newGame are stable useCallback([dispatch]); move depends on state

// useInputDirection.ts — input-source-agnostic
export function useInputDirection(onMove: (dir: Direction) => void): void;
// phase 1: keydown (arrow keys). phase 2: touch swipe → nearest Direction.
```

**`handleMove` contract** (inside `useGame`): run `move(game, dir)`; if `!result.isValid` return (no dispatch, no re-render); else `spawn(moved)` and `dispatch({ type: 'COMMIT_MOVE', next })`. Impurity (spawn) lives here, never in the reducer.
