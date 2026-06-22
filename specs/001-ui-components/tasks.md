# Tasks: 2048 Game UI Components

**Input**: `specs/001-ui-components/` — plan.md, spec.md, data-model.md, research.md
**Tasks**: 31 (T001–T031)

**Tests**: Tile only (TDD — variant derivation + empty-default fallback). All other components are rendering-glue exceptions.

**CSS Tests**: None (Constitution VI).

> **Note**: All 31 tasks complete (Phases 1–10). Key evolutions: empty cell modelled as a `Tile` variant; generic `Note` (rules between header/grid + credit pinned to bottom); 3-zone `Playground`. Type-check clean, tests green.

---

## Phase 1: Setup

**Purpose**: Shared types that block Tile and GridArea implementations.

- [X] T001 Create `src/types/index.ts` — export `TileData { id: string; value: number; row: number; col: number }`

**Checkpoint**: Types available — all Phase 2 tasks can proceed.

---

## Phase 2: Foundational — Component Scaffolds

**Purpose**: Create all 9 component shells (.tsx + .module.css). Tile gets full TDD treatment; the rest are rendering-glue stubs. A single global barrel `src/components/index.ts` re-exports all components (`NewGameButton` and `UndoButton` also have a per-component `index.ts`).

**⚠️ CRITICAL**: T010 → T011 sequential; T009 depends on T011 + T014 (needs the empty variant).

- [X] T002 [P] Scaffold `src/components/Playground/` — `Playground.tsx` (wraps `children` in a full-viewport `<div>`), `Playground.module.css` *(no test: rendering glue)*
- [X] T003 [P] Scaffold `src/components/Logo/` — `Logo.tsx` (renders "2048"), `Logo.module.css` *(no test: rendering glue)*
- [X] T004 [P] Scaffold `src/components/Score/` — `Score.tsx` (renders `type` label above `value`), `Score.module.css` *(no test: rendering glue)*
- [X] T005 [P] Scaffold `src/components/NewGameButton/` — `index.ts`, `NewGameButton.tsx` (`<button onClick={onClick}>New Game</button>`), `NewGameButton.module.css` *(no test: rendering glue)*
- [X] T006 [P] Scaffold `src/components/UndoButton/` — `index.ts`, `UndoButton.tsx` (button with `<UndoIcon>` from `@assets/undo.svg?react`; `onClick`, `isDisabled` props), `UndoButton.module.css` *(no test: rendering glue)*
- [X] T007 [P] Scaffold the note component (built as `FooterNote`; renamed to `Note` in Phase 10) — renders the author-attribution credit + GitHub/LinkedIn links; `*.module.css` *(no test: rendering glue)* (FR-010)
- [X] T008 [P] Scaffold `src/components/GameOverlay/` — `GameOverlay.tsx` (variant-specific message + `<button onClick={onAction}>`), `GameOverlay.module.css` *(no test: rendering glue)*
- [X] T009 [P] `src/components/GridArea/GridArea.tsx` (in `React.memo`, accepts `tiles: TileData[]`) — render a `<Tile>` for every one of the 16 fixed slots (iterate row/col 0–3); every slot gets a stable generated `id` (`crypto.randomUUID`, once at module load — baked into `POSITIONS`); occupied slots also carry a `value`. Mock input is id-less (`Omit<TileData, "id">[]`); the future data layer hands over ready `TileData[]`. No separate `.cell` element. *(no test: rendering glue)* (FR-006, FR-008, FR-013)
- [X] T010 Write `src/components/Tile/Tile.test.tsx` (TDD RED) — assert: value `512` → class `tile--512`; `2048` is a defined variant (not fallback); an unknown/absent value (e.g. `2049`, `undefined`) → class `tile--empty`; `data-tile-id` present on every tile, empty included (SC-004, SC-005)
- [X] T011 Implement `src/components/Tile/` — `index.ts`, `Tile.tsx` in `React.memo`: required `id`, optional `value` (`TileProps`); derive `styles[\`tile--${value}\`] ?? styles['tile--empty']`; render the number only when a value is present; always set `data-tile-id`; all T010 tests pass (TDD GREEN) (FR-007, FR-008, FR-009)

