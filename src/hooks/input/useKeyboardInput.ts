import { useEffect } from "react";
import type { Direction } from "@services/engine";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

// Keyboard arrow input on window → onMove.
export function useKeyboardInput(onMove: (dir: Direction) => void): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();
      onMove(direction);
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onMove]);
}
