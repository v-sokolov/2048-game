# Feature Specification: 2048 Game UI Components

**Feature Branch**: `001-ui-components`

**Created**: 2026-06-21

**Status**: Ready

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View the Game Board (Priority: P1)

A player opens the 2048 game and sees a complete, styled game board with all interactive and display elements rendered in their correct positions.

**Why this priority**: Without a visually coherent board, no other interaction is possible. This is the foundation all other stories depend on.

**Independent Test**: Launch the app in a browser and confirm all component regions are visible and correctly arranged — logo, scores, action buttons, grid area, and footer — without any game logic wired up.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the page renders, **Then** the Playground fills the viewport: the game block (Logo, Scores, New Game, rules `Note`, Grid, Undo) is centred — with the rules `Note` between the header and the grid — and the "made by" `Note` is pinned to the bottom.
2. **Given** the page renders, **When** a player inspects the layout, **Then** the top row shows Logo, Score (current), Score (best), and New Game button left-to-right.
3. **Given** the page renders, **When** a player inspects the layout, **Then** the Undo button appears in its own row below the Grid.
4. **Given** the page renders, **When** a player inspects the layout, **Then** the 4×4 Grid area displays 16 cells over a subtle background panel; occupied cells show a value Tile, empty cells show the empty Tile variant.
5. **Given** the page renders, **When** a player inspects the layout, **Then** the rules `Note` is visible between the header and the grid, and the "made by" `Note` is pinned to the bottom of the viewport.

---

### User Story 2 — Identify Tile Values at a Glance (Priority: P2)

A player can instantly distinguish tile values (2 through 2048) by their distinct appearance — each power-of-two value has a unique visual style.

**Why this priority**: Core gameplay feedback depends on visual differentiation. A player must never confuse a 2-tile with a 512-tile.

**Independent Test**: Render all tile variants (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048) plus an empty slot on screen simultaneously with dummy data and confirm each has a distinct appearance.

**Acceptance Scenarios**:

1. **Given** a Tile with value `2`, **When** rendered, **Then** it displays a specific background and text color distinct from all other tile values.
2. **Given** tiles with values `2`, `4`, `8`, `16`, `32`, `64`, `128`, `256`, `512`, `1024`, `2048`, **When** all rendered together, **Then** no two different values share an identical visual style.
3. **Given** a Tile whose value changes, **When** re-rendered, **Then** its visual style updates to match the new value without a page reload.
4. **Given** a Tile with no value (or a value outside the known set), **When** rendered, **Then** it shows the default empty variant.

---

### User Story 3 — Track Current and Best Score (Priority: P3)

A player sees their current score and their all-time best score updated in dedicated score tiles.

**Why this priority**: Score awareness is a core retention mechanic. The UI must accommodate score display even before logic is wired.

**Independent Test**: Render the Score component in two variants — "Score" with a dummy current value and "Best" with a dummy best value — and confirm both labels and values are legible.

**Acceptance Scenarios**:

1. **Given** a Score with label "SCORE" and value `0`, **When** rendered, **Then** both the label and the numeric value are visible.
2. **Given** a Score with label "BEST" and value `1024`, **When** rendered, **Then** both the label and numeric value are visible and visually consistent with the "SCORE" tile.
3. **Given** a Score value changes, **When** re-rendered, **Then** the new value is shown without layout shift.

---

### User Story 4 — Access Game Controls (Priority: P4)

A player can see and interact with the New Game and Undo buttons.

**Why this priority**: Control affordances must be present in the UI layer even before they trigger game logic.

**Independent Test**: Render the New Game and Undo buttons in isolation; verify they are visible, labeled, and accept a click handler prop without errors.

**Acceptance Scenarios**:

1. **Given** the top row renders, **When** a player sees the New Game button, **Then** it is clearly labeled and visually distinct as a primary action.
2. **Given** the Undo row renders (below the Grid), **When** a player sees the Undo button, **Then** it is clearly labeled and visually distinct from the New Game button.
3. **Given** either button receives a click, **When** an `onClick` handler is provided, **Then** the handler is called once per click.

---

### User Story 5 — View Game-State Overlay (Priority: P5)

When the game ends (loss or win), a contextual overlay covers the grid area indicating the outcome and offering a retry action.

**Why this priority**: End-state communication is essential to the gameplay loop. The overlay is a presentational component — it must exist before logic drives it.

**Independent Test**: Render the GameOverlay component in "game-over" mode and in "you-win" mode, confirm distinct messages appear, and confirm a "Try Again" / "Continue" action is available.

**Acceptance Scenarios**:

1. **Given** the overlay is rendered with a `game-over` variant, **When** displayed, **Then** a message communicates the loss and a retry action is present.
2. **Given** the overlay is rendered with a `you-win` variant, **When** displayed, **Then** a message celebrates reaching 2048 and a continue or retry action is present.
3. **Given** the overlay renders, **When** a player clicks the action button, **Then** the provided `onAction` handler is called once.

---

### Edge Cases

