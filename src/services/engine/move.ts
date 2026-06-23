import { newId } from "./id";
import { buildGrid } from "./grid";
import { BOARD_SIZE } from "./types";
import type {
  Direction,
  GameState,
  MergeEvent,
  MoveResult,
  Tile,
} from "./types";

// One output cell of a collapsed line. Position is filled later by move().
interface Slot {
  id: string;
  value: number;
  merge?: { sourceIds: [string, string] };
}

/**
 * Collapse one destination-first line (see cellFor): drop gaps, then merge
 * equal neighbours with the one-merge-per-tile lock. Pure.
 */
function collapseLine(line: ReadonlyArray<Tile | null>): {
  slots: Slot[];
  gained: number;
} {
  const input = line.filter((tile): tile is Tile => tile !== null);
  const slots: Slot[] = [];
  let gained = 0;

  for (let i = 0; i < input.length; i++) {
    const current = input[i];
    const next = input[i + 1];
    if (next && current.value === next.value) {
      const value = current.value * 2;

      slots.push({
        id: newId(),
        value,
        merge: { sourceIds: [current.id, next.id] },
      });

      gained += value;
      i++; // skip the consumed partner → at most one merge per tile
    } else {
      slots.push({ id: current.id, value: current.value });
    }
  }

  return { slots, gained };
}

/** Map a line index + position to [row, col]. Position is destination-first: 0 is the edge tiles slide toward. */
function cellFor(
  dir: Direction,
  lineIndex: number,
  position: number,
): [number, number] {
  const last = BOARD_SIZE - 1;
  switch (dir) {
    case "left":
      return [lineIndex, position];
    case "right":
      return [lineIndex, last - position];
    case "up":
      return [position, lineIndex];
    case "down":
      return [last - position, lineIndex];
  }
}

/** Read one destination-first line off the grid (see cellFor). */
function readLine(
  grid: (Tile | null)[][],
  dir: Direction,
  lineIndex: number,
): (Tile | null)[] {
  const line: (Tile | null)[] = [];
  for (let position = 0; position < BOARD_SIZE; position++) {
    const [row, col] = cellFor(dir, lineIndex, position);
    line.push(grid[row][col]);
  }
  return line;
}

/** Place a collapsed line's slots back onto the board, emitting tiles and merge events. */
function placeSlots(
  slots: Slot[],
  dir: Direction,
  lineIndex: number,
  newTiles: Tile[],
  merges: MergeEvent[],
): void {
  for (let position = 0; position < slots.length; position++) {
    const slot = slots[position];
    const [row, col] = cellFor(dir, lineIndex, position);
    newTiles.push({ id: slot.id, value: slot.value, row, col });
    if (slot.merge) {
      merges.push({
        resultId: slot.id,
        sourceIds: slot.merge.sourceIds,
        value: slot.value,
        row,
        col,
      });
    }
  }
}

/** The result for a move that changed nothing — the board is untouched. */
function invalidResult(dir: Direction): MoveResult {
  return {
    isValid: false,
    direction: dir,
    scoreGained: 0,
    merges: [],
    spawned: null,
  };
}

/**
 * Apply a directional move. Deterministic and pure — no spawning, no randomness.
 * Normalizes all four directions to a single "collapse toward index 0" routine
 * via cellFor(). Returns the next state plus a MoveResult animation channel.
 * On an invalid (no-change) move, returns the SAME state reference.
 */
export function move(
  state: GameState,
  dir: Direction,
): { state: GameState; result: MoveResult } {
  const grid = buildGrid(state.tiles);
  const newTiles: Tile[] = [];
  const merges: MergeEvent[] = [];
  let gained = 0;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex++) {
    const { slots, gained: lineGained } = collapseLine(
      readLine(grid, dir, lineIndex),
    );

    gained += lineGained;

    placeSlots(slots, dir, lineIndex, newTiles, merges);
  }

  // Valid iff a merge happened (tile count dropped) or some tile slid.
  const origById = new Map(state.tiles.map((tile) => [tile.id, tile]));
  const hasMoved = (tile: Tile) => {
    const original = origById.get(tile.id);
    return (
      !!original && (original.row !== tile.row || original.col !== tile.col)
    );
  };
  const changed = merges.length > 0 || newTiles.some(hasMoved);

  if (!changed) {
    return { state, result: invalidResult(dir) };
  }

  return {
    state: {
      tiles: newTiles,
      score: state.score + gained,
      status: state.status,
    },
    result: {
      isValid: true,
      direction: dir,
      scoreGained: gained,
      merges,
      spawned: null,
    },
  };
}
