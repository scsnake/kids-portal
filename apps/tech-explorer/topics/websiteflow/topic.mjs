// Topic package: websiteflow. Sign up once, log in for a session ticket, browse, log out.
// Every name, site, password and ticket below is fictional sample data.
const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const P = 'wf';
const SITE = 'library.example.tw';
const USER = 'xiaoan.demo';
const BOOKS = ['《恐龍大探險》', '《海底的燈》', '《會算數的貓》'];

const base = (p) => `
.${p}-root{--a:var(--c,#1d2738);container-type:inline-size;box-sizing:border-box;width:100%;max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:10px;font-size:16px;line-height:1.45;color:#1d2738;text-align:left}
.${p}-root *{box-sizing:border-box}
.${p}-root button{min-height:52px;min-width:52px;padding:8px 14px;border:2px solid #e6dfd0;border-radius:14px;background:#fff;color:#1d2738;font:inherit;font-size:16px;line-height:1.25;box-shadow:0 3px 0 #e6dfd0;cursor:pointer;touch-action:manipulation;transition:transform .12s ease,box-shadow .12s ease}
.${p}-root button:active{transform:translateY(2px);box-shadow:0 1px 0 #e6dfd0}
.${p}-root button:disabled{opacity:.55;cursor:default;transform:none}
.${p}-root button:focus-visible{outline:3px solid var(--a);outline-offset:2px}
.${p}-root .${p}-go{background:var(--a);border-color:transparent;color:#fff;font-weight:700;box-shadow:0 3px 0 rgba(0,0,0,.28)}
.${p}-root .${p}-on{border-color:var(--a);background:#fff8e6;font-weight:700}
.${p}-root .${p}-row{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:stretch;justify-content:flex-start}
.${p}-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.${p}-k{font-size:15px;color:#4a5568}
.${p}-status{min-height:52px;padding:10px 14px;border:2px dashed #e6dfd0;border-radius:14px;background:#fff;font-size:16px}
.${p}-status.ok{border-style:solid;border-color:#2b8a3e;background:#ebfbee}
.${p}-status.bad{border-style:solid;border-color:#e03131;background:#fff5f5}
.${p}-pop{animation:${p}Pop .35s ease-out both}
.${p}-shake{animation:${p}Shake .4s ease-in-out}
@keyframes ${p}Pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
@keyframes ${p}Shake{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@media (prefers-reduced-motion:reduce){.${p}-root *,.${p}-root *::before,.${p}-root *::after{animation:none!important;transition:none!important}}
`;

function setup(host, api) {
  const container = document.createElement('div');
  container.className = `${P}-root`;
  container.innerHTML = `<div class="gemini-tag" data-created-by="gemini"></div><div class="${P}-slot"></div>`;
  host.replaceChildren(container);
  const root = container.querySelector(`.${P}-slot`);
  let finished = false;
  const finish = () => {
    if (finished || (api.alive && !api.alive())) return;
    finished = true;
    api.done();
  };
  const on = (fn) => container.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (b && container.contains(b) && !b.disabled) fn(b.dataset.a, b);
  });
  return { root, finish, on };
}

const st = (msg, kind = '') => `<div class="${P}-status ${kind}" role="status">${msg}</div>`;
const win = (url, body, chip = '') => `<div class="wf-win"><div class="wf-bar"><i></i><i></i><i></i><span class="wf-url wf-mono">${url}</span>${chip}</div><div class="wf-body">${body}</div></div>`;
const srv = (body) => `<div class="wf-srv"><div class="wf-srv-h">🗄️ 網站伺服器</div>${body}</div>`;
const field = (k, v, note = '') => `<div class="wf-field"><span class="wf-k">${k}</span><b class="wf-mono">${v}</b>${note ? `<span class="wf-note">${note}</span>` : ''}</div>`;
const chip = (id) => `<span class="wf-chip">🎟️ ${id}</span>`;

