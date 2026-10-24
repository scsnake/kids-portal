// firewall — 防火牆 (tech-explorer topic package)
// A pretend firewall only. Nothing here reads or changes a real firewall setting.
// Addresses are documentation ranges (198.51.100.x, 203.0.113.x) or private ranges.

const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const SIM = '<p class="fw-note">🧪 模擬的防火牆：不會改動你裝置上真正的設定。</p>';

// Shared mount: fresh root, persistent live status, delegated clicks inside the host only.
function setup(host, api, name, statusCls) {
  host.innerHTML = '';
  const root = document.createElement('div');
  root.className = `fw-root fw-${name}`;
  root.innerHTML = `<div class="gemini-tag" data-created-by="gemini"></div><div class="fw-body"></div><div class="fw-status ${statusCls}" role="status" aria-live="polite"></div>${SIM}`;
  host.appendChild(root);
  const body = root.querySelector('.fw-body');
  const st = root.querySelector('.fw-status');
  const alive = () => (typeof api.alive === 'function' ? api.alive() : true);
  let finished = false;
  const pulse = (n, cls) => {
    n.classList.remove(cls);
    void n.offsetWidth;
    n.classList.add(cls);
  };
  return {
    root,
    body,
    say(msg, tone = '') {
      st.innerHTML = msg;
      st.className = `fw-status ${statusCls}${tone ? ` fw-${tone}` : ''}`;
      pulse(st, 'fw-pop');
    },
    shake(sel) {
      const n = root.querySelector(sel);
      if (n) pulse(n, 'fw-shake');
    },
    finish() {
      if (finished || !alive()) return;
      finished = true;
      api.done();
    },
    on(handler) {
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b || !root.contains(b) || !alive()) return;
        handler(b.dataset.act, b.dataset.arg || '');
      });
    },
  };
}

const baseCss = (p, color, tint) => `
.${p}-root{display:flex;flex-direction:column;gap:10px;width:100%;max-width:780px;margin:0 auto;font-size:16px;line-height:1.4;color:var(--ink,#1d2738)}
.${p}-body{display:flex;flex-direction:column;gap:10px}
.${p}-root code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:15px;white-space:nowrap}
.${p}-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:52px;min-width:52px;padding:8px 14px;border:2px solid var(--line,#e6dfd0);border-radius:14px;background:var(--card,#fff);color:var(--ink,#1d2738);font:inherit;font-size:16px;text-align:center;box-shadow:0 3px 0 var(--line,#e6dfd0);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,box-shadow .12s ease,background-color .2s ease,border-color .2s ease}
.${p}-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--line,#e6dfd0)}
.${p}-btn:focus-visible{outline:3px solid var(--c,${color});outline-offset:2px}
.${p}-btn[aria-pressed="true"],.${p}-btn.${p}-sel{border-color:var(--c,${color});background:${tint}}
.${p}-go{background:var(--c,${color});border-color:var(--c,${color});color:#fff;font-weight:700;box-shadow:0 3px 0 rgba(0,0,0,.28)}
.${p}-go:active{box-shadow:0 1px 0 rgba(0,0,0,.28)}
.${p}-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.${p}-card{background:var(--card,#fff);border:2px solid var(--line,#e6dfd0);border-radius:18px;padding:10px 12px}
.${p}-h{font-size:15px;font-weight:700;color:var(--ink-2,#4a5568)}
.${p}-status{min-height:52px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding:8px 14px;border-radius:14px;background:var(--card,#fff);border:2px dashed var(--line,#e6dfd0);font-size:16px}
.${p}-status.${p}-ok{border-style:solid;border-color:var(--good,#2b8a3e);background:#ebfbee}
.${p}-status.${p}-bad{border-style:solid;border-color:var(--bad,#e03131);background:#fff5f5}
.${p}-note{margin:0;font-size:15px;color:var(--ink-2,#4a5568)}
.${p}-tag{display:inline-block;padding:1px 8px;border-radius:999px;background:${tint};color:var(--c,${color});font-weight:700;font-size:15px}
.${p}-emo{font-size:24px;line-height:1}
.${p}-shake{animation:${p}-shake .36s ease}
.${p}-pop{animation:${p}-pop .3s ease-out}
@keyframes ${p}-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
@keyframes ${p}-pop{0%{transform:scale(.9);opacity:.4}100%{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.${p}-root *,.${p}-root *::before,.${p}-root *::after{animation:none!important;transition:none!important}}
`;

