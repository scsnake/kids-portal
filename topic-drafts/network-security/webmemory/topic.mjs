// Topic package: webmemory. Login state vs settings, autofill, drafts, cookies and storage.
// The rules shown are this simulation's rules; real sites differ. All data is fictional.
const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const P = 'wm';

const base = (p) => `
.${p}-root{--a:var(--c,#1d2738);container-type:inline-size;box-sizing:border-box;width:100%;max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:10px;font-size:16px;line-height:1.45;color:#1d2738;text-align:left}
.${p}-root *{box-sizing:border-box}
.${p}-root button{min-height:52px;min-width:52px;padding:8px 14px;border:2px solid #e6dfd0;border-radius:14px;background:#fff;color:#1d2738;font:inherit;font-size:16px;line-height:1.25;box-shadow:0 3px 0 #e6dfd0;cursor:pointer;touch-action:manipulation;transition:transform .12s ease,box-shadow .12s ease}
.${p}-root button:active{transform:translateY(2px);box-shadow:0 1px 0 #e6dfd0}
.${p}-root button:disabled{opacity:.55;cursor:default;transform:none}
.${p}-root button:focus-visible{outline:3px solid var(--a);outline-offset:2px}
.${p}-root .${p}-go{background:var(--a);border-color:transparent;color:#fff;font-weight:700;box-shadow:0 3px 0 rgba(0,0,0,.28)}
.${p}-root .${p}-on{border-color:var(--a);background:#fff8e6;font-weight:700}
.${p}-row{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch}
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
  const root = document.createElement('div');
  root.className = `${P}-root`;
  host.replaceChildren(root);
  let finished = false;
  const finish = () => {
    if (finished || (api.alive && !api.alive())) return;
    finished = true;
    api.done();
  };
  const on = (fn) => root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (b && root.contains(b) && !b.disabled) fn(b.dataset.a, b);
  });
  return { root, finish, on };
}

const st = (msg, kind = '') => `<div class="${P}-status ${kind}" role="status">${msg}</div>`;
const rule = (txt) => `<div class="wm-rule">🧪 這個模擬的規則：${txt}（真實網站可能不一樣）</div>`;
const SENT = ['我最喜歡書裡的機器人。', '它每天晚上幫小鎮修路燈。'];

const widgets = {
  wmKinds(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const CARDS = [
      { id: 'login', label: '👤 右上角寫著「小安 已登入」', bin: 'session', why: '網站用登入的票記得你是誰。' },
      { id: 'dark', label: '🌙 畫面是深色模式', bin: 'setting', why: '這是你選的偏好設定。' },
      { id: 'draft', label: '✏️ 寫到一半的讀書心得', bin: 'draft', why: '還沒交出去的文字是草稿。' },
      { id: 'fill', label: '✉️ Email 欄自己跳出 xiaoan@example.tw', bin: 'autofill', why: '這是瀏覽器幫你填的，不是網站記的。' },
    ];
    const BINS = [
      { id: 'session', name: '登入狀態', en: 'Session' },
      { id: 'setting', name: '設定', en: 'Setting' },
      { id: 'draft', name: '草稿', en: 'Draft' },
      { id: 'autofill', name: '自動填入', en: 'Autofill' },
    ];
    const s = { sel: '', placed: [], last: '', bad: '', msg: '先點一張卡片，再點它屬於哪一種記憶。', kind: '' };
    const render = () => {
      const cards = CARDS.filter((c) => !s.placed.includes(c.id)).map((c) =>
        `<button type="button" class="wm-card wm-card-${c.id} ${s.sel === c.id ? 'wm-on' : ''} ${s.bad === c.id ? 'wm-shake' : ''}" data-a="c:${c.id}">${c.label}</button>`).join('');
      const bins = BINS.map((b) => {
        const inside = CARDS.filter((c) => s.placed.includes(c.id) && c.bin === b.id)
          .map((c) => `<span class="wm-placed ${s.last === c.id ? 'wm-pop' : ''}">${c.label}</span>`).join('');
        return `<button type="button" class="wm-bin wm-bin-${b.id}" data-a="b:${b.id}"><span class="wm-bin-h">${b.name} <span class="wm-en">${b.en}</span></span>${inside}</button>`;
      }).join('');
      root.innerHTML = `<div class="wm-row wm-cards">${cards || '<span class="wm-k">全部分好了！</span>'}</div>
        <div class="wm-bins">${bins}</div>${st(s.msg, s.kind)}`;
    };
    on((a) => {
      const [k, id] = a.split(':');
      s.bad = '';
      if (k === 'c') {
        s.sel = id; s.msg = '好，現在點它屬於哪一種記憶。'; s.kind = '';
      } else if (!s.sel) {
        s.msg = '先點上面的一張卡片喔。'; s.kind = '';
      } else {
        const c = CARDS.find((x) => x.id === s.sel);
        if (c.bin === id) {
          s.placed.push(c.id); s.last = c.id; s.sel = '';
          s.msg = `✅ ${c.why}`; s.kind = '';
          if (s.placed.length === CARDS.length) {
            s.msg = '🎉 都分好了！登入、設定、草稿、自動填入，是四種不同的記憶。'; s.kind = 'ok';
            finish();
          }
        } else {
          s.bad = c.id; s.msg = '再想想：這是誰記住的？為了什麼記住？'; s.kind = 'bad';
        }
      }
      render();
    });
    render();
  },

  wmDevices(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { step: 0 };
    const dev = (name, dark, who, cls) => `<div class="wm-dev ${cls} ${dark ? 'wm-dark' : ''}">
      <div class="wm-dev-h">${name}</div><div class="wm-dev-scr"><div>${who}</div><div>📚 小星圖書館</div><div>${dark ? '🌙 深色模式' : '☀️ 淺色模式'}</div></div></div>`;
    const render = () => {
      const tabDark = s.step >= 1;
      const phoneDark = s.step === 2;
      const btn = s.step === 0
        ? '<button type="button" class="wm-dark-local" data-a="local">不登入，在平板 A 開深色模式</button>'
        : s.step === 1 ? '<button type="button" class="wm-go wm-dark-account" data-a="account">登入後，存到帳號設定</button>' : '';
      const msg = s.step === 0
        ? '先在平板 A 開深色模式，看看手機 B 會不會跟著變！'
        : s.step === 1
          ? '✅ 平板 A 變深色，手機 B 沒變：沒登入的設定只在這台裝置。接著登入並存到帳號。'
          : '🎉 存到帳號以後，登入同一個帳號的手機 B 也變深色了，因為設定存在網站伺服器上。';
      root.innerHTML = `${rule('沒登入時，設定只存在這台裝置')}
        <div class="wm-devs">${dev('平板 A（這台）', tabDark, s.step === 2 ? '👤 小安 已登入' : '👤 未登入', 'wm-tab ' + (s.step === 1 ? 'wm-pop' : ''))}
        ${dev('手機 B（另一台）', phoneDark, '👤 小安 已登入', 'wm-phone ' + (phoneDark ? 'wm-pop' : ''))}</div>
        <div class="wm-srvline">🗄️ 伺服器上的帳號設定：深色模式 <b>${s.step === 2 ? '開' : '關'}</b></div>
        ${btn ? `<div class="wm-row">${btn}</div>` : ''}${st(msg, s.step === 2 ? 'ok' : '')}`;
    };
    on((a) => {
      if (a === 'local' && s.step === 0) s.step = 1;
      if (a === 'account' && s.step === 1) { s.step = 2; finish(); }
      render();
    });
    render();
  },

  wmAutofill(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { filled: false, sent: false };
    const render = () => {
      const v = (txt) => (s.filled ? `<b class="wm-mono wm-pop">${txt}</b>` : '<span class="wm-k">（空白）</span>');
      const got = s.sent
        ? '<div class="wm-srv-got wm-pop">📨 收到 Email 和密碼，比對後發一張登入票</div>'
        : '<div class="wm-srv-got">（此例還沒收到登入欄位）</div>';
      const btn = !s.filled
        ? '<button type="button" class="wm-fill" data-a="fill">🔑 讓瀏覽器自動填入</button>'
        : !s.sent ? '<button type="button" class="wm-go wm-send" data-a="send">按「登入」送出</button>' : '';
      const msg = s.sent
        ? '🎉 在這個模擬中，按登入才送出欄位。自動填入的來源，和網站儲存是兩回事。'
        : s.filled
          ? '✅ 欄位由密碼管理工具填入；真實網頁可能在按送出前就讀取欄位，要先確認網站。'
          : '範例資料由裝置的密碼管理工具填入，不是這個網站保存的密碼副本。試試看！';
      root.innerHTML = `${rule('此例按登入才送出欄位；真實網頁可能更早讀取或送出')}<div class="wm-two">
        <div class="wm-box"><div class="wm-box-h">📱 你的裝置</div>
          <div class="wm-form"><div class="wm-k wm-mono">club.example.tw/login</div>
            <div class="wm-field">Email：${v('xiaoan@example.tw')}</div><div class="wm-field">密碼：${v('●●●●●●●●')}</div></div>
          <div class="wm-vault ${s.filled && !s.sent ? 'wm-glow' : ''}">🔑 密碼管理工具<br><span class="wm-mono">club.example.tw</span>・xiaoan@example.tw・●●●●（示範）</div></div>
        <div class="wm-box wm-srv"><div class="wm-box-h">🗄️ 網站伺服器</div>${got}</div></div>
        ${btn ? `<div class="wm-row">${btn}</div>` : ''}${st(msg, s.sent ? 'ok' : '')}`;
    };
    on((a) => {
      if (a === 'fill') s.filled = true;
      if (a === 'send' && s.filled) { s.sent = true; finish(); }
      render();
    });
    render();
  },

  wmDraft(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { typed: 0, reloaded: false, saved: '', msg: '', kind: '', fresh: '' };
    const text = () => SENT.slice(0, s.typed).join('');
    const render = () => {
      const local = text();
      const area = local
        ? `<div class="wm-area ${s.fresh === 'reload' ? 'wm-pop' : ''}">${local}${s.reloaded ? '<div class="wm-tag">🔁 從這台瀏覽器的本機草稿拿回來</div>' : ''}</div>`
        : '<div class="wm-area wm-k">（還沒寫字）</div>';
      const btns = `${s.typed < SENT.length ? '<button type="button" class="wm-type" data-a="type">✏️ 打一句</button>' : ''}
        <button type="button" class="wm-reload" data-a="reload">🔁 重新整理頁面</button>
        <button type="button" class="wm-go wm-save" data-a="save">💾 按「儲存草稿」</button>`;
      const msg = s.msg || '這個網站會自動把草稿存在這台瀏覽器。先打一句，再重新整理頁面！';
      root.innerHTML = `${rule('打字時自動存本機草稿；按「儲存草稿」才送到伺服器')}
        <div class="wm-two">
          <div class="wm-box"><div class="wm-box-h">📱 這台平板・讀書心得</div>${area}</div>
          <div class="wm-box wm-srv"><div class="wm-box-h">🗄️ 伺服器上的草稿</div>
            <div class="wm-srv-d ${s.fresh === 'save' ? 'wm-pop' : ''}">${s.saved || '沒有'}</div>
            <div class="wm-box-h">💻 另一台裝置打開看看</div>
            <div class="wm-devb ${s.fresh === 'save' ? 'wm-pop' : ''}">${s.saved || '（空白）'}</div></div></div>
        <div class="wm-row">${btns}</div>${st(msg, s.kind)}`;
    };
    on((a) => {
      s.fresh = ''; s.kind = '';
      if (a === 'type') {
        s.typed = Math.min(SENT.length, s.typed + 1);
        s.msg = '✏️ 字存在這台瀏覽器的本機草稿。按「重新整理頁面」看看！';
      } else if (!s.typed) {
        s.msg = '先按「打一句」寫點東西喔。';
      } else if (a === 'reload') {
        s.reloaded = true; s.fresh = 'reload';
        s.msg = s.saved === text()
          ? '🔁 重新整理後字還在，伺服器上也有同樣的草稿。'
          : s.saved
            ? '🔁 字還在，但伺服器上只有上次儲存的版本。最新一句還沒送出，要再儲存。'
            : '✅ 重新整理後字還在，可是伺服器上還是「沒有」。欄位還在，不代表網站已經存好！';
      } else if (a === 'save') {
        s.saved = text(); s.fresh = 'save';
        if (s.reloaded) {
          s.msg = '🎉 按下儲存後，草稿才送到伺服器，另一台裝置也看得到了。'; s.kind = 'ok';
          finish();
        } else {
          s.msg = '💾 存到伺服器了。也按「重新整理頁面」，比比看本機草稿和伺服器草稿。';
        }
      }
      render();
    });
    render();
  },

  wmCookie(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const CK = [
      { id: 'session', site: 'library.example.tw', name: 'session_id=A7F3…', use: '登入用：讓網站認得你', after: '刪掉登入用的 Cookie，網站就不認得你了，所以要再登入。' },
      { id: 'theme', site: 'library.example.tw', name: 'theme=dark', use: '設定用：記得深色模式', after: '刪掉設定用的 Cookie，畫面回到預設的淺色。' },
      { id: 'ad', site: 'ads.example.net', name: 'ad_id=55X…', use: '追蹤用：廣告網站認出你', after: '刪掉追蹤用的 Cookie，畫面看起來一樣，但廣告比較難跟著你。' },
    ];
    const s = { del: new Set(), last: '' };
    const render = () => {
      const has = (id) => !s.del.has(id);
      const page = `<div class="wm-page ${has('theme') ? 'wm-dark' : ''} ${s.last ? 'wm-pop' : ''}">
        <div class="wm-page-h">📚 library.example.tw</div>
        <div>${has('session') ? '👤 小安 已登入' : '🔒 請先登入'}</div>
        <div class="wm-ad">${has('ad') ? '📢 廣告：恐龍玩具（因為你看過恐龍書）' : '📢 廣告：一般的文具廣告'}</div></div>`;
      const rows = CK.map((c) => `<div class="wm-ck ${has(c.id) ? '' : 'wm-ck-gone'}"><div><b class="wm-mono">${c.name}</b><div class="wm-k">${c.site}・${c.use}</div></div>
        ${has(c.id) ? `<button type="button" class="wm-del-${c.id}" data-a="${c.id}">刪掉</button>` : '<span class="wm-k">已刪除</span>'}</div>`).join('');
      const done = s.del.size === CK.length;
      const msg = done
        ? '🎉 Cookie 不只是廣告用：它也能記住登入的票和你的設定。'
        : s.last ? CK.find((c) => c.id === s.last).after : '這個模擬裡有三個 Cookie。一個一個刪掉，看看網頁怎麼變！';
      root.innerHTML = `<div class="wm-two">${page}<div class="wm-jar"><div class="wm-box-h">🍪 瀏覽器裡的 Cookie</div>${rows}</div></div>${st(msg, done ? 'ok' : '')}`;
    };
    on((a) => {
      s.del.add(a); s.last = a;
      if (s.del.size === CK.length) finish();
      render();
    });
    render();
  },

  wmStorage(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const BOX = [
      { id: 'page', name: '頁面記憶', en: 'Page memory', val: '目前在第 3 題' },
      { id: 'session', name: '分頁儲存', en: 'sessionStorage', val: '這個分頁只看恐龍書' },
      { id: 'local', name: '本機儲存', en: 'localStorage', val: '字體大小：大' },
    ];
    const ACT = {
      reload: { name: '🔁 重新整理', lost: ['page'], note: '重新整理後，頁面記憶不見了；另外兩個還在。' },
      tab: { name: '🗂️ 關掉分頁再打開', lost: ['page', 'session'], note: '關掉分頁後，頁面記憶和 sessionStorage 都沒了。' },
      browser: { name: '🚪 關掉瀏覽器再打開', lost: ['page', 'session'], note: '關掉整個瀏覽器，localStorage 通常還在。' },
    };
    const s = { last: '', tried: new Set() };
    const render = () => {
      const act = ACT[s.last];
      const boxes = BOX.map((b) => {
        const lost = act && act.lost.includes(b.id);
        return `<div class="wm-box2 wm-box ${lost ? 'lost' : 'kept'} ${act ? 'wm-pop' : ''}"><div class="wm-box-h">${b.name}<div class="wm-en">${b.en}</div></div>
          <div class="wm-val">${lost ? '💨 不見了' : b.val}</div></div>`;
      }).join('');
      const btns = Object.keys(ACT).map((k) => `<button type="button" class="wm-act-${k} ${k === s.last ? 'wm-on' : ''}" data-a="${k}">${ACT[k].name}${s.tried.has(k) ? ' ✓' : ''}</button>`).join('');
      const done = s.tried.size === 3;
      const msg = done
        ? '🎉 localStorage 通常最久；sessionStorage 跟著分頁；頁面記憶一重新整理就不見。'
        : act ? `${act.note} 還有 ${3 - s.tried.size} 個動作沒試。` : '三個盒子都放了東西。每個動作都從這裡開始，選一個試試看！';
      root.innerHTML = `<div class="wm-boxes">${boxes}</div><div class="wm-row wm-acts">${btns}</div>
        <div class="wm-rule">🧪 簡化規則。localStorage 也可能被清除，例如清除網站資料，或 Safari 很久沒造訪。</div>${st(msg, done ? 'ok' : '')}`;
    };
    on((a) => {
      s.last = a; s.tried.add(a);
      if (s.tried.size === 3) finish();
      render();
    });
    render();
  },

  wmLogout(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const ITEMS = [
      { id: 'draft', name: '✏️ 本機草稿「我最喜歡書裡的機器人…」', btn: '刪掉本機草稿' },
      { id: 'pw', name: '🔑 瀏覽器儲存的密碼', btn: '刪掉儲存的密碼' },
      { id: 'fill', name: '✉️ 自動填入的 Email', btn: '清除自動填入' },
    ];
    const s = { out: false, clean: new Set(), last: '' };
    const render = () => {
      const shelf = s.out
        ? '<div class="wm-li wm-pop">📖 我的書架：畫面上不見了 ✅（資料還在伺服器上）</div>'
        : '<div class="wm-li">📖 我的書架：《恐龍大探險》等 3 本</div>';
      const rows = ITEMS.map((it) => {
        const gone = s.clean.has(it.id);
        const left = s.out && !gone;
        return `<div class="wm-li ${left ? 'wm-left' : ''} ${s.last === it.id ? 'wm-pop' : ''}"><span>${it.name}${gone ? '：🧹 已清掉' : s.out ? '：⚠️ 還留在這台電腦' : ''}</span>
          ${left ? `<button type="button" class="wm-clean-${it.id}" data-a="${it.id}">${it.btn}</button>` : ''}</div>`;
      }).join('');
      const done = s.out && s.clean.size === ITEMS.length;
      const msg = done
        ? '🎉 這三種本機資料都清掉了。瀏覽紀錄、下載檔案等，仍要另外檢查。'
        : s.out ? '✅ 書架從畫面上消失了。可是草稿、密碼和自動填入還留在這台電腦，一個一個清掉！'
          : '這是學校圖書館的共用電腦。用完了，先按「登出」！';
      root.innerHTML = `<div class="wm-box"><div class="wm-box-h">🖥️ 共用電腦・library.example.tw ${s.out ? '（已登出）' : '（小安 已登入）'}</div>${shelf}${rows}</div>
        ${s.out ? '' : '<div class="wm-row"><button type="button" class="wm-go wm-logout" data-a="out">登出</button></div>'}
        ${st(msg, done ? 'ok' : '')}`;
    };
    on((a) => {
      s.last = '';
      if (a === 'out') s.out = true;
      else if (s.out) { s.clean.add(a); s.last = a; }
      if (s.out && s.clean.size === ITEMS.length) finish();
      render();
    });
    render();
  },
};

const css = base(P) + `
.wm-rule{padding:6px 12px;border-radius:12px;background:#f8f0fc;color:#4a5568;font-size:15px}
.wm-cards button{flex:1 1 200px;text-align:left}
.wm-bins{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.wm-root .wm-bin{display:flex;flex-direction:column;align-items:stretch;gap:6px;min-height:84px;text-align:left;background:#fffdf8;border-style:dashed}
.wm-bin-h{font-weight:700}
.wm-en{font-size:15px;font-weight:400;color:#4a5568}
.wm-placed{display:block;padding:4px 8px;border-radius:10px;background:#f3d9fa;font-size:15px}
.wm-two{display:grid;grid-template-columns:1.2fr 1fr;gap:10px;align-items:stretch}
@container (max-width:540px){.wm-two{grid-template-columns:1fr}}
.wm-box{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:2px solid #e6dfd0;border-radius:18px;background:#fff}
.wm-box-h{font-weight:700}
.wm-srv{background:#f4f7fb;border-color:#cfd8e3}
.wm-devs{display:grid;grid-template-columns:1.3fr 1fr;gap:12px;align-items:end}
.wm-dev{padding:8px;border:3px solid #1d2738;border-radius:20px;background:#fff;transition:background-color .3s,color .3s}
.wm-phone{border-radius:24px}
.wm-dev-h{font-weight:700;margin-bottom:4px}
.wm-dev-scr{display:flex;flex-direction:column;gap:4px;min-height:96px;padding:8px 10px;border-radius:12px;background:#fffdf8;color:#1d2738}
.wm-dark .wm-dev-scr,.wm-page.wm-dark{background:#25262b;color:#f1f3f5}
.wm-srvline{padding:8px 12px;border:2px solid #cfd8e3;border-radius:14px;background:#f4f7fb}
.wm-form{display:flex;flex-direction:column;gap:6px}
.wm-field{min-height:44px;padding:8px 10px;border:2px solid #e6dfd0;border-radius:12px;background:#fffdf8}
.wm-vault{padding:8px 10px;border:2px dashed #9c36b5;border-radius:12px;background:#f8f0fc;font-size:15px}
.wm-glow{box-shadow:0 0 0 4px rgba(156,54,181,.25)}
.wm-srv-got{padding:8px;border-radius:12px;background:#fff}
.wm-area{min-height:110px;padding:10px;border:2px solid #e6dfd0;border-radius:12px;background:#fffdf8}
.wm-tag{margin-top:6px;font-size:15px;color:#9c36b5}
.wm-srv-d,.wm-devb{min-height:44px;padding:8px;border-radius:12px;background:#fff}
.wm-page{display:flex;flex-direction:column;gap:8px;padding:12px;border:3px solid #1d2738;border-radius:18px;background:#fffdf8}
.wm-page-h{font-weight:700}
.wm-ad{padding:6px 8px;border-radius:10px;background:rgba(245,159,0,.18)}
.wm-jar{display:flex;flex-direction:column;gap:6px}
.wm-ck{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border:2px solid #e6dfd0;border-radius:14px;background:#fff}
.wm-ck-gone{opacity:.6}
.wm-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.wm-box2{min-height:120px;transition:background-color .3s}
.wm-box2.lost{background:#fff5f5;border-color:#ffa8a8}
.wm-box2.kept{background:#ebfbee;border-color:#8ce99a}
.wm-val{font-size:16px}
.wm-acts button{flex:1 1 160px}
.wm-li{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:52px;padding:4px 10px;border-radius:12px;background:#fffdf8}
.wm-li.wm-left{background:#fff9db;border:2px solid #f59f00}
@container (max-width:500px){.wm-boxes{grid-template-columns:1fr}.wm-box2{min-height:0}}
`;

export default {
  ready: true,
  unit: {
    id: 'webmemory', part: 'basic', icon: '🗂️', title: '網站記得什麼？', en: 'What Websites Remember',
    desc: '登入、設定、草稿、自動填入、Cookie 和瀏覽器儲存，分清楚是誰記住、記在哪裡',
    color: '#9c36b5',
    slides: [
      { id: 'kinds', title: '網站記得的不只登入',
        text: '打開網站時，畫面上有很多「被記住」的東西。先點卡片，再點它屬於哪一種記憶，分分看！',
        widget: 'wmKinds', params: {} },
      { id: 'devices', title: '設定存在哪裡？',
        text: `有些${t('設定', 'Setting')}只存在這台裝置，有些存在你的帳號裡。帳號設定會跟著你到另一台裝置，試試看！`,
        widget: 'wmDevices', params: {} },
      { id: 'autofill', title: '自動填入是誰記的？',
        text: `此例由瀏覽器的${t('自動填入', 'Autofill')}，從${t('密碼管理工具', 'Password manager')}取出範例資料。真實網頁也能讀取欄位，先確認網站再填資料。`,
        widget: 'wmAutofill', params: {} },
      { id: 'draft', title: '字還在，就存好了嗎？',
        text: `有些網站先把${t('草稿', 'Draft')}存在這台瀏覽器，按「儲存」才送到伺服器。打一句，再重新整理看看！`,
        widget: 'wmDraft', params: {} },
      { id: 'cookie', title: 'Cookie 是什麼？',
        text: `網站放在瀏覽器裡的小紙條叫 ${t('Cookie', 'HTTP cookie')}。它可以記登入的票、記設定，也可能用來追蹤。刪刪看！`,
        widget: 'wmCookie', params: {} },
      { id: 'storage', title: '關掉以後還記得嗎？',
        text: `瀏覽器有不同的記憶盒子，像${t('分頁儲存', 'sessionStorage')}和${t('本機儲存', 'localStorage')}。它們留住的時間不一樣，試試看！`,
        widget: 'wmStorage', params: {} },
      { id: 'logout', title: '用完共用電腦怎麼辦？',
        text: '登出會收起帳號的私人內容，但不會清掉瀏覽器記的草稿和密碼。在共用電腦上，要記得一起清乾淨！',
        widget: 'wmLogout', params: {} },
    ],
  },
  placement: { after: 'websiteflow', stage: 'webaccounts' },
  prerequisites: ['websiteflow'],
  readme: 'What websites and browsers remember: login state, local and account settings, autofill, local and saved drafts, cookies, sessionStorage and localStorage, and what logging out does not erase.',
  changelog: '新增「網站記得什麼？」：分清楚登入、設定、草稿、自動填入和 Cookie，看懂重新整理後字還在不代表網站已存好，也學會用完共用電腦要清什麼。',
  widgets,
  css,
  checks: {
    kinds: [
      { action: 'click', selector: '.wm-card-login' },
      { action: 'click', selector: '.wm-bin-session' },
      { action: 'click', selector: '.wm-card-dark' },
      { action: 'click', selector: '.wm-bin-setting' },
      { action: 'click', selector: '.wm-card-draft' },
      { action: 'click', selector: '.wm-bin-draft' },
      { action: 'click', selector: '.wm-card-fill' },
      { action: 'click', selector: '.wm-bin-autofill' },
      { action: 'expectCount', selector: '.wm-placed', count: 4 },
      { action: 'expectText', selector: '.wm-status', text: '都分好了' },
    ],
    devices: [
      { action: 'click', selector: '.wm-dark-local' },
      { action: 'expectText', selector: '.wm-status', text: '只在這台裝置' },
      { action: 'click', selector: '.wm-dark-account' },
      { action: 'expectCount', selector: '.wm-phone.wm-dark', count: 1 },
      { action: 'expectText', selector: '.wm-status', text: '手機 B 也變深色' },
    ],
    autofill: [
      { action: 'click', selector: '.wm-fill' },
      { action: 'expectText', selector: '.wm-srv-got', text: '還沒收到' },
      { action: 'click', selector: '.wm-send' },
      { action: 'expectText', selector: '.wm-status', text: '兩回事' },
    ],
    draft: [
      { action: 'click', selector: '.wm-type' },
      { action: 'click', selector: '.wm-reload' },
      { action: 'expectText', selector: '.wm-srv-d', text: '沒有' },
      { action: 'expectText', selector: '.wm-status', text: '不代表網站已經存好' },
      { action: 'click', selector: '.wm-save' },
      { action: 'expectText', selector: '.wm-devb', text: '機器人' },
      { action: 'expectText', selector: '.wm-status', text: '另一台裝置也看得到' },
      { action: 'click', selector: '.wm-type' },
      { action: 'click', selector: '.wm-reload' },
      { action: 'expectText', selector: '.wm-status', text: '只有上次儲存的版本' },
      { action: 'click', selector: '.wm-save' },
      { action: 'expectText', selector: '.wm-devb', text: '修路燈' },
    ],
    cookie: [
      { action: 'click', selector: '.wm-del-session' },
      { action: 'expectText', selector: '.wm-page', text: '請先登入' },
      { action: 'click', selector: '.wm-del-theme' },
      { action: 'click', selector: '.wm-del-ad' },
      { action: 'expectCount', selector: '.wm-ck-gone', count: 3 },
      { action: 'expectText', selector: '.wm-status', text: '不只是廣告用' },
    ],
    storage: [
      { action: 'click', selector: '.wm-act-reload' },
      { action: 'expectCount', selector: '.wm-box2.lost', count: 1 },
      { action: 'click', selector: '.wm-act-tab' },
      { action: 'expectCount', selector: '.wm-box2.lost', count: 2 },
      { action: 'click', selector: '.wm-act-browser' },
      { action: 'expectText', selector: '.wm-status', text: 'localStorage 通常最久' },
    ],
    logout: [
      { action: 'click', selector: '.wm-logout' },
      { action: 'expectCount', selector: '.wm-left', count: 3 },
      { action: 'click', selector: '.wm-clean-draft' },
      { action: 'click', selector: '.wm-clean-pw' },
      { action: 'click', selector: '.wm-clean-fill' },
      { action: 'expectCount', selector: '.wm-left', count: 0 },
      { action: 'expectText', selector: '.wm-status', text: '這三種本機資料都清掉了' },
    ],
  },
};
