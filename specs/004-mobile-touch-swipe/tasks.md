---
description: "Task list — Mobile Touch Swipe Support"
---

# Tasks: Mobile Touch Swipe Support

**Input**: Design documents from `/specs/004-mobile-touch-swipe/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/input.md

**Tests**: TDD applies (Constitution §II). The pure `getTouchDirection` mapping is unit-tested **test-first**. The DOM touch hook + scroll-prevention is pure glue (§II exception) — verified **in-browser**, not unit-tested (jsdom touch simulation is unreliable). No new dependencies (native touch events).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: different file, no dependency on an incomplete task → parallelizable
- **[Story]**: US1 = move by swipe · US2 = gestures don't fight the page

---

## Phase 1: Setup

- [x] T001 Capture baseline: `npx vitest run` (suite green) and start the app via `preview_start` for later in-browser checks.

---

## Phase 2: User Story 1 — Move tiles by swiping (Priority: P1) 🎯 MVP

**Goal**: Swiping the board moves tiles in that direction, identical to the matching arrow key.

**Independent Test**: With touch emulation, swipe up/down/left/right on a board with moves → tiles move that way and score updates as the arrow key would; a tap moves nothing; a swipe with no possible move does nothing.

- [x] T002 [US1] Write failing unit tests in `tests/hooks/useTouchInput.test.ts` (TDD): each of the four directions; sub-threshold tap → `null`; exact diagonal (`|deltaX| === |deltaY|`) → `null`; mostly-horizontal diagonal → `left`/`right`; mostly-vertical → `up`/`down` (screen Y grows downward). Default min swipe distance 24px.
- [x] T003 [US1] Implement the pure function `src/hooks/input/useTouchInput.ts` — `getTouchDirection(deltaX, deltaY, minSwipeDistance = 24): Direction | null` per data-model rules — until T002 passes. (Depends on T002.)
- [x] T004 [US1] In `src/hooks/input/`: `useTouchInput(onMove)` (in `useTouchInput.ts`) creates+returns the board ref and binds touch — `touchstart` records the single-touch start (cancel if `touches.length > 1`); `touchend` computes `deltaX,deltaY` → `getTouchDirection` → `onMove` when non-null; `touchcancel` **resets the stored start** (FR-009). `useKeyboardInput(onMove)` (in `useKeyboardInput.ts`) binds window arrows. `useDirectionInput(onMove)` composes both and returns the ref. Every listener cleaned up; no game-state logic. (Depends on T003.)
- [x] T005 [US1] Own input in `src/hooks/useGame.ts`: `const boardRef = useDirectionInput(handleMove)`, expose `boardRef`. In `src/components/App/App.tsx`: `const { boardRef } = useGame()` and `<div className={styles.board} ref={boardRef}>`. (Depends on T004.)
- [x] T006 [US1] In-browser verify (touch emulation): all four directions move tiles; a tap moves nothing; a swipe into a blocked direction does nothing (no spawn). Matches the equivalent arrow keys.

**Checkpoint**: game is playable by swipe on a touchscreen (MVP).

---

## Phase 3: User Story 2 — Gestures don't fight the page (Priority: P2)

**Goal**: While swiping the board, the page doesn't scroll, rubber-band, zoom, or select; controls still work.

**Independent Test**: Swipe repeatedly on the board → no page scroll/zoom/selection; tapping New Game / Undo behaves normally and triggers no move; a swipe after game over does nothing.

- [x] T007 [US2] In `src/hooks/input/useTouchInput.ts` (`useTouchInput`), add a `touchmove` listener on the board that calls `preventDefault()`, registered **non-passive** (`{ passive: false }`); include it in the effect cleanup (FR-006). (Depends on T004.)
- [x] T008 [US2] In-browser verify: no scroll/rubber-band/zoom while swiping the board; New Game / Undo taps behave normally and move nothing (FR-007, from board-scoped listeners); the **GameOverlay's New Game button (rendered inside `.board`)** starts a fresh game on tap and triggers no stray move; a swipe when the game is over does nothing (FR-008, gated by `handleMove`).

**Checkpoint**: swipes feel like game control, not browser gestures.

---

## Phase 4: Polish & Cross-Cutting

- [x] T009 Run `npx vitest run` — full suite green: new `getTouchDirection` tests pass and existing keyboard/engine tests are unchanged (SC-005).
- [x] T010 React DevTools Profiler check (Constitution §VII): confirm touch listeners attach once and a swipe causes no re-render beyond the resulting move (no per-`touchmove` renders).
- [x] T011 Run `quickstart.md` verification end-to-end (unit + in-browser). The 24px minimum swipe distance is the accepted default for this feature; on-device fine-tuning is an out-of-scope follow-up, not a gate.

---

## Dependencies & Execution Order

- **Setup (T001)** → first.
- **US1 (T002–T006)** → TDD chain: T002 → T003 → T004 → T005 → T006. **MVP**; depends only on Setup.
- **US2 (T007–T008)** → depends on the hook from US1 (T004); otherwise independent. T007 modifies the same file as T004, so it runs after US1's hook exists.
- **Polish (T009–T011)** → after US1 (+ US2 if shipping it).

### Parallel Opportunities

- Minimal — the work is a short dependency chain in two files. T002 (tests) is the only natural standalone start; implementation tasks are sequential by file/dependency. Not marked `[P]`.

---

## Implementation Strategy

**MVP** = Setup + **US1** (swipe moves tiles) — this alone makes the game playable on touch. Ship/validate, then add **US2** (scroll/zoom prevention) for polish, then Polish phase.

## Notes

- The only unit tests are for `getTouchDirection` (pure logic); the hook and `preventDefault` are verified in-browser per §II's glue exception (spec Clarification).
- Engine, store, and keyboard input are untouched; touch only emits an existing `Direction` into `handleMove`, which owns all game-state gating.
- No new dependencies; native `touchstart`/`touchmove`/`touchend` only.
