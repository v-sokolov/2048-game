# Tasks: Track Occupied Cells in a Set for O(t) Empty-Cell Lookup

**Input**: Design documents from `/specs/006-occupied-set-optimization/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Brevity** (Constitution VIII): Task list keeps only actionable context; no over-explanation.

**Tests**: Included per Constitution II (TDD-first); tests written and FAIL before implementation.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization (minimal for this refactor)

- [x] T001 Review existing test structure in src/services/engine/grid.test.ts and status.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Write all failing tests before any implementation (TDD-first)

**⚠️ CRITICAL**: All tests MUST be written and FAIL before Phase 3 implementation begins

### Test Setup for buildOccupiedIndices

- [x] T002 [P] Write failing test: buildOccupiedIndices on empty board returns empty Set in src/services/engine/grid.test.ts
- [x] T003 [P] Write failing test: buildOccupiedIndices with single tile at (0,0) returns Set {0} in src/services/engine/grid.test.ts
- [x] T004 [P] Write failing test: buildOccupiedIndices with tiles at all four corners returns correct indices in src/services/engine/grid.test.ts
- [x] T005 [P] Write failing test: buildOccupiedIndices on full board returns Set with size === BOARD_SIZE² in src/services/engine/grid.test.ts
- [x] T006 [P] Write failing test: row-major index round-trip (row, col) → index → (row, col) in src/services/engine/grid.test.ts

### Test Setup for findEmptyCells

- [x] T007 [P] Write failing test: findEmptyCells on empty board returns all N² cells in src/services/engine/grid.test.ts
- [x] T008 [P] Write failing test: findEmptyCells with tiles returns only genuinely empty cells in src/services/engine/grid.test.ts
- [x] T009 [P] Write failing test: findEmptyCells on full board returns empty array in src/services/engine/grid.test.ts

### Test Setup for isBoardFull

- [x] T010 [P] Write failing test: isBoardFull on empty board returns false in src/services/engine/grid.test.ts
- [x] T011 [P] Write failing test: isBoardFull on partially filled board returns false in src/services/engine/grid.test.ts
- [x] T012 [P] Write failing test: isBoardFull on full board returns true in src/services/engine/grid.test.ts

### Integration Test Setup

- [x] T013 [P] Write failing test: isLost behavior unchanged after isBoardFull refactor in src/services/engine/status.test.ts
- [x] T014 [P] Write failing test: spawn still selects only empty cells after findEmptyCells refactor in src/services/engine/spawn.test.ts

**Checkpoint**: All 14 tests are written and FAILING ✗

---

## Phase 3: User Story 1 - Spawn Operation Finds Empty Cells Efficiently (Priority: P1) 🎯 MVP

**Goal**: Implement buildOccupiedIndices and refactor findEmptyCells to use Set-backed lookup instead of O(N²) grid scan

**Independent Test**: New tile spawns only on genuinely empty cells; spawn tests (T014) pass; findEmptyCells tests (T007–T009) pass

### Implementation for User Story 1

- [x] T015 [US1] Implement buildOccupiedIndices(tiles, sideLength) in src/services/engine/grid.ts
  - Accept Tile[] and optional sideLength parameter
  - Return Set<number> of row-major indices: `row * sideLength + col`
  - Make tests T002–T006 pass
  
- [x] T016 [US1] Refactor findEmptyCells to use buildOccupiedIndices in src/services/engine/grid.ts
  - Build occupied-Set via buildOccupiedIndices
  - Iterate through all N² grid indices
  - Include index in result only if NOT in occupied-Set
  - Make tests T007–T009 pass
  - Verify spawn tests (T014) still pass unchanged

**Checkpoint**: User Story 1 complete — spawn works; tests T002–T009 and T014 all pass ✓

---

## Phase 4: User Story 2 - Loss Detection Checks Board-Full in O(1) (Priority: P1)

**Goal**: Implement isBoardFull and integrate into isLost for O(1) board-full check instead of O(N²) scan

**Independent Test**: isLost correctly detects when no empty cells remain; loss detection tests (T013) pass; isBoardFull tests (T010–T012) pass

### Implementation for User Story 2

- [x] T017 [US2] Implement isBoardFull(tiles, sideLength) in src/services/engine/grid.ts
  - Accept Tile[] and optional sideLength parameter
  - Build occupied-Set via buildOccupiedIndices
  - Return `occupied.size === sideLength * sideLength`
  - Make tests T010–T012 pass

- [x] T018 [US2] Integrate isBoardFull into isLost in src/services/engine/status.ts
  - Import isBoardFull from grid.ts
  - Refactor isLost to call isBoardFull(tiles, BOARD_SIZE) before stuck-state check
  - Preserve short-circuit behavior: if board is NOT full, return false immediately
  - Make test T013 pass
  - Verify all existing loss-detection tests still pass unchanged

**Checkpoint**: User Story 2 complete — loss detection works; tests T010–T013 all pass ✓

---

## Phase 5: User Story 3 - Occupied-Set Stays in Sync Across All Game States (Priority: P1)

**Goal**: Verify that occupied-Set faithfully tracks board state across all game scenarios and maintains correctness invariants

**Independent Test**: occupied-Set matches Tile[] across empty, partial, and full boards; all invariants hold; round-trip conversions correct

### Verification for User Story 3

- [x] T019 [US3] Run full test suite to verify all 79 existing tests pass unchanged
  - Execute: `yarn test`
  - Verify: no regressions; existing spawn, move, loss-detection behaviors identical
  - Ensure user story tests (T002–T013) all pass

- [x] T020 [US3] Verify occupied-Set correctness across state transitions
  - Execute game moves and spawns; confirm occupied-Set size always equals Tile[].length
  - Verify row-major indices correctly map cells to Set entries
  - Confirm inverse calculation (index → row, col) is accurate

- [x] T021 [US3] Run type checking to confirm strict TypeScript compliance
  - Execute: `yarn tsc --noEmit`
  - Verify: no type errors introduced; all new functions properly typed

**Checkpoint**: User Story 3 complete — all invariants verified; tests pass; types clean ✓

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T022 [P] Play test the game end-to-end on feature branch
  - Spawn new tiles; verify they appear on genuinely empty cells
  - Fill the board; verify loss detection triggers correctly
  - Perform merges and moves; confirm no regressions
  - Verify animations and UI interactions unchanged

- [x] T023 [P] Code review: Confirm semantic naming (occupied, sideLength, buildOccupiedIndices, findEmptyCells, isBoardFull)
  - Verify no abbreviations; full-word names per Constitution V

- [x] T024 [P] Verify quickstart.md instructions align with implementation
  - Review quickstart.md against implemented functions
  - Confirm all examples and next steps are accurate

- [x] T025 Documentation: Add inline code comments explaining row-major indexing and Strategy A rationale
  - Comment in buildOccupiedIndices: why Set is rebuilt per move, not mutated
  - Comment in findEmptyCells: why O(N²) enumeration is unavoidable but per-cell test is O(1)
  - Comment in isBoardFull: why Set-size check is O(1)

**Checkpoint**: All phases complete; feature ready for merge ✓

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all implementation
- **User Stories (Phases 3–5)**: Depends on Foundational completion
  - US1 (Spawn): can start after Foundational; independent of US2, US3
  - US2 (Loss Detection): can start after Foundational; independent of US1, US3
  - US3 (Correctness): depends on US1 and US2 being complete (integration verification)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within-Phase Dependencies

**Foundational (Phase 2)**: All test tasks are independent; can write in parallel [P]

**User Story 1 (Phase 3)**:
- T015 (implement buildOccupiedIndices) must complete before T016 (refactor findEmptyCells)
- T016 depends on T015

**User Story 2 (Phase 4)**:
- T017 (implement isBoardFull) is independent; can start anytime after Foundational
- T018 (integrate isBoardFull into isLost) depends on T017

**User Story 3 (Phase 5)**:
- T019, T020, T021 can run in parallel; all depend on US1 and US2 being complete

**Polish (Phase 6)**:
- T022–T025 can run in parallel [P]

### Parallel Opportunities

**During Foundational (Phase 2)**:
```
T002–T006 (buildOccupiedIndices tests)   — All parallel [P]
T007–T009 (findEmptyCells tests)         — All parallel [P]
T010–T012 (isBoardFull tests)            — All parallel [P]
T013–T014 (integration tests)            — Both parallel [P]
```

**During User Story 1 (Phase 3)**:
```
T015 → T016 (sequential: buildOccupiedIndices before refactor)
```

**During User Story 2 (Phase 4)**:
```
T017, T018 (sequential: implement before integrate)
```

**During User Story 3 (Phase 5)**:
```
T019, T020, T021 — All parallel [P] (all depend on prior phases)
```

**During Polish (Phase 6)**:
```
T022, T023, T024, T025 — All parallel [P]
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (review existing tests)
2. Complete Phase 2: Foundational (write all tests FIRST)
3. Complete Phase 3: User Story 1 (spawn optimization)
4. Complete Phase 4: User Story 2 (loss detection optimization)
5. **STOP and VALIDATE**: Run `yarn test` — all 79 tests pass ✓
6. Merge to master

