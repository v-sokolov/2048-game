import {
  Playground,
  Logo,
  Score,
  NewGameButton,
  UndoButton,
  GridArea,
  GameOverlay,
  Note,
} from "..";
import { useGame } from "@hooks/useGame";
import styles from "./App.module.css";

export function App() {
  const {
    tiles,
    currentScore,
    bestScore,
    status,
    isEmptyHistory,
    boardRef,
    handleUndo,
    handleNewGame,
  } = useGame();

  const isGameOver = status === "lost";

  return (
    <Playground>
      <header className={styles.header}>
        <Logo />
        <div className={styles.scores}>
          <Score type="score" value={currentScore} />
          <Score type="best" value={bestScore} />
        </div>
        <NewGameButton disabled={isEmptyHistory} onClick={handleNewGame} />
      </header>

      <Note>
        Use your arrow keys or touch swipes to slide the tiles. Tiles with the
        same number merge into one when they touch - combine them to reach 2048!
      </Note>

      <div className={styles.board} ref={boardRef}>
        <GridArea tiles={tiles} />
        <GameOverlay status={status} onNewGame={handleNewGame} />
      </div>

      <UndoButton
        onClick={handleUndo}
        isDisabled={isEmptyHistory || isGameOver}
      />

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
