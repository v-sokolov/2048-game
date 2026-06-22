# Implementation Plan: 2048 Game UI Components

**Branch**: `001-ui-components` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

## Summary

Nine presentational components cover the full 2048 board UI (Playground, Logo, Score, NewGameButton, UndoButton, GridArea, Tile, Note, GameOverlay), styled to the Figma "bluedot" design. Components are render-only with no game logic. `Tile` derives its variant CSS class from its `value`: the 11 known powers of two (2–2048) map to distinct variants, anything else (out-of-set / `undefined` / `null`) → the default empty variant. `GridArea` renders a `Tile` for all 16 slots on a subtle gap-space panel. `Note` is a generic styled text container (renders `children`), used twice by `App`: a **rules note** at the top and an **author-attribution note** pinned to the bottom. `Playground` lays its children out in three vertical zones — rules (top) · game (centre) · credit (bottom). `Tile` and `GridArea` are memoized.

## Technical Context

**Language/Version**: TypeScript strict; path aliases `@components/*` → `src/components/`, `@assets/*` → `src/assets/` (tsconfig + vite resolve)
**Primary Dependencies**: react, react-dom; `vite-plugin-svgr` (whitelist amended v1.8.1) for `?react` SVG imports
**Styling**: CSS Modules — one `.module.css` per component; tile variants via `.tile--{value}` + `.tile--empty` default; subtle linear-gradient fills + inner-shadow bevels. A single responsive `--board-width` (set on `Playground`) drives the header, grid, and notes so they scale together (clamped, viewport-height-aware). Design font is **Manrope** via a system-fallback stack; real font loading deferred (no dependency added)
**Testing**: Vitest + jsdom + @testing-library/react + @testing-library/jest-dom; `vitest/globals` in tsconfig types. Runs on Node ≥ 22.12 (project standard: 24.13.0, pinned via `.nvmrc` / `engines`)
**Target Platform**: Evergreen browser, static (GitHub Pages `/2048-game/`); responsive 320px–1440px
**Scale/Scope**: Single-player, one board, browser-only

## Constitution Check

- [x] **I. Game Logic Isolation** — components receive all data via props; zero engine imports
- [x] **II. Test-First** — TDD applied for `Tile` only (variant derivation + empty fallback); other components are rendering-glue TDD exceptions per clarification
- [x] **III. Incremental Delivery** — each component independently renderable; `App.tsx` wired last
- [x] **IV. Simplicity** — `value → tile--{value}` (else empty) is direct; the generic `Note` is justified by concrete duplication (rules + credit); YAGNI otherwise
- [x] **V. Learning-First** — variant-derivation, empty-default, and Note-generalization decisions documented in research.md
- [x] **VI. Testing Scope** — CSS visual rules excluded; tests assert class presence and component output only
- [x] **VII. React Architecture** — memo on `Tile` + `GridArea` with justification; no inline object/function props; single-responsibility; `Note` composes via `children`
- [x] **VIII. Artifact Brevity** — plan kept minimal
- [x] **IX. Layered Architecture** — all components in `src/components/` (UI layer); no cross-layer imports
- [x] **Dependency Whitelist** — `vite-plugin-svgr` added via amendment v1.8.1; Manrope uses a system fallback (no new dependency)
- [x] **Hosting** — `vite.config.ts` base untouched (`/2048-game/`)

## Project Structure

### Documentation (this feature)

```
specs/001-ui-components/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```
src/
├── styles/
│   └── global.css                 ← Manrope-first font stack + reset
├── assets/
│   └── undo.svg                   ← icon asset; imported as ?react via vite-plugin-svgr
├── types/
│   └── index.ts                   ← TileData interface
└── components/
    ├── index.ts                   ← global barrel: re-exports all 9 components (not App)
    ├── App/                       ← root composition: App.tsx + App.module.css + App.test.tsx; imported by main.tsx
    ├── Playground/
    │   ├── Playground.tsx
    │   └── Playground.module.css  ← 3-zone layout (rules top · game centre · credit bottom); --board-width; radial-gradient bg
    ├── Logo/
    ├── Score/
    ├── NewGameButton/  (index.ts present)
    ├── UndoButton/     (index.ts present; imports undo.svg via @assets)
    ├── GridArea/                  ← renders a Tile for all 16 slots; gap-space panel
    ├── Tile/
    │   ├── Tile.tsx               ← required id, optional value; tile--{value} ?? tile--empty
    │   ├── Tile.module.css        ← 11 value variants + .tile--empty default
    │   └── Tile.test.tsx          ← only component with automated tests
    ├── Note/                      ← generic styled text container (renders children)
    │   ├── Note.tsx
    │   └── Note.module.css
    └── GameOverlay/
```

**Structure Decision**: Single `src/components/` tree; one global barrel `src/components/index.ts`. Every UI piece — including the root `App` — is a folder-per-component (`Name.tsx` + `Name.module.css` [+ test]); `App/` holds the root composition and is imported directly by `main.tsx` (it is intentionally *not* re-exported from the barrel, since it imports from it). The app-wide, unscoped `global.css` stays in `src/styles/` (a separate layer from the scoped `*.module.css` files). `FooterNote/` is renamed to `Note/` — a generic presentational component that renders `children`. `App` composes two `<Note>` instances (rules at the top of `Playground`, credit pinned to the bottom). `Playground` arranges its children in three vertical zones via flex (`justify-content: space-between` with the centred game block, or `margin-top: auto` on the credit). A global `src/styles/global.css` sets the Manrope-first stack, imported once in `main.tsx`.

**Config conventions**: Component prop types are inline TypeScript in each component (summarised in `data-model.md`) — there is no separate `contracts/` file. `vite.config.ts` imports `defineConfig` from `vitest/config` and resolves the `@components`/`@assets` aliases via the global `URL` + `import.meta.url` (no `node:url` / `@types/node`); `tsconfig.json` uses relative `paths` values (no `baseUrl`, deprecated in TS 7). This keeps the dependency whitelist intact.
