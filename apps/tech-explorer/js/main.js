import { UNITS, COMING, PARTS, STAGES } from './units.js?v=12';
import { WIDGETS } from './widgets.js?v=12';

const app = document.getElementById('app');
const STORE = 'tech-explorer.v2';

// ---------- progress, kept in this browser's localStorage ----------
// Saved by slide identity (title, or the question of a quiz) rather than position,
// so stars stay on the right slide when slides are added or moved.
//   done: slide keys whose task is finished (each one is a star)
//   seen: slide keys that were opened
//   last: { unit, index } of the last slide opened, plus each unit's last index
//   secs: seconds the app was on screen, in total (shown on the 3010 slide)

const slideKey = sl => (sl.title === '考考你' ? 'Q:' + sl.params.question : sl.title);

function load() {
  try {
    const p = JSON.parse(localStorage.getItem(STORE));
    if (p && Array.isArray(p.done)) return p;
  } catch {}
  return { done: [], seen: [], last: null, lastIn: {} };
}
let progress = load();
const done = new Set(progress.done);
const seen = new Set(progress.seen);
const save = () => {
  progress.done = [...done];
  progress.seen = [...seen];
  try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch {}
};
const isDone = sl => done.has(slideKey(sl));
const markDone = sl => {
  const k = slideKey(sl);
  if (done.has(k)) return false;
  done.add(k);
  save();
  // ask the browser not to clear our data when space runs low (a no-op where unsupported)
  navigator.storage?.persist?.().catch(() => {});
  return true;
};
const markSeen = (unit, index) => {
  seen.add(slideKey(unit.slides[index]));
  progress.last = { unit: unit.id, index };
  progress.lastIn = { ...progress.lastIn, [unit.id]: index };
  save();
};
const starsOf = u => {
  const tasks = u.slides.filter(x => x.widget);
  return { got: tasks.filter(isDone).length, total: tasks.length };
};
const seenOf = u => u.slides.filter(sl => seen.has(slideKey(sl))).length;

// ---------- stages: small groups of units, each about one sitting ----------
// A stage is read through when every slide of its units was opened. Stars stay a bonus.
const unitById = id => UNITS.find(u => u.id === id);
const stageOf = u => STAGES.find(s => s.units.includes(u?.id));
const stageUnits = s => s.units.map(unitById);
const stageNo = s => STAGES.indexOf(s) + 1;
const stageSeen = s => stageUnits(s).reduce((a, u) => [a[0] + seenOf(u), a[1] + u.slides.length], [0, 0]);
const stageRead = s => { const [got, all] = stageSeen(s); return got === all; };
const nextStage = () => STAGES.find(s => !stageRead(s));
// The first slide of a stage not opened yet, as a link.
const firstUnread = s => {
  for (const u of stageUnits(s)) {
    const i = u.slides.findIndex(sl => !seen.has(slideKey(sl)));
    if (i >= 0) return `#/u/${u.id}/${i}`;
  }
  return `#/u/${s.units[0]}/0`;
};
// A unit card opens where the child stopped, unless the unit was read to the end.
const resumeAt = u => {
  const i = progress.lastIn?.[u.id] ?? 0;
  return i >= u.slides.length - 1 ? 0 : i;
};
function resetProgress() {
  if (!confirm('確定要清除這台裝置上的所有星星和學習紀錄嗎？清除後就找不回來了。')) return;
  done.clear();
  seen.clear();
  progress = { done: [], seen: [], last: null, lastIn: {} };
  visit = 0;
  save();
  home();
}

// ---------- time on screen: counted only while the page is visible ----------
// A tick adds at most a minute, so a device asleep with the page open adds little.

let visit = 0, shownAt = document.hidden ? 0 : Date.now();
function addTime() {
  if (!shownAt) return;
  const now = Date.now(), secs = Math.min((now - shownAt) / 1000, 60);
  shownAt = now;
  visit += secs;
  progress.secs = (progress.secs || 0) + secs;
  save();
}
setInterval(() => { if (!document.hidden) addTime(); }, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { addTime(); shownAt = 0; } else shownAt = Date.now();
});
window.addEventListener('pagehide', addTime);
const timeUsed = () => { addTime(); return { visit, total: progress.secs || 0 }; };

// ---------- sound ----------

