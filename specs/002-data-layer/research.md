# Research: 2048 Data Layer

All decisions below were resolved during the brainstorming session captured in `docs/superpowers/specs/2026-06-22-2048-data-layer-design.md`. No open `NEEDS CLARIFICATION` items remain. Format: Decision · Rationale · Alternatives considered.

## R1 — Board representation: identity-centric `Tile[]` + transient grid

- **Decision**: Store an immutable flat list of *real* tiles (`readonly Tile[]`, each `{ id, value, row, col }`) as the source of truth. Materialize a throwaway `(Tile|null)[N][N]` grid inside `move()` for `O(1)` cell access, then discard it. Empty cells are derived on demand, never stored.
- **Rationale**: Stable per-tile `id` is what enables slide/merge/spawn animation and constant React keys. Stored footprint stays `O(tiles)`; the only `O(area)` structure (grid) is ephemeral, so board size inflates a momentary scratchpad — never the stored state or history. A move is inherently `O(board area)` for any representation (you must inspect every line); the transient grid hits that floor exactly.
- **Alternatives considered**:
  - *Value grid* (`number[N][N]`): simplest move math but no identity → no animation, no stable keys. **Rejected.**
  - *Normalized state* (`byId` map + `layout` id-array): good for shared/heavy entities, but a 2048 tile is `{id,value}` referenced from one place; adds two-structure sync cost and its dense `layout` still scales `O(area)`, so it doesn't even solve scaling. **Rejected.**
  - *Position map* `Map<r*N+c, Tile>`: right only for a *large, mostly-empty* board; at 4×4 it adds Map copy/iteration overhead to save a 16-op grid build. **Rejected for this size.**
  - *Separate real/empty lists*: a free-list is a big-board optimization with sync cost we don't need; on-screen empties are a static UI background layer, not state. **Rejected.**

## R2 — Move algorithm: orient → collapse-each-line → un-orient

- **Decision**: Normalize all four directions to a single "collapse toward index 0" case — *transpose* if vertical (up/down), *reverse* the line if toward the far edge (right/down). Run one `collapseLine` per line via a sequential `lines.map(collapseLine)`, then un-orient and flatten into a new `Tile[]`. Validity is tracked by a local `let isValid = false` that flips on any merge or any tile whose final position differs from its start.
- **Rationale**: One collapse routine instead of four direction-specific ones (Simplicity §IV). Lines are independent (conceptually parallel) but executed sequentially — at 16 cells, real threads/Web Workers cost more than the work. Every step is `O(C)`, the algorithmic floor.
- **Alternatives considered**: Four hand-written per-direction routines (more code, more bug surface — **rejected**); Web Workers for "parallel" lines (overhead dwarfs 16-cell work — **rejected**).

## R3 — Merge identity: merged tile gets a NEW id

- **Decision**: A merge produces a tile with a freshly generated `id`; `MoveResult.merges` reports `sourceIds: [a, b]` and `resultId`.
- **Rationale**: Lets the UI slide both consumed tiles into the merge cell, then unmount them as the new doubled tile pops in. Non-merging slides need nothing extra — the tile keeps its id and animates "for free" via a CSS transform on its changed `row/col`.
- **Alternatives considered**: Reuse one source tile's id for the result (ambiguous animation, which source "wins?" — **rejected**).

## R4 — Randomness: `spawn()` owns `Math.random` internally

