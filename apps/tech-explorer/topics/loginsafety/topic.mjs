// Topic package: loginsafety. Unique passwords, real 2FA, approvals, phishing-resistant methods, recovery.
// Every password, code, site and account below is fictional sample data.
const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const P = 'ls';

const base = (p) => `
.${p}-root{--a:var(--c,#1d2738);container-type:inline-size;box-sizing:border-box;width:100%;max-width:780px;margin:0 auto;display:flex;flex-direction:column;gap:10px;font-size:16px;line-height:1.45;color:#1d2738;text-align:left}
.${p}-root *{box-sizing:border-box}
.${p}-root button{min-height:52px;min-width:52px;padding:8px 14px;border:2px solid #e6dfd0;border-radius:14px;background:#fff;color:#1d2738;font:inherit;font-size:16px;line-height:1.25;box-shadow:0 3px 0 #e6dfd0;cursor:pointer;touch-action:manipulation;transition:transform .12s ease,box-shadow .12s ease}
.${p}-root button:active{transform:translateY(2px);box-shadow:0 1px 0 #e6dfd0}
.${p}-root button:disabled{opacity:.55;cursor:default;transform:none}
.${p}-root button:focus-visible{outline:3px solid var(--a);outline-offset:2px}
.${p}-root .${p}-go{background:var(--a);border-color:transparent;color:#fff;font-weight:700;box-shadow:0 3px 0 rgba(0,0,0,.28)}
.${p}-root .${p}-on{border-color:#1c7ed6;background:#e7f5ff;font-weight:700}
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
  const container = document.createElement('div');
  container.className = `${P}-root`;
  container.innerHTML = `<div class="gemini-tag" data-created-by="gemini"><span class="gemini-spark">✨</span> Gemini 互動設計</div><div class="${P}-slot"></div>`;
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

const widgets = {
  lsUnique(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const SITES = [
      { id: 'game', icon: '🎮', host: 'game.example.tw', pw: 'k7#Rq-pa2e' },
      { id: 'lib', icon: '📚', host: 'library.example.tw', pw: 'Mx9!vLu-3t' },
      { id: 'mail', icon: '✉️', host: 'mail.example.tw', pw: 'Tq4@zz-Wn8' },
    ];
    const s = { mode: 'same', leaked: false, seen: new Set() };
    const render = () => {
      const same = s.mode === 'same';
      const sites = SITES.map((x) => {
        const bad = s.leaked && (same || x.id === 'game');
        const note = !s.leaked ? '' : bad ? (x.id === 'game' ? '🚨 資料外洩' : '🚨 被同一組密碼登入') : '🛡️ 舊密碼試不進去';
        return `<div class="ls-site ${bad ? 'bad' : ''} ${s.leaked ? 'ls-pop' : ''}"><div>${x.icon} <span class="ls-mono">${x.host}</span></div>
          <div class="ls-mono ls-pw">${same ? 'Dino2026!' : x.pw}</div><div class="ls-note">${note}</div></div>`;
      }).join('');
      const keeper = same ? '🧠 腦袋裡只記一組密碼，每站都用它' : '🔑 密碼管理工具幫每站記一組不同的密碼';
      const done = s.seen.has('same') && s.seen.has('unique');
      const msg = !s.leaked
        ? (same ? '現在每個網站都用同一組密碼（示範）。按「遊戲站資料外洩」看看！' : '現在每站密碼都不一樣。再按一次「遊戲站資料外洩」！')
        : same ? '⚠️ 壞人拿外洩的密碼去試別的網站，三個都被打開了。換成「每站不同」再試一次！'
          : done ? '🎉 每站密碼不同，就只有遊戲站受影響。密碼管理工具幫你記住它們。' : '✅ 只有遊戲站受影響。也試試「同一組密碼」比比看。';
      root.innerHTML = `<div class="ls-row">
          <button type="button" class="ls-mode-same ${same ? 'ls-on' : ''}" data-a="same">同一組密碼</button>
          <button type="button" class="ls-mode-unique ${same ? '' : 'ls-on'}" data-a="unique">每站不同（密碼管理工具）</button></div>
        <div class="ls-keeper">${keeper}<span class="ls-k">（都是假的示範密碼）</span></div>
        <div class="ls-sites">${sites}</div>
        <div class="ls-row"><button type="button" class="ls-go ls-leak" data-a="leak">🎮 遊戲站資料外洩！</button></div>
        ${st(msg, s.leaked ? (same ? 'bad' : 'ok') : '')}`;
    };
    on((a) => {
      if (a === 'same' || a === 'unique') { s.mode = a; s.leaked = false; }
      if (a === 'leak') {
        s.leaked = true; s.seen.add(s.mode);
        if (s.seen.has('same') && s.seen.has('unique')) finish();
      }
      render();
    });
    render();
  },

  lsFactors(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const CAT = { know: '你知道的', have: '你擁有的', are: '你本身' };
    const F = [
      { id: 'pw', name: '🔤 密碼', cat: 'know' },
      { id: 'pw2', name: '🔤 第二組密碼', cat: 'know' },
      { id: 'q', name: '❓ 寵物名字問題', cat: 'know' },
      { id: 'app', name: '📱 驗證器 App 的碼', cat: 'have' },
      { id: 'key', name: '🔐 FIDO 安全金鑰', cat: 'have' },
      { id: 'bio', name: '👆 指紋解鎖密碼工具', cat: 'are' },
    ];
    const s = { picks: [], sameTried: false, goodTried: false, msg: '點兩張卡片組成登入方式。先試試「密碼＋第二組密碼」！', kind: '' };
    const render = () => {
      const cards = F.map((f) => `<button type="button" class="ls-f ls-f-${f.id} ls-cat-${f.cat} ${s.picks.includes(f.id) ? 'ls-on' : ''}" data-a="${f.id}">
        ${f.name}<span class="ls-cat">${CAT[f.cat]}</span></button>`).join('');
      const slot = (i) => {
        const f = F.find((x) => x.id === s.picks[i]);
        return `<div class="ls-slot ${f ? 'ls-pop' : ''}">${f ? f.name : '？'}</div>`;
      };
      root.innerHTML = `<div class="ls-k">網站必須真的驗證兩種因素。用指紋解鎖密碼工具，只填入密碼，不算額外的網站驗證。</div><div class="ls-fgrid">${cards}</div>
        <div class="ls-combo"><span class="ls-k">登入組合</span>${slot(0)}<b>＋</b>${slot(1)}</div>
        ${st(s.msg, s.kind)}`;
    };
    on((a) => {
      if (s.picks.length === 2) s.picks = [];
      if (s.picks.includes(a)) { s.msg = '同一張卡片不能用兩次，選另一張。'; s.kind = ''; render(); return; }
      s.picks.push(a);
      if (s.picks.length < 2) { s.msg = '再選一張卡片。'; s.kind = ''; render(); return; }
      const [x, y] = s.picks.map((id) => F.find((f) => f.id === id));
      if (x.id === 'bio' || y.id === 'bio') {
        s.msg = '⚠️ 此例的指紋只解鎖密碼工具，只填入同一組密碼。網站沒有多驗證一種因素。';
        s.kind = 'bad';
      } else if (x.cat === y.cat) {
        if (x.cat === 'know') s.sameTried = true;
        s.msg = `❌ 兩個都是「${CAT[x.cat]}」，不算雙重驗證。壞人騙到一個，也可能騙到另一個。`;
        s.kind = 'bad';
      } else {
        s.goodTried = true;
        s.msg = s.sameTried
          ? `🎉 「${CAT[x.cat]}」＋「${CAT[y.cat]}」，這才是雙重驗證：要兩種不同的因素。`
          : `✅ 兩種不同因素，對了！也試試「密碼＋第二組密碼」，看看為什麼不算。`;
        s.kind = s.sameTried ? 'ok' : '';
      }
      if (s.sameTried && s.goodTried) finish();
      render();
    });
    render();
  },

  lsApprove(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { step: 0, bad: false, msg: '手機突然跳出登入確認，可是你現在沒有要登入。怎麼辦？', kind: '' };
    const render = () => {
      const tab = s.step <= 1
        ? `<div class="ls-k">library.example.tw</div><div>（你現在沒有在登入）</div>
           ${s.step === 1 ? '<button type="button" class="ls-go ls-start" data-a="start">我要登入圖書館</button>' : ''}`
        : s.step === 2
          ? '<div class="ls-k">library.example.tw</div><div class="ls-pop">⏳ 等待手機確認…</div><div class="ls-num">畫面數字 42</div>'
          : '<div class="ls-k">library.example.tw</div><div class="ls-pop">✅ 已登入</div>';
      const req = (where, num) => `<div class="ls-req ${s.bad ? 'ls-shake' : 'ls-pop'}"><b>是你在登入嗎？</b>
        <div class="ls-k">library.example.tw・${where}</div>${num}
        <div class="ls-row"><button type="button" class="ls-deny" data-a="deny">拒絕</button><button type="button" class="ls-allow" data-a="allow">允許</button></div></div>`;
      const phone = s.step === 0
        ? req('地點：未知城市・剛剛', '')
        : s.step === 1 ? '<div class="ls-k">已拒絕。一直跳出來也不要因為煩就按允許。</div>'
          : s.step === 2 ? req('地點：你家・剛剛', '<div class="ls-num">請確認數字 42</div>') : '<div class="ls-k">沒有新的要求。</div>';
      root.innerHTML = `<div class="ls-two"><div class="ls-dev"><div class="ls-dev-h">💻 平板</div>${tab}</div>
        <div class="ls-dev ls-phone"><div class="ls-dev-h">📱 手機通知</div>${phone}</div></div>${st(s.msg, s.kind)}`;
    };
    on((a) => {
      s.bad = false;
      if (s.step === 0 && a === 'allow') {
        s.bad = true; s.kind = 'bad';
        s.msg = '你沒有在登入，按允許就像幫陌生人開門。再想想！';
      } else if (s.step === 0 && a === 'deny') {
        s.step = 1; s.kind = '';
        s.msg = '✅ 拒絕得好！沒在登入卻跳出要求，可能有人知道你的密碼，之後要改密碼、告訴大人。現在換你自己登入。';
      } else if (a === 'start' && s.step === 1) {
        s.step = 2; s.kind = '';
        s.msg = '這次是你自己按的登入。看看手機上的數字和平板一樣嗎？';
      } else if (s.step === 2 && a === 'deny') {
        s.bad = true; s.kind = 'bad';
        s.msg = '這次是你自己開始的登入，數字也對得上，可以允許。';
      } else if (s.step === 2 && a === 'allow') {
        s.step = 3; s.kind = 'ok';
        s.msg = '🎉 你自己開始登入，數字也一樣，才按允許。不是你按的，就拒絕。';
        finish();
      }
      render();
    });
    render();
  },

  lsMethods(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const M = [
      { id: 'pm', name: '🔑 儲存的密碼', safe: false, fake: '網址不同，所以不會自動填入，這是警訊。可是你自己複製貼上，密碼還是會被拿走。' },
      { id: 'pk', name: '🪪 通行密鑰', safe: true, fake: '通行密鑰只綁真的網址，假網站拿不到可以用的登入。' },
      { id: 'key', name: '🔐 FIDO 安全金鑰', safe: true, fake: '這裡指 FIDO 金鑰：會檢查網址，假網站收不到能用的簽名。' },
      { id: 'mail', name: '✉️ Email 登入連結', safe: false, fake: '假網站可能騙你把信裡的連結或碼交給它。不用密碼，也不一定防得了釣魚。' },
    ];
    const s = { site: 'fake', tried: new Set(), last: '' };
    const render = () => {
      const fake = s.site === 'fake';
      const url = fake ? 'l1brary.example.tw' : 'library.example.tw';
      const btns = M.map((m) => `<button type="button" class="ls-m-${m.id} ${s.last === m.id ? 'ls-on' : ''}" data-a="${m.id}">${m.name}</button>`).join('');
      const res = M.map((m) => {
        if (!fake) return `<div class="ls-res2">${m.name}<div class="ls-k">✅ 在真網站可以正常登入</div></div>`;
        if (!s.tried.has(m.id)) return `<div class="ls-res2 ls-unk">${m.name}<div class="ls-k">？還沒試</div></div>`;
        return `<div class="ls-res ${m.safe ? 'safe' : 'warn'} ${s.last === m.id ? 'ls-pop' : ''}">${m.name}<div>${m.safe ? '🛡️ 擋得住' : '⚠️ 不一定'}：${m.fake}</div></div>`;
      }).join('');
      const done = s.tried.size === M.length;
      const msg = done
        ? '🎉 不是每一種「不用打密碼」都能防釣魚。通行密鑰和安全金鑰會檢查網址。'
        : fake ? '這是假網站，網址裡的 i 變成了 1。在這裡一一試試四種登入方式！' : '真網站上四種都能登入。切回假網站比比看！';
      root.innerHTML = `<div class="ls-row"><button type="button" class="ls-site-fake ${fake ? 'ls-on' : ''}" data-a="fake">假網站</button>
        <button type="button" class="ls-site-real ${fake ? '' : 'ls-on'}" data-a="real">真網站</button></div>
        <div class="ls-url ls-mono ${fake ? 'ls-fakeurl' : ''}">${fake ? '⚠️' : '🔒'} ${url}</div>
        <div class="ls-row ls-ms">${btns}</div><div class="ls-resgrid">${res}</div>${st(msg, done ? 'ok' : '')}`;
    };
    on((a) => {
      if (a === 'fake' || a === 'real') { s.site = a; s.last = ''; }
      else {
        s.last = a;
        if (s.site === 'fake') s.tried.add(a);
        if (s.tried.size === M.length) finish();
      }
      render();
    });
    render();
  },

  lsBio(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const s = { ph: 0, inspected: false };
    const STEPS = ['', '🔍 裝置裡的安全晶片比對指紋…', '✅ 指紋符合，解開通行密鑰', '✍️ 用通行密鑰做出簽名，送給網站'];
    const render = () => {
      const box = (i, icon, name) => `<div class="ls-node ${s.ph >= i && s.ph > 0 ? 'ls-lit' : ''}">${icon}<div>${name}</div></div>`;
      const site = s.ph >= 3
        ? '<div class="ls-sig ls-pop">✍️ 收到：一次性的簽名</div>'
        : '<div class="ls-k">等待登入…</div>';
      const list = s.inspected
        ? `<ul class="ls-got ls-pop"><li>✅ 帳號：xiaoan.demo</li><li>✅ 一次性的簽名</li><li class="ls-no">❌ 指紋：沒有收到</li></ul>` : '';
      const btn = s.ph === 0
        ? '<button type="button" class="ls-go ls-touch" data-a="touch">👆 用指紋登入</button>'
        : s.ph === 3 && !s.inspected ? '<button type="button" class="ls-inspect" data-a="inspect">🔎 打開網站收到的資料</button>' : '';
      const msg = s.inspected
        ? '🎉 指紋留在你的裝置裡，只用來解鎖。網站只收到簽名，收不到指紋。'
        : s.ph === 0 ? '按「用指紋登入」，一步一步看資料怎麼走！' : STEPS[s.ph];
      root.innerHTML = `<div class="ls-flow">${box(1, '👆', '你的手指')}<span class="ls-arrow">➜</span>${box(2, '📱', '裝置裡的安全晶片')}<span class="ls-arrow">➜</span>${box(3, '🌐', 'library.example.tw')}</div>
        <div class="ls-site-box"><div class="ls-dev-h">🌐 網站這邊</div>${site}${list}</div>
        ${btn ? `<div class="ls-row">${btn}</div>` : ''}${st(msg, s.inspected ? 'ok' : '')}`;
    };
    const step = () => {
      if (!api.alive || api.alive()) {
        s.ph += 1;
        render();
        if (s.ph < 3) api.later(step, 700);
      }
    };
    on((a) => {
      if (a === 'touch' && s.ph === 0) step();
      if (a === 'inspect' && s.ph === 3) { s.inspected = true; finish(); render(); }
    });
    render();
  },

  lsCodes(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const SC = [
      { from: '📚 library.example.tw（你剛剛自己按了登入）', msg: '請輸入寄到你手機的驗證碼。', ans: 'enter', yes: '輸入到這個登入頁', no: '不輸入',
        wrong: '這是你自己開始的登入，網址也對，可以輸入。' },
      { from: '💬 自稱「客服小幫手」的訊息', msg: '你的帳號有問題！把收到的驗證碼傳給我，我幫你解鎖。', ans: 'refuse', yes: '把碼傳給他', no: '不給',
        wrong: '驗證碼像開門的鑰匙，誰來要都不要給。真的客服不會跟你要碼。' },
      { from: '💬 好朋友的帳號', msg: '幫我投票！等一下你會收到一組碼，傳給我就好。', ans: 'refuse', yes: '把碼傳給他', no: '不給',
        wrong: '朋友的帳號也可能被盜。不給碼，改用電話問朋友本人。' },
    ];
    const s = { i: 0, bad: false, msg: '', kind: '' };
    const render = () => {
      const done = s.i >= SC.length;
      const c = SC[Math.min(s.i, SC.length - 1)];
      const card = done
        ? '<div class="ls-card ls-pop">✅ 三個都判斷完了！</div>'
        : `<div class="ls-card ${s.bad ? 'ls-shake' : 'ls-pop'}"><div class="ls-k">${c.from}</div><div class="ls-msg">${c.msg}</div>
           <div class="ls-row"><button type="button" class="ls-c-enter" data-a="enter">${c.yes}</button><button type="button" class="ls-c-refuse" data-a="refuse">${c.no}</button></div></div>`;
      const msg = done
        ? '🎉 驗證碼只輸入在自己開始、確認網址正確的登入頁，不交給訊息裡的人。有疑問打 165。'
        : s.msg || '你的手機收到一組驗證碼。現在有人要它，判斷看看！';
      root.innerHTML = `<div class="ls-sms">📱 簡訊：你的驗證碼是 <b class="ls-mono">482913</b>（示範）</div>
        <div class="ls-k">第 ${Math.min(s.i + 1, SC.length)} / ${SC.length} 個</div>${card}${st(msg, done ? 'ok' : s.kind)}`;
    };
    on((a) => {
      if (s.i >= SC.length) return;
      const c = SC[s.i];
      if (a === c.ans) {
        s.i += 1; s.bad = false; s.kind = '';
        s.msg = a === 'enter' ? '✅ 對，這是你自己開始的登入。' : '✅ 不給就對了。';
        if (s.i >= SC.length) finish();
      } else {
        s.bad = true; s.kind = 'bad'; s.msg = c.wrong;
      }
      render();
    });
    render();
  },

  lsRecovery(host, params, api) {
    const { root, finish, on } = setup(host, api);
    const PH = [
      { q: '這是假的備用碼 <b class="ls-mono">7Q2K-4MZP</b>（示範）。要放在哪裡？', opts: [
        { id: 'screen', text: '📝 貼在螢幕旁邊', bad: '別人一眼就看到了。' },
        { id: 'chat', text: '📷 拍照傳給朋友保管', bad: '訊息可能被別人看到，朋友的帳號也可能被盜。' },
        { id: 'drawer', text: '🗄️ 印出來，和家人放在家裡安全的地方', ok: '✅ 放好了。只有你和家人知道在哪裡。' }] },
      { q: '再加一個登入方法：', opts: [
        { id: 'sameapp', text: '📱 在同一支手機再裝一個驗證 App', bad: '手機不見時，兩個方法會一起不見。' },
        { id: 'key', text: '🔐 加一把放在家裡的安全金鑰', ok: '✅ 第二種方法不在同一支手機上。' }] },
      { q: '準備好了。現在發生意外：', opts: [{ id: 'lost', text: '📱 糟糕！手機不見了', ok: '✅ 用家裡的安全金鑰登入成功。下一步呢？' }] },
      { q: '已經用安全金鑰登入。接下來：', opts: [
        { id: 'wait', text: '⏳ 等手機自己回來', bad: '撿到的人可能會試著用它。要先處理。' },
        { id: 'remove', text: '🧹 登出遺失裝置，停用它的驗證方式，並告訴大人', ok: '' }] },
    ];
    const s = { ph: 0, bad: '', msg: '一步一步準備你的備用計畫！', kind: '' };
    const render = () => {
      const done = s.ph >= PH.length;
      const kit = `<div class="ls-kit"><span class="${s.ph > 0 ? 'ls-have' : ''}">🧾 備用碼 ${s.ph > 0 ? '✅' : '…'}</span>
        <span class="${s.ph > 1 ? 'ls-have' : ''}">🔐 第二種方法 ${s.ph > 1 ? '✅' : '…'}</span>
        <span class="${s.ph > 2 ? 'ls-have' : ''}">📱 手機 ${s.ph > 2 ? '不見了' : '在身上'}</span></div>`;
      const p = PH[Math.min(s.ph, PH.length - 1)];
      const body = done
        ? '<div class="ls-card ls-pop">🧹 已登出遺失裝置，並停用它的驗證方式。</div>'
        : `<div class="ls-card ls-pop"><div class="ls-msg">${p.q}</div><div class="ls-opts">${p.opts.map((o) =>
          `<button type="button" class="ls-r-${o.id} ${s.bad === o.id ? 'ls-shake' : ''}" data-a="${o.id}">${o.text}</button>`).join('')}</div></div>`;
      const msg = done ? '🎉 準備好了！用備用方法登入，再登出遺失裝置、停用它的驗證方式，不只是刪掉清單上的名稱。' : s.msg;
      root.innerHTML = `${kit}${body}${st(msg, done ? 'ok' : s.kind)}`;
    };
    on((a) => {
      if (s.ph >= PH.length) return;
      const o = PH[s.ph].opts.find((x) => x.id === a);
      if (!o) return;
      if (o.bad) { s.bad = a; s.msg = `再想想：${o.bad}`; s.kind = 'bad'; }
      else {
        s.bad = ''; s.kind = ''; s.msg = o.ok; s.ph += 1;
        if (s.ph >= PH.length) finish();
      }
      render();
    });
    render();
  },
};

const css = base(P) + `
.ls-keeper{padding:6px 12px;border-radius:12px;background:#fff4e6}
.ls-keeper .ls-k{margin-left:6px}
.ls-sites{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ls-site{display:flex;flex-direction:column;gap:4px;min-height:110px;padding:10px;border:2px solid #e6dfd0;border-radius:16px;background:#fff;transition:background-color .3s,border-color .3s}
.ls-site.bad{border-color:#e03131;background:#fff5f5}
.ls-pw{font-size:15px;padding:2px 6px;border-radius:8px;background:#f8f9fa;word-break:break-all}
.ls-note{font-weight:700}
.ls-fgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ls-root .ls-f{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:72px;text-align:left}
.ls-cat{font-size:15px;color:#4a5568}
.ls-cat-know{border-left:6px solid #1c7ed6}
.ls-cat-have{border-left:6px solid #f59f00}
.ls-cat-are{border-left:6px solid #2b8a3e}
.ls-combo{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:8px 12px;border:2px dashed #e6dfd0;border-radius:16px;background:#fffdf8}
.ls-slot{min-width:150px;min-height:44px;padding:8px 12px;border-radius:12px;background:#fff;border:2px solid #e6dfd0}
.ls-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@container (max-width:520px){.ls-two{grid-template-columns:1fr}.ls-sites,.ls-fgrid{grid-template-columns:1fr 1fr}}
.ls-dev{display:flex;flex-direction:column;gap:8px;min-height:200px;padding:12px;border:3px solid #1d2738;border-radius:20px;background:#fff}
.ls-phone{border-radius:26px}
.ls-dev-h{font-weight:700}
.ls-req{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:14px;background:#fff4e6}
.ls-num{font-size:18px;font-weight:700}
.ls-req .ls-row button{flex:1}
.ls-url{padding:8px 12px;border:2px solid #e6dfd0;border-radius:12px;background:#fff}
.ls-fakeurl{border-color:#f59f00;background:#fff9db}
.ls-ms button{flex:1 1 140px}
.ls-resgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ls-res,.ls-res2{min-height:72px;padding:8px 10px;border:2px solid #e6dfd0;border-radius:14px;background:#fff;font-size:15px}
.ls-res.safe{border-color:#2b8a3e;background:#ebfbee}
.ls-res.warn{border-color:#f59f00;background:#fff9db}
.ls-unk{opacity:.7}
.ls-flow{display:flex;align-items:center;justify-content:space-between;gap:6px}
.ls-node{flex:1;min-height:96px;padding:10px;border:2px solid #e6dfd0;border-radius:16px;background:#fff;text-align:center;font-size:28px;transition:transform .3s,background-color .3s,border-color .3s}
.ls-node div{font-size:15px}
.ls-node.ls-lit{border-color:var(--a);background:#fff4e6;transform:translateY(-3px)}
.ls-arrow{font-size:22px;color:#4a5568}
.ls-site-box{display:flex;flex-direction:column;gap:6px;min-height:120px;padding:10px 12px;border:2px solid #cfd8e3;border-radius:16px;background:#f4f7fb}
.ls-sig{font-weight:700}
.ls-got{margin:0;padding-left:20px}
.ls-no{font-weight:700;color:#c92a2a}
.ls-sms{padding:10px 12px;border-radius:14px;background:#e7f5ff}
.ls-card{display:flex;flex-direction:column;gap:8px;padding:12px;border:2px solid #e6dfd0;border-radius:18px;background:#fff}
.ls-msg{font-size:17px}
.ls-card .ls-row button{flex:1}
.ls-kit{display:flex;flex-wrap:wrap;gap:8px}
.ls-kit span{padding:6px 12px;border:2px solid #e6dfd0;border-radius:999px;background:#fff}
.ls-kit .ls-have{border-color:#2b8a3e;background:#ebfbee}
.ls-opts{display:flex;flex-direction:column;gap:8px}
.ls-opts button{text-align:left}
`;

export default {
  ready: true,
  unit: {
    id: 'loginsafety', part: 'basic', icon: '🛡️', title: '登入更安全', en: 'Safer Sign-in',
    desc: '每站不同密碼、真正的雙重驗證、不亂按允許、不怕假網站的登入方式，還有手機不見的備用計畫',
    color: '#c2410c',
    slides: [
      { id: 'unique', title: '每個網站不同密碼',
        text: `一個網站外洩時，壞人會拿同一組密碼去試別的網站。用${t('密碼管理工具', 'Password manager')}幫每站記不同密碼，比比看！`,
        widget: 'lsUnique', params: {} },
      { id: 'factors', title: '兩個密碼不是雙重驗證',
        text: `${t('雙重驗證', '2FA')}是${t('多因素驗證', 'MFA')}的一種：用你知道的、你擁有的、你本身，選兩種不同類型。組組看！`,
        widget: 'lsFactors', params: {} },
      { id: 'approve', title: '不是你按的，就拒絕',
        text: '有些網站會傳到手機問「是你在登入嗎？」。只有你自己正在登入時才按允許，試試看！',
        widget: 'lsApprove', params: {} },
      { id: 'methods', title: '哪種登入不怕假網站？',
        text: `假網站會做得跟真的很像。在假網站上試試四種登入方式，看哪些擋得住${t('網路釣魚', 'Phishing')}！`,
        widget: 'lsMethods', params: {} },
      { id: 'biometric', title: '網站拿到指紋了嗎？',
        text: `用指紋登入時，指紋只在你的裝置裡比對，用來解鎖${t('通行密鑰', 'Passkey')}。網站收到什麼？按按看！`,
        widget: 'lsBio', params: {} },
      { id: 'codes', title: '驗證碼要給誰？',
        text: `${t('驗證碼', 'Verification code')}只輸入在你自己開始、且已確認網址正確的登入頁。別人傳訊息來要，就算說是客服或朋友，也不要給。判斷看看！`,
        widget: 'lsCodes', params: {} },
      { id: 'recovery', title: '手機不見了怎麼辦？',
        text: `先準備${t('備用碼', 'Recovery codes')}和獨立的備用登入方法。手機不見時，用它登入，再登出遺失裝置、停用它的驗證方式。準備看看！`,
        widget: 'lsRecovery', params: {} },
    ],
  },
  placement: { after: 'webmemory', stage: 'webaccounts' },
  prerequisites: ['passkey', 'websiteflow'],
  readme: 'Safer sign-in: unique passwords in a password manager, real two-factor authentication, refusing unexpected approvals, phishing-resistant methods, where a fingerprint stays, never sharing codes, and a recovery plan.',
  changelog: '新增「登入更安全」：用假的帳號和密碼，比較同一組密碼和每站不同、兩個密碼為什麼不算雙重驗證、不是自己按的登入要拒絕、哪些登入方式擋得住假網站，以及手機不見時的備用計畫。',
  widgets,
  css,
  checks: {
    unique: [
      { action: 'click', selector: '.ls-mode-same' },
      { action: 'click', selector: '.ls-leak' },
      { action: 'expectCount', selector: '.ls-site.bad', count: 3 },
      { action: 'click', selector: '.ls-mode-unique' },
      { action: 'click', selector: '.ls-leak' },
      { action: 'expectCount', selector: '.ls-site.bad', count: 1 },
      { action: 'expectText', selector: '.ls-status', text: '只有遊戲站受影響' },
    ],
    factors: [
      { action: 'click', selector: '.ls-f-pw' },
      { action: 'click', selector: '.ls-f-pw2' },
      { action: 'expectText', selector: '.ls-status', text: '不算雙重驗證' },
      { action: 'click', selector: '.ls-f-pw' },
      { action: 'click', selector: '.ls-f-bio' },
      { action: 'expectText', selector: '.ls-status', text: '只填入同一組密碼' },
      { action: 'click', selector: '.ls-f-pw' },
      { action: 'click', selector: '.ls-f-app' },
      { action: 'expectText', selector: '.ls-status', text: '這才是雙重驗證' },
    ],
    approve: [
      { action: 'click', selector: '.ls-deny' },
      { action: 'expectText', selector: '.ls-status', text: '拒絕得好' },
      { action: 'click', selector: '.ls-start' },
      { action: 'click', selector: '.ls-allow' },
      { action: 'expectText', selector: '.ls-status', text: '你自己開始登入' },
    ],
    methods: [
      { action: 'click', selector: '.ls-m-pm' },
      { action: 'click', selector: '.ls-m-pk' },
      { action: 'click', selector: '.ls-m-key' },
      { action: 'click', selector: '.ls-m-mail' },
      { action: 'expectCount', selector: '.ls-res.safe', count: 2 },
      { action: 'expectText', selector: '.ls-status', text: '不是每一種' },
    ],
    biometric: [
      { action: 'click', selector: '.ls-touch' },
      { action: 'waitFor', selector: '.ls-inspect' },
      { action: 'expectText', selector: '.ls-sig', text: '簽名' },
      { action: 'click', selector: '.ls-inspect' },
      { action: 'expectText', selector: '.ls-status', text: '指紋留在你的裝置裡' },
    ],
    codes: [
      { action: 'click', selector: '.ls-c-enter' },
      { action: 'click', selector: '.ls-c-refuse' },
      { action: 'click', selector: '.ls-c-refuse' },
      { action: 'expectText', selector: '.ls-status', text: '自己開始、確認網址正確的登入頁' },
    ],
    recovery: [
      { action: 'click', selector: '.ls-r-drawer' },
      { action: 'click', selector: '.ls-r-key' },
      { action: 'click', selector: '.ls-r-lost' },
      { action: 'click', selector: '.ls-r-remove' },
      { action: 'expectText', selector: '.ls-status', text: '準備好了' },
    ],
  },
};