- What happens when a Tile receives a value not in the known set (e.g., `1`, `3`, `4096`) or no value at all? It renders the default empty variant — there is no separate "super-tile" style.
- What happens when Score receives a very large number (e.g., `999999`)? The layout must not overflow or truncate the number unexpectedly.
- What happens when `GridArea` receives 0 or few tiles? All 16 fixed cell slots still render — empty slots use the empty `Tile` variant. The slot layout is unconditional and derived from row/col positions, not from the tiles array length.
- What happens when Undo button is disabled (no moves to undo)? It must render in a visually disabled state that still accepts but ignores clicks.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a `Playground` component that acts as a full-viewport styled wrapper for all game UI.
- **FR-002**: The system MUST render a `Logo` component that displays the branded "2048" identity mark.
- **FR-003**: The system MUST render a `Score` component accepting a `type` (`"score"` | `"best"`) and a numeric `value` prop. The `type` determines the displayed label ("Score" or "Best").
- **FR-004**: The system MUST render a `NewGameButton` component that accepts an `onClick` handler prop.
- **FR-005**: The system MUST render an `UndoButton` component that accepts `onClick` and an `isDisabled` prop.
- **FR-006**: The system MUST render a `GridArea` component that accepts a list of tiles and renders a fixed 4×4 layout of 16 cell slots over a subtle background container (whose colour fills the gap-space between cells, distinct from the empty cells). Each slot always occupies its grid position (row 0–3 × col 0–3) and renders a `Tile`: a value-bearing `Tile` when a tile with matching coordinates is present, otherwise the empty `Tile` variant. `GridArea` MUST supply every slot — occupied and empty — with a stable, unique `id` (FR-008); for this UI-only phase it synthesizes the ids for all 16 slots once (at module load) and the mock input carries no ids, while a future data layer will own all tile identity (handing `GridArea` ready `TileData[]`).
- **FR-007**: The system MUST render a `Tile` component accepting an optional numeric `value` and applying a variant-specific visual style. The known values 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048 each map to a distinct variant; any other input (an out-of-set number, `undefined`, or `null`) renders the default empty variant.
- **FR-008**: Every `Tile` — value-bearing **and** empty — MUST receive a stable, unique `id` prop and expose it as a `data-tile-id` attribute, enabling future store-logic and DOM/animation targeting of all 16 slots. The `id` is **required** (not optional) and MUST be stable for the slot's lifetime — generated once, never regenerated on re-render (a per-render id would break the memoization mandated by FR-012 / Constitution VII).
- **FR-009**: `Tile` MUST derive its variant CSS class internally from its `value` prop (e.g., value `512` → class `tile--512`); any value outside the known set — and a missing value — resolves to the default empty variant class. No parent component passes a class name or variant prop for this purpose. This makes `value` the single source of truth for appearance and enables straightforward test cases: given a known value, assert the expected class is present; given an unknown or absent value, assert the empty class is present.
- **FR-010**: The system MUST render a generic `Note` component that renders arbitrary `children` as a styled note. `App` uses it twice: a **rules note** placed between the header and the grid (within the centred game block) and an **author-attribution note** ("made by" credit plus external profile links, e.g. GitHub / LinkedIn) pinned to the bottom of the viewport.
- **FR-011**: The system MUST render a `GameOverlay` component accepting a `variant` (`"game-over"` | `"you-win"`) and an `onAction` handler prop.
- **FR-012**: `Tile` and `GridArea` MUST be wrapped with memoization. `Tile` has 16 instances per board and only 1–2 change per move — memoizing the rest prevents unnecessary re-renders. `GridArea` MUST be memoized so the entire grid subtree remains stable when unrelated state (e.g., score, undo availability) changes in the parent. All other components (`Score`, `Logo`, `Note`, `UndoButton`, `NewGameButton`) are exempt: they either re-render by design (score changes every valid move) or are so lightweight that memo overhead outweighs any benefit.
- **FR-013**: The `GridArea` MUST always render exactly 16 cell slots at fixed positions (rows 0–3 × cols 0–3). Slot presence is unconditional — a slot with no matching tile renders the empty `Tile` variant, not absent from the DOM.

### Key Entities

- **Tile**: A single game piece with an optional numeric value. Known powers of two from 2 to 2048 map to a dedicated visual variant; any other value (or none) maps to the empty variant. **Every** tile — value-bearing or empty — carries a stable, unique identity (`id`), so all 16 slots are addressable by future store-logic and DOM targeting.
- **Cell**: A slot in the 4×4 grid, realized as a `Tile` — value-bearing when occupied, the empty `Tile` variant otherwise. Identified by its row/column position and its own stable `id`.
- **Score**: A display unit showing a labeled numeric value (current score or best score). Accepts `type: "score" | "best"` to determine the displayed label.
- **GameOverlay**: An end-state overlay surfaced on top of the GridArea conveying win or loss state.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 11 tile value variants (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048) plus the empty variant are visually distinguishable without any supporting text, as confirmed by visual inspection.
- **SC-002**: A developer can restyle any single Tile variant (e.g., change the background of the `512` tile) by editing exactly one CSS rule, without touching component code.
- **SC-003**: All listed components render visually without errors, verified by running the dev server and inspecting the board.
- **SC-004**: Given a `Tile` with value `512`, the rendered element has the class `tile--512` in the DOM. Given an unknown or absent value (e.g., `2049` or `undefined`), the default empty variant class is present instead. Verified by automated test.
- **SC-005**: Any Tile — value-bearing or empty — can be located in the DOM by its `data-tile-id` attribute within one lookup operation, enabling future store-logic and animation targeting of all 16 slots.
- **SC-006**: The game board layout is visually complete and usable at viewport widths from 320px to 1440px without horizontal scrolling.

