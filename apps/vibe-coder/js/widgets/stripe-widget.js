// apps/vibe-coder/js/widgets/stripe-widget.js
// 國際金流 (Stripe) vs MoR (Lemon Squeezy/Paddle) 試算與 Webhook 簽名驗證沙盒

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const StripeWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.activeTab = "calc"; // 'calc' | 'webhook'

      container.innerHTML = `
        <div class="vibe-widget vibe-stripe-container" role="region" aria-label="國際金流與 Webhook 簽名沙盒">
          <!-- 分頁切換 -->
          <div class="vibe-stripe-tabs">
            <button id="tabCalcBtn" class="vibe-stripe-tab-btn active">
              📊 模組一：傳統金流 (Stripe) vs 商戶代理 (MoR) 全球稅務試算
            </button>
            <button id="tabWebhookBtn" class="vibe-stripe-tab-btn">
              🔐 模組二：Stripe Webhook 簽名驗證 (防偽造付款阻截器)
            </button>
          </div>

          <!-- 分頁一：稅務與淨額試算器 -->
          <div id="sectionCalc" style="display: block;">
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
                <div>
                  <label for="productPrice" style="display: block; font-size: 0.8rem; color: #8b949e; margin-bottom: 0.35rem;">
                    軟體單價 (USD)
                  </label>
                  <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <span style="color: #58a6ff; font-weight: bold;">$</span>
                    <input type="number" id="productPrice" class="vibe-api-url" value="50" min="1" max="10000" style="font-size: 0.9rem;" />
                  </div>
                </div>

                <div>
                  <label for="monthlySales" style="display: block; font-size: 0.8rem; color: #8b949e; margin-bottom: 0.35rem;">
                    每月預估銷售量 (件)
                  </label>
                  <input type="number" id="monthlySales" class="vibe-api-url" value="100" min="1" max="100000" style="font-size: 0.9rem;" />
                </div>

                <div>
                  <label style="display: block; font-size: 0.8rem; color: #8b949e; margin-bottom: 0.35rem;">
                    買家地區分布比重
                  </label>
                  <div style="font-size: 0.75rem; color: #c9d1d9;">
                    歐盟 35% | 美國 45% | 台灣 20%
                  </div>
                </div>
              </div>
            </div>

            <!-- 雙架構並列對比卡 -->
            <div class="vibe-calc-cards">
              <!-- 模式 A: 傳統金流 (Stripe) -->
              <div class="vibe-calc-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="vibe-badge">傳統支付閘道 (Payment Gateway)</span>
                  <span style="font-size: 0.75rem; color: #8b949e;">例如：Stripe</span>
                </div>
                <h4 style="font-size: 1rem; color: #f0f6fc; margin: 0.2rem 0;">Stripe 直連收款</h4>
                
                <div style="background: #090d13; border-radius: 4px; padding: 0.75rem; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>交易手續費率:</span>
                    <span style="color: #58a6ff;">2.9% + $0.30</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>每月扣除手續費:</span>
                    <span id="stripeFees" style="color: #f85149;">-$175</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-weight: 700; border-top: 1px solid #21262d; margin-top: 0.4rem; padding-top: 0.4rem;">
                    <span>名義入帳金額:</span>
                    <span id="stripeNominal" style="color: #7ee787;">$4,825</span>
                  </div>
                </div>

                <!-- 稅務合規負擔剖析 -->
                <div style="background: rgba(248, 81, 73, 0.08); border: 1px solid rgba(248, 81, 73, 0.25); border-radius: 4px; padding: 0.75rem; font-size: 0.78rem;">
                  <div style="font-weight: 700; color: #f85149; margin-bottom: 0.3rem;">
                    ⚠️ 開發者必須承擔的隱形稅務合規責任：
                  </div>
                  <ul style="margin: 0; padding-left: 1.1rem; line-height: 1.5; color: #c9d1d9;">
                    <li><strong>歐盟 VAT (加值稅)：</strong> 必須自行向歐盟 One-Stop Shop (OSS) 登記並逐季申報 27 國增值稅。</li>
                    <li><strong>美國各州 Sales Tax：</strong> 需自行計算超過門檻後的經濟紐帶 (Economic Nexus) 申報。</li>
                    <li><strong>隱形成本：</strong> 會計師與全球稅務申報軟體年費約 <strong>$1,500 ~ $4,000 USD</strong>。</li>
                  </ul>
                </div>
              </div>

              <!-- 模式 B: 商戶代理 (MoR) -->
              <div class="vibe-calc-card highlight">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="vibe-badge success">商戶代理 (Merchant of Record)</span>
                  <span style="font-size: 0.75rem; color: #7ee787;">例如：Paddle / Lemon Squeezy</span>
                </div>
                <h4 style="font-size: 1rem; color: #7ee787; margin: 0.2rem 0;">MoR 全代管模式</h4>
                
                <div style="background: #090d13; border-radius: 4px; padding: 0.75rem; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>交易手續費率:</span>
                    <span style="color: #58a6ff;">5.0% + $0.50</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>每月扣除手續費:</span>
                    <span id="morFees" style="color: #f85149;">-$300</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-weight: 700; border-top: 1px solid #21262d; margin-top: 0.4rem; padding-top: 0.4rem;">
                    <span>每月淨利撥款:</span>
                    <span id="morPayout" style="color: #7ee787;">$4,700</span>
                  </div>
                </div>

                <!-- 稅務合規完全解脫 -->
                <div style="background: rgba(46, 160, 67, 0.08); border: 1px solid rgba(46, 160, 67, 0.25); border-radius: 4px; padding: 0.75rem; font-size: 0.78rem;">
                  <div style="font-weight: 700; color: #7ee787; margin-bottom: 0.3rem;">
                    ✓ 獨立開發者的救星：零全球稅務負擔
                  </div>
                  <ul style="margin: 0; padding-left: 1.1rem; line-height: 1.5; color: #c9d1d9;">
                    <li><strong>法定經銷商責任：</strong> MoR 作為名義上的銷售方，由他們直接向全球 100+ 國政府代收代繳所有消費稅。</li>
                    <li><strong>完全省下會計開銷：</strong> 你只跟 MoR 發生單一 B2B 拆帳關係，省下每年數千美元的跨國稅務申報費用。</li>
                    <li><strong>一人公司首選：</strong> 讓你專注在產品與程式本身，無需研讀各國繁雜稅法！</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 分頁二：Webhook 簽名驗證模擬器 -->
          <div id="sectionWebhook" style="display: none;">
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: var(--radius-md); padding: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <h4 style="font-size: 0.95rem; margin-bottom: 0.2rem;">Stripe Webhook 數位簽章驗證防護</h4>
                  <p style="font-size: 0.78rem; color: #8b949e;">模擬當用戶付款成功時，伺服器如何防止駭客偽造假 Webhook 冒充付款</p>
                </div>
                <div style="display: flex; gap: 0.4rem;">
                  <button id="btnValidWebhook" class="vibe-btn success" style="font-size: 0.75rem;">
                    ✅ 模擬合法簽名 (Valid Webhook)
                  </button>
                  <button id="btnTamperedWebhook" class="vibe-btn danger" style="font-size: 0.75rem;">
                    🚨 模擬駭客偽造請求 (Tampered Body)
                  </button>
                </div>
              </div>

              <!-- 標頭與密鑰 -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div style="background: #090d13; border: 1px solid #21262d; border-radius: 4px; padding: 0.6rem 0.8rem; font-family: var(--font-mono); font-size: 0.75rem;">
                  <div style="color: #8b949e;">伺服器環境變數密鑰 (STRIPE_WEBHOOK_SECRET):</div>
                  <div style="color: #58a6ff; margin-top: 0.2rem;">whsec_98fbc127a9094e...</div>
                </div>
                <div style="background: #090d13; border: 1px solid #21262d; border-radius: 4px; padding: 0.6rem 0.8rem; font-family: var(--font-mono); font-size: 0.75rem;">
                  <div style="color: #8b949e;">HTTP Request Header:</div>
                  <div id="webhookHeaderVal" style="color: #7ee787; margin-top: 0.2rem; word-break: break-all;">
                    stripe-signature: t=1730012400,v1=9e81a3cf8...
                  </div>
                </div>
              </div>

              <!-- 終端日誌驗證流程 -->
              <div id="webhookTerminal" style="background: #090d13; border: 1px solid #30363d; border-radius: 4px; padding: 0.85rem; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.5; color: #c9d1d9; min-height: 140px;">
                <!-- 驗證日誌 -->
              </div>
            </div>
          </div>
        </div>
      `;

      // 取得元素
      this.tabCalcBtn = container.querySelector("#tabCalcBtn");
      this.tabWebhookBtn = container.querySelector("#tabWebhookBtn");
      this.secCalc = container.querySelector("#sectionCalc");
      this.secWebhook = container.querySelector("#sectionWebhook");
      this.priceInput = container.querySelector("#productPrice");
      this.salesInput = container.querySelector("#monthlySales");
      this.stripeFeesEl = container.querySelector("#stripeFees");
      this.stripeNominalEl = container.querySelector("#stripeNominal");
      this.morFeesEl = container.querySelector("#morFees");
      this.morPayoutEl = container.querySelector("#morPayout");
      this.btnValid = container.querySelector("#btnValidWebhook");
      this.btnTampered = container.querySelector("#btnTamperedWebhook");
      this.webhookHeader = container.querySelector("#webhookHeaderVal");
      this.webhookTerm = container.querySelector("#webhookTerminal");

      // 分頁切換
      this.tabCalcBtn.addEventListener("click", () => {
        this.tabCalcBtn.classList.add("active");
        this.tabWebhookBtn.classList.remove("active");
        this.secCalc.style.display = "block";
        this.secWebhook.style.display = "none";
      });

      this.tabWebhookBtn.addEventListener("click", () => {
        this.tabWebhookBtn.classList.add("active");
        this.tabCalcBtn.classList.remove("active");
        this.secCalc.style.display = "none";
        this.secWebhook.style.display = "block";
        this.simulateWebhook(true);
      });

      // 試算輸入監聽
      const updateCalc = () => {
        const price = Math.max(1, parseFloat(this.priceInput.value) || 50);
        const volume = Math.max(1, parseInt(this.salesInput.value, 10) || 100);
        const gross = price * volume;

        // Stripe: 2.9% + $0.30 per tx
        const stripeTotalFees = gross * 0.029 + volume * 0.3;
        const stripeNet = gross - stripeTotalFees;

        // MoR (Paddle/Lemon Squeezy): 5% + $0.50 per tx
        const morTotalFees = gross * 0.05 + volume * 0.5;
        const morNet = gross - morTotalFees;

        this.stripeFeesEl.textContent = `-$${stripeTotalFees.toFixed(0)}`;
        this.stripeNominalEl.textContent = `$${stripeNet.toFixed(0)}`;
        this.morFeesEl.textContent = `-$${morTotalFees.toFixed(0)}`;
        this.morPayoutEl.textContent = `$${morNet.toFixed(0)}`;
      };

      this.priceInput.addEventListener("input", updateCalc);
      this.salesInput.addEventListener("input", updateCalc);

      // Webhook 模擬點擊
      this.btnValid.addEventListener("click", () => this.simulateWebhook(true));
      this.btnTampered.addEventListener("click", () => this.simulateWebhook(false));

      updateCalc();
    },

    simulateWebhook(isValid) {
      if (isValid) {
        this.webhookHeader.style.color = "#7ee787";
        this.webhookHeader.textContent = "stripe-signature: t=1730012400,v1=9e81a3cf82bc4...";
        this.webhookTerm.innerHTML = `
          <div style="color: #8b949e;">POST /api/webhooks/stripe (Content-Type: application/json)</div>
          <div style="color: #58a6ff;">[1] 讀取 raw payload body 與 stripe-signature 標頭...</div>
          <div style="color: #58a6ff;">[2] 使用 STRIPE_WEBHOOK_SECRET 計算 HMAC-SHA256 數位簽章...</div>
          <div style="color: #7ee787; font-weight: bold;">[3] 簽名比對一致！(Signature Verified: MATCH)</div>
          <div style="color: #f0f6fc; margin-top: 0.3rem;">[4] 解析事件類型: checkout.session.completed</div>
          <div style="color: #7ee787;">[5] 交易確認付款成功 ($50.00 USD)，自動觸發寄送啟用序號與開通權限。</div>
          <div style="color: #8b949e; border-top: 1px dashed #21262d; margin-top: 0.4rem; padding-top: 0.3rem;">
            HTTP/1.1 200 OK (回應 Stripe 成功接收)
          </div>
        `;
      } else {
        this.webhookHeader.style.color = "#f85149";
        this.webhookHeader.textContent = "stripe-signature: t=1730012400,v1=INVALID_FAKE_SIG...";
        this.webhookTerm.innerHTML = `
          <div style="color: #8b949e;">POST /api/webhooks/stripe (來源 IP: 198.51.100.23 未經授權)</div>
          <div style="color: #58a6ff;">[1] 讀取 raw payload body 與偽造之 stripe-signature...</div>
          <div style="color: #58a6ff;">[2] 使用本地 Secret Key 驗算 HMAC-SHA256...</div>
          <div style="color: #f85149; font-weight: bold;">
            🚨 [警告] 簽名比對不吻合！(Signature Verification Failed!)
          </div>
          <div style="color: #f85149;">
            ↳ 偵測到偽造之 checkout.session.completed 攻擊封包，立即終止處理，嚴防未付款白嫖！
          </div>
          <div style="color: #8b949e; border-top: 1px dashed #21262d; margin-top: 0.4rem; padding-top: 0.3rem;">
            HTTP/1.1 400 Bad Request (拒絕惡意請求)
          </div>
        `;
      }
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["stripe-widget"] = StripeWidget;
  window.VIBE_WIDGETS["stripe"] = StripeWidget;
})();
