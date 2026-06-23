# Feature Specification: Design Conformance Audit

**Feature Branch**: `003-figma-design-conformance`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Review the Design Requirements and current code: make sure all component styles match, colour palette is correct, all component states (hover, disabled, press) match the design. Ignore text values shown in the design wireframe examples. Ask about positioning mismatches — the user will navigate which to tackle."

## Overview

The 2048 game UI was built to a set of **Design Requirements** (the FE-test design wireframes). This feature audits the existing implemented components against those Design Requirements as the source of truth and reconciles every discoverable mismatch in visual styling, the colour palette, and interactive states. The goal is a faithful, pixel-accurate rendering of the design system — not new functionality.

Text/content values displayed in the design wireframe examples (placeholder labels, sample scores, sample tile numbers) are illustrative only and are explicitly **out of scope** for matching. Layout/positioning mismatches are surfaced to the user for a decision rather than changed automatically.

## Clarifications

### Session 2026-06-23

- Q: How should authoritative design values be sourced? → A: From the **Design Requirements** (the design wireframes), read as documented measured values; visual screenshots may supplement them.
- Q: What authority do I have to change code for non-positioning mismatches (styling, colour, states)? → A: **Auto-correct** styling, colour, and state mismatches to match the Design Requirements; only positioning differences are brought to the user.
- Q: Priority of the press/active state work? → A: **Lowest priority** — implemented last, after all styling, colour, hover, and disabled conformance is complete.
- Verified from the Design Requirements: the New Game button defines exactly three states — **Default, Hover, Press** — and **no Disabled variant**. Therefore "Press" is a genuine design-defined state (validates the press work), while the implementation's `disabled` styling has no design counterpart and is treated as an implementation-only state to leave intact (not a conformance target).
- Verified from the Design Requirements: the **Undo control** has an explicit outer drop-shadow layer behind the 72×64 button background, confirming the elevated/raised appearance the current inset-only implementation is missing.
- Q: Which positioning items are in scope (FR-008)? → A: **In scope** — Header: vertical alignment between the header containers (logo / score cluster / New Game), plus a responsive double-check at smaller breakpoints; Board: **all** positioning (centering, offset, padding, inter-cell gaps, dimensions); Footer: the **Undo button placement**. **Out of scope** — footer caption placement, and the Undo↔caption gap. Spacing in scope: the gaps **header ↔ board ↔ Undo** (not Undo ↔ caption).
- Screenshot review (current app vs the design wireframes): overall layout structure matches; the user-selected positioning items above are to be measured precisely against the Design Requirements and corrected, rather than reworking the whole layout.
- Q: Is the Undo elevation shadow a hover effect? → A: **No — it is the resting/default state.** The Undo's "Shadow" layer is always present (a warm brown elevation), independent of hover. The implementation's `:hover` lighten (`#fff6e9`) is a separate implementation-only effect, not the elevation, and is not a conformance target. Therefore the Undo shadow work belongs to resting styling (US1), not hover (US3).
- Verified from the Design Requirements (property panel): the Undo **elevation/ambient shadow** is a warm brown — linear gradient `#A15A1B → #956940`, 20% opacity, progressive blur to ~30px — approximated in CSS as a brown `box-shadow` (not black). The **Empty cell** palette is confirmed: fill `#F5E3CF` with insets `inset -1px -1px 1px #E5CFB3` and `inset 1px 1px 1px rgba(255,255,255,0.2)`.
- Q: Does each tile (except Empty) also have the ambient shadow? → A: **Yes.** Every numbered tile (2–2048) carries the **same** soft warm-brown ambient shadow as the Undo button — an identical asset (gradient `#A15A1B → #956940`, 20% opacity, ~30px progressive blur), scaled per element. The **Empty** tile has inset shadows only (no ambient drop). Because this ambient shadow is reused across tiles and the Undo control, it is defined once as a shared token (`--shadow-ambient`) per FR-004, alongside each element's own crisp drop shadow.
- Q: Are the shadow / hover / disabled / press states verified in the running app? → A: **Yes.** Verified via computed styles + live CSSOM: tile & Undo shadows (crisp drop + shared ambient + insets), New Game hover (`#a38b67`) / press (`#ae9979`) / disabled (`opacity 0.45`), Undo hover (`#fff6e9`, implementation-only) / disabled (`opacity 0.45`). All resolve to the expected values; the 67-test suite stays green.
- Q: Is the design font available for free, and how is it delivered? → A: The design font is **Manrope**, **free** under the SIL Open Font License. It is currently only *named* in `global.css` and **not actually loaded** (the app falls back to `system-ui`). It MUST be **self-hosted** as `woff2` (weights 500/700/800) with `@font-face` in `global.css` — no CDN, no npm package (respects the dependency whitelist). [FR-013]
- Q: GameOverlay has no design counterpart — what should we do? → A: **Build it ourselves**, styled to match the design system: brand colours/tokens, shared `--radius`, the New Game button style for its action, and consistent elevation/backdrop. (Supersedes the earlier "leave as a gap" resolution.) [FR-014]
- Q: Should tile font-sizes be rounded to whole pixels? → A: **No — leave as-is.** Responsiveness comes from `calc(--cell-size × ratio)`, not from rounding; `round()` would only change cosmetics (whole-pixel rendering), and sub-pixel font sizes render correctly. No change is made.
- Q: Per-digit font ratios or one ratio for all tiles? → A: **One ratio for all** — the lowest, `0.318` (the 4-digit/2048 size), applied to every tile via `calc(--cell-size × 0.318)`. Simpler and guarantees the longest numbers fit; an accepted deviation from the design's per-digit sizing in favour of uniformity (user-approved).
- Q: How is the Undo button's raised look achieved (it differs from the design)? → A: The design places the button on a **platform** (`#EBD8BC` fill, radius `20`, padding `12`) — the depth comes from the platform + padding, not just a drop shadow. Implemented as a wrapper element around the button (markup change, user-approved). The shared ambient shadow was also softened to `0 12px 30px rgba(149,105,64,0.22)`.
- Q (bug): cursor flickered when hovering the disabled Undo button. → A: Fixed by setting `pointer-events: none` on the Undo `.icon`, so the disabled button shows a single uniform `not-allowed` cursor instead of flickering against the SVG child.
- Note (behaviour, user-made): the Undo control is disabled via `isDisabled={isEmptyHistory || isGameOver}` (`App.tsx`) — i.e. when there is no move to undo (empty history) **or** the game is over. The disabled *styling* remains implementation-only (no design counterpart, FR-005); this records *when* it applies.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Component styling matches the design (Priority: P1)

