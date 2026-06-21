<!--
SYNC IMPACT REPORT
==================
Version change: 1.5.0 → 1.6.0 (MINOR: new Reference Materials section added)

Modified principles: N/A

Modified sections: N/A

Added sections:
  - Reference Materials — four local-only intro requirement files (gitignored under docs/);
    game logic spec, original rules PDF, Figma UI design, FE test PDF

Removed sections: N/A

Templates updated:
  ✅ .specify/templates/plan-template.md — no structural changes needed
  ✅ .specify/templates/spec-template.md — no structural changes needed
  ✅ .specify/templates/tasks-template.md — no structural changes needed

Follow-up TODOs: none (docs/ is already gitignored; files are local-only by design)
-->

# 2048 Game Constitution

## Core Principles

### I. Game Logic Isolation

The core game logic (board state, tile movement, merge rules, score) MUST be implemented
as a pure, framework-agnostic module with no direct coupling to the rendering layer.
UI code MAY call into the game engine; the game engine MUST NOT reference any UI primitives.
This separation enables independent testing of logic and independent swapping of the view layer.

### II. Test-First (NON-NEGOTIABLE)

TDD is mandatory: tests MUST be written and reviewed before any implementation code is added.
For every implementation case, TDD MUST be attempted first. Only when TDD is structurally
impossible for a given case (e.g., pure rendering glue with no testable logic) MAY an
exception be granted; the exception MUST be noted in the relevant task.

The Red-Green-Refactor cycle MUST be strictly enforced:
- Red: write a failing test that describes the desired behaviour.
- Green: write the minimal implementation to make the test pass.
- Refactor: clean up without breaking tests.

All business logic paths in the game engine MUST have unit test coverage.

### III. Incremental Delivery

Each feature MUST be deliverable as a working, playable increment.
Partial implementations that leave the game in a broken state MUST NOT be merged to `master`.
User stories MUST be ordered by priority and MUST each be independently testable without
requiring sibling stories to be complete.

### IV. Simplicity Over Abstraction

YAGNI applies strictly: no layer of abstraction MUST be introduced without a concrete,
present-day requirement.
Three similar code paths are preferable to a premature helper.
Complexity MUST be justified in the plan's Complexity Tracking section before introduction.

### V. Learning-First

As a self-education project, clarity of code and explicitness of decisions take precedence
over brevity or cleverness.
Decisions MUST be documented in the relevant plan or spec so that future sessions can
understand WHY a choice was made, not just what was chosen.

### VI. Testing Scope

CSS and visual-style tests (snapshot tests, pixel comparisons, computed-style assertions)
MUST NOT be written or generated unless the user explicitly requests them for a feature.
All other testable logic — game rules, state transitions, score calculation, DOM structure
for accessibility — follows Principle II (TDD-first).
Tasks files MUST NOT include CSS test tasks by default; they MAY be added only when the
feature spec or the user explicitly calls for them.

### VII. React Architecture

The UI layer MUST follow idiomatic React patterns. The following rules are non-negotiable
and apply to every feature that touches React code.

**Composition**
- Components MUST be composed from smaller, single-purpose pieces; class inheritance for
  UI components is prohibited.
- Shared behaviour MUST be expressed through composition (passing components as props,
  children, or render props) rather than through wrapper chains or HOC pyramids.

**Component granularity**
- Each component MUST have one clearly named responsibility. If describing what a component
  does requires the word "and", it MUST be split.
- Presentational components MUST be free of business logic; container/hook layers own
  data-fetching and state.

**Hook extraction**
- Any logic beyond trivial JSX branching (conditional render, list map) MUST be extracted
  into a named custom hook.
- Custom hooks MUST follow the `use*` naming convention and MUST be independently testable
  via React Testing Library's `renderHook`.
- A component file MUST NOT grow beyond ~100 lines before hook/component extraction
  is reconsidered.

**Re-render hygiene (NON-NEGOTIABLE)**
- Object and function literals MUST NOT be created inline as props; they MUST be stabilised
  with `useMemo` / `useCallback` or defined outside the render path.
- Components that receive stable props but re-render unnecessarily MUST be wrapped in
  `React.memo` with a documented justification comment.
- State MUST be colocated at the lowest component that needs it; lifting state higher than
  necessary is a violation requiring a Complexity Tracking entry.
- React Context MUST be split by update frequency: a context that changes frequently
  (e.g. current tile positions) MUST NOT share a Provider with low-frequency data
  (e.g. theme, game config).
- Before merging any feature, the author MUST verify with React DevTools Profiler (or
  equivalent) that no component re-renders more than once per user interaction without
  documented justification.

## Technology Stack

