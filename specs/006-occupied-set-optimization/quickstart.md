# Quickstart: Occupied-Set Optimization

**Feature**: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Branch**: `006-occupied-set-optimization`

**Date**: 2026-06-23

---

## What This Feature Does

Replaces O(N²) grid scans with Set-backed lookups to speed up:
1. **Board-full check** (in `isLost`): from O(N²) to O(1)
2. **Empty-cell discovery** (in spawn): from O(N²) to O(t), where t = tiles present

No observable behavior change. All existing tests pass.

---

## Key Implementation Points

### Strategy A: Rebuild Set Fresh Per Move

The occupied-Set is **never mutated**. Instead, it is rebuilt fresh from the Entity List (`Tile[]`) each move:

```typescript
// Phase 0 of every game move:
const occupied = buildOccupiedIndices(tiles);  // O(t) — where t = tiles on board

// Phase 1: Query the Set for spawn and loss detection
const empties = findEmptyCells(tiles);         // O(N²) enumeration; O(1) per-cell test
const isFull = isBoardFull(tiles);             // O(1) size comparison
```

**Why Strategy A?**
- Simpler than Strategy B (long-lived Set with mutations)
- Zero drift risk (Set is always a faithful snapshot of `Tile[]`)
- No bookkeeping required in `move.ts`
- Cost is negligible at N=4 (a few microseconds) and scales cleanly for larger N

### Row-Major Indexing

```typescript
// Cell (row, col) maps to index:
const index = row * sideLength + col;

// Reverse:
const row = Math.floor(index / sideLength);
const col = index % sideLength;
```

### Three New Functions (All Pure, No Side Effects)

```typescript
// grid.ts
export function buildOccupiedIndices(tiles: Tile[], sideLength = BOARD_SIZE): Set<number>
export function findEmptyCells(tiles: Tile[], sideLength = BOARD_SIZE): Cell[]

// grid.ts (imported and used in status.ts)
export function isBoardFull(tiles: Tile[], sideLength = BOARD_SIZE): boolean
```

---

## Scope: What Changes

**Modified Files**:

1. **src/services/engine/grid.ts** (primary):
   - Add `buildOccupiedIndices(tiles, sideLength)` — build the Set
   - Refactor `findEmptyCells(tiles, sideLength)` — use the Set for membership testing
   - Add `isBoardFull(tiles, sideLength)` — check Set size

2. **src/services/engine/status.ts** (secondary):
   - Refactor `isLost` to call `isBoardFull(tiles)` before the stuck-state check

3. **src/services/engine/grid.test.ts**:
   - Add unit tests for all three functions
   - Existing tests must pass unchanged

**Untouched Files**:

- `src/services/engine/move.ts` — No Set mutations; strategy A keeps move logic pure
- `src/services/engine/spawn.ts` — Calls `findEmptyCells`; behavior unchanged
- All UI, hooks, rendering, animations

---

## Testing Checklist

Before committing, verify:

- [ ] `yarn test` passes all 79 tests (no new test failures)
- [ ] New unit tests cover: empty board, partial board, full board, index round-trip
- [ ] `yarn tsc --noEmit` is clean (strict TypeScript)
- [ ] Game remains playable: spawn works, loss detection works, no observable changes
- [ ] All existing spawn tests pass (findEmptyCells behavior unchanged)
- [ ] All existing loss-detection tests pass (isBoardFull + isLost behavior unchanged)

---

## Key Invariants

1. **Occupied-Set matches Entity List**: `occupied.size === tiles.length` always
2. **Index calculation is correct**: `row * sideLength + col` for (row, col) → index; inverse recovers row/col accurately
3. **No long-lived state**: Set is rebuilt each move; never mutated between moves
4. **No move.ts coupling**: `buildOccupiedIndices` is used only in grid.ts and status.ts

---

## Next Steps

1. Run `/speckit-tasks` to generate the task list
2. Implement tasks in TDD-first order:
   - Setup tests for buildOccupiedIndices (empty, partial, full, round-trip)
   - Implement buildOccupiedIndices
   - Refactor findEmptyCells
   - Implement isBoardFull
   - Integrate into status.ts
3. Verify all tests pass and game is playable
4. Commit and merge per the project's Finish Flow

---

## Key References

- **Spec**: [spec.md](spec.md) — full requirements and acceptance criteria
- **Data Model**: [data-model.md](data-model.md) — entity definitions, function signatures, invariants
- **Research**: [research.md](research.md) — Strategy A vs B decision rationale
- **Constitution**: Project's foundational principles (TDD-first, Game Logic Isolation, etc.)
