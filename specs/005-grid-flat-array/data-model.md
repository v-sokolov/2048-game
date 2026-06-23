# Data Model: Flat-Backed Grid Accessor

This change touches only the **transient spatial view**. The source-of-truth entities
(`Tile`, `GameState`) in `types.ts` are unchanged.

## Grid<T> (new) — `src/services/engine/grid.ts`

A transient, mutable N×N grid addressed by `(row, col)`, backed by one contiguous row-major
array. Generic over the cell type; absent cells read as `undefined`. Never stored in game state.

| Member | Signature | Notes |
|--------|-----------|-------|
| `cellsByIndex` | `private readonly (T \| undefined)[]` | Single allocation of `sideLength²`; flat index `row * sideLength + col` (via private `cellIndex(cell)`). |
| constructor | `(readonly sideLength: number)` | Allocates the backing array. |
| `isWithinBounds` | `(cell: Cell) => boolean` | True iff `cell` is a real cell. |
| `getCellAt` | `(cell: Cell) => T \| undefined` | Returns `undefined` when empty **or** off-grid. |
| `setCellAt` | `(cell: Cell & { value: T \| undefined }) => void` | Places or clears a cell. |
| `forEachCell` | `(onCell: OnCell<T>) => void` | Row-major visit; positional callback, cannot short-circuit. |

**Conventions**:
- Full-word names: `sideLength` (not `size`), `cellsByIndex` (not `cells`), `getCellAt`/`setCellAt`
  (not `at`/`set`), `isWithinBounds` (not `inBounds`), `forEachCell` (not `forEach`).
- Multi-arg methods take a single typed options object; coordinate args reuse the `Cell` type, so
  `findEmptyCells(...)` output feeds straight into `getCellAt`. The `forEachCell` callback
  (`OnCell<T> = (cell, row, col) => void`) stays positional, like `Array.forEach`.

**Invariants**:
- Storage shape is private — no caller indexes it.
- `getCellAt` is total over all integer `Cell`s: off-grid → `undefined`, never throws.
- Mutable scratch only; `GameState` remains immutable.

## Tile-aware helpers (rebuilt on Grid<T>) — `grid.ts`

```text
type Cell = { row: number; col: number }                         // unchanged

buildGridFromTiles({ tiles, sideLength = BOARD_SIZE }): Grid<Tile>
  → new Grid<Tile>(sideLength); setCellAt({ row, col, value: tile }) for each tile

findEmptyCells({ tiles, sideLength = BOARD_SIZE }): Cell[]
  → buildGridFromTiles({ tiles, sideLength }); forEachCell collect { row, col } where cell is falsy; row-major
```

These two functions are the only place that knows about `Tile`. They replace `buildGrid`
and `getEmptyCells` respectively (old names removed — no aliases).

## Consumers (updated, no behaviour change)

| File | Before | After |
|------|--------|-------|
| `move.ts` `move()` | `buildGrid(state.tiles)` | `buildGridFromTiles({ tiles: state.tiles })` |
| `move.ts` `readLine()` | `grid[row][col]` → `(Tile \| null)[]` | `grid.getCellAt({ row, col })` → `Array<Tile \| undefined>` (no `?? null`) |
| `move.ts` `collapseLine()` | filters `!== null` | filters `!== undefined` (line-space converged on `undefined`) |
| `status.ts` `isLost()` | `buildGrid` + `valueAt` + `col+1 < BOARD_SIZE` guards | `buildGridFromTiles({ tiles })` + `grid.getCellAt({ row, col })?.value`, no edge guards (full board ⇒ value defined; defined ≠ off-grid undefined) |
| `spawn.ts` | `getEmptyCells(state.tiles)` | `findEmptyCells({ tiles: state.tiles })` |

## Out of scope

`someCell` short-circuit predicate; occupancy `Set<number>` for O(t) empty-cell scans;
typed-array / dirty-tracking storage. The `Grid<T>` seam makes these swappable later.
