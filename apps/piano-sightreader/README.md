# Piano Sightreader

A browser-based sight-reading trainer for piano. Notes are drawn on treble or bass staff and you identify them by clicking a piano keyboard or a note/modifier grid. Tones play back through the WebAudio API.

## Features

- **Standard mode** — single notes or short intervals in a chosen key signature.
- **Advanced mode** — triads, 7ths and 9ths that tonal music really uses in the chosen key. Chords are drawn with fixed odds, not evenly: the chords of the key about 55% of the time, common chromatic chords (secondary dominants, chords borrowed from the minor, diminished sevenths) about 33%, rarer ones (Neapolitan, ♭III, secondary diminished chords) about 12%. Triads and 7ths are inverted half the time; 9ths stay in root position.
- **Clef selection** — treble or bass.
- **Key signatures** — 13 major keys, up to six sharps (F♯) or six flats (G♭), with automatic accidental/natural rendering. **Random key** picks a key for every question, favouring keys with few sharps or flats (0–2: 55%, 3–4: 30%, 5–6: 15%).
- **Two input modes** — piano keyboard layout, or letter + accidental modifier grid.
- **Audio playback** via WebAudio oscillators (no samples needed).

## Running

Everything is self-contained in `index.html` — React, Babel, and Tailwind are loaded from CDNs and JSX is compiled in the browser. The Noto Music font used for the clefs and accidentals is bundled in `fonts/`, so the staff never falls back to another font. Just open the file:

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

[MIT](LICENSE). The bundled Noto Music font is under the SIL Open Font License ([fonts/OFL.txt](fonts/OFL.txt)).
