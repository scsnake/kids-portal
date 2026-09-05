# Piano Sightreader

A browser-based sight-reading trainer for piano. Notes are drawn on treble or bass staff and you identify them by clicking a piano keyboard or a note/modifier grid. Tones play back through the WebAudio API.

## Features

- **Standard mode** — single notes or short intervals in a chosen key signature.
- **Advanced mode** — tertian chords (triads, 7ths, and larger) with realistic voicings.
- **Clef selection** — treble or bass.
- **Key signatures** — all 15 major keys, with automatic accidental/natural rendering.
- **Two input modes** — piano keyboard layout, or letter + accidental modifier grid.
- **Audio playback** via WebAudio oscillators (no samples needed).

## Running

Everything is self-contained in `index.html` — React, Babel, and Tailwind are loaded from CDNs and JSX is compiled in the browser. Just open the file:

```sh
open index.html
```

Or serve the folder with any static server, e.g.:

```sh
python -m http.server 8000
```

then visit `http://localhost:8000/`.

`App.jsx` mirrors the same component as a standalone source file for editing outside the inline `<script type="text/babel">` block.

## License

[MIT](LICENSE)
