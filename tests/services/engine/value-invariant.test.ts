import { createInitialState, move, spawn } from "@/services/engine";
import type { Direction } from "@/services/engine";

const DIRS: Direction[] = ["left", "up", "right", "down"];

// Power of two ≥ 2: the only values the engine should ever produce (spawn emits
// 2/4, merges double equal tiles). No code path adds unequal values, so 3/7/11
// and friends are unreachable. This pins that against future engine edits.
function isPowerOfTwo(n: number): boolean {
  return n >= 2 && Number.isInteger(Math.log2(n));
}

describe("engine value invariant", () => {
  it("keeps every tile value a power of two across random play", () => {
    // Seeded LCG picks directions so a failure reproduces; spawn keeps its own
    // RNG, exercising both 2 and 4 seeds.
    let seed = 123456789;
    const nextDir = (): Direction => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return DIRS[seed % DIRS.length];
    };

    let state = createInitialState();
    for (const t of state.tiles) {
      expect(isPowerOfTwo(t.value), `seed value ${t.value}`).toBe(true);
    }

    for (let i = 0; i < 500; i++) {
      const { state: moved, result } = move(state, nextDir());
      if (!result.isValid) continue;

      state = spawn(moved).state;
      for (const t of state.tiles) {
        expect(isPowerOfTwo(t.value), `move ${i}: value ${t.value}`).toBe(true);
      }
    }
  });
});
