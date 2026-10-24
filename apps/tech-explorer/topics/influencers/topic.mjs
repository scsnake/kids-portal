const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const shake = el => {
  if (!still()) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 });
};

// A feed of six posts. Tap the four that carry a sponsorship label.
function feed(host, _, api) {
  const posts = [
    { who: '🧳 旅行的小芸', text: '帶著新行李箱去花蓮！', tag: '#合作 謝謝熊熊行李箱' },
    { who: '🍛 阿凱', text: '今天自己煮咖哩，有點太辣 😂' },
    { who: '🎮 實況主小飛', text: '新遊戲搶先玩，超好玩！', badge: '付費合作' },
    { who: '🧴 美妝的 Mia', text: '擦了一週的心得……', tag: '本篇由果果保養品提供' },
    { who: '⛰️ 同學小安', text: '週末去爬山，好累但好美' },
    { who: '✏️ 文具控阿哲', text: '這支筆超好寫！', tag: '#贊助' },
  ];
  const total = posts.filter(p => p.tag || p.badge).length;
  const found = new Set();
  host.innerHTML = `
    <div class="if-demo">
      <div class="if-feed">${posts.map((p, i) => `
        <button class="if-post" data-if-post="${i}">
          ${p.badge ? `<span class="if-badge">${p.badge}</span>` : ''}
          <b>${p.who}</b>
          <span>${p.text}</span>
          ${p.tag ? `<span class="if-tag">${p.tag}</span>` : ''}
        </button>`).join('')}</div>
      <p class="if-status if-feed-status" role="status" aria-live="polite">點出有業配標示的貼文。找到 0/${total}</p>
    </div>`;
  const status = host.querySelector('.if-feed-status');
  host.querySelectorAll('[data-if-post]').forEach(b => b.onclick = () => {
    const i = +b.dataset.ifPost;
    if (found.has(i)) return;
    const p = posts[i];
    if (!p.tag && !p.badge) {
      shake(b);
      api.bad();
      status.textContent = `這篇沒有合作標示，是一般分享。找到 ${found.size}/${total}`;
      return;
    }
    found.add(i);
    b.classList.add('if-found');
    api.good();
    if (found.size < total) {
      status.textContent = `找到了：「${p.tag || p.badge}」。找到 ${found.size}/${total}`;
      return;
    }
    status.textContent = `✅ 找到 ${total}/${total}！收了錢或免費東西來推薦，在台灣應該說清楚，這是公平會的規定。`;
    api.done();
  });
}

// A drawn selfie with four edit buttons. Turn each one on at least once.
function filter(host, _, api) {
  const edits = [
    { id: 'smooth', label: '✨ 磨皮' },
    { id: 'eyes', label: '👀 放大眼睛' },
    { id: 'slim', label: '🔻 瘦臉' },
    { id: 'bg', label: '🏖️ 換背景' },
  ];
  const on = new Set(), tried = new Set();
  let finished = false;
  host.innerHTML = `
    <div class="if-demo if-filter">
      <div class="if-photo">
        <svg viewBox="0 0 200 220" role="img" aria-label="一張畫出來的自拍照">
          <g class="if-room"><rect width="200" height="220" fill="#dee2e6"/><rect x="12" y="20" width="44" height="34" fill="#adb5bd"/><rect x="150" y="30" width="36" height="52" fill="#ced4da"/><rect x="140" y="90" width="50" height="10" fill="#868e96"/></g>
          <g class="if-beach"><rect width="200" height="140" fill="#a5d8ff"/><rect y="140" width="200" height="80" fill="#ffe8a1"/><circle cx="165" cy="35" r="18" fill="#ffd43b"/><path d="M0 140 Q50 128 100 140 T200 140" fill="#74c0fc"/></g>
          <path d="M40 220 Q100 170 160 220 Z" fill="#4dabf7"/>
          <g class="if-face">
            <ellipse cx="100" cy="112" rx="58" ry="70" fill="#f8c9a0"/>
            <path d="M42 100 Q50 34 100 36 Q150 34 158 100 Q140 64 100 62 Q60 64 42 100 Z" fill="#5c3d2e"/>
            <g class="if-spots" fill="#d9480f" opacity=".55"><circle cx="70" cy="132" r="3"/><circle cx="78" cy="140" r="2.5"/><circle cx="128" cy="134" r="3"/><circle cx="120" cy="146" r="2.5"/><circle cx="112" cy="88" r="2.5"/></g>
            <g class="if-eye"><circle cx="78" cy="108" r="7" fill="#1d2738"/><circle cx="80" cy="106" r="2" fill="#fff"/></g>
            <g class="if-eye"><circle cx="122" cy="108" r="7" fill="#1d2738"/><circle cx="124" cy="106" r="2" fill="#fff"/></g>
            <path d="M82 148 Q100 162 118 148" fill="none" stroke="#a61e4d" stroke-width="4" stroke-linecap="round"/>
          </g>
        </svg>
        <span class="if-edited" hidden></span>
      </div>
      <div class="if-tools">${edits.map(e => `<button class="option" data-if-edit="${e.id}" aria-pressed="false">${e.label}</button>`).join('')}</div>
      <p class="if-status if-filter-status" role="status" aria-live="polite">這是原本的照片。四個按鈕都按按看！</p>
    </div>`;
  const $ = sel => host.querySelector(sel);
  const box = $('.if-filter');
  host.querySelectorAll('[data-if-edit]').forEach(b => b.onclick = () => {
    const id = b.dataset.ifEdit;
    if (on.has(id)) on.delete(id); else { on.add(id); tried.add(id); }
    b.setAttribute('aria-pressed', String(on.has(id)));
    box.classList.toggle('if-' + id, on.has(id));
    $('.if-edited').hidden = !on.size;
    $('.if-edited').textContent = `修過 ${on.size} 處`;
    if (tried.size === edits.length) {
      $('.if-filter-status').textContent = '✅ 按幾下，就換了一張臉和一個地方。網路上的照片很多都修過，看起來完美，不一定是真的樣子。';
      if (!finished) { finished = true; api.good(); api.done(); }
    } else {
      $('.if-filter-status').textContent = `已經試了 ${tried.size}/${edits.length} 種修圖。再試試別的按鈕！`;
    }
  });
}

