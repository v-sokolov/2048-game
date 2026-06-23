# Quickstart: Flat-Backed Grid Accessor

How to implement and verify this refactor. TDD-first per Constitution II.

## Build order

1. **Rewrite `tests/services/engine/grid.test.ts` first (RED)** against the new API:
   - `Grid<T>`: construct with a `sideLength`; `getCellAt`/`setCellAt` round-trip; `getCellAt`
     returns `undefined` for empty cells and for off-grid coords (e.g. `-1`, `sideLength`);
     `isWithinBounds` truth table; `forEachCell` visits all `sideLength²` cells row-major.
   - `buildGridFromTiles`: each tile lands at its `(row, col)`; other cells `undefined`.
   - `findEmptyCells`: all cells when empty (row-major, first two `{0,0}`,`{0,1}`); occupied
     cells omitted; `[]` for a full board.
2. **Add `Grid<T>` + helpers in `grid.ts` (GREEN)**; remove `createEmptyGrid`, `buildGrid`,
   `getEmptyCells` (no aliases).
3. **Update consumers**: `move.ts` (`buildGridFromTiles`; `readLine`/`collapseLine` converged on
   `Tile | undefined`, no `?? null`), `status.ts` (`getCellAt`, drop edge guards, add
   no emptiness guard), `spawn.ts` (`findEmptyCells` import).
4. **Refactor** for clarity while the suite stays green.

## Verify (all must pass)

```bash
yarn test                 # non-grid behaviour suites green & unchanged; grid.test.ts rewritten (count shifts)
yarn tsc --noEmit         # clean

# Gates — each should print nothing:
grep -rn 'grid\[' src/services/engine/                 # no nested indexing
grep -rn 'buildGrid\b\|getEmptyCells' src/ tests/      # no stale identifiers
grep -n 'BOARD_SIZE' src/services/engine/status.ts \
  | grep -E 'col \+ 1 <|row \+ 1 <'                     # no manual edge guards in isLost
```

## Acceptance (from spec Success Criteria)

- SC-001/SC-005: behaviour tests pass unchanged; moves identical in position/score/merges.
- SC-002: no `grid[...]` index expressions in `move.ts` / `status.ts`.
- SC-003: no `< BOARD_SIZE` neighbour guards in `isLost`.
- SC-004: storage shape is private behind `Grid` methods.
- SC-006: `yarn test` and `yarn tsc --noEmit` both clean.

## Done

Finish via the Constitution's Finish Flow (PR → merge → keep branch → `git checkout master`
→ `git pull`). Suggested commit:

```
refactor(engine): encapsulate transient grid behind flat-backed Grid<T>
```