const css = baseCss('fw', '#c2410c', '#fff1e6') + `
.fw-rules{display:flex;flex-direction:column;gap:6px}
.fw-rule{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 10px;border-radius:10px;font-size:16px}
.fw-rule-allow{background:#ebfbee}
.fw-rule-deny{background:#fff5f5}
.fw-rule-port-tag{display:inline-flex;align-items:center;gap:4px;background:#fff3bf;color:#d9480f;border:2px solid #fab005;border-radius:8px;padding:2px 8px;font-weight:800;box-shadow:0 0 10px rgba(250,176,5,0.4)}
.fw-question-port-banner{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:4px 8px;border-radius:12px;background:#fff;border:2px solid #fd7e14;margin-top:2px;font-size:15px}
.fw-port-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:8px;font-weight:800;font-size:16px}
.fw-port-match{background:#ebfbee;color:#2b8a3e;border:2px solid #40c057;box-shadow:0 0 8px rgba(64,192,87,0.3)}
.fw-port-mismatch{background:#fff5f5;color:#e03131;border:2px solid #ff6b6b;box-shadow:0 0 8px rgba(255,107,107,0.3)}
.fw-hint-bar{display:flex;align-items:center;gap:6px;font-size:15px;line-height:1.25;color:#d9480f;background:#fff4e6;padding:4px 8px;border-radius:8px;border:1px solid #ffd8a8;margin-top:2px}
.fw-body{gap:8px}
.fw-rules{gap:4px}
.fw-conn{display:flex;flex-direction:column;gap:6px;border-color:var(--c,#c2410c)}
.fw-conn-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-weight:700}
.fw-say{padding:6px 12px;border-radius:12px;background:#f6f1e7;font-size:16px}
.fw-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fw-hist{display:flex;flex-wrap:wrap;gap:6px;min-height:30px}
.fw-chip{padding:3px 10px;border-radius:999px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);font-size:15px}
.fw-chip-pass{border-color:var(--good,#2b8a3e)}
.fw-chip-block{border-color:var(--bad,#e03131)}
.fw-scene{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1.3fr);gap:10px;align-items:stretch}
.fw-node{display:flex;flex-direction:column;gap:4px;justify-content:center}
.fw-wall{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 10px;border-radius:14px;background:#fff1e6;border:2px solid var(--c,#c2410c);font-weight:700}
.fw-track{position:relative;height:44px;border-radius:999px;background:#f6f1e7;overflow:hidden}
.fw-wallline{position:absolute;left:50%;top:0;bottom:0;width:6px;margin-left:-3px;border-radius:3px;background:var(--c,#c2410c)}
.fw-mover{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;padding:0 6px;font-size:24px;line-height:1;will-change:transform}
.fw-m-out{transform:translateX(calc(100% - 48px));animation:fw-out .8s ease-in-out both}
.fw-m-in-ok{transform:translateX(0);animation:fw-in-ok .8s ease-in-out both}
.fw-m-in-block{transform:translateX(calc(50% + 6px));animation:fw-in-block .8s ease-in-out both}
@keyframes fw-out{from{transform:translateX(0)}to{transform:translateX(calc(100% - 48px))}}
@keyframes fw-in-ok{from{transform:translateX(calc(100% - 48px))}to{transform:translateX(0)}}
@keyframes fw-in-block{0%{transform:translateX(calc(100% - 48px))}70%{transform:translateX(calc(50% + 2px))}100%{transform:translateX(calc(50% + 6px))}}
.fw-table{display:flex;flex-direction:column;gap:6px}
.fw-rec{padding:6px 10px;border-radius:10px;background:#ebfbee;font-size:15px}
.fw-empty{font-size:15px;color:var(--ink-2,#4a5568)}
.fw-btns{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.fw-btns .fw-btn{padding:6px 8px}
.fw-svcs{display:flex;flex-direction:column;gap:6px}
.fw-svc{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;min-height:44px;padding:6px 10px;border-radius:12px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);font-size:15px;transition:border-color .2s ease,background-color .2s ease}
.fw-svc-res{margin-left:auto;font-weight:700}
.fw-svc.fw-fine{border-color:var(--good,#2b8a3e);background:#ebfbee}
.fw-svc.fw-wrong{border-color:var(--bad,#e03131);background:#fff5f5}
.fw-opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.fw-opt{flex-wrap:wrap;justify-content:flex-start;text-align:left;width:100%}
.fw-prob{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;min-height:60px;border-color:var(--c,#c2410c);font-size:17px;font-weight:700}
.fw-tools{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.fw-tool{position:relative;flex-direction:column;align-items:flex-start;gap:2px;width:100%;text-align:left}
.fw-tool b{font-size:17px}
.fw-job{font-size:15px;color:var(--ink-2,#4a5568)}
.fw-used{position:absolute;top:6px;right:10px;color:var(--good,#2b8a3e);font-weight:800}
@media (max-width:600px){.fw-scene,.fw-opts,.fw-tools{grid-template-columns:1fr}.fw-btns{grid-template-columns:1fr 1fr}}
`;

