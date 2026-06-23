# Contract: Board Input Interface

Input lives in `src/hooks/input/`, split by source, composed by one high-order hook. All hooks are `use*`; the pure helper is co-located in the touch hook's file.

## `getTouchDirection` (pure function) — `input/useTouchInput.ts`

```text
getTouchDirection(deltaX: number, deltaY: number, minSwipeDistance?: number): Direction | null
```

- **Input**: gesture travel `deltaX`, `deltaY` (px; screen coords, Y down); optional `minSwipeDistance` (default 24).
- **Output**: `"up" | "down" | "left" | "right"`, or `null` when no move should occur.
- Deterministic, no side effects, no DOM → fully unit-tested (TDD). See data-model for rules.

## `useKeyboardInput` (hook) — `input/useKeyboardInput.ts`

```text
useKeyboardInput(onMove: (dir: Direction) => void): void
```

- Binds `keydown` on `window`; maps arrow keys → `Direction` → `onMove`. No element needed. Cleanup on unmount.

## `useTouchInput` (hook) — `input/useTouchInput.ts`

```text
useTouchInput(onMove: (dir: Direction) => void): RefObject<HTMLDivElement | null>
```

- **Creates and returns** the board ref the caller attaches.
- Attaches `touchstart`/`touchend` to the ref's element + a **non-passive** `touchmove` calling `preventDefault()`; records the single-touch start; on end, `getTouchDirection(...)` → `onMove` when non-null.
- Cancels on multi-touch (`touches.length > 1`) and on `touchcancel` (resets start). Cleans up all listeners.

## `useDirectionInput` (high-order hook) — `input/useDirectionInput.ts`

```text
useDirectionInput(onMove: (dir: Direction) => void): RefObject<HTMLDivElement | null>
```

- Composes `useTouchInput(onMove)` (returns the ref) + `useKeyboardInput(onMove)` (void); forwards the touch hook's board ref. The single input entry point. The asymmetry is intentional: touch is element-scoped (returns a ref), keyboard is window-bound (returns nothing).

## Wiring

- `useGame`: `const boardRef = useDirectionInput(handleMove)` → exposes `boardRef` (and `handleMove` etc.). `useGame` is the input owner.
- `App`: `const { boardRef } = useGame()` → `<div className={styles.board} ref={boardRef}>`. App only attaches; no input wiring.
- `onMove` (= `handleMove`) owns all game-state gating (game over/win, no-op moves).
