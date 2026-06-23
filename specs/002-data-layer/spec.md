# Feature Specification: 2048 Data Layer

**Feature Branch**: `002-data-layer`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Immutable, stable data layer for the 2048 game: pure game engine, state-orchestration hooks, and persistence seam feeding the existing UI components" (design: `docs/superpowers/specs/2026-06-22-2048-data-layer-design.md`)

## Clarifications

### Session 2026-06-23

- Q: Is the grid size a build-time constant or a runtime UI setting? → A: Build-time constant — edit one value and rebuild; no player-facing control.
- Q: Square board (single number) or independent width × height? → A: Square only — one `BOARD_SIZE` constant; the board is always N×N.
- Q: How should the win threshold behave when board size changes? → A: Keep `WIN_VALUE = 2048` fixed and independent of board size.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a move (slide, merge, score, spawn) (Priority: P1)

A player presses a direction (up/down/left/right). Every tile slides as far as it can that way; two touching tiles of equal value combine into one tile of double the value; the combined value is added to the score; and one new tile appears in a random empty cell. The player sees tiles glide to their new spots and merged/new tiles pop in.

**Why this priority**: This is the entire game loop. Without it there is no playable 2048. It is the minimum viable, demonstrable slice — everything else builds on it.

**Independent Test**: Start from a known board, issue each of the four directions, and confirm the resulting tile positions, score increase, and a single new tile appearing — fully verifiable on its own.

**Acceptance Scenarios**:

1. **Given** a row `[2, 2, _, _]` and a left move, **When** the move is applied, **Then** the tiles combine into a single `4` at the far-left cell and the score increases by 4.
2. **Given** a row `[2, 2, 2, _]` and a left move, **When** the move is applied, **Then** the result is `[4, 2, _, _]` — only the first pair merges (one merge per tile per move).
3. **Given** a row `[4, 4, 4, 4]` and a left move, **When** the move is applied, **Then** the result is `[8, 8, _, _]` and the score increases by 16.
4. **Given** any move that changes the board, **When** it completes, **Then** exactly one new tile (value 2 or 4) appears in a previously empty cell.
5. **Given** a board where the pressed direction moves and merges nothing (no tile changes position, no merge possible), **When** the player presses it, **Then** the board is unchanged, the score is unchanged, and no new tile appears.
6. **Given** a tile that moved without merging, **When** the move completes, **Then** that tile retains its identity (its on-screen element animates from old to new position rather than being replaced).
7. **Given** a row `[2, _, _, 4]` and a left move, **When** the move is applied, **Then** the tiles slide to `[2, 4, _, _]` but, because nothing merged, the score increases by 0 (only merges score).

---

### User Story 2 - Win and lose (Priority: P2)

When a tile reaches 2048 the player is congratulated and the game is won. When no move is possible (the board is full and no adjacent tiles are equal), the game is over. Won and lost are both terminal: the only way forward from either is to start a new game.

**Why this priority**: Gives the game an outcome and a goal. The core loop (P1) is playable and demonstrable without it, but the game is incomplete without win/lose resolution.

**Independent Test**: Drive a board to a 2048 tile and confirm the win state appears and persists; arrange a full deadlocked board and confirm the game-over state.

**Acceptance Scenarios**:

1. **Given** a move that first creates a 2048 tile, **When** the move completes, **Then** the game reports a "won" state and the winning board is shown.
2. **Given** a won game, **When** later state is evaluated, **Then** it remains "won" until the player starts a new game.
3. **Given** a full board with no two equal adjacent tiles, **When** the state is evaluated, **Then** the game reports a "lost" state.
4. **Given** a full board that still has at least one pair of equal adjacent tiles, **When** the state is evaluated, **Then** the game is still playable (not lost).

---

### User Story 3 - Undo, New Game, and remembered best score (Priority: P3)

The player can undo their last move(s), start a fresh game at any time, and always see their best score, which survives starting a new game and reloading the page.

**Why this priority**: Quality-of-life and persistence. Valuable but not required for a demonstrable, winnable game.

**Independent Test**: Make several moves and undo them back to the start; start a new game and confirm the board resets while best score is retained; reach a score above the previous best, reload, and confirm best score persists.

**Acceptance Scenarios**:

1. **Given** the player has made one or more moves, **When** they undo, **Then** the board, score, and game status return to exactly the state before the most recent move.
2. **Given** no moves have been made since the game started, **When** the player attempts to undo, **Then** nothing changes (undo is unavailable).
3. **Given** a game in progress, **When** the player starts a new game, **Then** the board resets to a fresh start (two tiles), the current score resets to zero, and the best score is retained.
4. **Given** the player's current score exceeds the stored best, **When** the page is reloaded, **Then** the best score is still shown.

---

### Edge Cases

