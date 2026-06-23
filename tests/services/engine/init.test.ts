import { BOARD_SIZE, createInitialState } from "@/services/engine";

describe("createInitialState", () => {
  it("starts with exactly two tiles", () => {
    expect(createInitialState().tiles).toHaveLength(2);
  });

  it("starts playing with a zero score", () => {
    const state = createInitialState();
    expect(state.status).toBe("playing");
    expect(state.score).toBe(0);
  });

  it("seeds only values from {2, 4}", () => {
    for (const tile of createInitialState().tiles) {
      expect([2, 4]).toContain(tile.value);
    }
  });

  it("places the two tiles in distinct cells", () => {
    const [a, b] = createInitialState().tiles;
    expect(a.row * BOARD_SIZE + a.col).not.toBe(b.row * BOARD_SIZE + b.col);
  });
});
