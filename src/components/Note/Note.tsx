import type { ReactNode } from 'react';
import styles from './Note.module.css';

interface NoteProps {
  children: ReactNode;
}

export function Note({ children }: NoteProps) {
  return <p className={styles.note}>{children}</p>;
}
