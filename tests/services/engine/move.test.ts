import { move } from "@/services/engine";
import type { GameState, Tile } from "@/services/engine";
import { boardFrom } from "../../utils/board";

/** Read a row (row index) as a value array of length 4, 0 for empty. */
function rowValues(tiles: readonly Tile[], row: number): number[] {
  const out = [0, 0, 0, 0];
  for (const t of tiles) if (t.row === row) out[t.col] = t.value;
  return out;
}

function colValues(tiles: readonly Tile[], col: number): number[] {
  const out = [0, 0, 0, 0];
  for (const t of tiles) if (t.col === col) out[t.row] = t.value;
  return out;
}

describe("move — merging (US1 acceptance scenarios)", () => {
  it("[2,2,_,_] left → single 4 at far left, score +4", () => {
    const { state, result } = move(boardFrom([[2, 0, 0], [2, 0, 1]]), "left");
    expect(rowValues(state.tiles, 0)).toEqual([4, 0, 0, 0]);
    expect(result.scoreGained).toBe(4);
    expect(result.isValid).toBe(true);
    expect(result.merges).toHaveLength(1);
  });

  it("[2,2,2,_] left → [4,2,_,_] (one merge per tile)", () => {
    const { state } = move(boardFrom([[2, 0, 0], [2, 0, 1], [2, 0, 2]]), "left");
    expect(rowValues(state.tiles, 0)).toEqual([4, 2, 0, 0]);
  });

  it("[4,4,4,4] left → [8,8,_,_], score +16", () => {
    const { state, result } = move(
      boardFrom([[4, 0, 0], [4, 0, 1], [4, 0, 2], [4, 0, 3]]),
      "left",
    );
    expect(rowValues(state.tiles, 0)).toEqual([8, 8, 0, 0]);
    expect(result.scoreGained).toBe(16);
    expect(result.merges).toHaveLength(2);
  });
});

describe("move — directions", () => {
  it("slides right: [2,_,_,2] → [_,_,_,4]", () => {
    const { state } = move(boardFrom([[2, 0, 0], [2, 0, 3]]), "right");
    expect(rowValues(state.tiles, 0)).toEqual([0, 0, 0, 4]);
  });

  it("merges up: column [2,2,_,_] → [4,_,_,_]", () => {
    const { state } = move(boardFrom([[2, 0, 0], [2, 1, 0]]), "up");
    expect(colValues(state.tiles, 0)).toEqual([4, 0, 0, 0]);
  });

  it("merges down: column [2,2,_,_] → [_,_,_,4]", () => {
    const { state } = move(boardFrom([[2, 0, 0], [2, 1, 0]]), "down");
    expect(colValues(state.tiles, 0)).toEqual([0, 0, 0, 4]);
  });
});

describe("move — identity", () => {
  it("preserves a tile's id when it only slides", () => {
    const { state } = move(boardFrom([[2, 0, 3]]), "left");
    const moved = state.tiles[0];
    expect(moved.id).toBe("seed-0");
    expect(moved.col).toBe(0);
  });

  it("gives a merge result a NEW id distinct from both sources", () => {
    const { state, result } = move(boardFrom([[2, 0, 0], [2, 0, 1]]), "left");
    const merged = state.tiles[0];
    expect(merged.id).not.toBe("seed-0");
    expect(merged.id).not.toBe("seed-1");
    expect(result.merges[0].resultId).toBe(merged.id);
    expect(result.merges[0].sourceIds).toEqual(["seed-0", "seed-1"]);
  });
});

describe("move — validity & purity", () => {
  it("invalid move (no change) returns the same state ref and isValid:false", () => {
    const start = boardFrom([[2, 0, 0], [4, 0, 1]]);
    const { state, result } = move(start, "left");
    expect(result.isValid).toBe(false);
    expect(result.scoreGained).toBe(0);
    expect(state).toBe(start); // same reference, no work committed
  });

  it("does not mutate the input state", () => {
    const start = boardFrom([[2, 0, 0], [2, 0, 1]]);
    const before = JSON.stringify(start);
    move(start, "left");
    expect(JSON.stringify(start)).toBe(before);
  });

  it("carries incoming status through unchanged", () => {
    const start: GameState = { ...boardFrom([[2, 0, 0], [2, 0, 1]]), status: "won" };
    const { state } = move(start, "left");
    expect(state.status).toBe("won");
  });
});