---

## Assumptions

- The grid is always 4×4 (16 cells); a configurable grid size is out of scope.
- Animation (slide, pop, merge) is out of scope; the `id` / `data-tile-id` attribute is added now on **every** slot to enable future store-logic and animation later without refactoring.
- `UndoButton` shows a disabled visual state when `isDisabled` is `true`; the logic deciding undo availability lives outside the component.
- `GameOverlay` was added during specification (not in the original component list) to complete the presentational layer.
- The Figma reference (`docs/superpowers/specs/FE test.fig` / `FE test.pdf`) defines colours, spacing, and typography. `GridArea` sits on a subtle background panel colouring the gap-space; empty slots use the empty `Tile` variant (Figma `Type=Empty`).
- The header reflows at ≤ 560px: Logo + New Game on row 1, the two Score boxes on row 2 (order logo → new game → scores); a single row above 560px.
- Only `Tile` has an automated test (className derivation + empty fallback); all other components are rendering-glue TDD exceptions verified via the dev server.
- Design-token / component-library infrastructure decisions are deferred to planning. Build/config conventions (font, aliases, prop types) are recorded in [plan.md](./plan.md).

---

## Clarifications

### Session 2026-06-21

- Q: Which components require memoization? → A: `Tile` + `GridArea` only. Static/lightweight components (Logo, FooterNote, NewGameButton) and those that re-render by design on every valid move (Score) are exempt.
- Q: How does `Tile` receive its variant style — via parent-passed className, a union variant prop, or internally from value? → A: Internally from value. `Tile` derives `tile--{value}` itself; no parent passes styling. This makes value the single source of truth and test cases straightforward: assert class presence given a known value.
- Q: Which components are covered by automated tests? → A: Only `Tile` — a few assertions on `tile--{value}` class derivation and fallback for unknown values. All other components are TDD exceptions (rendering glue); verified by running the dev server.
- Q: Should `FooterNote` be a generic shared text container (reused by a future rules paragraph), or a specific component? → A: Two separate components; `FooterNote` is footer-specific. Abstract only when concrete duplication exists (YAGNI).
- Q: What is the Playground layout row order? → A: `[Logo][Score Score][New Game]` top row → `[Grid]` → `[Undo]` → `[Footer]`. Confirmed against Figma reference.

### Session 2026-06-22

- Q: How should empty grid cells be modeled? → A: As a `Tile` variant. `GridArea` renders a `Tile` for all 16 slots; an empty slot uses the default empty variant (matching Figma's `Type=Empty`).
- Q: Which values get a dedicated variant, and what is the fallback? → A: Only the 11 known values (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048). Every other input — `1`, `3`, `2049`, `undefined`, `null` — renders the default empty variant. The former `tile--super` fallback is removed.
- Q: Does `GridArea` have a background container? → A: Yes. A subtle background sits behind the grid so the gap-space between cells reads as a distinct colour from the empty cells; exact colour derived from Figma.
- Q: Should `FooterNote` become generic? → A: Yes — rename to `Note` (renders `children`); supersedes the 2026-06-21 footer-specific / two-component decision now that concrete duplication exists.
- Q: Where do the rules and credit notes sit? → A: Rules note **between header and grid** (inside the centred game block); credit note ("made by") pinned to the **bottom** (`margin-top: auto`); nothing pinned at the top. (Final placement — supersedes an interim "rules at top" choice made the same day.)
- Q: Keep `contracts/components.ts`? → A: No — removed; prop types live in `src/components/*` + `data-model.md` (Constitution VIII).
- Q: Fix the `vite.config.ts` / `tsconfig.json` TS warnings without `@types/node`? → A: `defineConfig` from `vitest/config`; aliases via global `URL` + `import.meta.url`; relative `tsconfig` `paths` (no `baseUrl`).
- Q: Should empty tiles also carry an `id`, and how stable must tile ids be? → A: Every `Tile` (value-bearing **and** empty) gets a **required**, unique `id`, stable for the slot's lifetime (generated once, never per-render) to support future store-logic. **Supersedes** the earlier FR-008 "empty tiles are exempt from the unique-id requirement" decision.
- Q: In this UI-only phase (no store yet), who generates the 16 ids, including empty slots? → A: `GridArea` synthesizes the ids once (memoized) so empty slots get a stable id without a store; the future store-logic takes over ownership of tile identity later.
