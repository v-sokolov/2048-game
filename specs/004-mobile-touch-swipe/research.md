# Research: Mobile Touch Swipe Support

## Decision 1 — Source-split input under one high-order hook

**Decision**: `src/hooks/input/` holds `useKeyboardInput(onMove)` (window), `useTouchInput(onMove)` (creates+returns the board ref) with the pure `getTouchDirection()` helper, and `useDirectionInput(onMove)` composing both and returning the ref. `useGame` calls `useDirectionInput(handleMove)` and re-exposes `boardRef`; `App` attaches it.

**Rationale**: The only real logic is "which direction (if any) does this gesture mean" — pure, deterministic, unit-testable with no DOM (TDD target per §II). Each input source is a single-responsibility hook (§VII); one composer gives a single entry point. The board ref is created by the touch hook and returned, so `useGame` owns input without coupling logic to the DOM.

**Alternatives considered**: (a) One hook handling both keyboard + touch — rejected: mixes window-bound and element-bound concerns. (b) App owning the ref and wiring input — rejected: splits input ownership and asymmetry vs keyboard. (c) Unit-testing the touch hook via simulated `TouchEvent`s in jsdom — rejected as overengineering (flaky, tests the framework).

## Decision 2 — Mapping rules (what `getTouchDirection` returns)

- `deltaX = endX − startX`, `deltaY = endY − startY`.
- If `max(|deltaX|, |deltaY|) < minSwipeDistance` → `null` (tap / incidental, FR-003).
- Dominant axis decides (FR-002): if `|deltaX| > |deltaY|` → `deltaX > 0 ? "right" : "left"`; if `|deltaY| > |deltaX|` → `deltaY > 0 ? "down" : "up"` (screen Y grows downward).
- If `|deltaX| === |deltaY|` (exact diagonal) → `null` (ambiguous, FR-009).

**Minimum swipe distance**: default **24px** — large enough to reject taps/jitter, small enough for a deliberate flick. Accepted default for this feature; not user-configurable, and on-device fine-tuning is an out-of-scope follow-up.

## Decision 3 — Capture on the board element only

**Decision**: attach `touchstart`/`touchend` (and a `touchmove` that calls `preventDefault`) to the `.board` element via a ref, not `window`.

**Rationale**: Scopes gestures to the play area — touches on New Game / Undo are outside the board, so they never produce a move (FR-007) with no extra logic. `preventDefault` on the board's `touchmove` stops scroll/zoom/rubber-band over the board (FR-006) while leaving the rest of the page free. The `touchmove` listener must be registered **non-passive** (`{ passive: false }`) or `preventDefault` is ignored.

**Alternatives considered**: window-level touch — rejected: would hijack page scrolling everywhere and require explicit hit-testing to exclude controls.

## Decision 4 — Gating & multi-touch

- Game-over/win gating is already handled by `handleMove` (`status !== "playing"` early-returns) → FR-008 needs no new code.
- On `touchstart`, if `event.touches.length > 1` → mark the gesture cancelled (ignore on `touchend`) → FR-009 multi-touch.
- If `touchend` has no recorded single-touch start (cancelled/interrupted) → no move → FR-009.
- On `touchcancel`, reset the stored start, so an interrupted gesture cannot leave a stale start that a later `touchend` would consume.

## Decision 5 — Test strategy (per spec Clarification)

- **Unit (TDD)**: `getTouchDirection` — one case per direction, a sub-threshold tap → null, an exact diagonal → null, a mostly-horizontal diagonal → horizontal. ~6–8 cases, no DOM.
- **In-browser (manual / preview)**: actual swiping moves tiles; page doesn't scroll/zoom; control taps don't move; game-over swipe is inert. Covers FR-006/007/008 and SC-001..004 which aren't meaningful to unit-test.
- Existing keyboard tests/behaviour remain green (SC-005, regression).

## Open items rolled into tasks

1. Pure `getTouchDirection()` helper (in `src/hooks/input/useTouchInput.ts`) + `tests/hooks/useTouchInput.test.ts` (TDD, min swipe distance 24px, rules above).
2. `useTouchInput` / `useKeyboardInput` / `useDirectionInput` in `src/hooks/input/` — non-passive `touchmove` preventDefault, single-touch start/end, multi-touch + `touchcancel` reset; composer returns the board ref.
3. `useGame` calls `useDirectionInput(handleMove)` and exposes `boardRef`; `App` attaches `<div ref={boardRef}>`.
4. In-browser verification (touch emulation): all four directions, tap, scroll-prevention, control taps, game-over.
