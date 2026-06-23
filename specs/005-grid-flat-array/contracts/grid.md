# Contract: Grid<T> seam & frozen engine API

This is an internal engine refactor. Two contracts apply: the **new** `Grid<T>` public
surface (the swappable seam) and the **frozen** engine API that must not change.

## Grid<T> public surface (new, stable seam)

```ts
export type Cell = { row: number; col: number };
export type OnCell<T> = (cell: T | undefined, row: number, col: number) => void;

export class Grid<T> {
  constructor(readonly sideLength: number);
  isWithinBounds(cell: Cell): boolean;
  getCellAt(cell: Cell): T | undefined;                 // undefined = empty OR off-grid; never throws
  setCellAt(cell: Cell & { value: T | undefined }): void;
  forEachCell(onCell: OnCell<T>): void;                 // positional callback; cannot short-circuit
}

export function buildGridFromTiles(args: { tiles: readonly Tile[]; sideLength?: number }): Grid<Tile>;
export function findEmptyCells(args: { tiles: readonly Tile[]; sideLength?: number }): Cell[];
```

> Multi-argument methods/functions take a single typed options object; coordinate args reuse
> `Cell`, so `findEmptyCells(...)` output composes directly into `getCellAt`. The `forEachCell`
> callback stays positional (idiomatic, like `Array.forEach`).

Contract guarantees:
- `getCellAt` is **total** — any integer `Cell` is valid input; off-grid yields `undefined`.
- Backing storage (`cellsByIndex`, the flat array) is private and MAY change without affecting
  any caller. Spatial logic depends only on the methods above.
- `findEmptyCells` returns empty cells in **row-major order** (unchanged from `getEmptyCells`).

## Frozen engine API (must be byte-for-byte behaviour-identical)

These signatures and their observable behaviour MUST NOT change:

```ts
move(state: GameState, dir: Direction): { state: GameState; result: MoveResult }
isWon(state: GameState): boolean
isLost(state: GameState): boolean
spawnTile(...)   // spawn.ts — unchanged signature & outcome
```

Frozen data shapes: `GameState`, `Tile`, `MoveResult`, `MergeEvent`, `Direction`,
`BOARD_SIZE`, `WIN_VALUE`.

Behavioural guarantees preserved by the refactor:
- Move validity, resulting tile positions, ids, merge provenance, and `scoreGained` identical.
- Invalid (no-change) move still returns the **same** `state` reference.
- `isLost` returns `true` only on a full board with no equal adjacent neighbours; `isWon`
  unchanged.

## Verification gates (see quickstart.md)

- `yarn test` — non-grid behaviour suites green and **unchanged** (no behaviour assertions modified); `grid.test.ts` is rewritten test-first, so the total count shifts.
- `yarn tsc --noEmit` — clean.
- `grep -rn 'grid\[' src/services/engine/` — no nested-index expressions remain.
- `grep -rn 'buildGrid\b\|getEmptyCells' src/ tests/` — no stale identifiers remain.
- `grep -n 'BOARD_SIZE' src/services/engine/status.ts` — no `< BOARD_SIZE` edge guards in `isLost`.
