---
description: "Task list — Design Conformance Audit"
---

# Tasks: Design Conformance Audit

**Input**: Design documents from `/specs/003-figma-design-conformance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/palette.md

**Tests**: NONE. Per Constitution §VI this is pure visual styling — no CSS/visual tests are written. Verification is visual (running app via `preview_*`, side-by-side with the design wireframes) plus confirming the existing Vitest suite stays green (no regression). No new dependencies (Constitution §Tech Stack).

**Source of truth**: the **Design Requirements** (the FE-test design wireframes). A few values are still to be read from the design during implementation (research Decision 6) — use property-panel values or screenshots.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different file, no dependency on an incomplete task → parallelizable
- **[Story]**: US1 styling · US2 colour · US3 hover · US4 press · (Positioning = FR-008a, no story label)

---

## Phase 1: Setup

- [x] T001 Start the dev server and capture a baseline: run the app via `preview_start`, and run `npx vitest run` to confirm the existing suite is green before any change.

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ T003 blocks US2 application (T011) and the Positioning phase (T015–T019). T002 (tokens) blocks the US1 shadow tasks (T004, T006), US3 (T013), and US4 (T020).**

- [x] T002 Add semantic tokens to `:root` in `src/styles/global.css` (see contracts/palette.md): `--color-brand-hover: #a38b67` (distinct from `--color-brand-dark`) and `--shadow-ambient: 0 8px 20px rgba(149,105,64,0.20)` (shared warm-brown ambient elevation reused by numbered tiles + the Undo button).
- [x] T003 Confirm the outstanding design values and record them in `research.md` (Decision 6 + 7): Score box label/value colour & size, Note font-size & colour, Logo, board fill `#ece0cb`; and positioning specifics — header container y-offsets/baseline, board outer position & centring, Undo footer offset. Read from the Design Requirements (property-panel values or screenshots).

**Checkpoint**: token in place; outstanding values confirmed.

---

## Phase 3: User Story 1 — Component styling matches (Priority: P1) 🎯 MVP

**Goal**: Static styling (elevation, shadows, sizing, fonts) matches the Design Requirements. Colours already verified equal (research Decision 1).

**Independent Test**: In the running app, tiles show drop-shadow elevation matching the design tile row; tile numbers are sized per digit-count; the Undo button reads as raised with a fuller icon; empty cells render as `#f5e3cf` rounded squares with a subtle inset.

- [x] T004 [US1] In `src/components/Tile/Tile.module.css`: for every numbered tile (NOT Empty) add the crisp drop shadow per value (2–1024 `0 1px 2px rgba(67,51,32,0.3)`, 2048 `0 1px 2px rgba(0,0,0,0.2)`) plus the shared `var(--shadow-ambient)` (combine comma-separated; warm brown, same asset as Undo; tune visually — accepted exception); align inset white from `0.25` → `0.2`. Depends on T002.
- [x] T005 [US1] In `src/components/Tile/Tile.module.css`: set a single uniform font-size `calc(var(--cell-size, 110px) * 0.318)` for all tiles (lowest/4-digit ratio — user choice; supersedes the per-digit-bucket approach).
- [x] T006 [P] [US1] In `src/components/UndoButton/`: add the **resting** elevation — crisp drop `0 1px 2px rgba(0,0,0,0.2)` + shared `var(--shadow-ambient)` (warm-brown, comma-separated; keep insets); icon `24px`→`32px`; wrap the button in a `.platform` (`#ebd8bc`, radius 20, padding 12) per the design; `.icon { pointer-events: none }` to stop the disabled-cursor flicker. Leave `:hover`/`:disabled` colours untouched. Depends on T002.
- [x] T007 [P] [US1] In `src/components/GridArea/GridArea.module.css`: empty `.cell` → fill `#f5e3cf`, radius `12px`, inset `inset 1px 1px 1px rgba(255,255,255,0.2), inset -1px -1px 1px #e5cfb3`.
- [x] T008 [US1] Build `src/components/GameOverlay/GameOverlay.module.css` to match the design system (FR-014): brand colours/tokens, shared `--radius`, the New Game button style for its `.action` control, and elevation/backdrop consistent with the rest of the UI. (No design counterpart — net-new but style-consistent.)
- [x] T009 [US1] Visually verify US1 vs the design (`preview_screenshot` + side-by-side): elevation, per-bucket font sizes, Undo raise + 32px icon, empty cells. Record verdicts in `research.md`.

**Checkpoint**: styling matches; game still playable.

---

## Phase 4: User Story 2 — Colour palette correct (Priority: P1)

**Goal**: Every colour equals its design value, single-sourced.

**Independent Test**: Each tile 2→2048 shows the correct gradient/text colour (already matching); Score/Note/Logo/board colours match the confirmed design values.

- [x] T010 [US2] Confirm all 12 tile gradient + text colours in `src/components/Tile/Tile.module.css` still equal the design (expected: no change) — record match verdicts in `research.md` Decision 1.
- [x] T011 [US2] Apply any colour drift found in T003 to the relevant files: `src/components/Score/Score.module.css`, `src/components/Note/Note.module.css`, `src/components/Logo/Logo.module.css`, and the board fill in `src/components/GridArea/GridArea.module.css`.
- [x] T012 [US2] Visually verify the palette vs the design; confirm no duplicated colour drifts from its single design value.

**Checkpoint**: palette fully conformant.

---

## Phase 5: User Story 3 — Hover state matches (Priority: P1)

**Goal**: New Game hover matches the design; disabled (implementation-only) preserved.

