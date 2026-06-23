import type { GameStatus } from "@services/engine";
import styles from "./GameOverlay.module.css";

interface GameOverlayProps {
  status: GameStatus;
  onNewGame: () => void;
}

export function GameOverlay({ status, onNewGame }: GameOverlayProps) {
  if (status === "playing") {
    return null;
  }

  const message = status === "won" ? "You Win!" : "Game Over!";

  return (
    <div className={styles.overlay}>
      <p className={styles.message}>{message}</p>
      <button className={styles.action} onClick={onNewGame}>
        New Game
      </button>
    </div>
  );
}
