# Quickstart: Verifying Design Conformance

No automated tests are added (Constitution §VI — visual styling). Verification is visual + regression.

## 1. Run the app

```bash
yarn dev          # or the preview_* tooling
```

## 2. Confirm no regression

```bash
npx vitest run     # existing suite MUST stay green — this feature changes CSS only
```

## 3. Visual check per component (against the design)

Compare each corrected component side-by-side with its design wireframe (text/content ignored, FR-007):

- **Tiles** — each value 2→2048 shows the correct gradient (already matching), now with a visible drop shadow / elevation, and the number sized per its bucket (low values larger). Empty cells read as `#f5e3cf` rounded squares with a subtle inset.
- **New Game button** — default brand `#795f3b`; **hover lightens to `#a38b67`** (not darker); disabled still dims.
- **Undo button** — now visibly **raised** (drop + ambient shadow), icon fills more of the button (32px).
- **Score / Note / Logo** — confirm against re-measured values (research Decision 6).

## 4. Press state (last — US4)

After all of the above: New Game shows a pressed fill (`#ae9979`) on `:active`.

## 5. Positioning

Any layout/placement difference from the 1440-wide design composition is corrected only for the user-approved items (FR-008a); anything else is **listed and brought to the user**, not changed unilaterally (FR-008/008b).

## Done criteria

- Existing Vitest suite passes (no behaviour change).
- Each finding in [research.md](./research.md) is `corrected`, `kept-as-is`, `accepted-exception`, or `deferred-to-user`.
- No styling/colour/state difference remains outside recorded exceptions (SC-006).
