// apps/vibe-coder/js/widgets/api-widget.js
// Mini REST API 用戶端與 Bearer Token 授權驗證測試器

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const ApiWidget = {
    mount(container, props = {}) {
      this.container = container;

      container.innerHTML = `
        <div class="vibe-widget vibe-api-container" role="region" aria-label="REST API 用戶端與 Token 測試器">
          <!-- 頂部請求網址列 -->
          <div class="vibe-api-bar">
            <select id="apiMethod" class="vibe-api-method" aria-label="HTTP 請求方法">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input type="text" id="apiUrl" class="vibe-api-url" value="https://api.vibe-coder.xyz/v1/projects" aria-label="API 終端節點 URL" />
            <button id="apiSendBtn" class="vibe-btn primary" style="font-weight: 600;">
              <span>⚡ 發送請求</span>
            </button>
          </div>

          <!-- 授權標頭設定區 -->
          <div class="vibe-api-config-box">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <input type="checkbox" id="authEnabled" checked style="cursor: pointer; width: 16px; height: 16px;" />
              <label for="authEnabled" style="font-size: 0.82rem; font-weight: 600; cursor: pointer;">
                啟用 Authorization: Bearer Token
              </label>
            </div>

            <div id="tokenInputWrapper" style="display: flex; align-items: center; gap: 0.4rem; flex: 1; max-width: 420px;">
              <span style="font-size: 0.75rem; color: #8b949e; font-family: var(--font-mono);">Bearer</span>
              <input type="text" id="apiToken" class="vibe-api-url" value="sk-live-vibe999" placeholder="請輸入 API 金鑰 (Token)" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" />
              <button id="toggleTokenMask" class="vibe-btn" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" title="顯示/遮蔽金鑰">👁️</button>
            </div>
          </div>

          <!-- POST 請求主體 (僅在 POST 時顯示) -->
          <div id="postBodyWrapper" style="display: none; background: #161b22; border: 1px solid #30363d; border-radius: var(--radius-sm); padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: #8b949e; margin-bottom: 0.35rem; font-family: var(--font-mono);">
              Request Payload (application/json):
            </div>
            <textarea id="postPayload" style="width: 100%; height: 60px; background: #090d13; border: 1px solid #21262d; border-radius: 4px; color: #c9d1d9; font-family: var(--font-mono); font-size: 0.8rem; padding: 0.5rem; resize: vertical;">{
  "name": "智慧語音小幫手",
  "template": "agent-starter"
}</textarea>
          </div>

          <!-- 回應資訊面板 -->
          <div class="vibe-api-response-panel">
            <div class="vibe-api-response-header">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 0.8rem; color: #8b949e;">Response:</span>
                <span id="responseStatusBadge" class="vibe-badge success">200 OK</span>
                <span id="responseTime" style="font-size: 0.75rem; color: #8b949e;">42ms</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span id="responseSize" style="font-size: 0.75rem; color: #8b949e;">1.2 KB</span>
                <button id="copyJsonBtn" class="vibe-btn" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">📋 複製 JSON</button>
              </div>
            </div>

            <div id="apiJsonBody" class="vibe-api-json-body">
              <!-- JSON 渲染區 -->
            </div>
          </div>

          <!-- 重點提示卡 -->
          <div style="padding: 0.85rem 1rem; background: #161b22; border-left: 3px solid #388bfd; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>實戰觀念：</strong>
            API Token（如 <code>sk-live-...</code>）是機器與伺服器之間身分驗證的通關密碼。
            取消勾選「啟用 Authorization」後點擊發送，即可觀察伺服器如何回傳 <code>401 Unauthorized</code> 阻擋未授權存取。
          </div>
        </div>
      `;

      // 取得節點
      this.methodSel = container.querySelector("#apiMethod");
      this.urlInput = container.querySelector("#apiUrl");
      this.sendBtn = container.querySelector("#apiSendBtn");
      this.authCheckbox = container.querySelector("#authEnabled");
      this.tokenInput = container.querySelector("#apiToken");
      this.tokenMaskBtn = container.querySelector("#toggleTokenMask");
      this.postWrapper = container.querySelector("#postBodyWrapper");
      this.postPayload = container.querySelector("#postPayload");
      this.statusBadge = container.querySelector("#responseStatusBadge");
      this.timeEl = container.querySelector("#responseTime");
      this.sizeEl = container.querySelector("#responseSize");
      this.jsonBody = container.querySelector("#apiJsonBody");
      this.copyBtn = container.querySelector("#copyJsonBtn");

      // 切換 GET / POST
      this.methodSel.addEventListener("change", () => {
        this.postWrapper.style.display = this.methodSel.value === "POST" ? "block" : "none";
      });

      // 遮蔽金鑰切換
      let isMasked = false;
      this.tokenMaskBtn.addEventListener("click", () => {
        isMasked = !isMasked;
        this.tokenInput.type = isMasked ? "password" : "text";
      });

      // 發送請求邏輯
      this.sendBtn.addEventListener("click", () => this.sendRequest());

      // 複製 JSON
      this.copyBtn.addEventListener("click", () => {
        const text = this.jsonBody.innerText;
        navigator.clipboard.writeText(text).then(() => {
          this.copyBtn.textContent = "✓ 已複製！";
          setTimeout(() => (this.copyBtn.textContent = "📋 複製 JSON"), 1500);
        });
      });

      // 初始渲染一次預設回應
      this.renderResponse(200, 42, {
        status: "success",
        code: 200,
        message: "驗證成功，取得專案清單",
        data: {
          user_id: "usr_vibe888",
          role: "pro_developer",
          projects: [
            { id: "proj_001", name: "AI 智能客服 Agent", status: "active", created_at: "2026-10-15" },
            { id: "proj_002", name: "語音即時轉譯器", status: "deployed", created_at: "2026-10-20" }
          ]
        }
      });
    },

    sendRequest() {
      // 顯示載入動畫狀態
      this.sendBtn.disabled = true;
      this.sendBtn.innerHTML = `<span>⏳ 請求中...</span>`;
      this.jsonBody.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #8b949e;">
          <div style="font-size: 1.5rem; animation: vibe-pulse 1s infinite;">📡</div>
          <div style="margin-top: 0.5rem; font-size: 0.8rem;">正在與 https://api.vibe-coder.xyz 建立 TLS 連線...</div>
        </div>
      `;

      // 模擬網路延遲 350ms
      setTimeout(() => {
        this.sendBtn.disabled = false;
        this.sendBtn.innerHTML = `<span>⚡ 發送請求</span>`;

        const hasAuth = this.authCheckbox.checked;
        const token = this.tokenInput.value.trim();
        const method = this.methodSel.value;

        // 若未帶 Token 或 Token 錯誤
        if (!hasAuth || !token || token !== "sk-live-vibe999") {
          this.renderResponse(401, 38, {
            error: "Unauthorized",
            code: 401,
            message: "拒絕存取：缺少有效的 Bearer Token 授權標頭",
            hint: "請勾選「啟用 Authorization」並確認 Token 為 sk-live-vibe999"
          });
          return;
        }

        // 授權成功
        if (method === "POST") {
          let parsed = {};
          try {
            parsed = JSON.parse(this.postPayload.value);
          } catch (e) {
            parsed = { raw: this.postPayload.value };
          }

          this.renderResponse(201, 64, {
            status: "created",
            code: 201,
            message: "新專案已成功建立！",
            data: {
              id: "proj_" + Math.random().toString(36).substring(2, 8),
              ...parsed,
              created_at: new Date().toISOString()
            }
          });
        } else {
          this.renderResponse(200, 42, {
            status: "success",
            code: 200,
            message: "授權驗證通過",
            data: {
              user_id: "usr_vibe888",
              role: "pro_developer",
              rate_limit: {
                limit: 1000,
                remaining: 998,
                reset_in_seconds: 3540
              },
              projects: [
                { id: "proj_001", name: "AI 智能客服 Agent", status: "active", created_at: "2026-10-15" },
                { id: "proj_002", name: "語音即時轉譯器", status: "deployed", created_at: "2026-10-20" }
              ]
            }
          });
        }
      }, 350);
    },

    renderResponse(statusCode, latencyMs, jsonObj) {
      if (statusCode >= 200 && statusCode < 300) {
        this.statusBadge.className = "vibe-badge success";
        this.statusBadge.textContent = statusCode === 201 ? "201 Created" : "200 OK";
      } else {
        this.statusBadge.className = "vibe-badge danger";
        this.statusBadge.textContent = "401 Unauthorized";
      }

      this.timeEl.textContent = `${latencyMs}ms`;
      const jsonStr = JSON.stringify(jsonObj, null, 2);
      this.sizeEl.textContent = `${(new Blob([jsonStr]).size / 1024).toFixed(1)} KB`;

      // 語法高亮著色
      this.jsonBody.innerHTML = `<pre style="margin: 0; font-family: var(--font-mono);">${this.syntaxHighlight(jsonStr)}</pre>`;
    },

    syntaxHighlight(json) {
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = "color: #79c0ff;"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "color: #7ee787; font-weight: bold;"; // key
          } else {
            cls = "color: #a5d6ff;"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "color: #ff7b72;"; // boolean
        } else if (/null/.test(match)) {
          cls = "color: #8b949e;"; // null
        }
        return `<span style="${cls}">${match}</span>`;
      });
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["api-widget"] = ApiWidget;
  window.VIBE_WIDGETS["api"] = ApiWidget;
  window.VIBE_WIDGETS["auth-widget"] = ApiWidget;
})();