- **Decision**: `spawn(state)` is the single impure engine function. It reads `Math.random` directly (no injected RNG argument) for both the 90/10 value split (`SPAWN_4_PROBABILITY = 0.1`) and uniform empty-cell choice. Tests stub via `vi.spyOn(Math, 'random')`.
- **Rationale**: One code path for app and tests (user's explicit call). Keeps signatures clean. `move()` stays fully deterministic and pure; impurity is isolated to this one function and invoked from the hook's event handler.
- **Alternatives considered**: Inject an RNG function for testability (extra parameter threaded everywhere; user reversed this in favor of stubbing the global — **rejected**).

## R5 — Reducer purity & StrictMode

- **Decision**: The reducer is a pure *recorder* — it commits an already-computed, already-valid transition (`COMMIT_MOVE` carries the next `GameState` and the `MoveResult`). It never calls the engine or `Math.random`. The impure work (run move, gate validity, spawn) happens in the hook's `handleMove` before dispatch.
- **Rationale**: React StrictMode double-invokes reducers; a pure reducer is safe under that. Side effects (spawn randomness, persistence) live where effects belong (event handler + `useEffect`).
- **Alternatives considered**: Reducer calls engine + spawn (impure, double-invoke produces two different spawns — **rejected**).

## R6 — Status ownership & win/lose lifecycle

- **Decision**: `status: 'playing'|'won'|'lost'` lives on `GameState` (so undo restores it with the board). The reducer is the **sole authority** on status via a pure `nextStatus(prev, next)` derivation on the post-spawn board: if the previous status is not `'playing'`, keep it unchanged (won and lost are **both terminal**); else `lost` if `isLost(next)`; `won` if `isWon(next)`; else `playing`. The only transition out of `won`/`lost` is `NEW_GAME`; the win/lose overlay's single button starts a new game.
- **Rationale**: Status is part of a board situation, so it travels with the board and undoes correctly. Making won and lost terminal keeps the lifecycle a simple latch — once the board reaches a terminal state it stays there until the player explicitly starts a new game. `isLost` is a direct structural check (full board AND no equal adjacent pairs), never "try all four moves"; `result.isValid` is only the per-move gate, never reused for game-over.
- **Alternatives considered**: A continue-past-win mechanic with a win-acknowledged latch and an extra reducer action (added a dismissible win overlay and an extra reducer case; dropped in favour of a terminal win — **rejected**). Duplicating `status`/`hasWon` at the top level (undo inconsistency — **rejected** during spec self-review).

## R7 — History: immutable array as a stack

- **Decision**: `history: readonly GameState[]`; push via `[...history, current]`, undo via pop. Best score is **not** in history (session scope).
- **Rationale**: `[...history, current]` copies `H` *references* (structural sharing), not snapshots — microseconds for a human game (`H` ≈ hundreds–few thousand). Ordered LIFO with possible duplicate states, which a `Set`/`Map` cannot represent. **Never optimize** for interactive play; the `O(1)` escape hatch (immutable cons-list stack) is noted only for hypothetical non-interactive bulk play.
- **Alternatives considered**: `Set`/`WeakSet` for history (can't represent order or duplicates — **rejected**); mutable `.push()/.pop()` (breaks immutability/structural sharing of snapshots — **rejected**).

## R8 — Persistence seam: best score only (phase 1)

- **Decision**: A `GameStorage` interface (`loadBest(): number`, `saveBest(n): void`; phase-2 `loadGame`/`saveGame` designed-for, not built) with a `localStorage` implementation (namespaced key, `try/catch`, default 0). `useStore` owns lazy load (init) + a save `useEffect`. The pure reducer never touches storage.
- **Rationale**: Keeps persistence out of the pure layers and shaped so full-game resume slots in later without restructuring. A missing/corrupt value degrades gracefully to 0.
- **Alternatives considered**: Persist full game now (out of scope; YAGNI for phase 1 — **deferred**, seam preserved).

## R9 — React composition & re-render hygiene

- **Decision**: `useGame` is the composition root: gets `{state, dispatch}` from `useStore`, runs the engine, gates validity, spawns, dispatches one finished transition. `handleMove` reads `state` directly (recreated on state change, but not a memoized child's prop → no extra re-renders); `undo`/`newGame` are stable `useCallback([dispatch])`. `useInputDirection(onMove)` abstracts input source (keyboard now, touch later). No context in phase 1 — `App` prop-drills `tiles/currentScore/bestScore/status` + actions to `GridArea`/`Score`/`GameOverlay`.
- **Rationale**: Stable callbacks + lowest-common-owner state satisfy Constitution §VII; one render per interaction. Context is YAGNI for a single board (add only if prop-drilling hurts).
- **Alternatives considered**: Context provider now (premature for one board — **deferred**); non-ref closures over state (would force unstable callbacks or stale reads — **rejected**).

## R10 — Immutability mechanics (whitelist-clean)

- **Decision**: `readonly` fields and `readonly T[]` throughout; pure functions return new objects via spread, never mutate inputs. Optional dev-only `Object.freeze` on returned states to catch accidental mutation in tests.
- **Rationale**: Pure TypeScript achieves stable immutability with zero dependencies — `immer`/`immutable.js` are outside the whitelist and unnecessary at this scale.
- **Alternatives considered**: `immer`/`immutable.js`/`zustand`/`redux` (all outside dependency whitelist — **prohibited**).
