import styles from "./Score.module.css";

interface ScoreProps {
  type: "score" | "best";
  value: number;
}

export function Score({ type, value }: ScoreProps) {
  const label = type === "score" ? "Score" : "Best";

  return (
    <div className={styles.score}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
