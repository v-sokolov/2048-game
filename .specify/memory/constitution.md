<!--
SYNC IMPACT REPORT
==================
Version change: 1.7.0 → 1.8.0 (MINOR: new Principle IX — Layered Architecture)

Modified principles: N/A

Added sections:
  - Principle IX. Layered Architecture — tools/utils placed in layers by scope;
    isolation preferred; layers communicate through established interfaces;
    layers may be domain-based or feature-scoped

Removed sections: N/A

Templates updated:
  ✅ .specify/templates/plan-template.md — Constitution Check updated (I–IX)
  ✅ .specify/templates/tasks-template.md — no structural changes needed

Follow-up TODOs: none
-->

# 2048 Game Constitution

## Core Principles

### I. Game Logic Isolation

The core game logic (board state, tile movement, merge rules, score) MUST be implemented
as a pure, framework-agnostic module with no direct coupling to the rendering layer.
UI code MAY call into the game engine; the game engine MUST NOT reference any UI primitives.

### II. Test-First (NON-NEGOTIABLE)

TDD is mandatory: tests MUST be written before any implementation code.
For every case, TDD MUST be attempted first. Exceptions (e.g., pure rendering glue with
no testable logic) MUST be noted in the relevant task.

Red-Green-Refactor cycle MUST be enforced:
- Red: failing test describing the desired behaviour.
- Green: minimal implementation to make it pass.
- Refactor: clean up without breaking tests.

All business logic paths in the game engine MUST have unit test coverage.

### III. Incremental Delivery

Each feature MUST be deliverable as a working, playable increment.
Partial implementations that leave the game broken MUST NOT be merged to `master`.
User stories MUST be ordered by priority and independently testable.

### IV. Simplicity Over Abstraction

YAGNI applies strictly: no abstraction without a concrete, present-day requirement.
Three similar code paths are preferable to a premature helper.
Complexity MUST be justified in the plan's Complexity Tracking section.

### V. Learning-First

Clarity and explicitness take precedence over brevity or cleverness.
Decisions MUST be documented in the relevant plan or spec so future sessions understand WHY.

### VI. Testing Scope

CSS and visual-style tests MUST NOT be written unless explicitly requested.
All other testable logic follows Principle II (TDD-first).
Tasks files MUST NOT include CSS test tasks by default.

### VII. React Architecture

**Composition**: Components MUST be composed from smaller, single-purpose pieces.
Class inheritance for UI is prohibited. Shared behaviour via composition (props/children/render props).

**Component granularity**: One responsibility per component. If describing it requires "and", split it.
Presentational components MUST be free of business logic.

**Hook extraction**: Non-trivial logic MUST be extracted into a named custom hook (`use*`).
Hooks MUST be independently testable via `renderHook`. Component files MUST NOT exceed ~100 lines
before extraction is reconsidered.

**Re-render hygiene (NON-NEGOTIABLE)**:
- No inline object/function literals as props — stabilise with `useMemo`/`useCallback` or define outside render.
- Unnecessary re-renders MUST be wrapped in `React.memo` with a documented justification.
- State MUST be colocated at the lowest component that needs it.
- Context MUST be split by update frequency.
- Before merging, verify with React DevTools Profiler that no component re-renders more than
  once per user interaction without documented justification.

### VIII. Artifact Brevity

All generated artifacts (plans, specs, task lists, checklists) MUST be as short as possible
without losing actionable context.

- Strip explicit duplications and over-wide explanations.
- Keep everything needed for an efficient result.
- Do NOT trim content that would require re-derivation during implementation.

### IX. Layered Architecture

Code MUST be organised into layers by scope and domain. Each layer MUST be isolated and
agnostic to implementation details of other layers.

- Tools, utilities, and modules MUST live in the layer appropriate to their need:
  domain logic in the engine layer, UI concerns in the component layer, state
  orchestration in the hook layer.
- Layers MAY be domain-based (e.g., `engine/`, `ui/`) or feature-scoped when a feature
  warrants its own isolated subtree.
- Layers MUST communicate through established TypeScript interfaces or types — no
  direct cross-layer implementation imports that bypass the defined contract.
- A module MUST NOT reach across layer boundaries except through its declared public API.

## Technology Stack

**Framework**: React 18+ — functional components and hooks only; class components prohibited.
**Language**: TypeScript — mandatory; `"strict": true` MUST be in `tsconfig.json`.
**Styling**: CSS Modules or raw CSS — no CSS-in-JS, no utility-class frameworks.
**Bundler**: Vite with `@vitejs/plugin-react`.
**Test runner**: Vitest with jsdom environment.

### Dependency Whitelist (NON-NEGOTIABLE)

No package outside this whitelist MAY be installed without a constitution amendment.

**Runtime**: `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`

**Dev/test**: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`

All other packages are prohibited without amendment.

**Constraints**:
- MUST run in a modern evergreen browser without a server.
- Tests MUST be runnable via `npx vitest run`.

## Hosting & Deployment

**Platform**: GitHub Pages — `https://v-sokolov.github.io/2048-game`
**Source**: `master` — every merge triggers an automatic redeploy via `.github/workflows/deploy.yml`.
- Trigger: `on: push: branches: [master]`
- Build: `vite build` → `dist/`
- Deploy: `dist/` via `actions/deploy-pages`

**Hard constraints**:
- `vite.config.ts` MUST set `base: '/2048-game/'` at all times. MUST NOT be removed or changed
  without a constitution amendment.
- No other hosting target or manual deployment process is permitted.

## Development Workflow

**Feature lifecycle — every step is mandatory in order:**

1. Create a dedicated feature branch via `/speckit-git-feature`.
2. Run `/speckit-specify` → `/speckit-plan` → `/speckit-tasks`.
3. Apply TDD (Principle II) before writing any implementation code.
4. Verify Principle VII compliance including the DevTools Profiler check.
5. Ensure the game remains playable; no half-states committed to the feature branch.
6. Open a PR to `master` with a minimal description. Re-read the full diff before merging.
7. Merge the PR.
8. **Do NOT delete the feature branch** — retained as permanent history.
9. `git checkout master && git pull`. GitHub Actions redeploys automatically.

## Reference Materials

Local-only files under `docs/` (gitignored). Cross-check these before finalising feature specs.

| File | Purpose |
|------|---------|
| `docs/superpowers/specs/2026-06-21-2048-game-logic-design.md` | Game logic spec: movement, merging, scoring |
| `docs/superpowers/specs/2048.pdf` | Original 2048 rules reference |
| `docs/superpowers/specs/FE test.fig` | Figma UI design |
| `docs/superpowers/specs/FE test.pdf` | PDF export of the Figma design |

## Governance

This constitution supersedes all other informal practices in this repository.
Amendments require: (1) clear rationale, (2) semver bump, (3) updated Sync Impact Report,
(4) affected templates updated in the same commit.

All feature plans MUST include a Constitution Check (I–IX) before Phase 0 research.

**Version**: 1.8.0 | **Ratified**: 2026-06-21 | **Last Amended**: 2026-06-21
