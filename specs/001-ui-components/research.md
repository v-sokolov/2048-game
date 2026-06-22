# Research: 2048 Game UI Components

## CSS Modules + Dynamic Tile Variant Classes

**Decision**: Use CSS Modules with bracket-notation dynamic key lookup, defaulting to the empty variant.

```tsx
// Tile.tsx (pattern)
import styles from './Tile.module.css';
const variantClass = styles[`tile--${value}`] ?? styles['tile--empty'];
<div className={`${styles.tile} ${variantClass}`} />
```

**Rationale**: CSS Modules hash class names at build time, but the bracket lookup (`styles['tile--512']`) resolves correctly. A single `.tile--512 { ... }` rule satisfies SC-002 ("restyle by editing exactly one rule"). The `?? styles['tile--empty']` default covers every non-known input — out-of-set numbers (`1`, `3`, `4096`), `undefined`, and `null` — so empty grid slots are just a `Tile` with no value. There is no `tile--super` fallback (removed per Session 2026-06-22 clarification).

**Known variant set**: see [data-model.md](./data-model.md) (the authoritative list).

**Alternatives considered**:
- Global CSS (no modules): loses scoping; ruled out — constitution mandates CSS Modules.
- Inline styles from a JS map: bypasses CSS, breaks the "one CSS rule" restyling contract.
- `clsx`/`classnames` library: not needed; template literal suffices and avoids a new dependency.
- Separate `.cell` `<div>` for empty slots (earlier approach): rejected — Figma models the empty cell as a `Tile` variant (`Type=Empty`), so a single `Tile` renders all 16 slots.

---

## Tile & Cell Visuals (Figma "bluedot")

**Decision**: Each tile variant is a subtle two-stop `linear-gradient` fill plus inner-shadow bevels; the empty variant is a flat `#F5E3CF` with its own bevel. Exact per-variant colours and the gap-space panel colour are taken from the Figma file.

**Rationale**: The design is not flat — tiles have a soft bevel and gradient. Modelling the empty cell as a variant keeps all cell/tile visuals in `Tile.module.css` (single source). `GridArea` carries a subtle background panel so the 4px gap-space reads as a distinct colour from the cells.

---

## Typography (Manrope)

**Decision**: Declare a Manrope-first `font-family` stack in `src/styles/global.css` with a system fallback; defer loading the actual font files.

**Rationale**: The Figma baseline uses Manrope throughout (letter-spacing 2% on text). Adding the real font is a separate decision (self-host / CDN / `@fontsource`) — `@fontsource` would require a dependency-whitelist amendment. Until then the stack falls back to system fonts so sizes/weights/spacing match without a new dependency.

---

## SVG Icon Import (vite-plugin-svgr)

**Decision**: Import `undo.svg` as a React component via `?react` (`vite-plugin-svgr`, whitelist amended v1.8.1). Icon stroke colour (`#A38B67`) lives in the SVG and matches Figma.

---

## Memoization Justification (Tile + GridArea)

**Decision**: `React.memo` on `Tile` and `GridArea` only.

**Rationale**:
- `Tile` — 16 instances (now including empty slots); a single valid move changes 1–2 tiles. Memo prevents 14+ unnecessary re-renders per keystroke.
- `GridArea` — memo prevents the entire 16-tile subtree from re-rendering when only score or undo state changes in a parent.
- All other components either update every valid move by design (`Score`) or are so lightweight that memo overhead exceeds benefit (`Logo`, `NewGameButton`, `UndoButton`, `Note`).

**Constraint**: Parent MUST NOT pass inline object/array/function literals as props to memoized components (Constitution VII). Callbacks and tile arrays must be stabilised with `useCallback`/`useMemo` at the call site — a future concern when logic is wired; for this feature's dummy props it is noted as a constraint.

---

## Dependencies

`vite-plugin-svgr` is the only build addition, allowed via constitution amendment v1.8.1. No runtime dependency is added; Manrope uses a system-font fallback.

---

## Generic `Note` Component & Layout Zones

**Decision**: Replace `FooterNote` with a generic `Note` (renders `children`); `App` supplies content for two instances — a rules note (top) and an author-attribution note (bottom). `Playground` becomes a three-zone vertical layout: rules (top) · game block (centre) · credit (bottom).

**Rationale**: Two near-identical text blocks now exist (rules + credit), so a shared component is justified — this reverses the earlier "footer-specific, abstract later" call now that the YAGNI threshold (concrete duplication) is met. Keeping copy in `App` (not hardcoded in `Note`) keeps the component reusable and content-agnostic.

**Implementation note**: The credit is anchored to the bottom via `margin-top: auto` (or `Playground` using `justify-content: space-between`) while the game block stays vertically centred. All three zones share the responsive `--board-width`.

**Alternatives considered**:
- `variant` prop with hardcoded copy inside `Note`: rejected — couples content to the component, less reusable.
- Keep two distinct components: rejected — duplicates styling for no benefit.
