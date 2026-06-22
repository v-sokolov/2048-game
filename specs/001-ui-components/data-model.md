# Data Model: 2048 Game UI Components

These are the runtime data shapes consumed by the presentational layer. No persistence; all state lives in memory.

## Tile (occupied-tile data — `TileData`)

Represents a single value-bearing game piece on the board.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable unique identifier across moves; used for DOM targeting via `data-tile-id` |
| `value` | `number` | A power of two in the known set; drives the variant CSS class inside `Tile` |
| `row` | `number` | 0-indexed row position on the 4×4 grid (0–3) |
| `col` | `number` | 0-indexed column position on the 4×4 grid (0–3) |

**Constraints**: `id` MUST be stable for the lifetime of a tile (not regenerated on re-render). `value` is one of the known set {2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048}.

## Tile rendering variants

The `Tile` component accepts an **optional** `value` and resolves a variant:

| Input `value` | Variant class |
|---------------|---------------|
| One of 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048 | `tile--{value}` |
| Anything else — out-of-set number (`1`, `3`, `2049`, `4096`), `undefined`, `null` | `tile--empty` (default) |

There is no `tile--super` fallback. `value` is optional, but **`id` is required on every `Tile`** — value-bearing and empty alike (see FR-008): each is a stable, unique identifier exposed as `data-tile-id`, generated once and never regenerated per render.

## Cell (internal concept)

A positional slot in the 4×4 grid. `GridArea` always renders 16 of these; each is a `Tile` — value-bearing when a tile occupies that position, otherwise the empty `Tile` variant. Slot positions are derived internally from the row/col range, not from the tiles array length. `GridArea` assigns every slot (occupied and empty) a stable, unique `id` — for this UI-only phase it synthesizes the ids for all 16 slots once (at module load) from an id-less mock input (`Omit<TileData, "id">[]`), so all 16 slots are addressable; future store-logic will own tile identity and hand `GridArea` ready `TileData[]`.

## ScoreProps

| Field | Type | Notes |
|-------|------|-------|
| `type` | `"score" \| "best"` | Determines displayed label ("Score" or "Best") |
| `value` | `number` | Current score or best score; non-negative integer |

## GameOverlayProps

| Field | Type | Notes |
|-------|------|-------|
| `variant` | `"game-over" \| "you-win"` | Determines message and action label |
| `onAction` | `() => void` | Called when the player clicks the overlay action button |

## State Relationships

```
GridArea (receives TileData[])  — sits on a subtle gap-space background panel
  └── Tile slot[16]  ← always rendered, position = row×col
        ├── value-bearing Tile (matched coordinates)
        └── empty Tile variant (no match)
```

Score and overlay state are siblings to `GridArea` in the parent — they do not flow through the grid.
