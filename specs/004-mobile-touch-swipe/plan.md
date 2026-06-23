# Implementation Plan: Mobile Touch Swipe Support

**Branch**: `004-mobile-touch-swipe` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-mobile-touch-swipe/spec.md`

## Summary

Add swipe gestures so the game is playable on touchscreens, emitting the same `Direction` moves the keyboard already produces. Input lives in `src/hooks/input/`, split by source: a **pure, unit-tested mapping** (`getTouchDirection(deltaX, deltaY, minSwipeDistance) → Direction | null`), a **thin browser-verified touch hook** (`useTouchInput(onMove)` that creates+returns the board ref and prevents default scroll/zoom), a keyboard hook (`useKeyboardInput`), and a high-order composer (`useDirectionInput(onMove)`). `useGame` owns input (calls the composer with `handleMove`, re-exposes `boardRef`); `App` attaches the ref. No engine/store/keyboard-behaviour changes — `handleMove` already gates on game status (FR-008).

## Technical Context

**Language/Version**: TypeScript (strict).

**Primary Dependencies**: none added — native `touchstart`/`touchend`/`touchmove` events. Per Constitution §Dependency Whitelist.

**Storage**: N/A.

**Testing**: Vitest + jsdom + @testing-library/react. Unit tests for the **pure `getTouchDirection` function** (TDD, §II). The DOM touch binding + scroll-prevention is thin glue verified **in-browser** (jsdom simulates touch poorly) — §II "pure glue" exception, recorded in spec Clarifications.

**Target Platform**: Modern evergreen mobile + desktop browsers, static build.

**Project Type**: Single-page browser game.

**Performance Goals**: A move issues within ~100 ms of swipe end (SC-003); handler does trivial vector math only.

**Constraints**: Dependency whitelist; `vite.config.ts` base unchanged; swipes captured on the **board** element only (so page scroll elsewhere and control taps are unaffected).

**Scale/Scope**: 2 new small modules + 1 component wiring change.

## Constitution Check

*GATE: re-checked after design below.*

- [x] **I. Game Logic Isolation** — engine untouched; touch only produces an existing `Direction`.
- [x] **II. Test-First** — `getTouchDirection` is a pure function written test-first (Red→Green→Refactor); the DOM hook is pure glue (no testable logic) → §II exception, browser-verified. Noted per §II.
- [x] **III. Incremental Delivery** — US1 (move by swipe) is a shippable increment; US2 (no page-fight) layers on; game stays playable throughout.
- [x] **IV. Simplicity** — one pure function + one hook; no abstraction beyond what's needed.
- [x] **V. Learning-First** — testing seam + min-swipe-distance rationale documented in research.md.
- [x] **VI. Testing Scope** — no CSS tests; the new tests are logic tests (allowed/required).
- [x] **VII. React Architecture** — each input hook (`useKeyboardInput`, `useTouchInput`) is single-responsibility and independently usable, composed by `useDirectionInput`; `useEffect` with listener cleanup; `onMove` is a stable `useCallback` (`handleMove`); `boardRef` via `useRef`; no inline literals; no re-render impact (listeners attached once).
- [x] **VIII. Artifact Brevity** — artifacts kept minimal.
- [x] **IX. Layered Architecture** — input mapping lives in the hooks layer and communicates to the engine only via the existing `Direction` contract + `handleMove`; no cross-layer leak.
- [x] **Dependency Whitelist** — none added.
- [x] **Hosting** — `vite.config.ts` untouched.

**Result**: PASS. No violations; Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/004-mobile-touch-swipe/
├── plan.md          # This file
├── research.md      # Phase 0 — decisions (mapping seam, min swipe distance, capture target, test strategy)
├── data-model.md    # Phase 1 — gesture/direction model (documentation only)
├── quickstart.md    # Phase 1 — how to run & verify (tests + in-browser)
├── contracts/
│   └── input.md     # Phase 1 — getTouchDirection() + input hooks interface contract
└── checklists/
    └── requirements.md
```

### Source Code (files this feature adds/modifies)

```text
src/
├── hooks/
│   ├── input/
│   │   ├── useKeyboardInput.ts     # useKeyboardInput(onMove) — window arrows
│   │   ├── useTouchInput.ts        # pure getTouchDirection() + useTouchInput(onMove)→ref
│   │   └── useDirectionInput.ts    # high-order: composes both, returns board ref
│   └── useGame.ts                  # MODIFY — calls useDirectionInput(handleMove), returns boardRef
└── components/
    └── App/App.tsx                 # MODIFY — { boardRef } = useGame(); <div ref={boardRef}>
tests/hooks/
├── useKeyboardInput.test.ts        # keyboard mapping tests
└── useTouchInput.test.ts           # getTouchDirection() unit tests (TDD target)
```

**Structure Decision**: Input lives in a dedicated `src/hooks/input/` layer, **split by source** (keyboard, swipe), each file holding its hook (+ the pure `getTouchDirection` helper). A single high-order hook `useDirectionInput` composes them and returns the board ref. `useGame` is the single input owner (calls `useDirectionInput(handleMove)`, re-exposes `boardRef`); `App` only attaches the ref. The ref is created by the touch hook and flows out as a return value — no DOM ref threaded through the pure-logic `useGame`. Engine/store untouched.

## Complexity Tracking

No constitution violations — section intentionally empty.
