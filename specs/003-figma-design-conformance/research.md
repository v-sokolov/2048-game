# Research: Design Conformance Matrix

**Source of truth**: the **Design Requirements** (the FE-test design wireframes), read as documented measured values. The design uses **no shared variables/tokens** — values are baked into each element.

**Legend**: ✅ match · ❌ mismatch (fix) · ⚠️ approximate/accepted-exception · ❓ not yet confirmed (read the value from the Design Requirements during implementation).

---

## Decision 1 — Colour palette: already correct, do not touch

All 11 numbered tile gradients + the 2048 fill + every tile text colour from the Design Requirements are **byte-identical** to the current code (`Tile.module.css`). Decision: **no palette colour changes for tiles.** Rationale: zero measured drift. Alternatives (re-tokenising into variables) rejected per §IV (YAGNI) — colours aren't reused across components enough to justify it, except the brand pair already in `:root`.

| Tile | Design gradient (135°) | Design text | Code | Verdict |
|---|---|---|---|---|
| 2 | #ffcdab→#fcc7a2 | #96694b | same | ✅ |
| 4 | #fcdd9d→#f6d593 | #906f2b | same | ✅ |
| 8 | #c0d2c6→#bed1c5 | #668270 | same | ✅ |
| 16 | #c7caaf→#c5c4a8 | #777755 | same | ✅ |
| 32 | #c5d4ee→#b5c7e5 | #697a97 | same | ✅ |
| 64 | #c5c1e7→#b2b3e0 | #6d6b93 | same | ✅ |
| 128 | #c4abff→#e8a2fc | #8665a3 | same | ✅ |
| 256 | #e69ff1→#ec97db | #a05da1 | same | ✅ |
| 512 | #e995d8→#e497d5 | #8e5081 | same | ✅ |
| 1024 | #f8a8a9→#f79ea0 | #a75253 | same | ✅ |
| 2048 | #795f3b→#6b5432 | #ffffff | same | ✅ |

---

## Decision 2 — Tiles: add elevation + per-digit font size

**Fix the following in `Tile.module.css`:**

| Property | Design Requirements | Code now | Action |
|---|---|---|---|
| Outer drop shadow (2–1024) | `0 1px 2px rgba(67,51,32,0.3)` | *(none)* | ❌ add |
| Outer drop shadow (2048) | `0 1px 2px rgba(0,0,0,0.2)` | *(none)* | ❌ add |
| Soft ambient shadow (all numbered tiles; Empty has none) | warm brown gradient `#A15A1B → #956940`, 20% opacity, ~30px progressive blur — **same asset as the Undo shadow** | *(none)* | ⚠️ add shared `var(--shadow-ambient)` (`0 8px 20px rgba(149,105,64,0.20)`) — chosen approximation, tune visually (accepted exception) |
| Inset shadow | `inset 4px 4px 1px rgba(255,255,255,0.2)`, `inset -4px -4px 2px rgba(0,0,0,0.08)` | white at **0.25** | ❌ align white to **0.2** |
| Font weight | Manrope ExtraBold (800) | 800 | ✅ |
| Font size | design uses 45/42/36/35px per digit-count | flat `cell-size*0.32` | ❌ → uniform `cell-size*0.318` for all (user choice; see decision below) |
| Radius | 12px | 12px | ✅ |

**Font-size decision (user-approved)**: use a **single ratio of `--cell-size` for every tile** — the lowest, `0.318` (= 35/110, the 4-digit/2048 size): `font-size: calc(var(--cell-size, 110px) * 0.318)`. Keeps responsiveness (scales with the tile, handles any board width and any N) and guarantees the longest numbers fit. This is an accepted deviation from the design's per-digit sizing (45/42/36/35px), chosen for uniformity and simplicity over exact per-bucket match.

---

## Decision 3 — New Game button: fix hover, add press

The New Game button defines three states in the Design Requirements: **Default / Hover / Press** (no Disabled). Padding `10px 16px`, radius 12px, text Manrope Bold 14px / line-height 24px / letter-spacing 0.28px / white — all ✅ in code.

| State | Design fill | Code now | Action |
|---|---|---|---|
| Default | #795f3b | #795f3b (`--color-brand`) | ✅ |
| Hover | **#a38b67** | **#6b5432** (`--color-brand-dark`) | ❌ fix — hover is the *lighter* tan, not darker |
| Press | #a38b67 + 12% white overlay ≈ **#ae9979** | *(none)* | ❌ add (US4, last) |
| Disabled | *(not in design)* | opacity 0.45 | keep as-is (implementation-only, FR-005) |

Note: `#a38b67` already exists in `:root` as `--color-text-secondary`. Introduce a semantic `--color-brand-hover: #a38b67` so the button hover reads intentionally rather than borrowing the text colour.

---

## Decision 4 — Undo button: add elevation, fix icon size

The Undo control is a bespoke construction, not a stateful component — the Design Requirements define only its resting appearance.

