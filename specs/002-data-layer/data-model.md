# Data Model: 2048 Data Layer

All shapes are immutable (`readonly`). `Tile[]` is the source of truth; the grid is a transient scratchpad, never stored.

## Tile

The unit of board state. Identical shape to the UI's existing `TileData` (reused — engine `Tile` is re-exported, not duplicated).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable across a slide (animation key); a merge result gets a NEW id |
| `value` | `number` | Power of two (2…2048…) |
| `row` | `number` | 0–3 |
| `col` | `number` | 0–3 |

**Rules**: id stable for a tile's lifetime; merge consumes two tiles and produces one with a fresh id (FR-002, FR-005).

## GameState — one board situation (owned by the pure engine)

| Field | Type | Notes |
|-------|------|-------|
| `tiles` | `readonly Tile[]` | Real tiles only; empties derived on demand |
| `score` | `number` | Current game score |
| `status` | `GameStatus` | `'playing' \| 'won' \| 'lost'` — travels with the board so undo restores it |

`type Direction = 'up' | 'down' | 'left' | 'right'`
`type GameStatus = 'playing' | 'won' | 'lost'`

## MergeEvent — one merge, for animation

| Field | Type | Notes |
|-------|------|-------|
| `resultId` | `string` | The new doubled tile |
| `sourceIds` | `readonly [string, string]` | The two consumed tiles |
| `value` | `number` | Resulting (doubled) value |
| `row` / `col` | `number` | Destination cell |

## MoveResult — the animation channel (returned by `move`, spawn filled by the hook)

| Field | Type | Notes |
|-------|------|-------|
| `isValid` | `boolean` | `true` ⇒ ≥1 tile moved or merged (FR-007) |
| `direction` | `Direction` | The attempted direction |
| `scoreGained` | `number` | Sum of merged-tile values this move (FR-006); a slide with no merge gains `0` |
| `merges` | `readonly MergeEvent[]` | Merges that occurred (FR-010) |
| `spawned` | `Tile \| null` | The tile that appeared; filled after the spawn step |

## ReducerState — the session wrapper (owned by the hook/store layer)

> This is the spec's **"Session State"** entity (spec.md → Key Entities). The spec uses the plain-language name; the code/plan/tasks use `ReducerState`. Same thing.

| Field | Type | Notes |
|-------|------|-------|
| `game` | `GameState` | The live board |
| `history` | `readonly GameState[]` | Immutable undo stack; structural sharing |
| `best` | `number` | Persisted; survives New Game and reload (FR-016) |

## Stored Best Score

A single integer behind the `GameStorage` seam (one namespaced `localStorage` key). Missing/corrupt → 0 (FR-016).

## State Transitions

```text
                 invalid move (board unchanged)
                 → no dispatch, no spawn, no history    (FR-009)
                 ┌───────────────────────────────┐
                 │                                ▼
 createInitialState()  ──►  game: playing  ──► handleMove(dir)
   (2 tiles)                     ▲                    │ valid move
        │                        │                    ▼
        │                        │            move() → spawn() → COMMIT_MOVE
   NEW_GAME ◄──────────┐         │                    │
   (keep best,         │         │   history.push(prev); best = max(best, score)
    clear history,     │         │   status = nextStatus(prev, next)
    reset status)      │         │                    │
                       │         │       ┌────────────┼─────────────┐
                       │      UNDO        ▼            ▼             ▼
                       │   (pop history) won        playing        lost
                       │                  │                         │
                       │                  └─ terminal until NEW_GAME ┘
                       └──────────────────┘
```

**`nextStatus(prev, next)`** (pure, reducer-owned): if `prev.game.status !== 'playing'` → keep it (won and lost are both terminal); else `isLost(next)` → `lost`; `isWon(next)` → `won`; else `playing`. The only transition out of `won`/`lost` is `NEW_GAME`.

**Validation rules** (from FRs):
- Move applies slide-then-merge; each tile merges at most once (FR-003, FR-004).
- Spawn only after a valid move; 2 @ ~90% / 4 @ ~10%; uniform empty cell (FR-008).
- Undo unavailable when `history` is empty (FR-014).
- New game = `createInitialState()` (exactly 2 tiles, FR-017) + reset score/history/status, retain `best` (FR-015).
- Every transition returns new objects; prior states never mutated (FR-018).
