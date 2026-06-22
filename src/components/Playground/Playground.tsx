import type { ReactNode } from 'react';
import styles from './Playground.module.css';

interface PlaygroundProps {
  children: ReactNode;
}

export function Playground({ children }: PlaygroundProps) {
  return <div className={styles.playground}>{children}</div>;
}
