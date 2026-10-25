// apps/vibe-coder/js/widgets/playwright-widget.js
// Playwright 端對端 (E2E) 自動化測試即時視覺化模擬器

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const TEST_STEPS = [
    {
      line: 1,
      code: "await page.goto('https://app.local/login');",
      action: "goto",
      url: "https://app.local/login",
      desc: "開啟登入頁面並等待 DOM 載入完成"
    },
    {
      line: 2,
      code: "await page.fill('#email', 'dev@vibe-coder.tw');",
      action: "fillEmail",
      targetSel: "#pwEmailInput",
      text: "dev@vibe-coder.tw",
      desc: "尋找 #email 欄位並自動鍵入使用者帳號"
    },
    {
      line: 3,
      code: "await page.fill('#password', '••••••••');",
      action: "fillPass",
      targetSel: "#pwPassInput",
      text: "securePass123",
      desc: "鍵入密碼欄位"
    },
    {
      line: 4,
      code: "await page.click('#submit-btn');",
      action: "clickSubmit",
      targetSel: "#pwSubmitBtn",
      desc: "點擊登入提交按鈕，等待 API 回應與頁面跳轉"
    },
    {
      line: 5,
      code: "await expect(page.locator('.dashboard')).toBeVisible();",
      action: "assertDashboard",
      targetSel: "#pwDashboardView",
      desc: "斷言檢驗：確認儀表板畫面已正確呈現 (測試通過！)"
    }
  ];

  const PlaywrightWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.currentLine = 0; // 0 表示尚未開始
      this.isPlaying = false;
      this.timer = null;
      this.speed = 1000; // ms per step

      container.innerHTML = `
        <div class="vibe-widget" role="region" aria-label="Playwright 自動化測試視覺化沙盒">
          <!-- 頂部操作控制列 -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="vibe-badge info">PLAYWRIGHT E2E</span>
              <span style="font-size: 0.85rem; font-weight: 600;">現代無頭瀏覽器自動化演練</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button id="pwRunBtn" class="vibe-btn primary" style="font-size: 0.75rem;">▶ 執行完整測試 (Run Test)</button>
              <button id="pwStepBtn" class="vibe-btn" style="font-size: 0.75rem;">逐行單步 (Step)</button>
              <button id="pwResetBtn" class="vibe-btn" style="font-size: 0.75rem;">重設 (Reset)</button>
            </div>
          </div>

          <div class="vibe-pw-split">
            <!-- 左側：Playwright 測試腳本程式碼 -->
            <div class="vibe-pw-code-panel" id="pwCodePanel">
              <div style="color: #8b949e; margin-bottom: 0.5rem; font-size: 0.75rem; border-bottom: 1px solid #21262d; padding-bottom: 0.4rem;">
                📄 tests/auth.spec.ts — Playwright Test Suite
              </div>
              <div style="color: #ff7b72;">import <span style="color: #f0f6fc;">{ test, expect }</span> from <span style="color: #a5d6ff;">'@playwright/test'</span>;</div>
              <div style="color: #d2a8ff; margin-bottom: 0.4rem;">test(<span style="color: #a5d6ff;">'使用者應能成功登入並進入主儀表板'</span>, async ({ page }) =&gt; {</div>
              
              <!-- 逐行執行標記 -->
              <div id="pwLine1" class="vibe-pw-line"><span class="line-no">1</span><span>&nbsp;&nbsp;await page.goto('https://app.local/login');</span></div>
              <div id="pwLine2" class="vibe-pw-line"><span class="line-no">2</span><span>&nbsp;&nbsp;await page.fill('#email', 'dev@vibe-coder.tw');</span></div>
              <div id="pwLine3" class="vibe-pw-line"><span class="line-no">3</span><span>&nbsp;&nbsp;await page.fill('#password', '••••••••');</span></div>
              <div id="pwLine4" class="vibe-pw-line"><span class="line-no">4</span><span>&nbsp;&nbsp;await page.click('#submit-btn');</span></div>
              <div id="pwLine5" class="vibe-pw-line"><span class="line-no">5</span><span>&nbsp;&nbsp;await expect(page.locator('.dashboard')).toBeVisible();</span></div>
              
              <div style="color: #d2a8ff; margin-top: 0.4rem;">});</div>

              <!-- 測試執行狀態摘要 -->
              <div id="pwTestSummary" style="margin-top: 1rem; padding: 0.5rem 0.75rem; background: #161b22; border-radius: 4px; font-size: 0.75rem; color: #8b949e;">
                等待執行測試...
              </div>
            </div>

            <!-- 右側：模擬瀏覽器視窗 (Headless Browser Viewport) -->
            <div class="vibe-pw-browser-viewport" id="pwViewport">
              <!-- 瀏覽器網址列 -->
              <div class="vibe-mock-urlbar">
                <span style="color: #7ee787;">🔒</span>
                <span id="pwAddressBar" class="vibe-mock-url">about:blank</span>
                <span class="vibe-badge" style="font-size: 0.7rem;">Headless Chromium</span>
              </div>

              <!-- 虛擬滑鼠游標 (Virtual Mouse Cursor) -->
              <div id="pwCursor" class="vibe-virtual-cursor" style="top: 20px; left: 20px; display: none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.85a.5.5 0 0 0-.35.36z" fill="#f0f6fc" stroke="#0d1117" stroke-width="1.5"/>
                </svg>
              </div>

              <!-- 視窗內部頁面 -->
              <div id="pwBrowserDom" style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: center; background: #0d1117;">
                <!-- 初始為空白 -->
                <div id="pwEmptyPrompt" style="text-align: center; color: #8b949e; font-size: 0.85rem;">
                  🌐 瀏覽器待命中，請點擊「執行測試」
                </div>

                <!-- 模擬登入表單容器 (Line 1 時載入) -->
                <div id="pwLoginFormView" style="display: none; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.25rem;">
                  <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: #f0f6fc;">會員登入入口</h4>
                  
                  <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.75rem; color: #8b949e; margin-bottom: 0.25rem;">電子郵件 (#email)</label>
                    <input type="text" id="pwEmailInput" class="vibe-api-url" readonly style="width: 100%; font-size: 0.82rem;" placeholder="name@domain.com" />
                  </div>

                  <div style="margin-bottom: 0.75rem;">
                    <label style="display: block; font-size: 0.75rem; color: #8b949e; margin-bottom: 0.25rem;">密碼 (#password)</label>
                    <input type="password" id="pwPassInput" class="vibe-api-url" readonly style="width: 100%; font-size: 0.82rem;" placeholder="••••••••" />
                  </div>

                  <button id="pwSubmitBtn" class="vibe-btn primary" style="width: 100%; font-weight: 600;">
                    立即登入
                  </button>
                </div>

                <!-- 模擬登入後儀表板 (Line 4-5 時載入) -->
                <div id="pwDashboardView" class="dashboard" style="display: none; background: #161b22; border: 2px solid transparent; border-radius: 8px; padding: 1.25rem; transition: border-color 0.3s ease;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.85rem; font-weight: 700; color: #7ee787;">🎉 歡迎登入，開發者！</span>
                    <span class="vibe-badge success">SESSION ACTIVE</span>
                  </div>
                  <div style="font-size: 0.8rem; color: #8b949e;">儀表板容器 <code>.dashboard</code> 已就緒</div>
                  <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <div style="flex: 1; background: #090d13; padding: 0.5rem; border-radius: 4px; text-align: center; font-size: 0.75rem;">
                      專案數: <strong style="color: #58a6ff;">5</strong>
                    </div>
                    <div style="flex: 1; background: #090d13; padding: 0.5rem; border-radius: 4px; text-align: center; font-size: 0.75rem;">
                      API 額度: <strong style="color: #7ee787;">99%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 說明小卡 -->
          <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: #161b22; border-left: 3px solid #7ee787; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>AI 寫程式時的終極防護網：Playwright</strong><br>
            當你使用 AI 生成前端或後端功能時，人工反覆手動點擊瀏覽器費時又容易遺漏。
            透過 Playwright 編寫 5 行自動化腳本，每次修改程式碼後即可自動開啟無頭瀏覽器跑完「輸入、點擊、驗證」，3 秒內確保產品絕不 Regression（功能退化）！
          </div>
        </div>
      `;

      // 取得元素
      this.runBtn = container.querySelector("#pwRunBtn");
      this.stepBtn = container.querySelector("#pwStepBtn");
      this.resetBtn = container.querySelector("#pwResetBtn");
      this.addressBar = container.querySelector("#pwAddressBar");
      this.cursor = container.querySelector("#pwCursor");
      this.emptyPrompt = container.querySelector("#pwEmptyPrompt");
      this.loginView = container.querySelector("#pwLoginFormView");
      this.dashView = container.querySelector("#pwDashboardView");
      this.emailInput = container.querySelector("#pwEmailInput");
      this.passInput = container.querySelector("#pwPassInput");
      this.submitBtn = container.querySelector("#pwSubmitBtn");
      this.summaryEl = container.querySelector("#pwTestSummary");

      this.runBtn.addEventListener("click", () => this.startPlay());
      this.stepBtn.addEventListener("click", () => this.stepNext());
      this.resetBtn.addEventListener("click", () => this.resetTest());
    },

    startPlay() {
      if (this.isPlaying) return;
      this.isPlaying = true;
      this.runBtn.disabled = true;

      const runLoop = () => {
        if (this.currentLine < TEST_STEPS.length) {
          this.stepNext();
          this.timer = setTimeout(runLoop, 900);
        } else {
          this.isPlaying = false;
          this.runBtn.disabled = false;
        }
      };
      runLoop();
    },

    stepNext() {
      if (this.currentLine >= TEST_STEPS.length) {
        return;
      }
      this.currentLine++;
      this.applyStep(this.currentLine);
    },

    applyStep(stepNum) {
      // 標記程式碼行高亮
      for (let i = 1; i <= TEST_STEPS.length; i++) {
        const lineEl = this.container.querySelector(`#pwLine${i}`);
        if (i === stepNum) {
          lineEl.className = "vibe-pw-line active";
        } else if (i < stepNum) {
          lineEl.className = "vibe-pw-line passed";
        } else {
          lineEl.className = "vibe-pw-line";
        }
      }

      this.cursor.style.display = "block";
      const step = TEST_STEPS[stepNum - 1];

      if (step.action === "goto") {
        this.addressBar.textContent = step.url;
        this.emptyPrompt.style.display = "none";
        this.loginView.style.display = "block";
        this.dashView.style.display = "none";
        this.cursor.style.top = "50px";
        this.cursor.style.left = "40px";
        this.summaryEl.innerHTML = `<span style="color: #58a6ff;">Line 1 執行中：</span> 載入登入頁面完成 (HTTP 200)`;
      } else if (step.action === "fillEmail") {
        const rect = this.emailInput.getBoundingClientRect();
        const parentRect = this.container.querySelector("#pwViewport").getBoundingClientRect();
        this.cursor.style.top = `${rect.top - parentRect.top + 15}px`;
        this.cursor.style.left = `${rect.left - parentRect.left + 50}px`;

        this.emailInput.value = step.text;
        this.emailInput.style.borderColor = "#58a6ff";
        this.summaryEl.innerHTML = `<span style="color: #58a6ff;">Line 2 執行中：</span> 鍵入帳號 <code>${step.text}</code>`;
      } else if (step.action === "fillPass") {
        const rect = this.passInput.getBoundingClientRect();
        const parentRect = this.container.querySelector("#pwViewport").getBoundingClientRect();
        this.cursor.style.top = `${rect.top - parentRect.top + 15}px`;
        this.cursor.style.left = `${rect.left - parentRect.left + 50}px`;

        this.passInput.value = step.text;
        this.passInput.style.borderColor = "#58a6ff";
        this.summaryEl.innerHTML = `<span style="color: #58a6ff;">Line 3 執行中：</span> 鍵入密碼憑證完成`;
      } else if (step.action === "clickSubmit") {
        const rect = this.submitBtn.getBoundingClientRect();
        const parentRect = this.container.querySelector("#pwViewport").getBoundingClientRect();
        this.cursor.style.top = `${rect.top - parentRect.top + 15}px`;
        this.cursor.style.left = `${rect.left - parentRect.left + 60}px`;

        this.submitBtn.style.transform = "scale(0.96)";
        setTimeout(() => (this.submitBtn.style.transform = "scale(1)"), 150);

        this.summaryEl.innerHTML = `<span style="color: #58a6ff;">Line 4 執行中：</span> 觸發點擊，正在處理登入驗證...`;

        setTimeout(() => {
          this.addressBar.textContent = "https://app.local/dashboard";
          this.loginView.style.display = "none";
          this.dashView.style.display = "block";
        }, 300);
      } else if (step.action === "assertDashboard") {
        this.dashView.style.borderColor = "#2ea043";
        this.dashView.style.boxShadow = "0 0 16px rgba(46, 160, 67, 0.3)";
        this.cursor.style.top = "160px";
        this.cursor.style.left = "180px";

        this.summaryEl.innerHTML = `
          <div style="color: #7ee787; font-weight: bold; font-size: 0.8rem;">
            ✓ 1 passed (1.2s) — 所有斷言全數通過！
          </div>
          <div style="color: #8b949e; margin-top: 0.2rem;">
            expect(page.locator('.dashboard')).toBeVisible() [OK]
          </div>
        `;
      }
    },

    resetTest() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.isPlaying = false;
      this.currentLine = 0;
      this.runBtn.disabled = false;

      for (let i = 1; i <= TEST_STEPS.length; i++) {
        const lineEl = this.container.querySelector(`#pwLine${i}`);
        if (lineEl) lineEl.className = "vibe-pw-line";
      }

      this.addressBar.textContent = "about:blank";
      this.cursor.style.display = "none";
      this.emptyPrompt.style.display = "block";
      this.loginView.style.display = "none";
      this.dashView.style.display = "none";
      this.emailInput.value = "";
      this.passInput.value = "";
      this.summaryEl.textContent = "等待執行測試...";
    },

    unmount(container) {
      if (this.timer) clearTimeout(this.timer);
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["playwright-widget"] = PlaywrightWidget;
  window.VIBE_WIDGETS["playwright"] = PlaywrightWidget;
})();