A reviewer compares each implemented UI component against its Design Requirements counterpart and confirms that every static visual property — fill, border, corner radius, shadow/elevation, padding, dimensions, typography (family, size, weight, line-height, letter-spacing) — matches the design. Any divergence is corrected so the rendered component is indistinguishable from the design at rest.

**Why this priority**: Static styling is the most visible and highest-volume category of conformance. It is the baseline a viewer judges first and it gates the credibility of every other refinement.

**Independent Test**: Pick any single component (e.g. the New Game button), place its rendered output beside the design wireframe at the same zoom, and verify each style property matches the design's documented values. Delivers value on its own as a corrected, faithful component.

**Acceptance Scenarios**:

1. **Given** a component exists in both the Design Requirements and the code, **When** its resting-state style properties are measured against the design, **Then** fills, radius, shadows, spacing, dimensions, and typography match the design values.
2. **Given** a component's measured style diverges from the design, **When** the audit completes, **Then** the divergence is either corrected in code or recorded as an accepted, justified exception.
3. **Given** the design wireframe shows placeholder text or sample numbers, **When** styling is compared, **Then** the text/content values are ignored and only visual styling is assessed.

---

### User Story 2 - Colour palette is correct (Priority: P1)

A reviewer confirms that every colour used by the implementation (brand colours, text colours, tile value colours and gradients, button fills, surface/background colours, shadow tints) corresponds exactly to the colour defined for that element in the Design Requirements. Shared colours are sourced from a single palette definition so the same design colour is never represented by two slightly different code values.

**Why this priority**: Colour is the most precise and unforgiving conformance dimension — a few hex digits off is immediately perceptible. The 2048 tile ladder in particular depends on a correct, complete colour sequence.

**Independent Test**: Enumerate every colour value in the implementation, map each to its corresponding design element, and verify equality. Delivers value as a verified, single-source palette.

**Acceptance Scenarios**:

1. **Given** a design element defines a colour, **When** the corresponding code colour is read, **Then** the two values are equal (within standard hex/rgb rounding).
2. **Given** each tile value (2 through 2048), **When** its background and text colour are compared to the design, **Then** each tile's colour pair matches the design's tile sequence.
3. **Given** a colour appears on multiple components in the design, **When** the palette is reviewed, **Then** that colour is defined once and reused rather than duplicated with drift.

---

### User Story 3 - Hover state matches the design (Priority: P1)

