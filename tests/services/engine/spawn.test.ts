import { afterEach, vi } from "vitest";
import { BOARD_SIZE } from "@/services/engine";
import { spawn, PROBABILITY_OF_FOUR } from "@/services/engine/spawn";
import { emptyState, fullState } from "../../utils/board";

afterEach(() => vi.restoreAllMocks());

describe("spawn", () => {
  it("spawns a 2 when the value roll is above the 4-probability", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(PROBABILITY_OF_FOUR + 0.1) // value roll → 2
      .mockReturnValueOnce(0); // cell roll → first empty
    const { spawned } = spawn(emptyState());
    expect(spawned?.value).toBe(2);
  });

  it("spawns a 4 when the value roll is below the 4-probability", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0) // value roll → 4
      .mockReturnValueOnce(0);
    const { spawned } = spawn(emptyState());
    expect(spawned?.value).toBe(4);
  });

  it("places the tile in the chosen empty cell", () => {
    // value roll, then cell roll → last empty cell (index N²−1 = row N−1, col N−1)
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.999);
    const { spawned } = spawn(emptyState());
    expect(spawned).toMatchObject({ row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 });
  });

  it("returns { spawned: null } and the same state when the board is full", () => {
    const full = fullState();
    const { state, spawned } = spawn(full);
    expect(spawned).toBeNull();
    expect(state).toBe(full);
  });

  it("does not mutate the input state", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const input = emptyState();
    const { state } = spawn(input);
    expect(input.tiles).toHaveLength(0);
    expect(state.tiles).toHaveLength(1);
  });

  it("assigns a fresh id to the spawned tile", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { spawned } = spawn(emptyState());
    expect(spawned?.id).toBeTruthy();
  });
});
