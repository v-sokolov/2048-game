---
description: "Task list for 2048 Data Layer implementation"
---

# Tasks: 2048 Data Layer

**Input**: Design documents from `/specs/002-data-layer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/data-layer.md, quickstart.md

**Tests**: TDD-first is **mandatory** (Constitution §II) — every logic task is preceded by its failing test. No CSS/visual tests (Constitution §VI). No new dependencies (whitelist clean — engine/store have zero runtime deps).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no incomplete dependencies)
- **[Story]**: US1 / US2 / US3 (setup, foundational, polish have no story label)
- Red→Green→Refactor: write the test (it fails), implement minimally (it passes), then refactor.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the layer directories and shared identity helper.

- [x] T001 Create layer directory structure: `src/services/engine/`, `src/services/storage/`, `src/store/`, `src/hooks/` (empty, ready for files per plan.md)
- [x] T002 [P] Add a stable id generator `newId()` in `src/services/engine/id.ts` (`crypto.randomUUID()`; no deps) + `tests/services/engine/id.test.ts` asserting uniqueness across calls

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types every story depends on. No story can start until these exist. ⚠️ MUST complete first.

- [x] T003 Define engine types in `src/services/engine/types.ts`: `Direction`, `GameStatus`, `Tile`, `GameState`, `MergeEvent`, `MoveResult` (all `readonly`, per contracts/data-layer.md)
- [x] T004 [P] Consume the engine `Tile` directly in UI via a local import alias (`Tile as TileData` in `GridArea.tsx`) — engine `types.ts` is the single source of truth; no separate `src/types` module
- [x] T005 Create engine barrel `src/services/engine/index.ts` (re-exports public surface; updated as functions land)

**Checkpoint**: Types compile; downstream stories can import contracts.

---

## Phase 3: User Story 1 — Play a move (slide, merge, score, spawn) (Priority: P1) 🎯 MVP

**Goal**: A player presses a direction; tiles slide, equal neighbours merge once, score increases, one new tile spawns. Endless game (no win/lose yet).

**Independent test**: From a known board, issue each of the 4 directions and assert resulting tile positions, score delta, and a single spawned tile (US1 acceptance scenarios 1–6).

### Engine — move pipeline (TDD)

- [x] T006 [P] [US1] Tests for `collapseLine` in `tests/services/engine/move.test.ts`: compaction, single merge `[2,2]→[4]`, one-merge-per-tile `[2,2,2]→[4,2]`, double-pair `[4,4,4,4]→[8,8]`, emitted `MergeEvent`s + `gained`
- [x] T007 [US1] Implement private `collapseLine` (toward index 0; `i++` lock; new id per merge) in `src/services/engine/move.ts` to pass T006
- [x] T008 [P] [US1] Tests for `move(state, dir)` in `tests/services/engine/move.test.ts`: all 4 directions via orient (transpose/reverse), id preserved on slide / new id on merge, `scoreGained`, `isValid` true on change, **invalid move returns same state ref + `isValid:false`**, the two golden worked-examples from the logic-design doc
- [x] T009 [US1] Implement `move` pipeline (build grid → orient via a `cellFor(dir, l, p)` index-mapping → `collapseLine` per line → flatten → validity) in `src/services/engine/move.ts` to pass T008

### Engine — spawn & initial state (TDD)

- [x] T010 [P] [US1] Tests for `spawn(state)` in `tests/services/engine/spawn.test.ts`: stub `vi.spyOn(Math,'random')` → 90% value-2 / 10% value-4, uniform empty-cell choice, full board → `{ state, spawned: null }`, returns fresh-id tile, input not mutated
- [x] T011 [US1] Implement `spawn` (owns `Math.random`, `PROBABILITY_OF_FOUR=0.1`; empty cells via `getEmptyCells` from `src/services/engine/grid.ts`) in `src/services/engine/spawn.ts` to pass T010
- [x] T012 [P] [US1] Tests for `createInitialState()` in `tests/services/engine/init.test.ts`: exactly 2 tiles, status `'playing'`, score 0, values from {2,4}
- [x] T013 [US1] Implement `createInitialState` (empty board + 2 `spawn` calls) in `src/services/engine/init.ts` to pass T012; update engine barrel (T005)

### Store — pure reducer (TDD), US1 scope: COMMIT_MOVE only

> **Incremental status (intentional, Constitution §III)**: US1's reducer commits `status` as a straight pass-through (`'playing'`); real win/lose derivation (`nextStatus`) is layered in by US2/T027. This keeps US1 a self-contained playable increment — not a defect.

- [x] T014 [US1] Define `Action` union + `ReducerState` in `src/store/actions.ts` (per contracts/data-layer.md)
- [x] T015 [P] [US1] Tests for `reducer` `COMMIT_MOVE` in `tests/store/reducer.test.ts`: history push (structural sharing), `best = max(best, score)`, inputs not mutated, status passes through as `'playing'` (win/lose added in US2)
- [x] T016 [US1] Implement `reducer` skeleton + `COMMIT_MOVE` case in `src/store/reducer.ts` (pure; no engine calls, no `Math.random`) to pass T015

### Hooks — orchestration (TDD)

- [x] T017 [US1] Implement `useStore()` in `src/store/useStore.ts`: `useReducer(reducer, …)` initialized via `createInitialState()` (storage wiring deferred to US3) → `{ state, dispatch }`
- [x] T018 [P] [US1] Tests for `useGame` in `tests/hooks/useGame.test.ts` (`renderHook`): valid move updates tiles/score + adds one spawned tile; **invalid move → no state change, no dispatch**; action callbacks are referentially stable across renders
- [x] T019 [US1] Implement `useGame` in `src/hooks/useGame.ts`: `handleMove` (run `move` → validity gate → `spawn` → dispatch `COMMIT_MOVE`), `useCallback`; returns `{ tiles, currentScore, status, move }` (undo/newGame added later)
- [x] T020 [P] [US1] Tests for `useInputDirection` in `tests/hooks/useInputDirection.test.ts`: arrow keys `keydown` → correct `Direction` → `onMove` called; non-direction keys ignored; listener cleaned up on unmount
- [x] T021 [US1] Implement `useInputDirection(onMove)` (keydown mapping; `useEffect` add/remove listener) in `src/hooks/useInputDirection.ts`

### UI wiring (rendering glue — TDD-exempt per Constitution §II, verified via existing component tests)

- [x] T022 [US1] Wire `useGame` into `src/components/App/App.tsx`: replace mock tiles with real `tiles`, prop-drill `score` + `move`; `GridArea` renders real `Tile[]`, `Score` shows live score
- [x] T023 [US1] Add per-tile slide animation hook-up in `GridArea`/`Tile` (CSS transform driven by `row/col`; stable `id` key) — verify no logic added to components

**Checkpoint**: A playable, endless 2048 — slide/merge/score/spawn work in all directions via keyboard. MVP demonstrable.

---

## Phase 4: User Story 2 — Win and lose (Priority: P2)

**Goal**: Reaching 2048 shows a win (terminal — only New Game continues); a deadlocked full board shows game over.

**Independent test**: Drive to a 2048 tile → won state; subsequent moves keep "won" (terminal); full board with no equal neighbours → lost (US2 acceptance scenarios 1–4).

### Engine — status checks (TDD)

- [x] T024 [P] [US2] Tests for `isWon`/`isLost` in `tests/services/engine/status.test.ts`: `isWon` true when any tile ≥ 2048; `isLost` true only when board full AND no equal adjacent pair (NOT trial-all-moves); full-but-mergeable → not lost
- [x] T025 [US2] Implement `isWon` + `isLost` (structural adjacency scan) in `src/services/engine/status.ts`; update engine barrel (T005)

### Store — status derivation + continue (TDD)

- [x] T026 [P] [US2] Tests for `nextStatus` in `tests/store/reducer.test.ts`: non-`playing` previous status stays unchanged (won and lost are both terminal); `isLost(next)`→lost; `isWon(next)`→won; else playing; once `won` or `lost`, subsequent moves keep that status until `NEW_GAME`
- [x] T027 [US2] Add pure `nextStatus(prev, next)` (terminal won/lost) and stamp it in `COMMIT_MOVE` in `src/store/reducer.ts` (replaces US1 pass-through) to pass T026
- [x] T028 [US2] Extend `useGame` (`src/hooks/useGame.ts`): expose `status` (already) so the UI can render the win/lose overlay

### UI wiring

- [x] T029 [US2] Wire `GameOverlay` in `src/components/App/App.tsx`: show the win overlay on `status==='won'` and the game-over overlay on `status==='lost'`; the overlay's single button → `onNewGame`; prop-drill `status`

**Checkpoint**: Full win/continue/lose lifecycle on top of the MVP loop.

---

## Phase 5: User Story 3 — Undo, New Game, persisted best (Priority: P3)

**Goal**: Undo last move(s), start a fresh game (best retained), and a best score that survives new game + reload.

**Independent test**: Make moves then undo to start; new game resets board+score, keeps best; exceed best, reload, best persists (US3 acceptance scenarios 1–4).

### Storage seam (TDD)

- [x] T030 [P] [US3] Tests for `GameStorage` in `tests/services/storage/storage.test.ts`: `loadBest` default 0, save→load round-trip, corrupt/missing value → 0, `saveBest` swallows write errors (try/catch)
- [x] T031 [US3] Implement `GameStorage` interface + `createLocalStorage()` (namespaced key) in `src/services/storage/storage.ts` to pass T030

### Store — undo / new game (TDD)

- [x] T032 [P] [US3] Tests for `UNDO` + `NEW_GAME` in `tests/store/reducer.test.ts`: `UNDO` pops history into current (empty history = no-op); **undo across a spawn restores the pre-move board and discards the spawned tile** (spec edge case); `NEW_GAME` resets to `initial`, clears history, resets status, **retains `best`**
- [x] T033 [US3] Add `UNDO` and `NEW_GAME` (takes `initial` payload to stay pure) cases in `src/store/reducer.ts` to pass T032

### Hooks — persistence + actions (TDD)

- [x] T034 [P] [US3] Tests for persistence in `tests/hooks/useGame.test.ts` (or `useStore.test.ts`): lazy init reads `storage.loadBest()`; `best` increase triggers `saveBest` effect; `undo`/`newGame` callbacks stable; `isEmptyHistory` reflects history length
- [x] T035 [US3] Extend `useStore` (`src/store/useStore.ts`): lazy `useReducer` init merging `storage.loadBest()` + `createInitialState()`; `useEffect` persisting `best` on change
- [x] T036 [US3] Extend `useGame` (`src/hooks/useGame.ts`): add `undo()`, `newGame()` (dispatches `NEW_GAME` with fresh `createInitialState()`), `bestScore`, `isEmptyHistory`; all stable `useCallback`

### UI wiring

- [x] T037 [US3] Wire `NewGameButton`→`newGame` and `UndoButton`→`undo` (disabled when `isEmptyHistory`) in `src/components/App/App.tsx`; `Score` `best` variant shows persisted best

**Checkpoint**: All three stories complete — full game with undo, new game, and persistent best score.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T038 [P] **Descoped** — a dev-only `Object.freeze` guard was implemented then removed; immutability is enforced by `readonly` types + reducer no-mutation tests (FR-018), making a runtime freeze guard redundant churn.
- [x] T039 [P] Verify engine layer has **zero** imports from `store`/`hooks`/`components`/`storage` (SC-007, Constitution §I/IX) — grep check documented in quickstart
- [x] T040 **Re-render audit** (Constitution §VII NON-NEGOTIABLE): React DevTools Profiler — confirm one render per interaction (move/undo/new game); document result; add `React.memo` with justification only if a child re-renders without cause
- [x] T041 [P] Full-suite green + playthrough: `npx vitest run` all pass; manual end-to-end game reaching 2048, continue, lose, undo, new game, reload-persists-best (quickstart "definition of done")

### Configurable board size (FR-021 / SC-009) — two synced build-time constants

- [x] T042 Make board size a build-time constant per layer (FR-021): `BOARD_SIZE` in `src/services/engine/types.ts` drives all engine grid math + the background-cell count (`CELLS = BOARD_SIZE²` in `src/components/GridArea/GridArea.tsx`); a matching `--board-size` CSS property in `src/components/GridArea/GridArea.module.css` drives the `.cells` track counts (`repeat(var(--board-size), 1fr)`) and the `--cell-size` calc. Square only; `WIN_VALUE` stays an independent constant.
- [x] T043 Make tests board-size-agnostic (SC-009): derive fixtures from `BOARD_SIZE` in `tests/utils/board.ts` (`CELLS`, row-major `boardOf`, generated `deadlockState`/`fullState` via `filledBy`); `spawn.test` asserts the last cell as `BOARD_SIZE-1`. NOTE: the `move`/`status` worked-example tests remain intentionally pinned to 4×4 (concrete golden cases) and would need regenerating for a different N.

---

## Dependencies & Execution Order

- **Setup (P1)** → **Foundational (P2)** → block everything.
- **US1 (P3 phase)**: depends only on Foundational. **This is the MVP.**
- **US2**: depends on Foundational + US1 reducer/`useGame` (extends `COMMIT_MOVE` status, adds overlay). Independently testable.
- **US3**: depends on Foundational + US1 store/hooks (extends reducer + `useStore`/`useGame`). Independent of US2.
- **Polish**: after all stories.

Within a phase, `[P]` test tasks (different files) run in parallel; each implementation task depends on its own test task (Red→Green).

### Parallel opportunities

- **Setup**: T002 ∥ (T001 first).
- **Foundational**: T004 ∥ T003 (then T005).
- **US1 tests**: T006, T008, T010, T012, T015, T018, T020 are `[P]` (distinct files) — author before their implementations.
- **US2**: T024, T026 `[P]`.
- **US3**: T030, T032, T034 `[P]`.
- **Polish**: T038, T039, T041 `[P]` (T040 last).

## Implementation Strategy

- **MVP = Phase 1 + 2 + 3 (US1)**: a fully playable endless 2048 driven by keyboard. Ship/demo here.
- **Increment 2 = US2**: win/continue/lose resolution.
- **Increment 3 = US3**: undo, new game, persisted best.
- Each increment keeps the game playable (Constitution §III) — no half-states merged.
