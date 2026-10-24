const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const calm = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const shake = el => {
  if (calm() || !el.animate) return;
  el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
};

// A made-up product page. Each trick phrase is a button; tapping it names the trick.
// The countdown ticks for real and starts over when tapped, like a page reload.
function tricks(host, _, api) {
  const list = [
    { trick: '吊胃口', why: '故意不說完，讓你好奇到想點進去。' },
    { trick: '假數字', why: '「99%」是誰算的？沒有來源的數字，只是想讓你緊張。' },
    { trick: '製造緊張', why: '重新整理一下，倒數又從 09:59 開始。時間是假的，只是要你快點買。' },
    { trick: '怕買不到', why: '說快賣完，讓你來不及想清楚就下單。' },
    { trick: '從眾', why: '「大家都買了」不代表適合你，人數也可能是編的。' },
    { trick: '假權威', why: '哪一位醫生？在哪裡工作？查不到，就不能當證據。' },
  ];
  const btn = (i, text) => '<button class="ac-trick" data-ac-trick="' + i + '" aria-pressed="false">' + text + '</button>';
  host.innerHTML =
    '<div class="ac-demo">' +
      '<div class="ac-page">' +
        '<p class="ac-url">🔒 shop.example.tw/magic-pen</p>' +
        '<p class="ac-head">' + btn(0, '你絕對想不到！') + '這支筆讓寫作業變好玩</p>' +
        '<p class="ac-body">' + btn(1, '99% 的人都不知道') + '的祕密：🌈 魔法彩虹筆，一支能畫出 12 種顏色。</p>' +
        '<p class="ac-body">' + btn(2, '⏰ 限時倒數 <span class="ac-clock">09:59</span>') + btn(3, '🔥 最後 3 組！') + '</p>' +
        '<p class="ac-body">' + btn(4, '已經有 12,000 人買了') + '・' + btn(5, '👨‍⚕️ 名醫都推薦') + '</p>' +
      '</div>' +
      '<p class="ac-count">找到的套路：0/6</p>' +
      '<div class="ac-found"></div>' +
      '<p class="ac-status" role="status" aria-live="polite">點一點文案裡讓你「想馬上買」的字。</p>' +
    '</div>';
  const status = host.querySelector('.ac-status');
  const clock = host.querySelector('.ac-clock');
  const found = new Set();
  let left = 599;
  const draw = () => { clock.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); };
  const tick = () => {
    if (!api.alive()) return;
    left = left > 0 ? left - 1 : 599;
    draw();
    api.later(tick, 1000);
  };
  api.later(tick, 1000);

  host.querySelector('.ac-page').addEventListener('click', e => {
    const b = e.target.closest('[data-ac-trick]');
    if (!b) { status.textContent = '這裡是一般的介紹。再找找看讓你緊張或好奇的字。'; return; }
    const i = Number(b.dataset.acTrick);
    if (i === 2) { left = 599; draw(); }
    status.textContent = '「' + list[i].trick + '」：' + list[i].why;
    if (found.has(i)) return;
    found.add(i);
    b.setAttribute('aria-pressed', 'true');
    host.querySelector('.ac-found').insertAdjacentHTML('beforeend', '<span class="ac-tag">' + list[i].trick + '</span>');
    host.querySelector('.ac-count').textContent = '找到的套路：' + found.size + '/6';
    api.good();
    if (found.size === list.length) {
      status.textContent = '🎉 6 個套路都找到了！看到這些字，先停一下，再決定要不要買。';
      api.done();
    }
  });
}