A reviewer confirms that every interactive component renders the correct appearance for its **hover** state as defined in the Design Requirements, and that no design-defined hover variant is missing from the implementation. The implementation's **disabled** styling has no design counterpart (the design defines only Default/Hover/Press); it is therefore preserved as-is and verified not to break, rather than matched against the design.

**Why this priority**: Hover is already implemented across the controls and is a design-defined state, so this is high-value verification/correction that completes the feel of the existing UI without introducing new state machinery.

**Independent Test**: For each interactive component, trigger hover and compare the rendered state to the matching design variant; confirm disabled still renders without regression. Delivers value as correctly-styled existing states.

**Acceptance Scenarios**:

1. **Given** the Design Requirements define a hover variant for a control, **When** the control is hovered, **Then** the rendered hover appearance matches the design variant.
2. **Given** the implementation defines a disabled state with no design counterpart, **When** the audit runs, **Then** the disabled styling is left intact and is not flagged as a mismatch.
3. **Given** the Design Requirements define a hover state the implementation does not render, **When** the audit completes, **Then** the missing hover state is added.

---

### User Story 4 - Press/active state added (Priority: P3 — lowest, done last)

A reviewer confirms that every interactive control for which the Design Requirements define a press/active variant renders that pressed appearance. This is the **last** item addressed, after all styling, colour, hover, and disabled conformance is complete, because no press/active styling currently exists in the implementation and adding it is net-new work.

**Why this priority**: Explicitly deprioritized by the user. A press state is the least-visible state and currently absent everywhere, so it is sequenced last to avoid blocking the higher-value styling/colour/hover/disabled corrections.

**Independent Test**: For each interactive control, press it and compare the rendered pressed appearance to the design's press/active variant. Delivers value as fully state-complete controls.

**Acceptance Scenarios**:

1. **Given** the Design Requirements define a press/active variant for a control, **When** the control is pressed, **Then** a press/active appearance exists and matches the design variant.
2. **Given** all higher-priority conformance (styling, colour, hover, disabled) is complete, **When** press/active work begins, **Then** it is the final category addressed.

---

### Edge Cases

- A component exists in the code but has no counterpart in the Design Requirements (or vice versa) → recorded as a gap for the user to decide on, not silently matched.
- The Design Requirements define a state the implementation lacks (e.g. press) → added; the implementation defines a state the design does not → flagged for the user.
- A colour or token is reused across components in the design but hardcoded inconsistently in code → consolidated to the single design value.
- Positioning/layout differs from the design → corrected only for the user-approved items (FR-008a: header vertical alignment + small breakpoints, full board positioning, Undo placement, header↔board↔Undo gaps); all other positioning (FR-008b) is left unchanged.
- Text/content values in the design differ from the implementation → ignored by design.
- The design uses a colour or effect that cannot be reproduced exactly by the rendering technology → matched as closely as possible and the residual difference recorded as an accepted exception.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The audit MUST cover every UI component that has a counterpart in the Design Requirements (including, at minimum, the tiles, the New Game control, the Undo control, the score display, the note/caption, the logo, the board/grid surface, and the game-over overlay).
- **FR-002**: For each in-scope component, the audit MUST compare every resting-state visual property against the Design Requirements: fill/background, border, corner radius, shadow/elevation, padding, width/height, and typography (family, size, weight, line-height, letter-spacing).
- **FR-003**: The audit MUST verify the full colour palette against the Design Requirements, including brand colours, text colours, surface/background colours, shadow tints, and the complete tile colour sequence for values 2 through 2048 (background and text colour per value).
- **FR-004**: Colours that the design reuses across components MUST be defined once in a shared palette and referenced, rather than duplicated with value drift.
- **FR-005**: The audit MUST verify each interactive component against the **hover** state defined in the Design Requirements, and MUST additionally cover the **press/active** state as the lowest-priority, last-addressed item (see FR-006a). The implementation's **disabled** styling has no design counterpart and MUST be preserved as-is (verified not to regress), not matched against the design.
- **FR-006**: Where the Design Requirements define a hover state that the implementation does not render, the implementation MUST be updated to add that state.
- **FR-006a**: Press/active state work MUST be sequenced last — only after all styling, colour, hover, and disabled conformance is complete. Where the Design Requirements define a press/active variant, the implementation MUST add it at that point.
- **FR-007**: Text and content values shown in the design wireframe examples MUST NOT be treated as conformance targets; only visual styling and states are assessed.
- **FR-008**: Positioning and layout differences MUST be surfaced to the user; the user decides which are corrected. The audit MUST NOT change positioning outside the user-approved scope.
- **FR-008a**: The following positioning items ARE approved for correction to match the design: (a) **Header** — vertical alignment between the logo, score cluster, and New Game containers, verified responsively at smaller breakpoints; (b) **Board** — all positioning, i.e. horizontal centering, vertical offset, outer padding, inter-cell gaps, and cell/board dimensions; (c) **Footer** — the Undo button placement; (d) **Spacing** — the vertical gaps between header ↔ board ↔ Undo.
- **FR-008b**: The following positioning items are explicitly OUT of scope and MUST be left unchanged: the footer caption placement, and the Undo ↔ caption gap.
- **FR-009**: Styling, colour, and state mismatches (i.e. every category except positioning) MUST be corrected directly in code to match the design, without requiring per-change approval.
- **FR-010**: Every identified mismatch MUST be recorded with its component, the property/state affected, the design value, the current value, and its resolution (corrected, deferred, or accepted exception).
- **FR-011**: Resolving a mismatch MUST NOT change any component's behaviour or break existing automated tests; this audit is visual/stylistic only.
- **FR-012**: Authoritative design values MUST be taken from the Design Requirements (the design wireframes); visual screenshots may supplement but do not replace the documented design values.
- **FR-013**: The design typeface **Manrope** (free, SIL OFL) MUST be delivered with the app — self-hosted `woff2` for the weights in use (500, 700, 800) with `@font-face` in `global.css`. The app MUST NOT rely on the system-font fallback for design-specified text, and MUST NOT add an npm package or external CDN for the font.
- **FR-014**: The **GameOverlay** has no design counterpart and MUST be built to match the design system — using brand colours/tokens, the shared `--radius`, the New Game button style for its action control, and elevation/backdrop consistent with the rest of the UI.

