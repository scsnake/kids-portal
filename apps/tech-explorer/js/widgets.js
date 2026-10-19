// Interactions, one per slide. Each widget is `(host, params, api) => void`:
//   host   the element to draw into (emptied before each slide)
//   api    { good(), bad(), done(), later(fn, ms), alive() }
// done() marks the slide as finished (it earns a star). later() is setTimeout that is
// cancelled when the slide changes; alive() is false once the slide has gone.

const h = html => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

function shuffle(list, notSame = false) {
  const a = list.slice();
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (notSame && a.length > 1 && a.every((x, i) => x === list[i]));
  return a;
}

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // restart the animation
  el.classList.add('shake');
}

function pop(el) {
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// Drag with a finger, pen or mouse. Drop targets are any element with data-zone.
// A press that does not move counts as a tap.
function drag(el, { onDrop, onTap }) {
  el.addEventListener('pointerdown', e => {
    if (el.classList.contains('placed') || el.disabled || e.button > 0) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY, id = e.pointerId;
    let moved = false, over = null;
    const zoneAt = (x, y) => {
      el.style.visibility = 'hidden';
      const t = document.elementFromPoint(x, y);
      el.style.visibility = '';
      return t && t.closest('[data-zone]');
    };
    const move = ev => {
      if (ev.pointerId !== id) return;
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 8) return;
      if (!moved) { moved = true; el.classList.add('dragging'); }
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
      const z = zoneAt(ev.clientX, ev.clientY);
      if (z !== over) {
        over?.classList.remove('over');
        z?.classList.add('over');
        over = z;
      }
    };
    const up = ev => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      over?.classList.remove('over');
      el.classList.remove('dragging');
      el.style.transform = '';
      if (!moved) { onTap?.(); return; }
      if (ev.type !== 'pointercancel') onDrop(zoneAt(ev.clientX, ev.clientY));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}

// A grid of cells you paint by tapping or by sliding a finger across.
// The first cell touched decides whether this stroke paints or erases.
function paintable(grid, onChange) {
  let mode = null;
  const cellAt = (x, y) => {
    const t = document.elementFromPoint(x, y);
    return t && t.classList.contains('px') && grid.contains(t) ? t : null;
  };
  const apply = cell => {
    if (!cell || cell.classList.contains('on') === mode) return;
    cell.classList.toggle('on', mode);
    onChange();
  };
  grid.addEventListener('pointerdown', e => {
    const cell = cellAt(e.clientX, e.clientY);
    if (!cell || grid.classList.contains('locked')) return;
    e.preventDefault();
    mode = !cell.classList.contains('on');
    apply(cell);
  });
  window.addEventListener('pointermove', e => { if (mode !== null) apply(cellAt(e.clientX, e.clientY)); });
  window.addEventListener('pointerup', () => { mode = null; });
}

const en = x => (x ? `<small class="en" lang="en">${x}</small>` : '');

const gridHTML = (rows, cols, cls = '') =>
  `<div class="pxgrid ${cls}" style="--cols:${cols}">${'<i class="px"></i>'.repeat(rows * cols)}</div>`;

// Position of `el`'s center relative to `box`, in pixels.
function centerIn(el, box) {
  const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
  return { x: a.left + a.width / 2 - b.left, y: a.top + a.height / 2 - b.top };
}

// Fly a small token from one element to another inside `box`.
function fly(box, text, from, to, ms = 550) {
  const tok = h(`<span class="token">${text}</span>`);
  box.append(tok);
  const p = centerIn(from, box), q = centerIn(to, box);
  return tok.animate(
    [
      { transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(.6)` },
      { transform: `translate(${(p.x + q.x) / 2}px, ${Math.min(p.y, q.y) - 30}px) translate(-50%, -50%) scale(1)`, offset: 0.5 },
      { transform: `translate(${q.x}px, ${q.y}px) translate(-50%, -50%) scale(.8)` },
    ],
    { duration: ms, easing: 'ease-in-out' }
  ).finished.then(() => tok.remove(), () => tok.remove());
}

// A task checklist: check(id, note) ticks one task; done() fires once every required task is ticked.
// A task with `na: '<reason>'` is something this device cannot do: it stays listed so the
// child still learns it, but it is greyed out, never ticked and never required.
function checklist(ul, tasks, api) {
  ul.innerHTML = tasks.map(t => `
    <li data-task="${t.id}" class="${t.na ? 'na' : t.optional ? 'optional' : ''}">
      <span class="tick">${t.na ? '🚫' : ''}</span>
      <span>${t.zh}${en(t.en)}<small class="alt">${t.na || t.alt || ''}</small></span>
    </li>`).join('');
  const got = new Set();
  // force: the device turned out to support it after all (a trackpad pinch), so count it
  return (id, note, force) => {
    const task = tasks.find(t => t.id === id);
    if (got.has(id) || (task?.na && !force)) return;
    if (task?.na) {
      task.na = '';
      const row = ul.querySelector(`[data-task="${id}"]`);
      row.classList.remove('na');
      row.querySelector('.tick').textContent = '';
    }
    got.add(id);
    const li = ul.querySelector(`[data-task="${id}"]`);
    li.classList.add('done');
    if (note) li.querySelector('.alt').textContent = note;
    pop(li);
    api.good();
    if (tasks.every(t => t.optional || t.na || got.has(t.id))) api.done();
  };
}

// A short message that fades out by itself.
function toaster(el, api) {
  let timer = null;
  return (msg, ms = 2000) => {
    el.textContent = msg;
    el.hidden = false;
    pop(el);
    clearTimeout(timer);
    timer = setTimeout(() => { if (api.alive()) el.hidden = true; }, ms);
  };
}

const byWhat = { mouse: '用滑鼠完成 🖱️', touch: '用手指完成 👆', pen: '用觸控筆完成 ✏️' };

// A home or network router: a box with lights and two antennas (📡 read as a satellite dish).
const ROUTER = '<svg class="router-ico" viewBox="0 0 48 40" aria-hidden="true"><path d="M14 17 10 4M34 17l4-13" stroke="#495057" stroke-width="3" stroke-linecap="round"/><rect x="4" y="16" width="40" height="18" rx="5" fill="#4dabf7" stroke="#1c7ed6" stroke-width="2"/><circle cx="12" cy="25" r="2.2" fill="#b2f2bb"/><circle cx="19" cy="25" r="2.2" fill="#b2f2bb"/><circle cx="26" cy="25" r="2.2" fill="#ffe066"/><rect x="32" y="23" width="7" height="4" rx="1" fill="#1864ab"/></svg>';

// Drawn icons: an Ethernet plug (not a power plug), Wi-Fi waves, a cell tower and a satellite.
const WAY_ICONS = {
  cable: `<svg class="way-svg" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 35v11" stroke="#1971c2" stroke-width="6" stroke-linecap="round"/>
    <path d="M17 29h14l-2 7h-10z" fill="#1971c2"/>
    <rect x="12" y="5" width="24" height="25" rx="3" fill="#e7f5ff" stroke="#1d2738" stroke-width="2.5"/>
    <path d="M16.5 7v7M19.5 7v7M22.5 7v7M25.5 7v7M28.5 7v7M31.5 7v7" stroke="#f08c00" stroke-width="1.8"/>
    <path d="M18 30v-9h12v9" fill="none" stroke="#1d2738" stroke-width="2.2"/></svg>`,
  wifi: `<svg class="way-svg" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#1d2738" stroke-width="4.5" stroke-linecap="round">
    <path d="M5 19a27 27 0 0 1 38 0"/><path d="M11.5 26a18 18 0 0 1 25 0"/><path d="M18 33a9 9 0 0 1 12 0"/>
    <circle cx="24" cy="39.5" r="3.4" fill="#1d2738" stroke="none"/></svg>`,
  cell: `<svg class="way-svg" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#1d2738" stroke-width="4" stroke-linecap="round">
    <circle cx="24" cy="19" r="5.5" fill="#1d2738" stroke="none"/><path d="M24 24v20"/>
    <path d="M15.5 10.5a12 12 0 0 0 0 17M32.5 10.5a12 12 0 0 1 0 17"/><path d="M9 5a21 21 0 0 0 0 28M39 5a21 21 0 0 1 0 28"/></svg>`,
  sat: `<svg class="way-svg" viewBox="0 0 48 48" aria-hidden="true" stroke="#1d2738" stroke-width="2.5" stroke-linejoin="round">
    <g transform="rotate(-35 24 24)">
      <rect x="2" y="18" width="13" height="12" rx="1.5" fill="#4dabf7"/><rect x="33" y="18" width="13" height="12" rx="1.5" fill="#4dabf7"/>
      <path d="M8.5 18v12M39.5 18v12" stroke-width="1.5"/><path d="M15 24h3M30 24h3"/>
      <rect x="18" y="17" width="12" height="14" rx="2" fill="#ced4da"/>
    </g>
    <path d="M30 34a8 8 0 0 0 8 8M27 37a13 13 0 0 0 13 6" fill="none" stroke-linecap="round"/></svg>`,
};

// The drawn "AI picture" for spotfake: a bakery, a girl waving, a cat and a tree.
// Its flaws: six fingers, a garbled sign, two tails, a shadow toward the sun.
const SPOT_SKIN = '#f1c9a5';
const spotFingers = (cx, cy) => [-172, -142, -112, -82, -52, -22].map(a => {
  const r = a * Math.PI / 180;
  return `<path d="M${cx} ${cy} l${(Math.cos(r) * 27).toFixed(1)} ${(Math.sin(r) * 27).toFixed(1)}"/>`;
}).join('');
const SPOT_SCENE = `
  <defs>
    <linearGradient id="sp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5d8ff"/><stop offset="1" stop-color="#e7f5ff"/></linearGradient>
    <clipPath id="sp-clip"><rect width="480" height="360" rx="18"/></clipPath>
  </defs>
  <g clip-path="url(#sp-clip)">
    <rect width="480" height="360" fill="url(#sp-sky)"/>
    <g stroke="#fab005" stroke-width="4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = a * Math.PI / 180;
      return `<path d="M${(52 + Math.cos(r) * 31).toFixed(1)} ${(52 + Math.sin(r) * 31).toFixed(1)} L${(52 + Math.cos(r) * 41).toFixed(1)} ${(52 + Math.sin(r) * 41).toFixed(1)}"/>`;
    }).join('')}</g>
    <circle cx="52" cy="52" r="24" fill="#ffd43b"/>
    <rect y="280" width="480" height="80" fill="#dee2e6"/>
    <path d="M0 280 H480" stroke="#adb5bd" stroke-width="3"/>

    <rect x="30" y="100" width="200" height="180" fill="#fff4e6" stroke="#d9480f" stroke-width="3"/>
    <rect x="48" y="112" width="164" height="50" rx="8" fill="#fff" stroke="#862e9c" stroke-width="3"/>
    <g fill="#862e9c" font-size="32" font-weight="900" text-anchor="middle">
      <text x="82" y="149">麵</text>
      <text transform="translate(130 149) scale(-1 1)">包</text>
    </g>
    <path d="M166 124 q10 7 1 13 t4 15 M181 124 h18 M190 124 v18 q-1 9 -11 8" stroke="#862e9c" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M24 170 H236 L226 192 H34 Z" fill="#fa5252"/>
    <path d="M64 170 l-4 22 M106 170 l-2 22 M148 170 v22 M190 170 l2 22" stroke="#fff" stroke-width="10"/>
    <rect x="48" y="204" width="70" height="56" rx="6" fill="#d0ebff" stroke="#d9480f" stroke-width="3"/>
    <text x="83" y="242" font-size="28" text-anchor="middle">🥐</text>
    <rect x="150" y="204" width="58" height="76" rx="6" fill="#e8590c"/>
    <circle cx="160" cy="244" r="3" fill="#ffd43b"/>

    <path d="M201 272 q24 -4 19 -32 M169 272 q-24 -4 -19 -32" stroke="#495057" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="185" cy="266" rx="17" ry="14" fill="#495057"/>
    <circle cx="185" cy="244" r="11" fill="#495057"/>
    <path d="M176 238 l2 -12 l7 8 Z M194 238 l-2 -12 l-7 8 Z" fill="#495057"/>
    <circle cx="181" cy="243" r="2" fill="#ffd43b"/><circle cx="189" cy="243" r="2" fill="#ffd43b"/>

    <ellipse cx="258" cy="285" rx="42" ry="7" fill="rgba(0,0,0,.22)"/>
    <rect x="291" y="238" width="7" height="42" fill="${SPOT_SKIN}"/>
    <rect x="303" y="238" width="7" height="42" fill="${SPOT_SKIN}"/>
    <path d="M300 186 L276 246 H324 Z" fill="#4dabf7"/>
    <path d="M291 196 l-15 34 M310 196 l38 -54" stroke="${SPOT_SKIN}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="300" cy="168" r="20" fill="${SPOT_SKIN}"/>
    <path d="M280 168 a20 20 0 0 1 40 0 q-8 -9 -20 -9 q-12 0 -20 9 Z" fill="#5c3d2e"/>
    <path d="M319 160 q12 4 8 22" stroke="#5c3d2e" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="293" cy="170" r="2.2" fill="#1d2738"/><circle cx="307" cy="170" r="2.2" fill="#1d2738"/>
    <path d="M294 178 q6 5 12 0" stroke="#1d2738" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g stroke="${SPOT_SKIN}" stroke-width="7" stroke-linecap="round">${spotFingers(352, 134)}</g>
    <circle cx="352" cy="134" r="13" fill="${SPOT_SKIN}"/>

    <ellipse cx="450" cy="286" rx="30" ry="7" fill="rgba(0,0,0,.22)"/>
    <rect x="412" y="218" width="16" height="64" fill="#8d6e63"/>
    <circle cx="398" cy="214" r="22" fill="#40c057"/><circle cx="442" cy="214" r="22" fill="#40c057"/>
    <circle cx="420" cy="196" r="32" fill="#51cf66"/>
  </g>`;

export const WIDGETS = {
  // Drag (or tap, then tap a box) each chip into the right box. With `rest`, the last
  // leftovers that can only go in that box move there by themselves. `intro` is shown on top.
  sort(host, { bins, items, rest, intro }, api) {
    host.innerHTML = `
      <div class="w-sort">
        ${intro ? `<div class="sort-intro">${intro}</div>` : ''}
        <div class="tray"></div>
        <div class="bins" style="--n:${bins.length}"></div>
        <p class="hint">拖到框框裡，或先點一下，再點框框</p>
      </div>`;
    const tray = host.querySelector('.tray');
    const binsEl = host.querySelector('.bins');
    for (const b of bins) {
      binsEl.append(h(`
        <div class="bin" data-zone="${b.id}" role="button" tabindex="0">
          <div class="bin-head"><span class="bin-icon">${b.icon}</span><span>${b.label}${en(b.en)}</span></div>
          <div class="bin-items"></div>
        </div>`));
    }
    let left = items.length, selected = null;
    // rest: once every chip that belongs elsewhere is placed, the ones left over can only go
    // in this bin, so move them there by themselves.
    const sweep = () => {
      const chips = [...tray.querySelectorAll('.chip:not(.placed)')];
      if (!rest || !chips.length || chips.some(c => c.bin !== rest)) return;
      const zone = binsEl.querySelector(`[data-zone="${rest}"]`);
      host.querySelector('.hint').textContent = `都找到了！剩下的自動放進「${bins.find(b => b.id === rest).label}」`;
      if (selected) select(selected);
      chips.forEach((chip, k) => api.later(() => {
        const from = chip.getBoundingClientRect();
        chip.classList.add('placed');
        zone.querySelector('.bin-items').append(chip);
        const to = chip.getBoundingClientRect();
        chip.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` }, { transform: 'none' }], { duration: 450, easing: 'ease-in-out' });
        if (--left === 0) { pop(zone); api.done(); }
      }, 500 + k * 250));
    };
    const select = chip => {
      selected?.classList.remove('selected');
      selected = chip === selected ? null : chip;
      selected?.classList.add('selected');
    };
    for (const it of shuffle(items, true)) {
      const chip = h(`<button class="chip"><span class="chip-icon">${it.icon}</span><span>${it.label}${en(it.en)}</span></button>`);
      chip.bin = it.bin;
      chip.place = zone => {
        if (!zone) return;
        if (zone.dataset.zone === it.bin) {
          if (selected === chip) select(chip);
          chip.classList.add('placed');
          zone.querySelector('.bin-items').append(chip);
          pop(zone);
          api.good();
          if (--left === 0) api.done();
          else sweep();
        } else {
          api.bad();
          shake(chip);
        }
      };
      drag(chip, { onDrop: chip.place, onTap: () => select(chip) });
      tray.append(chip);
    }
    binsEl.addEventListener('click', e => {
      const zone = e.target.closest('[data-zone]');
      if (zone && selected && !e.target.closest('.chip')) selected.place(zone);
    });
  },

  // Pick the one right answer; wrong answers grey out.
  choice(host, { question, options, explain }, api) {
    host.innerHTML = `
      <div class="w-choice">
        <p class="question">${question}</p>
        <div class="options"></div>
        <p class="explain" hidden>💡 ${explain}</p>
      </div>`;
    const box = host.querySelector('.options');
    let solved = false;
    for (const o of shuffle(options)) {
      const btn = h(`<button class="option">${o.text}</button>`);
      btn.onclick = () => {
        if (solved) return;
        if (o.correct) {
          solved = true;
          btn.classList.add('right');
          host.querySelector('.explain').hidden = false;
          api.good();
          api.done();
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          shake(btn);
          api.bad();
        }
      };
      box.append(btn);
    }
  },

  // Numbered slots 1..N: tap the cards in order (each fills the next slot), or drag a card
  // onto its number. A card only goes into the slot it belongs to.
  order(host, { items }, api) {
    host.innerHTML = `
      <div class="w-order">
        <ol class="seq">${items.map((_, i) => `<li class="ord-slot" data-zone="${i}"><span class="ord-hole">第 ${i + 1} 步</span></li>`).join('')}</ol>
        <p class="ord-hint">依順序點卡片，或把卡片拖到對的號碼</p>
        <div class="pool"></div>
      </div>`;
    const slots = [...host.querySelectorAll('.ord-slot')];
    const hint = host.querySelector('.ord-hint');
    const filled = new Set();
    const place = (card, i) => {
      card.classList.add('placed');
      slots[i].replaceChildren(card);
      slots[i].classList.add('ord-done');
      filled.add(i);
      pop(card);
      api.good();
      if (filled.size === items.length) {
        hint.textContent = '🎉 順序都對了！';
        api.done();
      }
    };
    const wrong = (card, i, slot) => {
      shake(card);
      if (slot) shake(slot);
      hint.textContent = `這張不是第 ${i + 1} 步喔，再想想`;
      api.bad();
    };
    for (const it of shuffle(items, true)) {
      const idx = items.indexOf(it);
      const card = h(`<button class="chip"><span class="chip-icon">${it.icon}</span><span>${it.label}${en(it.en)}</span></button>`);
      drag(card, {
        onTap: () => {
          const i = items.findIndex((_, k) => !filled.has(k));
          if (idx === i) place(card, i);
          else wrong(card, i);
        },
        onDrop: zone => {
          if (!zone) return;
          const i = +zone.dataset.zone;
          if (filled.has(i)) return;
          if (idx === i) place(card, i);
          else wrong(card, i, zone);
        },
      });
      host.querySelector('.pool').append(card);
    }
  },

  // Light bulbs worth 8, 4, 2, 1 add up to the target number.
  binary(host, { bits, targets }, api) {
    host.innerHTML = `
      <div class="w-binary">
        <p class="target"></p>
        <div class="bulbs"></div>
        <p class="sum"></p>
      </div>`;
    const bulbsEl = host.querySelector('.bulbs');
    const on = bits.map(() => false);
    let round = 0, busy = false;
    const bulbs = bits.map((v, i) => {
      const b = h(`
        <button class="bulb" aria-pressed="false">
          <span class="bit">0</span><span class="bico">💡</span><span class="val">${v}</span>
        </button>`);
      b.onclick = () => {
        if (busy || round >= targets.length) return;
        on[i] = !on[i];
        draw();
        check();
      };
      bulbsEl.append(b);
      return b;
    });
    const sum = () => bits.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
    const draw = () => {
      bulbs.forEach((b, i) => {
        b.classList.toggle('on', on[i]);
        b.setAttribute('aria-pressed', on[i]);
        b.querySelector('.bit').textContent = on[i] ? '1' : '0';
      });
      const parts = bits.filter((_, i) => on[i]);
      host.querySelector('.sum').innerHTML =
        `<span class="code">${on.map(x => (x ? 1 : 0)).join('')}</span> = ${parts.length ? parts.join(' + ') + ' = ' : ''}<b>${sum()}</b>`;
      host.querySelector('.target').innerHTML = round < targets.length
        ? `湊出 <b class="big">${targets[round]}</b><span class="rdots">${targets.map((_, i) => `<i class="${i < round ? 'ok' : ''}"></i>`).join('')}</span>`
        : '🎉 全部湊出來了！';
    };
    const check = () => {
      if (sum() !== targets[round]) return;
      api.good();
      busy = true;
      pop(host.querySelector('.sum'));
      api.later(() => {
        round++;
        busy = false;
        if (round < targets.length) on.fill(false);
        else api.done();
        draw();
      }, 900);
    };
    draw();
  },

  // Type letters and see each one stored as one byte (8 bits), a Chinese character as 3
  // bytes; then flip 8 bits to make the letter A.
  bytes(host, _, api) {
    const tasks = [
      { id: 'type', zh: '打 3 個字', en: 'bytes', alt: '每個英文字母存成 1 個位元組' },
      { id: 'han', zh: '打一個中文字', en: 'Chinese', alt: '看看它要幾個位元組' },
      { id: 'make', zh: '撥 8 個開關，做出字母 A', en: 'bits', alt: '01000001' },
    ];
    const keys = ['A', 'B', 'C', 'H', 'I', '1', '!', '貓'];
    const bin = n => n.toString(2).padStart(8, '0');
    const bytesOf = ch => [...new TextEncoder().encode(ch)];
    host.innerHTML = `
      <div class="w-lab">
        <div class="by-box">
          <p class="by-h">① 打字：每個字都變成 0 和 1 存起來</p>
          <div class="by-keys">${keys.map(k => `<button class="option" data-k="${k}">${k}</button>`).join('')}<button class="option" data-k="del" aria-label="刪掉一個字">⌫</button></div>
          <div class="by-strip"><span class="by-empty">點上面的字</span></div>
          <p class="by-count"></p>
          <p class="by-h">② 自己做一個位元組：讓它變成字母 <b>A</b></p>
          <div class="by-sw">${[128, 64, 32, 16, 8, 4, 2, 1].map((v, i) => `<button class="by-bit" data-i="${i}" aria-label="第 ${i + 1} 個位元"><b>0</b><small>${v}</small></button>`).join('')}</div>
          <p class="by-read"></p>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = s => host.querySelector(s);
    const check = checklist($('.tasks'), tasks, api);
    const typed = [];
    const drawStrip = () => {
      const strip = $('.by-strip');
      strip.innerHTML = typed.length ? typed.map(ch => `
        <div class="by-char"><b>${ch}</b>${bytesOf(ch).map(n => `<span class="by-byte">${bin(n).slice(0, 4)} ${bin(n).slice(4)}</span>`).join('')}
          <small>${bytesOf(ch).length} 個位元組</small></div>`).join('') : '<span class="by-empty">點上面的字</span>';
      const nB = typed.reduce((s, ch) => s + bytesOf(ch).length, 0);
      $('.by-count').innerHTML = typed.length
        ? `${typed.length} 個字 → <b>${nB}</b> 個位元組（B）→ <b>${nB * 8}</b> 個位元（b）`
        : '1 個位元組 = 8 個位元';
      strip.scrollLeft = strip.scrollWidth;
    };
    host.querySelector('.by-keys').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      if (b.dataset.k === 'del') { typed.pop(); drawStrip(); return; }
      if (typed.length >= 6) typed.shift();
      typed.push(b.dataset.k);
      drawStrip();
      pop($('.by-strip').lastElementChild);
      if (b.dataset.k === '貓') check('han', '「貓」要 3 個位元組，比英文字母多');
      if (typed.filter(ch => ch !== '貓').length >= 3) check('type');
    });
    const bits = Array(8).fill(0);
    const drawBits = () => {
      const n = bits.reduce((s, v) => s * 2 + v, 0);
      host.querySelectorAll('.by-bit').forEach((b, i) => {
        b.classList.toggle('on', !!bits[i]);
        b.querySelector('b').textContent = bits[i];
      });
      const ch = n >= 33 && n <= 126 ? String.fromCharCode(n) : '';
      $('.by-read').innerHTML = `${bits.join('')} → 數字 ${n} → ${ch ? `字母「<b>${ch}</b>」` : '（這個數字沒有對應的字）'}`;
      if (n === 65) {
        $('.by-read').innerHTML += ' 🎉';
        check('make', '8 個位元 01000001 就是 A');
      }
    };
    host.querySelector('.by-sw').addEventListener('click', e => {
      const b = e.target.closest('.by-bit');
      if (!b) return;
      bits[+b.dataset.i] ^= 1;
      drawBits();
    });
    drawStrip();
    drawBits();
  },

  // Copy a small picture by painting cells.
  pixels(host, { pattern, color }, api) {
    const rows = pattern.length, cols = pattern[0].length;
    host.innerHTML = `
      <div class="w-pixels" style="--px:${color}">
        <figure><figcaption>照著畫</figcaption>${gridHTML(rows, cols, 'model')}</figure>
        <figure><figcaption>你的螢幕</figcaption>${gridHTML(rows, cols, 'canvas')}</figure>
        <p class="hint">點一下塗色，再點一下擦掉，也可以用手指滑過去</p>
      </div>`;
    const want = pattern.join('').split('').map(c => c === '1');
    host.querySelectorAll('.model .px').forEach((c, i) => c.classList.toggle('on', want[i]));
    const canvas = host.querySelector('.canvas');
    const cells = [...canvas.querySelectorAll('.px')];
    let solved = false;
    paintable(canvas, () => {
      if (solved || !cells.every((c, i) => c.classList.contains('on') === want[i])) return;
      solved = true;
      canvas.classList.add('locked');
      host.querySelector('.hint').textContent = '🎉 一模一樣！螢幕上的圖就是這樣拼出來的。';
      pop(canvas);
      api.good();
      api.done();
    });
  },

  // Three lights mix into colors: make each target color.
  rgb(host, { targets }, api) {
    const names = ['紅', '綠', '藍'];
    const rgbOf = on => `rgb(${on.map(x => (x ? 255 : 0)).join(',')})`;
    host.innerHTML = `
      <div class="w-rgb">
        <div class="mix" aria-hidden="true"><i class="r"></i><i class="g"></i><i class="b"></i></div>
        <div class="side">
          <p class="target"></p>
          <div class="lamps">${names.map((n, i) => `<button class="lamp lamp-${i}" aria-pressed="false">${n}</button>`).join('')}</div>
          <p class="result"></p>
        </div>
      </div>`;
    const on = [0, 0, 0];
    const lamps = [...host.querySelectorAll('.lamp')];
    const circles = [...host.querySelectorAll('.mix i')];
    let round = 0, busy = false;
    const draw = () => {
      lamps.forEach((l, i) => { l.classList.toggle('on', !!on[i]); l.setAttribute('aria-pressed', !!on[i]); });
      circles.forEach((c, i) => c.classList.toggle('on', !!on[i]));
      host.querySelector('.result').innerHTML =
        `混出來：<span class="swatch" style="background:${rgbOf(on)}"></span>${on.some(Boolean) ? '' : '（全關是黑色）'}`;
      const t = targets[round];
      host.querySelector('.target').innerHTML = t
        ? `請混出 <span class="swatch" style="background:${rgbOf(t.on)}"></span><b>${t.name}</b>`
        : '🎉 你是調色高手！';
    };
    lamps.forEach((l, i) => {
      l.onclick = () => {
        if (busy || round >= targets.length) return;
        on[i] = on[i] ? 0 : 1;
        draw();
        if (on.every((x, k) => x === targets[round].on[k])) {
          api.good();
          busy = true;
          api.later(() => {
            busy = false;
            if (++round >= targets.length) api.done();
            draw();
          }, 900);
        }
      };
    });
    draw();
  },

  // Press a key: it travels to the brain, then to the screen.
  keys(host, { keys, goal, showCode }, api) {
    host.innerHTML = `
      <div class="w-keys">
        <div class="kb" aria-label="鍵盤">${keys.map(k => `<button class="key">${k}</button>`).join('')}</div>
        <div class="stage-lbl kb-lbl">輸入 ${en('input')}</div>
        <div class="cpu"><span>🧠</span><small>處理 ${en('process')}</small></div>
        <div class="screen"><span class="typed"></span><span class="caret"></span></div>
        <div class="stage-lbl screen-lbl">輸出 ${en('output')}</div>
        <p class="caption">按一個鍵試試看</p>
      </div>`;
    const box = host.querySelector('.w-keys');
    const cpu = host.querySelector('.cpu');
    const screen = host.querySelector('.screen');
    const typed = host.querySelector('.typed');
    let count = 0;
    host.querySelectorAll('.key').forEach(btn => {
      btn.onclick = async () => {
        const k = btn.textContent;
        const code = k.charCodeAt(0);
        const token = showCode ? code : k;
        pop(btn);
        host.querySelector('.caption').innerHTML = showCode
          ? `<b>${k}</b> 的號碼是 <b>${code}</b>`
          : `輸入 <b>${k}</b> → 處理 → 輸出 <b>${k}</b>`;
        await fly(box, token, btn, cpu);
        if (!api.alive()) return;
        pop(cpu);
        await fly(box, token, cpu, screen);
        if (!api.alive()) return;
        typed.textContent = (typed.textContent + k).slice(-12);
        api.good();
        if (++count === goal) api.done();
      };
    });
  },

  // Move a mouse on the desk; the arrow on the screen moves by the same amount.
  mouse(host, { stars }, api) {
    host.innerHTML = `
      <div class="w-mouse">
        <div class="screen"><span class="star">⭐</span><svg class="cursor" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z"/></svg></div>
        <p class="readout">在下面的桌面上拖動滑鼠</p>
        <div class="desk"><span class="mouse">🖱️</span></div>
      </div>`;
    const screen = host.querySelector('.screen');
    const desk = host.querySelector('.desk');
    const cursor = host.querySelector('.cursor');
    const star = host.querySelector('.star');
    const mouseEl = host.querySelector('.mouse');
    const readout = host.querySelector('.readout');
    let cx = 0.5, cy = 0.5, mx = 0.5, my = 0.5, sx = 0, sy = 0, got = 0, last = null;
    const placeStar = () => {
      do { sx = 0.1 + Math.random() * 0.8; sy = 0.12 + Math.random() * 0.76; } while (Math.hypot(sx - cx, sy - cy) < 0.3);
      star.style.left = sx * 100 + '%';
      star.style.top = sy * 100 + '%';
    };
    const draw = () => {
      cursor.style.left = cx * 100 + '%';
      cursor.style.top = cy * 100 + '%';
      mouseEl.style.left = mx * 100 + '%';
      mouseEl.style.top = my * 100 + '%';
    };
    const clamp = v => Math.min(1, Math.max(0, v));
    desk.addEventListener('pointerdown', e => {
      if (got >= stars) return;
      e.preventDefault();
      desk.setPointerCapture(e.pointerId);
      last = { x: e.clientX, y: e.clientY };
    });
    desk.addEventListener('pointermove', e => {
      if (!last) return;
      const d = desk.getBoundingClientRect(), s = screen.getBoundingClientRect();
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      mx = clamp(mx + dx / d.width);
      my = clamp(my + dy / d.height);
      // The arrow moves 1.5x as far as the mouse, like a real pointer speed setting.
      cx = clamp(cx + (dx * 1.5) / s.width);
      cy = clamp(cy + (dy * 1.5) / s.height);
      draw();
      const h = Math.round(dx), v = Math.round(dy);
      if (h || v) readout.textContent = `${h >= 0 ? '往右' : '往左'} ${Math.abs(h)}、${v >= 0 ? '往下' : '往上'} ${Math.abs(v)}`;
      const dist = Math.hypot((cx - sx) * s.width, (cy - sy) * s.height);
      if (dist < 26) {
        got++;
        api.good();
        pop(star);
        if (got >= stars) {
          star.textContent = '🎉';
          readout.textContent = `抓到 ${stars} 顆星星了！`;
          last = null;
          api.done();
        } else placeStar();
      }
    });
    const end = () => { last = null; };
    desk.addEventListener('pointerup', end);
    desk.addEventListener('pointercancel', end);
    placeStar();
    draw();
  },

  // Tap the cat: the wires under the tap light up and give its row and column.
  touch(host, { rows, cols, rounds }, api) {
    const hl = Array.from({ length: rows }, (_, i) => `<i class="hline" style="top:${((i + 0.5) / rows) * 100}%"></i>`).join('');
    const vl = Array.from({ length: cols }, (_, j) => `<i class="vline" style="left:${((j + 0.5) / cols) * 100}%"></i>`).join('');
    host.innerHTML = `
      <div class="w-touch">
        <div class="pad">${hl}${vl}<span class="cat">🐱</span><span class="dot"></span></div>
        <p class="readout">用手指點小貓</p>
      </div>`;
    const pad = host.querySelector('.pad');
    const cat = host.querySelector('.cat');
    const dot = host.querySelector('.dot');
    const hlines = [...host.querySelectorAll('.hline')];
    const vlines = [...host.querySelectorAll('.vline')];
    let tr = 0, tc = 0, got = 0, busy = false;
    const at = (r, c) => ({ top: ((r + 0.5) / rows) * 100 + '%', left: ((c + 0.5) / cols) * 100 + '%' });
    const placeCat = () => {
      const [r0, c0] = [tr, tc];
      do { tr = Math.floor(Math.random() * rows); tc = Math.floor(Math.random() * cols); } while (tr === r0 && tc === c0);
      Object.assign(cat.style, at(tr, tc));
    };
    pad.addEventListener('pointerdown', e => {
      if (got >= rounds || busy) return;
      // measure inside the bezel (the border), where the lines and the cat are placed
      const b = pad.getBoundingClientRect();
      const fx = (e.clientX - b.left - pad.clientLeft) / pad.clientWidth;
      const fy = (e.clientY - b.top - pad.clientTop) / pad.clientHeight;
      const r = Math.min(rows - 1, Math.max(0, Math.floor(fy * rows)));
      const c = Math.min(cols - 1, Math.max(0, Math.floor(fx * cols)));
      hlines.forEach((l, i) => l.classList.toggle('lit', i === r));
      vlines.forEach((l, j) => l.classList.toggle('lit', j === c));
      Object.assign(dot.style, at(r, c));
      dot.classList.add('show');
      const where = `第 ${r + 1} 條橫線 × 第 ${c + 1} 條直線`;
      if (r === tr && c === tc) {
        got++;
        api.good();
        pop(cat);
        host.querySelector('.readout').innerHTML = `${where}：點到了！${got >= rounds ? ' 🎉' : ''}`;
        if (got >= rounds) api.done();
        else { busy = true; api.later(() => { busy = false; placeCat(); }, 600); }
      } else {
        host.querySelector('.readout').textContent = `${where}，小貓不在這裡`;
      }
    });
    placeCat();
  },

  // Guided steps: draw, save, draw again, power off, power on.
  power(host, _, api) {
    const steps = [
      '① 按「畫圖」，在書桌上畫一張圖',
      '② 按「存檔」，把圖收進書櫃',
      '③ 再畫一張，這次<b>不要</b>存檔',
      '④ 按「關機」',
      '⑤ 按「開機」，看看還剩什麼？',
    ];
    host.innerHTML = `
      <div class="w-power">
        <p class="step"></p>
        <div class="pc">
          <div class="area ram"><div class="area-lbl">🗒️ 書桌：記憶體 ${en('RAM')}</div><div class="things"></div></div>
          <div class="area shelf"><div class="area-lbl">📚 書櫃：硬碟 ${en('hard drive')}</div><div class="things"></div></div>
          <div class="off-veil">💤</div>
        </div>
        <div class="controls">
          <button data-act="draw">🎨 畫圖</button>
          <button data-act="save">💾 存檔</button>
          <button data-act="power">⏻ 關機</button>
        </div>
      </div>`;
    const pics = ['🐱', '🚀', '🌈', '🌻', '🦖'];
    const desk = host.querySelector('.ram .things');
    const shelf = host.querySelector('.shelf .things');
    const pc = host.querySelector('.pc');
    const btns = Object.fromEntries([...host.querySelectorAll('[data-act]')].map(b => [b.dataset.act, b]));
    let step = 0;
    const want = ['draw', 'save', 'draw', 'power', 'power'];
    const draw = () => {
      host.querySelector('.step').innerHTML = steps[step] ?? '🎉 書櫃的圖還在，書桌上沒存檔的圖不見了！';
      for (const [k, b] of Object.entries(btns)) {
        b.disabled = step >= steps.length || want[step] !== k;
        b.classList.toggle('glow', !b.disabled);
      }
      btns.power.textContent = step === 4 ? '⏻ 開機' : '⏻ 關機';
    };
    host.querySelector('.controls').addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const act = b.dataset.act;
      if (act === 'draw') {
        const pic = h(`<span class="thing">${pics[step === 0 ? 0 : 1 + Math.floor(Math.random() * 4)]}</span>`);
        desk.append(pic);
        pop(pic);
      } else if (act === 'save') {
        for (const t of desk.children) shelf.append(t.cloneNode(true));
        pop(shelf.parentElement);
      } else if (step === 3) {
        pc.classList.add('off');
        desk.querySelectorAll('.thing').forEach(t => t.classList.add('vanish'));
      } else {
        pc.classList.remove('off');
        desk.replaceChildren();
        pop(shelf.parentElement);
        api.done();
      }
      api.good();
      step++;
      draw();
    });
    draw();
  },

  // Upload a photo to the cloud, lose phone A, download it on tablet B.
  cloud(host, _, api) {
    host.innerHTML = `
      <div class="w-cloud">
        <p class="step">① 把照片拖到雲端上傳 ${en('upload')}</p>
        <div class="sky" data-zone="cloud"><span class="cloud-icon">☁️</span><span class="cloud-lbl">遠方的伺服器 ${en('server')}</span><div class="things"></div></div>
        <div class="phones">
          <div class="device a"><div class="dev-lbl">手機 A</div><div class="dev-screen"><button class="chip photo"><span class="chip-icon">🐶</span></button></div></div>
          <div class="device b"><div class="dev-lbl">新平板 B</div><div class="dev-screen"></div><button class="dl" disabled>⬇️ 下載 ${en('download')}</button></div>
        </div>
      </div>`;
    const photo = host.querySelector('.photo');
    const sky = host.querySelector('.sky');
    const box = host.querySelector('.w-cloud');
    const dl = host.querySelector('.dl');
    const stepEl = host.querySelector('.step');
    const upload = async zone => {
      if (zone !== sky) { if (zone) shake(photo); return; }
      photo.classList.add('placed');
      await fly(box, '🐶', photo, sky);
      if (!api.alive()) return;
      sky.querySelector('.things').append(h('<span class="thing">🐶</span>'));
      pop(sky);
      api.good();
      stepEl.textContent = '上傳好了！';
      api.later(() => {
        host.querySelector('.device.a').classList.add('broken');
        stepEl.innerHTML = '② 糟糕！手機 A 掉進水裡壞掉了 💦<br>用新平板 B，按「下載」';
        dl.disabled = false;
        dl.classList.add('glow');
      }, 1000);
    };
    drag(photo, { onDrop: upload, onTap: () => upload(sky) });
    dl.onclick = async () => {
      dl.disabled = true;
      dl.classList.remove('glow');
      const target = host.querySelector('.device.b .dev-screen');
      await fly(box, '🐶', sky, target);
      if (!api.alive()) return;
      target.append(h('<span class="thing">🐶</span>'));
      pop(target);
      stepEl.textContent = '🎉 照片回來了！放在雲端，換一台裝置也拿得到。';
      api.good();
      api.done();
    };
  },

  // Send a message as numbered packets on different roads, then put them back in order.
  packets(host, { parts }, api) {
    const nodes = { S: [40, 110], A: [190, 40], B: [190, 180], C: [300, 110], D: [410, 40], E: [410, 180], R: [560, 110] };
    const edges = ['SA', 'SB', 'AC', 'BC', 'CD', 'CE', 'AD', 'BE', 'DR', 'ER'];
    const routes = ['SADR', 'SBCDR', 'SACER', 'SBER'];
    const pct = ([x, y]) => ({ left: (x / 600) * 100 + '%', top: (y / 220) * 100 + '%' });
    host.innerHTML = `
      <div class="w-packets">
        <p class="msg">要傳的訊息：<b>${parts.join('')}</b></p>
        <div class="net">
          <svg viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true">
            ${edges.map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}"/>`).join('')}
          </svg>
          ${Object.entries(nodes).map(([k, p]) => {
            const s = pct(p);
            const icon = k === 'S' ? '📱' : k === 'R' ? '💻' : ROUTER;
            return `<span class="node${k === 'S' || k === 'R' ? ' end' : ''}" style="left:${s.left};top:${s.top}">${icon}</span>`;
          }).join('')}
        </div>
        <button class="go glow">📨 送出</button>
        <div class="arrived" hidden><p>收到的封包（亂掉了）：照號碼點 1 → ${parts.length}，或拖到對的格子</p><div class="pool"></div></div>
        <div class="pk-rebuild" hidden><p>排好的訊息：</p>
          <ol class="pk-slots">${parts.map((_, i) => `<li class="pk-slot" data-zone="${i}"><i>${i + 1}</i><span>？</span></li>`).join('')}</ol>
          <p class="pk-done" hidden></p></div>
      </div>`;
    const net = host.querySelector('.net');
    const go = host.querySelector('.go');
    go.onclick = () => {
      go.disabled = true;
      go.classList.remove('glow');
      // Arrival order: any shuffle except 1, 2, 3, …
      const arrival = shuffle(parts.map((_, i) => i), true);
      const pool = host.querySelector('.pool');
      let landed = 0;
      parts.forEach((txt, i) => {
        const pk = h(`<span class="packet"><i>${i + 1}</i>${txt}</span>`);
        net.append(pk);
        const path = routes[i % routes.length].split('').map(k => pct(nodes[k]));
        const anim = pk.animate(path, { duration: 1400 + arrival.indexOf(i) * 500, easing: 'linear', fill: 'forwards' });
        anim.finished.then(() => {
          if (!api.alive()) return;
          pk.remove();
          const card = h(`<button class="chip packet-card"><i>${i + 1}</i>${txt}</button>`);
          card.dataset.n = i;
          pool.append(card);
          host.querySelector('.arrived').hidden = false;
          host.querySelector('.pk-rebuild').hidden = false;
          if (++landed === parts.length) ready();
        }, () => {});
      });
    };
    // Numbered slots: tap the packets 1 → N (each fills the next slot) or drag one onto its number.
    const ready = () => {
      const slots = [...host.querySelectorAll('.pk-slot')];
      const filled = new Set();
      const put = (card, i) => {
        card.classList.add('placed');
        slots[i].classList.add('pk-in');
        slots[i].querySelector('span').textContent = parts[i];
        filled.add(i);
        pop(slots[i]);
        api.good();
        if (filled.size === parts.length) {
          const done = host.querySelector('.pk-done');
          done.textContent = `✅ ${parts.join('')}`;
          done.hidden = false;
          api.done();
        }
      };
      const wrong = (card, slot) => { shake(card); if (slot) shake(slot); api.bad(); };
      host.querySelectorAll('.packet-card').forEach(card => {
        const n = +card.dataset.n;
        drag(card, {
          onTap: () => {
            const i = parts.findIndex((_, k) => !filled.has(k));
            if (n === i) put(card, i);
            else wrong(card);
          },
          onDrop: zone => {
            if (!zone) return;
            const i = +zone.dataset.zone;
            if (filled.has(i)) return;
            if (n === i) put(card, i);
            else wrong(card, zone);
          },
        });
      });
    };
  },

  // A network of six routers: you are each router in turn. Read the packet's address, check
  // this router's table, and tap the next stop. Three packets to three addresses.
  routing(host, _, api) {
    // Positions on a 640 × 300 board.
    const nodes = {
      S: { x: 46, y: 150, icon: '📱', ip: '10.0.1.5' },
      R1: { x: 150, y: 150 }, R2: { x: 270, y: 70 }, R3: { x: 270, y: 230 },
      R4: { x: 400, y: 50 }, R5: { x: 400, y: 150 }, R6: { x: 400, y: 250 },
      D2: { x: 560, y: 50, icon: '💻', ip: '10.0.2.8' },
      D3: { x: 560, y: 150, icon: '🖨️', ip: '10.0.3.4' },
      D4: { x: 560, y: 250, icon: '🎮', ip: '10.0.4.6' },
    };
    const links = ['S-R1', 'R1-R2', 'R1-R3', 'R2-R4', 'R2-R5', 'R3-R5', 'R3-R6', 'R4-R5', 'R5-R6', 'R4-D2', 'R5-D3', 'R6-D4'];
    // Each router's table: the third number of the address → the next stop.
    const tables = {
      R1: { 2: 'R2', 3: 'R3', 4: 'R3' },
      R2: { 2: 'R4', 3: 'R5', 4: 'R5' },
      R3: { 2: 'R5', 3: 'R5', 4: 'R6' },
      R4: { 2: 'D2', 3: 'R5', 4: 'R5' },
      R5: { 2: 'R4', 3: 'D3', 4: 'R6' },
      R6: { 2: 'R5', 3: 'R5', 4: 'D4' },
    };
    const trips = ['D3', 'D4', 'D2'];
    const pct = n => `left:${(n.x / 640) * 100}%;top:${(n.y / 300) * 100}%`;
    const name = k => (k[0] === 'D' ? `${nodes[k].icon} ${nodes[k].ip}` : k);
    host.innerHTML = `
      <div class="w-route">
        <p class="rt-pkt"></p>
        <div class="rt-net">
          <svg viewBox="0 0 640 300" aria-hidden="true">${links.map(l => {
            const [a, b] = l.split('-').map(k => nodes[k]);
            return `<line data-l="${l}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
          }).join('')}</svg>
          ${Object.entries(nodes).map(([k, n]) => `
            <button class="rt-node${k[0] === 'R' ? ' rt-router' : ' rt-dev'}" data-k="${k}" style="${pct(n)}" aria-label="${k[0] === 'R' ? '路由器 ' + k : n.ip}">
              ${n.icon || ROUTER}<small>${k[0] === 'R' ? k : n.ip}</small></button>`).join('')}
          <span class="rt-box" aria-hidden="true">📦</span>
        </div>
        <div class="rt-table"></div>
        <p class="rt-msg"></p>
      </div>`;
    const $ = s => host.querySelector(s);
    const box = $('.rt-box');
    let trip = 0, at = 'R1', busy = false;
    const third = k => +nodes[k].ip.split('.')[2];
    const neighbors = k => links.map(l => l.split('-')).filter(p => p.includes(k)).map(p => (p[0] === k ? p[1] : p[0]));
    const moveBox = (k, ms = 0) => {
      const n = nodes[k];
      const to = { left: (n.x / 640) * 100 + '%', top: (n.y / 300) * 100 + '%' };
      if (!ms) { Object.assign(box.style, to); return Promise.resolve(); }
      const from = { left: box.style.left, top: box.style.top };
      return box.animate([from, to], { duration: ms, easing: 'ease-in-out' }).finished.then(() => Object.assign(box.style, to));
    };
    const lineOf = (a, b) => host.querySelector(`[data-l="${a}-${b}"], [data-l="${b}-${a}"]`);
    function drawTable() {
      const dest = trips[trip], d = third(dest);
      const t = tables[at];
      $('.rt-table').innerHTML = `<b>${at} 的路線表</b>` + [2, 3, 4].map(n =>
        `<span class="${n === d ? 'rt-hit' : ''}">10.0.<u>${n}</u>.x → ${name(t[n])}</span>`).join('');
      host.querySelectorAll('.rt-node').forEach(b => {
        b.classList.toggle('rt-here', b.dataset.k === at);
        b.classList.toggle('rt-can', neighbors(at).includes(b.dataset.k) && b.dataset.k !== 'S');
      });
    }
    function start() {
      const dest = trips[trip], ip = nodes[dest].ip.split('.');
      $('.rt-pkt').innerHTML = `📦 第 ${trip + 1} 個封包，收件地址：${ip.slice(0, 2).join('.')}.<mark>${ip[2]}</mark>.${ip[3]}`;
      host.querySelectorAll('.rt-net line').forEach(l => l.classList.remove('rt-used'));
      moveBox('S');
      busy = true;
      lineOf('S', 'R1').classList.add('rt-used');
      moveBox('R1', 500).then(() => {
        if (!api.alive()) return;
        at = 'R1';
        busy = false;
        drawTable();
        $('.rt-msg').textContent = `你是 ${at}：看地址的第三段，再點下一站`;
      });
    }
    host.querySelector('.rt-net').addEventListener('click', e => {
      const b = e.target.closest('.rt-node');
      if (!b || busy || !at.startsWith('R')) return;
      const k = b.dataset.k, want = tables[at][third(trips[trip])];
      if (!neighbors(at).includes(k) || k === 'S') return;
      if (k !== want) {
        shake(b);
        api.bad();
        pop($('.rt-hit'));
        $('.rt-msg').textContent = `${at} 的路線表說：第三段是 ${third(trips[trip])}，要往 ${name(want)}`;
        return;
      }
      busy = true;
      lineOf(at, k).classList.add('rt-used');
      moveBox(k, 500).then(() => {
        if (!api.alive()) return;
        busy = false;
        if (k[0] === 'D') {
          at = k;
          api.good();
          host.querySelectorAll('.rt-node').forEach(x => x.classList.remove('rt-here', 'rt-can'));
          pop(b);
          if (++trip === trips.length) {
            $('.rt-table').innerHTML = '';
            $('.rt-msg').textContent = '🎉 三個封包都送到了！每台路由器只要知道「下一站」，一站一站就能送到。';
            api.done();
          } else {
            $('.rt-msg').textContent = `✅ 送到 ${name(k)} 了！`;
            api.later(start, 1200);
          }
          return;
        }
        at = k;
        drawTable();
        $('.rt-msg').textContent = `到 ${at} 了：再看它的路線表`;
      });
    });
    start();
  },

  // 4 cooks paint 4 cells at a time; 64 helpers paint every cell at once, but each is slower.
  race(host, _, api) {
    const pic = [
      '..yyyy..',
      '.yyyyyy.',
      'yykyykyy',
      'yyyyyyyy',
      'ykyyyyky',
      'yykkkkyy',
      '.yyyyyy.',
      '..yyyy..',
    ].join('');
    const colors = { '.': '#a5d8ff', y: '#ffd43b', k: '#343a40' };
    const panel = (cls, who, sub) => `
      <figure class="lane ${cls}">
        <figcaption><b>${who}</b><small>${sub}</small></figcaption>
        ${gridHTML(8, 8)}
        <p class="time">0.0 秒</p>
      </figure>`;
    host.innerHTML = `
      <div class="w-race">
        <div class="lanes">
          ${panel('cpu', '👨‍🍳 CPU', '4 位大廚，每人很快')}
          ${panel('gpu', '🐜 GPU', '64 個小幫手，每人比較慢')}
        </div>
        <button class="go glow">🏁 開始比賽</button>
        <p class="result"></p>
      </div>`;
    const go = host.querySelector('.go');
    const lane = cls => ({
      cells: [...host.querySelectorAll(`.${cls} .px`)],
      time: host.querySelector(`.${cls} .time`),
    });
    const cpu = lane('cpu'), gpu = lane('gpu');
    const reset = l => l.cells.forEach(c => (c.style.background = ''));
    const paint = (l, from, to) => l.cells.slice(from, to).forEach((c, k) => (c.style.background = colors[pic[from + k]]));
    go.onclick = () => {
      go.disabled = true;
      go.classList.remove('glow');
      reset(cpu); reset(gpu);
      host.querySelector('.result').textContent = '';
      const t0 = performance.now();
      let cpuDone = false, gpuDone = false, filled = 0;
      const finish = () => {
        if (!cpuDone || !gpuDone) return;
        host.querySelector('.result').innerHTML = '🐜 <b>GPU 先完成！</b>每個小幫手比較慢，可是 64 個人<b>同時</b>一起塗。';
        go.disabled = false;
        go.textContent = '🔁 再比一次';
        api.good();
        api.done();
      };
      const tickCpu = () => {
        if (!api.alive()) return;
        paint(cpu, filled, filled + 4);
        filled += 4;
        cpu.time.textContent = ((performance.now() - t0) / 1000).toFixed(1) + ' 秒';
        if (filled < 64) api.later(tickCpu, 150);
        else { cpuDone = true; finish(); }
      };
      api.later(tickCpu, 150);
      api.later(() => {
        paint(gpu, 0, 64);
        gpu.time.textContent = ((performance.now() - t0) / 1000).toFixed(1) + ' 秒';
        pop(host.querySelector('.gpu .pxgrid'));
        gpuDone = true;
        finish();
      }, 500);
    };
  },

  // Draw a picture, then print it with an inkjet head (dot by dot, row by row) or a laser
  // printer (laser charges the drum, toner sticks, paper rolls, heat fuses, whole page at once).
  printer(host, { size }, api) {
    host.innerHTML = `
      <div class="w-printer">
        <figure><figcaption>① 畫一張圖</figcaption>${gridHTML(size, size, 'canvas')}</figure>
        <div class="mid"><button class="go" data-kind="ink">🖨️ 噴墨列印</button><button class="go" data-kind="laser">⚡ 雷射列印</button></div>
        <figure><figcaption>② 印出來的紙</figcaption><div class="paper">${gridHTML(size, size, 'out')}<span class="head"></span><span class="lz-beam"></span><span class="lz-heat"></span></div></figure>
        <p class="hint">點格子畫圖，再選一種印表機列印</p>
      </div>`;
    const canvas = host.querySelector('.canvas');
    const src = [...canvas.querySelectorAll('.px')];
    const out = [...host.querySelectorAll('.out .px')];
    const paper = host.querySelector('.paper');
    const head = host.querySelector('.head'), beam = host.querySelector('.lz-beam'), heat = host.querySelector('.lz-heat');
    const btns = [...host.querySelectorAll('[data-kind]')];
    const hint = host.querySelector('.hint');
    const used = new Set();
    paintable(canvas, () => btns.forEach(b => b.classList.toggle('glow', src.some(c => c.classList.contains('on')) && !used.has(b.dataset.kind))));
    const finish = (kind, msg) => {
      btns.forEach(b => { b.disabled = false; });
      canvas.classList.remove('locked');
      used.add(kind);
      const other = kind === 'ink' ? '雷射' : '噴墨';
      hint.textContent = msg + (used.size < 2 ? ` 再用${other}印表機印印看！` : '');
      btns.forEach(b => b.classList.toggle('glow', !used.has(b.dataset.kind)));
      api.good();
      if (used.size === 2) api.done();
    };
    // Inkjet: the head runs row by row and sprays a dot where the picture has one.
    const inkjet = () => {
      head.classList.add('show');
      hint.textContent = '噴墨：噴頭一行一行來回跑，在要上色的地方噴墨點…';
      let i = 0;
      const step = () => {
        if (!api.alive()) return;
        const r = Math.floor(i / size);
        // Every other row runs right to left, like a real print head.
        const c = r % 2 ? size - 1 - (i % size) : i % size;
        const k = r * size + c;
        head.style.top = ((r + 0.5) / size) * 100 + '%';
        head.style.left = ((c + 0.5) / size) * 100 + '%';
        if (src[k].classList.contains('on')) out[k].classList.add('on');
        if (++i < size * size) { api.later(step, 55); return; }
        head.classList.remove('show');
        finish('ink', '🎉 印好了！真正的印表機一吋要噴好幾百個點，所以看起來很平滑。');
      };
      step();
    };
    // Laser: four quick stages, and the whole page comes out at once.
    const laser = () => {
      const marks = src.map(c => c.classList.contains('on'));
      hint.textContent = '雷射 ①：雷射光掃過滾筒，畫出看不見的「靜電圖」';
      beam.classList.add('show');
      let r = 0;
      const scan = () => {
        if (!api.alive()) return;
        beam.style.top = ((r + 0.5) / size) * 100 + '%';
        for (let c = 0; c < size; c++) if (marks[r * size + c]) out[r * size + c].classList.add('lz-charge');
        if (++r < size) { api.later(scan, 120); return; }
        beam.classList.remove('show');
        api.later(() => {
          hint.textContent = '雷射 ②：碳粉被靜電吸住，黏在圖案的地方';
          out.forEach(c => { if (c.classList.contains('lz-charge')) c.classList.replace('lz-charge', 'lz-toner'); });
          api.later(() => {
            hint.textContent = '雷射 ③：紙從滾筒下面滾過去，碳粉印到紙上';
            paper.animate([{ transform: 'translateY(30px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'ease-out' });
            api.later(() => {
              hint.textContent = '雷射 ④：加熱，把碳粉燙在紙上，就不會掉了';
              heat.classList.add('show');
              api.later(() => {
                heat.classList.remove('show');
                out.forEach(c => { if (c.classList.contains('lz-toner')) { c.classList.remove('lz-toner'); c.classList.add('on'); } });
                finish('laser', '🎉 雷射印表機一次印一整頁，又快又清楚，學校和辦公室常用。');
              }, 900);
            }, 900);
          }, 900);
        }, 300);
      };
      scan();
    };
    btns.forEach(b => {
      b.onclick = () => {
        if (!src.some(c => c.classList.contains('on'))) {
          hint.textContent = '先畫一點東西吧！';
          shake(canvas);
          return;
        }
        btns.forEach(x => { x.disabled = true; x.classList.remove('glow'); });
        canvas.classList.add('locked');
        out.forEach(c => c.classList.remove('on', 'lz-charge', 'lz-toner'));
        (b.dataset.kind === 'ink' ? inkjet : laser)();
      };
    });
  },

  // For each person, pick the way to get online: cable, Wi-Fi or cellular.
  connect(host, { rounds }, api) {
    const ways = {
      cable: { icon: WAY_ICONS.cable, zh: '網路線', en: 'cable', no: '這裡沒有網路線可以插喔' },
      wifi: { icon: WAY_ICONS.wifi, zh: 'Wi-Fi', en: 'wireless', no: '這裡沒有 Wi-Fi 喔' },
      cell: { icon: WAY_ICONS.cell, zh: '行動網路', en: 'cellular', no: '有更方便、更穩定的方法喔' },
      sat: { icon: WAY_ICONS.sat, zh: '衛星網路', en: 'satellite', no: '衛星網路比較貴，有別的方法時先用別的' },
    };
    host.innerHTML = `
      <div class="w-connect">
        <div class="scene">
          <span class="who"></span>
          <span class="link" aria-hidden="true"></span>
          <span class="globe">🌐</span>
        </div>
        <p class="where"></p>
        <p class="status"></p>
        <div class="ways">${Object.entries(ways).map(([k, w]) =>
          `<button class="way" data-way="${k}"><span class="chip-icon">${w.icon}</span><span>${w.zh}${en(w.en)}</span></button>`).join('')}</div>
      </div>`;
    const scene = host.querySelector('.scene');
    const status = host.querySelector('.status');
    let round = 0, busy = false;
    const draw = () => {
      const r = rounds[round];
      scene.className = 'scene';
      if (!r) {
        host.querySelector('.who').textContent = '🎉';
        host.querySelector('.where').textContent = '大家都上線了！';
        status.textContent = '';
        return;
      }
      host.querySelector('.who').textContent = r.who;
      host.querySelector('.where').textContent = r.scene;
      status.innerHTML = `<span class="pill off">離線 offline</span> 要用哪一種方法連上網路？`;
      host.querySelectorAll('.way').forEach(b => { b.disabled = false; b.classList.remove('wrong', 'right'); });
    };
    host.querySelector('.ways').addEventListener('click', e => {
      const b = e.target.closest('.way');
      if (!b || b.disabled || busy || round >= rounds.length) return;
      const k = b.dataset.way;
      const r = rounds[round];
      if (k !== r.want) {
        b.classList.add('wrong');
        b.disabled = true;
        shake(b);
        status.innerHTML = `<span class="pill off">離線 offline</span> ${r.no?.[k] || ways[k].no}`;
        api.bad();
        return;
      }
      busy = true;
      b.classList.add('right');
      scene.classList.add('online', 'via-' + k);
      status.innerHTML = `<span class="pill on">上線 online</span> 用${ways[k].zh}連上了！`;
      api.good();
      api.later(() => {
        busy = false;
        if (++round >= rounds.length) api.done();
        draw();
      }, 1400);
    });
    draw();
  },

  // A playground where each object answers one mouse action; a finger works too.
  mouselab(host, _, api) {
    const canHover = matchMedia('(hover: hover)').matches;
    const tasks = [
      { id: 'click', zh: '按一下', en: 'click', alt: '手指：點一下' },
      { id: 'dbl', zh: '按兩下', en: 'double-click', alt: '手指：很快點兩下' },
      { id: 'right', zh: '右鍵', en: 'right-click', alt: '手指：長按' },
      { id: 'wheel', zh: '滾輪捲動', en: 'scroll', alt: '手指：往上滑' },
      { id: 'drag', zh: '拖曳', en: 'drag', alt: '手指：按住再移動' },
      { id: 'hover', zh: '移過去不按', en: 'hover', alt: '把游標停在東西上，會跳出名字', na: canHover ? '' : '手指碰到螢幕就算「按」，沒辦法只移過去。用滑鼠或觸控板才做得到。' },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="playground">
          <div class="cell"><button class="obj gift" data-tip="禮物">🎁</button><p>按一下打開</p></div>
          <div class="cell"><button class="obj folder" data-tip="資料夾">📁</button><p>按兩下打開</p></div>
          <div class="cell"><button class="obj cat" data-tip="小貓">🐱</button><p>右鍵／長按</p>
            <div class="ctx" hidden><button>🍖 餵食</button><button>✋ 摸摸</button></div></div>
          <div class="cell"><div class="obj scroller" data-tip="捲動區"><div>${'🌊<br>'.repeat(7)}💎</div></div><p>捲到最下面</p></div>
          <div class="cell wide"><span class="obj apple" data-tip="蘋果">🍎</span><span class="arrow">→</span><span class="obj basket" data-zone="basket" data-tip="籃子">🧺</span><p>把蘋果拖進籃子</p></div>
          <span class="coords">x 0, y 0</span>
          <span class="tip" hidden></span>
          <div class="toast" hidden></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const pg = host.querySelector('.playground');
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const toast = toaster($('.toast'), api);
    let how = 'mouse';
    pg.addEventListener('pointerdown', e => { how = e.pointerType || 'mouse'; }, true);
    const done = id => check(id, byWhat[how]);

    // x, y of the pointer: the computer keeps the pointer's place as two numbers
    pg.addEventListener('pointermove', e => {
      const b = pg.getBoundingClientRect();
      $('.coords').textContent = `x ${Math.round(e.clientX - b.left)}, y ${Math.round(e.clientY - b.top)}`;
    });

    $('.gift').addEventListener('click', e => {
      e.currentTarget.textContent = e.currentTarget.textContent === '🎁' ? '🎉' : '🎁';
      done('click');
    });

    // Our own double-click timing, so a double tap on iPad counts too.
    let lastFolder = 0;
    const folder = $('.folder');
    folder.addEventListener('click', () => {
      const now = performance.now();
      if (now - lastFolder < 450) {
        lastFolder = 0;
        folder.textContent = folder.textContent === '📂' ? '📁' : '📂';
        done('dbl');
        return;
      }
      lastFolder = now;
      api.later(() => { if (lastFolder === now) toast('資料夾要「很快連按兩下」才會打開'); }, 470);
    });

    const cat = $('.cat'), ctx = $('.ctx');
    const openMenu = () => { ctx.hidden = false; done('right'); };
    cat.addEventListener('contextmenu', e => { e.preventDefault(); openMenu(); });
    let press = null;
    cat.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      const x = e.clientX, y = e.clientY;
      press = { x, y, timer: setTimeout(() => { press = null; if (api.alive()) openMenu(); }, 550) };
    });
    cat.addEventListener('pointermove', e => {
      if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(press.timer); press = null; }
    });
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) {
      cat.addEventListener(t, () => { if (press) { clearTimeout(press.timer); press = null; } });
    }
    cat.addEventListener('click', () => { if (ctx.hidden) toast('小貓要按右鍵，或用手指長按'); });
    ctx.addEventListener('click', e => {
      if (!e.target.closest('button')) return;
      cat.textContent = '😻';
      ctx.hidden = true;
    });
    pg.addEventListener('pointerdown', e => {
      if (!ctx.hidden && !e.target.closest('.ctx') && !e.target.closest('.cat')) ctx.hidden = true;
    });
    pg.addEventListener('contextmenu', e => {
      if (e.target.closest('.cat')) return;
      e.preventDefault();
      toast('右鍵要按在小貓身上喔');
    });
    pg.addEventListener('mousedown', e => { if (e.button === 1) e.preventDefault(); });
    pg.addEventListener('auxclick', e => { if (e.button === 1) toast('這是中鍵：把滾輪按下去！'); });

    const scroller = $('.scroller');
    let wheelSeen = false;
    scroller.addEventListener('wheel', () => { wheelSeen = true; }, { passive: true });
    scroller.addEventListener('scroll', () => {
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
        check('wheel', wheelSeen ? '用滾輪或觸控板完成 🖱️' : byWhat[how]);
      }
    });

    const apple = $('.apple'), basket = $('.basket');
    drag(apple, {
      onDrop: zone => {
        if (zone !== basket) return;
        apple.classList.add('placed');
        basket.classList.add('full');
        done('drag');
      },
      onTap: () => toast('要按住不放，再移到籃子上'),
    });

    const tip = $('.tip');
    pg.querySelectorAll('[data-tip]').forEach(o => {
      o.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        const b = pg.getBoundingClientRect(), r = o.getBoundingClientRect();
        tip.textContent = o.dataset.tip;
        tip.style.left = r.left - b.left + r.width / 2 + 'px';
        tip.style.top = r.top - b.top + 'px';
        tip.hidden = false;
        check('hover', '用滑鼠完成 🖱️');
      });
      o.addEventListener('pointerleave', () => { tip.hidden = true; });
    });
  },

  // A photo that answers taps, swipes and two-finger gestures.
  touchlab(host, _, api) {
    const hasTouch = navigator.maxTouchPoints > 0;
    const noTouch = hasTouch ? '' : '這台裝置沒有觸控螢幕，看說明就好（有觸控板的話可以試試）：兩根手指放在螢幕上';
    const tasks = [
      { id: 'tap', zh: '點一下', en: 'tap', alt: '顯示說明' },
      { id: 'dbl', zh: '點兩下', en: 'double-tap', alt: '放大或縮回' },
      { id: 'long', zh: '長按', en: 'long press', alt: '跳出選單' },
      { id: 'swipe', zh: '左右滑動', en: 'swipe', alt: '換下一張' },
      { id: 'pinch', zh: '兩指縮放', en: 'pinch', alt: '兩根手指張開、捏起', na: noTouch && noTouch + '張開、捏起。' },
      { id: 'rotate', zh: '兩指旋轉', en: 'rotate', alt: '兩根手指一起轉', na: noTouch && noTouch + '一起轉。' },
      { id: 'pan', zh: '放大後拖移', en: 'pan', alt: '一根手指移動照片' },
    ];
    const photos = [['🦁', '獅子'], ['🐼', '貓熊'], ['🐧', '企鵝'], ['🦒', '長頸鹿']];
    host.innerHTML = `
      <div class="w-lab">
        <div class="frame">
          <div class="pic"><span class="corner tl">🌿</span><span class="corner br">🌼</span><span class="beast"></span></div>
          <p class="photo-cap" hidden></p>
          <div class="menu" hidden><button>💾 儲存</button><button>📤 分享</button><button>📋 拷貝</button></div>
          <span class="count"></span>
          <div class="toast" hidden></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const frame = $('.frame'), photo = $('.pic'), menu = $('.menu'), caption = $('.photo-cap');
    const check = checklist($('.tasks'), tasks, api);
    const toast = toaster($('.toast'), api);
    let idx = 0, sc = 1, rot = 0, tx = 0, ty = 0;
    const apply = (settle = false) => {
      photo.classList.toggle('settle', settle);
      photo.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`;
    };
    const show = () => {
      $('.beast').textContent = photos[idx][0];
      caption.textContent = `${photos[idx][0]} ${photos[idx][1]}：第 ${idx + 1} 張，共 ${photos.length} 張`;
      $('.count').textContent = `${idx + 1} / ${photos.length}`;
    };
    const reset = () => { sc = 1; rot = 0; tx = 0; ty = 0; };
    const next = d => {
      idx = (idx + d + photos.length) % photos.length;
      reset();
      apply();
      show();
      photo.animate([{ translate: `${d * 60}% 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 250, easing: 'ease-out' });
    };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const angle = (a, b) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

    const pts = new Map();
    let one = null, g = null, longT = null, tapT = null, lastTap = 0;
    frame.addEventListener('pointerdown', e => {
      if (e.target.closest('.menu')) return;
      e.preventDefault();
      frame.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!menu.hidden) menu.hidden = true;
      if (pts.size === 1) {
        one = { x0: e.clientX, y0: e.clientY, t0: performance.now(), lx: e.clientX, ly: e.clientY, moved: false, multi: false, long: false, panned: 0 };
        longT = setTimeout(() => {
          if (!api.alive() || !one || one.moved || one.multi) return;
          one.long = true;
          menu.hidden = false;
          check('long');
        }, 550);
      } else if (pts.size === 2) {
        clearTimeout(longT);
        if (one) one.multi = true;
        const [a, b] = [...pts.values()];
        g = { d: dist(a, b), ang: angle(a, b), sc, rot };
      }
    });
    frame.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size >= 2 && g) {
        const [a, b] = [...pts.values()];
        const k = dist(a, b) / g.d;
        let turn = angle(a, b) - g.ang;
        if (turn > 180) turn -= 360;
        if (turn < -180) turn += 360;
        sc = Math.min(4, Math.max(0.6, g.sc * k));
        rot = g.rot + turn;
        apply();
        if (Math.abs(k - 1) > 0.2) check('pinch');
        if (Math.abs(turn) > 25) check('rotate');
        return;
      }
      if (!one || one.multi) return;
      const dx = e.clientX - one.lx, dy = e.clientY - one.ly;
      one.lx = e.clientX;
      one.ly = e.clientY;
      if (Math.hypot(e.clientX - one.x0, e.clientY - one.y0) > 10) { one.moved = true; clearTimeout(longT); }
      if (!one.moved || one.long) return;
      if (sc > 1.1) {
        tx += dx;
        ty += dy;
        one.panned += Math.hypot(dx, dy);
        if (one.panned > 40) check('pan');
        apply();
      } else {
        photo.style.transform = `translate(${e.clientX - one.x0}px, 0) rotate(${rot}deg) scale(${sc})`;
      }
    });
    const up = e => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      clearTimeout(longT);
      if (pts.size < 2) g = null;
      if (pts.size === 1 && one) {
        const [r] = [...pts.values()];
        one.lx = r.x;
        one.ly = r.y;
      }
      if (pts.size > 0 || !one) return;
      const s = one;
      one = null;
      if (s.multi || s.long) { apply(true); return; }
      const dt = performance.now() - s.t0, dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      if (!s.moved && dt < 350) {
        const now = performance.now();
        if (now - lastTap < 320) {
          clearTimeout(tapT);
          lastTap = 0;
          if (sc > 1.1) { reset(); } else { sc = 2.2; tx = 0; ty = 0; }
          apply(true);
          check('dbl');
        } else {
          lastTap = now;
          tapT = setTimeout(() => {
            if (!api.alive()) return;
            caption.hidden = !caption.hidden;
            check('tap');
          }, 320);
        }
      } else if (sc <= 1.1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        next(dx < 0 ? 1 : -1);
        check('swipe');
      } else {
        apply(true);
      }
    };
    frame.addEventListener('pointerup', up);
    frame.addEventListener('pointercancel', up);

    // Mac trackpad: a pinch arrives as ctrl + wheel, and Safari also sends gesture events.
    frame.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      sc = Math.min(4, Math.max(0.6, sc * Math.exp(-e.deltaY / 100)));
      apply();
      if (Math.abs(sc - 1) > 0.2) check('pinch', '用觸控板做到了', true);
    }, { passive: false });
    let gs = null;
    frame.addEventListener('gesturestart', e => { e.preventDefault(); gs = { sc, rot }; });
    frame.addEventListener('gesturechange', e => {
      e.preventDefault();
      if (!gs || pts.size) return; // on iPad the pointer events above already handle it
      sc = Math.min(4, Math.max(0.6, gs.sc * e.scale));
      rot = gs.rot + e.rotation;
      apply();
      if (Math.abs(e.scale - 1) > 0.2) check('pinch', '用觸控板做到了', true);
      if (Math.abs(e.rotation) > 25) check('rotate', '用觸控板做到了', true);
    });
    menu.addEventListener('click', e => {
      if (!e.target.closest('button')) return;
      menu.hidden = true;
      toast('這是練習，不會真的儲存或分享');
    });
    show();
  },

  // iPad system gestures on a drawn iPad with room around it, so a swipe can start outside the
  // screen edge. Each gesture: a demo with moving finger dots, then the child tries it once.
  sysgesture(host, _, api) {
    const many = navigator.maxTouchPoints >= 3;
    // Finger paths are [x0, y0, x1, y1] in screen units: 0..1 is on the screen,
    // below 0 or above 1 is the frame or the space around the iPad.
    const steps = [
      { id: 'undo', zh: '三根手指往左滑', en: 'three-finger swipe', alt: '↩️ 復原上一步', scene: 'app',
        fingers: [[0.42, 0.42, 0.14, 0.42], [0.54, 0.36, 0.26, 0.36], [0.66, 0.42, 0.38, 0.42]],
        tip: '三根手指一起放在畫面上，一起往左滑',
        na: many ? '' : '這台裝置不能三根手指一起滑，看示範就好' },
      { id: 'switcher', zh: '從最下面往上滑，停一下', en: 'App Switcher', alt: '🗂️ 看到開著的 App', scene: 'app',
        fingers: [[0.5, 1.16, 0.5, 0.56]], hold: 800,
        tip: '從 iPad 下面的外面開始往上滑，滑到一半停住不動' },
      { id: 'home', zh: '從最下面往上滑', en: 'Home Screen', alt: '🏠 回到主畫面', scene: 'app',
        fingers: [[0.5, 1.16, 0.5, 0.42]],
        tip: '從 iPad 下面的外面開始，一口氣往上滑，不要停' },
      { id: 'search', zh: '在主畫面中間往下滑', en: 'Search', alt: '🔍 打開搜尋', scene: 'home',
        fingers: [[0.5, 0.34, 0.5, 0.72]],
        tip: '在主畫面的中間按住，往下滑' },
      { id: 'nc', zh: '從最上面左邊往下滑', en: 'Notification Center', alt: '🔔 看通知', scene: 'home',
        fingers: [[0.2, -0.16, 0.2, 0.6]],
        tip: '從 iPad 上面的外面、靠左邊開始往下滑' },
      { id: 'cc', zh: '從右上角往下滑', en: 'Control Center', alt: '🎛️ 打開控制中心', scene: 'home',
        fingers: [[0.92, -0.16, 0.92, 0.56]],
        tip: '從 iPad 右上角的外面開始往下滑' },
    ];
    const names = { undo: '復原', switcher: 'App 切換器', home: '回到主畫面', search: '搜尋', nc: '通知中心', cc: '控制中心' };

    host.innerHTML = `
      <div class="w-gs">
        <div class="gs-say"><span class="gs-msg"></span>
          <button class="gs-again">🔁 再看一次</button><button class="gs-next" hidden>下一個 ▶</button></div>
        <div class="gs-stage">
          <div class="gs-ipad"><div class="gs-screen">
            <div class="gs-status"><span>9:41</span><span>📶 🔋</span></div>
            <div class="gs-home">
              ${[['🎨', '畫畫'], ['📷', '相機'], ['🗺️', '地圖'], ['🎵', '音樂'], ['📚', '書籍'], ['⏰', '時鐘'], ['🧮', '計算機'], ['⚙️', '設定']]
                .map(([i, n]) => `<span class="gs-icon"><b>${i}</b>${n}</span>`).join('')}
              <span class="gs-dock"><b>💬</b><b>🧭</b><b>🖼️</b><b>📝</b></span>
            </div>
            <div class="gs-card gs-other"><p>📷 相機</p><span>📸</span></div>
            <div class="gs-card gs-app"><p>🎨 畫畫</p><span class="gs-art"><i>⭐</i><i>🌈</i><i class="gs-last">🐱</i></span></div>
            <div class="gs-search"><p>🔍 搜尋</p><span>📷 相機</span><span>🗺️ 地圖</span><span>🎵 音樂</span></div>
            <div class="gs-nc"><p>通知中心</p><span>💬 媽媽：晚餐好了！</span><span>⏰ 鬧鐘：練習鋼琴</span></div>
            <div class="gs-cc"><b>✈️</b><b>📶</b><b>🔵</b><b>🔒</b><b class="gs-wide">☀️ 亮度</b><b class="gs-wide">🔊 音量</b></div>
            <div class="gs-hud" hidden>↩️ 復原：拿掉 🐱</div>
            <i class="gs-bar"></i>
          </div></div>
          <canvas class="gs-ink"></canvas>
          <div class="toast" hidden></div>
        </div>
        <ul class="tasks gs-tasks"></ul>
      </div>`;
    const $ = s => host.querySelector(s);
    const stage = $('.gs-stage'), scr = $('.gs-screen'), ink = $('.gs-ink'), msg = $('.gs-msg');
    const again = $('.gs-again'), next = $('.gs-next'), hud = $('.gs-hud');
    const check = checklist($('.gs-tasks'), steps, api);
    const toast = toaster($('.toast'), api);
    const rows = [...host.querySelectorAll('.gs-tasks li')];

    const STOP = {};
    let run = 0, mode = 'demo', step = null, scene = 'app', misses = 0;
    const passed = new Set(); // steps the flow has moved past (an N/A one counts once its demo is shown)
    let tracks = [];          // finger dots and trails, in screen units

    const say = (icon, text) => { msg.innerHTML = `<b>${icon}</b> ${text}`; pop(msg); };
    const setScene = name => {
      scene = name;
      scr.className = `gs-screen on-${name}`;
      hud.hidden = true;
    };
    const effect = id => {
      if (id === 'undo') { scr.classList.add('undone'); hud.hidden = false; pop(hud); }
      else if (id === 'home') { scr.classList.replace('on-app', 'on-home'); scene = 'home'; }
      else if (id === 'switcher') scr.classList.add('show-cards');
      else scr.classList.add('show-' + id);
    };

    const frame = () => new Promise(r => requestAnimationFrame(r));
    async function tween(ms, fn, tok) {
      const t0 = performance.now();
      for (;;) {
        await frame();
        if (tok !== run || !api.alive()) throw STOP;
        const k = Math.min(1, (performance.now() - t0) / ms);
        fn(k);
        if (k === 1) return;
      }
    }
    const wait = (ms, tok) => tween(ms, () => {}, tok);
    const ease = k => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
    const track = (x, y) => {
      const t = { pts: [{ x, y, t: performance.now() }], end: 0 };
      tracks.push(t);
      return t;
    };
    const push = (t, x, y) => t.pts.push({ x, y, t: performance.now() });

    function mark(s) {
      rows.forEach((li, i) => li.classList.toggle('gs-now', steps[i] === s));
    }

    async function demo(s) {
      const tok = ++run;
      step = s;
      mode = 'demo';
      misses = 0;
      tracks = [];
      mark(s);
      next.hidden = true;
      again.disabled = true;
      again.classList.remove('glow');
      setScene(s.scene);
      say('👀', `看示範：<b>${s.zh}</b>`);
      try {
        await wait(800, tok);
        const tr = s.fingers.map(([x, y]) => track(x, y));
        await wait(300, tok);
        await tween(s.hold ? 650 : 600, k => {
          const e = ease(k);
          s.fingers.forEach(([x0, y0, x1, y1], i) => push(tr[i], x0 + (x1 - x0) * e, y0 + (y1 - y0) * e));
        }, tok);
        if (s.hold) { await wait(350, tok); effect(s.id); await wait(s.hold, tok); }
        else effect(s.id);
        tr.forEach(t => { t.end = performance.now(); });
        await wait(1500, tok);
        setScene(s.scene);
        await wait(450, tok);
        practice(s);
      } catch (err) {
        if (err !== STOP) throw err;
      }
    }

    function practice(s) {
      again.disabled = false;
      if (s.na) {
        mode = 'na';
        say('🚫', s.na);
        passed.add(s.id);
        next.hidden = !steps.some(x => !passed.has(x.id));
        return;
      }
      mode = 'try';
      say('👉', `換你試試看：<b>${s.zh}</b>`);
    }

    function advance() {
      const s = steps.find(x => !passed.has(x.id));
      if (s) { demo(s); return; }
      run++;
      step = null;
      mode = 'free';
      mark(null);
      again.disabled = true;
      next.hidden = true;
      say('🎉', '系統手勢都學會了！點清單裡的手勢，可以再看一次。');
    }

    // Which gesture did these fingers make? Distances are in screen units.
    function what(g) {
      const ps = [...g.all];
      if (g.max >= 3) {
        const dx = ps.reduce((n, p) => n + p.x - p.sx, 0) / ps.length;
        return dx < -0.12 ? 'undo' : null;
      }
      if (g.max > 1) return null;
      const p = ps[0], dx = p.x - p.sx, dy = p.y - p.sy;
      if (p.sy > 0.9 && dy < -0.15) return g.held ? 'switcher' : 'home';
      if (p.sy < 0.1 && dy > 0.15) return p.sx >= 0.7 ? 'cc' : p.sx <= 0.6 ? 'nc' : null;
      if (scene === 'home' && dy > 0.15 && dy > Math.abs(dx)) return 'search';
      return null;
    }

    function judge(g) {
      const got = what(g);
      const s = step;
      if (got === s.id) {
        if (got !== 'switcher') effect(got); // the switcher already opened while the finger held still
        check(s.id);
        passed.add(s.id);
        mode = 'wait';
        say('✅', `做到了！${s.alt}`);
        api.later(advance, 1900);
        return;
      }
      misses++;
      if (got) {
        if (got === 'switcher') api.later(() => { if (mode === 'try') setScene(s.scene); }, 1200);
        toast(got === 'switcher' && s.id === 'home'
          ? '停住了，變成 App 切換器。這次一口氣滑上去，不要停'
          : `這是「${names[got]}」喔！現在要練習：${s.zh}`, 3000);
      } else {
        toast(`再試一次：${s.tip}`, 3000);
      }
      if (misses >= 2) again.classList.add('glow');
    }

    // The child's fingers.
    let g = null;
    const toScreen = e => {
      const r = scr.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    stage.addEventListener('pointerdown', e => {
      if (mode !== 'try' || e.button > 0) return;
      e.preventDefault();
      stage.setPointerCapture(e.pointerId);
      const { x, y } = toScreen(e), now = performance.now();
      if (!g) g = { live: new Map(), all: new Set(), max: 0, held: false };
      const p = { sx: x, sy: y, x, y, ax: x, ay: y, still: now, tr: track(x, y) };
      g.live.set(e.pointerId, p);
      g.all.add(p);
      g.max = Math.max(g.max, g.live.size);
    });
    stage.addEventListener('pointermove', e => {
      const p = g?.live.get(e.pointerId);
      if (!p) return;
      const { x, y } = toScreen(e);
      p.x = x;
      p.y = y;
      push(p.tr, x, y);
      if (Math.hypot(x - p.ax, y - p.ay) > 0.02) { p.ax = x; p.ay = y; p.still = performance.now(); }
    });
    // iPadOS may take over a three-finger swipe and cancel the touches; judge it all the same.
    const up = e => {
      const p = g?.live.get(e.pointerId);
      if (!p) return;
      p.tr.end = performance.now();
      g.live.delete(e.pointerId);
      if (g.live.size) return;
      const done = g;
      g = null;
      if (mode === 'try') judge(done);
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);

    // A finger that slides up from the bottom and then holds still opens the App Switcher.
    function holdCheck(now) {
      if (!g || g.held || g.max !== 1 || g.live.size !== 1) return;
      const [p] = g.live.values();
      if (p.sy > 0.9 && p.y - p.sy < -0.15 && now - p.still > 380) {
        g.held = true;
        effect('switcher');
      }
    }

    next.onclick = () => advance();
    again.onclick = () => { if (step) demo(step); };
    rows.forEach((li, i) => {
      li.addEventListener('click', () => {
        if (passed.has(steps[i].id) && mode !== 'demo') { passed.delete(steps[i].id); demo(steps[i]); }
      });
    });

    // Drawing: finger dots with short fading trails, and a pulse where to start.
    const ctx = ink.getContext('2d');
    const hex = (getComputedStyle(host).getPropertyValue('--c').trim() || '#9c36b5').replace('#', '');
    const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
    let dpr = 1;
    const fit = () => {
      dpr = devicePixelRatio || 1;
      ink.width = Math.round(stage.clientWidth * dpr);
      ink.height = Math.round(stage.clientHeight * dpr);
    };
    new ResizeObserver(fit).observe(stage);
    fit();

    function draw() {
      if (!api.alive()) return;
      requestAnimationFrame(draw);
      const now = performance.now();
      holdCheck(now);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ink.width, ink.height);
      const st = stage.getBoundingClientRect(), sr = scr.getBoundingClientRect();
      const P = (x, y) => [sr.left - st.left + x * sr.width, sr.top - st.top + y * sr.height];

      if (mode === 'try' && step && !g) {
        const k = (now % 1400) / 1400;
        for (const [x, y] of step.fingers) {
          const [px, py] = P(x, y);
          ctx.beginPath();
          ctx.arc(px, py, 16 + k * 18, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(${rgb},${0.7 * (1 - k)})`;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},.35)`;
          ctx.fill();
        }
      }

      tracks = tracks.filter(t => !t.end || now - t.end < 450);
      ctx.lineCap = 'butt'; // round caps overlap at each joint and look like beads
      ctx.lineWidth = 12;
      for (const t of tracks) {
        while (t.pts.length > 2 && now - t.pts[0].t > 700) t.pts.shift();
        for (let i = 1; i < t.pts.length; i++) {
          const age = now - t.pts[i].t;
          if (age > 650) continue;
          const [ax, ay] = P(t.pts[i - 1].x, t.pts[i - 1].y), [bx, by] = P(t.pts[i].x, t.pts[i].y);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(${rgb},${0.3 * (1 - age / 650)})`;
          ctx.stroke();
        }
        const last = t.pts[t.pts.length - 1], fade = t.end ? 1 - (now - t.end) / 450 : 1;
        const [px, py] = P(last.x, last.y);
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.35 * fade})`;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * fade})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.85 * fade})`;
        ctx.fill();
        ctx.lineWidth = 12;
        if (!t.end && now - last.t > 300) { // holding still
          const k = ((now - last.t) % 900) / 900;
          ctx.beginPath();
          ctx.arc(px, py, 24 + k * 16, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(${rgb},${0.8 * (1 - k)})`;
          ctx.stroke();
          ctx.lineWidth = 12;
        }
      }
    }
    requestAnimationFrame(draw);
    advance();
  },

  // Roll a ball into the hole by tilting: a joystick, or the real gyroscope when allowed.
  tilt(host, { goal }, api) {
    host.innerHTML = `
      <div class="w-tilt">
        <div class="board"><span class="hole"></span><span class="ball"></span><span class="score"></span></div>
        <div class="tilt-side">
          <div class="stick"><span class="knob"></span></div>
          <p class="readout">拖動搖桿，就像把平板歪一邊</p>
          <button class="go sensor" hidden>📱 改用平板的陀螺儀</button>
          <p class="note"></p>
        </div>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const board = $('.board'), ball = $('.ball'), hole = $('.hole'), stick = $('.stick'), knob = $('.knob');
    const tilt = { x: 0, y: 0 };
    let bx = 0, by = 0, vx = 0, vy = 0, hx = 0, hy = 0, score = 0, ready = false, sensorOn = false;
    const R = 16, H = 26;
    const placeHole = (w, h) => {
      do { hx = H + Math.random() * (w - 2 * H); hy = H + Math.random() * (h - 2 * H); } while (Math.hypot(hx - bx, hy - by) < Math.min(w, h) * 0.45);
      hole.style.left = hx + 'px';
      hole.style.top = hy + 'px';
    };
    const drawScore = () => { $('.score').textContent = score >= goal ? '🎉 全部進洞！' : `進洞 ${score} / ${goal}`; };
    const showTilt = () => {
      const h = Math.round(tilt.x * 30), v = Math.round(tilt.y * 30);
      $('.readout').textContent = `${h < 0 ? '往左' : '往右'}歪 ${Math.abs(h)}°、${v < 0 ? '往上' : '往下'}歪 ${Math.abs(v)}°`;
    };

    // joystick
    let stickId = null;
    const setStick = e => {
      const b = stick.getBoundingClientRect();
      let x = (e.clientX - b.left - b.width / 2) / (b.width / 2);
      let y = (e.clientY - b.top - b.height / 2) / (b.height / 2);
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      tilt.x = x; tilt.y = y;
      knob.style.translate = `${x * 50}% ${y * 50}%`;
      showTilt();
    };
    stick.addEventListener('pointerdown', e => {
      if (sensorOn) return;
      e.preventDefault();
      stick.setPointerCapture(e.pointerId);
      stickId = e.pointerId;
      setStick(e);
    });
    stick.addEventListener('pointermove', e => { if (e.pointerId === stickId) setStick(e); });
    const release = e => {
      if (e.pointerId !== stickId) return;
      stickId = null;
      tilt.x = tilt.y = 0;
      knob.style.translate = '0 0';
    };
    stick.addEventListener('pointerup', release);
    stick.addEventListener('pointercancel', release);

    // real sensor (iOS asks for permission, and only on an https page)
    const btn = $('.sensor');
    if ('DeviceOrientationEvent' in window && navigator.maxTouchPoints > 0) btn.hidden = false;
    let base = null;
    const onTurn = e => {
      if (!api.alive()) { window.removeEventListener('deviceorientation', onTurn); return; }
      if (e.beta == null) return;
      const a = (screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0;
      const [x, y] = a === 90 ? [e.beta, -e.gamma] : a === -90 || a === 270 ? [-e.beta, e.gamma] : a === 180 ? [-e.gamma, -e.beta] : [e.gamma, e.beta];
      base ??= { x, y };
      tilt.x = Math.max(-1, Math.min(1, (x - base.x) / 25));
      tilt.y = Math.max(-1, Math.min(1, (y - base.y) / 25));
      knob.style.translate = `${tilt.x * 50}% ${tilt.y * 50}%`;
      showTilt();
    };
    btn.onclick = async () => {
      if (!window.isSecureContext) {
        $('.note').textContent = '要用 https 網址打開，才能用真的陀螺儀。現在先用搖桿玩。';
        return;
      }
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') {
            $('.note').textContent = '沒有拿到使用權限，先用搖桿玩。';
            return;
          }
        }
      } catch {
        $('.note').textContent = '沒辦法使用陀螺儀，先用搖桿玩。';
        return;
      }
      sensorOn = true;
      base = null;
      btn.hidden = true;
      stick.classList.add('off');
      $('.note').textContent = '現在的姿勢當作「平的」。慢慢歪平板試試看！';
      window.addEventListener('deviceorientation', onTurn);
    };

    let last = performance.now();
    const frameStep = now => {
      if (!api.alive()) { window.removeEventListener('deviceorientation', onTurn); return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = board.clientWidth, h = board.clientHeight;
      if (!ready && w) { bx = w / 2; by = h / 2; placeHole(w, h); drawScore(); ready = true; }
      if (score < goal) {
        vx = (vx + tilt.x * 900 * dt) * (1 - 1.2 * dt);
        vy = (vy + tilt.y * 900 * dt) * (1 - 1.2 * dt);
        bx += vx * dt;
        by += vy * dt;
        if (bx < R) { bx = R; vx = -vx * 0.5; }
        if (bx > w - R) { bx = w - R; vx = -vx * 0.5; }
        if (by < R) { by = R; vy = -vy * 0.5; }
        if (by > h - R) { by = h - R; vy = -vy * 0.5; }
        if (Math.hypot(bx - hx, by - hy) < H - R / 2) {
          score++;
          api.good();
          pop(hole);
          vx = vy = 0;
          drawScore();
          if (score >= goal) api.done();
          else placeHole(w, h);
        }
      }
      ball.style.left = bx + 'px';
      ball.style.top = by + 'px';
      requestAnimationFrame(frameStep);
    };
    requestAnimationFrame(frameStep);
  },

  // Turn a pretend tablet with and without rotation lock; also notice the real one turning.
  orient(host, _, api) {
    host.innerHTML = `
      <div class="w-orient">
        <p class="real"></p>
        <div class="tab-stage"><div class="tab"><div class="tab-screen"><div class="content"><span>🐶</span><b>Hi!</b></div></div></div></div>
        <div class="controls">
          <button data-act="rotate">↻ 轉動平板</button>
          <button data-act="lock">🔓 旋轉鎖定：關</button>
        </div>
        <p class="step"></p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const tab = $('.tab'), content = $('.content'), rotBtn = $('[data-act="rotate"]'), lockBtn = $('[data-act="lock"]');
    let rot = 0, rel = 0, locked = false, step = 0;
    const steps = [
      '① 按「轉動平板」，看看畫面會怎樣',
      '② 畫面自己轉正了！現在打開「旋轉鎖定」',
      '③ 再按一次「轉動平板」',
      '🎉 鎖定以後，畫面跟著平板一起歪了。躺著看書時很好用！',
    ];
    const draw = () => {
      $('.step').textContent = steps[step];
      lockBtn.textContent = locked ? '🔒 旋轉鎖定：開' : '🔓 旋轉鎖定：關';
      lockBtn.classList.toggle('on', locked);
      rotBtn.classList.toggle('glow', step === 0 || step === 2);
      lockBtn.classList.toggle('glow', step === 1);
    };
    rotBtn.onclick = () => {
      rot += 90;
      tab.style.rotate = rot + 'deg';
      if (!locked) rel = -rot;
      content.style.rotate = rel + 'deg';
      api.good();
      if (step === 0 && !locked) step = 1;
      else if (step === 2 && locked) { step = 3; api.done(); }
      draw();
    };
    lockBtn.onclick = () => {
      locked = !locked;
      if (!locked) { rel = -rot; content.style.rotate = rel + 'deg'; }
      if (step === 1 && locked) step = 2;
      draw();
    };
    const mq = matchMedia('(orientation: portrait)');
    const real = changed => {
      $('.real').innerHTML = `你的螢幕現在是：<b>${mq.matches ? '直的' : '橫的'}</b>${en(mq.matches ? 'portrait' : 'landscape')}${changed ? '　你轉了真的平板，畫面也跟著轉正了！' : ''}`;
    };
    const onChange = () => {
      if (!api.alive()) { mq.removeEventListener('change', onChange); return; }
      real(true);
    };
    mq.addEventListener('change', onChange);
    real(false);
    draw();
  },

  // Charge with a small charger and a fast charger; fast charging slows down near full.
  charge(host, _, api) {
    const kinds = {
      5: { name: '5W 小充電器', fast: 0.55 },
      20: { name: '20W 快充充電器', fast: 1.55 },
    };
    host.innerHTML = `
      <div class="w-charge">
        <div class="chargers">${Object.entries(kinds).map(([w, k]) => `<button class="option" data-w="${w}">${w === '20' ? '⚡' : '🔌'} ${k.name}</button>`).join('')}</div>
        <div class="rig">
          <span class="brick">🔌<small></small></span>
          <span class="cable"></span>
          <div class="charge-tab"><div class="batt"><i></i></div><b class="pct">10%</b></div>
        </div>
        <p class="clock">模擬時間 0 小時 0 分</p>
        <p class="readout">選一個充電器，看看充滿要多久</p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const btns = [...host.querySelectorAll('[data-w]')];
    const tried = new Set();
    const results = [];
    const hm = m => `${Math.floor(m / 60)} 小時 ${Math.round(m % 60)} 分`;
    btns.forEach(b => {
      b.onclick = () => {
        const w = b.dataset.w, k = kinds[w];
        btns.forEach(x => (x.disabled = true));
        $('.brick small').textContent = w + 'W';
        $('.rig').classList.add('on');
        let level = 10, mins = 0;
        const tick = () => {
          // 2 simulated minutes per tick; above 80% both chargers slow down to protect the battery
          for (let i = 0; i < 2 && level < 100; i++) { level = Math.min(100, level + (level < 80 ? k.fast : 0.4)); mins++; }
          $('.batt i').style.width = level + '%';
          $('.batt').classList.toggle('slow', level >= 80);
          $('.pct').textContent = Math.floor(level) + '%';
          $('.clock').textContent = '模擬時間 ' + hm(mins);
          if (level < 100) { api.later(tick, 40); return; }
          $('.rig').classList.remove('on');
          btns.forEach(x => (x.disabled = false));
          tried.add(w);
          results.push(`${k.name}：大約 ${hm(mins)}`);
          $('.readout').innerHTML = results.join('<br>') + (tried.size === 2 ? '<br>💡 快充前面很快，快滿時會變慢，這是在保護電池。' : '<br>再試試另一個充電器！');
          api.good();
          if (tried.size === 2) api.done();
        };
        tick();
      };
    });
  },

  // A pretend camera app with a live view: tap for a photo of that moment, hold for a video,
  // switch to video mode and record, flip to the front camera.
  camera(host, _, api) {
    const tasks = [
      { id: 'photo', zh: '拍一張照片', en: 'take a photo', alt: '拍到的是按下去那一刻' },
      { id: 'quick', zh: '拍照時按住快門，直接錄影', en: 'hold to record', alt: '放開手指就停止' },
      { id: 'mode', zh: '切換到錄影', en: 'video mode' },
      { id: 'record', zh: '錄一段影片', en: 'record', alt: '按一下開始，再按一下停止' },
      { id: 'flip', zh: '換成前鏡頭自拍', en: 'selfie' },
    ];
    // Each live thing is placed at left/top in percent, so a copy of the scene scales into the thumbnail.
    const scenes = {
      back: `
        <span class="cm-o cm-cloud" data-k="cloud">☁️</span>
        <span class="cm-o cm-bird" data-k="bird">🐦</span>
        <span class="cm-o cm-tree" style="left:12%;top:58%">🌳</span>
        <span class="cm-o cm-house" style="left:45%;top:56%">🏠</span>
        <span class="cm-o cm-tree" style="left:80%;top:58%">🌳</span>
        <span class="cm-o cm-fly" data-k="fly">🦋</span>
        <span class="cm-o cm-dog" data-k="dog">🐕</span>`,
      front: `
        <span class="cm-o cm-balloon" data-k="balloon">🎈</span>
        <div class="cm-face" data-k="face"><i class="cm-hair"></i><i class="cm-eye cm-l"></i><i class="cm-eye cm-r"></i><i class="cm-cheek cm-l"></i><i class="cm-cheek cm-r"></i><i class="cm-mouth"></i></div>
        <span class="cm-o cm-ya" data-k="ya">✌️</span>`,
    };
    host.innerHTML = `
      <div class="w-lab">
        <div class="cam">
          <div class="viewfinder"><div class="shot"></div><span class="rec" hidden>● <b>00:00</b></span><div class="flash"></div></div>
          <div class="modes"><button data-mode="video">錄影</button><button data-mode="photo" class="on">拍照</button></div>
          <div class="cam-bar">
            <div class="thumb" aria-label="相簿"></div>
            <button class="shutter" aria-label="快門（按住可以錄影）"><i></i></button>
            <button class="flip" aria-label="切換前後鏡頭">🔄</button>
          </div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const vf = $('.viewfinder'), scene = $('.shot'), shutter = $('.shutter'), rec = $('.rec');
    let mode = 'photo', front = false, rec0 = 0, recSnap = null, recKind = '';
    const recording = () => rec0 > 0;
    const drawScene = () => { scene.innerHTML = front ? scenes.front : scenes.back; scene.classList.toggle('front', front); };

    // The live view: where everything is at time s (seconds).
    const at = (k, s) => {
      const loop = (period, a, b) => a + ((s / period) % 1) * (b - a);
      switch (k) {
        case 'cloud': return [loop(40, -15, 115), 14];
        case 'bird': return [loop(11, 112, -12), 28 + 4 * Math.sin(s * 2.2)];
        case 'fly': return [68 + 14 * Math.sin(s * 0.7), 48 + 9 * Math.sin(s * 1.3)];
        case 'dog': {
          const p = (s / 18) % 1, right = p < 0.5;
          return [right ? 8 + 168 * p : 176 - 168 * p, 84 - Math.abs(Math.sin(s * 5)) * 2, right];
        }
        case 'balloon': return [86, loop(14, 112, -14)];
        case 'face': return [56 + 2 * Math.sin(s * 0.8), 52 + 1.5 * Math.sin(s * 1.1)];
        case 'ya': return [27 + 2 * Math.sin(s * 0.8), 56 + 1.5 * Math.sin(s * 1.1)];
      }
      return [50, 50];
    };
    function frame(now) {
      if (!api.alive()) return;
      requestAnimationFrame(frame);
      const s = now / 1000;
      scene.querySelectorAll('[data-k]').forEach(el => {
        const [x, y, flip] = at(el.dataset.k, s);
        el.style.left = x + '%';
        el.style.top = y + '%';
        if (el.dataset.k === 'dog') el.classList.toggle('cm-right', flip);
      });
      // a wink of one eye every few seconds
      scene.querySelector('.cm-eye.cm-l')?.classList.toggle('cm-shut', s % 3.4 < 0.22);
      if (recording()) {
        const secs = Math.floor((now - rec0) / 1000);
        rec.querySelector('b').textContent = `00:${String(secs).padStart(2, '0')}`;
      }
    }

    // A copy of the scene as it is right now: that is the photo.
    const snap = () => {
      const pic = document.createElement('div');
      pic.className = 'cm-pic' + (front ? ' cm-front' : '');
      pic.append(scene.cloneNode(true));
      pic.style.width = vf.clientWidth + 'px';
      pic.style.height = vf.clientHeight + 'px';
      return pic;
    };
    // Hold the photo on the screen for a moment, then shrink it into the album thumbnail.
    async function keep(pic, video) {
      const th = $('.thumb');
      vf.append(pic);
      await new Promise(r => setTimeout(r, 380));
      if (!api.alive()) return;
      const a = vf.getBoundingClientRect(), b = th.getBoundingClientRect();
      const k = b.width / a.width;
      await pic.animate(
        [{ transform: 'none' }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${k})` }],
        { duration: 420, easing: 'ease-in' }
      ).finished;
      if (!api.alive()) return;
      pic.style.transform = `scale(${k})`;
      th.replaceChildren(pic);
      if (video) th.insertAdjacentHTML('beforeend', '<b>▶</b>');
      pop(th);
    }
    const flash = () => {
      const f = $('.flash');
      f.classList.remove('go');
      void f.offsetWidth;
      f.classList.add('go');
    };
    function photo(pic) {
      flash();
      keep(pic, false);
      check('photo');
    }
    function startRec(kind, pic) {
      rec0 = performance.now();
      recSnap = pic;
      recKind = kind;
      rec.querySelector('b').textContent = '00:00';
      rec.hidden = false;
      shutter.classList.add(kind === 'quick' ? 'cm-quick' : 'recording');
    }
    function stopRec() {
      const secs = Math.max(1, Math.round((performance.now() - rec0) / 1000));
      rec0 = 0;
      rec.hidden = true;
      shutter.classList.remove('cm-quick', 'recording');
      keep(recSnap, true);
      check(recKind, `錄了 ${secs} 秒`);
    }

    host.querySelector('.modes').addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (!b || recording()) return;
      mode = b.dataset.mode;
      host.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
      shutter.classList.toggle('video', mode === 'video');
      if (mode === 'video') check('mode');
    });

    // The photo is taken when the shutter goes down; holding it in photo mode turns into a video.
    let press = null;
    shutter.addEventListener('pointerdown', e => {
      if (e.button > 0 || press) return;
      e.preventDefault();
      shutter.setPointerCapture(e.pointerId);
      press = { pic: snap(), timer: 0, quick: false };
      if (mode === 'photo') {
        press.timer = setTimeout(() => {
          if (!api.alive() || !press) return;
          press.quick = true;
          startRec('quick', press.pic);
        }, 500);
      }
    });
    const release = e => {
      if (!press) return;
      const p = press;
      press = null;
      clearTimeout(p.timer);
      if (p.quick) { stopRec(); return; }
      if (e.type === 'pointercancel') return;
      if (mode === 'photo') photo(p.pic);
      else if (recording()) stopRec();
      else startRec('record', p.pic);
    };
    shutter.addEventListener('pointerup', release);
    shutter.addEventListener('pointercancel', release);
    shutter.addEventListener('click', e => {
      if (e.detail !== 0) return; // a keyboard press; finger and mouse presses are handled above
      if (mode === 'photo') photo(snap());
      else if (recording()) stopRec();
      else startRec('record', snap());
    });
    $('.flip').onclick = () => {
      if (recording()) return;
      front = !front;
      scene.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0)' }], { duration: 300 });
      drawScene();
      if (front) check('flip');
    };
    drawScene();
    requestAnimationFrame(frame);
  },

  // Find the camera on a laptop, a tablet and the back of a phone.
  findcam(host, _, api) {
    const devs = [
      { id: 'laptop', name: '筆電', at: [50, 5], note: '在螢幕上方。旁邊的小燈亮了，就表示鏡頭正在拍。' },
      { id: 'tablet', name: '平板', at: [50, 4.5], note: '在螢幕邊框的中間。有些新的 iPad 在橫放時的上方。' },
      { id: 'phone', name: '手機背面', at: [27, 13], note: '這是後鏡頭，通常比前鏡頭拍得更清楚。' },
    ];
    host.innerHTML = `
      <div class="w-findcam">
        <div class="devs">${devs.map(d => `
          <figure class="dev ${d.id}" data-id="${d.id}">
            <div class="body"><i class="lens"></i>${d.id === 'laptop' ? '<i class="led"></i>' : ''}<span class="ring" hidden></span><span class="miss" hidden></span></div>
            ${d.id === 'laptop' ? '<div class="base"></div>' : ''}
            <figcaption><b>${d.name}</b><small></small></figcaption>
          </figure>`).join('')}</div>
        <p class="hint">在每台裝置上點出鏡頭的位置</p>
      </div>`;
    let found = 0;
    devs.forEach(d => {
      const fig = host.querySelector(`[data-id="${d.id}"]`);
      const body = fig.querySelector('.body');
      const ring = fig.querySelector('.ring'), miss = fig.querySelector('.miss');
      ring.style.left = d.at[0] + '%';
      ring.style.top = d.at[1] + '%';
      body.addEventListener('pointerdown', e => {
        if (fig.classList.contains('found')) return;
        const b = body.getBoundingClientRect();
        const x = e.clientX - b.left, y = e.clientY - b.top;
        const cx = (d.at[0] / 100) * b.width, cy = (d.at[1] / 100) * b.height;
        if (Math.hypot(x - cx, y - cy) < Math.max(28, b.width * 0.14)) {
          fig.classList.add('found');
          ring.hidden = false;
          fig.querySelector('small').textContent = d.note;
          api.good();
          if (++found === devs.length) api.done();
        } else {
          miss.style.left = x + 'px';
          miss.style.top = y + 'px';
          miss.hidden = false;
          pop(miss);
          api.bad();
          api.later(() => { miss.hidden = true; }, 500);
        }
      });
    });
  },

  // Tap each part of a web address to learn what it means.
  url(host, _, api) {
    const parts = [
      { cls: 'proto', text: 'https://', zh: '協定', en: 'protocol', say: '用哪一種方式和網站說話。最後的 s 表示「有加密」。' },
      { cls: 'domain', text: 'kids.example.tw', zh: '網域名稱', en: 'domain name', say: '網站的名字，像門牌。最後的 .tw 表示台灣。' },
      { cls: 'path', text: '/animals/panda', zh: '路徑', en: 'path', say: '網站裡的哪一頁，像房子裡的哪一個房間。' },
    ];
    host.innerHTML = `
      <div class="w-url">
        <div class="addr"><span class="lock">🔒</span>${parts.map((p, i) => `<button class="part ${p.cls}" data-i="${i}">${p.text}</button>`).join('')}</div>
        <div class="explain-box"><p>點上面網址的每一段</p></div>
        <div class="url-seen">${parts.map(p => `<span class="${p.cls}">${p.zh}${en(p.en)}</span>`).join('')}</div>
      </div>`;
    const seen = new Set();
    host.querySelectorAll('.part').forEach(b => {
      b.onclick = () => {
        const p = parts[b.dataset.i];
        host.querySelectorAll('.part').forEach(x => x.classList.toggle('on', x === b));
        host.querySelector('.explain-box').innerHTML = `<p class="${p.cls}"><b>${p.zh}</b>${en(p.en)}</p><p>${p.say}</p>`;
        host.querySelector(`.url-seen .${p.cls}`).classList.add('got');
        if (seen.has(b.dataset.i)) return;
        seen.add(b.dataset.i);
        api.good();
        if (seen.size === parts.length) api.done();
      };
    });
  },

  // Pass a note through classmates: without a lock the one in the middle can read it.
  cipher(host, _, api) {
    const msg = '我的密碼是 cat123';
    host.innerHTML = `
      <div class="w-cipher">
        <p class="note-msg">紙條：<b>${msg}</b></p>
        <div class="chain">
          <div class="kid me"><span>🧒</span><small>你</small></div>
          <div class="kid"><span>👦</span><small>同學</small></div>
          <div class="kid peek"><span>🧐</span><small>好奇的同學</small><p class="bubble" hidden></p></div>
          <div class="kid end"><span>👧</span><small>好朋友</small><p class="bubble" hidden></p></div>
        </div>
        <div class="controls">
          <button class="lockbtn" data-act="lock">🔓 沒上鎖</button>
          <button class="go glow" data-act="send">📨 傳出去</button>
        </div>
        <p class="step">① 先不上鎖，直接傳出去</p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const box = $('.w-cipher');
    const kids = [...host.querySelectorAll('.kid')];
    const lockBtn = $('.lockbtn'), send = $('[data-act="send"]');
    let locked = false, plainSent = false, lockedSent = false, busy = false;
    const scramble = () => '🔒 ' + Array.from({ length: 8 }, () => '#$%&@*xq7k'[Math.floor(Math.random() * 10)]).join('');
    lockBtn.onclick = () => {
      if (busy) return;
      locked = !locked;
      lockBtn.textContent = locked ? '🔒 加密上鎖' : '🔓 沒上鎖';
      lockBtn.classList.toggle('on', locked);
    };
    send.onclick = async () => {
      if (busy) return;
      busy = true;
      send.disabled = true;
      host.querySelectorAll('.bubble').forEach(b => (b.hidden = true));
      const token = locked ? '🔒' : '📝';
      for (let i = 0; i < kids.length - 1; i++) {
        await fly(box, token, kids[i], kids[i + 1], 500);
        if (!api.alive()) return;
        if (i === 1) {
          const b = kids[2].querySelector('.bubble');
          b.textContent = locked ? `${scramble()}…看不懂 😵` : `「${msg}」嘿嘿，看到了 😏`;
          b.hidden = false;
          pop(b);
        }
      }
      const b = kids[3].querySelector('.bubble');
      b.textContent = locked ? `用鑰匙打開：「${msg}」` : `「${msg}」`;
      b.hidden = false;
      pop(b);
      api.good();
      if (locked) lockedSent = true; else plainSent = true;
      $('.step').textContent = plainSent && lockedSent
        ? '🎉 上了鎖，中間的人只看到亂碼，只有好朋友打得開！'
        : plainSent ? '② 糟糕，被偷看了！按「沒上鎖」把它鎖起來，再傳一次' : '① 也試試看不上鎖會怎樣';
      lockBtn.classList.toggle('glow', plainSent && !lockedSent);
      if (plainSent && lockedSent) api.done();
      busy = false;
      send.disabled = false;
    };
  },

  // A shift cipher: slide the key until the secret word appears.
  caesar(host, { secret, key }, api) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shift = (w, k) => w.replace(/[A-Z]/g, c => A[(A.indexOf(c) + k + 26) % 26]);
    const code = shift(secret, key);
    host.innerHTML = `
      <div class="w-caesar">
        <p class="coded">收到的暗號：<b>${code}</b></p>
        <div class="rows"><div class="row top"></div><div class="row bottom"></div></div>
        <div class="keybar">
          <button class="option minus" aria-label="金鑰減一">－</button>
          <label>金鑰：往回移 <b class="k">0</b> 格<input type="range" min="0" max="6" value="0"></label>
          <button class="option plus" aria-label="金鑰加一">＋</button>
        </div>
        <p class="decoded">解開來：<b></b></p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const range = $('input');
    let solved = false;
    const draw = () => {
      const k = +range.value;
      $('.k').textContent = k;
      $('.row.top').innerHTML = A.slice(0, 10).split('').map(c => `<i>${shift(c, k)}</i>`).join('') + '<i>…</i>';
      $('.row.bottom').innerHTML = A.slice(0, 10).split('').map(c => `<i>${c}</i>`).join('') + '<i>…</i>';
      const out = shift(code, -k);
      $('.decoded b').textContent = out;
      if (!solved && out === secret) {
        solved = true;
        $('.decoded').classList.add('ok');
        $('.decoded b').textContent = `${out} 🐼 解開了！`;
        api.good();
        api.done();
      }
    };
    range.oninput = draw;
    $('.minus').onclick = () => { range.value = +range.value - 1; draw(); };
    $('.plus').onclick = () => { range.value = +range.value + 1; draw(); };
    draw();
  },

  // An app with a bug and a security hole; the update fixes both and adds a feature.
  update(host, _, api) {
    host.innerHTML = `
      <div class="w-update">
        <p class="step">① 按「存檔」試試看</p>
        <div class="app">
          <div class="app-head"><b>🎨 小畫家</b><span class="ver">v1.0</span></div>
          <div class="app-canvas"><span class="art-pic">🌈🏠</span><span class="leak" title="安全漏洞">🕳️<i>🦹</i></span></div>
          <div class="app-tools">
            <button data-act="save">💾 存檔</button>
            <button data-act="rainbow" hidden>🌈 新功能：彩虹筆</button>
          </div>
        </div>
        <div class="upd">
          <button class="go" data-act="update" disabled>⬇️ 更新到 v1.1</button>
          <div class="progress" hidden><i></i><span></span></div>
        </div>
        <ul class="notes" hidden>
          <li>🐛 修好：按「存檔」會當掉的錯誤</li>
          <li>🛡️ 補好：壞人能鑽進來的安全漏洞</li>
          <li>🌈 新增：彩虹筆</li>
        </ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const app = $('.app'), save = $('[data-act="save"]'), upd = $('[data-act="update"]');
    let stage = 0; // 0 before crash, 1 crashed, 2 updating, 3 updated
    save.onclick = () => {
      if (stage === 0 || stage === 1) {
        shake(app);
        app.classList.add('crash');
        api.bad();
        api.later(() => app.classList.remove('crash'), 700);
        stage = 1;
        $('.step').textContent = '💥 當掉了！這是一個錯誤（bug）。② 按「更新」';
        upd.disabled = false;
        upd.classList.add('glow');
      } else if (stage === 3) {
        pop(app);
        $('.step').textContent = '🎉 存好了！更新修好了錯誤，也補好了漏洞，小偷進不來了。';
        api.good();
        api.done();
      }
    };
    $('[data-act="rainbow"]').onclick = () => { $('.art-pic').textContent = '🌈🌈🏠🌈'; pop($('.art-pic')); };
    upd.onclick = () => {
      stage = 2;
      upd.disabled = true;
      upd.classList.remove('glow');
      const bar = $('.progress');
      bar.hidden = false;
      let pct = 0;
      const tick = () => {
        pct += 4;
        bar.querySelector('i').style.width = pct + '%';
        bar.querySelector('span').textContent = pct < 60 ? `下載中 ${pct}%` : pct < 100 ? `安裝中 ${pct}%` : '更新完成！';
        if (pct < 100) { api.later(tick, 60); return; }
        stage = 3;
        $('.ver').textContent = 'v1.1';
        $('.leak').classList.add('fixed');
        $('[data-act="rainbow"]').hidden = false;
        $('.notes').hidden = false;
        $('.step').textContent = '③ 更新好了！再按一次「存檔」';
        save.classList.add('glow');
        api.good();
      };
      tick();
    };
  },

  // LCD vs OLED: the layers of each, and how each one shows black.
  screen(host, _, api) {
    const modes = {
      lcd: {
        name: '液晶 LCD',
        layers: `
          <div class="ly eye">👀 你的眼睛</div>
          <div class="ly filter"><i class="r"></i><i class="g"></i><i class="b"></i><span>彩色濾光片</span></div>
          <div class="ly blinds"><i></i><i></i><i></i><span>液晶（百葉窗）</span></div>
          <div class="ly back"><span>背光：一直亮著</span></div>`,
        black: '背光還亮著，百葉窗關不緊，會漏一點光，所以黑色有點灰灰的。',
      },
      oled: {
        name: 'OLED',
        layers: `
          <div class="ly eye">👀 你的眼睛</div>
          <div class="ly emit"><i class="r"></i><i class="g"></i><i class="b"></i><span>每個小點自己發光</span></div>`,
        black: '小點全部關掉，是真正的黑色，而且關掉的點不耗電。',
      },
    };
    host.innerHTML = `
      <div class="w-screen">
        <div class="tabs">${Object.entries(modes).map(([k, m]) => `<button class="option" data-m="${k}">${m.name}</button>`).join('')}</div>
        <div class="split">
          <div class="layers"></div>
          <div class="demo">
            <div class="mini"><span>🌙</span><span class="stars">✨</span></div>
            <button class="option black-btn">⬛ 顯示全黑畫面</button>
          </div>
        </div>
        <p class="say">先選一種螢幕</p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const seen = new Set();
    let mode = null, black = false;
    const draw = () => {
      host.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
      $('.w-screen').dataset.mode = mode || '';
      $('.mini').classList.toggle('black', black);
      $('.layers').classList.toggle('black', black);
      $('.black-btn').textContent = black ? '🌙 顯示夜空' : '⬛ 顯示全黑畫面';
    };
    host.querySelectorAll('[data-m]').forEach(b => {
      b.onclick = () => {
        mode = b.dataset.m;
        black = false;
        $('.layers').innerHTML = modes[mode].layers;
        $('.say').textContent = '按「顯示全黑畫面」，看看黑色是怎麼來的';
        draw();
      };
    });
    $('.black-btn').onclick = () => {
      if (!mode) { $('.say').textContent = '先選一種螢幕'; return; }
      black = !black;
      draw();
      if (!black) return;
      $('.say').textContent = modes[mode].black + (seen.size === 0 ? ' 再換另一種螢幕比比看！' : '');
      if (seen.has(mode)) return;
      seen.add(mode);
      api.good();
      if (seen.size === 2) api.done();
    };
    draw();
  },

  // The family of electromagnetic waves, from long radio waves to short X-rays.
  waves(host, _, api) {
    const zones = [
      { icon: '📻', zh: '無線電波', en: 'radio waves', use: '廣播電台、行動網路。波很長，可以穿過牆壁。', len: 150 },
      { icon: '📶', zh: '微波', en: 'microwaves', use: 'Wi-Fi、藍牙，還有微波爐。Wi-Fi 的能量小很多很多，不會把東西煮熱。', len: 90 },
      { icon: '🔥', zh: '紅外線', en: 'infrared', use: '電視遙控器，還有 Face ID 打在臉上的看不見的小點點。', len: 55 },
      { icon: '🌈', zh: '可見光', en: 'visible light', use: '眼睛唯一看得到的一段，螢幕發出的就是它。', len: 34 },
      { icon: '☀️', zh: '紫外線', en: 'ultraviolet', use: '太陽光裡有，會曬傷皮膚，所以要擦防曬。', len: 20 },
      { icon: '🦴', zh: 'X 光', en: 'X-rays', use: '可以穿過皮肉，醫院用它拍骨頭的照片。', len: 11 },
    ];
    host.innerHTML = `
      <div class="w-waves">
        <svg class="wave" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"><path d=""/></svg>
        <div class="band">${zones.map((z, i) => `<button class="zone z${i}" data-i="${i}"><span>${z.icon}</span><small>${z.zh}</small></button>`).join('')}</div>
        <div class="axis"><span>← 波長很長</span><span>波長很短 →</span></div>
        <div class="explain-box"><p>點上面的每一段</p></div>
      </div>`;
    const path = host.querySelector('.wave path');
    const drawWave = len => {
      let d = 'M0 60';
      for (let x = 0; x <= 600; x += 3) d += ` L${x} ${60 - 42 * Math.sin((x / len) * 2 * Math.PI)}`;
      path.setAttribute('d', d);
    };
    const seen = new Set();
    host.querySelectorAll('.zone').forEach(b => {
      b.onclick = () => {
        const z = zones[b.dataset.i];
        host.querySelectorAll('.zone').forEach(x => x.classList.toggle('on', x === b));
        b.classList.add('got');
        drawWave(z.len);
        host.querySelector('.wave').dataset.zone = b.dataset.i;
        host.querySelector('.explain-box').innerHTML = `<p><b>${z.icon} ${z.zh}</b>${en(z.en)}</p><p>${z.use}</p>`;
        if (seen.has(b.dataset.i)) return;
        seen.add(b.dataset.i);
        if (seen.size === zones.length) { api.good(); api.done(); }
      };
    });
    drawWave(60);
  },

  // Slide the phone onto the pad; it only charges when the coils line up.
  qi(host, _, api) {
    host.innerHTML = `
      <div class="w-qi">
        <div class="desk2">
          <div class="qpad"><i></i><i></i><i></i></div>
          <div class="qphone"><div class="qcoil"><i></i><i></i></div><span class="bolt" hidden>⚡</span></div>
        </div>
        <div class="qbatt"><div class="batt"><i></i></div><b class="pct">20%</b></div>
        <p class="readout">把手機拖到充電板的正中間</p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const desk = $('.desk2'), phone = $('.qphone'), pad = $('.qpad');
    let px = 0.18, py = 0.5, level = 20, dragId = null, offX = 0, offY = 0, finished = false;
    const place = () => { phone.style.left = px * 100 + '%'; phone.style.top = py * 100 + '%'; };
    const aligned = () => {
      const a = phone.getBoundingClientRect(), b = pad.getBoundingClientRect();
      return Math.hypot(a.left + a.width / 2 - (b.left + b.width / 2), a.top + a.height / 2 - (b.top + b.height / 2)) < b.width * 0.18;
    };
    phone.addEventListener('pointerdown', e => {
      e.preventDefault();
      phone.setPointerCapture(e.pointerId);
      dragId = e.pointerId;
      const r = phone.getBoundingClientRect();
      offX = e.clientX - (r.left + r.width / 2);
      offY = e.clientY - (r.top + r.height / 2);
    });
    phone.addEventListener('pointermove', e => {
      if (e.pointerId !== dragId) return;
      const d = desk.getBoundingClientRect();
      px = Math.min(0.92, Math.max(0.08, (e.clientX - offX - d.left) / d.width));
      py = Math.min(0.85, Math.max(0.15, (e.clientY - offY - d.top) / d.height));
      place();
    });
    const end = e => { if (e.pointerId === dragId) dragId = null; };
    phone.addEventListener('pointerup', end);
    phone.addEventListener('pointercancel', end);
    const tick = () => {
      const on = aligned();
      phone.classList.toggle('charging', on);
      $('.bolt').hidden = !on;
      pad.classList.toggle('on', on);
      if (on && level < 100) level = Math.min(100, level + 1.5);
      $('.batt i').style.width = level + '%';
      $('.pct').textContent = Math.floor(level) + '%';
      if (!finished) {
        $('.readout').textContent = on ? '⚡ 對準了！線圈接到磁場，開始充電' : '沒對準，線圈接不到磁場，充不到電';
        if (level >= 40) {
          finished = true;
          $('.readout').textContent = '🎉 充到 40% 了！無線充電要對準，也比插線慢一點。';
          api.good();
          api.done();
        }
      }
      api.later(tick, 100);
    };
    place();
    tick();
  },

  // Program a robot with arrow commands; a crash is a bug to fix.
  code(host, _, api) {
    const map = [
      '....*',
      '.##..',
      '...#.',
      'R....',
    ];
    const rows = map.length, cols = map[0].length;
    let start = null, goal = null;
    map.forEach((r, y) => [...r].forEach((c, x) => { if (c === 'R') start = { x, y }; if (c === '*') goal = { x, y }; }));
    const moves = { up: [0, -1, '⬆️'], down: [0, 1, '⬇️'], left: [-1, 0, '⬅️'], right: [1, 0, '➡️'] };
    host.innerHTML = `
      <div class="w-code">
        <div class="cgrid" style="--cols:${cols}">${map.map(r => [...r].map(c => `<i class="${c === '#' ? 'rock' : ''}">${c === '#' ? '🪨' : c === '*' ? '⭐' : ''}</i>`).join('')).join('')}<span class="bot">🤖</span></div>
        <div class="cside">
          <div class="prog" aria-label="程式"><span class="empty">程式是空的，按下面的箭頭加指令</span></div>
          <div class="cmds">${Object.entries(moves).map(([k, m]) => `<button class="option" data-cmd="${k}">${m[2]}</button>`).join('')}</div>
          <div class="cmds">
            <button class="option" data-act="back">⌫ 刪一個</button>
            <button class="option" data-act="clear">🗑️ 清空</button>
            <button class="go" data-act="run">▶ 執行</button>
          </div>
          <p class="readout">指令最多 12 個</p>
        </div>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const bot = $('.bot'), progEl = $('.prog');
    const prog = [];
    let running = false, solved = false;
    const putBot = (p, bump = false) => {
      bot.style.left = ((p.x + 0.5) / cols) * 100 + '%';
      bot.style.top = ((p.y + 0.5) / rows) * 100 + '%';
      if (bump) shake(bot);
    };
    const drawProg = (active = -1) => {
      progEl.innerHTML = prog.length
        ? prog.map((k, i) => `<span class="step-chip${i === active ? ' on' : ''}">${moves[k][2]}</span>`).join('')
        : '<span class="empty">程式是空的，按下面的箭頭加指令</span>';
    };
    host.querySelectorAll('[data-cmd]').forEach(b => {
      b.onclick = () => {
        if (running || prog.length >= 12) return;
        prog.push(b.dataset.cmd);
        drawProg();
      };
    });
    $('[data-act="back"]').onclick = () => { if (!running) { prog.pop(); drawProg(); } };
    $('[data-act="clear"]').onclick = () => { if (!running) { prog.length = 0; drawProg(); putBot(start); } };
    $('[data-act="run"]').onclick = () => {
      if (running || !prog.length) return;
      running = true;
      const p = { ...start };
      putBot(p);
      let i = 0;
      const step = () => {
        if (i >= prog.length) {
          running = false;
          drawProg();
          if (p.x === goal.x && p.y === goal.y) {
            $('.readout').textContent = solved ? '又成功了！' : '🎉 成功走到星星！你寫出了一個程式。';
            if (!solved) { solved = true; api.good(); api.done(); }
          } else {
            $('.readout').textContent = '還沒走到星星，再多加幾個指令';
            api.bad();
          }
          return;
        }
        drawProg(i);
        const [dx, dy] = moves[prog[i]];
        const nx = p.x + dx, ny = p.y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || map[ny][nx] === '#') {
          putBot(p, true);
          $('.readout').textContent = `🐞 第 ${i + 1} 個指令撞到了！這就是 bug，改一改再試。`;
          api.bad();
          running = false;
          api.later(() => putBot(start), 700);
          return;
        }
        p.x = nx;
        p.y = ny;
        putBot(p);
        i++;
        api.later(step, 380);
      };
      api.later(step, 250);
    };
    putBot(start);
  },

  // Drop a phone with or without a case and a screen protector.
  drop(host, _, api) {
    const outcomes = {
      '': { crack: 'screen', text: '💥 螢幕破了！玻璃很脆，一摔就可能裂開。' },
      case: { crack: 'screen', text: '邊角沒事，可是螢幕朝下撞到，還是裂了。' },
      film: { crack: 'film', dent: true, text: '保護貼裂了，螢幕沒事；可是邊角撞凹了一塊。' },
      'case film': { crack: 'film', text: '✅ 只有保護貼裂了一點，手機沒事！換保護貼比換螢幕便宜很多。' },
    };
    host.innerHTML = `
      <div class="w-drop">
        <div class="opts">
          <button class="option" data-o="case" aria-pressed="false">🛡️ 保護殼</button>
          <button class="option" data-o="film" aria-pressed="false">🩹 保護貼</button>
        </div>
        <div class="drop-stage">
          <div class="table"></div>
          <div class="dphone"><div class="dscreen"></div></div>
          <div class="floor"></div>
          <div class="dr-zoom" hidden>
            <p class="dr-say"></p>
            <div class="dr-phone"><div class="dr-screen"><span class="dr-ok">✨</span></div><div class="dr-film"></div><div class="dr-new"></div></div>
          </div>
        </div>
        <button class="go glow" data-act="drop">⬇️ 從桌上掉下去</button>
        <p class="result">選好保護裝備，再讓手機掉下去</p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const phone = $('.dphone'), zoom = $('.dr-zoom'), say = $('.dr-say');
    const on = { case: false, film: false };
    const tried = new Set();
    let busy = false;
    host.querySelectorAll('[data-o]').forEach(b => {
      b.onclick = () => {
        if (busy) return;
        on[b.dataset.o] = !on[b.dataset.o];
        b.classList.toggle('on', on[b.dataset.o]);
        b.setAttribute('aria-pressed', on[b.dataset.o]);
        phone.className = 'dphone' + (on.case ? ' has-case' : '') + (on.film ? ' has-film' : '');
      };
    });
    const pause = ms => new Promise(r => setTimeout(r, ms));
    // Close-up: peel off the cracked film, show the screen is fine, put on a new film.
    async function swapFilm() {
      const film = $('.dr-film'), fresh = $('.dr-new'), ok = $('.dr-ok');
      [film, fresh, ok].forEach(el => el.getAnimations().forEach(a => a.cancel()));
      zoom.hidden = false;
      say.textContent = '🔍 放大看看';
      await zoom.animate([{ opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1 }], { duration: 300, easing: 'ease-out' }).finished;
      await pause(700);
      if (!api.alive()) return;
      say.textContent = '撕掉破掉的保護貼…';
      await film.animate(
        [{ transform: 'none', opacity: 1 }, { transform: 'translate(10%, -6%) rotate(6deg)', opacity: 1, offset: 0.3 }, { transform: 'translate(85%, -40%) rotate(28deg)', opacity: 0 }],
        { duration: 1000, easing: 'ease-in', fill: 'forwards' }
      ).finished;
      if (!api.alive()) return;
      say.textContent = '螢幕本身沒事！';
      await ok.animate([{ opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.3, offset: 0.6 }, { opacity: 1, scale: 1 }], { duration: 600, fill: 'forwards' }).finished;
      await pause(600);
      if (!api.alive()) return;
      say.textContent = '貼上新的保護貼 ✅';
      await fresh.animate([{ transform: 'translateY(-115%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: 'ease-out', fill: 'forwards' }).finished;
      await pause(1200);
    }
    $('[data-act="drop"]').onclick = async () => {
      if (busy) return;
      busy = true;
      const key = ['case', 'film'].filter(k => on[k]).join(' ');
      const o = outcomes[key];
      phone.className = 'dphone' + (on.case ? ' has-case' : '') + (on.film ? ' has-film' : '');
      $('.result').textContent = '…';
      await phone.animate(
        [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(var(--fall)) rotate(80deg)', offset: 0.8 }, { transform: 'translateY(calc(var(--fall) - 14px)) rotate(84deg)', offset: 0.9 }, { transform: 'translateY(var(--fall)) rotate(90deg)' }],
        { duration: 700, easing: 'ease-in', fill: 'forwards' }
      ).finished;
      if (!api.alive()) return;
      phone.classList.add('crack-' + o.crack);
      if (o.dent) phone.classList.add('dent');
      key === 'case film' ? api.good() : api.bad();
      $('.result').textContent = o.text;
      tried.add(key);
      if (o.crack === 'film') await swapFilm();
      api.later(() => {
        phone.getAnimations().forEach(a => a.cancel());
        phone.className = 'dphone' + (on.case ? ' has-case' : '') + (on.film ? ' has-film' : '');
        zoom.hidden = true;
        busy = false;
        if (tried.has('case film') && tried.size >= 2) api.done();
        else if (!tried.has('case film')) $('.result').textContent += ' 換別的保護裝備再試一次！';
        else $('.result').textContent += ' 也試試沒有保護的時候會怎樣。';
      }, o.crack === 'film' ? 400 : 1600);
    };
  },

  // Tap a file and it flies into the folder.
  stash(host, _, api) {
    const files = [['📷', '照片'], ['🎬', '影片'], ['🎵', '歌曲'], ['📝', '作業']];
    host.innerHTML = `
      <div class="w-stash">
        <div class="sh-files">${files.map(([i, n]) => `<button class="sh-file"><b>${i}</b>${n}</button>`).join('')}</div>
        <span class="sh-arrow">⬇️</span>
        <button class="sh-folder" aria-label="資料夾"><b>📁</b><span>我的資料夾 <small class="en" lang="en">folder</small></span><em class="sh-count">0 個檔案</em></button>
        <ul class="sh-inside" hidden></ul>
        <p class="sh-hint">點一個檔案，把它放進資料夾</p>
      </div>`;
    const $ = s => host.querySelector(s);
    const folder = $('.sh-folder'), icon = folder.querySelector('b'), inside = $('.sh-inside');
    const kept = [];
    host.querySelectorAll('.sh-file').forEach(btn => {
      btn.onclick = async () => {
        if (btn.classList.contains('sh-gone')) return;
        btn.classList.add('sh-gone');
        const box = host.querySelector('.w-stash').getBoundingClientRect();
        const a = btn.getBoundingClientRect(), b = icon.getBoundingClientRect();
        const ghost = btn.cloneNode(true);
        ghost.classList.remove('sh-gone');
        ghost.classList.add('sh-fly');
        ghost.style.left = a.left - box.left + 'px';
        ghost.style.top = a.top - box.top + 'px';
        ghost.style.width = a.width + 'px';
        host.querySelector('.w-stash').append(ghost);
        const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
        icon.textContent = '📂';
        await ghost.animate(
          [
            { transform: 'none', opacity: 1 },
            { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 50}px) scale(.9)`, opacity: 1, offset: 0.5 },
            { transform: `translate(${dx}px, ${dy}px) scale(.25)`, opacity: 0.2 },
          ],
          { duration: 650, easing: 'ease-in-out' }
        ).finished;
        ghost.remove();
        if (!api.alive()) return;
        kept.push(btn.textContent);
        $('.sh-count').textContent = `${kept.length} 個檔案`;
        inside.innerHTML = kept.map(n => `<li>${n}</li>`).join('');
        pop(folder);
        api.good();
        api.later(() => { if (host.querySelectorAll('.sh-fly').length === 0) icon.textContent = '📁'; }, 300);
        if (kept.length === files.length) {
          $('.sh-hint').textContent = '全部放好了！點資料夾，看看裡面有什麼';
          api.done();
        }
      };
    });
    folder.onclick = () => {
      if (!kept.length) return;
      inside.hidden = !inside.hidden;
      icon.textContent = inside.hidden ? '📁' : '📂';
    };
  },

  // TLS in five animated steps between the browser and the website; tap 下一步 for each.
  tls(host, _, api) {
    // Each step: the caption, and what happens on the stage (`fly` moves a token along the
    // path; `left`/`right` show something beside one side; `mid` sits between them).
    const steps = [
      { say: '瀏覽器先打招呼：「你好，我想安全連線！」', fly: { text: '👋 你好！', dir: 'lr' } },
      { say: '網站拿出它的憑證，就像身分證，證明「我真的是這個網站」', fly: { text: '🪪 憑證', dir: 'rl' } },
      { say: '瀏覽器檢查憑證：是可以信任的機構發的，名字也對，是真的 ✅', left: '<span class="tl-card">🪪<b class="tl-mag">🔍</b><b class="tl-ok">✅</b></span>' },
      { say: '雙方用剛剛交換的資料，各自算出同一把祕密鑰匙。鑰匙本身不在路上傳！', left: '<span class="tl-key">🔑</span>', right: '<span class="tl-key">🔑</span>', mid: '<span class="tl-shake">🤝</span>' },
      { say: '之後的資料都用這把鑰匙鎖起來。中間有人偷看，也只看到亂碼！', loop: true, mid: '<span class="tl-spy">👀<small>？？？</small></span>' },
    ];
    host.innerHTML = `
      <div class="w-tls">
        <ol class="tl-dots">${steps.map((_, i) => `<li>${i + 1}</li>`).join('')}</ol>
        <div class="tl-stage">
          <div class="tl-side tl-me"><span>💻</span><b>瀏覽器</b><div class="tl-near"></div></div>
          <div class="tl-path"><div class="tl-mid"></div></div>
          <div class="tl-side tl-site"><span>🏦</span><b>網站</b><div class="tl-near"></div></div>
        </div>
        <p class="tl-say">按「開始」，看瀏覽器和網站怎麼握手</p>
        <button class="go glow" data-act="next">開始 ▶</button>
      </div>`;
    const $ = s => host.querySelector(s);
    const path = $('.tl-path'), next = $('[data-act="next"]');
    let k = -1, loopT = 0, run = 0;
    const near = side => host.querySelector(`.tl-${side} .tl-near`);
    // Send a token across the path; resolves when it lands.
    const fly = (text, dir, cls = '') => {
      const tok = document.createElement('span');
      tok.className = 'tl-tok ' + cls;
      tok.textContent = text;
      path.append(tok);
      const [a, b] = dir === 'lr' ? ['0%', '100%'] : ['100%', '0%'];
      return tok.animate([{ left: a, opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { left: b, opacity: 0 }],
        { duration: 1400, easing: 'ease-in-out' }).finished.then(() => tok.remove(), () => tok.remove());
    };
    function show() {
      const s = steps[k], my = ++run;
      clearTimeout(loopT);
      host.querySelectorAll('.tl-dots li').forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('done', i < k); });
      near('me').innerHTML = s.left || '';
      near('site').innerHTML = s.right || '';
      $('.tl-mid').innerHTML = s.mid || '';
      path.querySelectorAll('.tl-tok').forEach(t => t.remove());
      $('.tl-say').innerHTML = `<b>${k + 1}.</b> ${s.say}`;
      pop($('.tl-say'));
      if (s.fly) fly(s.fly.text, s.fly.dir);
      if (s.loop) {
        // Locked messages going both ways, again and again.
        const again = dir => {
          if (my !== run || !api.alive()) return;
          fly('🔒✉️', dir, 'tl-locked');
          loopT = setTimeout(() => again(dir === 'lr' ? 'rl' : 'lr'), 900);
        };
        again('lr');
      }
      const last = k === steps.length - 1;
      next.textContent = last ? '🔁 再看一次' : '下一步 ▶';
      next.classList.toggle('glow', !last);
      if (last) api.done();
    }
    next.onclick = () => {
      k = k === steps.length - 1 ? 0 : k + 1;
      show();
    };
  },

  // A small file manager: rename, move, delete, restore, and delete for good.
  files(host, _, api) {
    const tasks = [
      { id: 'rename', zh: '重新命名', en: 'rename' },
      { id: 'move', zh: '移到資料夾', en: 'move' },
      { id: 'delete', zh: '刪除', en: 'delete', alt: '會先放進「最近刪除」' },
      { id: 'restore', zh: '救回來', en: 'restore' },
      { id: 'forever', zh: '永久刪除', en: 'delete permanently', alt: '刪了就找不回來' },
    ];
    const items = [
      { id: 1, icon: '🐶', name: '小狗.jpg', loc: 'home' },
      { id: 2, icon: '🎂', name: '生日.jpg', loc: 'home' },
      { id: 3, icon: '📄', name: '作業.pages', loc: 'home' },
      { id: 4, icon: '🌊', name: '海邊.jpg', loc: 'home' },
    ];
    const places = { home: '🏠 我的檔案', trip: '📁 旅行', trash: '🗑️ 最近刪除' };
    host.innerHTML = `
      <div class="w-lab">
        <div class="fm">
          <div class="fm-side">${Object.entries(places).map(([k, v]) => `<button data-loc="${k}">${v}<b></b></button>`).join('')}</div>
          <div class="fm-main">
            <p class="fm-title"></p>
            <div class="fm-items"></div>
            <div class="fm-actions"></div>
          </div>
          <div class="dialog" hidden>
            <p>⚠️ 確定要<b>永久刪除</b>嗎？<br>刪掉以後，就再也找不回來了！</p>
            <div><button class="option" data-d="no">取消</button><button class="option danger" data-d="yes">永久刪除</button></div>
          </div>
          <div class="toast" hidden></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const toast = toaster($('.toast'), api);
    let view = 'home', sel = null, renaming = false;
    const draw = () => {
      host.querySelectorAll('[data-loc]').forEach(b => {
        b.classList.toggle('on', b.dataset.loc === view);
        const n = items.filter(i => i.loc === b.dataset.loc).length;
        b.querySelector('b').textContent = n ? ` ${n}` : '';
      });
      $('.fm-title').textContent = places[view] + (view === 'trash' ? '：30 天內還能救回來' : '');
      const here = items.filter(i => i.loc === view);
      $('.fm-items').innerHTML = here.length
        ? here.map(i => `<button class="file${i.id === sel ? ' sel' : ''}" data-id="${i.id}"><span>${i.icon}</span><small>${i.name}</small></button>`).join('')
        : '<p class="empty">這裡是空的</p>';
      const it = items.find(i => i.id === sel);
      let acts = '';
      if (it && renaming) {
        acts = `<input class="rename" value="${it.name.replace(/\.\w+$/, '')}" maxlength="12" aria-label="新的名字"><button class="option" data-a="ok">✔ 好了</button>`;
      } else if (it && view === 'trash') {
        acts = '<button class="option" data-a="restore">↩️ 復原</button><button class="option danger" data-a="forever">❌ 永久刪除</button>';
      } else if (it) {
        acts = `<button class="option" data-a="rename">✏️ 重新命名</button>${view === 'home' ? '<button class="option" data-a="move">📁 移到「旅行」</button>' : '<button class="option" data-a="moveback">🏠 移回我的檔案</button>'}<button class="option danger" data-a="delete">🗑️ 刪除</button>`;
      } else {
        acts = '<p class="empty">點一個檔案選取它</p>';
      }
      $('.fm-actions').innerHTML = acts;
      if (renaming) $('.rename')?.focus();
    };
    host.querySelector('.fm-side').addEventListener('click', e => {
      const b = e.target.closest('[data-loc]');
      if (!b) return;
      view = b.dataset.loc;
      sel = null;
      renaming = false;
      draw();
    });
    $('.fm-items').addEventListener('click', e => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      sel = +b.dataset.id === sel ? null : +b.dataset.id;
      renaming = false;
      draw();
    });
    $('.fm-actions').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const it = items.find(i => i.id === sel);
      const a = b.dataset.a;
      if (a === 'rename') { renaming = true; draw(); return; }
      if (a === 'ok') {
        const ext = it.name.match(/\.\w+$/)[0];
        const v = $('.rename').value.trim() || '新檔案';
        it.name = v + ext;
        renaming = false;
        check('rename');
      } else if (a === 'move') {
        it.loc = 'trip';
        sel = null;
        toast('移到「旅行」資料夾了');
        check('move');
      } else if (a === 'moveback') {
        it.loc = 'home';
        sel = null;
      } else if (a === 'delete') {
        it.from = it.loc;
        it.loc = 'trash';
        sel = null;
        toast('放進「最近刪除」了，還救得回來');
        check('delete');
      } else if (a === 'restore') {
        it.loc = it.from || 'home';
        sel = null;
        toast('救回來了！');
        check('restore');
      } else if (a === 'forever') {
        $('.dialog').hidden = false;
        return;
      }
      draw();
    });
    $('.dialog').addEventListener('click', e => {
      const b = e.target.closest('[data-d]');
      if (!b) return;
      $('.dialog').hidden = true;
      if (b.dataset.d === 'yes') {
        items.splice(items.findIndex(i => i.id === sel), 1);
        sel = null;
        toast('永遠消失了，再也找不回來');
        check('forever');
      }
      draw();
    });
    draw();
  },

  // A lock screen: unlock with a passcode or a face, then lock again.
  passcode(host, { code }, api) {
    const tasks = [
      { id: 'code', zh: '用密碼解鎖', en: 'passcode' },
      { id: 'lock', zh: '再鎖起來', en: 'lock' },
      { id: 'face', zh: '用臉解鎖', en: 'Face ID' },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="lockwrap">
          <div class="lockphone">
            <div class="lock-top"><span class="padlock">🔒</span><b>09:41</b></div>
            <div class="locked">
              <p class="lock-msg">輸入密碼</p>
              <div class="pdots">${'<i></i>'.repeat(code.length)}</div>
              <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button data-k="${k}">${k}</button>`).join('')}</div>
            </div>
            <div class="unlocked" hidden>
              <div class="apps">${['📷', '🖼️', '💬', '🎵', '🗺️', '🧮', '📚', '⚙️'].map(i => `<span>${i}</span>`).join('')}</div>
              <button class="option" data-act="lock">🔒 鎖定螢幕</button>
            </div>
            <div class="scan" hidden><span>🙂</span></div>
          </div>
          <button class="option" data-act="face">🙂 用 Face ID 看一下螢幕</button>
          <p class="hint">這台的密碼是 <b>${code}</b>（偷偷告訴你）</p>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    let typed = '', open = false, wrong = 0;
    const setOpen = v => {
      open = v;
      $('.locked').hidden = v;
      $('.unlocked').hidden = !v;
      $('.padlock').textContent = v ? '🔓' : '🔒';
      typed = '';
      drawDots();
    };
    const drawDots = () => host.querySelectorAll('.pdots i').forEach((d, i) => d.classList.toggle('on', i < typed.length));
    $('.keypad').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (!b || open) return;
      const k = b.dataset.k;
      if (k === '⌫') { typed = typed.slice(0, -1); drawDots(); return; }
      typed += k;
      drawDots();
      if (typed.length < code.length) return;
      if (typed === code) {
        wrong = 0;
        $('.lock-msg').textContent = '輸入密碼';
        setOpen(true);
        check('code');
      } else {
        wrong++;
        shake($('.pdots'));
        api.bad();
        $('.lock-msg').textContent = wrong >= 3 ? '錯太多次，真的手機會鎖住一段時間！' : '密碼錯了，再試一次';
        typed = '';
        api.later(drawDots, 300);
      }
    });
    $('[data-act="lock"]').onclick = () => { setOpen(false); check('lock'); };
    $('[data-act="face"]').onclick = () => {
      if (open) { $('.lock-msg').textContent = '已經打開了，先鎖起來再試'; setOpen(false); return; }
      $('.scan').hidden = false;
      api.later(() => {
        $('.scan').hidden = true;
        setOpen(true);
        check('face', '看你的臉形，別人的臉打不開');
      }, 1100);
    };
  },

  // Sign up with a user name and a strong password, then log in with the same ones.
  account(host, _, api) {
    const names = ['王小明0512', '小熊熊', '大安國小林小美', '星星王', '飛天貓'];
    // Names that give away who you are: others can see a user name, so these are not allowed.
    const risky = {
      '王小明0512': '這個名稱有真的名字和生日（5 月 12 日）',
      '大安國小林小美': '這個名稱有學校和真的名字',
    };
    const tiles = ['cat', 'Moon', 'run', '7', '42', '!', '#'];
    host.innerHTML = `
      <div class="w-account">
        <div class="form">
          <p class="form-title">📝 註冊新帳號</p>
          <p class="lbl">使用者名稱 ${en('user name')}</p>
          <div class="names">${names.map(n => `<button class="option" data-n="${n}">${n}</button>`).join('')}</div>
          <p class="acc-warn" hidden></p>
          <p class="acc-tip">💡 使用者名稱別人看得到，用暱稱就好</p>
          <p class="lbl">密碼 ${en('password')} <button class="eye-btn" aria-label="顯示或隱藏密碼">👁️</button></p>
          <div class="pw"><span class="pw-text"></span><button class="option" data-act="del">⌫</button></div>
          <div class="tiles">${tiles.map(t => `<button class="option" data-t="${t}">${t}</button>`).join('')}</div>
          <div class="meter"><i></i><span></span></div>
          <button class="go" data-act="submit" disabled>註冊</button>
          <p class="msg"></p>
        </div>
      </div>`;
    const $ = sel => host.querySelector(sel);
    let stage = 'signup', name = null, pw = [], saved = null, show = false;
    const strength = list => {
      const t = list.join('');
      let k = 0;
      if (t.length >= 8) k++;
      if (t.length >= 11) k++;
      if (/[a-z]/.test(t) && /[A-Z]/.test(t)) k++;
      if (/\d/.test(t)) k++;
      if (/[^a-zA-Z0-9]/.test(t)) k++;
      return k;
    };
    const draw = () => {
      host.querySelectorAll('[data-n]').forEach(b => b.classList.toggle('on', b.dataset.n === name));
      const t = pw.join('');
      $('.pw-text').textContent = t ? (show ? t : '•'.repeat(t.length)) : '點下面的方塊組出密碼';
      const k = strength(pw);
      const labels = ['太弱', '太弱', '普通', '還可以', '強', '很強'];
      $('.meter i').style.width = (k / 5) * 100 + '%';
      $('.meter').dataset.k = k;
      $('.meter span').textContent = stage === 'signup' ? `密碼強度：${labels[k]}` : '';
      $('.meter').hidden = stage !== 'signup';
      $('[data-act="submit"]').disabled = !name || !pw.length || (stage === 'signup' && k < 4);
    };
    host.querySelector('.names').addEventListener('click', e => {
      const b = e.target.closest('[data-n]');
      if (!b) return;
      const why = risky[b.dataset.n];
      $('.acc-warn').hidden = !why;
      if (why) {
        $('.acc-warn').innerHTML = `⚠️ ${why}。別人看到就知道你是誰、在哪裡上學。換一個不會透露個人資料${en('personal info')}的暱稱吧！`;
        pop($('.acc-warn'));
        shake(b);
        api.bad();
        name = null;
      } else {
        name = b.dataset.n;
      }
      draw();
    });
    host.querySelector('.tiles').addEventListener('click', e => {
      const b = e.target.closest('[data-t]');
      if (b && pw.length < 8) { pw.push(b.dataset.t); draw(); }
    });
    $('[data-act="del"]').onclick = () => { pw.pop(); draw(); };
    $('.eye-btn').onclick = () => { show = !show; draw(); };
    $('[data-act="submit"]').onclick = () => {
      if (stage === 'signup') {
        saved = { name, pw: pw.join('') };
        stage = 'login';
        name = null;
        pw = [];
        show = false;
        $('.form-title').textContent = '🔑 登入';
        $('[data-act="submit"]').textContent = '登入';
        $('.msg').textContent = `✅ 帳號「${saved.name}」建立好了！現在用同一組名稱和密碼登入看看。`;
        api.good();
      } else if (stage === 'login') {
        if (name === saved.name && pw.join('') === saved.pw) {
          stage = 'done';
          $('.form-title').textContent = `👋 歡迎回來，${saved.name}！`;
          $('.msg').textContent = '🎉 登入成功！名稱和密碼要一模一樣，電腦才認得你。';
          $('[data-act="submit"]').hidden = true;
          api.good();
          api.done();
        } else {
          shake($('.form'));
          api.bad();
          $('.msg').textContent = '❌ 帳號或密碼錯誤。要和註冊時一模一樣喔！';
          pw = [];
        }
      }
      draw();
    };
    draw();
  },

  // Download the same file at three speeds and compare the time.
  speed(host, { sizeMB }, api) {
    const speeds = [
      { mbps: 1, where: '訊號很差的時候' },
      { mbps: 10, where: '一般的行動網路' },
      { mbps: 100, where: '家裡的光纖網路' },
    ];
    host.innerHTML = `
      <div class="w-speed">
        <div class="speeds">${speeds.map((v, i) => `<button class="option" data-i="${i}"><b>${v.mbps} Mbps</b><small>${v.where}</small></button>`).join('')}</div>
        <div class="dl-card"><span class="dl-icon">🎬</span><div class="dl-body"><b>影片．${sizeMB} MB</b><div class="dl-bar"><i></i></div><small class="dl-text">選一種網速開始下載</small></div></div>
        <p class="readout"></p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const btns = [...host.querySelectorAll('[data-i]')];
    const tried = new Set();
    const lines = [];
    const fmt = sec => (sec >= 60 ? `${Math.floor(sec / 60)} 分 ${Math.round(sec % 60)} 秒` : `${Math.round(sec)} 秒`);
    btns.forEach(b => {
      b.onclick = () => {
        const v = speeds[b.dataset.i];
        const secs = (sizeMB * 8) / v.mbps; // MB → megabits, then divide by megabits per second
        const real = Math.min(4000, 400 + secs * 9);
        btns.forEach(x => (x.disabled = true));
        const t0 = performance.now();
        const tick = () => {
          const k = Math.min(1, (performance.now() - t0) / real);
          $('.dl-bar i').style.width = k * 100 + '%';
          $('.dl-text').textContent = `已下載 ${Math.round(k * sizeMB)} MB．經過 ${fmt(k * secs)}（模擬）`;
          if (k < 1) { api.later(tick, 50); return; }
          btns.forEach(x => (x.disabled = false));
          tried.add(v.mbps);
          lines.push(`${v.mbps} Mbps：大約 ${fmt(secs)}`);
          $('.readout').innerHTML = lines.join('<br>') + (tried.size >= 2 ? '<br>💡 網速快 10 倍，等待的時間就少 10 倍。' : '<br>再換一種網速試試看！');
          api.good();
          if (tried.size >= 2) api.done();
        };
        tick();
      };
    });
  },

  // Select one, unselect, select a range (Shift), select some (⌘ / Ctrl), select all.
  select(host, _, api) {
    const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    const jumpKey = mac ? '⌘ Command' : 'Ctrl';
    const tasks = [
      { id: 'one', zh: '選取一個', en: 'select', alt: '點一下' },
      { id: 'none', zh: '取消選取', en: 'deselect', alt: '再點一下，或點空白的地方' },
      { id: 'range', zh: '連續選取', en: 'range select', alt: '點第一個，按住 Shift 再點最後一個' },
      { id: 'jump', zh: '跳著選取', en: 'multi-select', alt: `按住 ${jumpKey}，一個一個點` },
      { id: 'all', zh: '全選', en: 'select all', alt: mac ? '⌘ + A' : 'Ctrl + A' },
    ];
    const pics = ['🐶', '🐱', '🐰', '🦊', '🐼', '🐨', '🐯', '🐸'];
    host.innerHTML = `
      <div class="w-lab">
        <div class="selbox">
          <div class="mods">
            <button class="option" data-mod="shift">⇧ Shift：連續</button>
            <button class="option" data-mod="jump">${jumpKey}：跳著選</button>
            <button class="option" data-act="all">全選</button>
          </div>
          <div class="tiles-grid">${pics.map((p, i) => `<button class="tile" data-i="${i}"><span>${p}</span><i></i></button>`).join('')}</div>
          <p class="selcount">還沒選取</p>
          <p class="hint">用滑鼠的話直接按住鍵盤的 Shift 或 ${jumpKey}；用平板就先點上面的按鈕</p>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const sel = new Set();
    let anchor = null, mod = null;
    const draw = () => {
      host.querySelectorAll('.tile').forEach(t => t.classList.toggle('on', sel.has(+t.dataset.i)));
      host.querySelectorAll('[data-mod]').forEach(b => b.classList.toggle('on', b.dataset.mod === mod));
      $('.selcount').textContent = sel.size ? `已選取 ${sel.size} 個` : '還沒選取';
    };
    const gap = () => {
      const a = [...sel].sort((x, y) => x - y);
      return a.some((v, i) => i && v - a[i - 1] > 1);
    };
    const selectAll = () => { pics.forEach((_, i) => sel.add(i)); draw(); check('all'); };
    host.querySelector('.tiles-grid').addEventListener('click', e => {
      const t = e.target.closest('.tile');
      if (!t) { if (sel.size) { sel.clear(); check('none'); draw(); } return; }
      const i = +t.dataset.i;
      const shift = e.shiftKey || mod === 'shift';
      const jump = e.metaKey || e.ctrlKey || mod === 'jump';
      if (shift && anchor !== null) {
        sel.clear();
        for (let k = Math.min(anchor, i); k <= Math.max(anchor, i); k++) sel.add(k);
        if (sel.size >= 3) check('range');
      } else if (jump) {
        sel.has(i) ? sel.delete(i) : sel.add(i);
        anchor = i;
        if (sel.size >= 2 && gap()) check('jump');
      } else if (sel.size === 1 && sel.has(i)) {
        sel.clear();
        check('none');
      } else {
        sel.clear();
        sel.add(i);
        anchor = i;
        check('one');
      }
      draw();
    });
    host.querySelector('.mods').addEventListener('click', e => {
      const b = e.target.closest('[data-mod]');
      if (b) { mod = mod === b.dataset.mod ? null : b.dataset.mod; draw(); }
      if (e.target.closest('[data-act="all"]')) selectAll();
    });
    const onKey = e => {
      if (!api.alive()) { window.removeEventListener('keydown', onKey); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); selectAll(); }
    };
    window.addEventListener('keydown', onKey);
    draw();
  },

  // Make folders, drag files into them, and open one to see its path.
  folders(host, _, api) {
    const tasks = [
      { id: 'create', zh: '新增資料夾', en: 'new folder', alt: '做出「學校」和「照片」' },
      { id: 'sort', zh: '把檔案放進資料夾', en: 'organize' },
      { id: 'open', zh: '打開資料夾看路徑', en: 'path' },
    ];
    const names = ['學校', '照片', '音樂'];
    const files = [
      { icon: '📄', name: '數學作業', to: '學校' },
      { icon: '📄', name: '國語作業', to: '學校' },
      { icon: '🐶', name: '小狗.jpg', to: '照片' },
      { icon: '🎂', name: '生日.jpg', to: '照片' },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="fold-box">
          <div class="crumbs"></div>
          <div class="fold-tools"><button class="option" data-act="new">＋ 新增資料夾</button><span class="name-pick" hidden>取名字：${names.map(n => `<button class="option" data-name="${n}">${n}</button>`).join('')}</span></div>
          <div class="fold-area"></div>
          <div class="tree"></div>
          <div class="toast" hidden></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const toast = toaster($('.toast'), api);
    const made = [];
    const inside = {};
    let view = null, picked = null; // picked: a file chosen by tap, waiting for a folder tap
    // Put a file into a folder (by drag or by tap-then-tap); a wrong folder shakes the chip.
    const placeInto = (f, name, chip) => {
      if (name !== f.to) { shake(chip); api.bad(); toast(made.includes(f.to) ? `「${f.name}」應該放進「${f.to}」` : `先新增一個「${f.to}」資料夾`); return; }
      f.placed = true;
      picked = null;
      (inside[f.to] ||= []).push(f);
      api.good();
      if (files.every(x => x.placed)) check('sort');
      draw();
    };
    const draw = () => {
      $('.crumbs').innerHTML = `<button data-go="root">🏠 我的檔案</button>${view ? ` › <b>📁 ${view}</b>` : ''}`;
      const area = $('.fold-area');
      area.innerHTML = '';
      if (view) {
        area.append(h('<button class="option up" data-go="root">⬅ 上一層</button>'));
        const list = inside[view] || [];
        if (!list.length) area.append(h('<p class="empty">這個資料夾是空的</p>'));
        list.forEach(f => area.append(h(`<div class="file-chip"><span>${f.icon}</span>${f.name}</div>`)));
      } else {
        made.forEach(n => area.append(h(`<button class="fold" data-zone="${n}" data-open="${n}"><span>📁</span>${n}<small>${(inside[n] || []).length} 個</small></button>`)));
        files.filter(f => !f.placed).forEach(f => {
          const chip = h(`<button class="chip${picked === f ? ' selected' : ''}"><span class="chip-icon">${f.icon}</span><span>${f.name}</span></button>`);
          chip.file = f;
          drag(chip, {
            onDrop: zone => { if (zone) placeInto(f, zone.dataset.zone, chip); },
            onTap: () => {
              picked = picked === f ? null : f;
              area.querySelectorAll('.chip').forEach(c => c.classList.toggle('selected', c.file === picked));
              if (picked) toast(made.length ? '再點要放進去的資料夾' : `先新增一個「${f.to}」資料夾`);
            },
          });
          area.append(chip);
        });
      }
      $('.tree').innerHTML = `<p>資料夾的樹狀結構：</p><ul><li>📁 我的檔案<ul>${made.map(n => `<li>📁 ${n}${(inside[n] || []).length ? `<ul>${inside[n].map(f => `<li>${f.icon} ${f.name}</li>`).join('')}</ul>` : ''}</li>`).join('')}${files.filter(f => !f.placed).map(f => `<li>${f.icon} ${f.name}</li>`).join('')}</ul></li></ul>`;
    };
    host.addEventListener('click', e => {
      const go = e.target.closest('[data-go]');
      if (go) { view = null; draw(); return; }
      const open = e.target.closest('[data-open]');
      if (open && picked) {
        const chip = [...host.querySelectorAll('.fold-area .chip')].find(c => c.file === picked);
        placeInto(picked, open.dataset.open, chip);
        return;
      }
      if (open && !open.classList.contains('dragging')) {
        view = open.dataset.open;
        draw();
        check('open', `路徑：我的檔案 › ${view}`);
        return;
      }
      if (e.target.closest('[data-act="new"]')) { $('.name-pick').hidden = !$('.name-pick').hidden; return; }
      const nm = e.target.closest('[data-name]');
      if (nm) {
        const n = nm.dataset.name;
        $('.name-pick').hidden = true;
        if (made.includes(n)) { toast(`已經有「${n}」了`); return; }
        made.push(n);
        view = null;
        if (made.includes('學校') && made.includes('照片')) check('create');
        draw();
      }
    });
    draw();
  },

  // Copy, cut and paste words between two notes through the clipboard.
  clipboard(host, _, api) {
    const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    const k = mac ? '⌘' : 'Ctrl+';
    const tasks = [
      { id: 'copy', zh: '拷貝，再貼上', en: 'copy & paste', alt: '原本的還在' },
      { id: 'cut', zh: '剪下，再貼上', en: 'cut & paste', alt: '原本的被搬走了' },
    ];
    const start = ['小狗', '很', '可愛', '！'];
    host.innerHTML = `
      <div class="w-lab">
        <div class="clip-box">
          <div class="cnote"><p class="note-title">📝 筆記 A（點字選取）</p><div class="wordrow a"></div></div>
          <div class="clip-bar">
            <button class="option" data-act="copy">📄 拷貝 ${k}C</button>
            <button class="option" data-act="cut">✂️ 剪下 ${k}X</button>
            <button class="option" data-act="paste">📋 貼到 B ${k}V</button>
            <button class="option" data-act="reset">↺ 重來</button>
          </div>
          <p class="clip">📋 剪貼簿：<b>（空的）</b></p>
          <div class="cnote"><p class="note-title">📝 筆記 B</p><div class="wordrow b"></div></div>
          <p class="hint">檔案也一樣：拷貝會變成兩份，剪下再貼上就是搬家。</p>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    let a = start.map(w => ({ w, on: false })), b = [], clip = null;
    const draw = () => {
      $('.wordrow.a').innerHTML = a.length ? a.map((x, i) => `<button class="wd${x.on ? ' on' : ''}" data-i="${i}">${x.w}</button>`).join('') : '<span class="empty">（空的）</span>';
      $('.wordrow.b').innerHTML = b.length ? b.map(w => `<span class="wd">${w}</span>`).join('') : '<span class="empty">（空的）</span>';
      $('.clip b').textContent = clip ? `「${clip.text}」（${clip.mode === 'copy' ? '拷貝' : '剪下'}）` : '（空的）';
    };
    const picked = () => a.filter(x => x.on);
    const act = name => {
      if (name === 'reset') { a = start.map(w => ({ w, on: false })); b = []; clip = null; draw(); return; }
      if (name === 'copy' || name === 'cut') {
        const p = picked();
        if (!p.length) { shake($('.wordrow.a')); api.bad(); return; }
        clip = { text: p.map(x => x.w).join(''), mode: name };
        if (name === 'cut') a = a.filter(x => !x.on);
        a.forEach(x => (x.on = false));
        pop($('.clip'));
      } else if (name === 'paste') {
        if (!clip) { shake($('.clip')); api.bad(); return; }
        b.push(clip.text);
        check(clip.mode, clip.mode === 'copy' ? '原本的還在 A 裡' : '原本的從 A 搬走了');
      }
      draw();
    };
    $('.wordrow.a').addEventListener('click', e => {
      const w = e.target.closest('[data-i]');
      if (w) { a[w.dataset.i].on = !a[w.dataset.i].on; draw(); }
    });
    $('.clip-bar').addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (btn) act(btn.dataset.act);
    });
    const onKey = e => {
      if (!api.alive()) { window.removeEventListener('keydown', onKey); return; }
      if (!(e.metaKey || e.ctrlKey)) return;
      const m = { c: 'copy', x: 'cut', v: 'paste' }[e.key.toLowerCase()];
      if (m) { e.preventDefault(); act(m); }
    };
    window.addEventListener('keydown', onKey);
    draw();
  },

  // What drains the battery: change the settings and watch the hours left.
  battery(host, _, api) {
    const opts = [
      { id: 'bright', zh: '螢幕亮度', en: 'brightness', choices: [['暗', 1], ['亮', 3]] },
      { id: 'task', zh: '正在做什麼', en: 'activity', choices: [['看書', 0], ['看影片', 2], ['玩遊戲', 4]] },
      { id: 'signal', zh: '網路訊號', en: 'signal', choices: [['很好', 0], ['很差', 1.5]] },
      { id: 'gps', zh: '定位', en: 'location', choices: [['關', 0], ['開', 1]] },
      { id: 'low', zh: '低耗電模式', en: 'Low Power Mode', choices: [['關', 1], ['開', 0.8]] },
    ];
    const tasks = [
      { id: 'worst', zh: '調成最耗電', en: 'drain fast', alt: '電池撐不到 2.5 小時' },
      { id: 'best', zh: '調成最省電', en: 'save power', alt: '電池撐 10 小時以上' },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="bat-box">
          ${opts.map(o => `
            <div class="bat-row" data-o="${o.id}"><span class="bat-lbl">${o.zh}${en(o.en)}</span>
              <span class="seg">${o.choices.map(([t], i) => `<button data-c="${i}">${t}</button>`).join('')}</span></div>`).join('')}
          <div class="bat-out">
            <div class="drain"><i></i></div>
            <p class="hours"></p>
          </div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const pick = { bright: 1, task: 1, signal: 0, gps: 0, low: 0 };
    const draw = () => {
      host.querySelectorAll('.bat-row').forEach(r => r.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', +b.dataset.c === pick[r.dataset.o])));
      const v = id => opts.find(o => o.id === id).choices[pick[id]][1];
      // made-up but proportional units: a base load plus each part, Low Power Mode trims 20%
      const use = (1 + v('bright') + v('task') + v('signal') + v('gps')) * v('low');
      const hours = 20 / use;
      $('.drain i').style.width = Math.min(100, (use / 10.5) * 100) + '%';
      $('.drain').dataset.level = use > 6 ? 'high' : use > 3 ? 'mid' : 'low';
      $('.hours').innerHTML = `🔋 充滿電大約可以用 <b>${hours.toFixed(1)}</b> 小時（模擬）`;
      if (hours < 2.5) check('worst');
      if (hours >= 10) check('best');
    };
    host.querySelector('.bat-box').addEventListener('click', e => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      pick[b.closest('.bat-row').dataset.o] = +b.dataset.c;
      draw();
    });
    draw();
  },

  // GPS: each satellite tells how far away you are; three circles meet where you stand.
  gps(host, _, api) {
    const me = [210, 175];
    const sats = [[60, 40], [345, 55], [215, 22]];
    const dist = ([x, y]) => Math.hypot(x - me[0], y - me[1]);
    // A map-app view that fades in once the position is known.
    const mapView = `
      <svg class="gps-map" viewBox="0 0 400 260" aria-hidden="true">
        <rect width="400" height="260" fill="#f2efe6"/>
        <rect x="18" y="18" width="110" height="80" rx="8" fill="#c3e8c8"/>
        <path d="M-10 214C70 196 120 236 200 222S330 190 410 204" fill="none" stroke="#a5d8ff" stroke-width="16"/>
        <g fill="#e6e0d2"><rect x="150" y="20" width="80" height="56" rx="4"/><rect x="250" y="20" width="130" height="56" rx="4"/>
          <rect x="18" y="122" width="110" height="60" rx="4"/><rect x="250" y="100" width="130" height="80" rx="4"/></g>
        <g fill="none" stroke-linecap="round"><path d="M0 110H400M140 0V260M240 0V260" stroke="#d6cfbd" stroke-width="16"/>
          <path d="M0 110H400M140 0V260M240 0V260" stroke="#fff" stroke-width="12"/>
        <text x="72" y="62" font-size="26" text-anchor="middle">🌳</text><text x="190" y="56" font-size="24" text-anchor="middle">🏫</text>
        <text x="315" y="56" font-size="24" text-anchor="middle">🏪</text><text x="73" y="160" font-size="24" text-anchor="middle">🏠</text>
        <text x="315" y="148" font-size="24" text-anchor="middle">🏥</text>
        <g font-size="11" font-weight="700" fill="#5c5f66" text-anchor="middle"><text x="190" y="72">學校</text><text x="315" y="72">商店</text><text x="72" y="92">公園</text></g>
        <circle class="gps-acc" cx="${me[0]}" cy="${me[1]}" r="22"/>
        <circle cx="${me[0]}" cy="${me[1]}" r="8" fill="#1c7ed6" stroke="#fff" stroke-width="3"/>
      </svg>`;
    host.innerHTML = `
      <div class="w-gps">
        <div class="sky2">
          ${mapView}
          <svg viewBox="0 0 400 260" aria-hidden="true">${sats.map((p, i) => `<circle class="orbit r${i}" cx="${p[0]}" cy="${p[1]}" r="${dist(p)}"/>`).join('')}</svg>
          ${sats.map((p, i) => `<button class="sat" data-i="${i}" style="left:${p[0] / 4}%;top:${(p[1] / 260) * 100}%">🛰️</button>`).join('')}
          <span class="gps-me" style="left:${me[0] / 4}%;top:${(me[1] / 260) * 100}%">❓</span>
        </div>
        <p class="readout">點衛星，接收它的訊號</p>
      </div>`;
    const got = new Set();
    host.querySelectorAll('.sat').forEach(b => {
      b.onclick = () => {
        const i = +b.dataset.i;
        if (got.has(i)) return;
        got.add(i);
        b.classList.add('on');
        host.querySelector(`.orbit.r${i}`).classList.add('show');
        api.good();
        const r = host.querySelector('.readout');
        if (got.size === 1) r.textContent = '收到 1 顆：你在這個圓圈上的某個地方';
        else if (got.size === 2) r.textContent = '收到 2 顆：兩個圓圈交叉的地方，還有兩個可能';
        else {
          const m = host.querySelector('.gps-me');
          m.textContent = '📍';
          pop(m);
          host.querySelector('.sky2').classList.add('located');
          r.textContent = '🎉 收到 3 顆：三個圓圈只交在一點，就是你在的地方！地圖 App 就把你標在地圖上。';
          api.done();
        }
      };
    });
  },

  // Control Center: airplane mode turns the radios off; Wi-Fi and Bluetooth can come back.
  radios(host, _, api) {
    const tasks = [
      { id: 'air', zh: '打開飛航模式', en: 'airplane mode' },
      { id: 'wifi', zh: '在飛航模式下打開 Wi-Fi', en: 'in-flight Wi-Fi' },
      { id: 'bt', zh: '再打開藍牙聽耳機', en: 'Bluetooth' },
    ];
    const st = { air: false, cell: true, wifi: true, bt: true };
    const tiles = [
      ['air', '✈️', '飛航模式'],
      ['cell', '📶', '行動網路'],
      ['wifi', '🛜', 'Wi-Fi'],
      ['bt', '🔵', '藍牙'],
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="cc-box">
          <div class="cc">${tiles.map(([k, i, n]) => `<button class="cc-tile" data-k="${k}"><span>${i}</span><small>${n}</small></button>`).join('')}</div>
          <ul class="can"></ul>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const draw = () => {
      host.querySelectorAll('.cc-tile').forEach(b => {
        b.classList.toggle('on', st[b.dataset.k]);
        b.disabled = b.dataset.k === 'cell' && st.air;
      });
      const row = (ok, icon, yes, no) => `<li class="${ok ? 'ok' : 'no'}">${icon} ${ok ? yes : no}</li>`;
      $('.can').innerHTML =
        row(st.wifi || st.cell, '🌐', '可以上網', '不能上網') +
        row(st.cell, '📞', '可以打電話', '收不到電話') +
        row(st.bt, '🎧', '耳機連著', '耳機斷了') +
        '<li class="ok">📍 GPS 還能定位：它只接收衛星訊號，不會發出訊號</li>';
    };
    host.querySelector('.cc').addEventListener('click', e => {
      const b = e.target.closest('[data-k]');
      if (!b || b.disabled) return;
      const k = b.dataset.k;
      if (k === 'air') {
        st.air = !st.air;
        st.cell = st.wifi = st.bt = !st.air;
        if (st.air) check('air', '電話、網路和藍牙全部關掉了');
      } else {
        st[k] = !st[k];
        if (st.air && st.wifi) check('wifi');
        if (st.air && st.bt) check('bt');
      }
      draw();
    });
    draw();
  },

  // Share the phone's mobile data as a small Wi-Fi so a tablet can get online.
  hotspot(host, _, api) {
    const pw = 'panda123';
    host.innerHTML = `
      <div class="w-hot">
        <p class="step">① 在手機上打開「個人熱點」</p>
        <div class="hot-row">
          <div class="hdev hphone">
            <span class="hicon">📱</span><b>小明的手機</b><small>📶 行動網路 4G</small>
            <span class="hbat" aria-label="手機電量"><span class="hbat-cell"><i></i></span><b>80%</b><em class="hbat-fast" hidden>⚡ 耗電變快</em></span>
            <button class="option" data-act="on">個人熱點：關</button>
            <small class="hpw" hidden>熱點密碼：<b>${pw}</b></small>
          </div>
          <div class="beam" aria-hidden="true"></div>
          <div class="hdev htab">
            <span class="hicon">📲</span><b>平板</b><small>沒有 SIM 卡，只能用 Wi-Fi</small>
            <div class="nets" hidden><small>Wi-Fi 網路：</small><button class="option" data-act="pick">🛜 小明的手機 🔒</button></div>
            <div class="pwpick" hidden><small>輸入密碼：</small>${[pw, '12345678', 'iphone'].sort().map(p => `<button class="option" data-pw="${p}">${p}</button>`).join('')}</div>
            <span class="pill off">離線 offline</span>
          </div>
        </div>
        <p class="usage"></p>
      </div>`;
    const $ = sel => host.querySelector(sel);
    let on = false, linked = false, mb = 0, bat = 80, drainT = 0;
    // The phone's battery: sharing costs a little, a tablet streaming through it costs a lot.
    const showBat = () => {
      const cell = $('.hbat-cell i');
      cell.style.width = bat + '%';
      cell.style.background = bat <= 20 ? '#e03131' : bat <= 50 ? '#f59f00' : '#40c057';
      $('.hbat b').textContent = bat + '%';
    };
    const drain = () => {
      if (!on || mb >= 700 || bat <= 15) return;
      bat--;
      showBat();
      pop($('.hbat b'));
      drainT = api.later(drain, linked ? 450 : 3000);
    };
    const step = t => { $('.step').textContent = t; };
    $('[data-act="on"]').onclick = () => {
      if (on) return;
      on = true;
      $('[data-act="on"]').textContent = '個人熱點：開';
      $('[data-act="on"]').classList.add('on');
      $('.hpw').hidden = false;
      $('.nets').hidden = false;
      $('.w-hot').classList.add('sharing');
      api.good();
      drainT = api.later(drain, 3000);
      step('② 在平板的 Wi-Fi 清單裡，點「小明的手機」');
    };
    $('[data-act="pick"]').onclick = () => {
      $('.pwpick').hidden = false;
      step('③ 輸入手機上顯示的熱點密碼');
    };
    $('.pwpick').addEventListener('click', e => {
      const b = e.target.closest('[data-pw]');
      if (!b || linked) return;
      if (b.dataset.pw !== pw) { shake(b); api.bad(); step('密碼不對，看看手機上寫的熱點密碼'); return; }
      linked = true;
      $('.pwpick').hidden = true;
      $('.htab .pill').className = 'pill on';
      $('.htab .pill').textContent = '上線 online';
      $('.w-hot').classList.add('linked');
      $('.hbat-fast').hidden = false;
      $('.hbat').classList.add('fast');
      clearTimeout(drainT);
      drain();
      step('🎉 平板上網了！它借用的是手機的行動網路。');
      api.good();
      api.done();
      const tick = () => {
        mb += 7;
        $('.usage').textContent = `平板看影片中…手機已用掉 ${mb} MB 流量，電也掉得比較快`;
        if (mb < 700) api.later(tick, 120);
        else $('.usage').textContent = `手機已用掉 700 MB 流量，電量也掉到 ${bat}%！行動網路通常每個月有用量限制，用完要記得關掉熱點。`;
      };
      tick();
    });
    showBat();
  },

  // An inbox: mark each message as normal or suspicious; the clue shows after a right answer.
  // A <mark> in a message is a clue: plain at first, highlighted once the card is judged.
  inbox(host, { messages, labels = ['👍 正常', '🚩 可疑'] }, api) {
    host.innerHTML = `
      <div class="w-inbox">
        <p class="ib-left"></p>
        <div class="msgs">${messages.map((m, i) => `
          <div class="msg-card" data-i="${i}">
            <p class="from">${m.from}</p>
            <p class="body">${m.text}</p>
            <div class="ib-btns"><button class="option" data-v="ok">${labels[0]}</button><button class="option" data-v="scam">${labels[1]}</button></div>
            <p class="why" hidden>${m.why}</p>
          </div>`).join('')}</div>
      </div>`;
    let left = messages.length;
    const count = () => { host.querySelector('.ib-left').textContent = left ? `還有 ${left} 則要判斷` : '🎉 全部判斷完了！'; };
    host.querySelector('.msgs').addEventListener('click', e => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      const card = b.closest('.msg-card');
      if (card.classList.contains('judged')) return;
      const m = messages[card.dataset.i];
      if ((b.dataset.v === 'scam') !== !!m.scam) { shake(card); api.bad(); return; }
      card.classList.add('judged', m.scam ? 'is-scam' : 'is-ok');
      card.querySelector('.why').hidden = false;
      api.good();
      left--;
      count();
      if (!left) api.done();
    });
    count();
  },

  // Tap each flaw in a drawn AI picture. A found flaw gets a red ring and fills its
  // chip below; a tap anywhere else only says to look again.
  spotfake(host, _, api) {
    const clues = [
      { x: 352, y: 124, r: 40, icon: '✋', label: '手有 6 根手指' },
      { x: 48, y: 112, w: 164, h: 50, icon: '🔤', label: '招牌的字怪怪的，「包」還是反的' },
      { x: 185, y: 256, r: 38, icon: '🐈', label: '貓有兩條尾巴' },
      { x: 258, y: 284, r: 34, icon: '☀️', label: '太陽在左邊，影子卻也在左邊' },
    ];
    host.innerHTML = `
      <div class="w-spot">
        <p class="sp-hint">點一點，找出 4 個破綻</p>
        <svg class="sp-pic" viewBox="0 0 480 360" role="img" aria-label="一張 AI 做的圖：麵包店前面，一個小女孩在揮手，旁邊有一隻貓和一棵樹">
          ${SPOT_SCENE}
          <g class="sp-rings"></g>
        </svg>
        <ul class="sp-list">${clues.map(() => '<li>❓ 還沒找到</li>').join('')}</ul>
      </div>`;
    const svg = host.querySelector('svg'), hint = host.querySelector('.sp-hint');
    const found = [];
    const hit = (c, p) => c.w ? p.x >= c.x - 8 && p.x <= c.x + c.w + 8 && p.y >= c.y - 8 && p.y <= c.y + c.h + 8
      : Math.hypot(p.x - c.x, p.y - c.y) <= c.r;
    svg.addEventListener('click', e => {
      if (found.length === clues.length) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const c = clues.find(c => hit(c, p));
      if (!c) { hint.textContent = '這裡看起來沒問題，再找找看'; shake(hint); return; }
      if (found.includes(c)) return;
      found.push(c);
      api.good();
      const n = found.length;
      const [cx, cy] = c.w ? [c.x + c.w / 2, c.y + c.h / 2] : [c.x, c.y];
      host.querySelector('.sp-rings').insertAdjacentHTML('beforeend', c.w
        ? `<rect class="sp-ring" x="${c.x - 6}" y="${c.y - 6}" width="${c.w + 12}" height="${c.h + 12}" rx="14"/>`
        : `<circle class="sp-ring" cx="${cx}" cy="${cy}" r="${c.r - 4}"/>`);
      const li = host.querySelectorAll('.sp-list li')[n - 1];
      li.textContent = `${c.icon} ${c.label}`;
      li.classList.add('got');
      if (n < clues.length) { hint.textContent = `找到 ${n} 個了，還有 ${clues.length - n} 個`; return; }
      hint.textContent = '🎉 4 個都找到了！不過新的 AI 圖越來越像真的，找不到破綻，也不代表是真的。';
      hint.classList.add('done');
      api.done();
    });
  },

  // Traps on web pages, one case at a time in a drawn iPad browser: tap 正常 or 可疑, then
  // the clue lights up. One ad has a tiny ×; a touch anywhere else on it leaves the page.
  webtrap(host, _, api) {
    // Each case: the address, whether it has the lock, the page, an optional pop-up on top,
    // an optional page it jumps to by itself, and why. Parts marked .wt-c are the clues.
    const cases = [
      {
        ask: '想去「大象購物」買東西，搜尋結果最上面這個可以點嗎？',
        url: 'search.example.com/?q=大象購物', lock: true, scam: true,
        page: `<p class="wt-q">🔍 大象購物</p>
          <div class="wt-res wt-c"><small>贊助</small><b>大象購物 全面一折！今天限定</b><em>elephant-shop-sale.xyz</em></div>
          <div class="wt-res"><b>大象購物｜官方網站</b><em>www.elephant.com.tw</em></div>`,
        why: '最上面寫著「贊助」的是花錢買的廣告，壞人也買得到。網址 elephant-shop-sale.xyz 不是官方的，「一折」也太好康了。要點下面官方的網址。',
      },
      {
        ask: '點了官方網址，來到這一頁。正常嗎？',
        url: 'www.elephant.com.tw', lock: true, scam: false,
        page: `<p class="wt-site">🐘 大象購物</p><div class="wt-grid"><span>📚<br>書</span><span>🧸<br>玩具</span><span>✏️<br>文具</span></div>`,
        why: '網址拼得對，前面有小鎖頭 🔒，內容也很普通。這是正常的網站。',
      },
      {
        ask: '在看企鵝的文章，突然跳出這個視窗：',
        url: 'kids-animals.example.org/penguin', lock: true, scam: true,
        page: `<p class="wt-site">🐧 企鵝小百科</p><p>企鵝不會飛，可是很會游泳……</p>`,
        pop: `<div class="wt-pop wt-c"><b>🎉 恭喜你中獎了！</b><p>你是第 1,000,000 位訪客，<br>免費送你一支 iPhone！</p><span class="wt-btn">立即領取</span></div>`,
        why: '這叫彈出式視窗（pop-up）。沒有人會隨便送你 iPhone，「中獎」是騙你點下去、留下資料。把它關掉，不要點。',
      },
      {
        ask: '這個網頁旁邊有一個廣告。正常嗎？',
        url: 'kids-animals.example.org/panda', lock: true, scam: false,
        page: `<p class="wt-site">🐼 貓熊小百科</p><p>貓熊一天要吃很多竹子。</p><div class="wt-ad"><small>廣告</small>📖 週末兒童書展，在市立圖書館</div>`,
        why: '很多網頁都有廣告。這個有標「廣告」，不嚇你、不要你給資料，是一般的廣告，不想看就不要理它。',
      },
      {
        ask: '看卡通的時候，畫面跳出這個警告：',
        url: 'free-cartoon.example.net', lock: true, scam: true,
        page: `<p class="wt-site">📺 免費卡通</p><p>第 12 集……</p>`,
        pop: `<div class="wt-alert wt-c"><b>⚠️ 警告！你的 iPad 中毒了！</b><p>偵測到 3 個病毒，請在 60 秒內處理，<br>不然照片會全部不見！</p><span class="wt-btn">下載「清除大師」</span></div>`,
        why: '這是假的警告。網頁看不到你 iPad 裡面有什麼，不可能知道有沒有病毒。它故意嚇你、催你，好讓你下載壞 App。關掉這個分頁就好。',
      },
      {
        ask: '網頁中間出現一個好大的廣告：',
        url: 'game-tips.example.com', lock: true, scam: true,
        page: `<p class="wt-site">🎮 遊戲攻略</p>
          <div class="wt-big wt-c wt-adbox"><button class="wt-x" aria-label="關閉廣告">×</button><b>💰 你有 NT$5,000 回饋金還沒領！</b><p>輸入信用卡號碼，馬上匯給你</p><span class="wt-btn">領取回饋金</span></div>`,
        // Touching the ad anywhere but its tiny × takes the browser to the ad's page.
        adJump: {
          url: 'bonus-card.example.top', lock: false,
          page: `<p class="wt-site">💳 回饋金領取中心</p><div class="wt-login"><span class="wt-in">信用卡號碼</span><span class="wt-in">背面三碼</span><span class="wt-btn">送出</span></div>`,
        },
        why: '要「領錢」卻叫你輸入信用卡號碼，這是騙錢的手法。真的退款不會在廣告裡叫你填卡號。廣告的 × 故意做得很小，點歪了就會被帶走，要小心。',
      },
      {
        ask: '想看一部影片，網頁說要先裝 App：',
        url: 'movie-fast.example.top', lock: true, scam: true,
        page: `<p class="wt-site">🎬 影片</p><div class="wt-big wt-c"><b>看完整影片，要先安裝「影片加速器」</b><span class="wt-btn">⬇️ 立刻安裝</span></div>`,
        why: '看影片不用裝奇怪的 App。App 只從官方的 App Store 下載，網頁叫你裝的不要裝。',
      },
      {
        ask: '點進一個故事網站，等一下看看……',
        url: 'story-house.example.org', lock: true, scam: true,
        page: `<p class="wt-site">📚 兒童故事屋</p><p>從前從前，有一隻小兔子……</p>`,
        jump: {
          url: 'you-win-gift.example.top', lock: false,
          page: `<p class="wt-site">🎁 你被選中了！</p><div class="wt-big wt-c"><b>填寫姓名、地址、電話</b><p>就能領取神秘禮物</p></div>`,
        },
        why: '你什麼都沒點，網頁卻自己跳到別的網站，這叫可疑的轉址（redirect）。新網址很奇怪，還要你填個人資料。按「上一頁」離開。',
      },
      {
        ask: '收到連結，打開是「小鳥社群」的登入頁：',
        url: 'birdb00k-login.example.xyz', lock: false, urlClue: true, scam: true,
        page: `<div class="wt-login"><p class="wt-site">🐦 小鳥社群</p><span class="wt-in">帳號</span><span class="wt-in">密碼</span><span class="wt-btn">登入</span></div>`,
        why: '這是網路釣魚（phishing）：做一個跟真的很像的假網站，騙你輸入帳號和密碼。看網址：birdb<b>00</b>k 是數字 0 不是字母 o，前面也沒有小鎖頭，寫著「不安全」。',
      },
      {
        ask: '自己在網址列打 birdbook.com，來到登入頁：',
        url: 'www.birdbook.com', lock: true, scam: false,
        page: `<div class="wt-login"><p class="wt-site">🐦 小鳥社群</p><span class="wt-in">帳號</span><span class="wt-in">密碼</span><span class="wt-btn">登入</span></div>`,
        why: '網址拼得對、有小鎖頭，而且是你自己打的網址。長得一樣的頁面，差別就在網址。登入前一定先看網址。',
      },
    ];

    host.innerHTML = `
      <div class="w-webtrap">
        <p class="wt-ask"></p>
        <div class="wt-ipad"><div class="wt-screen">
          <div class="wt-bar"><span class="wt-lock"></span><span class="wt-url"></span></div>
          <div class="wt-page"></div>
          <div class="wt-layer"></div>
        </div></div>
        <div class="wt-btns"><button class="option" data-v="ok">${labels[0]}</button><button class="option" data-v="scam">${labels[1]}</button></div>
        <p class="wt-why" hidden></p>
        <div class="wt-foot"><span class="wt-count"></span><button class="go" data-act="next" hidden>下一個 ▶</button></div>
      </div>`;
    const $ = s => host.querySelector(s);
    const screen = $('.wt-screen'), why = $('.wt-why'), next = $('[data-act="next"]');
    const btns = [...host.querySelectorAll('[data-v]')];
    let k = 0, ready = false;

    const bar = (url, lock) => {
      $('.wt-lock').textContent = lock ? '🔒' : '⚠️ 不安全';
      $('.wt-lock').classList.toggle('wt-bad', !lock);
      $('.wt-lock').classList.toggle('wt-c', !lock);
      $('.wt-url').textContent = url;
    };
    function show() {
      const c = cases[k];
      ready = false;
      screen.classList.remove('wt-show');
      $('.wt-ask').textContent = c.ask;
      $('.wt-count').textContent = `第 ${k + 1} 個，共 ${cases.length} 個`;
      bar(c.url, c.lock);
      $('.wt-url').classList.toggle('wt-c', !!c.urlClue);
      $('.wt-page').innerHTML = c.page;
      $('.wt-layer').innerHTML = '';
      why.hidden = true;
      next.hidden = true;
      btns.forEach(b => { b.disabled = true; b.classList.remove('right'); });
      const arm = () => { ready = true; btns.forEach(b => { b.disabled = false; }); };
      if (c.pop) {
        api.later(() => { $('.wt-layer').innerHTML = c.pop; pop($('.wt-layer').firstElementChild); arm(); }, 900);
      } else if (c.jump) {
        api.later(() => {
          $('.wt-page').innerHTML = '<p class="wt-going">↪ 自動跳轉中……</p>';
          api.later(() => {
            bar(c.jump.url, c.jump.lock);
            $('.wt-url').classList.add('wt-c');
            $('.wt-page').innerHTML = c.jump.page;
            pop($('.wt-url'));
            arm();
          }, 700);
        }, 1800);
      } else {
        arm();
      }
    }

    host.querySelector('.wt-btns').addEventListener('click', e => {
      const b = e.target.closest('[data-v]');
      if (!b || !ready) return;
      const c = cases[k];
      if ((b.dataset.v === 'scam') !== c.scam) {
        shake(b);
        api.bad();
        why.hidden = false;
        why.className = 'wt-why wt-try';
        why.textContent = c.scam ? '再看仔細一點：網址、小鎖頭，還有它要你做什麼？' : '這個其實沒問題，看看網址和小鎖頭。';
        return;
      }
      ready = false;
      b.classList.add('right');
      btns.forEach(x => { x.disabled = true; });
      screen.classList.add('wt-show');
      why.hidden = false;
      why.className = 'wt-why ' + (c.scam ? 'wt-is-scam' : 'wt-is-ok');
      why.innerHTML = (c.scam ? '🚩 ' : '✅ ') + c.why;
      api.good();
      if (k === cases.length - 1) {
        $('.wt-count').textContent = '🎉 全部看完了！看網址、看小鎖頭、不被嚇到、不給資料。';
        api.done();
      } else {
        next.hidden = false;
      }
    });
    // The ad with a tiny ×: closing it works, but a touch anywhere else on it leaves the page.
    $('.wt-page').addEventListener('click', e => {
      const c = cases[k];
      if (!c.adJump) return;
      if (e.target.closest('.wt-x')) {
        e.target.closest('.wt-adbox').remove();
        $('.wt-page').insertAdjacentHTML('beforeend', '<p class="wt-note">✅ 廣告關掉了。× 好小，要對準才點得到。</p>');
        return;
      }
      if (e.target.closest('[data-act="back"]')) {
        bar(c.url, c.lock);
        $('.wt-page').innerHTML = c.page;
        return;
      }
      if (!e.target.closest('.wt-adbox')) return;
      bar(c.adJump.url, c.adJump.lock);
      $('.wt-page').innerHTML = `<p class="wt-oops">😱 點到廣告，被帶到奇怪的網站了！<button class="wt-back" data-act="back">← 上一頁</button></p>` + c.adJump.page;
      pop($('.wt-url'));
    });
    next.onclick = () => { k++; show(); };
    show();
  },

  // An iPad keyboard: Zhuyin, English, handwriting, emoji, and dictation.
  ime(host, _, api) {
    const tasks = [
      { id: 'zhuyin', zh: '用注音打出「貓」', en: 'Zhuyin', alt: 'ㄇ ㄠ，再按「一聲」' },
      { id: 'hand', zh: '用手寫寫出「貓」', en: 'handwriting' },
      { id: 'voice', zh: '用說的輸入', en: 'dictation', alt: '按 🎤' },
      { id: 'globe', zh: '用 🌐 換鍵盤', en: 'switch keyboard' },
    ];
    const modes = ['注音', 'English', '手寫', '表情符號'];
    const zhuyin = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄠ', 'ㄧ', 'ㄢ', 'ㄤ'];
    const tones = [['一聲', ''], ['ˊ', 'ˊ'], ['ˇ', 'ˇ'], ['ˋ', 'ˋ']];
    const dict = { 'ㄇㄠ': ['貓', '喵'], 'ㄇㄠˊ': ['毛', '茅'], 'ㄇㄠˇ': ['卯'], 'ㄇㄠˋ': ['帽', '冒', '貌'], 'ㄉㄠˋ': ['到', '道'], 'ㄇㄢˋ': ['慢', '曼'], 'ㄋㄧˇ': ['你', '妳'], 'ㄇㄧˇ': ['米'], 'ㄅㄠ': ['包'], 'ㄊㄤˊ': ['糖', '堂'] };
    host.innerHTML = `
      <div class="w-lab">
        <div class="ime">
          <div class="ime-text"><span class="typed"></span><u class="buf"></u><span class="caret"></span></div>
          <div class="cands"></div>
          <div class="kbd"></div>
          <div class="kbd-bar">
            <button class="kk" data-k="globe" aria-label="換鍵盤">🌐</button>
            <span class="mode-name"></span>
            <button class="kk" data-k="mic" aria-label="語音輸入">🎤</button>
            <button class="kk" data-k="del" aria-label="刪除">⌫</button>
          </div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    let mode = 0, buf = '', typed = '', listening = false;
    const put = t => { typed = (typed + t).slice(-16); $('.typed').textContent = typed; };
    const cands = list => {
      $('.cands').innerHTML = list.map(c => `<button class="cand" data-c="${c}">${c}</button>`).join('');
    };
    const drawKbd = () => {
      $('.mode-name').textContent = modes[mode];
      $('.buf').textContent = buf;
      cands([]);
      const k = $('.kbd');
      if (mode === 0) {
        k.innerHTML = `<div class="krow">${zhuyin.map(z => `<button class="kk" data-z="${z}">${z}</button>`).join('')}</div>
          <div class="krow">${tones.map(([l, v]) => `<button class="kk tone" data-t="${v}">${l}</button>`).join('')}</div>`;
      } else if (mode === 1) {
        k.innerHTML = `<div class="krow">${'catdog'.split('').map(c => `<button class="kk" data-a="${c}">${c}</button>`).join('')}<button class="kk" data-a=" ">space</button></div>`;
      } else if (mode === 2) {
        k.innerHTML = '<canvas class="pad-ink" width="320" height="170" aria-label="手寫區"></canvas><p class="hint">用手指寫一個字</p>';
        inkPad($('.pad-ink'));
      } else {
        k.innerHTML = `<div class="krow">${['😀', '😂', '🥰', '😺', '🐶', '🍎', '⚽', '🎉'].map(c => `<button class="kk" data-a="${c}">${c}</button>`).join('')}</div>`;
      }
    };
    const inkPad = cv => {
      const g = cv.getContext('2d');
      g.lineWidth = 6; g.lineCap = 'round'; g.strokeStyle = '#1d2738';
      let last = null, len = 0;
      const at = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) * (cv.width / b.width), (e.clientY - b.top) * (cv.height / b.height)]; };
      cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); last = at(e); });
      cv.addEventListener('pointermove', e => {
        if (!last) return;
        const p = at(e);
        g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke();
        len += Math.hypot(p[0] - last[0], p[1] - last[1]);
        last = p;
      });
      const up = () => {
        last = null;
        // a pretend recognizer: once something is written, offer the likely characters
        if (len > 40) cands(['貓', '描', '錨', '瞄']);
      };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
    };
    host.querySelector('.ime').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b || listening) return;
      if (b.dataset.z) { buf = (buf + b.dataset.z).slice(-3); $('.buf').textContent = buf; cands([]); return; }
      if (b.dataset.t !== undefined) {
        const key = buf + b.dataset.t;
        const list = dict[key];
        $('.buf').textContent = key;
        cands(list || []);
        if (!list) $('.cands').innerHTML = '<span class="hint">找不到這個字，試試 ㄇ ㄠ 一聲</span>';
        return;
      }
      if (b.dataset.c) {
        put(b.dataset.c);
        if (mode === 0 && b.dataset.c === '貓') check('zhuyin');
        if (mode === 2 && b.dataset.c === '貓') check('hand');
        buf = '';
        if (mode === 2) drawKbd(); else { $('.buf').textContent = ''; cands([]); }
        return;
      }
      if (b.dataset.a) { put(b.dataset.a); return; }
      const k = b.dataset.k;
      if (k === 'globe') { mode = (mode + 1) % modes.length; buf = ''; drawKbd(); check('globe'); }
      else if (k === 'del') { if (buf) { buf = buf.slice(0, -1); $('.buf').textContent = buf; cands([]); } else { typed = typed.slice(0, -1); $('.typed').textContent = typed; } }
      else if (k === 'mic') {
        listening = true;
        $('.mode-name').textContent = '🎤 正在聽…（模擬）';
        api.later(() => { listening = false; put('我喜歡小貓'); $('.mode-name').textContent = modes[mode]; check('voice'); }, 1300);
      }
    });
    drawKbd();
  },

  // A settings screen: text size, brightness, volume, Do Not Disturb, per-app notifications.
  settings(host, _, api) {
    const tasks = [
      { id: 'big', zh: '把字調大', en: 'text size' },
      { id: 'dnd', zh: '打開勿擾模式', en: 'Do Not Disturb' },
      { id: 'mute', zh: '關掉遊戲 App 的通知', en: 'notifications' },
    ];
    const apps = [['msg', '💬', '訊息', '媽媽：晚餐吃咖哩喔'], ['game', '🎮', '遊戲', '快回來領每日獎勵！'], ['school', '📚', '學校', '明天記得帶水壺']];
    host.innerHTML = `
      <div class="w-lab">
        <div class="set-wrap">
          <div class="set-phone">
            <div class="set-status"><span>09:41</span><span class="moon" hidden>🌙</span><span class="badge" hidden></span></div>
            <div class="banner" hidden></div>
            <p class="sample">今天天氣很好，我們去公園散步，看到一隻小貓在睡覺。</p>
          </div>
          <div class="set-panel">
            <label class="srow">🔠 文字大小 <input type="range" min="1" max="5" value="2" data-s="size"></label>
            <label class="srow">☀️ 螢幕亮度 <input type="range" min="2" max="10" value="8" data-s="bright"></label>
            <label class="srow">🔊 音量 <input type="range" min="0" max="10" value="5" data-s="vol"></label>
            <div class="srow">🌙 勿擾模式 <button class="sw" data-sw="dnd" aria-pressed="false"></button></div>
            <p class="set-sub">通知 ${en('notifications')}</p>
            ${apps.map(([k, i, n]) => `<div class="srow">${i} ${n} <button class="sw on" data-sw="${k}" aria-pressed="true"></button></div>`).join('')}
          </div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const on = { dnd: false, msg: true, game: true, school: true };
    let missed = 0, k = 0;
    const sizes = [0, .85, 1, 1.25, 1.55, 1.9];
    host.querySelector('.set-panel').addEventListener('input', e => {
      const r = e.target.closest('[data-s]');
      if (!r) return;
      if (r.dataset.s === 'size') { $('.sample').style.fontSize = sizes[r.value] + 'rem'; if (+r.value >= 4) check('big'); }
      if (r.dataset.s === 'bright') $('.set-phone').style.filter = `brightness(${0.35 + r.value / 15})`;
    });
    host.querySelector('.set-panel').addEventListener('click', e => {
      const b = e.target.closest('[data-sw]');
      if (!b) return;
      const key = b.dataset.sw;
      on[key] = !on[key];
      b.classList.toggle('on', on[key]);
      b.setAttribute('aria-pressed', on[key]);
      $('.moon').hidden = !on.dnd;
      if (on.dnd) check('dnd');
      if (key === 'game' && !on.game) check('mute');
    });
    const ping = () => {
      const live = apps.filter(([key]) => on[key]);
      if (live.length) {
        const [, icon, name, text] = live[k++ % live.length];
        if (on.dnd) {
          missed++;
          const bd = $('.badge');
          bd.hidden = false;
          bd.textContent = `🔕 ${missed} 則通知（沒有響）`;
        } else {
          const bn = $('.banner');
          bn.innerHTML = `<b>${icon} ${name}</b> ${text} 🔔`;
          bn.hidden = false;
          pop(bn);
          api.later(() => { bn.hidden = true; }, 1600);
        }
      }
      api.later(ping, 2600);
    };
    api.later(ping, 900);
  },

  // Press the top button and volume-up together to take a screenshot.
  screenshot(host, _, api) {
    host.innerHTML = `
      <div class="w-shot">
        <div class="shot-dev">
          <button class="hw top" data-b="top" aria-label="頂端按鈕">頂端</button>
          <button class="hw volup" data-b="up" aria-label="調高音量">＋</button>
          <button class="hw voldn" data-b="dn" aria-label="調低音量">－</button>
          <div class="shot-screen"><span>🦖</span><b>恐龍報告</b><div class="flash"></div><div class="shot-thumb" hidden>🦖</div></div>
        </div>
        <p class="readout">同時按「頂端按鈕」和「＋ 調高音量」</p>
        <ul class="keys-list">
          <li>有主畫面按鈕的 iPad：頂端按鈕 ＋ 主畫面按鈕</li>
          <li>Mac：⇧ Shift ＋ ⌘ Command ＋ 3（整個螢幕）或 4（選一塊）</li>
          <li>Windows：⊞ Windows ＋ Shift ＋ S</li>
        </ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const held = {};
    let lastTap = { b: null, t: 0 }, taken = false;
    const shoot = () => {
      const f = $('.flash');
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
      $('.shot-thumb').hidden = false;
      pop($('.shot-thumb'));
      $('.readout').textContent = '📸 截圖成功！左下角的小圖點一下，可以畫重點、裁切，再存到照片。';
      api.good();
      if (!taken) { taken = true; api.done(); }
    };
    host.querySelectorAll('.hw').forEach(b => {
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        const k = b.dataset.b;
        held[k] = true;
        b.classList.add('down');
        const now = performance.now();
        const pair = k === 'top' ? 'up' : k === 'up' ? 'top' : null;
        // both held at once (two fingers), or tapped one right after the other (mouse)
        if (pair && (held[pair] || (lastTap.b === pair && now - lastTap.t < 600))) shoot();
        else if (k === 'dn') $('.readout').textContent = '這是調低音量，要按「＋」那一顆';
        lastTap = { b: k, t: now };
      });
      const up = () => { held[b.dataset.b] = false; b.classList.remove('down'); };
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
    });
  },

  // Scan two QR codes: one on a poster, one on a sticker stuck to a parking meter.
  qr(host, _, api) {
    const codes = [
      { id: 'good', where: '學校海報：「掃我看科技小探險」', img: 'img/qr-good.svg', url: 'https://kids.scsnake.xyz/', safe: true, yes: '✅ 這是學校給的網站，網址也正常，可以打開。', no: '這張是學校海報上的，網址也正常，其實可以打開喔。' },
      { id: 'fake', where: '停車繳費機上歪歪的貼紙：「掃碼繳停車費」', img: 'img/qr-fake.svg', url: 'http://parking-pay-tw.xyz/pay?id=8812', safe: false, yes: '⚠️ 小心！這可能是有人貼上去的假 QR Code，網址很奇怪，也沒有 https。', no: '✅ 對！繳費要用官方 App 或現場機器。被貼上去的 QR Code 可能是詐騙。' },
    ];
    host.innerHTML = `
      <div class="w-qr">
        <div class="qr-row">${codes.map(c => `
          <figure class="qr-card ${c.id}" data-id="${c.id}">
            <img src="${c.img}" alt="QR Code" draggable="false">
            <figcaption>${c.where}</figcaption>
            <button class="option" data-scan="${c.id}">📷 掃描</button>
            <div class="qr-pop" hidden>
              <p>偵測到網址：<code>${c.url}</code></p>
              <div><button class="option" data-ans="open">打開</button><button class="option" data-ans="skip">不要打開</button></div>
              <p class="qr-res"></p>
            </div>
          </figure>`).join('')}</div>
      </div>`;
    const solved = new Set();
    host.addEventListener('click', e => {
      const sc = e.target.closest('[data-scan]');
      if (sc) { const card = sc.closest('.qr-card'); card.querySelector('.qr-pop').hidden = false; pop(card); return; }
      const a = e.target.closest('[data-ans]');
      if (!a) return;
      const card = a.closest('.qr-card');
      const c = codes.find(x => x.id === card.dataset.id);
      const open = a.dataset.ans === 'open';
      const right = open === c.safe;
      card.querySelector('.qr-res').textContent = open ? c.yes : c.no;
      if (!right) { shake(card); api.bad(); return; }
      card.classList.add('done');
      api.good();
      solved.add(c.id);
      if (solved.size === codes.length) api.done();
    });
  },

  // Find a lost tablet: play a sound, or lock it with Lost Mode.
  findmy(host, _, api) {
    const tasks = [
      { id: 'sound', zh: '播放聲音找出來', en: 'play sound' },
      { id: 'lost', zh: '打開遺失模式', en: 'Lost Mode' },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="fm-map-box">
          <div class="fm-map"><span class="fm-home">🏠</span><span class="fm-pin">📲</span><span class="fm-park">🌳</span></div>
          <p class="fm-name"><b>小明的 iPad</b>：在家裡，2 分鐘前</p>
          <div class="fm-acts">
            <button class="option" data-a="sound">🔊 播放聲音</button>
            <button class="option" data-a="lost">🔒 標示為遺失</button>
            <button class="option danger" data-a="erase">🧹 清除這台裝置</button>
          </div>
          <div class="fm-lock" hidden>🔒 這台 iPad 遺失了<br>撿到請打 0912-345-678</div>
          <p class="readout"></p>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    host.querySelector('.fm-acts').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const a = b.dataset.a;
      if (a === 'sound') {
        shake($('.fm-pin'));
        $('.readout').textContent = '🔊 嗶——嗶——！順著聲音找，原來在沙發下面 🛋️';
        check('sound');
      } else if (a === 'lost') {
        $('.fm-lock').hidden = false;
        pop($('.fm-lock'));
        $('.readout').textContent = '遺失模式會鎖住平板，畫面上顯示你的電話，別人打不開。';
        check('lost');
      } else {
        $('.readout').textContent = '⚠️ 清除會把裡面的東西全部刪掉，只有確定找不回來時才用。這裡先不要按！';
        shake(b);
      }
    });
  },

  // A pretend AI chat: ask questions, and catch the answer that is wrong.
  chatbot(host, _, api) {
    const tasks = [
      { id: 'ask', zh: '問 AI 三個問題', en: 'ask' },
      { id: 'catch', zh: '找出 AI 說錯的地方', en: 'fact-check' },
      { id: 'private', zh: '知道不要告訴 AI 個人資料', en: 'privacy' },
    ];
    const qs = [
      { q: '為什麼天空是藍色的？', a: '陽光裡有很多顏色，藍色的光比較容易被空氣散開，所以天空看起來是藍色的。', ok: true },
      { q: '台灣最高的山是哪一座？', a: '台灣最高的山是阿里山，大約 3952 公尺高。', ok: false, fix: '錯了！台灣最高的山是玉山，大約 3952 公尺。AI 可能說得很有自信，但還是會說錯。' },
      { q: '幫我想三個小狗的名字', a: '可以叫「小餅乾」、「豆花」或「阿布」！', ok: true },
      { q: '我家住在……我告訴你地址', a: '請不要把地址、電話、密碼或學校這些個人資料告訴 AI 或任何網站喔！', ok: true, priv: true },
    ];
    host.innerHTML = `
      <div class="w-lab">
        <div class="chat">
          <div class="chat-log"><p class="bot-msg">🤖 你好！我是 AI 聊天機器人，想問什麼？</p></div>
          <div class="chat-qs">${qs.map((x, i) => `<button class="option" data-q="${i}">${x.q}</button>`).join('')}</div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const log = $('.chat-log');
    let asked = 0, busy = false;
    const add = html => { const el = h(html); log.append(el); log.scrollTop = log.scrollHeight; return el; };
    host.querySelector('.chat-qs').addEventListener('click', e => {
      const b = e.target.closest('[data-q]');
      if (!b || busy || b.disabled) return;
      const x = qs[b.dataset.q];
      b.disabled = true;
      busy = true;
      add(`<p class="me-msg">${x.q}</p>`);
      const msg = add('<div class="bot-msg">🤖 <span></span></div>');
      const span = msg.querySelector('span');
      let n = 0;
      const type = () => {
        span.textContent = x.a.slice(0, ++n);
        log.scrollTop = log.scrollHeight;
        if (n < x.a.length) { api.later(type, 35); return; }
        busy = false;
        if (++asked >= 3) check('ask');
        if (x.priv) { check('private'); return; }
        const judge = h('<div class="judge"><button class="option" data-j="ok">👍 合理</button><button class="option" data-j="odd">🤔 怪怪的</button></div>');
        msg.append(judge);
        judge.addEventListener('click', ev => {
          const j = ev.target.closest('[data-j]');
          if (!j) return;
          const sayOdd = j.dataset.j === 'odd';
          judge.remove();
          if (!x.ok && sayOdd) { add(`<p class="fix-msg">✅ ${x.fix}</p>`); check('catch'); api.good(); }
          else if (!x.ok) { add('<p class="fix-msg">再想想：台灣最高的山真的是阿里山嗎？</p>'); api.bad(); msg.append(judge); }
          else if (sayOdd) add('<p class="fix-msg">這個答案是對的。不過會懷疑、會查證，是很好的習慣！</p>');
          else add('<p class="fix-msg">👍 這個答案沒問題。</p>');
        });
      };
      api.later(type, 300);
    });
  },

  // The operating system takes turns between apps so fast they look simultaneous.
  multitask(host, _, api) {
    const apps = [['🎵', '播放音樂'], ['⬇️', '下載遊戲'], ['🎨', '畫畫']];
    host.innerHTML = `
      <div class="w-multi">
        <div class="mt-rows">${apps.map(([i, n], k) => `<div class="mt-row" data-k="${k}"><span class="mt-name">${i} ${n}</span><div class="mt-bar"><i></i></div></div>`).join('')}</div>
        <div class="controls"><button class="option" data-speed="520">🐢 慢動作</button><button class="option" data-speed="40">⚡ 正常速度</button></div>
        <p class="readout">選一種速度，看作業系統怎麼安排</p>
      </div>`;
    const rows = [...host.querySelectorAll('.mt-row')];
    // Speed can change mid-run: the bars keep their progress and only the pace changes.
    let running = false, ms = 0, gen = 0, prog = [0, 0, 0], cur = -1;
    const mark = () => host.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', running && +x.dataset.speed === ms));
    const tick = g => {
      if (g !== gen) return; // a newer speed took over
      cur = (cur + 1) % 3;
      prog[cur] = Math.min(100, prog[cur] + 5);
      rows.forEach((r, k) => { r.classList.toggle('on', k === cur); r.querySelector('i').style.width = prog[k] + '%'; });
      host.querySelector('.readout').textContent = ms > 100 ? `輪到「${apps[cur][1]}」用 CPU` : '快速輪流中……看起來像三個同時在做！';
      if (prog.every(p => p >= 100)) {
        running = false;
        mark();
        rows.forEach(r => r.classList.remove('on'));
        host.querySelector('.readout').textContent = ms > 100 ? '慢慢看就知道：其實是一個一個輪流的。再試試正常速度！' : '🎉 全部完成！正常速度下輪流得超快，所以感覺是同時進行。';
        api.good();
        api.done();
        return;
      }
      api.later(() => tick(g), ms);
    };
    host.querySelector('.controls').addEventListener('click', e => {
      const b = e.target.closest('[data-speed]');
      if (!b) return;
      if (running && +b.dataset.speed === ms) return;
      if (!running) { prog = [0, 0, 0]; cur = -1; }
      running = true;
      ms = +b.dataset.speed;
      mark();
      tick(++gen);
    });
  },

  // The computer guesses your number by always halving the range (binary search).
  guess(host, { max }, api) {
    host.innerHTML = `
      <div class="w-guess">
        <p class="g-step">① 選一個 1 到 ${max} 的數字（電腦看不到）</p>
        <div class="g-grid">${Array.from({ length: max }, (_, i) => `<button class="g-n" data-n="${i + 1}">${i + 1}</button>`).join('')}</div>
        <div class="g-play" hidden>
          <p class="g-say"></p>
          <div class="controls"><button class="option" data-a="up"></button><button class="option" data-a="down"></button></div>
        </div>
      </div>`;
    const $ = sel => host.querySelector(sel);
    let secret = null, lo = 1, hi = max, g = 0, tries = 0, finished = false;
    // The answer buttons name the guess ("比 32 大"); when the guess is your number, the
    // computer sees it by itself and celebrates.
    const next = () => {
      g = Math.floor((lo + hi) / 2);
      tries++;
      $('.g-say').innerHTML = `電腦第 ${tries} 次猜：<b>${g}</b>`;
      host.querySelectorAll('.g-n').forEach(b => {
        const n = +b.dataset.n;
        b.classList.toggle('out', n < lo || n > hi);
        b.classList.toggle('guess', n === g);
      });
      $('[data-a="up"]').textContent = `⬆️ 比 ${g} 大`;
      $('[data-a="down"]').textContent = `⬇️ 比 ${g} 小`;
      if (g !== secret) return;
      finished = true;
      $('.g-play .controls').hidden = true;
      const cell = host.querySelector(`.g-n[data-n="${g}"]`);
      api.later(() => {
        cell.classList.add('hit');
        $('.g-say').innerHTML = `電腦第 ${tries} 次猜：<b>${g}</b> <span class="g-yes">🎯 猜對了！</span><br>每次刪掉一半，1 到 ${max} 最多 ${Math.ceil(Math.log2(max + 1))} 次一定猜到。`;
        api.good();
        api.done();
      }, 700);
    };
    host.querySelector('.g-grid').addEventListener('click', e => {
      const b = e.target.closest('[data-n]');
      if (!b || secret !== null) return;
      secret = +b.dataset.n;
      b.classList.add('mine');
      $('.g-step').innerHTML = `② 你選了 <b>${secret}</b>。告訴電腦：你的數字比它猜的大，還是小？`;
      $('.g-play').hidden = false;
      next();
    });
    host.querySelector('.g-play').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || finished) return;
      const truth = secret > g ? 'up' : 'down';
      if (b.dataset.a !== truth) { shake(b); api.bad(); $('.g-say').innerHTML = `電腦第 ${tries} 次猜：<b>${g}</b><br>咦？你選的是 ${secret}，再看一次`; return; }
      if (truth === 'up') lo = g + 1; else hi = g - 1;
      next();
    });
  },

  // Sort the cards by swapping neighbors, like a bubble sort. Below, three buttons play bubble,
  // selection and quick sort on bars, with counts of compares and swaps.
  swapsort(host, { nums }, api) {
    const a = shuffle(nums, true);
    // Three famous sorting algorithms, played step by step on bars: each records a list of
    // steps (compare, swap, pivot, done), and the player shows them one at a time.
    const algos = {
      bubble: { icon: '🫧', zh: '泡泡排序', en: 'bubble sort', say: '一次比相鄰兩根，大的往後換，像泡泡往上冒。跟你剛剛的做法一樣！', run(a, s) {
        for (let end = a.length - 1; end > 0; end--) {
          for (let j = 0; j < end; j++) { s.push(['cmp', j, j + 1]); if (a[j] > a[j + 1]) { s.push(['swap', j, j + 1]); [a[j], a[j + 1]] = [a[j + 1], a[j]]; } }
          s.push(['done', end]);
        }
        s.push(['done', 0]);
      } },
      select: { icon: '👆', zh: '選擇排序', en: 'selection sort', say: '每一輪找出最小的那根，換到最前面。', run(a, s) {
        for (let i = 0; i < a.length; i++) {
          let m = i;
          s.push(['pivot', m]);
          for (let j = i + 1; j < a.length; j++) { s.push(['cmp', m, j]); if (a[j] < a[m]) { m = j; s.push(['pivot', m]); } }
          if (m !== i) { s.push(['swap', i, m]); [a[i], a[m]] = [a[m], a[i]]; }
          s.push(['done', i]);
        }
      } },
      quick: { icon: '⚡', zh: '快速排序', en: 'quick sort', say: '選一根當「基準」，比它小的放左邊、比它大的放右邊，再把兩邊分開排。', run(a, s) {
        const q = (lo, hi) => {
          if (lo > hi) return;
          if (lo === hi) { s.push(['done', lo]); return; }
          s.push(['pivot', hi]);
          let i = lo;
          for (let j = lo; j < hi; j++) { s.push(['cmp', j, hi]); if (a[j] < a[hi]) { if (i !== j) { s.push(['swap', i, j]); [a[i], a[j]] = [a[j], a[i]]; } i++; } }
          if (i !== hi) { s.push(['swap', i, hi]); [a[i], a[hi]] = [a[hi], a[i]]; }
          s.push(['done', i]);
          q(lo, i - 1);
          q(i + 1, hi);
        };
        q(0, a.length - 1);
      } },
    };
    const bars = shuffle([1, 2, 3, 4, 5, 6, 7, 8], true);
    host.innerHTML = `
      <div class="w-swap">
        <div class="cards-row"></div>
        <p class="readout">按 ⇄ 交換兩張相鄰的卡片，從小排到大</p>
        <div class="srt-demo">
          <p class="srt-h">看看電腦的三種排序方法：</p>
          <div class="controls">${Object.entries(algos).map(([k, x]) => `<button class="option" data-algo="${k}">${x.icon} ${x.zh}</button>`).join('')}</div>
          <div class="srt-bars">${bars.map(v => `<span class="srt-bar" data-v="${v}" style="height:${(v / bars.length) * 100}%"><b>${v}</b></span>`).join('')}</div>
          <p class="srt-say">選一種，看它怎麼排這 ${bars.length} 根柱子</p>
          <p class="srt-score"></p>
        </div>
      </div>`;
    let swaps = 0, solved = false;
    const draw = () => {
      host.querySelector('.cards-row').innerHTML = a.map((n, i) => `<span class="ncard">${n}</span>${i < a.length - 1 ? `<button class="swapbtn" data-i="${i}" aria-label="交換">⇄</button>` : ''}`).join('');
    };
    host.querySelector('.cards-row').addEventListener('click', e => {
      const b = e.target.closest('[data-i]');
      if (!b || solved) return;
      const i = +b.dataset.i;
      [a[i], a[i + 1]] = [a[i + 1], a[i]];
      swaps++;
      draw();
      const ok = a.every((v, k) => !k || a[k - 1] <= v);
      host.querySelector('.readout').textContent = ok ? `🎉 排好了！你交換了 ${swaps} 次。電腦也是這樣一次比兩個、交換，只是快得多。` : `交換了 ${swaps} 次`;
      if (ok) { solved = true; api.good(); api.done(); }
    });
    draw();

    // The player: bars slide to their new place on a swap; colors show what is happening.
    // barEls[v - 1] is the bar for value v (the DOM order is the shuffled one).
    const barEls = [...host.querySelectorAll('.srt-bar')].sort((x, y) => x.dataset.v - y.dataset.v);
    const place = order => order.forEach((v, i) => { barEls[v - 1].style.left = (i / bars.length) * 100 + '%'; });
    const scores = {};
    let play = 0;
    place(bars);
    host.querySelector('.srt-demo .controls').addEventListener('click', e => {
      const b = e.target.closest('[data-algo]');
      if (!b) return;
      const x = algos[b.dataset.algo], my = ++play;
      host.querySelectorAll('[data-algo]').forEach(y => y.classList.toggle('on', y === b));
      const order = bars.slice(), steps = [];
      x.run(bars.slice(), steps);
      let cmp = 0, swp = 0, k = 0;
      barEls.forEach(el => el.classList.remove('cmp', 'swap', 'pivot', 'done'));
      place(order);
      host.querySelector('.srt-say').innerHTML = `<b>${x.zh}</b> ${x.en ? `<small lang="en">${x.en}</small>` : ''}：${x.say}`;
      const tick = () => {
        if (my !== play || !api.alive()) return;
        barEls.forEach(el => el.classList.remove('cmp', 'swap'));
        if (k === steps.length) {
          scores[b.dataset.algo] = cmp;
          host.querySelector('.srt-score').innerHTML = `✅ 排好了！比較 ${cmp} 次、交換 ${swp} 次` +
            `<br>${Object.entries(scores).map(([a, n]) => `${algos[a].zh}：比較 ${n} 次`).join('　')}`;
          return;
        }
        const [op, i, j] = steps[k++];
        const el = n => barEls[order[n] - 1];
        if (op === 'cmp') { cmp++; el(i).classList.add('cmp'); el(j).classList.add('cmp'); }
        if (op === 'swap') { swp++; [order[i], order[j]] = [order[j], order[i]]; place(order); el(i).classList.add('swap'); el(j).classList.add('swap'); }
        if (op === 'pivot') { barEls.forEach(y => y.classList.remove('pivot')); el(i).classList.add('pivot'); }
        if (op === 'done') { el(i).classList.remove('pivot'); el(i).classList.add('done'); }
        host.querySelector('.srt-score').textContent = `比較 ${cmp} 次、交換 ${swp} 次`;
        api.later(tick, op === 'swap' ? 380 : 260);
      };
      tick();
    });
  },

  // Run-length codes ("2白3紅2白"): paint the picture they describe.
  rle(host, { pattern, color, colorName }, api) {
    const rows = pattern.length, cols = pattern[0].length;
    const code = row => row.match(/(.)\1*/g).map(run => `${run.length}${run[0] === '1' ? colorName : '白'}`).join('');
    host.innerHTML = `
      <div class="w-rle" style="--px:${color}">
        <div class="rle-pair">
          <ul class="rle-codes" style="--rows:${rows}">${pattern.map(r => `<li>${code(r)}<span class="rle-arrow" aria-hidden="true">→</span></li>`).join('')}</ul>
          ${gridHTML(rows, cols, 'canvas')}
        </div>
        <p class="hint">每一行照暗號塗色：數字是幾格，後面是顏色</p>
      </div>`;
    const want = pattern.join('').split('').map(c => c === '1');
    const canvas = host.querySelector('.canvas');
    const cells = [...canvas.querySelectorAll('.px')];
    let solved = false;
    paintable(canvas, () => {
      if (solved || !cells.every((c, i) => c.classList.contains('on') === want[i])) return;
      solved = true;
      canvas.classList.add('locked');
      const short = pattern.map(code).join('').length;
      host.querySelector('.hint').textContent = `🎉 解壓縮成功！原本要記 ${rows * cols} 格，暗號只要 ${short} 個字。`;
      api.good();
      api.done();
    });
  },

  // A tiny "AI" that only looks at color learns from examples, and gets fixed with one more.
  train(host, _, api) {
    const train = [
      { e: '🍎', hue: 0, label: '蘋果' }, { e: '🍎', hue: 8, label: '蘋果' },
      { e: '🍌', hue: 55, label: '香蕉' }, { e: '🍌', hue: 50, label: '香蕉' },
    ];
    const tests = [{ e: '🍎', hue: 4, truth: '蘋果' }, { e: '🍌', hue: 52, truth: '香蕉' }, { e: '🍏', hue: 110, truth: '蘋果' }];
    host.innerHTML = `
      <div class="w-train">
        <div class="tr-box"><p>📚 AI 看過的例子（它只看顏色）</p><div class="tr-ex"></div></div>
        <div class="tr-test"><span class="tr-item">❔</span><p class="tr-say">按下面的按鈕，讓 AI 猜</p></div>
        <div class="controls"><button class="go" data-a="next">🤖 讓 AI 猜下一個</button><button class="option" data-a="teach" hidden>🧑‍🏫 教 AI：這也是蘋果</button></div>
      </div>`;
    const $ = sel => host.querySelector(sel);
    let k = 0, fixed = false;
    const drawEx = () => {
      $('.tr-ex').innerHTML = train.map(t => `<span class="tr-chip">${t.e}<small>${t.label}</small></span>`).join('');
    };
    const predict = hue => train.reduce((best, t) => (Math.abs(t.hue - hue) < Math.abs(best.hue - hue) ? t : best)).label;
    const run = () => {
      const t = tests[k];
      const p = predict(t.hue);
      $('.tr-item').textContent = t.e;
      pop($('.tr-item'));
      const right = p === t.truth;
      $('.tr-say').innerHTML = `AI 猜：<b>${p}</b> ${right ? '✅' : '❌ 猜錯了！它只看過紅色的蘋果，綠色看起來比較像黃色的香蕉。'}`;
      if (!right) { $('[data-a="teach"]').hidden = false; $('[data-a="next"]').hidden = true; api.bad(); return; }
      api.good();
      if (k === tests.length - 1) {
        $('.tr-say').innerHTML += fixed ? '<br>🎉 多教一個例子，AI 就學會了。例子越多、越多樣，AI 學得越好。' : '';
        $('[data-a="next"]').hidden = true;
        if (fixed) api.done();
        return;
      }
      k++;
    };
    host.querySelector('.controls').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'next') run();
      else {
        train.push({ e: '🍏', hue: 110, label: '蘋果' });
        fixed = true;
        drawEx();
        b.hidden = true;
        $('[data-a="next"]').hidden = false;
        $('[data-a="next"]').textContent = '🤖 再猜一次';
        $('.tr-say').textContent = 'AI 多看了一個綠蘋果的例子，再猜一次看看！';
      }
    });
    drawEx();
  },

  // Undo and redo: add stickers, step back, step forward; a new action clears redo.
  undo(host, _, api) {
    const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    const tasks = [
      { id: 'add', zh: '放上 3 個貼紙', en: 'do' },
      { id: 'undo', zh: '復原 2 次', en: 'undo', alt: mac ? '↶ 或 ⌘Z' : '↶ 或 Ctrl+Z' },
      { id: 'redo', zh: '重做 1 次', en: 'redo', alt: mac ? '↷ 或 ⇧⌘Z' : '↷ 或 Ctrl+Y' },
      { id: 'branch', zh: '復原後放新貼紙，看重做消失', en: 'new action' },
    ];
    const stickers = ['🐶', '🌳', '☀️', '🏠', '🌈', '🚗'];
    host.innerHTML = `
      <div class="w-lab">
        <div class="ud-box">
          <div class="ud-bar">
            <button class="option" data-a="undo" aria-label="復原">↶ 復原</button>
            <button class="option" data-a="redo" aria-label="重做">↷ 重做</button>
          </div>
          <div class="ud-scene"></div>
          <div class="ud-picks">${stickers.map(e => `<button class="option" data-s="${e}">${e}</button>`).join('')}</div>
          <div class="ud-stacks"><p>做過的事：<span class="done-list"></span></p><p>可以重做：<span class="redo-list"></span></p></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const done = [], redo = [];
    let undos = 0;
    const draw = () => {
      $('.ud-scene').innerHTML = done.length ? done.map(e => `<span>${e}</span>`).join('') : '<em>點下面的貼紙放上去</em>';
      $('.done-list').textContent = done.join(' ') || '（沒有）';
      $('.redo-list').textContent = redo.join(' ') || '（沒有）';
      $('[data-a="undo"]').disabled = !done.length;
      $('[data-a="redo"]').disabled = !redo.length;
    };
    const act = a => {
      if (a === 'undo' && done.length) { redo.push(done.pop()); if (++undos >= 2) check('undo'); }
      else if (a === 'redo' && redo.length) { done.push(redo.pop()); check('redo'); }
      draw();
    };
    host.querySelector('.ud-picks').addEventListener('click', e => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const hadRedo = redo.length > 0;
      done.push(b.dataset.s);
      redo.length = 0;
      if (hadRedo) check('branch', '做了新的事，可以重做的就清空了');
      if (done.length >= 3) check('add');
      draw();
    });
    host.querySelector('.ud-bar').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (b && !b.disabled) act(b.dataset.a);
    });
    const onKey = e => {
      if (!api.alive()) { window.removeEventListener('keydown', onKey); return; }
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); act('undo'); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); act('redo'); }
    };
    window.addEventListener('keydown', onKey);
    draw();
  },

  // A pretend browser: links, back, forward, reload, and typing an address.
  browser(host, _, api) {
    const tasks = [
      { id: 'link', zh: '點一個連結', en: 'link' },
      { id: 'back', zh: '回上一頁', en: 'back' },
      { id: 'fwd', zh: '再到下一頁', en: 'forward' },
      { id: 'reload', zh: '重新整理', en: 'reload' },
      { id: 'type', zh: '在網址列輸入網址，按 Enter', en: 'address bar', alt: '打 library.example.tw' },
    ];
    const pages = {
      'zoo.example.tw': { title: '🦁 動物園', body: '歡迎來到動物園！想看哪一種動物？', links: [['zoo.example.tw/panda', '🐼 看貓熊'], ['zoo.example.tw/penguin', '🐧 看企鵝']] },
      'zoo.example.tw/panda': { title: '🐼 貓熊館', body: '貓熊一天要吃很多竹子。', links: [['zoo.example.tw', '🏠 回動物園首頁']] },
      'zoo.example.tw/penguin': { title: '🐧 企鵝館', body: '企鵝不會飛，但是很會游泳。', links: [['zoo.example.tw', '🏠 回動物園首頁']] },
      'library.example.tw': { title: '📚 圖書館', body: '今天有說故事時間！', links: [] },
    };
    host.innerHTML = `
      <div class="w-lab">
        <div class="brw">
          <div class="br-bar">
            <button class="br-btn" data-a="back" aria-label="上一頁">←</button>
            <button class="br-btn" data-a="fwd" aria-label="下一頁">→</button>
            <button class="br-btn" data-a="reload" aria-label="重新整理">⟳</button>
            <form class="br-url" novalidate><span>🔒</span><input type="url" inputmode="url" autocapitalize="off" spellcheck="false" aria-label="網址列"></form>
          </div>
          <div class="br-page"></div>
          <div class="br-hint">
            <p>到圖書館網站：</p>
            <ol>
              <li data-s="1">點上面的網址列</li>
              <li data-s="2">打 <code>library.example.tw</code> <button class="br-sug" type="button">⌨️ 幫我打</button></li>
              <li data-s="3">按 <kbd>Enter</kbd>（iPad 鍵盤上是「前往」），才會出發 <button class="br-enter" type="button">⏎ Enter</button></li>
            </ol>
          </div>
          <div class="br-hist"></div>
        </div>
        <ul class="tasks"></ul>
      </div>`;
    const $ = sel => host.querySelector(sel);
    const check = checklist($('.tasks'), tasks, api);
    const hist = ['zoo.example.tw'];
    let at = 0, visits = 0;
    const show = (flash = false) => {
      const url = hist[at];
      const pg = pages[url] || { title: '😵 找不到網頁', body: '網址打錯了嗎？檢查一下拼字。', links: [] };
      $('.br-url input').value = url;
      $('.br-page').innerHTML = `<h4>${pg.title}</h4><p>${pg.body}</p>${pg.links.map(([u, t]) => `<button class="br-link" data-u="${u}">${t}</button>`).join('')}<small>看了 ${++visits} 次頁面</small>`;
      if (flash) $('.br-page').animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 300 });
      $('[data-a="back"]').disabled = at === 0;
      $('[data-a="fwd"]').disabled = at === hist.length - 1;
      $('.br-hist').innerHTML = '瀏覽紀錄：' + hist.map((u, i) => `<span class="${i === at ? 'hist-now' : ''}">${u.replace('.example.tw', '')}</span>`).join(' › ');
    };
    const go = url => {
      hist.splice(at + 1);
      hist.push(url);
      at = hist.length - 1;
      show(true);
    };
    $('.br-page').addEventListener('click', e => {
      const b = e.target.closest('[data-u]');
      if (b) { go(b.dataset.u); check('link'); }
    });
    $('.br-bar').addEventListener('click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      if (b.dataset.a === 'back') { at--; show(true); check('back'); }
      else if (b.dataset.a === 'fwd') { at++; show(true); check('fwd'); }
      else { show(true); check('reload', '頁面重新載入了一次'); }
    });
    const typed = url => {
      url = url.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!url) return;
      go(url);
      if (pages[url]) check('type');
    };
    // Which step of the address-bar hint is next: typing alone goes nowhere until Enter.
    const stepAt = n => host.querySelectorAll('.br-hint li').forEach(li => {
      li.classList.toggle('br-now', +li.dataset.s === n);
      li.classList.toggle('br-ok', +li.dataset.s < n);
    });
    const input = $('.br-url input');
    const enter = () => { typed(input.value); input.blur(); stepAt(0); };
    // Like a real address bar, a tap selects the whole address so typing replaces it.
    // Safari clears the selection on mouseup, so select again after it.
    let fresh = false;
    input.addEventListener('focus', () => { fresh = true; input.select(); stepAt(2); });
    input.addEventListener('mouseup', e => { if (fresh) { e.preventDefault(); input.select(); } fresh = false; });
    input.addEventListener('touchend', () => { if (fresh) setTimeout(() => input.select()); fresh = false; });
    input.addEventListener('input', () => stepAt(input.value.trim() ? 3 : 2));
    $('.br-url').addEventListener('submit', e => { e.preventDefault(); enter(); });
    $('.br-enter').onclick = () => {
      if (input.value.trim() === hist[at]) { stepAt(input === document.activeElement ? 2 : 1); shake($('.br-url')); return; }
      enter();
    };
    // Type the address one letter at a time, then wait for Enter.
    $('.br-sug').onclick = () => {
      const text = 'library.example.tw';
      let k = 0;
      input.value = '';
      stepAt(2);
      const type = () => {
        input.value = text.slice(0, ++k);
        if (k < text.length) api.later(type, 45);
        else { stepAt(3); pop($('.br-enter')); }
      };
      type();
    };
    stepAt(1);
    show();
  },
};