**Checkpoint**: All 9 component shells exist; Tile fully tested against the clarified rules.

---

## Phase 3: User Story 1 — View the Game Board (P1) 🎯 MVP

**Goal**: Player opens the app and sees all component regions correctly arranged.

**Independent Test**: `yarn dev` → Playground fills viewport; Logo, two Score tiles, GridArea (16 cells), rules `Note` (top) and credit `Note` (bottom) all visible; New Game in top row, Undo below grid; no console errors.

- [X] T012 [US1] Update `src/components/App/App.tsx` — `const DUMMY_TILES: Omit<TileData, "id">[]` at module scope (value + position only; ids synthesized in GridArea); compose all 9 components
- [X] T013 [US1] Style `src/components/Playground/Playground.module.css` — full-viewport container; layout `[Logo][Score Score][New Game]` → `[Grid]` → `[Undo]` → `[Footer]`; responsive 320–1440px; radial-gradient background per Figma

**Checkpoint**: US1 independently verifiable — open `yarn dev` and inspect the board.

---

## Phase 4: User Story 2 — Tile Variants (P2)

**Goal**: All known tile values are visually distinct; empty default for everything else.

**Independent Test**: Render all variants + an empty slot; each has a distinct appearance.

- [X] T014 [US2] `src/components/Tile/Tile.module.css` — base `.tile` (radius 12px, bevel inner-shadows) + `.tile--2 … .tile--1024` and `.tile--2048` (bluedot gradients) + `.tile--empty` default (flat `#F5E3CF` + bevel). Remove `.tile--super`. One rule per variant (SC-001, SC-002)

**Checkpoint**: Run `yarn vitest run`; visually inspect all variants + empty.

---

## Phase 5: User Story 3 — Score Display (P3)

**Goal**: Score renders label + value legibly; large numbers do not overflow.

- [X] T015 [US3] Style `src/components/Score/Score.module.css` — translucent brown box (`#795F3B @ 8%`), radius 12px, label `#A38B67` uppercase, value `#795F3B`; overflow-safe (SC-006)

**Checkpoint**: Score tiles legible at all dummy values.

---

## Phase 6: User Story 4 — Game Controls (P4)

**Goal**: New Game and Undo buttons are visually distinct; Undo renders a disabled state.

- [X] T016 [P] [US4] Style `src/components/NewGameButton/NewGameButton.module.css` — brand brown `#795F3B`, radius 12px, padding 10/16
- [X] T017 [P] [US4] Style `src/components/UndoButton/UndoButton.module.css` — 72×64, radius 12px, cream `#FBEFDF`, inner-shadow bevel; `:disabled` state; icon sized via `.icon`

**Checkpoint**: Both buttons visible and differentiated.

---

## Phase 7: User Story 5 — Game-State Overlay (P5)

**Goal**: GameOverlay covers the grid, shows a contextual end-state message, exposes an action button.

- [X] T018 [US5] Style `src/components/GameOverlay/GameOverlay.module.css` — absolute overlay; distinct message per variant; brand-styled action button

**Checkpoint**: Both overlay variants render correctly.

---

## Phase 8: Infrastructure & Polish

- [X] T019 Update `src/components/App/App.tsx` dummy board for realistic visual verification
- [X] T020 React DevTools Profiler audit — only the changed tile re-renders; GridArea stays stable (Constitution VII)
- [X] T021 Add `src/assets/undo.svg`; install `vite-plugin-svgr` (constitution amendment v1.8.1); register `svgr()` in `vite.config.ts`; add `/// <reference types="vite-plugin-svgr/client" />` to `vite-env.d.ts`
- [X] T022 Add TS path aliases `@components/*` / `@assets/*` to `tsconfig.json` + `vite.config.ts`; add `vitest/globals`; remove test-file exclusions; add global `src/components/index.ts` barrel

---

## Phase 9: Figma Design Alignment (Session 2026-06-22)

**Goal**: Bring the visual layer to the Figma "bluedot" baseline. (The empty-as-Tile / variant-set changes live in their canonical tasks T009–T011, T014.)