| Property | Design Requirements | Code now | Action |
|---|---|---|---|
| Size | 72×64 | 72×64 | ✅ |
| Radius | 12px | 12px | ✅ |
| Fill | #fbefdf | #fbefdf | ✅ |
| Inset shadow | `inset 2px 2px 1px rgba(255,255,255,0.2)`, `inset -2px -2px 2px rgba(0,0,0,0.08)` | same | ✅ |
| Crisp drop shadow | `0 1px 2px rgba(0,0,0,0.2)` | *(none)* | ❌ add |
| Soft ambient shadow (**resting**, not hover) | warm brown gradient `#A15A1B → #956940`, 20% opacity, progressive blur ~30px — **same asset as the tile shadow** | *(none)* | ⚠️ add shared `var(--shadow-ambient)` (`0 8px 20px rgba(149,105,64,0.20)`) — chosen approximation, tune visually (accepted exception) |
| Icon size | **32×32** | **24px** | ❌ fix to 32px |
| Hover | *(not in design)* | #fff6e9 | keep as-is (implementation-only) |
| Press | *(not in design for Undo)* | *(none)* | none required; revisit only if user wants parity |

**This is the mismatch the user flagged**: the missing outer/ambient shadow is what makes the code's Undo look flat versus the elevated design.

**Platform (added)**: the design wraps the button in a **platform** — `#EBD8BC` fill, radius `20px`, padding `12px` (→ 96×88). The raised look comes from this platform + padding, not just a shadow. Implemented as a wrapper element (`.platform`) around the button. The shared ambient was also softened to `0 12px 30px rgba(149,105,64,0.22)`. Bug fix: the Undo `.icon` is `pointer-events: none` so the disabled cursor doesn't flicker against the SVG child.

---

## Decision 5 — Empty cell (GridArea) → match the design's "Empty" tile

The "Empty" tile in the Design Requirements: fill **#f5e3cf**, radius 12px, inset `inset 1px 1px 1px rgba(255,255,255,0.2)`, `inset -1px -1px 1px #e5cfb3`.

| Property | Design Empty tile | Code `.cell` | Action |
|---|---|---|---|
| Fill | #f5e3cf | rgba(238,228,218,0.45) | ❌ fix |
| Radius | 12px | `var(--radius,8px)` → 8px | ❌ fix to 12px |
| Inset shadow | yes (see above) | none | ❌ add |
| Board bg / gap / padding | board fill ❓, gap 4px ✅, padding 4px ✅ | #ece0cb, 4px, 4px | gap/padding ✅; board fill ❓ confirm |

---

## Decision 6 — Verify-only / needs confirmation

These appear largely conformant from structure + code; **confirm exact values against the Design Requirements** before closing the audit:

- **Score box** (97×72): code bg `rgba(121,95,59,0.08)` ✅ matches design button tint; padding 16/24, label 14/16 uppercase, value 20/24 — verify label/value colours & exact sizes. ❓
- **Note / caption**: verify font size (14 vs 16) and colour. ❓
- **Logo** (98×44): the design logo is a graphic/symbol; code uses a `clamp()` text size. Verify whether design expects a fixed graphic vs. responsive text. ❓ (low priority)
- **GridArea board fill**: confirm `#ece0cb` against the design. ❓
- **GameOverlay** (game-over overlay): named in FR-001 but **no counterpart exists in the Design Requirements** wireframes (the design has no game-over screen). **Resolution (per user): build it to match the design system** — brand colours/tokens, shared `--radius`, the New Game button style for its action, and elevation/backdrop consistent with the rest of the UI (FR-014).
- **Font (Manrope)**: the design typeface is **Manrope** — free (SIL OFL). It is currently only *named* in `global.css` and **not loaded** (falls back to `system-ui`). Deliver by **self-hosting** `woff2` (weights 500/700/800) with `@font-face`; source the static woff2 from Google Fonts (`fonts.gstatic.com` / google-webfonts-helper). No CDN, no npm package (FR-013).

---

## Decision 7 — Positioning: user-approved scope (FR-008a/b)

The design composition is a fixed 1440-wide desktop layout (header row with logo + score cluster + New Game; centred board; footer with Undo + caption). The implementation is responsive. Screenshot review confirmed the overall structure matches. The user approved correcting these specific items (FR-008a) — read each precise value from the Design Requirements during implementation:

- **Header** — vertical alignment between logo / score cluster / New Game containers; **re-verify at smaller breakpoints** (responsive).
- **Board** — *all* positioning: horizontal centring, vertical offset, outer padding, inter-cell gaps, cell/board dimensions.
- **Footer** — Undo button placement.
- **Spacing** — vertical gaps header ↔ board ↔ Undo.

**Out of scope (FR-008b, leave as-is)**: footer caption placement, Undo ↔ caption gap.

Values still to confirm: header container y-offsets/baseline, board outer position/centring, Undo footer offset. (Board gap/padding already match at 4px.)

---

## Open items rolled into tasks

1. Tiles: outer + ambient shadow, inset white 0.25→0.2, per-digit font ratios.
2. New Game: hover #6b5432→#a38b67; add `--color-brand-hover`.
3. Undo: add drop + ambient shadow; icon 24→32.
4. Empty cell: #f5e3cf, radius 12, inset shadow.
5. Confirm Score/Note/Logo/board-fill; verify GameOverlay (likely gap) — Decision 6.
6. Press states (New Game; Undo only if user wants parity) — **last**, US4/P3.
7. Positioning (FR-008a, user-approved): header vertical alignment + small-breakpoint check; full board positioning; Undo placement; header↔board↔Undo gaps. Leave caption placement + Undo↔caption gap untouched (FR-008b).
