# Contract: Colour & Token Palette

The canonical design values this feature reconciles against. Tile colours are unchanged (already correct); this contract records the **authoritative** set and the one new semantic token.

## `:root` tokens (global.css)

| Token | Value | Meaning | Change |
|---|---|---|---|
| `--color-brand` | `#795f3b` | primary brand / button default / 2048 start | unchanged |
| `--color-brand-dark` | `#6b5432` | 2048 gradient end | unchanged (stop using for button hover) |
| `--color-brand-hover` | `#a38b67` | **new** — New Game hover fill | **add** |
| `--color-text-secondary` | `#a38b67` | secondary text (Note, Score label) | unchanged (same hex, different role) |
| `--radius` | `12px` | shared corner radius | unchanged |
| `--shadow-ambient` | `0 12px 30px rgba(149,105,64,0.22)` | **new** — shared warm-brown ambient elevation, reused by every numbered tile and the Undo button (design = one asset: `#A15A1B→#956940` @20%, ~30px blur). | **add** |

> `--color-brand-hover` and `--color-text-secondary` share the hex `#a38b67` but are semantically distinct; keep both so intent is explicit (§V Learning-First). Press fill ≈ `#ae9979` (= `#a38b67` under a 12% white overlay).

## Surfaces

| Element | Value |
|---|---|
| Board background | `#ece0cb` (verify ❓) |
| Empty cell fill | `#f5e3cf` |
| Undo / button-tint surface | `rgba(121,95,59,0.08)` |
| Undo button fill | `#fbefdf` |
| Undo platform | `#ebd8bc` (radius 20, padding 12) |

## Elevation (shadows)

| Element | Crisp drop shadow | Ambient shadow (shared ⚠️) | Inset shadow |
|---|---|---|---|
| Tile 2–1024 | `0 1px 2px rgba(67,51,32,0.3)` | `var(--shadow-ambient)` | `inset 4px 4px 1px rgba(255,255,255,0.2)`, `inset -4px -4px 2px rgba(0,0,0,0.08)` |
| Tile 2048 | `0 1px 2px rgba(0,0,0,0.2)` | `var(--shadow-ambient)` | same as above |
| Empty cell | — | — *(none)* | `inset 1px 1px 1px rgba(255,255,255,0.2)`, `inset -1px -1px 1px #e5cfb3` |
| Undo button (resting) | `0 1px 2px rgba(0,0,0,0.2)` | `var(--shadow-ambient)` | `inset 2px 2px 1px rgba(255,255,255,0.2)`, `inset -2px -2px 2px rgba(0,0,0,0.08)` |

⚠️ = the ambient shadow is one reused asset in the Design Requirements (`#A15A1B→#956940` gradient @20%, ~30px progressive blur). It is a single shared token `--shadow-ambient` (warm brown); the CSS value is the **chosen approximation** (fine-tune visually in T009/T024) and is recorded as an accepted exception. Combine ambient + the element's crisp drop in a single comma-separated `box-shadow`. The **Empty** tile has no ambient shadow.

## Typography

| Element | Family | Weight | Size | Line | Tracking |
|---|---|---|---|---|---|
| Tile number | Manrope | ExtraBold 800 | uniform `calc(--cell-size × 0.318)` — all tiles (see research) | normal | — |
| Button label | Manrope | Bold 700 | 14px | 24px | 0.28px |
| Score label | Manrope | 700 | 14px | 16px | uppercase |
| Score value | Manrope | 800 | 20px | 24px | — |