- [X] T023 Add global Manrope-first font stack + reset in `src/styles/global.css`; import it in `src/main.tsx` (typography deferred — system fallback, no dependency)
- [X] T024 Recolour to bluedot: Playground radial-gradient background; Logo `#795F3B`; Score, NewGameButton, UndoButton, GameOverlay palette; header layout `[Logo][Scores][New Game]` with mobile wrap (`src/components/App/App.module.css`)
- [X] T025 Style the note text (now `Note.module.css`) — `#A38B67`, centred, Figma typography *(carried into `Note` in Phase 10)*
- [X] T026 Verify: browser at desktop/mobile confirms empty / `2048` / out-of-set rendering and gap-space distinct from cells; `yarn vitest run` → 6 passed. **Note**: on Node 22.11 the runner needs `NODE_OPTIONS=--experimental-require-module` (jsdom→html-encoding-sniffer→ESM `@exodus/bytes`); resolved natively by Node ≥22.12 / ≥20.19 (Constitution VII; SC-003, SC-006)

**Checkpoint**: Implementation matches the clarified spec and Figma baseline.

---

## Phase 10: Note Restructure & 3-Zone Layout (Session 2026-06-22)

**Goal**: Evolve the single bottom footer into a generic `Note` (renders `children`) used twice — a rules note at the top and an author-attribution note pinned to the bottom — with `Playground` arranging three vertical zones (rules · game · credit).

**Independent Test**: `yarn dev` at 320–1440px → rules note at the top (above the header), game block centred, "made by" note pinned to the bottom of the viewport; no horizontal scroll; `yarn vitest run` green.

- [X] T027 Rename `src/components/FooterNote/` → `src/components/Note/`; `Note.tsx` becomes generic, rendering `children` (`NoteProps { children: React.ReactNode }`); `Note.module.css` keeps the centred muted-text (`#A38B67`) + link styling; update the `src/components/index.ts` barrel to export `Note` (remove `FooterNote`) (FR-010)
- [X] T028 [US1] **Note (rules)** — in `src/components/App/App.tsx`, render a `<Note>` with the how-to-play copy (arrow keys / swipe to slide; equal tiles merge; reach 2048) **between the header and the grid** (inside the centred game block, not pinned)
- [X] T029 [US1] **Note (credit)** — in `src/components/App/App.tsx`, render a `<Note>` with the author attribution ("Made by …" + GitHub / LinkedIn links) as the **last** child of `Playground`; remove the old combined footer
- [X] T030 [US1] Update `src/components/Playground/Playground.module.css` — centre the game block (header · rules · grid · undo) and pin the credit note to the bottom via auto margins (`:first-child` + `:last-child` `margin-top: auto`); nothing pinned at the top; preserve `--board-width` and responsive padding
- [X] T031 Verify in browser (320–1440px) + `yarn vitest run`: rules top, game centred, credit pinned to bottom, no overflow (SC-003, SC-006)

**Checkpoint**: Layout matches the clarified 3-zone spec; `Note` is generic and reused.

---

## Execution Order (all phases complete)

Phase 1 → Phase 2 (T001 first; **T010 → T011** TDD; **T014 → T009** for the empty variant) → Phase 3 (MVP: full board) → Phases 4–8 (variant colours, score/button/overlay styling, memo + infra) → Phase 9 (Figma bluedot alignment) → Phase 10 (`Note` restructure + 3-zone layout). All 31 tasks done; `tsc --noEmit` clean, `yarn vitest run` green.

---

## Notes

- `[P]` = different files, no shared state — safe to run in parallel
- `[USn]` = maps to User Story n in spec.md
- Never write CSS test assertions (Constitution VI)
- Constitution VII: no inline object/array/function literals as props to `Tile` or `GridArea` — use module-scope constants (T012); stabilise with `useMemo`/`useCallback` when an in-memory service replaces dummy data
- Tile variant list & fallback rules: see `data-model.md` (authoritative)
- `*(no test: rendering glue)*` — marks tasks intentionally exempt from TDD per Constitution II exception clause
