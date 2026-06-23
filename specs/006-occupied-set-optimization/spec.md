# Feature Specification: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Feature Branch**: `006-occupied-set-optimization`

**Created**: 2026-06-23

**Status**: Draft

**Input**: Handoff from specs/grid-occupied-set-optimization.md

## User Scenarios & Testing

### User Story 1 - Spawn Operation Finds Empty Cells Efficiently (Priority: P1)

When the game spawns a new tile (2 or 4), it must select a random empty cell. Today this requires scanning all N² cells to find which are empty. This story replaces the O(N²) scan with a Set-backed lookup that takes only O(t) per-cell test, where t = number of tiles on board.

**Why this priority**: Core game loop; spawn happens after every move. Foundational optimization that makes the next optimization (board-full check) possible.

**Independent Test**: New tile can be spawned repeatedly and lands only on genuinely empty cells, with the occupied-Set correctly tracking which cells hold tiles.

**Acceptance Scenarios**:

1. **Given** an empty board, **When** spawn is called, **Then** a tile is placed on a random cell and `findEmptyCells` correctly returns the remaining empty cells.
2. **Given** a board with some tiles placed, **When** spawn is called, **Then** a new tile lands only on a cell that is not in the occupied-Set.
3. **Given** a full board, **When** spawn attempts to find an empty cell, **Then** `findEmptyCells` returns an empty array.

---

### User Story 2 - Loss Detection Checks Board-Full in O(1) (Priority: P1)

The `isLost` function checks if no moves are possible. The first check is "is the board full?" Today this is O(N²). This story replaces it with a Set-size check: `occupied.size === N * N`, which is O(1).

**Why this priority**: Loss detection gates the stuck-state check (which is expensive). Moving the full-board test from O(N²) scan to Set-size comparison is a real complexity win and unblocks stuck-state logic.

**Independent Test**: After moves that fill the board, `isLost` correctly identifies when no empty cells remain without scanning the whole grid.

**Acceptance Scenarios**:

1. **Given** an empty board, **When** `isBoardFull` is called, **Then** it returns false in O(1).
2. **Given** a partially filled board, **When** `isBoardFull` is called, **Then** it returns false without scanning all N² cells.
3. **Given** a full board (all N² cells occupied), **When** `isBoardFull` is called, **Then** it returns true by checking `occupied.size === N * N`.

---

### User Story 3 - Occupied-Set Stays in Sync Across All Game States (Priority: P1)

The optimization only works if the occupied-Set is always correct. This story ensures that `buildOccupiedIndices` faithfully derives the Set from the source-of-truth `Tile[]` Entity List, and that strategy A (rebuild per move) eliminates synchronization risk.

**Why this priority**: Correctness is foundational. A drifted Set silently breaks spawn and loss detection. Strategy A rebuilds the Set fresh each move from the Entity List, eliminating long-lived mutable state and all drift risk.

**Independent Test**: The occupied-Set matches the actual tiles on the board across all game states: empty, partially filled, and full.

**Acceptance Scenarios**:

1. **Given** the Entity List `Tile[]`, **When** `buildOccupiedIndices` is called, **Then** the returned Set contains exactly the row-major indices of every tile (`row * sideLength + col` for each tile).
2. **Given** a board with tiles placed and moves executed, **When** the Set is rebuilt after each move, **Then** `occupied.size` always equals the length of the Entity List.
3. **Given** an empty board, **When** `buildOccupiedIndices` is called, **Then** it returns an empty Set.

---

### Edge Cases

- What happens when the board is completely empty? (findEmptyCells returns all N² indices; isBoardFull returns false)
- What happens when the board is completely full? (findEmptyCells returns empty array; isBoardFull returns true)
- What happens when the sideLength parameter differs from BOARD_SIZE? (Functions must respect the sideLength parameter for future N-agnostic use)
- How does the Set handle the row-major index calculation? (index = row * sideLength + col; the inverse must correctly recover row and col)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide `buildOccupiedIndices({ tiles, sideLength? }: { tiles: readonly Tile[]; sideLength?: number }): Set<number>` that derives a Set of row-major cell indices from the Entity List.
- **FR-002**: System MUST provide `findEmptyCells({ tiles, sideLength? }: { tiles: readonly Tile[]; sideLength?: number }): Cell[]` that returns all cells not in the occupied-Set, using the Set for O(1) per-cell membership testing.
- **FR-003**: System MUST provide `isBoardFull({ tiles, sideLength? }: { tiles: readonly Tile[]; sideLength?: number }): boolean` that returns true when `occupied.size === sideLength * sideLength`, replacing the O(N²) grid scan.
- **FR-004**: System MUST NOT modify `move.ts` or introduce long-lived mutable Set state; the occupied-Set MUST be rebuilt fresh from `Tile[]` each call (Strategy A), not maintained across moves, to eliminate drift risk.
- **FR-005**: System MUST NOT change observable game behavior; all existing spawn and loss-detection tests must pass unchanged.
- **FR-006**: Functions MUST use semantic full-word names: `occupied`, `sideLength`, `buildOccupiedIndices`, `findEmptyCells`, `isBoardFull` — no abbreviations.

### Key Entities

- **Tile**: Entity with `row`, `col` attributes representing position on the board.
- **Cell**: Object with `row`, `col` attributes representing a grid position.
- **Occupied-Set**: `Set<number>` containing row-major indices of cells that hold tiles; index = row * sideLength + col.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Board-full check completes in O(1) time (Set-size comparison) instead of O(N²) grid scan.
- **SC-002**: Empty-cell discovery completes in O(t) per-cell test (where t = tiles present) instead of O(N²) grid lookup.
- **SC-003**: All existing tests pass unchanged (79/79 at the start of this work); no observable behavior change.
- **SC-004**: `yarn tsc --noEmit` returns clean output; no type errors introduced.
- **SC-005**: New unit tests cover: empty board, partially filled board, full board, and row-major index ↔ (row, col) round-trip.
- **SC-006**: No long-lived mutable Set state persists across moves (Strategy A constraint).

## Assumptions

- The Entity List (`Tile[]`) remains the single source of truth for board state and is rebuilt each move.
- Row-major indexing is used: `index = row * sideLength + col`.
- The optimization is driven by demonstrating scale-awareness and preparing for future N-agnostic board sizes, not by measured performance gains on 4×4 (where O(N²) on 16 cells is negligible).
- TDD-first development: tests are written before or alongside implementation changes.
- The project constitution and existing test suite remain unchanged.
