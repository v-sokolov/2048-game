import { isLost, isWon } from "@/services/engine";
import { boardOf, deadlockState, makeState, tileAt } from "../../utils/board";

describe("isWon", () => {
  it("is true when a 2048 tile exists", () => {
    expect(isWon(makeState([tileAt("a", 0, 0, 2048)]))).toBe(true);
  });
  it("is false otherwise", () => {
    expect(isWon(makeState([tileAt("a", 0, 0, 1024)]))).toBe(false);
  });
});

describe("isLost", () => {
  it("is false when the board is not full", () => {
    expect(isLost(makeState([tileAt("a", 0, 0)]))).toBe(false);
  });

  it("is true when full and no equal adjacent pair (checkerboard 2/4)", () => {
    expect(isLost(deadlockState())).toBe(true);
  });

  it("is false when full but a horizontal merge is still possible", () => {
    const board = [2, 2, 4, 8, 4, 8, 16, 32, 2, 4, 8, 16, 4, 8, 16, 32];
    expect(isLost(boardOf(board))).toBe(false);
  });

  it("is false when full but a vertical merge is still possible", () => {
    const board = [2, 4, 8, 16, 2, 8, 16, 32, 4, 16, 32, 64, 8, 32, 64, 128];
    expect(isLost(boardOf(board))).toBe(false);
  });

  it("correctly identifies board full after isBoardFull refactor", () => {
    const emptyState = makeState([]);
    expect(isLost(emptyState)).toBe(false);

    const fullDeadlockState = deadlockState();
    expect(isLost(fullDeadlockState)).toBe(true);
  });
});
