# One-Stroke Puzzle

Kid-friendly geometry puzzle: draw each level's shape without lifting the pen or retracing an edge. 48 levels (25–48 are a second chapter that restarts the difficulty ramp).

## Local dev

```sh
cd ~/scripts/one-stroke
npm install
npm run build       # writes dist/bundle.js
python3 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765
```

Or run watch mode while editing `main.js`:

```sh
npm run dev
```

## Deploy (Coolify on cthgpu)

Two options:

**Option A — commit the built bundle** (simpler, no build server needed):
1. `npm run build` locally
2. `git add dist/bundle.js index.html main.js entry.js package.json` and push
3. Coolify → New Application → Static → publish dir `.`

**Option B — build on Coolify**:
1. `dist/` in `.gitignore` (don't commit build output)
2. Coolify → Nixpacks or Node build pack → `npm ci && npm run build`, publish dir `.`

Currently `dist/` is not in `.gitignore`, so option A is the default.

## Source layout

- `main.js` — the React `App` component (JSX, no ReactDOM mount)
- `levels.js` — the level data (dots and lines in a 0–100 board)
- `trace.js` — stroke rules: which dot a finger is on and how a drag extends the path.
  Samples between pointer events are interpolated, so a fast swipe joins every dot it
  crosses, in order, and never one it didn't pass. Each level's catch radius (7–12
  units) stays clear of lines the dot isn't on.
- `entry.js` — mounts `<App />` into `#root`
- `index.html` — loads `dist/bundle.js` + Tailwind CDN

## Tests

```sh
npm test
```

`test/levels.test.js` checks every level can be drawn in one stroke (connected, 0 or 2
odd dots) and is legible: dots ≥ 16 apart, and no dot within 11 units of a line it isn't
part of. `test/trace.test.js` swipes every line of every level, including 3 units off the
line, and checks that only that line's two dots join. Add a level → run the tests.

## Tech

- React 18 + lucide-react icons
- Tailwind CDN for styles
- esbuild bundles + minifies (`~150 KB` typical output)