// The trust ladder: tap a post, then tap the rung it belongs on.
function ladder(host, _, api) {
  const rungs = [
    { id: 'ad', icon: '📢', name: '廣告', sub: '有標示' },
    { id: 'paid', icon: '💰', name: '業配', sub: '收了錢或東西' },
    { id: 'hype', icon: '🎈', name: '誇大文案', sub: '說得太神奇' },
    { id: 'scam', icon: '🚨', name: '詐騙', sub: '想騙走錢' },
  ];
  const posts = [
    { icon: '📢', text: '「贊助｜文具店開幕，全館九折」', rung: 'ad', why: '有寫「贊助」，是老實標出來的廣告。' },
    { icon: '💬', text: '「這支筆我天天用！用我的折扣碼打八折」', rung: 'paid', why: '附折扣碼，作者可能拿到錢或東西，這是業配。' },
    { icon: '✏️', text: '「用了這支筆，考試保證一百分！」', rung: 'hype', why: '沒有東西能保證一百分，這是誇大的文案。' },
    { icon: '🥤', text: '「喝這罐飲料，一個月長高 10 公分」', rung: 'hype', why: '說得太神奇，又沒有證據，這是誇大的文案。' },
    { icon: '📱', text: '「iPad 一折！先匯款到個人帳戶才寄貨」', rung: 'scam', why: '太便宜，又要先匯款到個人帳戶，是詐騙。可以打 165 問問看。' },
  ];
  host.innerHTML =
    '<div class="ac-demo">' +
      '<div class="ac-posts">' + posts.map((p, i) => '<button class="ac-post" data-ac-post="' + i + '" aria-pressed="false"><span>' + p.icon + '</span>' + p.text + '</button>').join('') + '</div>' +
      '<div class="ac-ladder">' + rungs.map((r, i) =>
        '<button class="ac-rung" data-ac-rung="' + r.id + '" style="--ac-step:' + i + '">' +
          '<span class="ac-rung-name">' + r.icon + ' ' + r.name + '<small>' + r.sub + '</small></span>' +
          '<span class="ac-rung-items"></span>' +
        '</button>').join('') + '</div>' +
      '<p class="ac-status" role="status" aria-live="polite">先點一則貼文，再點它在階梯的哪一階。</p>' +
    '</div>';
  const status = host.querySelector('.ac-status');
  let selected = null, placed = 0;
  host.querySelector('.ac-posts').addEventListener('click', e => {
    const b = e.target.closest('[data-ac-post]');
    if (!b) return;
    if (selected) selected.setAttribute('aria-pressed', 'false');
    selected = selected === b ? null : b;
    if (selected) {
      selected.setAttribute('aria-pressed', 'true');
      status.textContent = '這則要放在哪一階？點階梯。';
    }
  });
  host.querySelector('.ac-ladder').addEventListener('click', e => {
    const rung = e.target.closest('[data-ac-rung]');
    if (!rung) return;
    if (!selected) { status.textContent = '先點上面的一則貼文。'; return; }
    const p = posts[Number(selected.dataset.acPost)];
    if (p.rung !== rung.dataset.acRung) {
      shake(selected);
      status.textContent = '再想想：這則有沒有標示？有沒有拿好處？說得神不神奇？有沒有要你先付錢？';
      api.bad();
      return;
    }
    rung.querySelector('.ac-rung-items').insertAdjacentHTML('beforeend', '<span class="ac-mini">' + p.icon + '</span>');
    selected.remove();
    selected = null;
    placed++;
    api.good();
    status.textContent = '✅ ' + p.why;
    if (placed === posts.length) {
      status.textContent = '🎉 越往下越要小心。到了「詐騙」，就不要相信、不要付錢，打 165 問問看。';
      api.done();
    }
  });
}