const widgets = {
  // Slide 1: the firewall follows its rules; it cannot tell truth from lies or judge content.
  fwRules(host, params, api) {
    const w = setup(host, api, 'rules', 'fw-r-status');
    const CARDS = [
      { icon: '🙂', from: '198.51.100.21', proto: 'TCP', port: 443, say: '請給我學校首頁。', pass: true,
        why: '符合「允許 TCP 443」，所以放行。' },
      { icon: '🧑‍💼', from: '198.51.100.66', proto: 'TCP', port: 22, say: '我是管理員，相信我，讓我進去！', pass: false,
        why: 'TCP 22 沒有允許的規則。話說得再好聽，規則沒寫就擋下。' },
      { icon: '📦', from: '198.51.100.90', proto: 'TCP', port: 443, say: '我的附件裡藏了惡意程式。', pass: true,
        why: '它符合 TCP 443，所以這個簡化防火牆放行。還需要防毒、更新等保護。' },
    ];
    const s = { i: 0, hist: [], flash: false };

    function render() {
      const c = CARDS[s.i];
      const isMatch = c && c.port === 443;
      const conn = c
        ? `<div class="fw-card fw-conn${s.flash ? ' fw-pop' : ''}">
            <div class="fw-conn-h">
              <span class="fw-emo" aria-hidden="true">${c.icon}</span>
              <span>連線 ${s.i + 1}/3：來自 <code>${c.from}</code></span>
            </div>
            <div class="fw-say">💬「${c.say}」</div>
            <div class="fw-question-port-banner">
              <span>🎯 封包要去的小門：</span>
              <span class="fw-port-pill ${isMatch ? 'fw-port-match' : 'fw-port-mismatch'}">
                <span class="fw-tag">${c.proto}</span> Port ${c.port}
              </span>
              <span style="font-weight:700;color:${isMatch ? '#2b8a3e' : '#e03131'};">
                ${isMatch ? '🟢 (號碼 443 符合規則！)' : '🔴 (號碼不符規則！)'}
              </span>
            </div>
          </div>`
        : '<div class="fw-card fw-conn"><div class="fw-conn-h">✅ 3 條連線都判斷完了</div></div>';
      const hist = s.hist.map((h) => `<span class="fw-chip ${h.pass ? 'fw-chip-pass' : 'fw-chip-block'}">${h.icon} ${h.pass ? '✅ 放行' : '⛔ 擋下'}</span>`).join('');
      w.body.innerHTML = `<div class="fw-h">此例只看連線資料。有些防火牆也會檢查內容，但不能保證擋住所有惡意程式。</div><div class="fw-card fw-rules">
          <div class="fw-h">🧱 防火牆規則表（守門員比對標準）</div>
          <div class="fw-rule fw-rule-allow">
            <span>✅ 允許進來：</span>
            <span class="fw-tag">TCP</span>
            <span class="fw-rule-port-tag">Port 443</span>
            <span>→ 學校網站伺服器</span>
          </div>
          <div class="fw-rule fw-rule-deny">⛔ 其他所有連接埠 (Port) → 擋下</div>
          <div class="fw-hint-bar">👀 守門員秘訣：眼睛盯著封包的「Port 號碼」是不是 443！</div>
        </div>
        ${conn}
        <div class="fw-choices">
          <button type="button" class="fw-btn fw-r-allow" data-act="judge" data-arg="allow">✅ 放行</button>
          <button type="button" class="fw-btn fw-r-block" data-act="judge" data-arg="block">⛔ 擋下</button>
          <button type="button" class="fw-btn" data-act="reset">↺ 重來</button>
        </div>
        <div class="fw-hist" aria-label="判斷紀錄">${hist}</div>`;
      s.flash = false;
    }

    w.on((act, arg) => {
      if (act === 'reset') {
        s.i = 0;
        s.hist = [];
        s.flash = false;
        render();
        w.say('已重來。比對封包的 Port 號碼是不是 443！');
        return;
      }
      if (act !== 'judge') return;
      const c = CARDS[s.i];
      if (!c) {
        w.say('🎉 都判斷完了。按 ↺ 重來，可以再試一次。', 'ok');
        return;
      }
      if ((arg === 'allow') !== c.pass) {
        w.say(`再看規則表：<span class="fw-tag">${c.proto}</span> <code>${c.port}</code> 有沒有允許？別管它說了什麼，只看 Port！`, 'bad');
        w.shake('.fw-conn');
        return;
      }
      s.hist.push(c);
      s.i += 1;
      s.flash = true;
      render();
      if (s.i >= CARDS.length) {
        w.say(`🎉 ${c.why}防火牆只照規則判斷，不分辨誰說真話。`, 'ok');
        w.finish();
      } else {
        w.say(`✅ ${c.why}`, 'ok');
      }
    });

    render();
    w.say('看規則表，比對封包的 Port 號碼，決定要放行還是擋下。試試看！');
  },

  // Slide 2: stateful model — replies to our own connection pass, unsolicited inbound is blocked.
  fwState(host, params, api) {
    const w = setup(host, api, 'state', 'fw-s-status');
    const s = { rec: false, replyOk: false, strangerBlk: false, anim: '', icon: '' };

    function render() {
      w.body.innerHTML = `<div class="fw-h">此例允許主動連出及其回覆，其他新進連線預設擋下。</div><div class="fw-scene">
          <div class="fw-card fw-node"><span class="fw-emo" aria-hidden="true">💻</span><span>小安的筆電</span><code>192.168.0.12</code></div>
          <div class="fw-wall"><span class="fw-emo" aria-hidden="true">🧱</span><span>防火牆</span></div>
          <div class="fw-card fw-node"><span>🌐 外面</span><span>📚 library.example.tw <code>203.0.113.25</code></span><span>❓ 陌生電腦 <code>198.51.100.66</code></span></div>
        </div>
        <div class="fw-track" aria-hidden="true"><div class="fw-wallline"></div>${s.anim ? `<div class="fw-mover fw-m-${s.anim}">${s.icon}</div>` : ''}</div>
        <div class="fw-card fw-table">
          <div class="fw-h">📋 連線紀錄表（防火牆記住的）</div>
          ${s.rec ? '<div class="fw-rec fw-s-rec">💻 192.168.0.12 ⇄ 📚 203.0.113.25 · <span class="fw-tag">TCP</span> 443</div>' : '<div class="fw-empty">（空的，沒有進行中的連線）</div>'}
        </div>
        <div class="fw-btns">
          <button type="button" class="fw-btn fw-go fw-s-out" data-act="out">📤 筆電開網頁</button>
          <button type="button" class="fw-btn fw-s-reply" data-act="reply">📥 網站送回網頁</button>
          <button type="button" class="fw-btn fw-s-stranger" data-act="stranger">📥 陌生電腦連進來</button>
          <button type="button" class="fw-btn fw-s-close" data-act="close">🔚 結束這條連線</button>
        </div>`;
    }

    const check = (msg) => {
      if (s.replyOk && s.strangerBlk) {
        w.say(`🎉 ${msg}<br>有紀錄的回覆可以進來，突然闖入的連線被擋下。`, 'ok');
        w.finish();
        return true;
      }
      return false;
    };

    w.on((act) => {
      if (act === 'out') {
        s.rec = true;
        s.anim = 'out';
        s.icon = '📨';
        render();
        w.say('📤 出去的連線被允許，防火牆在紀錄表記下一筆。');
        return;
      }
      if (act === 'reply') {
        if (!s.rec) {
          s.anim = 'in-block';
          s.icon = '📄🚫';
          render();
          w.say('⛔ 紀錄表裡沒有這條連線，所以它不算回覆，擋下。先讓筆電開網頁。', 'bad');
          return;
        }
        s.replyOk = true;
        s.anim = 'in-ok';
        s.icon = '📄';
        render();
        const msg = '✅ 這是剛才那條連線的回覆，紀錄表對得上，放行。';
        if (!check(msg)) w.say(`${msg}再試試陌生電腦！`, 'ok');
        return;
      }
      if (act === 'stranger') {
        s.strangerBlk = true;
        s.anim = 'in-block';
        s.icon = '❓🚫';
        render();
        const msg = '⛔ 沒有人先邀請它，紀錄表裡找不到，擋下。';
        if (!check(msg)) w.say(`${msg}再讓筆電開網頁試試！`, 'ok');
        return;
      }
      if (act === 'close') {
        if (!s.rec) {
          w.say('現在沒有進行中的範例連線。');
          return;
        }
        s.rec = false;
        s.anim = '';
        render();
        w.say('🔚 此例結束連線後移除紀錄，後來的新進連線會依規則擋下。真實系統可能等一段時間才清除紀錄。');
      }
    });

    render();
    w.say('按下面的按鈕，看看哪些連線進得來。試試看！');
  },

  // Slide 3: fix a blocked useful service with the smallest rule, not allow-all.
  fwNarrow(host, params, api) {
    const w = setup(host, api, 'narrow', 'fw-n-status');
    const SVCS = [
      { id: 'up', icon: '📤', name: '作業上傳網站', ip: '203.0.113.25', proto: 'TCP', port: 443, want: true },
      { id: 'rdp', icon: '🖥️', name: '遠端桌面', ip: '203.0.113.26', proto: 'TCP', port: 3389, want: false },
      { id: 'prn', icon: '🖨️', name: '印表機', ip: '203.0.113.30', proto: 'TCP', port: 9100, want: false },
    ];
    const rule = (proto, port, ip) => (v) => v.proto === proto && v.port === port && v.ip === ip;
    const OPTS = [
      { id: 'all', label: '允許所有連線進來', match: () => true,
        msg: '⚠️ 作業傳上去了，可是遠端桌面和印表機也對全世界打開了。這條規則太大了！', tone: 'bad' },
      { id: 'prn', label: '允許 <span class="fw-tag">TCP</span> <code>443</code> → <code>203.0.113.30</code>', match: rule('TCP', 443, '203.0.113.30'),
        msg: '⛔ 還是傳不上：這條開到印表機那台，不是作業網站。', tone: 'bad' },
      { id: 'narrow', label: '允許 <span class="fw-tag">TCP</span> <code>443</code> → <code>203.0.113.25</code>', match: rule('TCP', 443, '203.0.113.25'),
        msg: '🎉 作業傳上去了，其他服務還是關著。這就是最小的規則！', tone: 'ok' },
      { id: 'udp', label: '允許 <span class="fw-tag">UDP</span> <code>443</code> → <code>203.0.113.25</code>', match: rule('UDP', 443, '203.0.113.25'),
        msg: '⛔ 還是傳不上：作業網站用的是 TCP 443，不是 UDP 443。', tone: 'bad' },
    ];
    const s = { opt: '', flash: false };

    function render() {
      const o = OPTS.find((x) => x.id === s.opt);
      const svcs = SVCS.map((v) => {
        const pass = o ? o.match(v) : false;
        const fine = pass === v.want;
        return `<div class="fw-svc fw-svc-${v.id} ${fine ? 'fw-fine' : 'fw-wrong'}${s.flash ? ' fw-pop' : ''}">
          <span class="fw-emo" aria-hidden="true">${v.icon}</span><span>${v.name}</span><code>${v.ip}</code><span class="fw-tag">${v.proto}</span><code>${v.port}</code>
          <span class="fw-svc-res">${pass ? '✅ 外面連得到' : '⛔ 擋下'}${v.want ? '（要對外）' : '（不該對外）'}</span>
        </div>`;
      }).join('');
      const opts = OPTS.map((x) => `<button type="button" class="fw-btn fw-opt fw-n-${x.id}" data-act="opt" data-arg="${x.id}" aria-pressed="${s.opt === x.id}">${x.label}</button>`).join('');
      w.body.innerHTML = `<div class="fw-h">🏫 學校防火牆後面的 3 台機器：同學在家要上傳作業，卻被擋住了。</div>
        <div class="fw-svcs">${svcs}</div>
        <div class="fw-h">➕ 挑一條新規則：</div>
        <div class="fw-opts">${opts}</div>`;
      s.flash = false;
    }

    w.on((act, id) => {
      if (act !== 'opt') return;
      const o = OPTS.find((x) => x.id === id);
      s.opt = id;
      s.flash = true;
      render();
      w.say(o.msg, o.tone);
      if (id === 'narrow') w.finish();
      else w.shake('.fw-svc-up');
    });

    render();
    w.say('⛔ 作業傳不上去。挑一條規則：作業要通，其他的別打開。');
  },

  // Slide 4: a firewall is not HTTPS, not a malware scanner, and not the same as NAT.
  fwCompare(host, params, api) {
    const w = setup(host, api, 'compare', 'fw-c-status');
    const TOOLS = [
      { id: 'fw', icon: '🧱', name: '防火牆', job: '照規則放行或擋下連線' },
      { id: 'https', icon: '🔒', name: 'HTTPS 加密', job: '讓路上的人看不懂內容' },
      { id: 'av', icon: '🦠', name: '防毒掃描', job: '檢查檔案中是否藏有惡意程式' },
      { id: 'nat', icon: '🔁', name: 'NAT 位址轉換', job: '把私人 IP 換成公開 IP' },
    ];
    const PROBS = [
      { icon: '🖨️', txt: '陌生電腦想從外面直接連進家裡的印表機。', tool: 'fw', ok: '防火牆擋下沒人邀請的連線。' },
      { icon: '☕', txt: '咖啡店裡有人想偷看你送出的密碼。', tool: 'https', ok: 'HTTPS 把內容加密，路上的人看不懂。' },
      { icon: '🎮', txt: '下載的「免費遊戲」檔案裡藏了惡意程式。', tool: 'av', ok: '防毒掃描協助檢查檔案；此例的防火牆只看連線規則。' },
      { icon: '👨‍👩‍👧', txt: '家裡三台裝置要共用一個公開 IP 上網。', tool: 'nat', ok: 'NAT 把私人 IP 換成公開 IP。' },
    ];
    const s = { i: 0, used: [], flash: false };

    function render() {
      const p = PROBS[s.i];
      const prob = p
        ? `<div class="fw-card fw-prob${s.flash ? ' fw-pop' : ''}"><span class="fw-tag">問題 ${s.i + 1}/4</span><span class="fw-emo" aria-hidden="true">${p.icon}</span><span>${p.txt}</span></div>`
        : '<div class="fw-card fw-prob">✅ 4 個問題都找到工具了</div>';
      const tools = TOOLS.map((x) => `<button type="button" class="fw-btn fw-tool fw-c-${x.id}" data-act="tool" data-arg="${x.id}">
          <span><span class="fw-emo" aria-hidden="true">${x.icon}</span> <b>${x.name}</b></span><span class="fw-job">${x.job}</span>
          ${s.used.includes(x.id) ? '<span class="fw-used" aria-label="用過了">✓</span>' : ''}
        </button>`).join('');
      w.body.innerHTML = `${prob}<div class="fw-h">🧰 哪個工具負責？</div><div class="fw-tools">${tools}</div>`;
      s.flash = false;
    }

    w.on((act, id) => {
      if (act !== 'tool') return;
      const p = PROBS[s.i];
      if (!p) {
        w.say('🎉 都配好了。按 ↺ 重新玩，可以再配一次。', 'ok');
        return;
      }
      const tool = TOOLS.find((x) => x.id === id);
      if (id !== p.tool) {
        w.say(`${tool.name}的工作是「${tool.job}」。再想想這個問題需要什麼！`, 'bad');
        w.shake(`.fw-c-${id}`);
        return;
      }
      s.used.push(id);
      s.i += 1;
      s.flash = true;
      render();
      if (s.i >= PROBS.length) {
        w.say(`🎉 ${p.ok}四種工具各有工作。NAT 常讓外面不容易直接連進來，但它不等於防火牆。`, 'ok');
        w.finish();
      } else {
        w.say(`✅ ${p.ok}`, 'ok');
      }
    });

    render();
    w.say('讀問題，點負責解決它的工具。配配看！');
  },
};

