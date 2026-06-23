// Persistence seam.
// Phase 1: best score only. The loadGame/saveGame pair is
// designed-for (phase 2) but intentionally not built.

export interface GameStorage {
  loadBest(): number;
  saveBest(score: number): void;
}

const DEFAULT_BEST_SCORE = 0;
export const BEST_SCORE_KEY = "2048_GAME_BEST_SCORE";

function convertToScoreNumber(rawValue: string | null): number {
  if (rawValue === null) {
    return DEFAULT_BEST_SCORE;
  }

  const scoreValue = Number(rawValue);
  const isValid = Number.isFinite(scoreValue) && scoreValue >= 0;
  return isValid ? scoreValue : DEFAULT_BEST_SCORE;
}

export function createLocalStorage(): GameStorage {
  return {
    loadBest() {
      try {
        const rawValue = localStorage.getItem(BEST_SCORE_KEY);
        return convertToScoreNumber(rawValue);
      } catch {
        return DEFAULT_BEST_SCORE;
      }
    },
    saveBest(score: number) {
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(score));
      } catch {}
    },
  };
}
