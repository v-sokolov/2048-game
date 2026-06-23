# Research: Occupied-Set Optimization Strategy

**Feature**: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Date**: 2026-06-23

**Status**: Complete

---

## Decision 1: Strategy A vs Strategy B

### Question

How should the occupied-Set be maintained across moves: rebuilt fresh each move (Strategy A) or updated in-place via mutations (Strategy B)?

### Decision: Strategy A (Rebuild Fresh Per Move)

**Chosen**: Yes, implement Strategy A exclusively.

**Rationale**:
- **Zero drift risk**: The Entity List (`Tile[]`) is the single source of truth and is rebuilt every move anyway. Deriving the Set in a single O(t) pass at the same moment keeps them perfectly synchronized.
- **No mutation bookkeeping**: Strategy B requires adding `occupied.add()` and `occupied.delete()` calls to every path in `move.ts` where tiles are placed or removed. Misses are silent bugs. Strategy A avoids this entirely.
- **Correctness guarantee**: Strategy A is trivially correct by construction; the Set is always a faithful snapshot of `Tile[]`.
- **Negligible cost**: Rebuilding a Set of at most 16 items per move (on 4×4) is O(t) ≈ a few microseconds. The existing code already does comparable work; it's free in practice.
- **Future-proof**: As N grows (5×5, 8×8), Strategy A scales cleanly. Strategy B would accumulate more mutation sites and more drift risk.

**Alternatives Rejected**:

| Alternative | Why Rejected |
|-------------|-------------|
| Strategy B (long-lived Set) | Couples move.ts to the Set; high maintenance burden; silent drift risk; only justified by large-N profiling data (absent for 4×4) |
| No Set at all (keep O(N²)) | Contradicts feature spec goal; abandoned in favor of optimization |

---

## Decision 2: Row-Major Indexing Formula

### Question

How should cell positions be mapped to Set indices?

### Decision: `index = row * sideLength + col`

**Chosen**: Yes, standard row-major indexing.

**Rationale**:
- Standard computer science indexing for 2D→1D linearization.
- Inverse is straightforward: `row = Math.floor(index / sideLength)`, `col = index % sideLength`.
- Matches the handoff spec and common 2048 implementations.
- Efficient and cache-friendly on modern CPUs.

**No alternatives were considered**; this is the baseline.

---

## Decision 3: Function Locations and Naming

### Question

Where should `buildOccupiedIndices`, `findEmptyCells`, and `isBoardFull` live, and what should they be called?

### Decision: grid.ts + status.ts; semantic full-word names

**Chosen**: Yes, as specified.

**Rationale**:
- `buildOccupiedIndices` and `findEmptyCells` belong in `src/services/engine/grid.ts` (grid state query functions).
- `isBoardFull` belongs in `src/services/engine/status.ts` (game state evaluation).
- Full-word semantic names (`occupied`, `sideLength`, `buildOccupiedIndices`) ensure clarity and match project conventions (e.g., `BOARD_SIZE`, not `N`).
- No abbreviations reduce cognitive load and improve readability in a learning-first project.

**Alternatives Rejected**: None; this placement and naming aligns with existing architecture.

---

## Summary

All design choices are locked in. Implementation can proceed with no further research.

- ✓ Strategy A chosen for maintainability and correctness.
- ✓ Row-major indexing confirmed.
- ✓ Function locations and names finalized.
