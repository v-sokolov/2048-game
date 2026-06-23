import { memo } from "react";
import styles from "./Tile.module.css";

interface TileProps {
  id: string;
  value: number;
}

export const Tile = memo(({ id, value }: TileProps) => (
  <div data-tile-id={id} className={`${styles.tile} tile--${value}`}>
    {value}
  </div>
));
