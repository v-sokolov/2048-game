---
description: "Task list for Flat-Backed Grid Accessor"
---

# Tasks: Flat-Backed Grid Accessor

**Input**: Design documents from `/specs/005-grid-flat-array/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/grid.md, quickstart.md

**Tests**: REQUESTED — TDD-first is mandatory (Constitution II); `Grid<T>` and helper tests are
written before implementation. Existing engine behaviour tests (`move`, `status`, `spawn`, app)
are the unchanged regression net and MUST stay green.

**React Architecture** (Constitution VII): N/A — this refactor touches only the framework-agnostic
engine (`src/services/engine/`). No components, hooks, or render paths change, so no hook-extraction
or DevTools Profiler tasks apply.

**Dependency Whitelist / Hosting**: No new dependency; `vite.config.ts` untouched.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 — maps to the spec's user stories

> **Sequencing note**: The three user stories all edit the same engine files
> (`grid.ts`, `move.ts`, `status.ts`). They are therefore **sequential lenses on one
> refactor**, not independently parallelizable slices. `[P]` is used only where tasks
> touch genuinely different files. Each story's checkpoint is the green gate
> (`yarn test` + `yarn tsc --noEmit`), not each individual task.

---

## Phase 1: Setup

**Purpose**: Establish the behavioural baseline before any change.

- [X] T001 Confirm green baseline — run `yarn test` (record current passing count) and `yarn tsc --noEmit` (clean). This snapshot is the regression net for SC-001/SC-005. No files changed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Introduce `Grid<T>` — the accessor every user story depends on. Purely additive
(old `buildGrid`/`getEmptyCells` left untouched here), so the suite stays green.

**⚠️ CRITICAL**: No user story work begins until `Grid<T>` exists and its tests pass.

- [X] T002 Add failing `Grid<T>` unit tests in `tests/services/engine/grid.test.ts` (append; do not yet touch the existing `buildGrid`/`getEmptyCells` tests): construct with `sideLength`; `getCellAt`/`setCellAt` round-trip; `getCellAt` → `undefined` for an empty cell AND for off-grid coords (`-1`, `sideLength`); `isWithinBounds` truth table; `forEachCell` visits all `sideLength²` cells in row-major order. (RED)
- [X] T003 Implement `Grid<T>` in `src/services/engine/grid.ts` — `private readonly cellsByIndex: (T | undefined)[]`, `constructor(readonly sideLength)`, `isWithinBounds`, `getCellAt` (off-grid → `undefined`), `setCellAt`, `forEachCell` (row-major). Additive; leaves the old helpers intact. (GREEN for T002)

**Checkpoint**: `Grid<T>` tests pass; full suite still green; `yarn tsc --noEmit` clean.

---

## Phase 3: User Story 1 - Spatial logic reads through a safe, encapsulated accessor (Priority: P1) 🎯 MVP

**Goal**: Materialize the grid via `Grid<T>` and route `move.ts` and `spawn.ts` through the
accessor — no nested-array indexing in movement/spawn.

**Independent Test**: Full movement + spawn behaviour tests pass unchanged, with no `grid[...]`
index expressions in `move.ts` and `spawn.ts` reading through `findEmptyCells`.

- [X] T004 [US1] Rewrite the helper tests in `tests/services/engine/grid.test.ts` for the new API/names (test-first): `buildGridFromTiles` places each tile at its `(row, col)` and leaves others `undefined`; `findEmptyCells` lists all cells row-major when empty (first two `{0,0}`,`{0,1}`), omits occupied cells, returns `[]` for a full board. (RED — new names don't exist yet)
- [X] T005 [US1] Add `buildGridFromTiles({ tiles, sideLength = BOARD_SIZE })` and `findEmptyCells({ tiles, sideLength = BOARD_SIZE })` built on `Grid<T>` in `src/services/engine/grid.ts` (keep `Cell` type). (GREEN for T004)
- [X] T006 [US1] Migrate `src/services/engine/move.ts`: `buildGrid` → `buildGridFromTiles`; converge line-space on `Tile | undefined` — `readLine` returns `Array<Tile | undefined>` (`line.push(grid.getCellAt({ row, col }))`, no `?? null`) and `collapseLine` filters `!== undefined`, so `undefined` is the single absence convention end-to-end. Movement behaviour tests stay green.
- [X] T007 [P] [US1] Migrate `src/services/engine/spawn.ts`: import `findEmptyCells` instead of `getEmptyCells`. Spawn behaviour tests stay green.

**Checkpoint**: `move.ts` + `spawn.ts` route through `Grid`; suite green. (`status.ts` still uses
the old `buildGrid` — removed in US2.)

---

## Phase 4: User Story 2 - Off-board reads handled by the grid, not each caller (Priority: P2)

**Goal**: `isLost` relies on `Grid`'s bounds-safe `getCellAt` and drops its manual edge guards;
the last consumer of the old API is migrated and the old API is deleted.

**Independent Test**: Lost-state detection tests pass unchanged, and `isLost` contains no
`< BOARD_SIZE` neighbour guards.

- [X] T008 [US2] Migrate `src/services/engine/status.ts` `isLost`: `buildGrid` → `buildGridFromTiles`; replace the `valueAt` closure with `grid.getCellAt({ row, col })?.value`; delete the `col + 1 < BOARD_SIZE` / `row + 1 < BOARD_SIZE` guards (off-grid `getCellAt` returns `undefined`); no emptiness guard needed — the full-board precondition keeps `value` defined and a defined value never equals an off-grid `undefined`. Behaviour identical.
- [X] T009 [US2] Remove `createEmptyGrid`, `buildGrid`, and `getEmptyCells` from `src/services/engine/grid.ts`, and delete their now-obsolete tests from `tests/services/engine/grid.test.ts`. No aliases, no dead code (Constitution IV/no-dead-code).

**Checkpoint**: All consumers on the new API; old API gone; suite green; `yarn tsc --noEmit` clean.

---

## Phase 5: User Story 3 - Storage representation swappable without touching callers (Priority: P3)

**Goal**: Verify the encapsulation boundary holds — no caller depends on the storage shape.

**Independent Test**: The verification gates below all come back empty/clean.

- [X] T010 [US3] Verify encapsulation gates (read-only): `grep -rn 'grid\[' src/services/engine/` → empty; `grep -rn 'buildGrid\b\|getEmptyCells' src/ tests/` → empty; `grep -nE 'col \+ 1 <|row \+ 1 <' src/services/engine/status.ts` → empty; confirm nothing outside `grid.ts` references `cellsByIndex`. Also confirm FR-013 holds: the public engine signatures (`move`, `isWon`, `isLost`, spawn) and the `GameState`/`Tile`/`MoveResult`/`MergeEvent` shapes are unchanged from the baseline.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T011 Run full quickstart.md verification: `yarn test` (non-grid behaviour suites green & unchanged; `grid.test.ts` rewritten test-first) and `yarn tsc --noEmit` clean. Maps to SC-001/SC-005/SC-006.
- [X] T012 [P] Final clarity pass on `src/services/engine/grid.ts` (doc comments, full-word semantic names per research.md) with no behaviour change.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: none — run first.
- **Foundational (T002–T003)**: depends on Setup. BLOCKS all user stories.
- **US1 (T004–T007)**: depends on Foundational. T005 depends on T004; T006 & T007 depend on T005.
- **US2 (T008–T009)**: depends on US1 (helpers must exist; T009 deletes old API only after its last consumer — `status.ts` — is migrated in T008).
- **US3 (T010)**: depends on US2 (gates assume old API fully removed).
- **Polish (T011–T012)**: depends on all stories complete.

### User Story Dependencies (honest)

Unlike a typical feature, the stories are **not** independently deliverable — they share the same
engine files and form one atomic refactor. Order is strictly US1 → US2 → US3. The MVP is not a
standalone slice; the smallest behaviour-preserving green state is Foundational + US1.

### Parallel Opportunities

- T006 and T007 are `[P]` — different files (`move.ts` vs `spawn.ts`), both after T005.
- T012 is `[P]` — isolated clarity pass.
- Everything else is sequential (shared files / RED-before-GREEN ordering).

---

## Implementation Strategy

1. **Setup**: confirm baseline green (T001).
2. **Foundational**: land `Grid<T>` additively, tests first (T002 → T003) — suite stays green.
3. **US1 (MVP increment)**: helpers on `Grid`, migrate `move.ts`/`spawn.ts` (T004 → T005 → T006/T007). Validate movement + spawn behaviour unchanged.
4. **US2**: migrate `status.ts`, drop edge guards, delete old API (T008 → T009). Validate loss detection unchanged.
5. **US3**: run encapsulation gates (T010).
6. **Polish**: full verification + clarity pass (T011 → T012), then Finish Flow.

---

## Notes

- Behaviour is frozen: no engine behaviour-test assertion may be changed to accommodate new
  behaviour (SC-001). `grid.test.ts` is the one test file legitimately rewritten — it is the unit
  test for the unit being refactored.
- Post-completion clarity polish (no behaviour change, suite stayed green): `move.ts` line-space
  converged on `Tile | undefined` (no `?? null`); the redundant `value !== undefined` guard in
  `isLost` was removed (dead under the full-board precondition); `Grid` multi-arg methods/helpers
  moved to typed options objects with coordinate args reusing `Cell`; the `forEachCell` callback
  type is `OnCell<T>` (positional). `Grid` is engine-internal, so the public engine API (FR-013)
  is unaffected.
- Commit after each green checkpoint.
- Finish via the Constitution's Finish Flow (PR → merge → keep branch → `git checkout master` → `git pull`).
