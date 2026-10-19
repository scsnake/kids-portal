# Design notes: 科技原理小探險

Use these notes when you add or change a topic. They keep the course consistent in
look, layout, wording and interaction. `README.md` explains the files and the code.

## 1. Who it is for

- **Children** who read simple Traditional Chinese.
- **Older adults** who use a phone or tablet for the first time.
- Both groups learn best from short text and one small hands-on task.

Device priority:

1. iPad, portrait and landscape. This is the main device.
2. A computer with a mouse or trackpad, for example a MacBook (1280×800).
3. A phone. It must work, but it gets less polish.

Language: zh-TW vocabulary and Traditional characters (影片, 程式, 網路, 螢幕, 登入).
Each new term shows its English name beside it.

## 2. Course structure

The course has two parts:

| Part | id | Goal |
|---|---|---|
| Part 1 認識和使用 | `basic` | How to use a device. Rough ideas only. |
| Part 2 原理探索 | `adv` | How it works inside. |

Rules:

- A unit uses only terms from the units before it. Place a new topic by what it
  needs, not at the end of the list.
- A unit has 2 to 7 slides. Most units end with a 考考你 slide (`choice`).
- A slide teaches one idea.
- Part 1 never needs Part 2. Part 2 can refer back to Part 1.

## 3. How a slide looks

```
iPad landscape (≥ 900px wide)          iPad portrait / phone
┌──────────────────────────────────┐   ┌────────────────────┐
│ ‹ 單元   🔌 Unit title   • • ●  🔊 │   │ ‹ 單元  title    🔊 │
├───────────┬──────────────────────┤   ├────────────────────┤
│ Title     │                      │   │ Title              │
│ Text,     │      Task area       │   │ Text               │
│ 2–3 lines │      (stage)         │   │ ☆ star  ↺ 重新玩    │
│ ☆  ↺      │                      │   │ Task area          │
├───────────┴──────────────────────┤   ├────────────────────┤
│ ◀ 上一頁        3 / 6    下一頁 ▶ │   │ ◀      3/6       ▶ │
└──────────────────────────────────┘   └────────────────────┘
```

- In landscape, the words take 34% of the width and the task takes the rest.
- In portrait, the words sit above the task.
- `main.js` draws the bar, the star line, the ↺ 重新玩 button and the page buttons.
  A slide only gives its title, its text, and an `art` or a `widget`.
- The whole slide must fit on one iPad screen and on a MacBook screen, with no
  scrolling. Check both orientations.

## 4. Writing the text

- Two or three short sentences. A child reads them in one breath. Most texts are
  about 80 characters; try to stay under 120.
- Speak to the reader as 你. Use everyday examples: school, home, a trip, a game.
- Wrap each new term in `t('中文', 'English')`, the first time it appears in a slide.
- Bold (`<b>`) one or two key words at most.
- On a task slide, end with a short call to action: 試試看！ 分分看！ 排排看！
- Titles are short. Many are a question: 「網路是什麼？」「手機怎麼知道你在哪？」
- Safety topics stay calm. Tell the reader what to do, not what to fear. Give the
  real help line where it fits (165 反詐騙專線).
- Use safe sample data: the documentation address `203.0.113.25`, made-up names, and
  made-up sites such as `library.example.tw`. Never use a real person's account or a
  real scam site.

## 5. Visual style

Colors (tokens in `style.css` `:root`):

| Token | Value | Use |
|---|---|---|
| `--paper` | `#fbf6ec` | page background, warm paper |
| `--card` | `#ffffff` | cards, chips, buttons |
| `--ink` / `--ink-2` / `--ink-3` | `#1d2738` / `#4a5568` / `#8a93a3` | text, secondary text, hints |
| `--line` | `#e6dfd0` | borders |
| `--good` / `--bad` | `#2b8a3e` / `#e03131` | right and wrong |
| `--star` | `#f59f00` | stars |
| `--c` | per unit | the unit's accent color |

- Each unit sets `color:` in `units.js`. Pick a mid-dark color that white text can sit
  on (contrast 4.5:1 or more). Avoid the colors of the units next to it.
- The accent colors the title, new terms, the main button (`.go`) and the 下一頁 button.
  Do not use it for large backgrounds.
- Shapes: rounded corners (`--radius: 18px`, 14px on buttons and chips), soft shadow,
  and a 3px "press" shadow under buttons.
- Fonts: the system font (PingFang TC on Apple). Use monospace for codes, bits,
  IP addresses and URLs.

Icons and pictures:

- Use emoji first. They are clear, colorful and cost nothing.
- Draw a small inline SVG when an emoji can mislead. Examples in the code:
  - a router box with antennas (`ROUTER`), because 📡 reads as a satellite dish;
  - a USB flash drive (`USB`), because 🔑 reads as a key;
  - an Ethernet plug (`WAY_ICONS.cable`), because 🔌 reads as a power plug;
  - a cell tower (`WAY_ICONS.cell`).
- Draw a device (iPad, browser window, phone) when the task copies a real screen.
  Keep it simple: a frame, a few shapes and the parts the task needs.

## 6. Tasks (widgets)

Most slides have one task. Finishing it earns a star (`api.done()`).

Choose the simplest task type that teaches the idea:

| Type | Use it when | Example |
|---|---|---|
| `choice` | one right answer, with a short explanation | 考考你 |
| `sort` | put items into 2–4 groups | 好習慣 / 不要這樣做 |
| `order` | the steps have a fixed order | install an App |
| `art` (no task) | a picture explains it, nothing to do | 電腦是什麼？ |
| a new widget | the idea needs a simulation or a real screen copy | camera, router, TLS |

Interaction rules:

1. **Touch first.** Every target is at least 44px; buttons and chips are 52px high.
2. **Every drag has a tap path.** Tap the item, then tap the place.
   The `drag()` helper gives both.
3. **Nothing depends on hover or right-click.** Use long press as the touch
   equivalent of right-click.
4. **Mouse, finger and pen all work.** Use pointer events, not touch-only or mouse-only events.
5. **A device cannot do some actions** (pinch with a mouse, hover with a finger).
   Keep the action listed with 🚫 and the reason, but do not make it required.
   Use the `na:` field in `checklist()`.
6. **Mistakes are cheap.** A wrong answer shakes, plays a soft sound and shows a
   short hint. It has no penalty and the child tries again.
7. **Success is clear.** Pop the item, play the good sound, and show a short 🎉 line
   that says what was learned.
8. **No time pressure.** Never fail a child for being slow.
9. **Re-run safe.** ↺ 重新玩 starts the widget again on a fresh element. Put all
   timers through `api.later()` and check `api.alive()` in loops, so old runs stop.
10. **Calm motion.** Keep animations short and purposeful. Turn off decoration under
    `prefers-reduced-motion`.
11. **Own class prefix.** All widgets share one stylesheet. Give each new widget a
    short prefix (`rt-`, `tl-`, `wt-`) for its inner class names.

## 7. Add a topic: checklist

1. Find the unit by dependency (section 2). Make a new unit only for a new area.
2. Write the slide: title, text, and `art` or `widget` + `params` (section 4).
3. Reuse `choice`, `sort` or `order` if they fit. Write a new widget only if needed.
4. Add a 考考你 question if the unit has none for this idea.
5. Check on iPad portrait (820×1180), iPad landscape (1180×820) and 1280×800.
   Check with a finger and with a mouse.
6. Bump the `?v=` numbers (see `README.md`).
7. Add a line to `changelog.json` in plain words for parents.
8. Update the unit list in `README.md` if the topic is new.
