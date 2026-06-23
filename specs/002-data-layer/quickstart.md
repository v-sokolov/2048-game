# Quickstart: 2048 Data Layer

How the layers wire together and where tests enter. This layer has no UI of its own; it powers the existing components from feature 001.

## Wiring (dependency arrows point inward)

```text
App
 └─ useGame()                         ← composition root (src/hooks)
      ├─ useStore()                   ← { state, dispatch }  (src/store)
      │    ├─ useReducer(reducer, …)  ← PURE recorder        (src/store)
      │    └─ GameStorage             ← lazy loadBest + save effect (src/services/storage)
      ├─ engine: move / spawn / isWon / isLost / createInitialState (src/services/engine)
      └─ useInputDirection(move)      ← keyboard now, touch later (src/hooks)

App prop-drills { tiles, currentScore, bestScore, status } + { move, undo, newGame }
   → GridArea (real Tile[]), Score, GameOverlay
```

## One move, end to end

1. Player presses ←. `useInputDirection` maps it to `'left'` and calls `move('left')` (the hook's `handleMove`).
2. `handleMove` runs `engine.move(current, 'left')` → `{ state: moved, result }`.
3. If `result.isValid === false` → return immediately (no dispatch, no re-render, no history).
4. Else `engine.spawn(moved)` → `{ state: next, spawned }`.
5. `dispatch({ type: 'COMMIT_MOVE', next })`.
6. Reducer pushes the prior board to `history`, derives `status` via `nextStatus`, updates `best`.
7. `useStore`'s effect persists `best`. Components re-render once; CSS transforms animate slides.

## Running tests (TDD-first, Constitution §II)

Tests live under `tests/` (mirroring `src/`) and import source via the `@/` alias.

```bash
npx vitest run                   # whole suite
npx vitest run tests/services    # engine + storage
npx vitest run tests/store       # pure reducer
npx vitest run tests/hooks       # renderHook
```

**Test entry points by layer** (all under `tests/`, mirroring `src/`):
- **engine** (`tests/services/engine/*.test.ts`) — the bulk. Slide, directional merge, one-merge-per-tile lock, validity, score, all 4 directions; `spawn` value/cell distribution via `vi.spyOn(Math,'random')`; `isWon`/`isLost`; `createInitialState`. The logic-design doc's **two worked examples** are golden end-to-end tests.
- **storage** (`tests/services/storage/storage.test.ts`) — load default 0, round-trip save/load, corrupt value → 0, write failure swallowed.
- **store** (`tests/store/reducer.test.ts`) — pure reducer: `COMMIT_MOVE` (history push, best, status), `UNDO` (incl. empty no-op), `NEW_GAME` (keeps best).
- **hooks** (`tests/hooks/*.test.ts`) — `renderHook`: callback stability, validity gate (invalid move = no state change), persistence effect, undo flow; `useInputDirection` key→Direction mapping.

## Definition of done (this feature)

- All FRs covered by passing tests; engine has zero UI imports (SC-007).
- `App` plays a full game through `useGame` (P1), resolves win/continue/lose (P2), supports undo/new-game/persisted best (P3).
- React DevTools Profiler: one render per interaction (Constitution §VII).
- Dependency whitelist untouched; `vite.config.ts` base unchanged.
