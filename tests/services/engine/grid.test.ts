import { buildGrid, getEmptyCells } from "@/services/engine/grid";
import { BOARD_SIZE } from "@/services/engine";
import { CELLS, fullState, tileAt } from "../../utils/board";

describe("buildGrid", () => {
  it("places each tile at its [row][col] and leaves the rest null", () => {
    const a = tileAt("a", 0, 0);
    const b = tileAt("b", 3, 2);
    const grid = buildGrid([a, b]);

    expect(grid).toHaveLength(BOARD_SIZE);
    expect(grid[0][0]).toBe(a);
    expect(grid[3][2]).toBe(b);
    expect(grid[1][1]).toBeNull();
  });

  it("returns an all-null grid for no tiles", () => {
    const grid = buildGrid([]);
    expect(grid.flat().every((c) => c === null)).toBe(true);
    expect(grid.flat()).toHaveLength(CELLS);
  });
});

describe("getEmptyCells", () => {
  it("lists every cell when the board is empty, row-major", () => {
    const cells = getEmptyCells([]);
    expect(cells).toHaveLength(CELLS);
    expect(cells[0]).toEqual({ row: 0, col: 0 });
    expect(cells[1]).toEqual({ row: 0, col: 1 });
  });

  it("omits occupied cells", () => {
    const cells = getEmptyCells([tileAt("a", 0, 0), tileAt("b", 0, 1)]);
    expect(cells).toHaveLength(CELLS - 2);
    expect(cells).not.toContainEqual({ row: 0, col: 0 });
    expect(cells).not.toContainEqual({ row: 0, col: 1 });
  });

  it("returns nothing for a full board", () => {
    expect(getEmptyCells(fullState().tiles)).toEqual([]);
  });
});