**Independent Test**: Hovering New Game lightens it to `#a38b67` (not darker); disabled still dims; Undo hover/disabled unchanged.

- [x] T013 [US3] In `src/components/NewGameButton/NewGameButton.module.css`: change `.newGame:hover` background from `var(--color-brand-dark)` to `var(--color-brand-hover)` (`#a38b67`). Leave `:disabled` untouched (no design counterpart, FR-005).
- [x] T014 [US3] Verify hover via `preview` (hover New Game); confirm Undo hover (`#fff6e9`) and both disabled styles are unchanged.

**Checkpoint**: hover conformant.

---

## Phase 6: Positioning (FR-008a — user-approved scope, Priority: P2)

**Goal**: Correct only the user-approved positioning items. Leave caption placement and Undo↔caption gap untouched (FR-008b).

**Independent Test**: Header containers vertically align per the design (and hold at smaller widths); board centring/offset/padding/gaps/dimensions match; Undo sits where the design places it; header↔board↔Undo gaps match.

- [x] T015 Header: vertical-align the logo / score cluster / New Game containers to the design baseline (header container styles in `src/components/App/App.module.css` and/or `src/components/Playground/Playground.module.css`).
- [x] T016 [P] Board: correct centring, vertical offset, outer padding, inter-cell gaps, and dimensions in `src/components/GridArea/GridArea.module.css` / its container, per the confirmed design values (board gap/padding already 4px ✅ — confirm offset/centring).
- [x] T017 [P] Footer: correct the Undo button placement (container styles in `src/components/Playground/Playground.module.css` or `App.module.css`).
- [x] T018 Spacing: set the vertical gaps header ↔ board ↔ Undo to the confirmed design values (same layout file as T015/T017).
- [x] T019 Responsive: verify header alignment and overall layout hold at smaller breakpoints using `preview_resize`; adjust as needed.

**Checkpoint**: approved positioning matches; out-of-scope layout untouched.

---

## Phase 7: User Story 4 — Press/active state added (Priority: P3 — LAST)

**Goal**: Add the New Game press state. Done only after all of the above (US4 is explicitly last).

**Independent Test**: Pressing New Game shows the pressed fill `#ae9979`.

- [x] T020 [US4] In `src/components/NewGameButton/NewGameButton.module.css`: add `.newGame:active` with background `#ae9979` (design = `#a38b67` under a 12% white overlay; an explicit overlay layer is acceptable).
- [x] T021 [US4] Verify the press appearance via `preview` (active state). (Undo press not required — the design defines none for it.)

**Checkpoint**: all design-defined states present.

---

## Phase 8: Polish & Cross-Cutting

- [x] T022 Run `npx vitest run` — confirm the suite is still green (CSS-only changes must not regress behaviour, SC-005).
- [x] T023 React DevTools Profiler quick check (Constitution §VII) — confirm no re-render impact (expected trivially clean: changes are CSS-only, no component/props logic touched).
- [x] T024 Full side-by-side visual diff vs the design per `quickstart.md`; record remaining accepted exceptions (approximate ambient shadows) in `research.md`.
- [x] T025 List any positioning items still divergent and surface to the user (FR-008); do not change anything outside FR-008a.

---

## Phase 9: Clarification Follow-ups (2026-06-23)

- [x] T026 [US1] Self-host **Manrope** (FR-013): download static `woff2` for weights 500/700/800 from Google Fonts (`fonts.gstatic.com` / google-webfonts-helper) into `public/fonts/`, add `@font-face` rules in `src/styles/global.css`, and confirm the rendered text uses Manrope (not the system fallback). Free, SIL OFL — no npm package, no CDN.
- [x] T027 [US1] Tile font-size rounding (FR-015, pending decision): if **round()** chosen, wrap each per-bucket `font-size` in `round(calc(var(--cell-size) * ratio), 1px)` in `src/components/Tile/Tile.module.css`; if **leave-as-is**, no change (sub-pixel is acceptable). Verify computed px after.
- [x] T028 Re-verify after T008/T026/T027: `npx vitest run` green; screenshot GameOverlay + Manrope rendering vs the design.

---

## Dependencies & Execution Order

- **Setup (T001)** → first.
- **Foundational (T002, T003)** → T002 blocks T013/T020; T003 blocks T011 and Phase 6.
- **US1 (T004–T009)** → **MVP**. T004/T006 depend on T002 (the `--shadow-ambient` token); T007 (empty cell) and the rest depend only on Setup. T008 GameOverlay may use T003's confirmation.
- **US2 (T010–T012)** → T011 depends on T003.
- **US3 (T013–T014)** → depends on T002.
- **Positioning (T015–T019)** → depends on T003.
- **US4 (T020–T021)** → depends on T002 AND on all prior phases (explicitly last).
- **Polish (T022–T025)** → after all desired phases.

### Parallel Opportunities

- T006 and T007 are [P] (different files: UndoButton vs GridArea).
- T016 and T017 are [P] (board vs footer container) once T003 is done.
- US1, US2 (colour-verify part), and US3 touch mostly different files and can interleave; only US4 is strictly last.

---

## Implementation Strategy

**MVP** = Phase 1 + 2 + **US1** (the most visible gap: elevation + per-digit fonts + Undo + empty cells). Ship/validate, then layer US2 → US3 → Positioning → US4 (last), then Polish.

## Notes

- No test tasks (Constitution §VI). Verify each phase visually and keep the Vitest suite green.
- Commit after each phase or logical group.
- Ambient (image-based) shadows are approximated in CSS and logged as accepted exceptions.
- A few design values (Decision 6) are read from the Design Requirements during implementation via the property panel or screenshots.
