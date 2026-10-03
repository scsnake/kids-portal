# Math Practice

Addition, 2-, 3- and 4-digit addition/subtraction, and multiplication (九九乘法) drill for kids. Timed challenges with streak bonuses; the answer is shown after two wrong tries.

## Local dev

```sh
cd ~/scripts/kids-portal
python3 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765/apps/math-practice/
```

## Tech

- Single-file `index.html` (~31 KB)
- Tailwind CDN + Tone.js (audio) via CDN
- No build step, mobile-optimized

## Deploy (Coolify)

See the monorepo README at the repo root for how each app maps to a Coolify service.
