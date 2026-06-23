# Quickstart: Verifying Touch Swipe Support

## 1. Unit tests (the logic — TDD)

```bash
npx vitest run
```

`useTouchInput.test.ts` MUST cover: each of the four directions, a sub-threshold tap → `null`, an exact diagonal → `null`, and a mostly-horizontal/vertical diagonal → the dominant axis. Existing keyboard/engine tests MUST stay green (SC-005).

## 2. In-browser verification (the glue — not unit-tested)

Run the app and use **touch emulation** (browser devtools device mode) or a real touchscreen:

```bash
yarn dev        # or the preview_* tooling
```

- **US1**: swipe up/down/left/right on the board → tiles move that way, score updates — same as the arrow keys. A swipe with no possible move does nothing (no spawn).
- **US2 / FR-006**: while swiping on the board, the page does not scroll, rubber-band, or zoom.
- **FR-007**: tapping New Game / Undo behaves normally and triggers no move.
- **FR-008**: after game over, a swipe does nothing.
- **Tap (FR-003)**: a short tap on the board moves nothing.

## Done criteria

- `getTouchDirection` unit tests pass; full Vitest suite green (no keyboard regression — SC-005).
- All four directions playable by swipe on a touchscreen (SC-001); response feels immediate (SC-003).
- No accidental scroll/zoom over the board (SC-004); taps never move tiles (SC-006).
