// ipports — IP 位址和連接埠 (tech-explorer topic package)
// All addresses are documentation ranges (192.0.2.x, 198.51.100.x, 203.0.113.x) or
// private ranges. Nothing here opens a real connection or scans anything.

const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const SERVER = '203.0.113.25';
const SIM = '<p class="ipp-note">🧪 模擬畫面：位址都是示範用，不會真的連線或掃描。</p>';
const ROUTER = '<svg class="ipp-svg" viewBox="0 0 32 24" width="32" height="24" aria-hidden="true"><rect x="2" y="12" width="28" height="9" rx="3" fill="#4a5568"/><line x1="9" y1="12" x2="6" y2="3" stroke="#4a5568" stroke-width="2.5" stroke-linecap="round"/><line x1="23" y1="12" x2="26" y2="3" stroke="#4a5568" stroke-width="2.5" stroke-linecap="round"/><circle cx="8" cy="16.5" r="1.6" fill="#8ce99a"/><circle cx="13" cy="16.5" r="1.6" fill="#8ce99a"/></svg>';

// Shared mount: fresh root, persistent live status, delegated clicks inside the host only.
function setup(host, api, name, statusCls) {
  host.innerHTML = '';
  const root = document.createElement('div');
  root.className = `ipp-root ipp-demo-${name}`;
  root.innerHTML = `<div class="ipp-body"></div><div class="ipp-status ${statusCls}" role="status" aria-live="polite"></div>${SIM}`;
  host.appendChild(root);
  const body = root.querySelector('.ipp-body');
  const st = root.querySelector('.ipp-status');
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
      st.className = `ipp-status ${statusCls}${tone ? ` ipp-${tone}` : ''}`;
      pulse(st, 'ipp-pop');
    },
    shake(sel) {
      const n = root.querySelector(sel);
      if (n) pulse(n, 'ipp-shake');
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

const css = baseCss('ipp', '#1864ab', '#e7f0fa') + `
.ipp-zone{font-size:15px;font-weight:400;color:var(--ink-2,#4a5568)}
.ipp-svg{flex:none}
.ipp-got{border-color:var(--good,#2b8a3e)!important;background:#ebfbee!important}
.ipp-badge{position:absolute;top:4px;right:10px;color:var(--good,#2b8a3e);font-weight:800}
.ipp-pkt{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 10px;min-height:52px;padding:8px 14px;border-radius:14px;background:#e7f0fa;border:2px solid var(--c,#1864ab);font-size:17px;font-weight:700}
.ipp-pkt code{font-size:18px}
.ipp-pkt-done{background:#ebfbee;border-color:var(--good,#2b8a3e)}
.ipp-net{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ipp-dev{display:flex;flex-direction:column;gap:8px}
.ipp-dev-h{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-weight:700}
.ipp-if{position:relative;flex-direction:column;gap:2px;width:100%}
.ipp-srvbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 14px;padding:8px 14px;font-weight:700}
.ipp-route{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
.ipp-col{display:flex;flex-direction:column;gap:8px}
.ipp-rq{justify-content:flex-start;width:100%;text-align:left}
.ipp-rq-t{display:flex;flex-direction:column;gap:2px}
.ipp-gone{min-height:52px;display:flex;align-items:center;padding:8px 14px;border-radius:14px;border:2px dashed var(--line,#e6dfd0);color:var(--ink-2,#4a5568);font-size:15px}
.ipp-door{justify-content:flex-start;flex-wrap:wrap;width:100%;text-align:left}
.ipp-door-got{margin-left:auto;color:var(--good,#2b8a3e);font-weight:700;font-size:15px}
.ipp-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.ipp-seg{display:inline-flex;align-items:center;gap:6px}
.ipp-eps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ipp-ep{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-height:52px;padding:8px 34px 8px 12px;border-radius:14px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);transition:border-color .2s ease,background-color .2s ease}
.ipp-ep.ipp-hit{border-color:var(--c,#1864ab);background:#e7f0fa}
.ipp-ep.ipp-miss{border-color:var(--bad,#e03131);background:#fff5f5}
.ipp-lrow{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1.4fr);gap:10px;align-items:center}
.ipp-ldev{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.ipp-wire{min-width:84px;text-align:center;font-size:20px;font-weight:800;color:var(--ink-3,#8a93a3)}
.ipp-wire.ipp-ok{color:var(--good,#2b8a3e)}
.ipp-wire.ipp-bad{color:var(--bad,#e03131)}
.ipp-portline{align-self:stretch;margin-top:4px;padding:8px 10px;border-radius:12px;border:2px dashed var(--line,#e6dfd0);font-weight:700}
.ipp-live{border-style:solid;border-color:var(--good,#2b8a3e);background:#ebfbee}
.ipp-sticky{padding:6px 10px;border-radius:6px;background:#fff3bf;box-shadow:0 2px 0 #f0d97a;transform:rotate(-1.5deg);font-size:15px}
.ipp-homes{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:10px}
.ipp-home{display:flex;flex-direction:column;gap:6px}
.ipp-router{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:15px}
.ipp-devbtns{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.ipp-nd{position:relative;flex-direction:column;gap:2px;width:100%}
.ipp-log{display:flex;flex-direction:column;gap:6px}
.ipp-logrow{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 10px;border-radius:10px;background:#f1f5fb;font-size:15px}
@media (max-width:600px){.ipp-net,.ipp-route,.ipp-homes,.ipp-eps,.ipp-lrow{grid-template-columns:1fr}}
`;

const widgets = {
  // Slide 1: an IP address reaches a network interface; one laptop can have two.
  ippAddress(host, params, api) {
    const w = setup(host, api, 'addr', 'ipp-a-status');
    const DEVS = [
      { id: 'srv', icon: '🖥️', name: '學校網站伺服器', zone: '🌐 網際網路' },
      { id: 'pc', icon: '💻', name: '小安的筆電', zone: '🏠 家裡' },
      { id: 'prn', icon: '🖨️', name: '印表機', zone: '🏠 家裡' },
    ];
    const IFS = [
      { id: 'srv', dev: 'srv', icon: '🔗', name: '網路線介面', ip: SERVER },
      { id: 'wifi', dev: 'pc', icon: '📶', name: 'Wi-Fi 介面', ip: '192.0.2.10' },
      { id: 'lan', dev: 'pc', icon: '🔗', name: '網路線介面', ip: '192.0.2.11' },
      { id: 'prn', dev: 'prn', icon: '📶', name: 'Wi-Fi 介面', ip: '192.0.2.20' },
    ];
    const ROUNDS = ['srv', 'lan', 'wifi'];
    const s = { round: 0, got: {}, flash: '' };
    const find = (id) => IFS.find((i) => i.id === id);
    const devName = (i) => DEVS.find((d) => d.id === i.dev).name;

    function render() {
      const goal = find(ROUNDS[s.round]);
      const pkt = goal
        ? `<div class="ipp-pkt${s.flash ? ' ipp-pop' : ''}">📨 封包 ${s.round + 1}/3 · 目的地 IP <code>${goal.ip}</code></div>`
        : '<div class="ipp-pkt ipp-pkt-done">📭 3 個封包都送完了</div>';
      const devs = DEVS.map((d) => `<div class="ipp-card ipp-dev">
        <div class="ipp-dev-h"><span class="ipp-emo" aria-hidden="true">${d.icon}</span><span>${d.name}</span><span class="ipp-zone">${d.zone}</span></div>
        ${IFS.filter((i) => i.dev === d.id).map((i) => `<button type="button" class="ipp-btn ipp-if ipp-if-${i.id}${s.got[i.id] ? ' ipp-got' : ''}${s.flash === i.id ? ' ipp-pop' : ''}" data-act="if" data-arg="${i.id}">
          <span>${i.icon} ${i.name}</span><code>${i.ip}</code>${s.got[i.id] ? '<span class="ipp-badge" aria-label="已送到">✓</span>' : ''}</button>`).join('')}
      </div>`).join('');
      w.body.innerHTML = `${pkt}<div class="ipp-net">${devs}</div>`;
      s.flash = '';
    }

    w.on((act, id) => {
      if (act !== 'if') return;
      const goal = find(ROUNDS[s.round]);
      const it = find(id);
      if (!goal) {
        w.say('🎉 封包都送到了。按 ↺ 重新玩，可以再送一次。', 'ok');
        return;
      }
      if (id !== goal.id) {
        w.say(`再看一次：這個介面是 <code>${it.ip}</code>，封包要去 <code>${goal.ip}</code>。`, 'bad');
        w.shake(`.ipp-if-${id}`);
        return;
      }
      s.got[id] = true;
      s.round += 1;
      s.flash = id;
      render();
      if (s.round >= ROUNDS.length) {
        w.say('🎉 3 個封包都送到了：IP 位址找的是網路介面，一台筆電可以有兩個。', 'ok');
        w.finish();
      } else if (id === 'lan') {
        w.say(`✅ 送到${devName(it)}的網路線介面。它的 Wi-Fi 介面有另一個 IP 喔！`, 'ok');
      } else {
        w.say(`✅ 送到${devName(it)}的${it.name}了。看下一個封包！`, 'ok');
      }
    });

    render();
    w.say('看封包上的目的地 IP，點那個網路介面。試試看！');
  },

  // Slide 2: one IP, many services; the port number picks the program.
  ippRoute(host, params, api) {
    const w = setup(host, api, 'route', 'ipp-r-status');
    const REQ = [
      { id: 'web', icon: '📄', name: '看學校網頁', proto: 'TCP', port: 443, door: 't443' },
      { id: 'mail', icon: '✉️', name: '收學校信件', proto: 'TCP', port: 993, door: 't993' },
      { id: 'voice', icon: '🎧', name: '線上課語音', proto: 'UDP', port: 3478, door: 'u3478' },
    ];
    const DOORS = [
      { id: 't993', proto: 'TCP', port: 993, icon: '📬', prog: '信件程式' },
      { id: 'u3478', proto: 'UDP', port: 3478, icon: '🎙️', prog: '語音程式' },
      { id: 't443', proto: 'TCP', port: 443, icon: '🌐', prog: '網站程式' },
    ];
    const s = { sel: '', inDoor: {}, flash: '' };
    const req = (id) => REQ.find((r) => r.id === id);
    const placed = (r) => Object.values(s.inDoor).includes(r.id);

    function render() {
      const cards = REQ.map((r) => (placed(r)
        ? `<div class="ipp-gone">✓ ${r.icon} ${r.name}</div>`
        : `<button type="button" class="ipp-btn ipp-rq ipp-rq-${r.id}${s.sel === r.id ? ' ipp-sel' : ''}" data-act="card" data-arg="${r.id}" aria-pressed="${s.sel === r.id}">
            <span class="ipp-emo" aria-hidden="true">${r.icon}</span>
            <span class="ipp-rq-t"><span>${r.name}</span><span><code>${SERVER} : ${r.port}</code> <span class="ipp-tag">${r.proto}</span></span></span>
          </button>`)).join('');
      const doors = DOORS.map((d) => {
        const got = s.inDoor[d.id] ? req(s.inDoor[d.id]) : null;
        return `<button type="button" class="ipp-btn ipp-door ipp-door-${d.id}${got ? ' ipp-got' : ''}${s.flash === d.id ? ' ipp-pop' : ''}" data-act="door" data-arg="${d.id}">
          <span class="ipp-tag">${d.proto}</span><code>${d.port}</code><span>${d.icon} ${d.prog}</span>${got ? `<span class="ipp-door-got">${got.icon} 收到</span>` : ''}
        </button>`;
      }).join('');
      w.body.innerHTML = `<div class="ipp-card ipp-srvbar"><span>🖥️ 伺服器 <code>${SERVER}</code></span><span class="ipp-zone">🔌 背後的實體網路孔：只有 1 個</span></div>
        <div class="ipp-route">
          <div class="ipp-col"><div class="ipp-h">📮 請求卡</div>${cards}</div>
          <div class="ipp-col"><div class="ipp-h">🚪 伺服器裡的服務（連接埠）</div>${doors}</div>
        </div>`;
      s.flash = '';
    }

    w.on((act, id) => {
      if (act === 'card') {
        if (placed(req(id))) return;
        s.sel = id;
        render();
        w.say(`選好「${req(id).name}」。再點它要去的門。`);
        return;
      }
      if (act !== 'door') return;
      const d = DOORS.find((x) => x.id === id);
      if (s.inDoor[id]) {
        w.say(`${d.prog}已經收到請求了，換一張卡。`);
        return;
      }
      if (!s.sel) {
        w.say('先點左邊一張請求卡。');
        w.shake('.ipp-route .ipp-col');
        return;
      }
      const r = req(s.sel);
      if (r.door !== id) {
        w.say(`不對喔：卡片寫 ${r.proto} ${r.port}，這扇門是 ${d.proto} ${d.port}。`, 'bad');
        w.shake(`.ipp-door-${id}`);
        return;
      }
      s.inDoor[id] = r.id;
      s.sel = '';
      s.flash = id;
      render();
      const n = Object.keys(s.inDoor).length;
      if (n === REQ.length) {
        w.say(`🎉 同一個 IP <code>${SERVER}</code>，靠連接埠交給 3 個不同的程式。`, 'ok');
        w.finish();
      } else {
        w.say(`✅ ${d.prog}收到「${r.name}」。還有 ${REQ.length - n} 張卡。`, 'ok');
      }
    });

    render();
    w.say('點一張請求卡，再點它要去的門。試試看！');
  },

  // Slide 3: protocol + port together name the endpoint; TCP 443 ≠ UDP 443.
  ippProto(host, params, api) {
    const w = setup(host, api, 'proto', 'ipp-p-status');
    const EP = [
      { id: 't80', proto: 'TCP', port: '80', icon: '↪️', prog: '轉址程式' },
      { id: 't443', proto: 'TCP', port: '443', icon: '🌐', prog: '網頁程式 HTTPS' },
      { id: 'u80', proto: 'UDP', port: '80', icon: '💤', prog: '（沒有程式）' },
      { id: 'u443', proto: 'UDP', port: '443', icon: '⚡', prog: '快速網頁程式 HTTP/3' },
    ];
    const s = { proto: 'TCP', port: '80', last: '', got: {}, flash: false };

    function render() {
      const seg = (act, val, cur) => `<button type="button" class="ipp-btn ipp-p-${val.toLowerCase()}" data-act="${act}" data-arg="${val}" aria-pressed="${cur === val}">${val}</button>`;
      const eps = EP.map((e) => {
        let cls = '';
        if (s.last === e.id) cls = (e.id === 'u80' ? ' ipp-miss' : ' ipp-hit') + (s.flash ? ' ipp-pop' : '');
        return `<div class="ipp-ep ipp-ep-${e.id}${cls}"><span class="ipp-tag">${e.proto}</span><code>${e.port}</code><span>${e.icon} ${e.prog}</span>${s.got[e.id] ? '<span class="ipp-badge" aria-label="收到過">✓</span>' : ''}</div>`;
      }).join('');
      w.body.innerHTML = `<div class="ipp-ctl">
          <div class="ipp-seg" role="group" aria-label="協定"><span class="ipp-h">協定</span>${seg('proto', 'TCP', s.proto)}${seg('proto', 'UDP', s.proto)}</div>
          <div class="ipp-seg" role="group" aria-label="連接埠"><span class="ipp-h">連接埠</span>${seg('port', '80', s.port)}${seg('port', '443', s.port)}</div>
          <button type="button" class="ipp-btn ipp-go ipp-p-send" data-act="send">📨 送出</button>
        </div>
        <div class="ipp-pkt">📨 <span class="ipp-tag">${s.proto}</span> <code>${SERVER} : ${s.port}</code></div>
        <div class="ipp-h">🖥️ 伺服器上的端點（協定 + 連接埠）</div>
        <div class="ipp-eps">${eps}</div>
        <div class="ipp-h">任務：讓 🌐 和 ⚡ 都收到封包</div>`;
      s.flash = false;
    }

    w.on((act, arg) => {
      if (act === 'proto') { s.proto = arg; s.last = ''; render(); return; }
      if (act === 'port') { s.port = arg; s.last = ''; render(); return; }
      if (act !== 'send') return;
      const e = EP.find((x) => x.proto === s.proto && x.port === s.port);
      s.last = e.id;
      s.flash = true;
      if (e.id === 'u80') {
        render();
        w.say('❌ UDP 80 沒有程式在等，封包沒人收。', 'bad');
        return;
      }
      if (e.id === 't80') {
        render();
        w.say('↪️ TCP 80 的轉址程式說：「請改走 443。」');
        return;
      }
      s.got[e.id] = true;
      render();
      if (s.got.t443 && s.got.u443) {
        w.say('🎉 TCP 443 和 UDP 443 是兩個不同的端點，各自交給不同的程式。', 'ok');
        w.finish();
      } else {
        w.say(`✅ ${e.proto} 443 → ${e.icon} ${e.prog}收到了。換另一個協定試試！`, 'ok');
      }
    });

    render();
    w.say('選協定和連接埠，再按送出。試試看！');
  },

  // Slide 4: a port number alone starts nothing; a program must listen.
  ippListen(host, params, api) {
    const w = setup(host, api, 'listen', 'ipp-l-status');
    const s = { noted: false, run: false, fail: false, ok: false, wire: '', flash: false };

    function render() {
      const wire = s.wire === 'ok' ? '✅ ⇄' : s.wire === 'bad' ? '✋ ✕' : '→';
      w.body.innerHTML = `<div class="ipp-lrow">
          <div class="ipp-card ipp-ldev"><span class="ipp-emo" aria-hidden="true">📱</span><span>同學的平板</span><code>192.0.2.30</code></div>
          <div class="ipp-wire${s.wire ? ` ipp-${s.wire}` : ''}${s.flash ? ' ipp-pop' : ''}">${wire}<br><span class="ipp-tag">TCP</span> <code>7000</code></div>
          <div class="ipp-card ipp-ldev"><span class="ipp-emo" aria-hidden="true">🖥️</span><span>練習伺服器</span><code>${SERVER}</code>
            <div class="ipp-portline${s.run ? ' ipp-live' : ''}">TCP 7000：${s.run ? '🟢 🧩 拼圖程式在聽' : '⚪ 沒有程式'}</div>
            ${s.noted ? '<div class="ipp-sticky">📝 紙條：「TCP 7000 = 拼圖遊戲」</div>' : ''}
          </div>
        </div>
        <div class="ipp-ctl">
          <button type="button" class="ipp-btn ipp-l-note" data-act="note">📝 只寫下號碼 7000</button>
          <button type="button" class="ipp-btn ipp-l-prog" data-act="prog" aria-pressed="${s.run}">${s.run ? '⏹️ 停止拼圖程式' : '▶️ 啟動拼圖程式'}</button>
          <button type="button" class="ipp-btn ipp-go ipp-l-send" data-act="send">📨 從平板連過去</button>
        </div>`;
      s.flash = false;
    }

    w.on((act) => {
      if (act === 'note') {
        if (s.noted) { w.say('紙條已經貼好了。連連看，有沒有用？'); return; }
        s.noted = true;
        render();
        w.say('📝 號碼寫好了，可是還沒有程式。連連看！');
        return;
      }
      if (act === 'prog') {
        s.run = !s.run;
        render();
        w.say(s.run ? '▶️ 拼圖程式開始在 TCP 7000 監聽。' : '⏹️ 程式停了，TCP 7000 又沒有程式在等。');
        return;
      }
      if (act !== 'send') return;
      s.flash = true;
      if (s.run) {
        s.ok = true;
        s.wire = 'ok';
      } else {
        s.fail = true;
        s.wire = 'bad';
      }
      render();
      if (s.ok && s.fail) {
        w.say(`🎉 ${s.run ? '連上了' : '又連不上了'}！號碼只是門牌：要有程式在聽，連線才有人接。`, 'ok');
        w.finish();
      } else if (s.run) {
        w.say('✅ 連上了！拼圖程式回覆「歡迎來玩」。停止程式，再連一次看看。', 'ok');
      } else {
        w.say(`❌ 連不上：TCP 7000 沒有程式在聽。${s.noted ? '紙條上寫了號碼也沒用。' : '光有號碼，不會變出服務。'}`, 'bad');
      }
    });

    render();
    w.say('先從平板連過去，再啟動程式，比比看。試試看！');
  },

  // Slide 5: private addresses repeat in each home; a shared public IP is not one person.
  ippPublic(host, params, api) {
    const w = setup(host, api, 'public', 'ipp-n-status');
    const HOMES = [
      { id: 'a', name: '🏠 小安家', pub: '198.51.100.40', devs: [
        { id: 'a1', icon: '📱', name: '媽媽的手機', ip: '192.168.0.11' },
        { id: 'a2', icon: '📱', name: '小安的平板', ip: '192.168.0.12' },
      ] },
      { id: 'b', name: '🏠 鄰居家', pub: '198.51.100.77', devs: [
        { id: 'b1', icon: '💻', name: '鄰居的筆電', ip: '192.168.0.12' },
      ] },
    ];
    const ALL = HOMES.flatMap((h) => h.devs.map((d) => ({ ...d, home: h })));
    const dev = (id) => ALL.find((d) => d.id === id);
    const s = { sent: [], flash: '' };

    function render() {
      const homes = HOMES.map((h) => `<div class="ipp-card ipp-home">
          <div class="ipp-dev-h">${h.name}</div>
          <div class="ipp-router">${ROUTER}<span>路由器・公開 IP</span><code>${h.pub}</code></div>
          <div class="ipp-devbtns">${h.devs.map((d) => {
            const sent = s.sent.includes(d.id);
            return `<button type="button" class="ipp-btn ipp-nd ipp-n-${d.id}${sent ? ' ipp-got' : ''}" data-act="send" data-arg="${d.id}">
              <span>${d.icon} ${d.name}</span><span class="ipp-zone">私人 IP <code>${d.ip}</code></span>${sent ? '<span class="ipp-badge" aria-label="送過了">✓</span>' : ''}</button>`;
          }).join('')}</div>
        </div>`).join('');
      const rows = s.sent.length
        ? s.sent.map((id, i) => `<div class="ipp-logrow ipp-n-row${s.flash === id ? ' ipp-pop' : ''}">#${i + 1} 來自 <code>${dev(id).home.pub}</code> · 打開首頁</div>`).join('')
        : '<div class="ipp-zone">還沒有人來。點一台裝置送出請求。</div>';
      w.body.innerHTML = `<div class="ipp-homes">${homes}</div>
        <div class="ipp-card ipp-log"><div class="ipp-h">🌐 library.example.tw 的紀錄（網站看到的）</div>${rows}</div>`;
      s.flash = '';
    }

    w.on((act, id) => {
      if (act !== 'send') return;
      const d = dev(id);
      if (s.sent.includes(id)) {
        w.say(`${d.name}已經送過了，換另一台。`);
        return;
      }
      s.sent.push(id);
      s.flash = id;
      render();
      if (s.sent.length === ALL.length) {
        w.say('🎉 私人 IP 在不同的家可以重複；只看公開 IP，無法確定是哪個人。網站仍可能用登入帳號或 Cookie 辨認。', 'ok');
        w.finish();
        return;
      }
      const sameHome = s.sent.filter((x) => dev(x).home === d.home).length;
      if (sameHome > 1) {
        w.say(`兩台不同的裝置，網站看到的都是 <code>${d.home.pub}</code>。`, 'ok');
      } else if (d.id === 'b1') {
        w.say('鄰居也用 <code>192.168.0.12</code>，可是出門後變成 <code>198.51.100.77</code>。', 'ok');
      } else {
        w.say(`這份連線來源紀錄列出 <code>${d.home.pub}</code>，不是家裡的 <code>${d.ip}</code>。再送一台！`, 'ok');
      }
    });

    render();
    w.say('點每一台裝置，送出請求，看網站記下什麼。送送看！');
  },
};

export default {
  ready: true,
  unit: {
    id: 'ipports',
    part: 'adv',
    icon: '🚪',
    title: 'IP 位址和連接埠',
    en: 'IP Addresses and Ports',
    desc: '同一個 IP 上，連接埠和協定怎麼把連線交給對的服務；公開 IP 為什麼不等於一個人。',
    color: '#1864ab',
    slides: [
      {
        id: 'address',
        title: 'IP 位址找誰？',
        text: `${t('IP 位址', 'IP address')}是給${t('網路介面', 'network interface')}的地址。一台筆電的 Wi-Fi 和網路線，可以各有一個。送送看！`,
        widget: 'ippAddress',
        params: {},
      },
      {
        id: 'ports',
        title: '同一個 IP，很多服務',
        text: `${t('連接埠', 'port')}是一個號碼，指出要交給哪個服務程式。它不是機器背後的插孔。把請求卡送到對的門！`,
        widget: 'ippRoute',
        params: {},
      },
      {
        id: 'protocol',
        title: 'TCP 443 和 UDP 443 一樣嗎？',
        text: `${t('協定', 'protocol')}也要算進去：TCP 443 和 UDP 443 是兩個不同的${t('端點', 'endpoint')}。換換看！`,
        widget: 'ippProto',
        params: {},
      },
      {
        id: 'listen',
        title: '寫下號碼就有服務嗎？',
        text: `連接埠要有程式在${t('監聽', 'listen')}，連線才有人接。光寫下號碼，什麼也不會發生。試試看！`,
        widget: 'ippListen',
        params: {},
      },
      {
        id: 'public',
        title: '公開 IP 是一個人嗎？',
        text: `家裡的裝置用${t('私人 IP', 'private IP address')}，上網時共用路由器的${t('公開 IP', 'public IP address')}。所以一個公開 IP 不等於一個人。送送看！`,
        widget: 'ippPublic',
        params: {},
      },
      {
        id: 'quiz',
        title: '考考你',
        widget: 'choice',
        params: {
          question: '伺服器 203.0.113.25 同時有 TCP 443 和 UDP 443，它們是什麼關係？',
          options: [
            { text: '兩個不同的端點，可以交給不同的程式', correct: true },
            { text: '同一個端點，因為號碼一樣' },
            { text: '伺服器背後的兩個實體插孔' },
            { text: '代表同一個人的兩台手機' },
          ],
          explain: '連接埠要搭配協定一起看：TCP 443 和 UDP 443 是兩個不同的端點。連接埠號碼不是實體插孔。',
        },
      },
    ],
  },
  placement: {
    after: 'iot',
    stage: 'netprivacy',
    newStage: { id: 'netprivacy', after: 'ainet', part: 'adv', icon: '🚦', title: '連線和隱私', en: 'Connections and Privacy' },
  },
  prerequisites: ['internet', 'web'],
  readme: 'Route pretend requests by IP address, port and protocol, see that a port needs a listening program, and compare private addresses with a shared public address.',
  changelog: '新單元「IP 位址和連接埠」：用模擬的請求卡認識 IP 位址、連接埠和 TCP/UDP，並了解一個公開 IP 不等於一個人。全部是模擬，不會真的連線。',
  widgets,
  css,
  checks: {
    address: [
      { action: 'click', selector: '.ipp-if-srv' },
      { action: 'click', selector: '.ipp-if-lan' },
      { action: 'click', selector: '.ipp-if-wifi' },
      { action: 'expectCount', selector: '.ipp-if.ipp-got', count: 3 },
      { action: 'expectText', selector: '.ipp-a-status', text: '都送到了' },
    ],
    ports: [
      { action: 'expectCount', selector: '.ipp-root.ipp-route', count: 0 },
      { action: 'expectCount', selector: '.ipp-demo-route > .ipp-body > .ipp-route', count: 1 },
      { action: 'click', selector: '.ipp-rq-web' },
      { action: 'click', selector: '.ipp-door-t443' },
      { action: 'click', selector: '.ipp-rq-mail' },
      { action: 'click', selector: '.ipp-door-t993' },
      { action: 'click', selector: '.ipp-rq-voice' },
      { action: 'click', selector: '.ipp-door-u3478' },
      { action: 'expectCount', selector: '.ipp-door.ipp-got', count: 3 },
      { action: 'expectText', selector: '.ipp-r-status', text: '同一個 IP' },
    ],
    protocol: [
      { action: 'click', selector: '.ipp-p-443' },
      { action: 'click', selector: '.ipp-p-send' },
      { action: 'expectText', selector: '.ipp-ep-t443', text: '✓' },
      { action: 'click', selector: '.ipp-p-udp' },
      { action: 'click', selector: '.ipp-p-send' },
      { action: 'expectText', selector: '.ipp-p-status', text: '不同的端點' },
    ],
    listen: [
      { action: 'click', selector: '.ipp-l-send' },
      { action: 'expectText', selector: '.ipp-l-status', text: '連不上' },
      { action: 'click', selector: '.ipp-l-prog' },
      { action: 'click', selector: '.ipp-l-send' },
      { action: 'expectText', selector: '.ipp-l-status', text: '號碼只是門牌' },
    ],
    public: [
      { action: 'click', selector: '.ipp-n-a1' },
      { action: 'click', selector: '.ipp-n-a2' },
      { action: 'click', selector: '.ipp-n-b1' },
      { action: 'expectCount', selector: '.ipp-n-row', count: 3 },
      { action: 'expectText', selector: '.ipp-n-status', text: '只看公開 IP' },
    ],
  },
};
