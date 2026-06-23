import { act, renderHook } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createInitialState, type Direction } from "@/services/engine";
import { BEST_SCORE_KEY } from "@/services/storage/storage";
import { useGame } from "@/hooks/useGame";
import { makeState, tileAt } from "../utils/board";

vi.mock("@/services/engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/engine")>();
  return { ...actual, createInitialState: vi.fn(actual.createInitialState) };
});

const ALL: Direction[] = ["left", "up", "right", "down"];

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useGame", () => {
  it("starts with two tiles, playing, score 0, empty history", () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.tiles).toHaveLength(2);
    expect(result.current.status).toBe("playing");
    expect(result.current.currentScore).toBe(0);
    expect(result.current.isEmptyHistory).toBe(true);
  });

  it("records history once a valid move is made", () => {
    const { result } = renderHook(() => useGame());
    // Separate acts so state updates between moves; ≥1 of the 4 is always valid.
    ALL.forEach((d) => act(() => result.current.handleMove(d)));
    expect(result.current.isEmptyHistory).toBe(false);
  });

  it("ignores moves once the game is terminal (won/lost)", () => {
    // Seed a won board where a left move WOULD be valid (two equal tiles).
    vi.mocked(createInitialState).mockReturnValueOnce(
      makeState([tileAt("a", 0, 0, 2048), tileAt("b", 0, 1, 2048)], 0, "won"),
    );
    const { result } = renderHook(() => useGame());
    expect(result.current.status).toBe("won");

    act(() => result.current.handleMove("left"));

    // Gate blocked the move: no merge to 4096, no history, board untouched.
    expect(result.current.isEmptyHistory).toBe(true);
    expect(result.current.tiles).toHaveLength(2);
    expect(result.current.tiles.every((t) => t.value === 2048)).toBe(true);
  });

  it("keeps undo and newGame referentially stable across renders", () => {
    const { result, rerender } = renderHook(() => useGame());
    const snapshot = {
      undo: result.current.handleUndo,
      newGame: result.current.handleNewGame,
    };
    act(() => result.current.handleMove("left"));
    rerender();
    expect(result.current.handleUndo).toBe(snapshot.undo);
    expect(result.current.handleNewGame).toBe(snapshot.newGame);
  });

  it("undo unwinds back to an empty history", () => {
    const { result } = renderHook(() => useGame());
    ALL.forEach((d) => act(() => result.current.handleMove(d)));
    expect(result.current.isEmptyHistory).toBe(false);
    for (let i = 0; i < 20 && !result.current.isEmptyHistory; i++) {
      act(() => result.current.handleUndo());
    }
    expect(result.current.isEmptyHistory).toBe(true);
  });

  it("newGame resets score & history, keeps a 2-tile board", () => {
    const { result } = renderHook(() => useGame());
    ALL.forEach((d) => act(() => result.current.handleMove(d)));
    act(() => result.current.handleNewGame());
    expect(result.current.isEmptyHistory).toBe(true);
    expect(result.current.currentScore).toBe(0);
    expect(result.current.tiles).toHaveLength(2);
  });

  it("lazy-loads the persisted best score on init", () => {
    localStorage.setItem(BEST_SCORE_KEY, "512");
    const { result } = renderHook(() => useGame());
    expect(result.current.bestScore).toBe(512);
  });

  it("persists the best score via localStorage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderHook(() => useGame());
    expect(setItem).toHaveBeenCalledWith(BEST_SCORE_KEY, expect.any(String));
  });
});
