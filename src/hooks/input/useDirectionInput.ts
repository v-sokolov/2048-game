import type { RefObject } from "react";
import type { Direction } from "@services/engine";
import { useKeyboardInput } from "./useKeyboardInput";
import { useTouchInput } from "./useTouchInput";

// All board input → onMove. Touch is element-scoped so it returns the board ref
// to attach; keyboard is window-bound (void). The ref is forwarded to the caller.
export function useDirectionInput(
  onMove: (dir: Direction) => void,
): RefObject<HTMLDivElement | null> {
  useKeyboardInput(onMove);
  const boardRef = useTouchInput(onMove);

  return boardRef;
}
