import { memo } from "react";
import type { TileData } from "../../types";
import { Tile } from "..";
import styles from "./GridArea.module.css";

// Mock phase: each slot is a fixed position plus a synthetic, stable id —
// generated once at module load, never on render, so identity stays stable and
// memoization holds (FR-008).
// TODO(store): the data layer will own positions AND ids; drop this and read
// from the incoming TileData[].
const POSITIONS = Array.from({ length: 4 }, (_, row) =>
  Array.from({ length: 4 }, (_, col) => ({
    row,
    col,
    id: crypto.randomUUID(),
  })),
).flat();

interface GridAreaProps {
  // Mock phase: id-less input; ids are synthesized in POSITIONS above.
  // TODO(store): switch to `TileData[]` and read `tile.id` once the data layer
  // owns identity.
  tiles: Omit<TileData, "id">[];
}

export const GridArea = memo(({ tiles }: GridAreaProps) => {
  return (
    <div className={styles.grid}>
      {POSITIONS.map(({ row, col, id }) => {
        // TODO(store): switch to a Map for O(1) lookup once the data layer owns identity.
        const tile = tiles.find((t) => t.row === row && t.col === col);

        if (!tile) {
          return <Tile key={id} id={id} />;
        }

        return <Tile key={id} id={id} value={tile.value} />;
      })}
    </div>
  );
});