### Key Entities *(include if feature involves data)*

- **Design Requirements**: The FE-test design wireframes — the authoritative reference for styling, palette, and states. Each component, colour, and state variant in them is the value the implementation must match.
- **Component under audit**: An implemented UI element with a design counterpart, having resting-state styles and (if interactive) one or more state variants.
- **Conformance finding**: A recorded comparison result for one property or state of one component — design value, current value, verdict (match / mismatch), and resolution.
- **Palette entry**: A single design colour value, the design elements that use it, and the canonical code reference for it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of in-scope components have every resting-state style property compared against the Design Requirements, with each comparison recorded as a match or a resolved finding.
- **SC-002**: 100% of palette colours — including all 11 numbered tile colour pairs (2–2048) plus the Empty tile fill (12 tile styles total) — match their design values, with zero duplicated colours that differ from the single design value.
- **SC-003**: Every interactive component renders its design-defined hover state; existing disabled styling continues to render without regression; and, as the final step, a press/active state exists for every control for which the design defines one (target: zero missing design-defined states).
- **SC-004**: The user-approved positioning items (FR-008a: header vertical alignment incl. small breakpoints, full board positioning, Undo placement, header↔board↔Undo gaps) match the design; out-of-scope items (FR-008b) remain unchanged; no positioning outside FR-008a is altered.
- **SC-005**: No conformance change alters component behaviour — the existing automated test suite continues to pass at 100%.
- **SC-006**: A reviewer comparing each corrected component side by side with its design wireframe (text/content ignored) cannot identify a styling, colour, or state difference outside the recorded accepted exceptions.

## Assumptions

- The Design Requirements are the single source of truth; where the implementation and design disagree, the design wins (except for text/content values and positioning, which are out of scope and user-directed respectively).
- "Match" means equality of documented design values within standard rounding (hex/rgb colour rounding, sub-pixel dimension rounding); exact byte-equality of effects that the rendering technology cannot reproduce is not required.
- All currently implemented components (tiles, New Game, Undo, Score, Note, Logo, GridArea/board, GameOverlay, and the overall Playground/App composition) are candidates for audit; any with no design counterpart are reported as gaps rather than matched.
- Press/active is currently absent from the implementation everywhere (resting + hover + disabled exist; no pressed appearance) and is, per the user, the lowest-priority item — addressed last.
- For non-positioning categories (styling, colour, states), corrections are applied directly without per-change approval; only positioning differences are routed back to the user for a decision.
- Layout/positioning conformance is bounded to the user-approved items in FR-008a; everything else (notably caption placement and the Undo↔caption gap, FR-008b) is left as-is. Exact spacing/alignment values for the in-scope items are taken from the Design Requirements during implementation.