export default {
  ready: true,
  unit: {
    id: 'influencers',
    part: 'basic',
    icon: '🌟',
    color: '#b35000',
    title: '網紅、業配和比較',
    en: 'Influencers, Sponsored Posts, and Comparison',
    desc: '找出業配標示、看穿修圖，別拿自己跟別人的精選比',
    slides: [
      { id: 'feed', title: '這篇是業配嗎？', text: t('網紅', 'influencer') + '是在網路上有很多人追蹤的人。廠商付錢或送東西請他推薦，這種貼文叫' + t('業配', 'sponsored post') + '，應該標示清楚。找出有標示的業配！', widget: 'if-feed', params: {} },
      { id: 'hidden', title: '沒有標示，也可能是業配', text: '有些業配沒有標示。只說好話、附上折扣碼或購買連結，都是線索。下一站會學更多行銷的套路。看看每一篇！', widget: 'inbox', params: {
        labels: ['🙂 一般分享', '🤔 可能是業配'],
        messages: [
          { from: '🍜 小安', text: '這家麵有點鹹，但老闆人很好，下次想吃別的口味。', scam: false, why: '有說好也有說不好，沒有連結也沒有折扣碼，比較像一般分享。' },
          { from: '🎧 實況主小飛', text: '這副耳機完美，沒有缺點！用我的折扣碼 FEI88 打 8 折 👉 連結', scam: true, why: '只說好話，又有折扣碼和購買連結。就算沒寫 #合作，也可能是業配。' },
          { from: '👟 阿凱', text: '穿了三年的舊球鞋，鞋底快磨平了，該換了。', scam: false, why: '自己用很久的東西，也沒有叫你去買。' },
          { from: '🧴 美妝的 Mia', text: '全網最好用！我每天都用，連結在留言，優惠只到今天！', scam: true, why: '「最好用」、購買連結、限時優惠，都是賣東西的話。' },
        ],
      } },
      { id: 'filter', title: '照片修過了嗎？', text: '很多照片都用過' + t('濾鏡', 'filter') + '或' + t('修圖', 'photo editing') + '：皮膚變光滑、眼睛變大、臉變瘦，連背景都能換。每個按鈕都試試看！', widget: 'if-filter', params: {} },
      { id: 'compare', title: '別人的精選，不是全部', text: '網紅可能拍了 30 張，只貼最好看的 1 張。一直看別人的精選，會覺得自己比較差，或怕錯過什麼，這叫' + t('錯失恐懼', 'FOMO') + '。分分看！', widget: 'sort', params: {
        intro: '📸 拍了 30 張 → 🌟 只貼出 1 張',
        bins: [
          { id: 'good', icon: '💚', label: '讓心情好一點' },
          { id: 'bad', icon: '😞', label: '讓心情更糟' },
        ],
        rest: 'good',
        items: [
          { icon: '💭', label: '提醒自己「這是精選」', bin: 'good' },
          { icon: '🚶', label: '放下手機，出去走走', bin: 'good' },
          { icon: '🗣️', label: '跟朋友或家人聊聊', bin: 'good' },
          { icon: '🙈', label: '少看讓你難過的帳號', bin: 'good' },
          { icon: '📏', label: '一直拿自己跟網紅比', bin: 'bad' },
          { icon: '🌙', label: '怕錯過，熬夜一直滑', bin: 'bad' },
          { icon: '👍', label: '為了按讚數，一直修自己的照片', bin: 'bad' },
        ],
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '你喜歡的網紅說：「這副耳機超好用！」貼文寫著 #合作。這代表什麼？',
        options: [
          { text: '🔍 他有拿到錢或東西。可以參考，但自己再查一查', correct: true },
          { text: '🏆 這一定是最好的耳機' },
          { text: '🙅 有 #合作 的貼文，全部都是假的' },
        ],
        explain: '有標示是誠實的做法，但業配本來就會說好話。買之前，多看幾個來源再決定。',
      } },
    ],
  },
  placement: { after: 'behindscreen', stage: 'social' },
  prerequisites: ['behindscreen', 'search', 'photoshare'],
  readme: 'Influencers and sponsored posts: find disclosure labels, spot unlabeled ads by their clues, see how filters and edits change a photo, and handle comparison and FOMO.',
  changelog: '新增「網紅、業配和比較」：找出 #合作、#贊助等業配標示，認出沒標示的業配線索，動手修一張畫出來的自拍，也學會別拿自己跟別人的精選比。',
  widgets: { 'if-feed': feed, 'if-filter': filter },
  checks: {
    feed: [click('[data-if-post="1"]'), expect('.if-feed-status', '一般分享'), click('[data-if-post="0"]'), click('[data-if-post="2"]'), click('[data-if-post="3"]'), click('[data-if-post="5"]'), expect('.if-feed-status', '找到 4/4')],
    hidden: [click('.msg-card[data-i="0"] [data-v="ok"]'), click('.msg-card[data-i="1"] [data-v="scam"]'), click('.msg-card[data-i="2"] [data-v="ok"]'), click('.msg-card[data-i="3"] [data-v="scam"]'), expect('.ib-left', '全部判斷完了')],
    filter: [click('[data-if-edit="smooth"]'), expect('.if-filter-status', '1/4'), click('[data-if-edit="eyes"]'), click('[data-if-edit="slim"]'), click('[data-if-edit="bg"]'), expect('.if-filter-status', '不一定是真的樣子'), expect('.if-edited', '修過 4 處')],
  },
  css: `
.if-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 12px; font-size: 17px; line-height: 1.45; }
.if-feed { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.if-post { position: relative; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; text-align: left; min-height: 104px; padding: 12px; background: var(--card); border: 2px solid var(--line); border-radius: 14px; box-shadow: 0 3px 0 var(--line); font-size: 16px; transition: border-color 200ms, background 200ms; }
.if-post b { font-size: 16px; }
.if-tag, .if-badge { font-size: 15px; font-weight: 700; color: var(--ink-2); }
.if-badge { padding: 0 8px; border-radius: 6px; background: #f1f3f5; }
.if-post.if-found { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, white); }
.if-post.if-found .if-tag, .if-post.if-found .if-badge { color: var(--c); background: color-mix(in srgb, var(--c) 16%, white); padding: 0 8px; border-radius: 6px; }
.if-status { margin: 0; padding: 12px 16px; border-radius: 14px; background: #f8f0e8; min-height: 52px; }
.if-filter { grid-template-columns: 240px 1fr; align-items: center; }
.if-filter .if-status { grid-column: 1 / -1; }
.if-photo { position: relative; border-radius: 18px; overflow: hidden; border: 3px solid var(--line); background: #fff; }
.if-photo svg { display: block; width: 100%; height: auto; }
.if-edited { position: absolute; top: 8px; left: 8px; padding: 2px 10px; border-radius: 8px; background: var(--c); color: #fff; font-size: 15px; font-weight: 700; }
.if-tools { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.if-tools .option { text-align: center; font-size: 17px; }
.if-tools .option[aria-pressed=true] { border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, white); }
.if-beach { opacity: 0; }
.if-room, .if-beach, .if-spots, .if-face, .if-eye { transition: opacity 300ms, transform 300ms; }
.if-face, .if-eye { transform-box: fill-box; transform-origin: center; }
.if-bg .if-beach { opacity: 1; }
.if-bg .if-room { opacity: 0; }
.if-smooth .if-spots { opacity: 0; }
.if-eyes .if-eye { transform: scale(1.45); }
.if-slim .if-face { transform: scaleX(.86); }
@media (max-width: 899px) {
  .if-filter { grid-template-columns: 200px 1fr; }
}
@media (max-width: 600px) {
  .if-filter { grid-template-columns: 1fr; }
  .if-photo { max-width: 200px; justify-self: center; }
}
@media (prefers-reduced-motion: reduce) {
  .if-post, .if-room, .if-beach, .if-spots, .if-face, .if-eye { transition: none; }
}
  `,
};
