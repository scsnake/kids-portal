# 科技原理小探險 (tech-explorer)

Short lessons for children on how everyday technology works. Each slide has a few
sentences and, on most slides, one small task: drag, tap, put in order, or a mini
simulation. A finished task earns a star. New terms show in zh-TW with the English
name beside them.

## Units

Two parts. Part 1 teaches how to use a device, with rough ideas only. Part 2
explains how things work inside. Inside each part, a unit only uses ideas from
the units before it.

**Part 1: 認識和使用 (using devices)**

1. 認識 3C 裝置: computer, desktop vs laptop, phone/tablet, input and output
2. 開始操作: passcode and Face ID, mouse actions, touch gestures, iPad system gestures, tilt, screen rotation
3. 打字和輸入法: Zhuyin, English, handwriting, emoji, dictation, special keys, undo/redo
4. 設定和通知: text size, brightness, volume, notifications, Do Not Disturb, Accessibility
5. 線材和接頭: what each cable does, USB-A/C, Lightning, adapters
6. 電池和充電: chargers and watts, wireless charging, power banks (mAh), what drains the battery, charging safety
7. 愛護 3C: water and food, glass screens (drop test), heat, a wet device
8. 拍照和錄影: camera app, where the camera is, camera lights and privacy
9. 檔案和資料夾: select / deselect / range / multi-select / select all, folders and paths, copy / cut / paste
10. 刪除和容量: rename, delete, Recently Deleted vs delete permanently, KB/MB/GB/TB
11. 連上網路: online vs offline, cable / Wi-Fi / cellular, personal hotspot, Mbps
12. 藍牙、GPS 和飛航模式: Bluetooth pairing, how GPS finds you, airplane mode in Control Center
13. 瀏覽器和網頁: address bar, links, back / forward / reload, browsing history
14. 帳號和雲端: sign up, user name, password, log in, good passwords, cloud sync, https and the lock icon
15. App 和更新: hardware vs software, installing from the App Store, permissions, updates
16. 常用的 App: messenger vs email, video meetings, social media, search engines, office apps
17. 實用小技巧: screenshots, QR codes (and fake ones), backup, Find My
18. AI 聊天機器人: what a chatbot is, catching a wrong answer, good and bad uses
19. 上網安全: scam messages, traps on web pages (fake ads, pop-ups, fake virus alerts, redirects, phishing), verification codes, two-factor authentication, malware, personal information, 165

**Part 2: 原理探索 (how it works)**

20. 電腦裡面: CPU, RAM vs storage, binary, bits vs bytes, key codes
21. 作業系統: what an OS does, time sharing (multitasking)
22. 螢幕和感測器: touchscreen grid, sensors, mouse movement, pixels, RGB, LCD vs OLED, print dots
23. 資料怎麼存起來？: hard disk, flash/SSD, compression (run-length, lossy vs lossless), local vs cloud storage
24. CPU 和 GPU: cores, parallel computing, why AI uses GPUs
25. AI 怎麼學？: learning from examples, why data matters (bias)
26. 網路怎麼傳東西？: electromagnetic waves, IP address, packets, routers, servers
27. 網址和加密: URL parts, DNS, why we encrypt, a shift cipher, the TLS handshake
28. 演算法: steps, binary search (number guessing), sorting by swaps
29. 程式怎麼做出 App？: programming languages, a robot program, bugs and debugging, if-then, from code to the App Store

## Saved progress

Stars, viewed pages and the last page are saved in the browser's `localStorage`
(key `tech-explorer.v2`), by slide identity (title, or a quiz's question), so they
survive slides being added or moved. The home screen shows the total stars and a
"繼續上次" button; the footer has "清除學習紀錄".

- The data stays on one device and one browser; it is not synced.
- Safari may clear a site's storage after 7 days without a visit. A site added to
  the Home Screen is not affected, but it keeps its own storage, separate from Safari.
- `index.html` has the meta tags for "Add to Home Screen".

On a computer, ← → (also PageUp/PageDown, Space/Shift+Space, Home/End) switch slides that have no task; on a task slide the keys stay with the task.

Each task slide has a ↺ 重新玩 button. It starts the task again from the beginning. A star already earned stays.

The 📖 button (home screen and lesson bar) opens a side panel with the contents
by chapter and an index of every new term, each linked to its slide.

## Local dev

```sh
cd ~/scripts/kids-portal
python3 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765/apps/tech-explorer/
```

## Files

- `js/units.js`: all lesson text. A slide is `{ title, text, art }` or
  `{ title, text, widget, params }`. Wrap a new term in `t('中文', 'English')`.
- `js/widgets.js`: one function per task type (about 55 types, such as `sort`, `choice`,
  `order`, `mouselab`, `touchlab`, `files`, `passcode`, `account`, `packets`, `code`).
  Each one gets `api.done()` to award the star.
- `js/main.js`: routing (`#/u/<unit>/<slide>`), stars in `localStorage`, sound,
  and read-aloud with the device's zh-TW voice.
- `style.css`: all styles. Each unit sets its own accent color `--c`.

When you change a file, bump its `?v=`: `style.css` and `js/main.js` in
`index.html`, `units.js` and `widgets.js` in the imports at the top of `main.js`
(then bump `main.js` too, so the browser sees the new imports).

## Notes

- The tilt game can use the real gyroscope, but iPadOS allows it only on an
  `https://` page. On `http://` (local preview) it falls back to the joystick.
- An action the device cannot do (pinch and rotate without a touchscreen, hover without a mouse) stays listed as a 🚫 row that explains it, but is not interactive and does not count toward the star.
- Class names: widget styles share one stylesheet, so give each widget's inner
  parts names that no other widget or `main.js` uses (a clash once moved the
  touch-grid tablet off screen).
