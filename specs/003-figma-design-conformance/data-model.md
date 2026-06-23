# Data Model: Design Conformance Audit

This feature has **no runtime data model** — it changes CSS only. The "entities" below are documentation artifacts used to track the audit, not code structures.

## Conformance Finding

One row of the comparison between a design value and its code counterpart.

| Field | Description |
|---|---|
| component | The UI element (Tile, NewGameButton, UndoButton, GridArea cell, Score, Note, Logo). |
| property / state | What is compared — e.g. `hover.background`, `drop-shadow`, `font-size`, `press`. |
| design_value | Documented value from the Design Requirements (source of truth). |
| code_value | Current value in the relevant `*.module.css`. |
| verdict | `match` / `mismatch` / `approximate` / `unmeasured`. |
| resolution | `corrected` / `kept-as-is` / `accepted-exception` / `deferred-to-user` / `re-measure`. |

The complete populated set lives in [research.md](./research.md) (Decisions 1–7).

## Palette Entry

A single design colour and its canonical code reference.

| Field | Description |
|---|---|
| value | Hex/rgba colour. |
| usages | Design elements using it. |
| code_reference | `:root` variable name or the literal in a module file. |

Confirmed palette state: tile colours match exactly (Decision 1). The only palette change is introducing a semantic **`--color-brand-hover: #a38b67`** for the New Game hover/press, distinct from `--color-brand-dark: #6b5432` (which is the 2048 gradient end, not a hover colour). See [contracts/palette.md](./contracts/palette.md).

## State Set (per interactive control)

| Control | Design-defined states | Implementation-only states |
|---|---|---|
| New Game button | Default, Hover, Press | Disabled (kept, FR-005) |
| Undo button | Default only | Hover, Disabled (kept) |

No "Disabled" exists in the Design Requirements; it is preserved, not matched.

**Disabled triggers (behaviour, in `App.tsx`)**: Undo is disabled when `isEmptyHistory || isGameOver` (nothing to undo, or game over); New Game is disabled when `isEmptyHistory`. The disabled *styling* stays implementation-only; these note *when* the state applies.