let ctx = null;
function tone(notes, type = 'sine', len = 0.12) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const t = ctx.currentTime + i * len;
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len * 1.6);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + len * 2);
    });
  } catch {}
}
const sfx = {
  good: () => tone([660, 880]),
  bad: () => tone([220, 180], 'triangle', 0.1),
  star: () => tone([523, 659, 784, 1047], 'sine', 0.09),
};

// ---------- read aloud (zh-TW voice; the English tags are skipped) ----------

const synth = window.speechSynthesis;
function speak(html, btn) {
  if (!synth) return;
  if (synth.speaking) { synth.cancel(); btn?.classList.remove('talking'); return; }
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('.en').forEach(e => e.remove());
  const u = new SpeechSynthesisUtterance(div.textContent.replace(/\s+/g, ' '));
  u.lang = 'zh-TW';
  u.rate = 0.9;
  const voice = synth.getVoices().find(v => /zh[-_]TW/i.test(v.lang));
  if (voice) u.voice = voice;
  u.onend = u.onerror = () => btn?.classList.remove('talking');
  btn?.classList.add('talking');
  synth.speak(u);
}
const hush = () => synth?.cancel();

// ---------- book-style index: contents by chapter, and an index of terms ----------

const TERM = /<b class="term">([^<]+)<span class="en" lang="en">([^<]+)<\/span><\/b>/g;
const strip = html => html.replace(/<[^>]+>/g, '');

// Each new term, linked to the first slide that introduces it.
const TERMS = (() => {
  const seen = new Map();
  UNITS.forEach((u, ui) => u.slides.forEach((sl, si) => {
    for (const [, zh, en] of (sl.text || '').matchAll(TERM)) {
      if (!seen.has(zh)) seen.set(zh, { zh, en, ui, si });
    }
  }));
  let order;
  try { order = new Intl.Collator('zh-Hant-TW-u-co-zhuyin'); } catch { order = new Intl.Collator('zh-Hant-TW'); }
  return [...seen.values()].sort((a, b) => order.compare(a.zh, b.zh));
})();

let here = null; // { unit, index } of the slide on screen, for highlighting

function indexPanel() {
  let panel = document.getElementById('book-index');
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'book-index';
  panel.hidden = true;
  panel.innerHTML = `
    <div class="ix-veil" data-close></div>
    <aside class="ix" role="dialog" aria-label="目錄和名詞索引">
      <header class="ix-head">
        <div class="ix-tabs" role="tablist">
          <button role="tab" data-tab="toc">📖 目錄</button>
          <button role="tab" data-tab="terms">🔤 名詞索引</button>
        </div>
        <button class="icon-btn" data-close aria-label="關閉">✕</button>
      </header>
      <div class="ix-body"></div>
    </aside>`;
  document.body.append(panel);
  panel.addEventListener('click', e => {
    if (e.target.closest('[data-close]') || e.target.closest('a[href^="#"]')) closeIndex();
    const tab = e.target.closest('[data-tab]');
    if (tab) drawIndex(tab.dataset.tab);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closeIndex(); });
  return panel;
}

function drawIndex(tab) {
  const panel = indexPanel();
  panel.dataset.tab = tab;
  panel.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
  const body = panel.querySelector('.ix-body');
  if (tab === 'toc') {
    body.innerHTML = PARTS.map(part => `
      <h3 class="ix-part">${part.title}</h3>
      ${STAGES.filter(s => s.part === part.id).map(st => `
      <h4 class="ix-stage">第 ${stageNo(st)} 站・${st.icon} ${st.title}</h4>
      ${stageUnits(st).map(u => {
        const n = UNITS.indexOf(u) + 1;
        const open = here && here.unit === u;
        return `
          <details class="ix-unit" style="--c:${u.color}"${open ? ' open' : ''}>
            <summary><span class="ix-no">${n}</span>${u.icon} ${u.title}<small lang="en">${u.en}</small></summary>
            <ol>${u.slides.map((sl, i) => {
              const terms = [...(sl.text || '').matchAll(TERM)].map(m => m[1]);
              const cur = open && here.index === i;
              return `<li${cur ? ' class="cur"' : ''}><a href="#/u/${u.id}/${i}">${sl.widget ? '🎯 ' : ''}${sl.title === '考考你' ? '考考你：' + strip(sl.params.question).slice(0, 18) + '…' : sl.title}</a>${terms.length ? `<span class="ix-terms">${terms.join('、')}</span>` : ''}</li>`;
            }).join('')}</ol>
          </details>`;
      }).join('')}`).join('')}`).join('') + COMING.map(c => `<p class="ix-soon">${c.icon} ${c.title}（即將推出）</p>`).join('');
    body.querySelector('.cur')?.scrollIntoView({ block: 'center' });
  } else {
    body.innerHTML = `
      <input class="ix-search" type="search" placeholder="找名詞，中文或英文都可以" aria-label="搜尋名詞">
      <p class="ix-count"></p>
      <ul class="ix-list">${TERMS.map(t => `
        <li data-k="${(t.zh + ' ' + t.en).toLowerCase()}"><a href="#/u/${UNITS[t.ui].id}/${t.si}">
          <b>${t.zh}</b><span class="en" lang="en">${t.en}</span>
          <small>第 ${t.ui + 1} 章．${UNITS[t.ui].title}</small></a></li>`).join('')}</ul>`;
    const input = body.querySelector('.ix-search');
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      body.querySelectorAll('.ix-list li').forEach(li => {
        const ok = !q || li.dataset.k.includes(q);
        li.hidden = !ok;
        if (ok) shown++;
      });
      body.querySelector('.ix-count').textContent = `共 ${shown} 個名詞`;
    };
    input.addEventListener('input', filter);
    filter();
  }
}

