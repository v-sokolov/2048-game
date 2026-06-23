# Data Model: Mobile Touch Swipe Support

No persistent or runtime data model is added. The feature introduces transient, in-memory concepts only.

## Swipe gesture (transient)

| Field | Description |
|---|---|
| startX, startY | Touch coordinates at `touchstart` (single touch). |
| endX, endY | Touch coordinates at `touchend`. |
| deltaX, deltaY | `end − start` per axis; the gesture's travel vector. |
| cancelled | True if multi-touch began or the gesture was interrupted → no move. |

Lives only for the duration of one touch interaction (held in the hook via a ref); never stored.

## Move direction (existing)

Reuses the engine's `Direction = "up" | "down" | "left" | "right"`. A swipe maps to one of these, or to **nothing** (null) when below the minimum swipe distance, exactly diagonal, multi-touch, or cancelled.

## Mapping rule (pure)

`getTouchDirection(deltaX, deltaY, minSwipeDistance)`:
- `max(|deltaX|, |deltaY|) < minSwipeDistance` → `null`
- `|deltaX| > |deltaY|` → `right` (deltaX>0) / `left` (deltaX<0)
- `|deltaY| > |deltaX|` → `down` (deltaY>0) / `up` (deltaY<0)  *(screen Y grows downward)*
- `|deltaX| === |deltaY|` → `null`

No validation rules beyond the above; no state transitions (the resulting `Direction` flows into the existing `handleMove`, which owns all game-state gating).
