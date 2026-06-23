# Implementation Plan: Flat-Backed Grid Accessor

**Branch**: `005-grid-flat-array` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-grid-flat-array/spec.md`

## Summary

Replace the engine's transient nested-array spatial view (`(Tile | null)[][]`) with a
generic, flat-backed, bounds-safe `Grid<T>` class. Storage becomes a single row-major
array hidden behind `getCellAt` / `setCellAt` / `forEachCell`; out-of-bounds reads return
`undefined`, letting callers drop manual edge guards. The `Tile[]` entity list stays the
immutable source of truth and the grid stays throwaway scratch. No game behaviour, score,
win/loss outcome, animation data, or public engine signature changes. Existing engine
behaviour tests are the safety net and stay green unchanged; `grid.test.ts` is rewritten
test-first against the new API.

## Technical Context

**Language/Version**: TypeScript (strict mode) — per Constitution §Tech Stack

**Primary Dependencies**: react, react-dom (no change; this touches only `src/services/engine/`)

**Storage**: N/A (in-memory game state only)

**Testing**: Vitest + jsdom + @testing-library/react

**Target Platform**: Modern evergreen browser, static files

**Project Type**: Browser game (single-page)

**Performance Goals**: Unchanged — same complexity class (O(1) cell access, O(N²) build/traverse).
Explicitly NOT a speed change; allocation/locality differences at 4×4 are unmeasurable.

**Constraints**: Dependency whitelist unchanged; `vite.config.ts` base untouched; public engine
contract (`move`, `isWon`, `isLost`, spawn) and `GameState`/`Tile` shapes frozen.

**Scale/Scope**: Three engine source files (`grid.ts`, `move.ts`, `status.ts`), one consumer
(`spawn.ts`) for renamed imports, one test file (`grid.test.ts`) rewritten.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Game Logic Isolation** — change is wholly inside the framework-agnostic engine; no UI refs introduced.
- [x] **II. Test-First** — new `Grid<T>` unit tests written before the class; `grid.test.ts` rewritten first; existing engine behaviour tests are the unchanged regression net.
- [x] **III. Incremental Delivery** — single behaviour-preserving increment; the game stays playable at every step (the public engine API never changes).
- [x] **IV. Simplicity** — encapsulation/bounds-safety is a present-day need (removes duplicated edge guards, hides storage). Generic `<T>` rationale recorded in research.md; no speculative features (no `someCell`, no occupancy `Set` — explicitly deferred).
- [x] **V. Learning-First** — decisions and the "encapsulation not speed" framing documented in research.md.
- [x] **VI. Testing Scope** — no CSS/visual tests added.
- [x] **VII. React Architecture** — N/A; no components, hooks, or render paths touched.
- [x] **VIII. Artifact Brevity** — artifacts kept minimal; no re-derivable detail dropped.
- [x] **IX. Layered Architecture** — all edits live in the engine layer; `Grid` is engine-internal; the engine's public API (the cross-layer contract) is unchanged, so `hooks`/`store`/`components` are untouched.
- [x] **Dependency Whitelist** — no package added.
- [x] **Hosting** — `vite.config.ts` retains `base: '/2048-game/'`.

No violations. Complexity Tracking section omitted (nothing to justify).

## Project Structure

### Documentation (this feature)

```text
specs/005-grid-flat-array/
├── plan.md              # This file
├── research.md          # Phase 0 — design decisions
├── data-model.md        # Phase 1 — Grid<T> + helpers structure
├── quickstart.md        # Phase 1 — how to verify the refactor
├── contracts/
│   └── grid.md          # Phase 1 — Grid<T> public API + frozen engine contract
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/services/engine/
├── grid.ts        # MODIFY — add Grid<T> class; rebuild buildGridFromTiles / findEmptyCells on it
├── move.ts        # MODIFY — buildGridFromTiles; readLine/collapseLine converged on Tile | undefined
├── status.ts      # MODIFY — Grid getter; delete manual < BOARD_SIZE edge guards
├── spawn.ts       # MODIFY — update import to findEmptyCells
└── types.ts       # UNCHANGED — BOARD_SIZE / WIN_VALUE / Tile / GameState frozen

tests/services/engine/
└── grid.test.ts   # REWRITE (test-first) — Grid<T> unit tests + helper tests on new API
```

**Structure Decision**: Single-project layout (Constitution default). The change is confined
to the existing engine layer (`src/services/engine/`) and its colocated tests. No new
directories or layers.

## Phase 0 — Research

See [research.md](research.md). Decisions: adopt the renames (`buildGridFromTiles`,
`findEmptyCells`), converge `move.ts` line-space on `Tile | undefined` so `undefined` is the
single absence convention end-to-end (no `?? null` bridge), keep `Grid<T>` generic, and keep
`isLost`'s explicit `for` loop for short-circuit (do not force `forEachCell`).

## Phase 1 — Design & Contracts

- [data-model.md](data-model.md) — `Grid<T>` fields/methods and the two `Tile`-aware helpers.
- [contracts/grid.md](contracts/grid.md) — `Grid<T>` public surface and the frozen engine API it must preserve.
- [quickstart.md](quickstart.md) — verification steps (`yarn test`, `yarn tsc --noEmit`, grep gates).
- Agent context: `CLAUDE.md` plan reference updated to this plan.
