import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useInputDirection } from "@/hooks/useInputDirection";

function press(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

describe("useInputDirection", () => {
  it("maps arrow keys to directions", () => {
    const onMove = vi.fn();
    renderHook(() => useInputDirection(onMove));
    press("ArrowUp");
    press("ArrowDown");
    press("ArrowLeft");
    press("ArrowRight");
    expect(onMove.mock.calls.map((c) => c[0])).toEqual(["up", "down", "left", "right"]);
  });

  it("ignores non-direction keys", () => {
    const onMove = vi.fn();
    renderHook(() => useInputDirection(onMove));
    press("Enter");
    press("w");
    press("x");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const onMove = vi.fn();
    const { unmount } = renderHook(() => useInputDirection(onMove));
    unmount();
    press("ArrowUp");
    expect(onMove).not.toHaveBeenCalled();
  });
});