const widgets = {
  wfRegister(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { made: false, again: false };
    const render = () => {
      const form = `<div class="wf-h">📝 建立新帳號</div>
        ${field('使用者名稱', USER)}${field('Email', 'xiaoan@example.tw')}${field('密碼', '●●●●●●●●', '示範用假密碼')}
        ${s.made
          ? '<button type="button" class="wf-reg-again" data-a="again">再按一次「建立帳號」</button>'
          : '<button type="button" class="wf-go wf-reg-btn" data-a="reg">建立帳號</button>'}`;
      const rows = ['mei.demo', 'leo.demo'].map((n) => `<li class="wf-acct">🧑 ${n}</li>`).join('')
        + (s.made ? `<li class="wf-acct wf-acct-new ${s.again ? '' : 'wf-pop'}">🧒 ${USER} <span class="wf-tag">新的</span></li>` : '');
      const warn = s.again ? `<div class="wf-warn wf-shake">⚠️ ${USER} 已經存在</div>` : '';
      const msg = s.again
        ? '🎉 這個名稱已經有帳號了。註冊只做一次，以後都用「登入」。'
        : s.made
          ? '✅ 註冊完成！伺服器多了一個帳號。註冊不等於登入。再按一次看看會怎樣？'
          : '表單已經填好假的示範資料。按「建立帳號」試試看！';
      root.innerHTML = `<div class="wf-two">${win(`${SITE}/signup`, form)}
        ${srv(`<div class="wf-k">帳號清單（示範）</div><ul class="wf-list">${rows}</ul>${warn}`)}</div>
        ${st(msg, s.again ? 'ok' : '')}`;
    };
    on((a) => {
      if (a === 'reg') s.made = true;
      if (a === 'again') { s.again = true; finish(); }
      render();
    });
    render();
  },

  wfLogin(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { r: '' };
    const render = () => {
      const ok = s.r === 'ok';
      const body = ok
        ? `<div class="wf-h wf-pop">👋 歡迎，小安！</div><div class="wf-k">瀏覽器的票夾（Cookie）</div>
           <div class="wf-jar"><span class="wf-ticket wf-pop">🎟️ 票 #A7F3</span></div>`
        : `<div class="wf-h">🔑 登入</div>${field('使用者名稱', USER)}${field('密碼', '●●●●●●●●', '示範')}
           <div class="wf-row"><button type="button" class="wf-login-bad" data-a="bad">用打錯的密碼登入</button>
           <button type="button" class="wf-go wf-login-ok" data-a="ok">用正確密碼登入</button></div>`;
      const check = s.r === 'bad'
        ? '<div class="wf-warn wf-shake">🔍 比對密碼… ❌ 不符合，不發票</div>'
        : ok ? '<div class="wf-good wf-pop">🔍 比對密碼… ✅ 符合</div>' : '<div class="wf-k">等待登入…</div>';
      const tickets = ok
        ? `<li class="wf-srv-ticket wf-pop">🎟️ #A7F3 → ${USER}（有效）</li>`
        : '<li class="wf-dead">（還沒有）</li>';
      const msg = ok
        ? '🎉 登入成功！密碼對了，伺服器發給瀏覽器一張工作階段票。'
        : s.r === 'bad'
          ? '❌ 密碼不對，伺服器不給票。換正確的密碼試試！'
          : '帳號已經建好了。先試試打錯的密碼，再用正確的密碼登入！';
      root.innerHTML = `<div class="wf-two">${win(`${SITE}/login`, body)}
        ${srv(`<div class="wf-k">帳號：<b class="wf-mono">${USER}</b> ✅</div>${check}<div class="wf-k">發出的票</div><ul class="wf-list">${tickets}</ul>`)}</div>
        ${st(msg, ok ? 'ok' : s.r === 'bad' ? 'bad' : '')}`;
    };
    on((a) => {
      s.r = a;
      if (a === 'ok') finish();
      render();
    });
    render();
  },

  wfPages(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const PAGES = {
      home: { name: '首頁', path: '/', html: '<div class="wf-h">📚 小星圖書館（示範）</div><div>今天推薦：《月亮上的兔子》</div>' },
      shelf: { name: '我的書架', path: '/shelf', html: `<div class="wf-h">📖 我的書架</div><div>借閱中 3 本：${BOOKS.join('、')}</div>` },
      profile: { name: '個人資料', path: '/profile', html: `<div class="wf-h">🧒 個人資料</div><div>帳號：<span class="wf-mono">${USER}</span>・暱稱：小安</div>` },
    };
    const s = { page: 'home', seen: new Set() };
    const render = () => {
      const p = PAGES[s.page];
      const tabs = Object.keys(PAGES).map((k) => `<button type="button" class="wf-tab wf-tab-${k} ${k === s.page ? 'wf-on' : ''}" data-a="${k}">${PAGES[k].name}</button>`).join('');
      const req = s.seen.size
        ? `<div class="wf-req wf-pop"><div>📨 瀏覽器：<span class="wf-mono">GET ${p.path}</span> ＋ 🎟️ #A7F3</div><div>🗄️ 伺服器：票有效，是 ${USER} ✅</div></div>`
        : '<div class="wf-req wf-k">點上面的分頁換頁，看看瀏覽器送出什麼。</div>';
      const n = ['shelf', 'profile'].filter((k) => s.seen.has(k)).length;
      const msg = n === 2
        ? '🎉 換了好幾頁，一次都不用再打密碼，因為每個請求都帶著票。'
        : n === 1 ? '✅ 伺服器看到票就知道是你。再換另一個私人頁面！' : '你已經登入了。換到「我的書架」和「個人資料」看看！';
      root.innerHTML = `<div class="wf-row wf-tabs">${tabs}</div>
        ${win(`${SITE}${p.path}`, `<div class="wf-page wf-pop">${p.html}</div>`, chip('#A7F3'))}
        ${req}
        <div class="wf-row wf-count"><span>🔑 輸入密碼的次數：<b>0</b></span><span>看過的私人頁面：<b>${n}</b> / 2</span></div>
        ${st(msg, n === 2 ? 'ok' : '')}`;
    };
    on((a) => {
      s.page = a;
      s.seen.add(a);
      if (s.seen.has('shelf') && s.seen.has('profile')) finish();
      render();
    });
    render();
  },

  wfLogout(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { ph: 'in' };
    const render = () => {
      const out = s.ph === 'out';
      const screen = out
        ? '<div class="wf-screen wf-pop"><div class="wf-h">🔒 你已登出</div><div>請先登入，才能看到書架。</div></div>'
        : `<div class="wf-screen ${s.ph === 'back' ? 'wf-pop' : ''}"><div class="wf-h">📖 我的書架</div><ul class="wf-list">${BOOKS.map((b) => `<li>${b}</li>`).join('')}</ul></div>`;
      const tickets = s.ph === 'in'
        ? '<li class="wf-srv-ticket">🎟️ #A7F3（有效）</li>'
        : out
          ? '<li class="wf-dead wf-pop">🎟️ <s>#A7F3</s>（已結束）</li>'
          : '<li class="wf-dead">🎟️ <s>#A7F3</s>（已結束）</li><li class="wf-srv-ticket wf-pop">🎟️ #C91B（新的票，有效）</li>';
      const btn = s.ph === 'in'
        ? '<div class="wf-row"><button type="button" class="wf-logout" data-a="out">登出</button></div>'
        : out ? '<div class="wf-row"><button type="button" class="wf-go wf-relogin" data-a="back">再登入一次</button></div>' : '';
      const msg = s.ph === 'in'
        ? '書架上有你借的書。按「登出」，看看左右兩邊各變了什麼！'
        : out
          ? '✅ 票結束了，畫面上看不到書架。可是伺服器上的帳號和書架資料都還在。再登入看看！'
          : '🎉 再登入就拿到一張新票，書架一本都沒少。登出只結束票，不會刪掉帳號。';
      root.innerHTML = `<div class="wf-two">${win(`${SITE}/shelf`, screen, out ? '' : chip(s.ph === 'in' ? '#A7F3' : '#C91B'))}
        ${srv(`<div class="wf-k">帳號：<b class="wf-mono">${USER}</b> ✅ 還在</div><div class="wf-k wf-srv-books">書架資料：${BOOKS.length} 本 ✅ 還在</div><div class="wf-k">票</div><ul class="wf-list">${tickets}</ul>`)}</div>
        ${btn}${st(msg, s.ph === 'back' ? 'ok' : '')}`;
    };
    on((a) => {
      if (a === 'out' && s.ph === 'in') s.ph = 'out';
      if (a === 'back' && s.ph === 'out') { s.ph = 'back'; finish(); }
      render();
    });
    render();
  },

  wfCompare(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const ROWS = ['📱 這台裝置上的票（Cookie）', '📱 這台瀏覽器的網站儲存和紀錄', '🗄️ 伺服器上的帳號', '🗄️ 伺服器上的書架資料'];
    const ACTS = {
      logout: { name: '登出', keep: [0, 1, 1, 1], note: '登出只結束這台裝置的票。' },
      clear: { name: '清除瀏覽資料', keep: [0, 0, 1, 1], note: '此例選了 Cookie、網站儲存和紀錄，所以也登出了；伺服器上的帳號不受影響。' },
      delete: { name: '刪除帳號', keep: [0, 1, 0, 0], note: '此例把帳號和書架資料刪掉。真實網站仍可能依規定保留部分紀錄，請看刪除說明。' },
    };
    const s = { last: '', tried: new Set() };
    const render = () => {
      const act = ACTS[s.last];
      const btns = Object.keys(ACTS).map((k) => `<button type="button" class="wf-act wf-act-${k} ${k === s.last ? 'wf-on' : ''}" data-a="${k}">${ACTS[k].name}${s.tried.has(k) ? ' ✓' : ''}</button>`).join('');
      const rows = ROWS.map((r, i) => {
        const keep = act ? act.keep[i] : 1;
        return `<div class="wf-tr"><span>${r}</span><b class="wf-cell ${keep ? '' : 'wf-gone wf-pop'}">${keep ? '✅ 還在' : '❌ 沒了'}</b></div>`;
      }).join('');
      const head = act ? `從「已登入」開始，按下「${act.name}」之後：` : '現在：小安已經登入。';
      const done = s.tried.size === 3;
      const msg = done
        ? '🎉 三種都試過了：登出、清除瀏覽資料、刪除帳號，影響的地方不一樣。'
        : act ? `${act.note} 還有 ${3 - s.tried.size} 種沒試。` : '三個按鈕都按按看，比比哪些東西還在！';
      root.innerHTML = `<div class="wf-k">這是簡化模擬。清除的項目可以選；真實網站刪除帳號後，也可能保留部分紀錄。</div><div class="wf-row wf-acts">${btns}</div>
        <div class="wf-tbl"><div class="wf-k">${head}</div>${rows}</div>
        ${st(msg, done ? 'ok' : '')}`;
    };
    on((a) => {
      s.last = a;
      s.tried.add(a);
      if (s.tried.size === 3) finish();
      render();
    });
    render();
  },
};

