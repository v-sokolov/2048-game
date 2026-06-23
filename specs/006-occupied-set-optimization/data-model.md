# Data Model: Occupied-Set Optimization

**Feature**: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Date**: 2026-06-23

---

## Core Entities

### Tile (Existing, Unchanged)

Represents a numbered game tile on the board.

```typescript
interface Tile {
  id: number;           // Unique identifier
  value: number;        // Power of 2: 2, 4, 8, 16, ..., 2048
  row: number;          // Row position (0 to BOARD_SIZE - 1)
  col: number;          // Column position (0 to BOARD_SIZE - 1)
  isNew?: boolean;      // True if spawned this turn
  isMerged?: boolean;   // True if created by merge this turn
}
```

**Constraints**:
- `value` must be a power of 2.
- `row` and `col` must be within [0, BOARD_SIZE - 1].
- The Entity List `Tile[]` is the single source of truth for board state.

---

### Cell (Existing, Unchanged)

Represents an empty grid position.

```typescript
interface Cell {
  row: number;  // Row position (0 to BOARD_SIZE - 1)
  col: number;  // Column position (0 to BOARD_SIZE - 1)
}
```

**Constraints**:
- A Cell is empty if no Tile occupies that position.

---

### Occupied Index Set (New)

A `Set<number>` of row-major indices derived from the Tile[] Entity List.

**Definition**:
- Each Tile at position `(row, col)` contributes index `row * BOARD_SIZE + col` to the Set.
- The Set is rebuilt fresh per move; it is never mutated between moves.

**Formula**:
```typescript
// Building the Set from Tile[]
for (const tile of tiles) {
  occupied.add(tile.row * sideLength + tile.col);
}

// Recovering (row, col) from index
const index = ...;  // from the Set
const row = Math.floor(index / sideLength);
const col = index % sideLength;
```

**Invariants**:
- `occupied.size === tiles.length` (always)
- `occupied` contains exactly one index per Tile
- Index `i` is in `occupied` if and only if there is a Tile at position `(floor(i / sideLength), i % sideLength)`

**Constraints**:
- The Set is strictly derived; never edited between moves.
- It reflects the exact state of `Tile[]` at the moment of derivation.

---

## Key Functions

### buildOccupiedIndices

**Signature**:
```typescript
export function buildOccupiedIndices(
  tiles: Tile[],
  sideLength: number = BOARD_SIZE
): Set<number>
```

**Purpose**: Derive the occupied-Set from the Entity List.

**Behavior**:
1. Iterate through all Tiles.
2. For each Tile, compute `row * sideLength + col` and add to Set.
3. Return the populated Set.

**Time Complexity**: O(t), where t = number of Tiles (at most N²)

**Side Effects**: None (pure function)

---

### findEmptyCells

**Signature**:
```typescript
export function findEmptyCells(
  tiles: Tile[],
  sideLength: number = BOARD_SIZE
): Cell[]
```

**Purpose**: Identify all empty grid positions.

**Behavior**:
1. Call `buildOccupiedIndices(tiles, sideLength)` to get the occupied Set.
2. Iterate through all grid indices [0, sideLength²).
3. For each index not in the Set, recover `(row, col)` and add to result.
4. Return the list of empty Cells.

**Time Complexity**: O(N²) to enumerate all indices; O(1) per-cell membership test (Set lookup)

**Side Effects**: None (pure function)

**Note**: The O(N²) enumeration is unavoidable (you must check all N² positions to know which are empty). The Set optimization reduces per-cell checking from O(grid.length) to O(1).

---

### isBoardFull

**Signature**:
```typescript
export function isBoardFull(
  tiles: Tile[],
  sideLength: number = BOARD_SIZE
): boolean
```

**Purpose**: Determine if all grid positions are occupied.

**Behavior**:
1. Call `buildOccupiedIndices(tiles, sideLength)` to get the occupied Set.
2. Return `occupied.size === sideLength * sideLength`.

**Time Complexity**: O(t) to build the Set; O(1) for the size check. Net: O(t)

**Side Effects**: None (pure function)

**Optimization over naive approach**: Instead of scanning all N² cells to see if any are empty, we compare Set size to N² directly. At N = 4, this is microseconds faster; at larger N, it is measurably faster.

---

## Scope & Integration

### In-Scope Changes

1. **src/services/engine/grid.ts**:
   - Add `buildOccupiedIndices(tiles, sideLength)`
   - Refactor `findEmptyCells(tiles, sideLength)` to use `buildOccupiedIndices`

2. **src/services/engine/status.ts**:
   - Refactor the board-full check in `isLost(tiles, sideLength)` to use `isBoardFull(tiles, sideLength)` from grid.ts

3. **src/services/engine/grid.test.ts**:
   - Add unit tests for `buildOccupiedIndices`: empty board, partial board, full board, index round-trip
   - Add unit tests for `findEmptyCells`: correctness unchanged
   - Add unit tests for `isBoardFull`: correctness unchanged

### Out-of-Scope (Untouched)

- `move.ts`: No Set mutations; Strategy A keeps move logic pure
- `spawn.ts`: Calls `findEmptyCells`; no internal changes
- UI components, hooks, rendering, animations
- Entity List (`Tile[]`) structure or semantics

---

## Type Safety

All functions are typed with TypeScript strict mode:

```typescript
// grid.ts exports
export function buildOccupiedIndices(
  tiles: Tile[],
  sideLength?: number
): Set<number>

export function findEmptyCells(
  tiles: Tile[],
  sideLength?: number
): Cell[]

export function isBoardFull(
  tiles: Tile[],
  sideLength?: number
): boolean

// status.ts integration
export function isLost(
  tiles: Tile[],
  sideLength: number = BOARD_SIZE
): boolean {
  // First check: is the board full?
  if (isBoardFull(tiles, sideLength)) {
    return true;
  }
  // Second check: are any moves possible? (stuck-state evaluation)
  // ... (unchanged)
}
```

---

## Backwards Compatibility

**Observable Behavior**: Unchanged. All existing tests must pass.

**Public API**: Expanded (three new exports), not broken. Consumers calling `findEmptyCells` and any indirect `isLost` checks continue to work identically.

**Internal**: `buildOccupiedIndices` is private implementation detail; no contract breakage.

---

## Testing Strategy

**Unit Tests** (test-first):

1. **buildOccupiedIndices**:
   - Empty board → empty Set
   - Single tile at (0, 0) → Set contains 0
   - Tiles at all four corners → correct indices
   - Full board → Set.size === BOARD_SIZE²
   - Round-trip: (row, col) → index → (row, col) ✓

2. **findEmptyCells**:
   - Empty board → returns all N² Cells
   - Partially filled → returns only true empties
   - Full board → returns empty array
   - Existing tests must pass (no behavioral change)

3. **isBoardFull**:
   - Empty board → false
   - Partially filled → false
   - Full board → true
   - Existing isLost tests must pass

4. **Integration**:
   - Existing spawn tests must pass (findEmptyCells unchanged)
   - Existing loss-detection tests must pass (isBoardFull + isLost unchanged)

**Type Checking**: `yarn tsc --noEmit` must pass (strict mode).

---

## Assumptions & Notes

- Row-major indexing (`index = row * sideLength + col`) is the canonical choice.
- BOARD_SIZE is a compile-time constant (currently 4); functions accept `sideLength` parameter for future flexibility.
- The Entity List is rebuilt each move (standard game state lifecycle); deriving the Set at the same moment is free.
- No long-lived mutable state (Strategy A) keeps correctness risk at zero.
