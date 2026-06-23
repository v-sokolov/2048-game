import { afterEach, beforeEach, vi } from "vitest";
import { BEST_SCORE_KEY, createLocalStorage } from "@/services/storage/storage";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("createLocalStorage", () => {
  it("loadBest defaults to 0 when nothing is stored", () => {
    expect(createLocalStorage().loadBest()).toBe(0);
  });

  it("round-trips a saved value", () => {
    const s = createLocalStorage();
    s.saveBest(1024);
    expect(s.loadBest()).toBe(1024);
  });

  it("returns 0 for a corrupt stored value", () => {
    localStorage.setItem(BEST_SCORE_KEY, "not-a-number");
    expect(createLocalStorage().loadBest()).toBe(0);
  });

  it("returns 0 for a negative stored value", () => {
    localStorage.setItem(BEST_SCORE_KEY, "-5");
    expect(createLocalStorage().loadBest()).toBe(0);
  });

  it("swallows write errors (storage unavailable)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    expect(() => createLocalStorage().saveBest(10)).not.toThrow();
  });
});