const css = base(P) + `
.wf-two{display:grid;grid-template-columns:1.2fr 1fr;gap:10px;align-items:start}
@container (max-width:540px){.wf-two{grid-template-columns:1fr}}
.wf-win{background:#fff;border:2px solid #e6dfd0;border-radius:18px;overflow:hidden;box-shadow:0 2px 8px rgba(29,39,56,.06)}
.wf-bar{display:flex;align-items:center;gap:6px;min-height:42px;padding:6px 10px;background:#f3eee3;border-bottom:2px solid #e6dfd0}
.wf-bar i{flex:none;width:10px;height:10px;border-radius:50%;background:#d6cfc0}
.wf-url{flex:1;min-width:0;padding:2px 10px;border-radius:10px;background:#fff;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wf-chip{flex:none;padding:1px 10px;border:2px solid var(--a);border-radius:999px;background:#e6fcf5;font-size:15px}
.wf-body{display:flex;flex-direction:column;gap:8px;padding:10px 12px}
.wf-h{font-size:17px;font-weight:700}
.wf-field{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:6px 10px;border:2px solid #e6dfd0;border-radius:12px;background:#fffdf8}
.wf-note{font-size:15px;color:#5c6675}
.wf-srv{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:2px solid #cfd8e3;border-radius:18px;background:#f4f7fb}
.wf-srv-h{font-weight:700}
.wf-root .wf-list{display:flex;flex:none;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;border:0;border-radius:0;background:transparent}
.wf-list li{padding:4px 10px;border:1px solid #e6dfd0;border-radius:10px;background:#fff}
.wf-list li.wf-acct-new,.wf-list li.wf-srv-ticket{border:2px solid var(--a);background:#e6fcf5}
.wf-list li.wf-dead{color:#5c6675;background:#f8f9fa}
.wf-tag{font-size:15px;font-weight:700;color:var(--a)}
.wf-warn{font-weight:700;color:#c92a2a}
.wf-good{font-weight:700;color:#2b8a3e}
.wf-jar{display:flex;gap:6px}
.wf-ticket{display:inline-block;padding:6px 12px;border:2px dashed #f59f00;border-radius:12px;background:#fff3bf;font-weight:700}
.wf-tabs button{flex:1}
.wf-req{padding:8px 12px;border:2px solid #e6dfd0;border-radius:14px;background:#fff;font-size:15px}
.wf-count{justify-content:space-between;font-size:15px;color:#4a5568}
.wf-screen{min-height:120px}
.wf-acts button{flex:1}
.wf-tbl{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:2px solid #e6dfd0;border-radius:18px;background:#fff}
.wf-tr{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:44px;padding:4px 10px;border-radius:12px;background:#fffdf8}
.wf-cell{flex:none;color:#2b8a3e}
.wf-cell.wf-gone{color:#c92a2a}
`;

