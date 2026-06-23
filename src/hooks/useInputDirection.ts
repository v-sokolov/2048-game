import { useEffect } from "react";
import type { Direction } from "../services/engine";

// Input-source-agnostic mapping. Phase 1: keyboard arrows.
// Phase 2 (designed-for): touchstart/touchend swipe vector → nearest Direction.
const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export function useInputDirection(onMove: (dir: Direction) => void): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const dir = KEY_TO_DIRECTION[event.key];
      if (!dir) {
        return;
      }

      event.preventDefault();
      onMove(dir);
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onMove]);
}
