# Implementation Plan: 2048 Data Layer

**Branch**: `002-data-layer` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-data-layer/spec.md` · Design source: `docs/superpowers/specs/2026-06-22-2048-data-layer-design.md`

## Summary

Build the immutable, identity-centric game-state layer that feeds the existing UI (feature 001). Three layers, contracts-only across boundaries:

- **`src/services/engine/`** — PURE, framework-agnostic 2048 rules. `Tile[]` is the source of truth; a transient `(Tile|null)[N][N]` grid is materialized per move for `O(1)` cell math then discarded. `move(state, dir) → { state, result }` is deterministic; `spawn(state)` is the single impure function (owns `Math.random` + 90/10 split). `isWon`/`isLost`/`createInitialState` complete the engine.
- **`src/store/`** — a PURE `reducer` (recorder of already-computed, already-valid transitions — StrictMode-safe), `actions`, and `useStore` (a `useReducer` wrapper owning lazy best-score load + the save effect) → `{ state, dispatch }`.
- **`src/hooks/`** — `useGame` composition root (runs engine, gates on validity, performs the impure spawn in the handler, dispatches one finished transition; `undo`/`newGame` are stable `useCallback`, `move` reads current state); `useInputDirection` maps keyboard now / touch later → `Direction`.

Immutability is pure TypeScript: `readonly` fields, spread-based copies, structural sharing for the undo history. No state/immutability library (whitelist-clean). `MoveResult` is the animation channel carrying merge events (source ids + result id) and the spawned tile so the UI animates without inspecting engine internals.

## Technical Context

**Language/Version**: TypeScript strict. Reuses existing path aliases (`@components/*`, `@assets/*`); adds none required by this layer (engine/store/hooks import by relative path or a new alias only if it reduces churn — default to relative).

**Primary Dependencies**: `react`, `react-dom` only (hooks layer). Engine and store have **zero runtime dependencies**. No new packages — whitelist untouched.

**Storage**: `localStorage` for the **best score only** (one namespaced key, `try/catch`, default 0). Accessed solely through a `GameStorage` interface; full-game persistence is designed-for but out of scope.

**Testing**: Vitest + jsdom + @testing-library/react (`renderHook`) + @testing-library/jest-dom. Engine is the bulk of coverage (pure unit tests); `spawn` tested by stubbing `Math.random` via `vi.spyOn`; reducer tested as a pure function; hooks via `renderHook`.

**Target Platform**: Evergreen browser, static (GitHub Pages `/2048-game/`).

**Project Type**: Single-page browser game; this feature is the non-UI data layer behind the existing components.

**Performance Goals**: A move resolves in microseconds (all engine ops `O(C)`, C=16); input feels instantaneous. Re-render hygiene (VII) keeps React to one render per interaction.

**Constraints**: Pure engine (no React/DOM/storage imports in `engine/`); dependency whitelist enforced; `vite.config.ts` base stays `/2048-game/`; reducer must stay pure for StrictMode double-invoke safety. Board dimension is a build-time constant — `BOARD_SIZE` (TS) for logic + a matching `--board-size` CSS property for layout, kept in sync; square only (FR-021).

**Scale/Scope**: Single player, one square board (N×N, default 4) sized by a build-time constant. Stored state is `O(tiles)`; the only `O(area)` structure (the grid) is ephemeral. Public API and stored shape are board-size-independent by design.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **I. Game Logic Isolation** — `src/services/engine/` is pure and framework-agnostic; no React/DOM/storage imports. UI/hooks call inward only.
- [x] **II. Test-First** — TDD for all logic: engine (slide/merge/one-merge-lock/validity/score/all 4 dirs, `spawn` distribution via stubbed RNG, `isWon`/`isLost`, `createInitialState`), reducer (pure transitions), hooks (`renderHook`). No TDD-exempt code in this layer (it is all testable logic).
- [x] **III. Incremental Delivery** — user stories independent & ordered: P1 play-a-move is a playable slice on its own; P2 win/lose and P3 undo/new-game/best build on it without breaking it.
- [x] **IV. Simplicity** — `Tile[]` + transient grid is the minimal identity-preserving model; no normalized state, no empty/free list, no context (YAGNI; all rejected with rationale in research.md).
- [x] **V. Learning-First** — every structural decision (identity-centric model, status ownership, randomness placement, history as immutable stack) documented in research.md + design doc.
- [x] **VI. Testing Scope** — no CSS/visual tests; animation is asserted only at the data level (`MoveResult` contents), never as style.
- [x] **VII. React Architecture** — logic lives in hooks (`useGame`, `useInputDirection`, `useStore`), not components; `undo`/`newGame` `useCallback`-stable, `move` reads current state but is not a memoized child's prop (no extra re-renders); reducer pure; no inline object/function props introduced; state owned at the composition root. Profiler check before merge.
- [x] **VIII. Artifact Brevity** — plan/research/data-model kept minimal; design doc holds the long-form reasoning, not duplicated here.
- [x] **IX. Layered Architecture** — `engine/` (domain) · `storage/` (persistence seam) · `store/` (state container) · `hooks/` (orchestration) · `components/` (UI). Cross-layer communication via exported TS types only; dependency arrows point inward (`App → useGame → { useStore → reducer/actions + storage, engine, useInputDirection }`).
- [x] **Dependency Whitelist** — no new packages; engine/store have zero runtime deps.
- [x] **Hosting** — `vite.config.ts` base `/2048-game/` untouched.

**Result: PASS** — no violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/002-data-layer/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions & rejected alternatives
├── data-model.md        # Phase 1 — entities, shapes, state transitions
├── quickstart.md        # Phase 1 — how the layers wire together + test entry points
├── contracts/
│   └── data-layer.md    # Phase 1 — engine / store / hook public TS contracts
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/                                ← source only (tests live under tests/)
├── services/
│   ├── engine/                 ← PURE, framework-agnostic (no React, no storage)
│   │   ├── types.ts                Tile, GameState, Direction, GameStatus, MoveResult, MergeEvent
│   │   ├── id.ts                   newId() — stable tile-id generator (crypto.randomUUID)
│   │   ├── move.ts                 move(state, dir) → { state, result }; private cellFor() orient + collapseLine
│   │   ├── spawn.ts                spawn(state) → { state, spawned }  (owns Math.random + 90/10)
│   │   ├── status.ts               isWon(state), isLost(state)
│   │   ├── grid.ts                 buildGrid + getEmptyCells — shared Tile[]→grid materialization seam
│   │   ├── init.ts                 createInitialState() — empty board + 2 spawns
│   │   └── index.ts                engine barrel (public surface)
│   └── storage/
│       └── storage.ts              GameStorage interface + localStorage impl (best score only)
├── store/
│   ├── actions.ts                  action types (COMMIT_MOVE, UNDO, NEW_GAME)
│   ├── reducer.ts                  PURE reducer + nextStatus derivation
│   └── useStore.ts                 useReducer wrapper; lazy best-score load + save effect → { state, dispatch }
├── hooks/
│   ├── useGame.ts                  composition root: useStore + engine + handleMove/undo/newGame
│   └── useInputDirection.ts        keyboard now; touch-swipe later → Direction → callback
└── components/                     ← existing UI; GridArea/Score/GameOverlay switch mock → real data via App + useGame
                                       (consume the engine's Tile type directly — no separate UI alias)

tests/                              ← all tests, mirroring src/ (import source via the @/ alias)
├── helpers/                        board.ts — shared GameState/Tile fixtures (factory, deadlock, full board)
├── services/
│   ├── engine/                     id · move · spawn · status · init · value-invariant · grid .test.ts
│   └── storage/                    storage.test.ts
├── store/                          reducer.test.ts
├── hooks/                          useGame.test.ts · useInputDirection.test.ts
└── components/                     Tile.test.tsx · App.test.tsx
```

**Structure Decision**: Four cooperating layers under `src/` (source only), matching Constitution §IX. **Tests live in a top-level `tests/` tree that mirrors `src/`**, keeping the source tree uncluttered; test files import the module under test via a `@/` → `src/` path alias (added to `vite.config.ts` resolve + `tsconfig.json` paths; `tsconfig` `include` adds `tests`). The engine carries the golden end-to-end tests (the two worked examples from the logic-design doc). `store/` is a distinct layer between engine and hooks so the pure reducer/actions are isolated from orchestration and the `useStore` wrapper concentrates all persistence wiring. `useGame` imports `useStore` (never the reducer/actions directly). The existing `src/components/` tree is untouched structurally — only `App` gains the `useGame` wiring and `GridArea`/`Score`/`GameOverlay` receive real data instead of mocks. Components consume the engine's `Tile` type directly (aliased locally as `TileData` where the `Tile` *component* name would clash); there is no separate UI type module, so the engine's `types.ts` stays the single source of truth.

## Complexity Tracking

> No Constitution violations. Section intentionally empty.
