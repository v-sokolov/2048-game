import type { TileData } from "../../types";
import {
  Playground,
  Logo,
  Score,
  NewGameButton,
  UndoButton,
  GridArea,
  Note,
} from "..";
import styles from "./App.module.css";

const INITIAL_SCORE = 0;
const BEST_SCORE = 2048;
// TODO: Mock board: all 11 known variants (2–2048) for visual verification (SC-001);
// the remaining 5 slots render the empty Tile variant. Ids are synthesized by
// GridArea for now — the future data layer will own them (TileData.id).
const DUMMY_TILES: Omit<TileData, "id">[] = [
  { value: 2, row: 0, col: 0 },
  { value: 4, row: 0, col: 1 },
  { value: 8, row: 0, col: 2 },
  { value: 16, row: 0, col: 3 },
  { value: 32, row: 1, col: 0 },
  { value: 64, row: 1, col: 1 },
  { value: 128, row: 1, col: 2 },
  { value: 256, row: 1, col: 3 },
  { value: 512, row: 2, col: 0 },
  { value: 1024, row: 2, col: 1 },
  { value: 2048, row: 2, col: 2 },
];

export function App() {
  return (
    <Playground>
      <header className={styles.header}>
        <Logo />
        <div className={styles.scores}>
          <Score type="score" value={INITIAL_SCORE} />
          <Score type="best" value={BEST_SCORE} />
        </div>
        <NewGameButton disabled={INITIAL_SCORE === 0} onClick={() => {}} />
      </header>

      <Note>
        Use your arrow keys or touch swipes to slide the tiles. Tiles with the
        same number merge into one when they touch - combine them to reach 2048!
      </Note>

      <GridArea tiles={DUMMY_TILES} />

      <UndoButton onClick={() => {}} isDisabled />

      <Note>
        Made by Vitalii Sokolov.{" "}
        <a
          href="https://github.com/v-sokolov"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        ·{" "}
        <a
          href="https://www.linkedin.com/in/vitalii-sokolov/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </Note>
    </Playground>
  );
}
