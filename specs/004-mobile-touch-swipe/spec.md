# Feature Specification: Mobile Touch Swipe Support

**Feature Branch**: `004-mobile-touch-swipe`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Mobile / touch support: swipe gestures to move tiles on touchscreen devices."

## Overview

The game is currently playable only with a keyboard (arrow keys), which makes it unusable on phones and tablets — the primary devices for a casual browser game. This feature adds **swipe gestures** so a player on a touchscreen can move the tiles up, down, left, or right by swiping, with the same move/merge behaviour as the keyboard. Keyboard play remains fully supported on devices that have one.

## Clarifications

### Session 2026-06-23

- Q: How is board input structured (keyboard vs. swipe), and who owns it? → A: A single high-order hook **`useDirectionInput(onMove)`** (in `src/hooks/input/`) composes both sources — `useKeyboardInput` (window) and `useTouchInput` (board element) — and **returns the board ref**. `useGame` calls it with `handleMove` (so `useGame` is the single input owner) and re-exposes `boardRef`; `App` only attaches `<div ref={boardRef}>`. The ref is *created by* the touch hook and flows *out* as a return value, so `useGame` never threads a DOM ref *in* (no logic↔DOM coupling). Each source lives in its own file with its hook (+ the pure, unit-tested `getTouchDirection` helper). (Supersedes the earlier "App is the input composition root" approach.)
- Q: Is touch support easy to cover with tests, or is it overengineering? → A: **Easy, and not overengineering — if split correctly.** The swipe-to-direction decision is a **pure function** (gesture travel `dx, dy` → up/down/left/right, or none for sub-threshold/exact-diagonal), unit-tested with ~6–10 deterministic cases and no DOM — this is the TDD target per Constitution §II. The **DOM touch-event binding and default-scroll/zoom prevention** are thin glue whose behaviour jsdom simulates poorly; they fall under §II's "pure glue with no testable logic" exception and are **verified in-browser**, not unit-tested. Simulating full touch sequences in jsdom would be the overengineering to avoid.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Move tiles by swiping (Priority: P1)

A player on a touchscreen device swipes across the board in a direction; all tiles slide that way and merge per the game rules — identical to pressing the matching arrow key.

**Why this priority**: Without this, the game cannot be played at all on touch-only devices. It is the entire value of the feature and a standalone, shippable MVP.

**Independent Test**: On a touchscreen (or touch emulation), swipe up/down/left/right on a board with movable tiles and confirm the tiles move in the swiped direction and the score updates exactly as the equivalent arrow key would.

**Acceptance Scenarios**:

1. **Given** a board with at least one possible move, **When** the player swipes left/right/up/down, **Then** the tiles move in that direction and merge per the rules, the same as the matching arrow key.
2. **Given** a swipe that is mostly horizontal (or mostly vertical), **When** it is recognised, **Then** the dominant axis decides the direction (e.g. a mostly-leftward diagonal moves left).
3. **Given** a swipe in a direction with no possible move, **When** it is recognised, **Then** nothing moves and no new tile spawns — same as the keyboard.

---

### User Story 2 - Gestures don't fight the page (Priority: P2)

While the player swipes to move tiles, the page itself does not scroll, bounce, zoom, or select text, so the gesture feels like it controls the game rather than the browser.

**Why this priority**: Even a correct move mapping feels broken if the page scrolls or zooms underneath the swipe. It makes US1 usable in practice, but US1 can ship and be tested first.

**Independent Test**: Swipe repeatedly on the board on a touchscreen and confirm the page does not scroll/zoom/select during the gesture, and a normal tap or scroll outside the board still behaves normally.

**Acceptance Scenarios**:

1. **Given** the player swipes on the board, **When** the gesture is in progress, **Then** the page does not scroll, rubber-band, or zoom.
2. **Given** the player taps or interacts with a control (e.g. New Game, Undo), **When** they do so, **Then** the control behaves normally and no tile move is triggered.

---

### Edge Cases

- A short touch / tap below the movement threshold → treated as a tap, not a swipe; no move.
- A near-perfect diagonal → resolved to the larger-magnitude axis; if exactly equal, no move (ambiguous gesture ignored) rather than guessing.
- Multi-finger gestures (pinch/zoom, two-finger pan) → not treated as a move.
- A swipe while the game is over or won → no move, consistent with the keyboard.
- A swipe that begins on an interactive control (New Game / Undo) → the control handles the touch; no board move.
- Touch interrupted (e.g. finger leaves the surface / gesture cancelled) → no move.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to move the tiles in each of the four directions (up, down, left, right) by swiping on the board, producing the same result as the corresponding arrow key.
- **FR-002**: The system MUST resolve a swipe to a single direction using the dominant axis of the gesture (the larger of horizontal vs. vertical travel).
- **FR-003**: The system MUST ignore movements below a minimum distance threshold so incidental touches and taps do not move tiles.
- **FR-004**: A recognised swipe MUST reuse the existing move/merge/scoring/spawn rules unchanged; touch is only a new way to issue an existing move.
- **FR-005**: Swipe input MUST coexist with keyboard input; adding touch MUST NOT change or break keyboard play.
- **FR-006**: During a board swipe, the system MUST prevent the browser's default touch behaviours (scroll, pull-to-refresh/rubber-band, double-tap/pinch zoom, text selection) from interfering with the gesture.
- **FR-007**: Touches on interactive controls (New Game, Undo) MUST be handled by those controls and MUST NOT trigger a tile move.
- **FR-008**: When the game is over or won, a swipe MUST NOT move tiles (same gating as the keyboard).
- **FR-009**: Ambiguous or cancelled gestures (exactly diagonal, multi-touch, interrupted) MUST NOT produce a move.

### Key Entities *(include if feature involves data)*

- **Swipe gesture**: A touch interaction with a start point and end point; its travel vector (horizontal and vertical distance) and total magnitude determine whether it is a swipe and, if so, its direction.
- **Move direction**: One of up / down / left / right — the existing concept the keyboard already produces; a swipe maps to the same set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can complete an entire game (start to win or loss) on a touchscreen using only swipes, with no keyboard.
- **SC-002**: At least 95% of intentional directional swipes register the direction the player intended (no opposite/perpendicular misfires) in informal device testing.
- **SC-003**: A tile move begins within ~100 ms of the swipe completing, so the control feels immediate.
- **SC-004**: Zero accidental page scroll, zoom, or text-selection occurs while swiping on the board across the targeted devices.
- **SC-005**: Keyboard play is unchanged — all existing keyboard-driven behaviour and tests continue to pass.
- **SC-006**: Incidental taps and sub-threshold touches never move tiles (0 false moves from taps in testing).

## Assumptions

- A swipe maps to exactly one of the four existing directions; diagonal-only or 8-direction movement is out of scope.
- The swipe is captured on the **board / play area**; swipes elsewhere on the page are not treated as moves (and controls keep their own touch handling).
- The move threshold and timing use sensible defaults tuned during implementation; no per-user configuration is required.
- Behaviour parity with the keyboard is the target: a swipe is just another way to emit an existing move, so no new game-rule decisions are introduced.
- Target devices are modern evergreen mobile browsers (the same support baseline as the rest of the game).
- No haptics, gesture hints, or onboarding tutorial are in scope for this feature.
- **Testing strategy**: the swipe-to-direction decision is a pure function (gesture vector → direction | none) with unit-test coverage (TDD, Constitution §II); the DOM touch-event binding and default-scroll/zoom prevention are thin glue verified in-browser (jsdom simulates touch poorly), per §II's pure-glue exception. The existing source-agnostic input layer makes this seam natural.