export default {
  ready: true,
  unit: {
    id: 'adcopy',
    part: 'basic',
    icon: '📣',
    color: '#862e9c',
    title: '行銷文案的套路',
    en: 'Marketing Copy Tricks',
    desc: '標題黨、偷偷的業配、假評論和可信度階梯',
    slides: [
      { id: 'tricks', title: '為什麼好想馬上買？', text: t('行銷文案', 'marketing copy') + '是為了讓你想買而寫的字。有些用' + t('標題黨', 'clickbait') + '的寫法吊你胃口、讓你緊張。點出 6 個套路！', widget: 'ac-tricks', params: {} },
      { id: 'hidden', title: '心得文，還是業配？', text: '把廣告藏在心得、影片或故事裡，叫做' + t('置入性行銷', 'product placement') + '。拿了好處要寫出來，可是有人不寫。分分看！', widget: 'inbox', params: {
        labels: ['📝 真心分享', '💰 可能是業配'],
        messages: [
          { from: '🧒 小安', text: '用了兩個月，筆芯很耐寫，可是筆蓋容易掉。這是我自己買的。', scam: false, why: '有優點也有缺點，還說是自己買的，比較像真心分享。' },
          { from: '🌟 閃亮姐姐', text: '超級推！用我的折扣碼 MIA88 打八折，連結在下面 👇', scam: true, why: '附上折扣碼，買的人越多，她可能拿越多錢。這很可能是業配。' },
          { from: '🎨 畫畫阿哲', text: '#合作 謝謝廠商送我試用。優點是顏色多，缺點是有點貴。', scam: true, why: '寫了「#合作」，這是業配。老實標出來，是對的做法。' },
          { from: '📷 好多帳號', text: '今天十幾個帳號都發同一句「人生必買的神奇筆」，配一樣的照片。', scam: true, why: '很多人同一天發一樣的文，常常是廠商一起找人發的業配。' },
          { from: '🙂 表哥', text: '這支筆我覺得普通，顏色不太準，我還是用原本的。', scam: false, why: '說了不好的地方，也沒有要你買，比較像真心分享。' },
        ],
      } },
      { id: 'reviews', title: '五顆星，都是真的嗎？', text: '買東西前，很多人會看' + t('評論', 'review') + '。可是' + t('假評論', 'fake review') + '也買得到，或用贈品換來。分分看，哪些是可疑的線索？', widget: 'sort', params: {
        rest: 'real',
        bins: [
          { id: 'fake', icon: '🚩', label: '可能是假評論' },
          { id: 'real', icon: '✅', label: '比較可信' },
        ],
        items: [
          { icon: '📋', label: '每則內容幾乎一模一樣', bin: 'fake' },
          { icon: '👻', label: '帳號沒有其他評論', bin: 'fake' },
          { icon: '🎁', label: '「留五星，送你贈品」', bin: 'fake' },
          { icon: '⚖️', label: '有優點，也有缺點', bin: 'real' },
          { icon: '📸', label: '附上自己拍的使用照片', bin: 'real' },
          { icon: '🗓️', label: '寫了用多久、怎麼用', bin: 'real' },
          { icon: '📅', label: '很多五星評論都在同一天', bin: 'fake' },
        ],
      } },
      { id: 'ladder', title: '可信度階梯', text: '廣告、業配、誇大文案、詐騙，像一個往下走的' + t('可信度階梯', 'trust ladder') + '，越往下越要小心。把每則貼文放到對的那一階！', widget: 'ac-ladder', params: {} },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '購物網站寫著「🔥 最後 3 組！倒數 05:00」，你可以怎麼想？',
        options: [
          { text: '✋ 先停一下，這可能是讓人緊張的文案', correct: true },
          { text: '⚡ 快買，不然就沒了' },
          { text: '🤝 倒數一定是真的，網站不會騙人' },
        ],
        explain: '倒數和「快賣完」常常是製造緊張的套路。真的需要，等一下再買也來得及。',
      } },
    ],
  },
  placement: {
    after: 'strangerdm',
    stage: 'seethrough',
    newStage: { id: 'seethrough', after: 'social', part: 'basic', icon: '🔍', title: '看穿行銷和詐騙', en: 'See Through Marketing and Scams' },
  },
  prerequisites: ['influencers', 'search', 'fakes'],
  readme: 'Spot marketing-copy tricks and clickbait, tell honest reviews from disguised sponsored posts and fake reviews, and place posts on a trust ladder from labeled ads to scams.',
  changelog: '新增「行銷文案的套路」：找出標題黨和倒數計時的套路，分辨心得文和偷偷的業配、看穿假評論，再用「可信度階梯」從廣告一路分到詐騙。',
  widgets: { 'ac-tricks': tricks, 'ac-ladder': ladder },
  checks: {
    tricks: [
      click('.ac-url'), expect('.ac-status', '一般的介紹'),
      click('[data-ac-trick="0"]'), click('[data-ac-trick="1"]'), click('[data-ac-trick="2"]'), expect('.ac-clock', '09:5'),
      click('[data-ac-trick="3"]'), click('[data-ac-trick="4"]'), click('[data-ac-trick="5"]'),
      expect('.ac-count', '6/6'), expect('.ac-status', '都找到了'),
    ],
    hidden: [
      click('.msg-card[data-i="0"] [data-v="scam"]'),
      click('.msg-card[data-i="0"] [data-v="ok"]'),
      click('.msg-card[data-i="1"] [data-v="scam"]'),
      click('.msg-card[data-i="2"] [data-v="scam"]'),
      click('.msg-card[data-i="3"] [data-v="scam"]'),
      click('.msg-card[data-i="4"] [data-v="ok"]'),
      expect('.ib-left', '全部判斷完了'),
    ],
    ladder: [
      click('[data-ac-rung="ad"]'), expect('.ac-status', '先點上面'),
      click('[data-ac-post="4"]'), click('[data-ac-rung="ad"]'), expect('.ac-status', '再想想'),
      click('[data-ac-rung="scam"]'), expect('.ac-status', '165'),
      click('[data-ac-post="0"]'), click('[data-ac-rung="ad"]'),
      click('[data-ac-post="1"]'), click('[data-ac-rung="paid"]'),
      click('[data-ac-post="2"]'), click('[data-ac-rung="hype"]'),
      click('[data-ac-post="3"]'), click('[data-ac-rung="hype"]'),
      { action: 'expectCount', selector: '.ac-mini', count: 5 },
      expect('.ac-status', '越往下越要小心'),
    ],
  },
  css: `
.ac-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 12px; font-size: 18px; line-height: 1.5; }
.ac-page { background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 12px 16px; display: grid; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.05); }
.ac-page p { margin: 0; }
.ac-url { font-family: ui-monospace, Menlo, monospace; font-size: 15px; color: var(--ink-2); background: #f1f3f5; border-radius: 10px; padding: 4px 10px; }
.ac-head { font-size: 21px; font-weight: 800; }
.ac-body { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
.ac-trick { min-height: 48px; min-width: 44px; padding: 6px 12px; font: inherit; font-weight: 800; color: #c2255c; background: #fff0f6; border: 2px dashed #f783ac; border-radius: 12px; }
.ac-head .ac-trick { margin-right: 6px; }
.ac-trick[aria-pressed=true] { color: var(--ink); background: #fff3bf; border: 2px solid #fab005; }
.ac-clock { font-family: ui-monospace, Menlo, monospace; }
.ac-count { margin: 0; font-weight: 800; color: var(--c); }
.ac-found { display: flex; flex-wrap: wrap; gap: 8px; min-height: 36px; }
.ac-tag { padding: 4px 12px; border-radius: 999px; background: var(--c); color: #fff; font-size: 16px; font-weight: 700; }
.ac-status { margin: 0; padding: 12px 16px; border-radius: 14px; background: #f3f0ff; min-height: 76px; }
.ac-posts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ac-post { min-height: 56px; display: flex; align-items: center; gap: 8px; text-align: left; padding: 6px 12px; font: inherit; font-size: 16px; font-weight: 700; background: var(--card); border: 2px solid var(--line); border-radius: 14px; box-shadow: 0 3px 0 var(--line); }
.ac-post span { font-size: 24px; }
.ac-post[aria-pressed=true] { border-color: #1c7ed6; background: #e7f5ff; }
.ac-ladder { display: grid; gap: 6px; }
.ac-rung { min-height: 56px; display: flex; align-items: center; gap: 10px; padding: 4px 12px; font: inherit; text-align: left; background: var(--card); border: 2px solid var(--line); border-left: 10px solid hsl(calc(140 - var(--ac-step) * 45) 60% 45%); border-radius: 14px; margin-left: calc(var(--ac-step) * 18px); }
.ac-rung-name { min-width: 150px; font-weight: 800; display: flex; flex-direction: column; line-height: 1.25; }
.ac-rung-name small { font-size: 15px; font-weight: 600; color: var(--ink-2); }
.ac-rung-items { display: flex; flex-wrap: wrap; gap: 4px; font-size: 26px; }
.ac-mini { line-height: 1; }
@media (max-width: 899px) {
  .ac-demo { gap: 10px; }
  .ac-rung { margin-left: calc(var(--ac-step) * 10px); }
}
@media (prefers-reduced-motion: reduce) {
  .ac-post, .ac-rung, .ac-trick { transition: none; }
}
  `,
};
