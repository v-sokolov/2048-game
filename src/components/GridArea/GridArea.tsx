import { memo, type CSSProperties } from "react";
import { BOARD_SIZE, type Tile as TileData } from "@services/engine";
import { Tile } from "..";
import styles from "./GridArea.module.css";

// Background grid — N×N indices used only as React keys.
const CELLS = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => i);

interface GridAreaProps {
  tiles: readonly TileData[];
}

export const GridArea = memo(({ tiles }: GridAreaProps) => (
  <div className={styles.grid}>
    <GridCells />
    <div className={styles.tileLayer}>
      {tiles.map((tile) => (
        <PositionedTile key={tile.id} tile={tile} />
      ))}
    </div>
  </div>
));

const GridCells = memo(() => (
  <div className={styles.cells}>
    {CELLS.map((i) => (
      <div key={i} className={styles.cell} />
    ))}
  </div>
));

const PositionedTile = memo(({ tile }: { tile: TileData }) => (
  <div
    className={styles.tileSlot}
    style={{ "--row": tile.row, "--col": tile.col } as CSSProperties}
  >
    <Tile id={tile.id} value={tile.value} />
  </div>
));
