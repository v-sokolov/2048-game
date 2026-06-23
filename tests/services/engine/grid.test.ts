import {
  Grid,
  buildGridFromTiles,
  findEmptyCells,
} from "@/services/engine/grid";
import { BOARD_SIZE } from "@/services/engine";
import { CELLS, fullState, tileAt } from "../../utils/board";

describe("Grid", () => {
  it("round-trips a value through setCellAt / getCellAt", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    grid.setCellAt({ row: 1, col: 2, value: "tile" });
    expect(grid.getCellAt({ row: 1, col: 2 })).toBe("tile");
  });

  it("reads an unset cell as undefined", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    expect(grid.getCellAt({ row: 0, col: 0 })).toBeUndefined();
  });

  it("clears a cell back to undefined", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    grid.setCellAt({ row: 0, col: 0, value: "tile" });
    grid.setCellAt({ row: 0, col: 0, value: undefined });
    expect(grid.getCellAt({ row: 0, col: 0 })).toBeUndefined();
  });

  it("returns undefined for off-grid coordinates instead of throwing", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    expect(grid.getCellAt({ row: -1, col: 0 })).toBeUndefined();
    expect(grid.getCellAt({ row: 0, col: -1 })).toBeUndefined();
    expect(grid.getCellAt({ row: BOARD_SIZE, col: 0 })).toBeUndefined();
    expect(grid.getCellAt({ row: 0, col: BOARD_SIZE })).toBeUndefined();
  });

  it("reports membership via isWithinBounds", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    expect(grid.isWithinBounds({ row: 0, col: 0 })).toBe(true);
    expect(
      grid.isWithinBounds({ row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 }),
    ).toBe(true);
    expect(grid.isWithinBounds({ row: -1, col: 0 })).toBe(false);
    expect(grid.isWithinBounds({ row: 0, col: BOARD_SIZE })).toBe(false);
  });

  it("visits every cell once in row-major order", () => {
    const grid = new Grid<string>(BOARD_SIZE);
    grid.setCellAt({ row: 0, col: 1, value: "a" });
    grid.setCellAt({ row: 2, col: 0, value: "b" });

    const visited: Array<{ cell: string | undefined; row: number; col: number }> =
      [];
    grid.forEachCell((cell, row, col) => visited.push({ cell, row, col }));

    expect(visited).toHaveLength(CELLS);
    expect(visited[0]).toEqual({ cell: undefined, row: 0, col: 0 });
    expect(visited[1]).toEqual({ cell: "a", row: 0, col: 1 });
    expect(visited[CELLS - 1]).toEqual({
      cell: undefined,
      row: BOARD_SIZE - 1,
      col: BOARD_SIZE - 1,
    });
  });
});

describe("buildGridFromTiles", () => {
  it("places each tile at its (row, col) and leaves the rest undefined", () => {
    const a = tileAt("a", 0, 0);
    const b = tileAt("b", 3, 2);
    const grid = buildGridFromTiles({ tiles: [a, b] });

    expect(grid.sideLength).toBe(BOARD_SIZE);
    expect(grid.getCellAt({ row: 0, col: 0 })).toBe(a);
    expect(grid.getCellAt({ row: 3, col: 2 })).toBe(b);
    expect(grid.getCellAt({ row: 1, col: 1 })).toBeUndefined();
  });

  it("returns an all-empty grid for no tiles", () => {
    const grid = buildGridFromTiles({ tiles: [] });
    let occupied = 0;
    grid.forEachCell((tile) => {
      if (tile) occupied++;
    });
    expect(occupied).toBe(0);
  });
});

describe("findEmptyCells", () => {
  it("lists every cell when the board is empty, row-major", () => {
    const cells = findEmptyCells({ tiles: [] });
    expect(cells).toHaveLength(CELLS);
    expect(cells[0]).toEqual({ row: 0, col: 0 });
    expect(cells[1]).toEqual({ row: 0, col: 1 });
  });

  it("omits occupied cells", () => {
    const cells = findEmptyCells({ tiles: [tileAt("a", 0, 0), tileAt("b", 0, 1)] });
    expect(cells).toHaveLength(CELLS - 2);
    expect(cells).not.toContainEqual({ row: 0, col: 0 });
    expect(cells).not.toContainEqual({ row: 0, col: 1 });
  });

  it("returns nothing for a full board", () => {
    expect(findEmptyCells({ tiles: fullState().tiles })).toEqual([]);
  });
});