**Framework**: React 18+ — functional components and hooks only; class components are prohibited.
**Language**: TypeScript — mandatory; `"strict": true` MUST be set in `tsconfig.json`; no plain JS.
**Styling**: CSS Modules or raw CSS — no CSS-in-JS libraries, no utility-class frameworks.
**Bundler**: Vite with `@vitejs/plugin-react`.
**Test runner**: Vitest with jsdom environment.

### Dependency Whitelist (NON-NEGOTIABLE)

No package outside this whitelist MAY be installed without a constitution amendment.
Any PR that adds an unlisted dependency MUST be blocked until the constitution is updated.

**Runtime dependencies** (exact list):
- `react`
- `react-dom`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react`

**Dev dependencies — testing** (exact list):
- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`

All other packages — utility libraries, component libraries, state managers, routers,
animation libraries, icon sets, date libraries, etc. — are prohibited without amendment.
Rationale: this is a self-education project; building from primitives is the learning goal.

**Constraints**:
- MUST run in a modern evergreen browser without a server (static files only for gameplay).
- Tests MUST be runnable from the terminal via `npx vitest run`.

## Hosting & Deployment

**Platform**: GitHub Pages
**Live URL**: `https://v-sokolov.github.io/2048-game`
**Source**: `master` branch — every merge triggers an automatic redeploy.
**Mechanism**: GitHub Actions workflow at `.github/workflows/deploy.yml`
  - Trigger: `on: push: branches: [master]`
  - Build: `vite build` → output in `dist/`
  - Deploy: `dist/` published to GitHub Pages via the `actions/deploy-pages` action family.

**Hard constraints**:
- `vite.config.ts` MUST set `base: '/2048-game/'` at all times. Without this, all
  bundled assets (JS, CSS, images) will 404 at the subpath. This value MUST NOT be
  removed or changed without a constitution amendment.
- The deploy workflow file (`.github/workflows/deploy.yml`) is CI/CD infrastructure
  and is exempt from the package dependency whitelist — it installs no runtime deps.
- No other hosting target or manual deployment process is permitted; GitHub Pages is
  the single source of truth for the live build.

## Development Workflow

**Feature lifecycle — every step is mandatory in order:**

1. Create a dedicated feature branch via `/speckit-git-feature` (one branch per feature;
   work from multiple features MUST NOT share a branch).
2. Run the full spec pipeline: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks`.
3. Apply the TDD cycle (Principle II) before writing any implementation code.
4. Verify Principle VII (React Architecture) compliance, including the DevTools Profiler
   check, before the feature is considered complete.
5. Ensure the game remains playable; no half-states MUST be committed to the feature branch.
6. Open a PR targeting `master` with a minimal description (what the feature does; why it
   was built). No approval workflow is required (solo project), but the author MUST re-read
   the full diff before merging.
7. Merge the PR into `master`.
8. **Do NOT delete the feature branch** after merging — branches are retained as a permanent
   record of each feature's development history.
9. Switch to `master` and pull latest: `git checkout master && git pull`.
   GitHub Actions will automatically trigger a redeploy to GitHub Pages on the push
   that resulted from the merge — no manual deploy step is required.

## Reference Materials

These are local-only intro-requirement documents that inform feature design and game rules.
They live under `docs/` which is gitignored — they are never committed. Feature specs and
plans SHOULD be cross-checked against these sources before finalising requirements.

| File | Purpose |
|------|---------|
| `docs/superpowers/specs/2026-06-21-2048-game-logic-design.md` | Detailed game logic specification: movement, merging rules, one-merge-per-tile, scoring — primary reference for Principle I implementation |
| `docs/superpowers/specs/2048.pdf` | Original 2048 game reference document / rules |
| `docs/superpowers/specs/FE test.fig` | Figma design file — frontend UI layout and component structure reference |
| `docs/superpowers/specs/FE test.pdf` | PDF export of the frontend design for offline review |

These documents are works-in-progress and will be updated over time. They are not
authoritative until explicitly promoted into a feature spec via `/speckit-specify`.

## Governance

This constitution supersedes all other informal practices in this repository.
Amendments require:
1. A clear rationale.
2. A version bump following semantic versioning (MAJOR/MINOR/PATCH rules defined in the
   `speckit-constitution` workflow).
3. An updated Sync Impact Report in this file.
4. Any affected templates updated in the same commit.

All feature plans MUST include a Constitution Check section verifying compliance with
Principles I–VII before Phase 0 research begins.

Runtime development guidance lives in `CLAUDE.md` and referenced plan files.
Complexity violations MUST be tracked in the plan's Complexity Tracking table.

**Version**: 1.6.0 | **Ratified**: 2026-06-21 | **Last Amended**: 2026-06-21