export default {
  ready: true,
  unit: {
    id: 'firewall',
    part: 'adv',
    icon: '🧱',
    title: '防火牆',
    en: 'Firewalls',
    desc: '防火牆怎麼照規則放行和擋下連線，怎麼只開需要的那一條，以及它做不到的事。',
    color: '#c2410c',
    slides: [
      {
        id: 'rules',
        title: '防火牆看得穿謊話嗎？',
        text: `${t('防火牆', 'firewall')}照${t('規則', 'rule')}決定連線能不能過。這個簡化範例只看連線資料，不判斷誰說真話。猜猜看！`,
        widget: 'fwRules',
        params: {},
      },
      {
        id: 'stateful',
        title: '回覆為什麼進得來？',
        text: `${t('有狀態防火牆', 'stateful firewall')}會追蹤連線。此例允許已建立連線的${t('回覆', 'return traffic')}，其他新進連線預設擋下。試試看！`,
        widget: 'fwState',
        params: {},
      },
      {
        id: 'narrow',
        title: '連不上，就全部打開？',
        text: `有用的服務被擋住時，只開它需要的那一條：對的協定、連接埠和機器。這叫${t('最小權限', 'least privilege')}。修修看！`,
        widget: 'fwNarrow',
        params: {},
      },
      {
        id: 'compare',
        title: '防火牆不是萬能',
        text: `防火牆管連線。${t('HTTPS 加密', 'HTTPS encryption')}保護內容，${t('防毒掃描', 'malware scanner')}檢查檔案，${t('NAT 位址轉換', 'Network Address Translation')}換位址。配配看！`,
        widget: 'fwCompare',
        params: {},
      },
      {
        id: 'quiz',
        title: '考考你',
        widget: 'choice',
        params: {
          question: '同學在家傳不上作業，有人說「把防火牆全部打開就好」。比較好的做法是？',
          options: [
            { text: '只允許作業網站需要的那一條：TCP 443 到那台伺服器', correct: true },
            { text: '允許所有連線進來' },
            { text: '把防火牆整個關掉' },
            { text: '改成允許 UDP 443，反正號碼一樣' },
          ],
          explain: '全部打開，不該對外的服務也會被連到。只開需要的協定、連接埠和機器，問題解決，風險也最小。',
        },
      },
    ],
  },
  placement: { after: 'ipports', stage: 'netprivacy' },
  prerequisites: ['ipports'],
  readme: 'Practice firewall rules in a simulator: stateful return traffic, a narrow allow rule instead of allow-all, and how a firewall differs from HTTPS, malware scanning and NAT.',
  changelog: '新單元「防火牆」：在模擬器裡照規則放行或擋下連線，學會只開需要的那一條，並分清防火牆、HTTPS、防毒和 NAT。不會改動真正的防火牆設定。',
  widgets,
  css,
  checks: {
    rules: [
      { action: 'click', selector: '.fw-r-allow' },
      { action: 'click', selector: '.fw-r-block' },
      { action: 'click', selector: '.fw-r-allow' },
      { action: 'expectCount', selector: '.fw-chip', count: 3 },
      { action: 'expectText', selector: '.fw-r-status', text: '只照規則' },
    ],
    stateful: [
      { action: 'click', selector: '.fw-s-out' },
      { action: 'expectCount', selector: '.fw-s-rec', count: 1 },
      { action: 'click', selector: '.fw-s-reply' },
      { action: 'click', selector: '.fw-s-stranger' },
      { action: 'expectText', selector: '.fw-s-status', text: '有紀錄的回覆可以進來' },
    ],
    narrow: [
      { action: 'click', selector: '.fw-n-all' },
      { action: 'expectText', selector: '.fw-n-status', text: '太大' },
      { action: 'click', selector: '.fw-n-narrow' },
      { action: 'expectCount', selector: '.fw-svc.fw-fine', count: 3 },
      { action: 'expectText', selector: '.fw-n-status', text: '最小的規則' },
    ],
    compare: [
      { action: 'click', selector: '.fw-c-fw' },
      { action: 'click', selector: '.fw-c-https' },
      { action: 'click', selector: '.fw-c-av' },
      { action: 'click', selector: '.fw-c-nat' },
      { action: 'expectCount', selector: '.fw-used', count: 4 },
      { action: 'expectText', selector: '.fw-c-status', text: '各有工作' },
    ],
  },
};
