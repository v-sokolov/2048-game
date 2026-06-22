# Quickstart: 2048 Game UI Components

## Run tests

```bash
yarn vitest run
```

## Dev server

```bash
yarn dev
# → http://localhost:5173/2048-game/
```

## Component pattern (TDD order per task)

1. Write a failing test in `ComponentName.test.tsx`.
2. Create `ComponentName.tsx` with minimal implementation to pass.
3. Add `ComponentName.module.css` with base styles (no CSS tests).
4. Refactor if needed; keep tests green.

## Tile variant CSS pattern

```tsx
// Tile.tsx
import styles from './Tile.module.css';
const variantClass = styles[`tile--${value}`] ?? styles['tile--empty'];
<div
  data-tile-id={id}            // present only for value-bearing tiles
  className={`${styles.tile} ${variantClass}`}
>
  {value}
</div>
```

```css
/* Tile.module.css — bluedot palette, one rule per variant */
.tile { /* base layout: radius 12px, bevel inner-shadows */ }
.tile--2  { background: linear-gradient(135deg, #ffcdab, #fcc7a2); color: #96694b; }
.tile--4  { background: linear-gradient(135deg, #fcdd9d, #f6d593); color: #906f2b; }
/* ... 8, 16, 32, 64, 128, 256, 512, 1024 ... */
.tile--2048  { background: linear-gradient(135deg, #795f3b, #6b5432); color: #ffffff; }
.tile--empty { background: #f5e3cf; /* flat + bevel; the default variant */ }
```

Variant list & fallback rules: see [data-model.md](./data-model.md).

## Memo pattern

```tsx
// GridArea.tsx — renders a <Tile> for all 16 slots; empties pass no value
import { memo } from 'react';
export const GridArea = memo(function GridArea({ tiles }: GridAreaProps) { ... });

// Tile.tsx
export const Tile = memo(function Tile({ id, value }: TileProps) { ... });
```

**Important**: callers must stabilise `cells` array and callback props with `useMemo`/`useCallback` — otherwise memo is no-op. Enforce this when game logic is wired (future feature).

## Verify memo in tests

```tsx
let renderCount = 0;
const TrackedTile = memo(function TrackedTile(props: TileProps) {
  renderCount++;
  return <Tile {...props} />;
});
// Update one tile's value; assert renderCount === 1 for the changed tile
// and that unchanged tiles were not re-rendered.
```