function openIndex() {
  const panel = indexPanel();
  drawIndex(panel.dataset.tab || 'toc');
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('open'));
}
function closeIndex() {
  const panel = document.getElementById('book-index');
  if (!panel || panel.hidden) return;
  panel.classList.remove('open');
  setTimeout(() => { panel.hidden = true; }, 200);
}
const indexBtn = `<button class="icon-btn ix-btn" data-index aria-label="目錄和名詞索引" title="目錄和名詞索引">📖</button>`;
document.addEventListener('click', e => { if (e.target.closest('[data-index]')) openIndex(); });

// ---------- views ----------

const portalLink = `
  <a class="portal-link" href="https://kids.scsnake.xyz/" aria-label="回到兒童入口網站" title="Kids Portal">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>
  </a>`;

function unitCard(u) {
  const { got, total } = starsOf(u);
  return `
    <li><a class="unit-card${got === total ? ' full' : ''}" href="#/u/${u.id}/${resumeAt(u)}" style="--c:${u.color}">
      <span class="unit-no">${UNITS.indexOf(u) + 1}</span>
      <span class="unit-icon">${u.icon}</span>
      <span class="unit-title">${u.title}</span>
      <span class="unit-en" lang="en">${u.en}</span>
      <span class="unit-desc">${u.desc}</span>
      <span class="unit-stars" aria-label="得到 ${got} 顆星，共 ${total} 顆">${'★'.repeat(got)}<span class="dim">${'★'.repeat(total - got)}</span></span>
      <span class="unit-seen" aria-label="看了 ${seenOf(u)} 頁，共 ${u.slides.length} 頁"><i style="width:${(seenOf(u) / u.slides.length) * 100}%"></i></span>
    </a></li>`;
}

const soonCard = c => `
  <li><div class="unit-card soon">
    <span class="unit-icon">${c.icon}</span>
    <span class="unit-title">${c.title}</span>
    <span class="unit-en" lang="en">${c.en}</span>
    <span class="unit-desc">${c.desc}</span>
    <span class="soon-tag">即將推出</span>
  </div></li>`;

// Folded stage rows; open are the next stage, the stage of the last slide opened,
// and any stage opened by hand during this visit.
const openStages = new Set();
function stageBox(s) {
  const units = stageUnits(s);
  const [got, all] = stageSeen(s);
  const stars = units.reduce((a, u) => { const x = starsOf(u); return [a[0] + x.got, a[1] + x.total]; }, [0, 0]);
  const next = s === nextStage();
  const open = next || s === stageOf(unitById(progress.last?.unit)) || openStages.has(s.id);
  const first = UNITS.indexOf(units[0]) + 1, end = first + units.length - 1;
  return `
    <details class="stage-box${got === all ? ' read' : ''}" data-stage="${s.id}" style="--c:${units[0].color}"${open ? ' open' : ''}>
      <summary>
        <span class="stage-no">第 ${stageNo(s)} 站</span>
        <span class="stage-icon" aria-hidden="true">${s.icon}</span>
        <span class="stage-name"><b>${s.title}</b><small lang="en">${s.en}</small><small>${end > first ? `第 ${first}–${end} 章・${units.length} 章` : `第 ${first} 章`}</small></span>
        ${next ? '<span class="stage-tag">下一站</span>' : got === all ? '<span class="stage-tag done">🏅 看完了</span>' : ''}
        <span class="stage-prog">
          <span class="stage-stars" aria-label="得到 ${stars[0]} 顆星，共 ${stars[1]} 顆">★ ${stars[0]} / ${stars[1]}</span>
          <span class="unit-seen" aria-label="看了 ${got} 頁，共 ${all} 頁"><i style="width:${(got / all) * 100}%"></i></span>
        </span>
      </summary>
      <ul class="units">${units.map(unitCard).join('')}</ul>
    </details>`;
}
// A click on the summary toggles the row after this handler, so it flips the state here.
app.addEventListener('click', e => {
  const box = e.target.closest('summary')?.parentElement;
  if (!box?.dataset.stage) return;
  box.open ? openStages.delete(box.dataset.stage) : openStages.add(box.dataset.stage);
});

