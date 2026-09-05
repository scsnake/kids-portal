# One-Stroke Puzzle

Kid-friendly geometry puzzle: draw each level's shape without lifting the pen or retracing an edge. 24 levels.

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
- `entry.js` — mounts `<App />` into `#root`
- `index.html` — loads `dist/bundle.js` + Tailwind CDN

## Tech

- React 18 + lucide-react icons
- Tailwind CDN for styles
- esbuild bundles + minifies (`~150 KB` typical output)
