# Math Practice

Addition, subtraction, multiplication (九九乘法) and division drill for kids. Timed challenges + shake/pop feedback.

## Local dev

```sh
cd ~/scripts/kids-portal
python3 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765/apps/math-practice/
```

## Tech

- Single-file `index.html` (~27 KB)
- Tailwind CDN + Tone.js (audio) via CDN
- No build step, mobile-optimized

## Deploy (Coolify)

See the monorepo README at the repo root for how each app maps to a Coolify service.
