// apps/vibe-coder/js/widgets/devtools-widget.js
// 瀏覽器 DevTools 與 DOM 即時竄改視覺化沙盒

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const DevToolsWidget = {
    mount(container, props = {}) {
      this.container = container;

      container.innerHTML = `
        <div class="vibe-widget" role="region" aria-label="DevTools DOM 操作實戰沙盒">
          <div class="vibe-devtools-split">
            <!-- 左側：模擬網頁 Viewport -->
            <div class="vibe-mock-browser" id="mockWebBrowser">
              <div class="vibe-mock-urlbar">
                <span style="color: #7ee787;">🔒</span>
                <span class="vibe-mock-url">https://shop.vibe-coder.xyz/checkout</span>
                <span class="vibe-badge" style="font-size: 0.7rem;">用戶端 (Client DOM)</span>
              </div>
              <div class="vibe-mock-webcontent" id="mockWebContent">
                <div class="vibe-checkout-card" id="checkoutCard">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.8rem; color: #8b949e; text-transform: uppercase;">訂單結帳</span>
                    <span class="vibe-badge info">PRO 授權</span>
                  </div>
                  <h3 style="font-size: 1.05rem; margin-bottom: 0.25rem;">AI 獨立開發者年訂閱方案</h3>
                  <p style="font-size: 0.8rem; color: #8b949e; margin-bottom: 1rem;">含全套 22 實戰單元與雲端沙盒環境</p>

                  <div class="vibe-checkout-price-row">
                    <span style="font-size: 0.85rem; color: #8b949e;">結帳應付金額</span>
                    <div>
                      <span id="item-price" class="vibe-checkout-price">$120</span>
                      <span style="font-size: 0.75rem; color: #8b949e;"> USD</span>
                    </div>
                  </div>

                  <!-- 折扣碼表單 -->
                  <div style="margin-top: 0.75rem;">
                    <label for="coupon-code" style="display: block; font-size: 0.75rem; color: #8b949e; margin-bottom: 0.35rem;">優惠代碼 (Coupon Code)</label>
                    <div style="display: flex; gap: 0.4rem;">
                      <input type="text" id="coupon-code" class="vibe-api-url" placeholder="輸入折扣碼 (如 VIP80)" style="font-size: 0.8rem;" />
                      <button id="apply-btn" class="vibe-btn primary" style="white-space: nowrap;">套用優惠</button>
                    </div>
                    <div id="coupon-feedback" style="font-size: 0.75rem; min-height: 1.2rem; margin-top: 0.4rem; color: #8b949e;">尚未套用優惠</div>
                  </div>

                  <button id="checkout-btn" class="vibe-btn success" style="width: 100%; margin-top: 1rem; padding: 0.65rem; font-weight: 600;">
                    💳 模擬立即結帳
                  </button>
                </div>
              </div>
            </div>

            <!-- 右側：Chrome DevTools Console -->
            <div class="vibe-devtools-panel">
              <div class="vibe-devtools-tabs">
                <div class="vibe-devtools-tab">Elements</div>
                <div class="vibe-devtools-tab active">Console</div>
                <div class="vibe-devtools-tab">Sources</div>
                <div class="vibe-devtools-tab">Network</div>
                <div class="vibe-devtools-tab">Application</div>
              </div>

              <!-- 主控台快速指令列 -->
              <div class="vibe-console-snippets">
                <span class="vibe-chip-label">⚡ 點擊快速執行 DOM 腳本：</span>
                <button class="vibe-terminal-chip" data-eval="document.querySelector('#coupon-code').value = 'VIP80'">填入折扣碼</button>
                <button class="vibe-terminal-chip" data-eval="document.querySelector('#item-price').innerText = '$20'">前端竄改價格為 $20</button>
                <button class="vibe-terminal-chip" data-eval="document.querySelector('#apply-btn').click()">觸發套用按鈕 click()</button>
                <button class="vibe-terminal-chip" data-eval="console.log(window.location.href)">印出網址 href</button>
                <button class="vibe-terminal-chip danger" data-eval="document.querySelector('#checkoutCard').style.border = '2px dashed #f85149'">修改外框樣式</button>
              </div>

              <!-- 主控台輸出日誌 -->
              <div class="vibe-devtools-console-body" id="consoleBody">
                <div class="vibe-console-entry info">
                  <span class="return-icon">ℹ</span>
                  <span>[DevTools] 主控台已連線至左側模擬頁面環境。可直接輸入 JavaScript 操作 DOM。</span>
                </div>
              </div>

              <!-- 主控台輸入行 -->
              <div class="vibe-console-input-row">
                <span style="color: #58a6ff; font-weight: 700;">&gt;</span>
                <input type="text" class="vibe-console-input" id="consoleInput" placeholder="輸入 JS 程式碼 (例如 document.querySelector('#item-price').innerText = '$10')" />
                <button id="consoleRunBtn" class="vibe-btn primary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">執行</button>
              </div>
            </div>
          </div>

          <!-- 觀念重點提示卡 -->
          <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: rgba(56, 139, 253, 0.1); border-left: 3px solid #58a6ff; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>關鍵架構觀念：</strong>
            瀏覽器內的 HTML、CSS 與 JavaScript 全數在用戶端（Client）公開運作。任何用戶都能打開 DevTools 主控台修改 <code>#item-price</code>。
            因此，<strong>千萬不要依賴前端傳送的金額結帳</strong>，伺服器後端（Server）必須在收到請求時重新從資料庫查詢真實價格並驗證簽章！
          </div>
        </div>
      `;

      // 取得相關 DOM 節點
      this.mockWeb = container.querySelector("#mockWebContent");
      this.consoleBody = container.querySelector("#consoleBody");
      this.consoleInput = container.querySelector("#consoleInput");
      this.consoleRunBtn = container.querySelector("#consoleRunBtn");
      this.priceEl = container.querySelector("#item-price");
      this.couponInput = container.querySelector("#coupon-code");
      this.applyBtn = container.querySelector("#apply-btn");
      this.couponFeedback = container.querySelector("#coupon-feedback");
      this.checkoutBtn = container.querySelector("#checkout-btn");

      // 綁定左側模擬網頁自有的按鈕行為
      this.applyBtn.addEventListener("click", () => {
        const val = this.couponInput.value.trim();
        if (val === "VIP80") {
          this.priceEl.innerText = "$24";
          this.priceEl.classList.add("highlight");
          setTimeout(() => this.priceEl.classList.remove("highlight"), 1000);
          this.couponFeedback.innerHTML = `<span style="color: #7ee787;">✓ 優惠代碼 VIP80 生效 (享 2 折優惠，結帳金額 $24)</span>`;
          this.logToConsole(`優惠代碼驗證成功：VIP80 (減免 80%)`, "info");
        } else if (val) {
          this.couponFeedback.innerHTML = `<span style="color: #f85149;">✕ 代碼無效或已過期</span>`;
          this.logToConsole(`優惠代碼無效：${val}`, "error");
        } else {
          this.couponFeedback.innerHTML = `<span style="color: #d29922;">請輸入折扣碼</span>`;
        }
      });

      this.checkoutBtn.addEventListener("click", () => {
        const currentPrice = this.priceEl.innerText;
        alert(`【模擬結帳發送至伺服器】\n前端目前顯示價格: ${currentPrice}\n\n安全提示：後端 API 伺服器會立即檢查商品資料庫，若發現未套用合法促銷活動而價格被竄改，將直接駁回！`);
      });

      // 執行 Console 輸入
      const handleRun = () => {
        const code = this.consoleInput.value.trim();
        if (!code) return;
        this.runConsoleCode(code);
        this.consoleInput.value = "";
      };

      this.consoleRunBtn.addEventListener("click", handleRun);
      this.consoleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleRun();
      });

      // 點擊快速 Snippets
      this.onSnippetClick = (e) => {
        const chip = e.target.closest(".vibe-terminal-chip");
        if (!chip) return;
        const code = chip.getAttribute("data-eval");
        if (code) {
          this.runConsoleCode(code);
        }
      };
      container.querySelector(".vibe-console-snippets").addEventListener("click", this.onSnippetClick);
    },

    runConsoleCode(code) {
      // 記錄用戶輸入
      this.appendConsoleEntry(code, "input");

      try {
        // 為了將 DOM 查詢限制在左側模擬網頁內，我們建立安全代理環境
        const mockScope = this.mockWeb;
        const fakeDocument = {
          querySelector: (sel) => mockScope.querySelector(sel),
          querySelectorAll: (sel) => mockScope.querySelectorAll(sel),
          getElementById: (id) => mockScope.querySelector(`#${id}`),
          body: mockScope
        };

        const fakeConsole = {
          log: (...args) => {
            this.appendConsoleEntry(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "), "output");
          },
          warn: (...args) => {
            this.appendConsoleEntry(args.join(" "), "warning");
          },
          error: (...args) => {
            this.appendConsoleEntry(args.join(" "), "error");
          }
        };

        const fakeWindow = {
          location: {
            href: "https://shop.vibe-coder.xyz/checkout",
            hostname: "shop.vibe-coder.xyz",
            pathname: "/checkout"
          }
        };

        // 使用 Function 執行代碼並傳入自訂環境
        const fn = new Function("document", "console", "window", `
          return (${code});
        `);

        const result = fn(fakeDocument, fakeConsole, fakeWindow);

        // 如果結果不是 undefined 且不是已由 console.log 輸出的情形
        if (result !== undefined) {
          let displayResult = result;
          if (typeof result === "object" && result !== null) {
            displayResult = result.outerHTML || JSON.stringify(result);
          }
          this.appendConsoleEntry(`&lt; ${this.escapeHtml(String(displayResult))}`, "output");
        }

        // 若價格元素被修改，加上高亮提示動畫
        this.priceEl.classList.add("highlight");
        setTimeout(() => this.priceEl.classList.remove("highlight"), 800);

      } catch (err) {
        this.appendConsoleEntry(`Uncaught ${err.name}: ${err.message}`, "error");
      }

      this.consoleBody.scrollTop = this.consoleBody.scrollHeight;
    },

    appendConsoleEntry(text, type = "output") {
      const entry = document.createElement("div");
      entry.className = `vibe-console-entry ${type}`;
      if (type === "input") {
        entry.innerHTML = `<span class="prompt-icon">&gt;</span> <span>${this.escapeHtml(text)}</span>`;
      } else if (type === "error") {
        entry.innerHTML = `<span style="color: #f85149;">❌</span> <span style="color: #f85149;">${this.escapeHtml(text)}</span>`;
      } else if (type === "warning") {
        entry.innerHTML = `<span style="color: #d29922;">⚠️</span> <span style="color: #d29922;">${this.escapeHtml(text)}</span>`;
      } else {
        entry.innerHTML = `<span class="return-icon">&lt;</span> <span>${text}</span>`;
      }
      this.consoleBody.appendChild(entry);
    },

    logToConsole(msg, type = "info") {
      this.appendConsoleEntry(msg, type);
    },

    escapeHtml(str) {
      return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["devtools-widget"] = DevToolsWidget;
  window.VIBE_WIDGETS["devtools"] = DevToolsWidget;
})();
