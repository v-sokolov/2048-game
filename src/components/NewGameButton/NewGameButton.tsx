import styles from "./NewGameButton.module.css";

interface NewGameButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function NewGameButton({ disabled, onClick }: NewGameButtonProps) {
  return (
    <button
      type="button"
      className={styles.newGame}
      onClick={onClick}
      disabled={disabled}
    >
      New Game
    </button>
  );
}
