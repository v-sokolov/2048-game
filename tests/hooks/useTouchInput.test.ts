import { describe, it, expect } from "vitest";
import { getTouchDirection } from "@/hooks/input/useTouchInput";

describe("getTouchDirection", () => {
  it("maps a clear horizontal swipe to left/right", () => {
    expect(getTouchDirection(50, 0)).toBe("right");
    expect(getTouchDirection(-50, 0)).toBe("left");
  });

  it("maps a clear vertical swipe to up/down (screen Y grows downward)", () => {
    expect(getTouchDirection(0, 50)).toBe("down");
    expect(getTouchDirection(0, -50)).toBe("up");
  });

  it("resolves a diagonal by the dominant axis", () => {
    expect(getTouchDirection(50, 20)).toBe("right");
    expect(getTouchDirection(-50, 20)).toBe("left");
    expect(getTouchDirection(20, 50)).toBe("down");
    expect(getTouchDirection(10, -50)).toBe("up");
  });

  it("returns null below the threshold (tap / jitter)", () => {
    expect(getTouchDirection(10, 5)).toBeNull();
    expect(getTouchDirection(20, 0)).toBeNull(); // 20 < default 24
    expect(getTouchDirection(0, 0)).toBeNull();
  });

  it("returns null for an exactly diagonal gesture (ambiguous)", () => {
    expect(getTouchDirection(50, 50)).toBeNull();
    expect(getTouchDirection(-40, 40)).toBeNull();
  });

  it("honours a custom min swipe distance", () => {
    expect(getTouchDirection(20, 0, 10)).toBe("right"); // above custom 10
    expect(getTouchDirection(8, 0, 10)).toBeNull(); // below custom 10
  });
});
