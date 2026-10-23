// vpn — VPN 虛擬私人網路 (tech-explorer topic package)
// A simplified visibility model with fictional sites, accounts and documentation addresses.
// No provider names, no bypass steps, no real connections.

const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

const SIM = '<p class="vpn-note">🧪 簡化模型：網站、帳號和位址都是示範用，不會真的連線。</p>';
const CAFE_IP = '198.51.100.40';
const VPN_IP = '203.0.113.80';

// Shared mount: fresh root, persistent live status, delegated clicks inside the host only.
function setup(host, api, name, statusCls) {
  host.innerHTML = '';
  const root = document.createElement('div');
  root.className = `vpn-root vpn-${name}`;
  root.innerHTML = `<div class="gemini-tag" data-created-by="gemini"><span class="gemini-spark">✨</span> Gemini 互動設計</div><div class="vpn-body"></div><div class="vpn-status ${statusCls}" role="status" aria-live="polite"></div>${SIM}`;
  host.appendChild(root);
  const body = root.querySelector('.vpn-body');
  const st = root.querySelector('.vpn-status');
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
      st.className = `vpn-status ${statusCls}${tone ? ` vpn-${tone}` : ''}`;
      pulse(st, 'vpn-pop');
    },
    shake(sel) {
      const n = root.querySelector(sel);
      if (n) pulse(n, 'vpn-shake');
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

const css = baseCss('vpn', '#6741d9', '#f3f0ff') + `
.vpn-path{display:grid;gap:8px 6px;align-items:stretch}
.vpn-hop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:76px;padding:6px 4px;border-radius:14px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);text-align:center;font-size:15px;overflow-wrap:anywhere}
.vpn-hop-vpn{border-color:var(--c,#6741d9);background:#f3f0ff;font-weight:700}
.vpn-band{display:flex;align-items:center;justify-content:center;min-height:36px;padding:4px 8px;border-radius:999px;font-size:15px;font-weight:700;text-align:center}
.vpn-band-plain{background:#f1f3f5;color:var(--ink-2,#4a5568)}
.vpn-band-tun{background:var(--c,#6741d9);color:#fff}
.vpn-track{position:relative;height:40px;border-radius:999px;background:#f6f1e7;overflow:hidden}
.vpn-mover{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;padding:0 6px;font-size:24px;line-height:1;transform:translateX(calc(100% - 52px));animation:vpn-go 1s ease-in-out both;will-change:transform}
@keyframes vpn-go{from{transform:translateX(0)}to{transform:translateX(calc(100% - 52px))}}
.vpn-sent{display:flex;flex-wrap:wrap;gap:6px}
.vpn-chip{padding:3px 10px;border-radius:999px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);font-size:15px}
.vpn-chip-on{border-color:var(--good,#2b8a3e);background:#ebfbee}
/* 4 Stations Grid & Corridor */
.vpn-stations-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch;margin-top:4px}
@media (max-width:680px){.vpn-stations-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.vpn-station{background:var(--card,#fff);border:2px solid var(--line,#e6dfd0);border-radius:16px;padding:10px 8px;display:flex;flex-direction:column;gap:6px;min-height:120px;transition:border-color .2s ease,background-color .2s ease,box-shadow .2s ease}
.vpn-station-h{font-weight:700;font-size:14px;display:flex;align-items:center;gap:4px}
.vpn-ip-tag{font-size:12px;color:var(--ink-2,#4a5568)}
.vpn-ip-tag code{font-size:12px}
.vpn-station-desc{font-size:12px;color:var(--ink-2,#4a5568);margin-top:auto}
.vpn-spy-box{display:flex;flex-direction:column;gap:4px;margin-top:auto}
.vpn-spy-avatar{font-size:12px;font-weight:700;color:#d9480f}
.vpn-spy-bubble{font-size:12px;font-weight:700;padding:4px 8px;border-radius:8px;line-height:1.3;border:1px solid var(--line,#e6dfd0);background:#f8f9fa}
.vpn-spy-leak{background:#fff5f5;border-color:#ff8787;color:#c92a2a;animation:vpn-pop .3s ease-out}
.vpn-spy-safe{background:#f3f0ff;border-color:#b197fc;color:#5f3dc4;animation:vpn-pop .3s ease-out}
.vpn-st-off{opacity:.7;background:#fdfcfb;border-style:dashed}
.vpn-hop-vpn{border-color:var(--c,#6741d9)!important;background:#f8f6ff!important;box-shadow:0 0 0 2px rgba(103,65,217,.15);font-weight:700}
.vpn-relay-box{font-size:12px;padding:4px 8px;border-radius:8px;background:#f1f3f5;border:1px dashed #ced4da;margin-top:auto;line-height:1.3}
.vpn-relay-box.vpn-relay-active{border-style:solid;border-color:var(--c,#6741d9);background:#f3f0ff;color:#5f3dc4;font-weight:700;animation:vpn-pop .3s ease-out}
.vpn-target-log-box{font-size:12px;padding:4px 8px;border-radius:8px;background:#f1f3f5;border:1px solid #ced4da;margin-top:auto;display:flex;flex-direction:column;gap:2px;line-height:1.3}
.vpn-log-title{font-weight:700;font-size:11px;color:var(--ink-2,#4a5568)}
.vpn-log-val{font-size:12px}
.vpn-target-log-box.vpn-log-leak{background:#fff5f5;border-color:#ff8787;color:#c92a2a;animation:vpn-pop .3s ease-out}
.vpn-target-log-box.vpn-log-masked{background:#ebfbee;border-color:#8ce99a;color:#2b8a3e;font-weight:700;animation:vpn-pop .3s ease-out}
.vpn-corridor{position:relative;margin:8px 0;border-radius:14px;overflow:visible}
.vpn-tunnel-pipe{display:flex;width:100%;min-height:50px;border-radius:14px;box-shadow:inset 0 2px 6px rgba(0,0,0,.35);overflow:hidden}
.vpn-pipe-body{flex:0 0 75%;background:linear-gradient(180deg,#2b303a 0%,#16181d 50%,#262931 100%);border:2px solid #495057;border-right:3px solid #7950f2;border-radius:14px 0 0 14px;display:flex;align-items:center;justify-content:center;color:#d0bfff;font-size:13px;font-weight:700;letter-spacing:.3px;text-shadow:0 1px 3px rgba(0,0,0,.9);padding:6px 10px;text-align:center;box-sizing:border-box}
.vpn-exit-body{flex:1;background:#ebfbee;border:2px dashed #8ce99a;border-left:none;border-radius:0 14px 14px 0;display:flex;align-items:center;justify-content:center;color:#2b8a3e;font-size:13px;font-weight:700;padding:6px 8px;text-align:center;box-sizing:border-box}
.vpn-plain-road{width:100%;min-height:50px;background:#f8f9fa;border:2px dashed #ced4da;border-radius:14px;display:flex;align-items:center;justify-content:center;color:var(--ink-2,#4a5568);font-size:13px;font-weight:600;padding:6px 12px;text-align:center;box-sizing:border-box}
.vpn-packet-lane{position:absolute;inset:0;pointer-events:none;overflow:visible}
.vpn-flying-packet{position:absolute;top:50%;will-change:transform,left,opacity}
.vpn-pkt-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,.25)}
.vpn-pkt-plain{background:#fff;border:2px solid #fd7e14;color:#d9480f}
.vpn-pkt-dark{background:#212529;border:2px solid #b197fc;color:#f3f0ff}
.vpn-pkt-green{background:#2b8a3e;border:2px solid #51cf66;color:#fff}
.vpn-packet-open{animation:vpn-fly-open 1.1s cubic-bezier(.25,.1,.25,1) forwards}
.vpn-packet-tunnel{animation:vpn-fly-tunnel .75s cubic-bezier(.25,.1,.25,1) forwards}
.vpn-packet-vpn-relay{animation:vpn-fly-relay .75s cubic-bezier(.25,.1,.25,1) .7s forwards;opacity:0}
@keyframes vpn-fly-open{0%{left:4%;opacity:0;transform:translateY(-50%) scale(.9)}12%{opacity:1;transform:translateY(-50%) scale(1)}85%{opacity:1}100%{left:82%;opacity:.95;transform:translateY(-50%) scale(1)}}
@keyframes vpn-fly-tunnel{0%{left:4%;opacity:0;transform:translateY(-50%) scale(.8)}15%{opacity:1;transform:translateY(-50%) scale(1)}85%{opacity:1}100%{left:62%;opacity:0;transform:translateY(-50%) scale(.85)}}
@keyframes vpn-fly-relay{0%{left:62%;opacity:0;transform:translateY(-50%) scale(.8)}20%{opacity:1;transform:translateY(-50%) scale(1)}85%{opacity:1}100%{left:82%;opacity:1;transform:translateY(-50%) scale(1)}}
.vpn-obs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.vpn-ob{display:flex;flex-direction:column;gap:6px}
.vpn-ob-h{font-weight:700}
.vpn-line{display:flex;flex-direction:column;gap:2px;font-size:15px}
.vpn-k{color:var(--ink-2,#4a5568);font-size:15px}
.vpn-v{padding:3px 8px;border-radius:8px;font-size:15px;overflow-wrap:anywhere}
.vpn-see{background:#fff4e6;color:#8a3b00}
.vpn-hide{background:#f3f0ff;color:#5f3dc4}
.vpn-na{background:#f1f3f5;color:var(--ink-2,#4a5568)}
.vpn-browser{display:flex;flex-direction:column;gap:8px;padding:0;overflow:hidden}
.vpn-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px 12px;background:#f1f3f5;border-bottom:2px solid var(--line,#e6dfd0)}
.vpn-pages{display:flex;flex-wrap:wrap;gap:8px;padding:0 12px 10px}
.vpn-log{display:flex;flex-direction:column;gap:6px}
.vpn-logrow{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 10px;border-radius:10px;background:#f8f6ff;font-size:15px}
.vpn-empty{font-size:15px;color:var(--ink-2,#4a5568)}
.vpn-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr);gap:8px;align-items:center}
.vpn-place{display:flex;flex-direction:column;gap:4px}
.vpn-link{display:flex;align-items:center;justify-content:center;min-height:44px;padding:4px 8px;border-radius:999px;font-size:15px;font-weight:700;text-align:center;background:#f1f3f5;color:var(--ink-2,#4a5568);transition:background-color .25s ease,color .25s ease}
.vpn-link.vpn-tun{background:var(--c,#6741d9);color:#fff}
.vpn-screen{display:flex;align-items:center;min-height:56px;font-size:16px}
.vpn-screen.vpn-scr-ok{border-color:var(--good,#2b8a3e);background:#ebfbee}
.vpn-screen.vpn-scr-no{border-color:var(--bad,#e03131);background:#fff5f5}
.vpn-item{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;min-height:64px;border-color:var(--c,#6741d9);font-size:17px;font-weight:700}
.vpn-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.vpn-done{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
.vpn-res{padding:4px 10px;border-radius:10px;border:2px solid var(--line,#e6dfd0);background:var(--card,#fff);font-size:15px}
.vpn-res-yes{border-color:var(--c,#6741d9);background:#f3f0ff}
@media (max-width:600px){.vpn-obs,.vpn-map{grid-template-columns:1fr}}
`;

const widgets = {
  // Slide 1: ordinary route vs. device → encrypted tunnel → VPN server → website.
  vpnRoute(host, params, api) {
    const w = setup(host, api, 'route', 'vpn-r-status');
    const s = { vpn: false, sentOff: false, sentOn: false, lastSent: null, animating: false };

    function render() {
      w.body.innerHTML = `
        <div class="vpn-row">
          <button type="button" class="vpn-btn vpn-r-toggle" data-act="toggle" aria-pressed="${s.vpn}">
            🛡️ VPN 連線開關：${s.vpn ? '🟢 已開啟 (地下隧道)' : '⚪ 已關閉 (一般連線)'}
          </button>
          <button type="button" class="vpn-btn vpn-go vpn-r-send" data-act="send">📨 送出請求</button>
          <button type="button" class="vpn-btn" data-act="reset">↺ 重來</button>
        </div>

        <!-- 4 Stations on screen -->
        <div class="vpn-stations-grid">
          <!-- Station 1: 小安 -->
          <div class="vpn-station vpn-st-client">
            <div class="vpn-station-h"><span>📱 小安</span></div>
            <div class="vpn-ip-tag">IP: <code>114.32.1.5</code></div>
            <div class="vpn-station-desc">
              ${s.vpn ? '🔒 封包密文封裝' : '📄 封包明文直發'}
            </div>
          </div>

          <!-- Station 2: 咖啡店 Wi-Fi (with 🦊 偷看客) -->
          <div class="vpn-station vpn-st-wifi">
            <div class="vpn-station-h"><span>📶 咖啡店 Wi-Fi</span></div>
            <div class="vpn-spy-box">
              <div class="vpn-spy-avatar">🦊 偷看客</div>
              <div class="vpn-spy-bubble ${s.lastSent === 'on' ? 'vpn-spy-safe' : s.lastSent === 'off' ? 'vpn-spy-leak' : ''}">
                ${s.lastSent === 'on'
                  ? '😵 只有亂碼 🔒'
                  : s.lastSent === 'off'
                    ? '👀 看見去動物園！'
                    : '👀 埋伏等待中'}
              </div>
            </div>
          </div>

          <!-- Station 3: VPN 伺服器 (has class .vpn-hop-vpn when VPN on) -->
          <div class="vpn-station vpn-st-vpn ${s.vpn ? 'vpn-hop-vpn' : 'vpn-st-off'}">
            <div class="vpn-station-h"><span>🛡️ VPN 伺服器</span></div>
            <div class="vpn-ip-tag">IP: <code>203.0.113.88</code></div>
            <div class="vpn-relay-box ${s.vpn ? 'vpn-relay-active' : ''}">
              ${s.vpn
                ? '🚀 VPN 伺服器替小安發送請求 ➔ 去動物園'
                : '（未啟用）'}
            </div>
          </div>

          <!-- Station 4: 動物園網站 (目標) -->
          <div class="vpn-station vpn-st-target">
            <div class="vpn-station-h"><span>🦁 動物園網站</span></div>
            <div class="vpn-target-log-box ${s.lastSent === 'on' ? 'vpn-log-masked' : s.lastSent === 'off' ? 'vpn-log-leak' : ''}">
              <span class="vpn-log-title">📝 網站訪客紀錄</span>
              <div class="vpn-log-val">
                ${s.lastSent === 'on'
                  ? '訪客 IP: <code>203.0.113.88</code> (綠色隱藏成功 ✨)'
                  : s.lastSent === 'off'
                    ? '訪客 IP: <code>114.32.1.5</code> (紅色曝光 ⚠️)'
                    : '等待請求中...'}
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Pipe Corridor: Steel Tunnel vs Plain Road -->
        <div class="vpn-corridor ${s.vpn ? 'vpn-corridor-vpn' : 'vpn-corridor-plain'}">
          ${s.vpn ? `
            <div class="vpn-tunnel-pipe">
              <div class="vpn-pipe-body">
                <span>🚇 加密地下隧道（小安 ➔ VPN 伺服器）🔒</span>
              </div>
              <div class="vpn-exit-body">
                <span>🌿 VPN 代表發送 ➔ 去動物園</span>
              </div>
            </div>
          ` : `
            <div class="vpn-plain-road">
              <span>────── 露天連線（明文直連，無隧道保護）──────➔</span>
            </div>
          `}

          <div class="vpn-packet-lane" aria-hidden="true">
            ${s.animating ? (
              s.vpn ? `
                <div class="vpn-flying-packet vpn-packet-tunnel">
                  <span class="vpn-pkt-badge vpn-pkt-dark">🔒 密文封包</span>
                </div>
                <div class="vpn-flying-packet vpn-packet-vpn-relay">
                  <span class="vpn-pkt-badge vpn-pkt-green">VPN 代表發送 ➔ 去動物園</span>
                </div>
              ` : `
                <div class="vpn-flying-packet vpn-packet-open">
                  <span class="vpn-pkt-badge vpn-pkt-plain">📨 去動物園</span>
                </div>
              `
            ) : ''}
          </div>
        </div>

        <div class="vpn-sent">
          <span class="vpn-chip${s.sentOff ? ' vpn-chip-on' : ''}">${s.sentOff ? '✓' : '○'} 關 VPN 送一次</span>
          <span class="vpn-chip${s.sentOn ? ' vpn-chip-on' : ''}">${s.sentOn ? '✓' : '○'} 開 VPN 送一次</span>
        </div>`;
      s.animating = false;
    }

    w.on((act) => {
      if (act === 'reset') {
        s.vpn = false;
        s.sentOff = false;
        s.sentOn = false;
        s.lastSent = null;
        s.animating = false;
        render();
        w.say('已重來。先按送出請求，再切換 VPN 開關比比看！');
        return;
      }
      if (act === 'toggle') {
        s.vpn = !s.vpn;
        s.animating = false;
        render();
        w.say(s.vpn ? '🛡️ VPN 地下隧道已開啟！按送出看封包怎麼走。' : 'VPN 關閉：回到一般露天連線。');
        return;
      }
      if (act !== 'send') return;
      if (s.vpn) {
        s.sentOn = true;
        s.lastSent = 'on';
      } else {
        s.sentOff = true;
        s.lastSent = 'off';
      }
      s.animating = true;
      render();
      if (s.sentOn && s.sentOff) {
        w.say('🎉 比出來了：開 VPN 多了一站，加密隧道保護內容，真實 IP 隱藏成功！', 'ok');
        w.finish();
      } else if (s.vpn) {
        w.say('🔒 封包穿過地下隧道，由 VPN 伺服器代打發送！關掉 VPN 送一次比比看。', 'ok');
      } else {
        w.say('📨 露天封包被偷看客看見了！打開 VPN 再試一次。', 'ok');
      }
    });

    render();
    w.say('先送一次，再打開 VPN 送一次，比比看。試試看！');
  },

  // Slide 2: toggle VPN and HTTPS separately; who sees the destination and the content.
  vpnLayers(host, params, api) {
    const w = setup(host, api, 'layers', 'vpn-l-status');
    const SITE = 'library.example.tw';
    const BODY = '搜尋「恐龍化石」';
    const s = { vpn: false, https: false, seen: new Set(), flash: false };
    const MSG = {
      '00': '沒有 VPN、沒有 HTTPS：咖啡店 Wi-Fi 看得到你去哪裡，也看得到內容。',
      '01': '只有 HTTPS：內容加密了，但咖啡店 Wi-Fi 還看得到你去哪個網站。',
      '10': '只有 VPN：咖啡店看不到目的地；可是出了隧道，內容沒加密，VPN 業者看得到。',
      '11': 'VPN 加 HTTPS：咖啡店只看到 VPN；VPN 業者看得到目的地，看不到內容。',
    };
    const see = (v) => `<span class="vpn-v vpn-see">👀 ${v}</span>`;
    const hide = (v) => `<span class="vpn-v vpn-hide">🔒 ${v}</span>`;
    const na = (v) => `<span class="vpn-v vpn-na">${v}</span>`;

    function views() {
      const content = s.https ? hide('加密內容，看不懂') : see(BODY);
      return [
        { id: 'wifi', name: '📶 咖啡店 Wi-Fi', dest: s.vpn ? hide('只看到：連到 VPN 伺服器') : see(SITE), body: s.vpn ? hide('隧道裡的加密資料') : content },
        { id: 'prov', name: '🛡️ VPN 業者', dest: s.vpn ? see(SITE) : na('不在這條路上'), body: s.vpn ? content : na('不在這條路上') },
        { id: 'site', name: `🌐 ${SITE}`, dest: see(`來自 ${s.vpn ? `VPN 伺服器 <code>${VPN_IP}</code>` : `咖啡店 <code>${CAFE_IP}</code>`}`), body: see(`${BODY}（網站本來就要讀）`) },
      ];
    }

    function render() {
      const key = `${s.vpn ? 1 : 0}${s.https ? 1 : 0}`;
      s.seen.add(key);
      w.body.innerHTML = `<div class="vpn-row">
          <button type="button" class="vpn-btn vpn-l-vpn" data-act="vpn" aria-pressed="${s.vpn}">🛡️ VPN：${s.vpn ? '開' : '關'}</button>
          <button type="button" class="vpn-btn vpn-l-https" data-act="https" aria-pressed="${s.https}">🔒 HTTPS：${s.https ? '開' : '關'}</button>
          <span class="vpn-tag vpn-l-count">已試 ${s.seen.size}/4 種組合</span>
        </div>
        <div class="vpn-obs">${views().map((o) => `<div class="vpn-card vpn-ob vpn-l-${o.id}${s.flash ? ' vpn-pop' : ''}">
            <div class="vpn-ob-h">${o.name}</div>
            <div class="vpn-line"><span class="vpn-k">去哪裡</span>${o.dest}</div>
            <div class="vpn-line"><span class="vpn-k">內容</span>${o.body}</div>
          </div>`).join('')}</div>
        <p class="vpn-note">此例假設網站流量完整走隧道，網站名稱在隧道外可見。真實情況還跟 DNS、App 和分流設定有關，也需要信任 VPN 業者。</p>`;
      s.flash = false;
      return key;
    }

    w.on((act) => {
      if (act === 'vpn') s.vpn = !s.vpn;
      else if (act === 'https') s.https = !s.https;
      else return;
      s.flash = true;
      const key = render();
      if (s.seen.size >= 4) {
        w.say(`🎉 4/4 種組合都試過了！${MSG[key]}`, 'ok');
        w.finish();
      } else {
        w.say(`${MSG[key]}（已試 ${s.seen.size}/4）`);
      }
    });

    const key = render();
    w.say(`${MSG[key]}兩個開關分開按，4 種組合都試試看！`);
  },

  // Slide 3: the site still sees the signed-in account; a VPN is no anonymity guarantee.
  vpnAccount(host, params, api) {
    const w = setup(host, api, 'account', 'vpn-a-status');
    const PAGES = { page1: '🦕 恐龍頁', page2: '🌋 火山頁' };
    const s = { vpn: false, login: false, rows: [], flash: false };

    function render() {
      const rows = s.rows.slice(-3).map((r, i, arr) => `<div class="vpn-logrow vpn-a-row${s.flash && i === arr.length - 1 ? ' vpn-pop' : ''}">
          <span>${r.login ? '👤 帳號：小安' : '👤 沒登入的訪客'}</span><span>· 來自 <code>${r.vpn ? VPN_IP : CAFE_IP}</code>${r.vpn ? '（VPN）' : ''}</span><span>· 看了${r.page}</span>
        </div>`).join('');
      w.body.innerHTML = `<div class="vpn-row">
          <button type="button" class="vpn-btn vpn-a-vpn" data-act="vpn" aria-pressed="${s.vpn}">🛡️ VPN：${s.vpn ? '開' : '關'}</button>
          <button type="button" class="vpn-btn vpn-a-login" data-act="login" aria-pressed="${s.login}">${s.login ? '🚪 登出' : '🔑 用示範帳號登入'}</button>
        </div>
        <div class="vpn-card vpn-browser">
          <div class="vpn-bar"><span>🔒 <code>library.example.tw</code></span><span class="vpn-tag">${s.login ? '👤 小安（示範帳號）' : '未登入'}</span></div>
          <div class="vpn-pages">
            <button type="button" class="vpn-btn vpn-a-page1" data-act="page" data-arg="page1">${PAGES.page1}</button>
            <button type="button" class="vpn-btn vpn-a-page2" data-act="page" data-arg="page2">${PAGES.page2}</button>
          </div>
        </div>
        <div class="vpn-card vpn-log"><div class="vpn-h">📒 網站的紀錄（網站看到的）</div>${rows || '<div class="vpn-empty">還沒有紀錄。點一個頁面看看。</div>'}</div>`;
      s.flash = false;
    }

    w.on((act, arg) => {
      if (act === 'vpn') {
        s.vpn = !s.vpn;
        render();
        w.say(s.vpn ? '🛡️ VPN 開了：網站會看到 VPN 伺服器的 IP。' : 'VPN 關了：網站會看到咖啡店的 IP。');
        return;
      }
      if (act === 'login') {
        s.login = !s.login;
        render();
        w.say(s.login ? '🔑 用示範帳號登入了（不是真的帳號）。' : '🚪 登出了。');
        return;
      }
      if (act !== 'page') return;
      const page = PAGES[arg];
      s.rows.push({ login: s.login, vpn: s.vpn, page });
      s.flash = true;
      render();
      if (s.login && s.vpn) {
        w.say('🎉 IP 換成 VPN 的了，網站還是記下「小安」的帳號。VPN 不會讓你變成匿名。', 'ok');
        w.finish();
      } else if (s.login) {
        w.say(`網站記下：小安看了${page}。打開 VPN 再看一次，比比看！`);
      } else if (s.vpn) {
        w.say('網站看到一位訪客，來自 VPN 的 IP。登入以後再看一次！');
      } else {
        w.say('網站看到一位訪客，來自咖啡店的 IP。登入、開 VPN，再看看！');
      }
    });

    render();
    w.say('開 VPN、登入，再點一個頁面，看網站記下什麼。試試看！');
  },

  // Slide 4: authorized school VPN reaches a school-only system from home.
  vpnSchool(host, params, api) {
    const w = setup(host, api, 'school', 'vpn-s-status');
    const s = { vpn: false, fail: false, ok: false, view: '' };
    const SCREENS = {
      '': ['', '（還沒打開網頁）'],
      blocked: [' vpn-scr-no', '⛔ 打不開：這個平台只讓學校網路裡的裝置連。'],
      intra: [' vpn-scr-ok vpn-pop', '📚 作業平台：今天有 3 項作業。'],
      public: [' vpn-scr-ok vpn-pop', '🌐 圖書館網站打開了。公開網站不需要學校 VPN。'],
    };

    function render() {
      const [cls, txt] = SCREENS[s.view];
      w.body.innerHTML = `<div class="vpn-map">
          <div class="vpn-card vpn-place"><span class="vpn-emo" aria-hidden="true">🏠</span><span>在家裡</span><span>💻 你的筆電</span></div>
          <div class="vpn-link${s.vpn ? ' vpn-tun' : ''}">${s.vpn ? '🔒 學校 VPN 隧道' : '一般網路'}</div>
          <div class="vpn-card vpn-place"><span class="vpn-emo" aria-hidden="true">🏫</span><span>學校網路</span><span>📚 作業平台 <code>intra.school.example.tw</code></span><span class="vpn-k">只給校內的裝置連</span></div>
        </div>
        <div class="vpn-row">
          <button type="button" class="vpn-btn vpn-s-vpn" data-act="vpn" aria-pressed="${s.vpn}">🏫 學校 VPN：${s.vpn ? '開' : '關'}</button>
          <button type="button" class="vpn-btn vpn-go vpn-s-intra" data-act="intra">📚 開作業平台</button>
          <button type="button" class="vpn-btn vpn-s-public" data-act="public">🌐 開 library.example.tw</button>
        </div>
        <div class="vpn-card vpn-screen vpn-s-screen${cls}">${txt}</div>
        <p class="vpn-note">只用學校或公司給你的 VPN 和帳號，並照他們的規定使用。</p>`;
    }

    w.on((act) => {
      if (act === 'vpn') {
        s.vpn = !s.vpn;
        s.view = '';
        render();
        w.say(s.vpn ? '🔒 連上學校 VPN：用的是老師發的示範帳號，經過學校允許。' : 'VPN 關了，筆電回到一般網路。');
        return;
      }
      if (act === 'public') {
        s.view = 'public';
        render();
        w.say('公開網站開不開 VPN 都打得開。試試作業平台！');
        return;
      }
      if (act !== 'intra') return;
      if (s.vpn) {
        s.ok = true;
        s.view = 'intra';
      } else {
        s.fail = true;
        s.view = 'blocked';
      }
      render();
      if (!s.vpn) w.shake('.vpn-s-screen');
      if (s.ok && s.fail) {
        w.say('🎉 比出來了：學校允許的 VPN，讓你在家也像在學校裡一樣，打開內部平台。', 'ok');
        w.finish();
      } else if (s.vpn) {
        w.say('✅ 打開了！關掉 VPN 再開一次，比比看。', 'ok');
      } else {
        w.say('⛔ 在家用一般網路打不開。打開學校 VPN 再試試！', 'bad');
      }
    });

    render();
    w.say('先在家直接開作業平台，再打開學校 VPN 試一次。試試看！');
  },

  // Slide 5: what a VPN helps with and what needs HTTPS, MFA, updates or backup.
  vpnLimits(host, params, api) {
    const w = setup(host, api, 'limits', 'vpn-k-status');
    const ITEMS = [
      { icon: '☕', txt: '在咖啡店 Wi-Fi，不想讓同一個網路的人看到你去哪個網站', yes: true, why: 'VPN 隧道讓咖啡店 Wi-Fi 只看到你連到 VPN。' },
      { icon: '🎣', txt: '假購物網站 shop.examp1e.tw 要你輸入密碼', yes: false, why: '要靠看清楚網址、用通行密鑰。假網站開了 VPN 還是假的。' },
      { icon: '🧩', txt: 'App 很久沒更新，裡面有漏洞', yes: false, why: '要靠更新。' },
      { icon: '🔐', txt: '密碼外洩了，有人想登入你的帳號', yes: false, why: '要靠兩步驟驗證和換密碼。' },
      { icon: '🏫', txt: '在家打開學校允許的內部作業平台', yes: true, why: '這正是學校 VPN 的用途。' },
      { icon: '💾', txt: '照片被勒索程式鎖住了', yes: false, why: '先隔離受影響裝置並求助，再用乾淨裝置和可用備份還原。' },
    ];
    const s = { i: 0, done: [], flash: false };

    function render() {
      const it = ITEMS[s.i];
      const card = it
        ? `<div class="vpn-card vpn-item${s.flash ? ' vpn-pop' : ''}"><span class="vpn-tag">${s.i + 1}/${ITEMS.length}</span><span class="vpn-emo" aria-hidden="true">${it.icon}</span><span>${it.txt}</span></div>`
        : `<div class="vpn-card vpn-item">✅ ${ITEMS.length} 件事都分好了</div>`;
      const done = s.done.map((d) => `<div class="vpn-res vpn-k-res${d.yes ? ' vpn-res-yes' : ''}">${d.icon} ${d.yes ? '🛡️ VPN 幫得上' : `🧰 ${d.why}`}</div>`).join('');
      w.body.innerHTML = `${card}
        <div class="vpn-choices">
          <button type="button" class="vpn-btn vpn-k-yes" data-act="pick" data-arg="yes">🛡️ VPN 幫得上</button>
          <button type="button" class="vpn-btn vpn-k-no" data-act="pick" data-arg="no">🧰 要靠別的方法</button>
        </div>
        <div class="vpn-done">${done}</div>`;
      s.flash = false;
    }

    w.on((act, arg) => {
      if (act !== 'pick') return;
      const it = ITEMS[s.i];
      if (!it) {
        w.say('🎉 都分好了。按 ↺ 重新玩，可以再分一次。', 'ok');
        return;
      }
      if ((arg === 'yes') !== it.yes) {
        w.say(it.yes
          ? '再想想：這件事跟「連線走哪條路、誰在路上看」有關。'
          : '再想想：VPN 只改變連線走的路，這件事要靠別的方法。', 'bad');
        w.shake('.vpn-item');
        return;
      }
      s.done.push(it);
      s.i += 1;
      s.flash = true;
      render();
      if (s.i >= ITEMS.length) {
        w.say('🎉 VPN 只是一層保護，不能取代 HTTPS、兩步驟驗證、更新和備份。', 'ok');
        w.finish();
      } else {
        w.say(`✅ ${it.why}`, 'ok');
      }
    });

    render();
    w.say('這件事 VPN 幫得上嗎？分分看！');
  },
};

export default {
  ready: true,
  unit: {
    id: 'vpn',
    part: 'adv',
    icon: '🚇',
    title: 'VPN 虛擬私人網路',
    en: 'Virtual Private Networks',
    desc: 'VPN 的加密隧道改變了路上誰看得到什麼；它和 HTTPS 不一樣，也不保證匿名。',
    color: '#6741d9',
    slides: [
      {
        id: 'route',
        title: 'VPN 走哪條路？',
        text: `開了${t('VPN 虛擬私人網路', 'Virtual Private Network')}，資料先包進${t('加密隧道', 'encrypted tunnel')}，直通${t('VPN 伺服器', 'VPN server')}，再去網站。送兩次比比看！`,
        widget: 'vpnRoute',
        params: {},
      },
      {
        id: 'layers',
        title: 'VPN 和 HTTPS 各管什麼？',
        text: '在這個完整隧道範例，VPN 把目的地藏在隧道裡，HTTPS 則把內容一路加密到網站。兩個開關分開按，看看誰看得到什麼！',
        widget: 'vpnLayers',
        params: {},
      },
      {
        id: 'account',
        title: '開了 VPN 就匿名嗎？',
        text: `網站看到的 IP 換成 VPN 的，可是你登入的帳號和看過的頁面，網站還是知道。VPN 不保證${t('匿名', 'anonymity')}。試試看！`,
        widget: 'vpnAccount',
        params: {},
      },
      {
        id: 'school',
        title: 'VPN 可以做什麼？',
        text: `學校或公司可以給你經過${t('授權', 'authorization')}的 VPN，在家也能打開只給校內用的系統。試試看！`,
        widget: 'vpnSchool',
        params: {},
      },
      {
        id: 'limits',
        title: 'VPN 不是萬能',
        text: 'VPN 只改變連線走的路。假網站、漏洞、密碼外洩和勒索程式，要靠看網址、更新、兩步驟驗證和備份。分分看！',
        widget: 'vpnLimits',
        params: {},
      },
      {
        id: 'quiz',
        title: '考考你',
        widget: 'choice',
        params: {
          question: '小安開了 VPN，再登入購物網站。下面哪一句正確？',
          options: [
            { text: '網站還是知道是小安的帳號在購物', correct: true },
            { text: '網站完全不知道是誰' },
            { text: '開了 VPN，假網站也會變安全' },
            { text: '有 VPN 就不需要兩步驟驗證' },
          ],
          explain: 'VPN 只換掉網站看到的 IP。登入的帳號網站一定知道；假網站、密碼外洩，還是要靠看網址和兩步驟驗證。',
        },
      },
    ],
  },
  placement: { after: 'firewall', stage: 'netprivacy' },
  prerequisites: ['web', 'firewall'],
  readme: 'Compare an ordinary route with a VPN tunnel, toggle VPN and HTTPS separately to see who can observe what in a simplified model, and learn what a VPN does not do.',
  changelog: '新單元「VPN 虛擬私人網路」：分開打開 VPN 和 HTTPS，看咖啡店 Wi-Fi、VPN 業者和網站各看得到什麼；了解 VPN 不等於匿名，也不能取代 HTTPS、兩步驟驗證、更新和備份。全部是模擬。',
  widgets,
  css,
  checks: {
    route: [
      { action: 'click', selector: '.vpn-r-send' },
      { action: 'click', selector: '.vpn-r-toggle' },
      { action: 'expectCount', selector: '.vpn-hop-vpn', count: 1 },
      { action: 'click', selector: '.vpn-r-send' },
      { action: 'expectCount', selector: '.vpn-chip-on', count: 2 },
      { action: 'expectText', selector: '.vpn-r-status', text: '多了一站' },
    ],
    layers: [
      { action: 'click', selector: '.vpn-l-https' },
      { action: 'click', selector: '.vpn-l-vpn' },
      { action: 'expectText', selector: '.vpn-l-wifi', text: '只看到' },
      { action: 'click', selector: '.vpn-l-https' },
      { action: 'expectText', selector: '.vpn-l-prov', text: '恐龍化石' },
      { action: 'expectText', selector: '.vpn-l-status', text: '4/4' },
    ],
    account: [
      { action: 'click', selector: '.vpn-a-vpn' },
      { action: 'click', selector: '.vpn-a-login' },
      { action: 'click', selector: '.vpn-a-page1' },
      { action: 'expectCount', selector: '.vpn-a-row', count: 1 },
      { action: 'expectText', selector: '.vpn-a-row', text: '小安' },
      { action: 'expectText', selector: '.vpn-a-status', text: '匿名' },
    ],
    school: [
      { action: 'click', selector: '.vpn-s-intra' },
      { action: 'expectText', selector: '.vpn-s-screen', text: '打不開' },
      { action: 'click', selector: '.vpn-s-vpn' },
      { action: 'click', selector: '.vpn-s-intra' },
      { action: 'expectText', selector: '.vpn-s-screen', text: '作業平台' },
      { action: 'expectText', selector: '.vpn-s-status', text: '像在學校裡' },
    ],
    limits: [
      { action: 'click', selector: '.vpn-k-yes' },
      { action: 'click', selector: '.vpn-k-no' },
      { action: 'click', selector: '.vpn-k-no' },
      { action: 'click', selector: '.vpn-k-no' },
      { action: 'click', selector: '.vpn-k-yes' },
      { action: 'click', selector: '.vpn-k-no' },
      { action: 'expectCount', selector: '.vpn-k-res', count: 6 },
      { action: 'expectText', selector: '.vpn-k-status', text: '不能取代' },
    ],
  },
};
