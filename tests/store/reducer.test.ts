import { reducer } from "@/store/reducer";
import type { ReducerState } from "@/store/actions";
import { deadlockState, makeState, tileAt } from "../utils/board";

function session(over: Partial<ReducerState> = {}): ReducerState {
  return {
    game: makeState([tileAt("a", 0, 0)]),
    history: [],
    best: 0,
    ...over,
  };
}

describe("reducer — COMMIT_MOVE", () => {
  it("pushes the prior board onto history (structural sharing)", () => {
    const s = session();
    const next = makeState([tileAt("b", 0, 0, 4)], 4);
    const out = reducer(s, { type: "COMMIT_MOVE", next });
    expect(out.history).toHaveLength(1);
    expect(out.history[0]).toBe(s.game); // same reference reused
    expect(out.game.tiles).toBe(next.tiles);
  });

  it("raises best when the new score exceeds it", () => {
    const out = reducer(session({ best: 10 }), { type: "COMMIT_MOVE", next: makeState([], 25) });
    expect(out.best).toBe(25);
  });

  it("keeps best when the new score is lower", () => {
    const out = reducer(session({ best: 99 }), { type: "COMMIT_MOVE", next: makeState([], 25) });
    expect(out.best).toBe(99);
  });

  it("does not mutate the input state", () => {
    const s = session();
    const frozen = JSON.stringify(s);
    reducer(s, { type: "COMMIT_MOVE", next: makeState([], 8) });
    expect(JSON.stringify(s)).toBe(frozen);
  });

  it("stamps status 'playing' for an ordinary move", () => {
    const out = reducer(session(), { type: "COMMIT_MOVE", next: makeState([tileAt("x", 0, 0, 8)], 8) });
    expect(out.game.status).toBe("playing");
  });
});

describe("reducer — status derivation (nextStatus)", () => {
  it("flips to won the first time a 2048 tile appears", () => {
    const won = makeState([tileAt("w", 0, 0, 2048)], 2048);
    const out = reducer(session(), { type: "COMMIT_MOVE", next: won });
    expect(out.game.status).toBe("won");
  });

  it("flips to lost on a full deadlocked board", () => {
    const out = reducer(session(), { type: "COMMIT_MOVE", next: deadlockState(100) });
    expect(out.game.status).toBe("lost");
  });

  it("won is terminal — later commits keep the won status", () => {
    const wonSession = session({ game: makeState([tileAt("w", 0, 0, 2048)], 2048, "won") });
    const out = reducer(wonSession, { type: "COMMIT_MOVE", next: deadlockState(200) });
    expect(out.game.status).toBe("won");
  });

  it("lost is terminal — later commits keep the lost status", () => {
    const lostSession = session({ game: makeState([tileAt("x", 0, 0)], 0, "lost") });
    const out = reducer(lostSession, { type: "COMMIT_MOVE", next: makeState([tileAt("y", 0, 0, 4)], 4) });
    expect(out.game.status).toBe("lost");
  });
});

describe("reducer — UNDO", () => {
  it("pops history into the current game", () => {
    const prior = makeState([tileAt("p", 1, 1)]);
    const s = session({ game: makeState([tileAt("c", 0, 0, 4)], 4), history: [prior] });
    const out = reducer(s, { type: "UNDO" });
    expect(out.game).toBe(prior);
    expect(out.history).toHaveLength(0);
  });

  it("discards a spawned tile by restoring the pre-move snapshot", () => {
    // history holds the pre-move board (2 tiles); current has the post-move+spawn board (3 tiles).
    const preMove = makeState([tileAt("a", 0, 0), tileAt("b", 0, 1)]);
    const postSpawn = makeState([tileAt("m", 0, 0, 4), tileAt("spawned", 3, 3)], 4);
    const s = session({ game: postSpawn, history: [preMove] });
    const out = reducer(s, { type: "UNDO" });
    expect(out.game.tiles).toHaveLength(2);
    expect(out.game.tiles.some((t) => t.id === "spawned")).toBe(false);
  });

  it("is a no-op when history is empty", () => {
    const s = session();
    expect(reducer(s, { type: "UNDO" })).toBe(s);
  });
});

describe("reducer — NEW_GAME", () => {
  it("resets to the initial board, clears history, retains best", () => {
    const initial = makeState([tileAt("n1", 0, 0), tileAt("n2", 1, 1)]);
    const s = session({ best: 500, game: makeState([], 0, "won"), history: [makeState([])] });
    const out = reducer(s, { type: "NEW_GAME", initial });
    expect(out.game).toBe(initial);
    expect(out.game.status).toBe("playing");
    expect(out.history).toHaveLength(0);
    expect(out.best).toBe(500);
  });
});
