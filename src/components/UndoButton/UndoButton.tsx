import UndoIcon from '@assets/undo.svg?react';
import styles from './UndoButton.module.css';

interface UndoButtonProps {
  onClick: () => void;
  isDisabled: boolean;
}

export function UndoButton({ onClick, isDisabled }: UndoButtonProps) {
  return (
    <div className={styles.platform}>
      <button
        type="button"
        className={styles.undo}
        onClick={onClick}
        disabled={isDisabled}
        aria-label="Undo"
      >
        <UndoIcon className={styles.icon} aria-hidden="true" />
      </button>
    </div>
  );
}