export default {
  ready: true,
  unit: {
    id: 'websiteflow', part: 'basic', icon: '🎟️', title: '註冊、登入和登出', en: 'Website Accounts',
    desc: '註冊一次、登入拿票、換頁不用再打密碼，再看看登出和刪除帳號有什麼不一樣',
    color: '#0f766e',
    slides: [
      { id: 'register', title: '註冊是什麼？',
        text: `${t('註冊', 'Sign up')}就是在網站上建立一個新的${t('帳號', 'Account')}，只要做一次。按下按鈕，看看伺服器多了什麼！`,
        widget: 'wfRegister', params: {} },
      { id: 'login', title: '登入拿到一張票',
        text: `${t('登入', 'Log in')}是證明「這個帳號是我的」。密碼對了，網站會給瀏覽器一張${t('工作階段', 'Session')}票。試試看！`,
        widget: 'wfLogin', params: {} },
      { id: 'visit', title: '換頁要再打密碼嗎？',
        text: '瀏覽器每次換頁都會帶著這張票，網站看到票就認得你。去書架和個人資料看看！',
        widget: 'wfPages', params: {} },
      { id: 'logout', title: '登出會發生什麼事？',
        text: `${t('登出', 'Log out')}會讓這張票失效，但帳號和存好的資料還在網站上。按登出，再登入看看！`,
        widget: 'wfLogout', params: {} },
      { id: 'compare', title: '登出、清除、刪除',
        text: `${t('登出', 'Log out')}只讓目前裝置的票失效；${t('清除瀏覽資料', 'Clear browsing data')}會清掉暫存或記錄；${t('刪除帳號', 'Delete account')}則是向網站要求徹底移除資料。比較這個範例的三種動作！`,
        widget: 'wfCompare', params: {} },
      { id: 'quiz', title: '考考你', widget: 'choice',
        params: {
          question: '小安按了「登出」，他書架上的資料會怎樣？',
          options: [
            { text: '還在伺服器上，下次登入又看得到', correct: true },
            { text: '跟著帳號一起被刪掉' },
            { text: '搬到這台平板裡，誰都看得到' },
          ],
          explain: '登出只結束這次的票。帳號和書架資料還在網站伺服器上，只是登出的畫面看不到。',
        } },
    ],
  },
  placement: {
    after: 'passkey', stage: 'webaccounts',
    newStage: { id: 'webaccounts', after: 'net', part: 'basic', icon: '🎟️', title: '網站和登入', en: 'Websites and Sign-in' },
  },
  prerequisites: ['account', 'passkey'],
  readme: 'Website accounts: sign up once, log in to get a session ticket, change pages without retyping the password, and log out without deleting the account.',
  changelog: '新增「註冊、登入和登出」：用假的圖書館網站，看懂註冊、登入時拿到的票、換頁不用再打密碼，以及登出、清除瀏覽資料和刪除帳號的差別。',
  widgets,
  css,
  checks: {
    register: [
      { action: 'click', selector: '.wf-reg-btn' },
      { action: 'expectCount', selector: '.wf-acct-new', count: 1 },
      { action: 'click', selector: '.wf-reg-again' },
      { action: 'expectText', selector: '.wf-status', text: '註冊只做一次' },
    ],
    login: [
      { action: 'click', selector: '.wf-login-bad' },
      { action: 'expectText', selector: '.wf-status', text: '不給票' },
      { action: 'click', selector: '.wf-login-ok' },
      { action: 'expectCount', selector: '.wf-ticket', count: 1 },
      { action: 'expectText', selector: '.wf-status', text: '登入成功' },
    ],
    visit: [
      { action: 'click', selector: '.wf-tab-shelf' },
      { action: 'expectText', selector: '.wf-page', text: '借閱中' },
      { action: 'click', selector: '.wf-tab-profile' },
      { action: 'expectText', selector: '.wf-status', text: '不用再打密碼' },
    ],
    logout: [
      { action: 'click', selector: '.wf-logout' },
      { action: 'expectText', selector: '.wf-screen', text: '請先登入' },
      { action: 'expectText', selector: '.wf-srv-books', text: '還在' },
      { action: 'click', selector: '.wf-relogin' },
      { action: 'expectText', selector: '.wf-status', text: '新票' },
    ],
    compare: [
      { action: 'click', selector: '.wf-act-logout' },
      { action: 'click', selector: '.wf-act-clear' },
      { action: 'click', selector: '.wf-act-delete' },
      { action: 'expectCount', selector: '.wf-gone', count: 3 },
      { action: 'expectText', selector: '.wf-status', text: '三種都試過' },
    ],
  },
};
