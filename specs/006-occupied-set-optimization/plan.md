# Implementation Plan: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Branch**: `006-occupied-set-optimization` | **Date**: 2026-06-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-occupied-set-optimization/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace O(N²) grid scans for "is board full?" and "find empty cells" with Set-backed lookups. Implement Strategy A (rebuild occupied-Set fresh from Entity List each move) to achieve O(1) board-full checks and O(t) empty-cell discovery while eliminating correctness risk. No observable behavior change; all existing tests must pass. TDD-first implementation in grid.ts and status.ts only.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict mode) — mandatory per Constitution §Tech Stack

**Primary Dependencies**: react, react-dom (runtime) — see Constitution §Dependency Whitelist;
no additional libraries without a constitution amendment

**Storage**: N/A (in-memory game state only, no persistence unless spec requires it)

**Testing**: Vitest + jsdom + @testing-library/react + @testing-library/jest-dom

**Target Platform**: Modern evergreen browser, static files (no server required)

**Project Type**: Browser game (single-page, no routing)

**Performance Goals**: 60 fps smooth tile animations; no jank on user input

**Constraints**: Offline-capable (static); dependency whitelist enforced (Constitution §Tech Stack);
`vite.config.ts` base MUST remain `/2048-game/` (Constitution §Hosting)

**Scale/Scope**: Single player, one game board, browser-only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Principles I–IX:

- [x] **I. Game Logic Isolation** — core logic in framework-agnostic module; no UI refs
  - ✓ Changes confined to `src/services/engine/grid.ts` and `src/services/engine/status.ts`; no UI coupling
- [x] **II. Test-First** — TDD attempted first for every task; exceptions noted
  - ✓ All tasks include unit test cases; buildOccupiedIndices/findEmptyCells/isBoardFull tested before implementation
- [x] **III. Incremental Delivery** — feature is a playable increment; user stories are independent
  - ✓ Feature is pure refactor; game remains playable and functional; spawn and loss-detection unchanged in behavior
- [x] **IV. Simplicity** — no abstraction without concrete present-day need; YAGNI applied
  - ✓ Strategy A (rebuild Set fresh) chosen over B; no new abstractions; minimal helper functions
- [x] **V. Learning-First** — decisions documented; clarity over cleverness
  - ✓ Spec documents Strategy A vs B rationale; semantic naming (buildOccupiedIndices, isBoardFull, occupied)
- [x] **VI. Testing Scope** — CSS tests excluded unless explicitly requested
  - ✓ Engine-only refactor; no CSS changes; unit tests only
- [x] **VII. React Architecture** — composition; single-responsibility components; logic in hooks;
      no inline props; colocated state; context split by frequency; Profiler check before merge
  - ✓ No React changes; engine layer untouched; no hook/component work
- [x] **VIII. Artifact Brevity** — plan/tasks/checklists are minimal without losing actionable context
  - ✓ Spec, plan, and checklist are concise; task list TBD but minimal
- [x] **IX. Layered Architecture** — modules in their correct layer; cross-layer communication via
      declared interfaces only; no implementation leaking across boundaries
  - ✓ grid.ts and status.ts are engine layer; buildOccupiedIndices exported as public API; no cross-layer leakage
- [x] **Dependency Whitelist** — no package outside whitelist; amend constitution first
  - ✓ Uses Set<number> (built-in TypeScript); no new dependencies
- [x] **Hosting** — `vite.config.ts` retains `base: '/2048-game/'`
  - ✓ No vite.config changes; no hosting impact

## Project Structure

### Documentation (this feature)

```text
specs/006-occupied-set-optimization/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── checklists/requirements.md  # Quality validation
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── components/          # React UI components (no changes for this feature)
├── services/
│   └── engine/
│       ├── grid.ts      # MODIFIED: add buildOccupiedIndices, update findEmptyCells
│       ├── status.ts    # MODIFIED: update isBoardFull check
│       ├── move.ts      # UNTOUCHED (Strategy A: no Set mutation bookkeeping)
│       ├── spawn.ts     # Uses findEmptyCells (no direct changes)
│       └── grid.test.ts # MODIFIED: add tests for buildOccupiedIndices, findEmptyCells, isBoardFull
├── hooks/               # (no changes)
├── styles/              # (no changes)
└── types/               # (no changes)
```

**Structure Decision**: Single-project layout. Feature affects only `src/services/engine/grid.ts` (primary) and `src/services/engine/status.ts` (secondary read site). No new files; tests added to existing `grid.test.ts`.

## Phase 0: Research

**Status**: Complete (specification handoff included full decision documentation)

No clarifications needed. Spec already documents:
- **Strategy A vs B decision**: Strategy A chosen (rebuild Set fresh each move, no long-lived state)
- **Rationale**: zero drift risk; maintains source-of-truth Entity List; O(t) rebuild cost matches existing work per move
- **Scope boundaries**: changes confined to grid.ts + status.ts; move.ts untouched
- **Row-major indexing**: `index = row * sideLength + col` confirmed in assumptions

**Deliverable**: research.md (generated below)

## Phase 1: Design & Contracts

**Prerequisites**: Constitution Check passed ✓

### 1. Data Model (data-model.md)

**Entities**:

- **Tile** (existing, unchanged): `{value: number, row: number, col: number, id: number, isNew?: boolean, isMerged?: boolean}`
- **Cell** (existing, unchanged): `{row: number, col: number}`
- **Occupied Index Set** (new): `Set<number>` of row-major indices; derived fresh per move via `buildOccupiedIndices`

**Key Invariants**:

- Occupied-Set size always equals `Tile[].length`
- Index = `row * sideLength + col` (row-major order)
- Inverse: `row = Math.floor(index / sideLength)`, `col = index % sideLength`

### 2. Contracts

No external interfaces exposed by this feature. The occupied-Set is internal to the engine; `buildOccupiedIndices`, `findEmptyCells`, and `isBoardFull` are pure functions with no side effects. Grid.ts public API expands but remains framework-agnostic.

### 3. Public API (grid.ts exports)

```typescript
export function buildOccupiedIndices({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): Set<number>

export function findEmptyCells({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): Cell[]

export function isBoardFull({
  tiles,
  sideLength = BOARD_SIZE,
}: {
  tiles: readonly Tile[];
  sideLength?: number;
}): boolean
```

All three are side-effect-free; take `Tile[]` as input; return Set or Cell[] or boolean.

### 4. Quickstart

See `quickstart.md` (generated).

## Phase 2: Tasks

Run `/speckit-tasks` to generate the implementation task list. Expected structure:
- Setup: test infrastructure for buildOccupiedIndices
- T1: implement buildOccupiedIndices + unit tests (empty, partial, full boards)
- T2: refactor findEmptyCells to use buildOccupiedIndices
- T3: implement isBoardFull + tests
- T4: integrate isBoardFull into status.ts isLost check
- Verification: all 79/79 tests pass, tsc clean, no observable behavior change
