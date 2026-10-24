# 科技原理小探險 (tech-explorer)

Short lessons for children on how everyday technology works. Each slide has a few
sentences and, on most slides, one small task: drag, tap, put in order, or a mini
simulation. A finished task earns a star. New terms show in zh-TW with the English
name beside them.

For the look, the layout and how to add a topic, see `DESIGN.md`.

For new topic packages, previews, catalog checks, and deployment, follow [TOPICS.md](TOPICS.md).
For agent deliverables, read [AGENT-HANDOFF.md](AGENT-HANDOFF.md).
See [REDESIGN-STATUS.md](REDESIGN-STATUS.md) for Gemini renewals and deferred activities.

## Units

Two parts. Part 1 teaches how to use a device, with rough ideas only. Part 2
explains how things work inside. Inside each part, a unit only uses ideas from
the units before it.

The home screen groups the units into 22 stages of 2 to 5 units (`STAGES` in
`js/units.js`). The next stage not read through is marked 「下一站」 and opens by
itself; a stage read through gets 🏅. No unit is locked. The
first time a Part 2 unit opens, a card suggests an earlier stage not read through
yet; 「直接開始」 closes it.

**Part 1: 認識和使用 (using devices)**

1. 認識 3C 裝置: computer, desktop vs laptop, phone/tablet, input and output
2. 開始操作: passcode and Face ID, mouse actions, touch gestures, iPad system gestures, tilt, screen rotation
3. 打字和輸入法: Zhuyin, English, handwriting, emoji, dictation, special keys, undo/redo
4. 設定和通知: text size, brightness, volume, notifications, Do Not Disturb, Accessibility
5. 線材和接頭: what each cable does, USB-A/C, Lightning, adapters
6. 電池和充電: chargers and watts, wireless charging, power banks (mAh), what drains the battery, charging safety
7. 愛護 3C: water and food, glass screens (drop test), heat, a wet device
8. 電子廢棄物: where old devices, batteries and trash go, the parts inside an old phone (metals to reuse, a battery that can catch fire), clearing a phone before giving it away
9. 健康使用 3C: the 3010 eye rule (a fast clock), posture, screens before bed, Screen Time limits
10. 拍照和錄影: camera app, where the camera is, camera lights and privacy
11. 檔案和資料夾: select / deselect / range / multi-select / select all, folders and paths, copy / cut / paste
12. 刪除和容量: rename, delete, Recently Deleted vs delete permanently, KB/MB/GB/TB
13. 檔案格式: file extensions and the App that opens each file (a .zip unpacks), renaming does not convert, the last dot (發票.pdf.exe), .zip
14. 連上網路: online vs offline, cable / Wi-Fi / cellular, personal hotspot, Mbps
15. 藍牙、GPS 和飛航模式: Bluetooth pairing, how GPS finds you, airplane mode in Control Center
16. 瀏覽器和網頁: address bar, links, back / forward / reload, browsing history
17. 帳號和雲端: sign up, user name, password, log in, good passwords, cloud sync, https and the lock icon
18. 密碼管理和通行密鑰: one password everywhere vs a different one each (a breach opens every account), the 密碼 App, signing in with a passkey on a real and a fake shop
19. 註冊、登入和登出: Website accounts: sign up once, log in to get a session ticket, change pages without retyping the password, and log out without deleting the account.
20. 網站記得什麼？: What websites and browsers remember: login state, local and account settings, autofill, local and saved drafts, cookies, sessionStorage and localStorage, and what logging out does not erase.
21. 登入更安全: Safer sign-in: unique passwords in a password manager, real two-factor authentication, refusing unexpected approvals, phishing-resistant methods, where a fingerprint stays, never sharing codes, and a recovery plan.
22. App 和更新: hardware vs software, installing from the App Store, permissions, spotting a fake look-alike app (developer, ratings, permissions), updates
23. 常用的 App: messenger vs email, video meetings, social media, search engines, office apps
24. 實用小技巧: screenshots, QR codes (and fake ones), backup, Find My
25. 地圖和導航: search a place, walk / bus / car routes, follow the turn-by-turn banner; who may see your location; a stranger asking for it; bus time includes the wait
26. 行動支付: tap a card or a phone at 30, 10 and 2 cm (NFC only works up close), what to do with a payment code, three pay screens to check (a wrong amount, a "scan to get money" scam), why a card with no battery can beep
27. AI 聊天機器人: what a chatbot is, catching a wrong answer, good and bad uses
28. 語音助理: clear commands for four jobs (vague ones ask back, no wake word gets no answer), the wake word, good and careful uses
29. AI 生成內容的標示: find the AI labels in a feed of real photos and real AI images (public domain, see img/ailabel/CREDITS.md), share your own AI picture honestly, AI and homework
30. 網路上的著作權: own work vs other people's work, pick pictures for a report by their license (創用 CC, public domain) and write the source, share the link instead of re-uploading
31. 共用文件和雲端硬碟: three people type in one document at once, 檢視者 / 加註者 / 編輯者 for a teammate, a teacher and parents, restoring a deleted part from the version history
32. 分享照片之前: find four clues in a photo (name tag, house number, bus stop, phone tag) and cover them, turn off 位置 in the share sheet's 選項, which photos to think twice about, asking friends first
33. 上網安全: scam messages, traps on web pages (fake ads, pop-ups, fake virus alerts, redirects, phishing), verification codes, two-factor authentication, malware, personal information, 165
34. 公共 Wi-Fi 和網購: pick the Wi-Fi on the library poster (look-alike and open networks), what to leave for home, a fake shop with 4 warning signs, in-app purchases (Ask to Buy), paying outside the shop
35. 被駭了怎麼辦？: sort the signs of a stolen account from normal events, the steps to get it back (tell an adult first, sign out all devices, two-factor authentication), a ransom screen (do not pay, go offline, restore from a backup), a USB drive found in the hallway goes to 失物招領
36. 假訊息和 AI 假圖: misinformation (source, date, forwarded hoaxes), spotting flaws in an AI-made picture, deepfake voices (a fake call from a parent), creepy videos dressed as cartoons (Elsagate), habits before forwarding
37. 網路禮儀和網路霸凌: think before you post, cyberbullying in a chat (don't reply, screenshot, tell an adult, block), bystanders
38. 緊急求救: 119 vs 110, calling from a locked phone (緊急 on the passcode screen), Medical ID, Emergency SOS
39. 搜尋技巧: pick the key words out of a question (filler words shake), find the official site under the 「贊助」 ads, sort sources by how far to trust them (an AI summary too)
40. 數位足跡: delete a post and watch the copies stay (a screenshot, a forward, a saved photo, a search engine), choose who can see a post (公開 / 朋友 / 只有我), which posts are fine ten years later
41. 訂閱和自動續訂: cancel a 7-day free trial before day 8 charges NT$290, turn off unused subscriptions (monthly and yearly totals), the steps to cancel on iPad, a 「first month for 1 dollar」 offer
42. 智慧手錶和穿戴裝置: green light measures the heart rate at rest and after running (with a stethoscope heartbeat sound), what the watch does alone vs with the phone, fall detection calling 119
43. 社群上的禮貌: Etiquette on social media: text without tone of voice, group-chat manners, asking before posting or tagging someone, and when to use a public comment or a private message.
44. 酸民和引戰文: Tell disagreement from trolling, see in a simulator how replies feed ragebait while muting lets it sink, find the angry blaming words that spread faster, and match mute, block and report to cases.
45. 螢幕後面的人: Online disinhibition, a loud few accounts behind a busy comment section (Pew 2019: 10% of users, 80% of tweets), personas, fake accounts and bots, and why real life is calmer than comments.
46. 網紅、業配和比較: Influencers and sponsored posts: find disclosure labels, spot unlabeled ads by their clues, see how filters and edits change a photo, and handle comparison and FOMO.
47. 陌生人的私訊: Spot grooming warning signs in a stranger's messages, refuse requests for private photos, and respond to sextortion threats by keeping evidence and telling a trusted adult.
48. 行銷文案的套路: Spot marketing-copy tricks and clickbait, tell honest reviews from disguised sponsored posts and fake reviews, and place posts on a trust ladder from labeled ads to scams.
49. 投資群組和假名人廣告: Find the clues in a fake celebrity investment ad, unmask the shills in an investment group chat, order the fake-investment path, sort warning words, and help a grandparent verify with 165 and the FSC licensed list.

**Part 2: 原理探索 (how it works)**

50. 電腦裡面: CPU, RAM vs storage, binary, bits vs bytes, key codes
51. 邏輯閘: AND (switches in a row), OR (side by side), NOT (the fridge light), gates in everyday rules
52. 電腦怎麼做加法？: counting up in binary with carries, a half adder from XOR and AND, a 4-bit ripple-carry adder stepped one column at a time
53. 作業系統: what an OS does, time sharing (multitasking)
54. 螢幕和感測器: touchscreen grid, sensors, mouse movement, pixels, RGB, LCD vs OLED, print dots
55. 資料怎麼存起來？: hard disk, flash/SSD, compression (run-length, lossy vs lossless), local vs cloud storage
56. 聲音和影片怎麼變成數字: sampling a sound wave (and hearing it), frames per second with a bouncing ball, why video needs compression
57. 人臉和指紋辨識: Face ID dots on a face and on a flat photo (front and side views, unlock or shake), a face as numbers compared with a limit (a twin gets in), Touch ID feature points, why the passcode still matters
58. CPU 和 GPU: cores, parallel computing, why AI uses GPUs
59. AI 怎麼學？: learning from examples, why data matters (bias)
60. 網路怎麼傳東西？: electromagnetic waves, IP address, packets, routers, servers
61. 網路的實體: follow a message from Taiwan to the US (cell tower, machine room, submarine cable, data center) on a map with Taiwan's real outline, submarine cables, data centers and their power
62. 網址和加密: URL parts, DNS, why we encrypt, a shift cipher, the TLS handshake
63. 物聯網和智慧家電: which things go online, a smart plant pot's message from sensor to phone, an air-conditioner rule with AND or OR over one day, default passwords on home cameras, how a tap at school reaches a lamp at home
64. IP 位址和連接埠: Route pretend requests by IP address, port and protocol, see that a port needs a listening program, and compare private addresses with a shared public address.
65. 防火牆: Practice firewall rules in a simulator: stateful return traffic, a narrow allow rule instead of allow-all, and how a firewall differs from HTTPS, malware scanning and NAT.
66. VPN 虛擬私人網路: Compare an ordinary route with a VPN tunnel, toggle VPN and HTTPS separately to see who can observe what in a simplified model, and learn what a VPN does not do.
67. 駭客想要什麼？: attack goals, permission before testing, social engineering, and practice boundaries
68. 密碼怎麼被猜到？: common passwords, password combinations, credential stuffing, and one-way password hashes
69. 網路上的攻擊: HTTP vs HTTPS on a fake Wi-Fi network, DDoS traffic, automatic visitors, and persistent traffic protection
70. 惡意程式和漏洞: malware types, an unlocked-door vulnerability, zero-day exposure, and installing a security update
71. 壞人怎麼讓你幫忙開門？: Four attack paths, fake-fix command tricks, verification-code theft, untrusted programs, and pause-and-verify decisions.
72. 防毒軟體能做什麼？: Known-pattern and behavior detection, quarantine, missed threats and false alarms, platform limits, and layered protection.
73. 備份：還有另一份: Separate backup copies, sync propagation, version history, 3-2-1 planning, offline protection, restore tests, and ransomware recovery.
74. 演算法: steps, binary search (number guessing), sorting by swaps
75. 推薦演算法: a video feed that narrows into a filter bubble (同溫層) and opens up again, breaking the bubble, autoplay
76. 免費 App 怎麼賺錢: a free balloon game with ads and a back room that logs your data, Cookies and tracking, three ways to earn, a flashlight App that wants contacts
77. 程式怎麼做出 App？: programming languages, a robot program, bugs and debugging, if-then, from code to the App Store
78. QR Code 怎麼運作？: tap the three finder squares to turn a tilted code upright, black = 1 and white = 0 (paint two bytes to spell Hi), error correction (which damage still scans)
79. 電腦怎麼記住時間？: a quartz crystal drives a 15-bit counter (32768 = 2^15) with slow and normal speed, syncing with an atomic-clock time server, time zones
80. GPS 怎麼算出位置？: distance from signal time and the speed of light, trilateration with three circles, a fourth satellite fixes the phone clock
81. 機器人和自動駕駛怎麼看路？: sense, think, act (the answer turns into a flow chart that loops through the 有人 / 沒人 branch), camera vs radar vs lidar in fog, a robot vacuum that maps a room and stops at the stairs

## Saved progress

Stars, viewed pages and the last page are saved in the browser's `localStorage`
(key `tech-explorer.v2`), by slide identity (title, or a quiz's question), so they
survive slides being added or moved. The home screen shows the total stars and a
"繼續上次" button; the footer has "清除學習紀錄". The time the page is on screen is
saved too (`secs`); the 3010 slide shows it for this visit and in total.
`since` is the day this browser started. A unit or slide with a later `added` date counts as
new until it is read; the home screen can filter by 🆕 新的 or ⭕ 還沒上過 (not opened yet).
Progress saved before `since` existed gets the first version's date, 2026-10-18.

- The data stays on one device and one browser; it is not synced.
- Safari may clear a site's storage after 7 days without a visit. A site added to
  the Home Screen is not affected, but it keeps its own storage, separate from Safari.
- `index.html` has the meta tags for "Add to Home Screen".

On a computer, ← → (also PageUp/PageDown, Space/Shift+Space, Home/End) switch slides that have no task; on a task slide the keys stay with the task.

Each task slide has a ↺ 重新玩 button. It starts the task again from the beginning. A star already earned stays.

The 📖 button (home screen and lesson bar) opens a side panel with the contents
by chapter and an index of every new term, each linked to its slide.

The ‹ 單元 link returns to the current unit's card, with its stage open.
If the current filter hides that card, the home screen switches to 全部.

## Local dev

```sh
cd ~/scripts/kids-portal
python3 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765/apps/tech-explorer/
```

## Files

- `js/course.js`: assembles existing lessons and approved topic packages. `js/topic-registry.js` registers packages; `js/topic-model.js` validates placement and IDs.
- `js/units.js`: legacy lesson text. A slide is `{ title, text, art }` or
  `{ title, text, widget, params }`. Wrap a new term in `t('中文', 'English')`.
- `js/widgets.js`: shared task implementations, such as `sort`, `choice`,
  `order`, `mouselab`, `touchlab`, `files`, `passcode`, `account`, `packets`, `code`.
  Each one gets `api.done()` to award the star.
- `js/widgets-hardware.js` and `widgets-hardware.css`: seven approved Gemini activities for computer input/output, phone parts, storage, CPU, GPU, and AI.
- `js/widgets-safety.js` and `widgets-safety.css`: seven approved Gemini activities for verification codes, Wi-Fi, purchases, account recovery, fake voices, DNS, and conditions.
- `js/widgets-medium.js`, `js/medium/batch1.js` through `batch3.js`, and `widgets-medium.css`: twelve approved Gemini activities in existing lessons.
  They cover portable devices, peripherals, charging safety, RAM and storage, sensors, URL parts, TLS, digital assets, HTTPS, tracking cookies, autoplay, and time zones.
  The recycling and password-hash redesigns remain deferred. Their previous lessons remain unchanged.
- `js/main.js`: routing (`#/u/<unit>/<slide>`), stars in `localStorage`, sound,
  and read-aloud with the device's zh-TW voice.
- `style.css`: shared styles. Each unit sets its own accent color `--c`.

When you change a file, bump its `?v=`: `style.css` and `js/main.js` in
`index.html`, `course.js` in `main.js`, and the module imports in `course.js`.
The topic release command updates these versions automatically for new topics.

For legacy redesigns, `tests/redesign/medium/manifest.json` records the approved replacements and exclusions.
`tests/redesign/medium/checks.json` records completion checks for the twelve activities.
Run `tests/redesign/browser.py --group all` with Playwright to test all approved legacy redesigns, including completion and replay.
These checks supplement the topic package and home-return tests. A smoke check does not authorize deployment.

## Notes

- The tilt game can use the real gyroscope, but iPadOS allows it only on an
  `https://` page. On `http://` (local preview) it falls back to the joystick.
- An action the device cannot do (pinch and rotate without a touchscreen, hover without a mouse) stays listed as a 🚫 row that explains it, but is not interactive and does not count toward the star.
- Class names: widget styles share one stylesheet, so give each widget's inner
  parts names that no other widget or `main.js` uses (a clash once moved the
  touch-grid tablet off screen).
