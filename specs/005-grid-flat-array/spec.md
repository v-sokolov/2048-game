# Feature Specification: Flat-Backed Grid Accessor

**Feature Branch**: `005-grid-flat-array`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Replace the transient nested grid with a flat-backed `Grid<T>` accessor — an encapsulation, readability, and safety change. Game behaviour, scores, and the public engine contract must be identical before and after."

## User Scenarios & Testing *(mandatory)*

> Context: this is an internal engineering change to the game engine. The "users"
> here are the developers and maintainers who read, extend, and rely on the
> engine; the value is delivered to them, while the player-facing behaviour stays
> exactly the same.

### User Story 1 - Spatial logic reads cells through a safe, encapsulated accessor (Priority: P1)

A developer working on movement, win/loss, or spawn logic accesses the board's
spatial layout through a single grid abstraction that hides how cells are
stored, instead of indexing a raw nested array directly.

**Why this priority**: This is the core of the change. Without the encapsulated
accessor in place and adopted by the spatial logic, none of the readability,
safety, or swappability benefits exist. It is the minimum viable slice.

**Independent Test**: Can be fully tested by exercising the full existing engine
behaviour test suite (movement, merging, spawning, win/loss) and confirming every
test passes unchanged, while no caller indexes the grid storage directly.

**Acceptance Scenarios**:

1. **Given** the same board configuration as before the change, **When** a move is
   resolved in any of the four directions, **Then** the resulting tile positions,
   merges, and score are identical to the prior implementation.
2. **Given** the spatial logic accesses any cell, **When** the code is reviewed,
   **Then** it reads cells through the grid accessor and no longer references the
   underlying storage shape directly.

---

### User Story 2 - Off-board reads are handled by the grid, not by each caller (Priority: P2)

A developer scanning for neighbouring cells (e.g. checking whether the board is
in a lost state) relies on the grid to safely report an absent value for any
coordinate that falls outside the board, rather than writing manual edge checks
at every call site.

**Why this priority**: This removes a recurring class of off-by-one and
boundary mistakes and is a key safety motivation, but it depends on Story 1's
accessor existing first.

**Independent Test**: Can be tested by requesting cells at coordinates beyond the
board edges and confirming an "absent" result is returned without error, and by
confirming neighbour-scanning logic contains no manual boundary guards.

**Acceptance Scenarios**:

1. **Given** a coordinate outside the board bounds, **When** a cell is requested at
   that coordinate, **Then** the grid reports the cell as absent instead of
   raising an error.
2. **Given** the lost-state detection logic, **When** it inspects neighbouring
   cells at the board's edges, **Then** it relies on the grid's bounds handling
   and contains no explicit "is this coordinate in range" guard.

---

### User Story 3 - The storage representation can be swapped without touching callers (Priority: P3)

A developer who later wants to change how the board is stored internally can do
so within the grid abstraction alone, without modifying movement, win/loss, or
spawn logic.

**Why this priority**: This is the long-term payoff (future swappability), valuable
but not required to realize the immediate readability and safety wins.

**Independent Test**: Can be tested by confirming the spatial logic depends only on
the grid's public accessor operations, so a change to the internal storage shape
would not alter any call site.

**Acceptance Scenarios**:

1. **Given** the grid's internal storage shape, **When** spatial logic is reviewed,
   **Then** no caller depends on or references how cells are stored.

---

### Edge Cases

- **Reading an empty cell**: A cell that holds no tile reports a single, consistent
  "absent" result.
- **Reading off the board**: A coordinate beyond any edge reports the same "absent"
  result as an empty in-board cell, so neighbour scans need no edge guards.
- **Full board, no moves possible**: Lost-state detection still correctly reports a
  loss when no adjacent cells can merge, with no behavioural change.
- **Early-exit traversal**: Logic that must stop as soon as a condition is met (e.g.
  finding the first mergeable neighbour) retains its ability to short-circuit and is
  not forced through a full-grid traversal.
