import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useKeyboardInput } from "@/hooks/input/useKeyboardInput";

function press(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

describe("useKeyboardInput", () => {
  it("maps arrow keys to directions", () => {
    const onMove = vi.fn();
    renderHook(() => useKeyboardInput(onMove));
    press("ArrowUp");
    press("ArrowDown");
    press("ArrowLeft");
    press("ArrowRight");
    expect(onMove.mock.calls.map((c) => c[0])).toEqual(["up", "down", "left", "right"]);
  });

  it("ignores non-direction keys", () => {
    const onMove = vi.fn();
    renderHook(() => useKeyboardInput(onMove));
    press("Enter");
    press("w");
    press("x");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const onMove = vi.fn();
    const { unmount } = renderHook(() => useKeyboardInput(onMove));
    unmount();
    press("ArrowUp");
    expect(onMove).not.toHaveBeenCalled();
  });
});
