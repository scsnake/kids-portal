// apps/vibe-coder/js/widgets/ports-widget.js
// 本地通訊埠 (Localhost Ports) 衝突排解與殭屍行程清理實戰模擬

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const PortsWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.step = 0; // 0: 衝突發生, 1: 已執行 lsof, 2: 已執行 kill -9, 3: 伺服器啟動成功

      container.innerHTML = `
        <div class="vibe-widget vibe-ports-container" role="region" aria-label="通訊埠衝突排解模擬器">
          <!-- 頂部通訊埠狀態即時儀表板 -->
          <div class="vibe-port-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="font-size: 1rem; margin-bottom: 0.2rem;">本機網路通訊埠監控器 (Localhost Port Monitor)</h3>
                <p style="font-size: 0.8rem; color: #8b949e;">目標目標位址：<code>127.0.0.1:3000</code> (常見開發預設埠)</p>
              </div>
              <button id="portsResetBtn" class="vibe-btn" style="font-size: 0.75rem;">🔄 重現衝突場景</button>
            </div>

            <!-- 通訊埠狀態標籤 -->
            <div id="portStatusBanner" class="vibe-port-status-banner">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span id="portPulseDot" class="vibe-pulse-dot"></span>
                <div>
                  <div id="portStatusTitle" style="font-weight: 700; font-size: 0.95rem; color: #f85149;">
                    ⛔ 錯誤：通訊埠 3000 已被佔用 (Port In Use)
                  </div>
                  <div id="portStatusDesc" style="font-size: 0.8rem; color: #8b949e; font-family: var(--font-mono);">
                    Error: listen EADDRINUSE: address already in use :::3000
                  </div>
                </div>
              </div>
              <span id="portBadge" class="vibe-badge danger">EADDRINUSE</span>
            </div>

            <!-- 診斷排解引導按鈕群 -->
            <div>
              <div style="font-size: 0.82rem; font-weight: 600; margin-bottom: 0.5rem; color: #c9d1d9;">
                🛠️ 排查三部曲（請依序點擊操作）：
              </div>
              <div class="vibe-step-actions">
                <button id="btnLsof" class="vibe-btn primary">
                  <span>1. 執行 <code>lsof -i :3000</code></span>
                  <span style="font-size: 0.7rem; opacity: 0.8;">(查詢誰在佔用)</span>
                </button>
                <button id="btnKill" class="vibe-btn danger" disabled>
                  <span>2. 執行 <code>kill -9 4821</code></span>
                  <span style="font-size: 0.7rem; opacity: 0.8;">(強制終止殭屍行程)</span>
                </button>
                <button id="btnStart" class="vibe-btn success" disabled>
                  <span>3. 啟動新伺服器 (<code>npm start</code>)</span>
                  <span style="font-size: 0.7rem; opacity: 0.8;">(重新監聽 3000)</span>
                </button>
              </div>
            </div>

            <!-- 模擬終端機日誌 -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-size: 0.75rem; color: #8b949e;">系統診斷終端輸出 (Terminal Output)</span>
                <span style="font-size: 0.75rem; color: #58a6ff; font-family: var(--font-mono);">PID: 4821 (node)</span>
              </div>
              <div class="vibe-port-terminal" id="portsLog">
                <div style="color: #f85149;">[啟動失敗] node app.js 拋出致命例外：</div>
                <div style="color: #f85149;">Error: listen EADDRINUSE: address already in use :::3000</div>
                <div style="color: #8b949e; margin-top: 0.25rem;">
                  ↳ 原因說明：先前某個背景 Node 行程沒有正常關閉（可能按了 Ctrl+Z 而不是 Ctrl+C），依然佔用著 3000 埠。
                </div>
              </div>
            </div>
          </div>

          <!-- 說明小卡 -->
          <div style="padding: 0.85rem 1rem; background: #161b22; border-left: 3px solid #2ea043; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>工程師必備觀念：</strong>
            每個本機通訊埠（Port）同一時間只能由一個行程（Process）監聽。遇上 <code>EADDRINUSE</code> 時，
            透過 <code>lsof -i :&lt;port&gt;</code> 查出 PID（Process ID），再用 <code>kill -9 &lt;PID&gt;</code> 送出 SIGKILL 訊號，即可乾淨釋放通訊埠。
          </div>
        </div>
      `;

      // 取得元素
      this.banner = container.querySelector("#portStatusBanner");
      this.pulseDot = container.querySelector("#portPulseDot");
      this.statusTitle = container.querySelector("#portStatusTitle");
      this.statusDesc = container.querySelector("#portStatusDesc");
      this.badge = container.querySelector("#portBadge");
      this.btnLsof = container.querySelector("#btnLsof");
      this.btnKill = container.querySelector("#btnKill");
      this.btnStart = container.querySelector("#btnStart");
      this.portsLog = container.querySelector("#portsLog");
      this.resetBtn = container.querySelector("#portsResetBtn");

      // 步驟 1: lsof
      this.btnLsof.addEventListener("click", () => {
        this.step = 1;
        this.btnLsof.disabled = true;
        this.btnKill.disabled = false;

        this.appendLog(`\n$ lsof -i :3000`, "#58a6ff");
        this.appendLog(`COMMAND   PID      USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME`, "#8b949e");
        this.appendLog(`node     4821   scsnake   23u  IPv6 0x8a92b31a      0t0  TCP *:3000 (LISTEN)`, "#7ee787");
        this.appendLog(`[分析] 抓到了！行程 PID 4821 (node) 正鎖死 TCP 通訊埠 3000。請點擊第 2 步終止它。`, "#d29922");
      });

      // 步驟 2: kill -9
      this.btnKill.addEventListener("click", () => {
        this.step = 2;
        this.btnKill.disabled = true;
        this.btnStart.disabled = false;

        this.appendLog(`\n$ kill -9 4821`, "#f85149");
        this.appendLog(`[系統核心] 發送 SIGKILL (強制關閉訊號) 至行程 4821...`, "#c9d1d9");
        this.appendLog(`[成功] 行程 PID 4821 已被終止。通訊埠 3000 已完全釋放！`, "#7ee787");

        // 更新橫幅為已釋放 (Free)
        this.banner.className = "vibe-port-status-banner free";
        this.pulseDot.className = "vibe-pulse-dot blue";
        this.statusTitle.style.color = "#58a6ff";
        this.statusTitle.textContent = "🔵 閒置中：通訊埠 3000 已釋放，目前無行程監聽";
        this.statusDesc.textContent = "Status: Port is available for binding";
        this.badge.className = "vibe-badge info";
        this.badge.textContent = "PORT FREE";
      });

      // 步驟 3: npm start
      this.btnStart.addEventListener("click", () => {
        this.step = 3;
        this.btnStart.disabled = true;

        this.appendLog(`\n$ npm start`, "#58a6ff");
        this.appendLog(`> vibe-app@1.0.0 start`, "#8b949e");
        this.appendLog(`> node app.js`, "#8b949e");
        this.appendLog(`[Ready] 🚀 HTTP 伺服器成功綁定於 http://localhost:3000`, "#7ee787");
        this.appendLog(`[Health] GET / 200 OK (回應時間: 4ms) 伺服器運作一切正常！`, "#7ee787");

        // 更新橫幅為運行中 (Running)
        this.banner.className = "vibe-port-status-banner running";
        this.pulseDot.className = "vibe-pulse-dot green";
        this.statusTitle.style.color = "#2ea043";
        this.statusTitle.textContent = "🟢 運行中：伺服器正常監聽 3000 (200 OK)";
        this.statusDesc.textContent = "PID: 5932 (node) — 網路連線就緒，隨時可接受 HTTP 請求";
        this.badge.className = "vibe-badge success";
        this.badge.textContent = "200 OK";
      });

      // 重設按鈕
      this.resetBtn.addEventListener("click", () => {
        this.mount(container, props);
      });
    },

    appendLog(text, color = "#c9d1d9") {
      const line = document.createElement("div");
      line.style.color = color;
      line.style.marginTop = "0.2rem";
      line.style.whiteSpace = "pre-wrap";
      line.textContent = text;
      this.portsLog.appendChild(line);
      this.portsLog.scrollTop = this.portsLog.scrollHeight;
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["ports-widget"] = PortsWidget;
  window.VIBE_WIDGETS["ports"] = PortsWidget;
})();