- **Board size as the single source of truth**: The board dimension continues to come
  from one shared definition; the grid is told its side length rather than hard-coding it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The engine MUST provide a single grid abstraction that represents the
  board's transient spatial layout and is addressed by row and column.
- **FR-002**: The grid MUST hide its internal storage shape from callers; spatial
  logic MUST NOT directly index the underlying storage.
- **FR-003**: The grid MUST report the cell at a given row and column, returning a
  consistent "absent" result when the cell is empty.
- **FR-004**: The grid MUST return the same "absent" result for any coordinate that
  falls outside the board, without raising an error.
- **FR-005**: The grid MUST allow a cell to be set or cleared at a given row and column.
- **FR-006**: The grid MUST allow callers to visit every cell in a defined order.
- **FR-007**: The grid MUST be constructed for a given side length and MUST derive the
  board dimension from the existing single source of truth for board size.
- **FR-008**: The engine MUST materialize the spatial grid from the existing tile list
  on demand and MUST continue to treat the tile list as the immutable source of truth;
  the grid MUST remain throwaway scratch space that is never stored in game state.
- **FR-009**: Movement logic MUST access all spatial information through the grid
  abstraction.
- **FR-010**: Win/loss detection logic MUST access all spatial information through the
  grid abstraction and MUST rely on the grid's bounds handling instead of manual edge
  guards.
- **FR-011**: Logic requiring early termination during traversal MUST retain its ability
  to short-circuit.
- **FR-012**: The change MUST NOT alter game behaviour, scoring, win/loss detection,
  spawn outcomes, or animation/merge data.
- **FR-013**: The change MUST NOT alter the engine's public function contracts or the
  shape of game state and tile entities.
- **FR-014**: No dead or superseded code paths from the previous nested representation
  may remain after the change; any renamed helper MUST have all callers and tests updated.

### Key Entities *(include if feature involves data)*

- **Spatial Grid**: A transient, mutable representation of the board addressed by
  (row, col). Materialized from the tile list each time spatial logic runs, read for
  movement and win/loss decisions, then discarded. Reports an absent value for empty
  cells and for off-board coordinates. Generic over the type of value it holds.
- **Tile List (unchanged)**: The immutable source of truth carrying each tile's
  identity, value, and position, plus merge provenance for animation. Not replaced by
  this change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the existing engine behaviour tests pass unchanged after the
  change (no test assertions modified to accommodate new behaviour).
- **SC-002**: Zero direct references to the grid's underlying storage shape remain in
  movement and win/loss logic (no nested-index expressions on the grid).
- **SC-003**: Zero manual board-boundary guards remain in win/loss neighbour-scanning
  logic; all bounds handling is delegated to the grid.
- **SC-004**: A developer can change the grid's internal storage representation without
  editing any movement, win/loss, or spawn call site.
- **SC-005**: Resolving a move at the 4×4 board produces results indistinguishable in
  position, score, and merge data from the prior implementation, for every direction.
- **SC-006**: The type-check and full test suite both complete cleanly with no errors.

## Assumptions

- The current two-layer model is retained: the tile list stays the immutable source of
  truth, and the grid is the transient spatial view built from it. Only the spatial view's
  representation changes.
- This is explicitly not a performance optimization. At the 4×4 board, any allocation or
  locality differences are unmeasurable; the value is encapsulation, readability, and safety.
- Asymptotic improvements (e.g. tracking occupied cells to make "find empty cells" or
  "is the board full" sub-quadratic) are out of scope.
- The full-word, self-documenting naming convention used elsewhere in the engine applies
  to the new abstraction and its helpers.
- The existing engine behaviour test suite is the behavioural safety net and is expected to
  remain green without modification; any new unit tests for the grid abstraction are written
  test-first per the project's TDD practice.
- The board dimension remains driven by the single existing board-size definition shared
  across the codebase.
