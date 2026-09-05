# kids-portal

Monorepo hosting the kids' education portal + individual apps. Each subdirectory
is deployed as its **own Coolify static application** at its own subdomain.

## Layout

```
kids-portal/
├── portal/                    # Landing page listing all apps (kids.scsnake.xyz)
│   ├── index.html
│   ├── apps.json              # ← add/edit apps here
│   ├── css/style.css
│   └── js/app.js
├── apps/
│   ├── math-practice/         # kids-math.scsnake.xyz
│   │   └── index.html         # single file, Tailwind + Tone.js CDN
│   ├── one-stroke/            # kids-onestroke.scsnake.xyz
│   │   ├── main.js            # React App source
│   │   ├── entry.js           # mounts <App /> into #root
│   │   ├── index.html         # loads dist/bundle.js
│   │   ├── package.json       # esbuild + react + lucide-react
│   │   └── dist/bundle.js     # committed pre-built bundle (156 KB)
│   └── piano-sightreader/     # kids-piano.scsnake.xyz
│       ├── index.html         # Babel-in-browser React (self-contained)
│       └── App.jsx            # kept as source reference
└── README.md
```

`chinese-writing` stays in its own repo (`scsnake/ChineseWriting`) at
`kids-chinese-writing.scsnake.xyz` — already deployed.

## Add or change an app

1. Drop the app under `apps/<slug>/` (must contain a servable `index.html`)
2. Edit `portal/apps.json` and add:

```json
{
  "id": "<slug>",
  "title": "顯示名稱",
  "desc": "一行說明",
  "url": "https://kids-<slug>.scsnake.xyz",
  "icon": "🌟",
  "subject": "科目",
  "level": ["國小 1-6"]
}
```

3. `git commit && git push` — Coolify only rebuilds the app whose files changed
   (thanks to per-application **Watch Paths**; see deploy notes below).

`subject` becomes a filter chip in the portal automatically.

## Local dev (whole monorepo)

```sh
cd ~/scripts/kids-portal
python3 -m http.server 8765 --bind 127.0.0.1
# portal:            http://127.0.0.1:8765/portal/
# math-practice:     http://127.0.0.1:8765/apps/math-practice/
# one-stroke:        http://127.0.0.1:8765/apps/one-stroke/
# piano-sightreader: http://127.0.0.1:8765/apps/piano-sightreader/
```

Portal cards link to the deployed subdomains — local previews of each app work
via the per-app path above.

## Deploy (Coolify on cthgpu)

**Once**: connect this repo via Coolify → Sources → GitHub App (private repo OK).

**Per application** (one Coolify service each):

| Service | Base Directory | Publish Directory | Build Command | Watch Paths | Domain |
|---|---|---|---|---|---|
| **portal** | `portal` | `.` | (none — static) | `portal/**` | `kids.scsnake.xyz` |
| **math-practice** | `apps/math-practice` | `.` | (none) | `apps/math-practice/**` | `kids-math.scsnake.xyz` |
| **one-stroke** | `apps/one-stroke` | `.` | (none, uses committed `dist/`) or `npm ci && npm run build` if you drop `dist/` from git | `apps/one-stroke/**` | `kids-onestroke.scsnake.xyz` |
| **piano-sightreader** | `apps/piano-sightreader` | `.` | (none) | `apps/piano-sightreader/**` | `kids-piano.scsnake.xyz` |

Then in **Cloudflare DNS**: add a CNAME for each subdomain pointing at the same
host `kids-chinese-writing.scsnake.xyz` already targets.

**Watch Paths** is what stops every push from rebuilding every service — set it
per Coolify application under "Advanced → Watch Paths".

## Rebuilding one-stroke locally

```sh
cd apps/one-stroke
npm install       # first time only
npm run build     # rewrites dist/bundle.js
```

`dist/bundle.js` is committed by default so Coolify serves without building. If
you prefer Coolify to build (avoids committing binaries), add `dist/` to a
`.gitignore` in `apps/one-stroke/` and set the Coolify build command to
`npm ci && npm run build`.
