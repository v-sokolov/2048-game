import { memo } from "react";
import styles from "./Tile.module.css";

interface TileProps {
  id: string;
  /* A known power of two (2–2048). Omitted/undefined/out-of-set → empty variant. */
  value?: number;
}

const KNOWN_VALUES = new Set([2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]);

export const Tile = memo(({ id, value }: TileProps) => {
  const hasValue = value !== undefined && KNOWN_VALUES.has(value);
  const variantClass = hasValue ? `tile--${value}` : "tile--empty";

  return (
    <div data-tile-id={id} className={`${styles.tile} ${variantClass}`}>
      {hasValue ? value : null}
    </div>
  );
});