- **Spawn distribution**: new tiles are 2 (90% of the time) or 4 (10% of the time).
- **Full board after a valid move**: a move that fills the last empty cell is allowed; the loss check runs afterward and may immediately end the game.
- **No empty cell to spawn into**: only possible after an invalid (no-change) move, which does not trigger a spawn — so a valid move always has a cell to spawn into.
- **Undo across a spawn**: undo restores the pre-move board, discarding both the move's result and its spawned tile.
- **Win is terminal**: once won, the game stays won until a new game (no continue-past-win in this phase).
- **Corrupt or unavailable stored best score**: the game starts with a best score of 0 and continues without error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST represent the board as a collection of tiles, each carrying a stable identity, a value, and a grid position.
- **FR-002**: A tile's identity MUST remain stable across a move when the tile only slides (does not merge), so the UI can animate it from its old to its new position.
- **FR-003**: System MUST apply a directional move by sliding every tile as far as possible in the chosen direction before merging.
- **FR-004**: System MUST merge two adjacent equal-valued tiles in the move direction into a single tile of double the value, and MUST merge each tile at most once per move.
- **FR-005**: A merge MUST produce a tile with a new identity (distinct from both consumed tiles) so the UI can animate the two sources sliding together and the result popping in.
- **FR-006**: System MUST increase the score by the value of each newly created merged tile.
- **FR-007**: System MUST classify each attempted move as valid (at least one tile moved or merged) or invalid (board unchanged).
- **FR-008**: After a valid move only, System MUST spawn exactly one new tile (value 2 at ~90%, value 4 at ~10%) in a uniformly chosen empty cell.
- **FR-009**: After an invalid move, System MUST leave board, score, and status unchanged and MUST NOT spawn a tile or record history.
- **FR-010**: System MUST report, for each valid move, enough information to animate it: which tiles merged (sources and result) and which tile spawned.
- **FR-011**: System MUST detect the won state the first time a 2048-valued tile exists.
- **FR-012**: System MUST treat won and lost as terminal states that persist on subsequent moves until the player starts a new game.
- **FR-013**: System MUST detect the lost state when the board is full and no two adjacent tiles are equal, using a direct structural check (not by trial-running all four moves).
- **FR-014**: System MUST allow undo of the most recent move(s), restoring the prior board, score, and status exactly; undo MUST be unavailable when no moves have been made.
- **FR-015**: System MUST allow starting a new game that resets the board (two starting tiles), score, history, and status, while retaining the best score.
- **FR-016**: System MUST track a best score that is the maximum score reached, persist it, and restore it on reload; a missing or unreadable stored value MUST default to 0 without error.
- **FR-017**: A new game MUST begin with exactly two tiles placed on an otherwise empty board.
- **FR-018**: Every state transition MUST produce new state values without mutating prior states, so that history snapshots remain intact for undo.
- **FR-019**: The game-rules logic MUST be free of any user-interface dependency; the UI layer may consume it but the rules MUST NOT reference UI primitives.
- **FR-020**: System MUST expose current tiles, current score, best score, and game status to the presentation layer.
- **FR-021**: System MUST express the square board's dimension as build-time constants — `BOARD_SIZE` (default 4) for all logic, and a matching `--board-size` CSS custom property for layout. All grid logic (move/merge index mapping, empty-cell scanning, loss detection) and the count of rendered background cells MUST derive from `BOARD_SIZE`; all CSS track counts and cell sizing MUST derive from `--board-size`. Resizing the board MUST require changing only those two constants to the same value — no other source or style edits. The win threshold (`WIN_VALUE`, fixed at 2048) is a separate constant, independent of board size.

### Key Entities *(include if feature involves data)*

- **Tile**: A single game piece. Stable identity, a numeric value (a power of two), and a 0–3 row/column position on the 4×4 grid.
- **Game State**: One board situation — the set of current tiles, the current score, and the game status (playing / won / lost).
- **Move Result**: A description of one applied move for animation purposes — whether it was valid, its direction, score gained, the merges that occurred (source identities and result), and the tile that spawned.
- **Session State**: The wrapper the player interacts with over time — the current game state, the undo history of prior states, and the best score. (The latest Move Result is returned transiently by a move for animation, not stored in session state.)
- **Stored Best Score**: The single persisted value that survives new games and page reloads.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any starting board and direction, the resulting tile positions, score change, and spawn match the standard 2048 rules in 100% of tested cases (including the two worked examples in the logic design).
- **SC-002**: A move that changes the board always results in exactly one new tile; a move that does not change the board never adds a tile — verified across all four directions.
- **SC-003**: Each tile is merged at most once per move in 100% of cases.
- **SC-004**: A player who reaches 2048 sees the won state, which persists until they start a new game.
- **SC-005**: Undo returns to the exact prior state (board, score, status) in 100% of cases, and is unavailable at game start.
- **SC-006**: Best score is retained across a new game and across a page reload in 100% of cases, and defaults to 0 when no valid stored value exists.
- **SC-007**: All game-rules logic paths have automated test coverage, and the rules module has zero imports from the UI layer.
- **SC-008**: A single move resolves within one animation frame (≤16ms) so there is no perceptible delay between input and the board responding.
- **SC-009**: Changing the two board-size constants (`BOARD_SIZE` and the `--board-size` CSS property) to the same new value (e.g., 5 or 6) and rebuilding produces a correct, playable N×N board — engine results, background-cell count, and rendered layout all reflect N — with no other source or CSS changes required.

## Assumptions

- The board is square (N×N), sized by a single build-time constant `BOARD_SIZE` (default 4); engine math, background-cell count, and CSS layout all derive from it. Changing the size is a code-and-rebuild change, not a runtime or player-facing setting. The public shape and stored representation are board-size-independent.
- Tile values are powers of two; the win threshold is 2048.
- New-tile distribution is fixed at 90% value-2 / 10% value-4.
- Persistence in this phase covers the best score only; full-game resume (board + score + history across reloads) is designed-for but out of scope.
- Input handling (keyboard now, touch/swipe later) is abstracted so the same move logic serves any input source.
- The existing UI component layer (from feature 001) consumes this data layer; no new UI components are introduced here.
- Randomness for spawning lives inside the spawn step using the platform's standard random source; tests exercise it by stubbing that source rather than injecting a generator.

## Out of Scope (this phase)

- Touch/swipe input (the input abstraction is designed for it, but only keyboard ships now).
- Full-game persistence and resume on reload (only best score is persisted).
- Shared-state context providers (prop-drilling from a single composition root suffices for one board).
- Runtime/player-selectable board size (the size is a build-time constant only), non-square boards, and alternate or board-size-scaled win thresholds (`WIN_VALUE` stays fixed at 2048).
