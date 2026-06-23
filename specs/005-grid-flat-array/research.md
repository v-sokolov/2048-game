# Research: Flat-Backed Grid Accessor

No NEEDS CLARIFICATION markers in the spec. The decisions below resolve the open design
choices the source brief left to the implementer.

## Decision 1 — Flat row-major storage behind a class

- **Decision**: Back the grid with one contiguous `(T | undefined)[]` of length
  `sideLength * sideLength`, indexed `row * sideLength + col`, wrapped in a `Grid<T>` class
  exposing `sideLength`, `isWithinBounds`, `getCellAt`, `setCellAt`, `forEachCell`.
- **Rationale**: Makes storage shape private and swappable; lets bounds handling live in one
  place. Same complexity as the nested array (O(1) access, O(N²) build/traverse).
- **Alternatives considered**: Keep `(Tile|null)[][]` (rejected — leaks storage, duplicates
  edge guards). Occupancy `Set<number>` for sub-quadratic empty-cell scans (rejected —
  changes complexity, larger scope, explicitly deferred per spec Assumptions).

## Decision 2 — `undefined` is the single absence convention end-to-end

- **Decision**: `getCellAt` returns `undefined` for both empty cells and off-board
  coordinates, and `move.ts` line-space adopts the same convention: `readLine` returns
  `Array<Tile | undefined>` (`line.push(grid.getCellAt({ row, col }))`, no bridge) and
  `collapseLine` filters `!== undefined`. No `null` appears in grid/line space.
- **Rationale**: One absence convention from `Grid` through the line collapse removes the only
  mixed `null`/`undefined` in the engine and the `?? null` bridge. Behaviour is identical
  (proven by the existing engine tests). `MoveResult.spawned` keeps its public `Tile | null`
  shape — that is the frozen engine contract, not line-space.
- **Implementation note**: An earlier draft bridged `getCellAt`'s `undefined` to a legacy
  `(Tile | null)[]` line with `?? null` to minimize churn. The full convergence was adopted
  during implementation because it stayed clear and eliminated the dual convention — exactly the
  "optional only if it stays clear" cleanup the source brief flagged.
- **Alternatives considered**: Make `getCellAt` return `null` (rejected — `undefined` is the
  idiomatic absent for a generic container and composes with `?.value`, which `status.ts` relies
  on; returning `null` would just move the bridging into every caller). Keep the `?? null`
  bridge (rejected — leaves a mixed convention for no behavioural gain).

## Decision 3 — Keep `Grid<T>` generic

- **Decision**: Type-parameterize the class even though it is only instantiated as
  `Grid<Tile>`.
- **Rationale**: The generic is what enforces the encapsulation boundary — the spatial
  container knows nothing about `Tile`; only the two helpers in `grid.ts` do. Cost is zero at
  runtime and near-zero in code. This is not speculative generality (YAGNI/Principle IV): it is
  the mechanism that keeps the layer clean today.
- **Alternatives considered**: Hard-code `Grid` to `Tile` (rejected — couples the container to
  the domain type for no simplification).

## Decision 4 — Adopt the recommended renames

- **Decision**: `buildGrid → buildGridFromTiles`, `getEmptyCells → findEmptyCells`. Update all
  callers (`move.ts`, `status.ts`, `spawn.ts`) and tests; leave no stale identifiers.
- **Rationale**: Names state "from tiles" / "find" honestly; consistent with the project's
  semantic-naming history (Constitution V). No dead aliases (Constitution, no-dead-code).
- **Alternatives considered**: Keep old names for zero churn (rejected — the rename is cheap
  here and improves clarity; the brief recommends it).

## Decision 5 — `isLost` keeps an explicit `for` loop

- **Decision**: `isLost` stays a `for`/`for` loop using `grid.getCellAt`, not `forEachCell`.
  No emptiness guard on `value` — bounds-safe `getCellAt` is enough.
- **Rationale**: `forEachCell` cannot short-circuit; `isLost` must `return false` on the first
  mergeable pair. The early `return false` on a non-full board means `value` is always defined
  inside the loop, and a defined value never `===` an off-grid `undefined`, so neighbour reads
  need no guard — exactly as the original implementation did. Bounds-safe `getCellAt({ row, col: col + 1 })`
  removes the `col + 1 < BOARD_SIZE` guards. (An interim draft added a `value !== undefined`
  guard "to be explicit"; it was removed as provably dead under the full-board precondition —
  Constitution IV/no-dead-code.)
- **Alternatives considered**: Add a `someCell` short-circuit predicate to `Grid` (rejected —
  out of scope, YAGNI; the explicit loop is clear).

## Decision 6 — Board size stays single-sourced

- **Decision**: `Grid` receives `sideLength`; the helpers default it to `BOARD_SIZE` from
  `types.ts`. `BOARD_SIZE` remains the single source of board dimension.
- **Rationale**: Preserves the existing single-source-of-truth (and its `--board-size` CSS
  pairing) without `Grid` hard-coding any dimension.
