import styles from "./GameOverlay.module.css";

interface GameOverlayProps {
  variant: "lose" | "win";
  onAction: () => void;
}

export function GameOverlay({ variant, onAction }: GameOverlayProps) {
  const message = variant === "lose" ? "Game Over!" : "You Win!";
  const actionLabel = variant === "lose" ? "Try Again" : "Continue";

  return (
    <div className={styles.overlay}>
      <p className={styles.message}>{message}</p>
      <button className={styles.action} onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