function resumeHTML() {
  const all = UNITS.reduce((a, u) => { const x = starsOf(u); return [a[0] + x.got, a[1] + x.total]; }, [0, 0]);
  const last = progress.last && UNITS.find(u => u.id === progress.last.unit);
  const i = last ? Math.min(progress.last.index, last.slides.length - 1) : 0;
  return `
    <p class="total-stars">★ ${all[0]} / ${all[1]} 顆星</p>
    ${last ? `<a class="resume" href="#/u/${last.id}/${i}" style="--c:${last.color}">▶ 繼續上次：第 ${UNITS.indexOf(last) + 1} 章 ${last.title}・第 ${i + 1} 頁</a>` : ''}`;
}

function home() {
  hush();
  onFinish = null;
  slideToken++; // ends the last slide's widget, so its key and sensor listeners stop
  here = null;
  document.title = '科技原理小探險';
  app.innerHTML = `
    <main class="home">
      ${portalLink}
      <button class="ix-open" data-index>📖 目錄和名詞索引</button>
      <header class="home-head">
        <h1>科技原理小探險</h1>
        <p class="sub">How Tech Works・電腦、手機和網路是怎麼運作的？</p>
        ${resumeHTML()}
      </header>
      ${PARTS.map(part => {
        const stages = STAGES.filter(s => s.part === part.id);
        const coming = COMING.filter(c => c.part === part.id);
        if (!stages.length && !coming.length) return '';
        return `
          <h2 class="part-title">${part.title}<span class="en" lang="en">${part.en}</span></h2>
          ${part.desc ? `<p class="part-desc">${part.desc}</p>` : ''}
          <div class="stages">${stages.map(stageBox).join('')}</div>
          ${coming.length ? `<ul class="units">${coming.map(soonCard).join('')}</ul>` : ''}`;
      }).join('')}
      <footer class="foot">
        <p class="store-note">星星和進度只存在這台裝置的瀏覽器裡。在 iPad 上用 Safari 的「分享 → 加入主畫面」，以後從主畫面打開，紀錄比較不會被自動清掉（主畫面和 Safari 的紀錄是分開的）。</p>
        <p><button class="link-btn" data-act="reset">清除學習紀錄</button></p>
        <p>Made by <a href="mailto:scsnake@gmail.com">scsnake@gmail.com</a></p>
        <app-changelog src="changelog.json" lang="zh"></app-changelog>
      </footer>
    </main>`;
  app.querySelector('[data-act="reset"]').onclick = resetProgress;
}

let slideToken = 0;

