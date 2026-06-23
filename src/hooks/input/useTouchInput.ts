import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Direction } from "@services/engine";

// Minimum finger travel (px) for a gesture to count as a swipe rather than a tap.
const DEFAULT_MIN_SWIPE_DISTANCE = 24;

const DIRECTION: Record<string, Direction> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

type Point = { x: number; y: number };

type GestureState = { start: Point | null };

export function getTouchDirection(
  deltaX: number,
  deltaY: number,
  minSwipeDistance: number = DEFAULT_MIN_SWIPE_DISTANCE,
): Direction | null {
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);

  const isTap =
    Math.max(horizontalDistance, verticalDistance) < minSwipeDistance;
  if (isTap) {
    return null;
  }

  const isAmbiguousDiagonal = horizontalDistance === verticalDistance;
  if (isAmbiguousDiagonal) {
    return null;
  }

  const isHorizontal = horizontalDistance > verticalDistance;
  if (isHorizontal) {
    return deltaX > 0 ? DIRECTION.right : DIRECTION.left;
  }

  return deltaY > 0 ? DIRECTION.down : DIRECTION.up; // screen Y grows downward
}

// Builds the four touch listeners over a fresh, self-contained gesture state.
function createTouchHandlers(onMove: (dir: Direction) => void) {
  const state: GestureState = { start: null };

  const handleStart = (event: TouchEvent) => {
    const isMultiTouch = event.touches.length > 1;
    const touch = event.touches[0];
    if (isMultiTouch || !touch) {
      state.start = null;
      return;
    }

    state.start = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: TouchEvent) => {
    const isSwipeInProgress = state.start !== null;
    if (isSwipeInProgress) {
      event.preventDefault();
    }
  };

  const handleEnd = (event: TouchEvent) => {
    const startPoint = state.start;
    const endTouch = event.changedTouches[0];
    state.start = null; // gesture consumed

    const isCompleteSwipe = startPoint !== null && endTouch !== undefined;
    if (!isCompleteSwipe) {
      return;
    }

    const direction = getTouchDirection(
      endTouch.clientX - startPoint.x,
      endTouch.clientY - startPoint.y,
    );
    if (direction) {
      onMove(direction);
    }
  };

  const handleCancel = () => {
    state.start = null;
  };

  return { handleStart, handleTouchMove, handleEnd, handleCancel };
}

export function useTouchInput(
  onMove: (dir: Direction) => void,
): RefObject<HTMLDivElement | null> {
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) {
      return;
    }

    const { handleStart, handleTouchMove, handleEnd, handleCancel } =
      createTouchHandlers(onMove);

    board.addEventListener("touchstart", handleStart);
    board.addEventListener("touchmove", handleTouchMove, { passive: false });
    board.addEventListener("touchend", handleEnd);
    board.addEventListener("touchcancel", handleCancel);

    return () => {
      board.removeEventListener("touchstart", handleStart);
      board.removeEventListener("touchmove", handleTouchMove);
      board.removeEventListener("touchend", handleEnd);
      board.removeEventListener("touchcancel", handleCancel);
    };
  }, [onMove]);

  return boardRef;
}
