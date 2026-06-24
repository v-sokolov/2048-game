# Implementation Plan: Design Conformance Audit

**Branch**: `003-figma-design-conformance` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

## Summary

Reconcile the implemented 2048 UI with the **Design Requirements** (the FE-test design wireframes) as source of truth, across three categories: static styling, colour palette, and interactive states. Values are taken from the documented Design Requirements. Approach: a CSS-only pass that corrects measured mismatches in the affected `*.module.css` files and `global.css`; no component behaviour, markup, or game logic changes. A bounded set of **positioning** items is in scope per the user (FR-008a); caption placement and the Undo↔caption gap stay untouched (FR-008b). Press/active state is sequenced last (US4, P3).

**Headline finding**: the colour palette is already correct — all 12 tile gradients/text colours match exactly. The real gaps are **missing elevation (outer drop shadows)** on tiles and the Undo control, a **wrong New Game hover colour**, **per-digit tile font-sizing**, the **empty-cell fill**, and the **absent press state**. See [research.md](./research.md) for the value-by-value matrix.

## Technical Context

**Language/Version**: TypeScript (strict) — unchanged; this feature touches CSS only.

**Primary Dependencies**: none added. Pure CSS Modules + `global.css` per Constitution §Styling.

**Storage**: N/A.

**Testing**: None added. Per Constitution §VI, CSS/visual-style tests MUST NOT be written. Verification is visual — the running app (`preview_*`) compared side-by-side against the design wireframes — plus confirming the existing Vitest suite still passes (no regression).

**Target Platform**: Modern evergreen browser, static build.

**Project Type**: Single-page browser game.

**Performance Goals**: No regression; CSS box-shadows/gradients only, no animation added (press uses CSS `:active`).

**Constraints**: Dependency whitelist enforced; `vite.config.ts` base unchanged; design source = the Design Requirements (some values still to be read per-node during implementation — see research Decision 6).

**Scale/Scope**: ~9 components, 1 palette file. CSS-only.

## Constitution Check

*GATE: re-checked after design below.*

- [x] **I. Game Logic Isolation** — N/A; no engine code touched.
- [x] **II. Test-First** — superseded by §VI for this feature: pure visual styling with no testable logic, so TDD is not applicable. Exception explicitly noted here per §II.
- [x] **III. Incremental Delivery** — each component's correction is independent and leaves the game playable; user stories independently shippable.
- [x] **IV. Simplicity** — direct CSS value edits; no new abstraction. Shared colours promoted to existing `:root` variables only where the design genuinely reuses them.
- [x] **V. Learning-First** — every changed value is justified against a documented design value in research.md.
- [x] **VI. Testing Scope** — no CSS tests authored (compliant). Tasks will carry no test tasks.
- [x] **VII. React Architecture** — no component/props changes beyond the Undo icon size and CSS press rules; no inline literals, no re-render impact (CSS pseudo-classes).
- [x] **VIII. Artifact Brevity** — matrix captured once in research.md; plan stays thin.
- [x] **IX. Layered Architecture** — only the UI (component) layer is touched; no cross-layer changes.
- [x] **Dependency Whitelist** — no packages added.
- [x] **Hosting** — `vite.config.ts` untouched.

**Result**: PASS. No violations; Complexity Tracking not required.

## Project Structure

### Source Code (files this feature will modify)

```text
src/
├── styles/global.css                          # palette vars (button hover/press, shared colours)
└── components/
    ├── Tile/Tile.module.css                   # outer drop shadow, per-digit font-size, inset tweak
    ├── NewGameButton/NewGameButton.module.css # hover colour fix, press state (last)
    ├── UndoButton/UndoButton.module.css        # outer drop shadow, icon size 24→32, press (last)
    ├── GridArea/GridArea.module.css            # empty-cell fill/radius/inset; board positioning
    ├── Score/Score.module.css                  # verify-only (largely conformant)
    ├── Note/Note.module.css                    # verify-only
    ├── Logo/Logo.module.css                    # verify-only (needs confirmation)
    ├── GameOverlay/GameOverlay.module.css      # verify vs design; likely no counterpart → record gap
    ├── App/App.module.css                      # header/footer layout (positioning, FR-008a)
    └── Playground/Playground.module.css        # composition layout (positioning, FR-008a)
```

**Structure Decision**: No structural change. The feature is a styling reconciliation confined to the existing component layer plus the shared `global.css` palette. The App/Playground module CSS is in scope only for the user-approved positioning items (FR-008a). Component boundaries, the engine, hooks, and store are untouched.