function lesson(unit, index) {
  hush();
  let token = ++slideToken;
  const slide = unit.slides[index];
  here = { unit, index };
  onFinish = null;
  // First visit to a Part 2 unit: point to an earlier stage that was not read through.
  const stage = stageOf(unit);
  const gap = unit.part === 'adv' && !seenOf(unit)
    ? STAGES.slice(0, STAGES.indexOf(stage)).find(s => !stageRead(s)) : null;
  markSeen(unit, index);
  const last = index === unit.slides.length - 1;
  document.title = `${unit.title}・科技原理小探險`;

  app.innerHTML = `
    <main class="lesson" style="--c:${unit.color}">
      <header class="bar">
        <a class="back-units" href="#/" aria-label="回到單元列表">‹ 單元</a>
        <span class="bar-title">${unit.icon} ${unit.title}</span>
        <span class="dots">${unit.slides.map((s, i) =>
          `<a href="#/u/${unit.id}/${i}" class="dot${i === index ? ' here' : ''}${s.widget ? ' play' : ''}${isDone(s) ? ' got' : seen.has(slideKey(s)) ? ' seen' : ''}" aria-label="第 ${i + 1} 頁"></a>`).join('')}</span>
        ${indexBtn}
        <button class="icon-btn say" aria-label="唸給我聽">🔊</button>
      </header>
      <section class="slide${slide.widget ? ' has-widget' : ''}">
        <div class="words">
          <h2>${slide.title}</h2>
          ${slide.text ? `<p class="text">${slide.text}</p>` : ''}
          ${slide.widget ? `<div class="star-row"><p class="star-note${isDone(slide) ? ' got' : ''}">${isDone(slide) ? '★ 已完成' : '☆ 完成任務得到一顆星'}</p>
            <button class="redo" aria-label="這一頁重新來一次">↺ 重新玩</button></div>` : ''}
        </div>
        <div class="stage">${slide.art ? `<div class="art">${slide.art}</div>` : ''}</div>
      </section>
      <nav class="nav">
        <a class="nav-btn prev${index === 0 ? ' hidden' : ''}" href="#/u/${unit.id}/${index - 1}">◀ 上一頁</a>
        <span class="page-no">${index + 1} / ${unit.slides.length}${!slide.widget && keyboardLikely ? '<small class="key-hint">← → 換頁</small>' : ''}</span>
        <a class="nav-btn next" href="${last ? `#/done/${unit.id}` : `#/u/${unit.id}/${index + 1}`}">${last ? '完成 🎉' : '下一頁 ▶'}</a>
      </nav>
    </main>`;

  if (gap) {
    const [got, all] = stageSeen(gap);
    const tip = document.createElement('div');
    tip.className = 'tip-veil';
    tip.innerHTML = `
      <div class="tip-card" role="dialog" aria-modal="true" aria-labelledby="tip-h" style="--c:${unitById(gap.units[0]).color}">
        <p class="tip-icon" aria-hidden="true">🧭</p>
        <h3 id="tip-h">建議先看第 ${stageNo(gap)} 站「${gap.title}」</h3>
        <p>這一章會用到前面學過的東西。第 ${stageNo(gap)} 站還有 ${all - got} 頁沒看過。</p>
        <div class="tip-btns">
          <a class="nav-btn" href="${firstUnread(gap)}">先去第 ${stageNo(gap)} 站</a>
          <button class="nav-btn next" data-go>直接開始 ▶</button>
        </div>
      </div>`;
    app.querySelector('.lesson').append(tip);
    tip.querySelector('[data-go]').onclick = () => tip.remove();
    tip.querySelector('[data-go]').focus();
  }

  const sayBtn = app.querySelector('.say');
  sayBtn.onclick = () => {
    const q = slide.params?.question ? ' ' + slide.params.question : '';
    speak(`${slide.title}。${slide.text || ''}${q}`, sayBtn);
  };

  if (slide.widget) {
    const api = {
      alive: () => token === slideToken,
      later: (fn, ms) => setTimeout(() => { if (token === slideToken) fn(); }, ms),
      good: () => sfx.good(),
      timeUsed,
      bad: () => sfx.bad(),
      done: () => {
        if (token !== slideToken) return;
        const fresh = markDone(slide);
        if (fresh) setTimeout(sfx.star, 250);
        const note = app.querySelector('.star-note');
        note.textContent = '★ 已完成';
        note.classList.add('got');
        app.querySelectorAll('.dot')[index].classList.add('got');
        app.querySelector('.nav .next').classList.add('glow');
      },
    };
    // Start the task again from the beginning; the star already earned stays.
    // A fresh stage element drops listeners the last run put on it.
    const start = () => {
      const old = app.querySelector('.stage'), stage = old.cloneNode(false);
      old.replaceWith(stage);
      WIDGETS[slide.widget](stage, slide.params || {}, api);
      return stage;
    };
    app.querySelector('.redo').onclick = () => {
      hush();
      token = ++slideToken; // ends the old run's timers and window listeners
      start().animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
    };
    start();
  }
}

function finished(unit) {
  hush();
  onFinish = unit;
  here = null;
  slideToken++;
  const i = UNITS.indexOf(unit);
  const next = UNITS[i + 1];
  const { got, total } = starsOf(unit);
  const stage = stageOf(unit), nextSt = stageOf(next);
  app.innerHTML = `
    <main class="finish" style="--c:${unit.color}">
      <div class="confetti" aria-hidden="true">${Array.from({ length: 24 }, (_, k) =>
        `<i style="left:${(k * 37) % 100}%;animation-delay:${((k * 0.29) % 3).toFixed(2)}s"></i>`).join('')}</div>
      <p class="big-icon">${unit.icon}</p>
      <p class="fin-ch">第 ${i + 1} 章完成</p>
      <h2>「${unit.title}」完成了！</h2>
      <p class="unit-stars big">${'★'.repeat(got)}<span class="dim">${'★'.repeat(total - got)}</span></p>
      <p>${got === total ? '全部的任務都完成了，太厲害了！' : '還有星星沒拿到，可以回去再玩一次喔。'}</p>
      ${stageRead(stage) ? `<p class="fin-stage">🏅 第 ${stageNo(stage)} 站「${stage.title}」全部看完了！</p>` : ''}
      ${next ? `
      <div class="fin-next" style="--c:${next.color}">
        ${next.part !== unit.part ? `<p class="fin-part">🎉「${PARTS.find(p => p.id === unit.part).title}」全部完成！接下來是「${PARTS.find(p => p.id === next.part).title}」</p>` : ''}
        <small>${nextSt !== stage ? `下一站．第 ${stageNo(nextSt)} 站「${nextSt.title}」` : '下一章'}</small>
        <b>第 ${i + 2} 章．${next.icon} ${next.title}</b>
        <span>${next.desc}</span>
      </div>` : `<p class="fin-part">🏆 這是最後一章，全部 ${UNITS.length} 章都看完了！</p>`}
      <div class="finish-btns">
        <a class="nav-btn" href="#/">回單元列表</a>
        ${next ? `<a class="nav-btn next glow" href="#/u/${next.id}/0">開始第 ${i + 2} 章 ▶</a>` : ''}
      </div>
    </main>`;
  sfx.star();
}

// ---------- routing: #/  #/u/<unit>/<slide>  #/done/<unit> ----------

function route() {
  closeIndex(); // e.g. the browser's back button while the panel is open
  const [, kind, id, n] = location.hash.split('/');
  const unit = UNITS.find(u => u.id === id);
  if (kind === 'u' && unit) {
    const i = Math.min(Math.max(parseInt(n, 10) || 0, 0), unit.slides.length - 1);
    lesson(unit, i);
  } else if (kind === 'done' && unit) {
    finished(unit);
  } else {
    home();
  }
  window.scrollTo(0, 0);
}

// ---------- keyboard: switch slides with the usual presentation keys ----------
// ← → PageUp PageDown Space Shift+Space Home End. Only on slides without a task:
// on a task slide the keys belong to the task (typing, the robot's arrows, sliders).

let onFinish = null; // the unit whose finish screen is showing
const keyboardLikely = matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('keydown', e => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t.closest?.('input, textarea, select, [contenteditable="true"]')) return;
  if (e.key === ' ' && t.closest?.('button, [role="button"], summary')) return; // Space presses a focused button
  if (document.getElementById('book-index')?.hidden === false) return;
  if (app.querySelector('.tip-veil')) {
    if (e.key === 'Escape') app.querySelector('.tip-veil').remove();
    return;
  }
  const fwd = e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
  const back = e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
  if (!fwd && !back && e.key !== 'Home' && e.key !== 'End') return;
  let to = null;
  if (onFinish) {
    const next = UNITS[UNITS.indexOf(onFinish) + 1];
    if (fwd && next) to = `#/u/${next.id}/0`;
    if (back) to = `#/u/${onFinish.id}/${onFinish.slides.length - 1}`;
  } else if (here && !here.unit.slides[here.index].widget) {
    const { unit, index } = here;
    const n = unit.slides.length;
    if (fwd) to = index + 1 < n ? `#/u/${unit.id}/${index + 1}` : `#/done/${unit.id}`;
    else if (back) to = index > 0 ? `#/u/${unit.id}/${index - 1}` : null;
    else if (e.key === 'Home') to = `#/u/${unit.id}/0`;
    else to = `#/u/${unit.id}/${n - 1}`;
  }
  if (!to) return;
  e.preventDefault();
  location.hash = to;
});

window.addEventListener('hashchange', route);
synth?.getVoices(); // Safari loads the voice list lazily
route();