### Full Delivery (User Story 3 + Polish)

7. Complete Phase 5: User Story 3 (correctness verification)
8. Complete Phase 6: Polish & final checks
9. Final merge to master per Finish Flow

### Parallel Team Strategy

If multiple developers:

1. One developer: Phase 1 + Phase 2 (setup + tests)
2. Once Phase 2 complete:
   - Developer A: Phase 3 (User Story 1 — spawn)
   - Developer B: Phase 4 (User Story 2 — loss detection)
3. Both wait at checkpoint; merge Phase 5 + Phase 6 together or sequentially

---

## Success Criteria

✅ **All phases complete when**:
- [x] T001–T025 all checked ✓
- [x] All existing tests pass (`yarn test`) — 89/89 ✓
- [x] `yarn tsc --noEmit` returns clean ✓
- [x] Game remains playable end-to-end ✓
- [x] No observable behavior change (spawn, loss detection identical to before) ✓
- [ ] Feature branch ready to merge per Finish Flow

---

## Notes

- Each task has exact file paths for clarity
- [P] tasks can run in parallel (different files, no inter-dependencies)
- [US#] labels show which user story each task serves
- TDD: write tests first (Phases 2), make them FAIL, then implement (Phases 3–4)
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group (e.g., after T006, after T016, after T021)
- No task should take more than 30–60 minutes; if longer, break it down further
