# 小小作家 Little Writer

Kids' composition helper: write an article in sections (title, outline, body),
with live word counts, a word goal, voice typing, copy and download. There's a
separate article for 中文 and English.

Ported from a Gemini canvas prototype. The canvas could wipe everything when
the kid left the app or rotated the iPad, so persistence is the main job here.

## Persistence

All data stays in the browser's `localStorage` on this app's own origin
(`kids-writer.scsnake.xyz`). There's no server.

- **Saved on every edit**, and flushed again on `pagehide` / `visibilitychange`.
  Rotating, switching apps, closing the tab or iOS discarding it loses nothing.
- **History (歷史版本)**: on the first edit of each visit, the app backs up what
  was there when it opened. After that it takes a backup every 2 minutes of
  writing, and before 清空重寫 / 刪除段落 / 還原. It keeps up to 30 backups,
  thinned so recent minutes stay dense and older days stay represented.
  Deleting a section or clearing the article also shows a 復原 (undo) toast.
- **Multiple tabs**: a tab adopts newer text from storage (`storage` event, tab
  refocus), so a stale tab can't overwrite newer writing.
- **Robustness**: data that can't be parsed is copied to a
  `littleWriter:v2:rescue:<lang>` key, never overwritten. When storage is full,
  old backups are dropped before the article save is allowed to fail. If saving
  does fail, or storage is blocked (private mode), the header turns red, a
  banner tells the kid to copy or download, and closing the page asks first.
- Calls `navigator.storage.persist()` after the first save to reduce eviction.

Caveats worth knowing:

- Data belongs to **one browser on one device**. Clearing Safari website data
  deletes it. A home-screen shortcut on iOS has its own storage, separate from
  Safari. The `*.pages.dev` / preview URLs are different origins and have
  separate data. Always use `kids-writer.scsnake.xyz`.
- Safari may drop a site's storage after about 7 days without a visit (ITP).
  For anything worth keeping long term, use 下載存檔.

## Word counting

Implemented in `wordcount.js`; tests are in `test/`.

| Bucket | Counts as | Example |
|---|---|---|
| 國字 | 1 per character | 今天 → 2 |
| 注音 | 1 per syllable | ㄍㄠˋㄒㄧㄥˋ → 2 |
| English word | 1 per word; `’`/`'`/`-` join | don’t, well-known, 5th → 1 each |
| Number | 1 per number | 2024, 3.14, 1,000, ２０２４ → 1 each |
| 標點符號 | 1 per mark | ，。……——😀 → 1 each |

「字數」 = 國字 + 注音 + words + numbers. 「含標點」 also adds punctuation. The
word goal (at least / at most, optionally counting punctuation) is stored with
each article, and a progress bar appears under the header.

## Local dev

```sh
cd apps/little-writer
npm install
npm run build       # writes dist/bundle.js (commit it — Coolify serves it as-is)
npm test            # word counting + storage
npm run dev         # watch mode
```

Source layout: `main.js` (UI), `storage.js`, `wordcount.js`, `entry.js`
(mount point), and `index.html` (Tailwind CDN plus `dist/bundle.js`).
