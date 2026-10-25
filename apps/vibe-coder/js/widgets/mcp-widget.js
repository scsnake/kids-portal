// apps/vibe-coder/js/widgets/mcp-widget.js
// Model Context Protocol (MCP) 模型上下文協定與工具調用檢視器

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const MCP_STEPS = [
    {
      id: 1,
      name: "用戶提問 (User Prompt)",
      icon: "👤",
      summary: "使用者向 AI Agent 下達自然語言指令",
      detail: "「請幫我看看目前專案目錄底下有哪些檔案，並摘要 package.json 內容。」",
      rpcType: "Client Input",
      jsonRpc: {
        role: "user",
        content: "請幫我看看目前專案目錄底下有哪些檔案，並摘要 package.json 內容。"
      }
    },
    {
      id: 2,
      name: "LLM 決策工具調用 (Tool Decision)",
      icon: "🧠",
      summary: "大語言模型判斷需要本機檔案存取權限，決定呼叫 MCP Tool",
      detail: "LLM 自身沒有硬碟讀取權限，因此產生對 `list_directory` 工具的呼叫意圖。",
      rpcType: "Model Output",
      jsonRpc: {
        thought: "用戶需要查看本地目錄，我需要調用 MCP 工具 list_directory 來讀取目前資料夾。",
        tool_call: "list_directory",
        path: "."
      }
    },
    {
      id: 3,
      name: "發送 JSON-RPC 2.0 請求",
      icon: "📡",
      summary: "客戶端將工具調用意圖封裝為標準 JSON-RPC 2.0 協定封包",
      detail: "透過標準輸入輸出 (stdio) 或 SSE 發送至本機運行的 MCP Server。",
      rpcType: "JSON-RPC Request",
      jsonRpc: {
        jsonrpc: "2.0",
        id: "call_mcp_001",
        method: "tools/call",
        params: {
          name: "list_directory",
          arguments: {
            path: "./projects/vibe-app"
          }
        }
      }
    },
    {
      id: 4,
      name: "本地 MCP 伺服器執行 (Local Execution)",
      icon: "⚙️",
      summary: "本機獨立 Node/Python 行程執行真實系統呼叫 (fs.readdir)",
      detail: "MCP Server 在安全沙盒範圍內讀取檔案清單，完全不洩漏用戶硬碟其他未授權區域。",
      rpcType: "OS System Call",
      jsonRpc: {
        server: "mcp-filesystem-server@1.2.0",
        process_pid: 8821,
        operation: "fs.readdirSync('./projects/vibe-app')",
        status: "success",
        time_elapsed_ms: 2.4
      }
    },
    {
      id: 5,
      name: "回傳 Tool Result (JSON-RPC 2.0 Response)",
      icon: "📥",
      summary: "MCP 伺服器將執行結果回傳給 AI 宿主應用程式",
      detail: "標準化的 content 陣列結構，供 LLM 讀取上下文。",
      rpcType: "JSON-RPC Response",
      jsonRpc: {
        jsonrpc: "2.0",
        id: "call_mcp_001",
        result: {
          content: [
            {
              type: "text",
              text: "app.js\npackage.json\nREADME.md\nnode_modules/\n.env"
            }
          ],
          isError: false
        }
      }
    },
    {
      id: 6,
      name: "LLM 整合並生成最終回答 (Final Answer)",
      icon: "💬",
      summary: "AI 結合工具取得的本機真實檔案資訊，回答用戶提問",
      detail: "「您的專案目錄中包含 app.js、package.json 等檔案。這是一個標準的 Node.js 專案。」",
      rpcType: "Assistant Response",
      jsonRpc: {
        role: "assistant",
        content: "我已檢查您的專案目錄，目前包含：\n1. app.js (主伺服器程式)\n2. package.json (專案依賴設定)\n3. README.md (說明文件)\n\n這是一個結構完整的 Node.js 應用程式！"
      }
    }
  ];

  const McpWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.currentStep = 0;
      this.autoPlayTimer = null;
      this.viewMode = "flow"; // 'flow' 或 'json'

      container.innerHTML = `
        <div class="vibe-widget vibe-mcp-container" role="region" aria-label="MCP 協定工具調用檢視器">
          <!-- 頂部控制與視圖切換列 -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="vibe-badge info">MCP PROTOCOL v1.0</span>
              <span style="font-size: 0.85rem; font-weight: 600;">工具調用全流程分解 (Tool-Calling Lifecycle)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button id="mcpModeFlow" class="vibe-btn ${this.viewMode === 'flow' ? 'primary' : ''}" style="font-size: 0.75rem;">
                視覺流程圖
              </button>
              <button id="mcpModeJson" class="vibe-btn ${this.viewMode === 'json' ? 'primary' : ''}" style="font-size: 0.75rem;">
                JSON-RPC 2.0 封包
              </button>
            </div>
          </div>

          <!-- 播放控制按鈕 -->
          <div style="display: flex; align-items: center; gap: 0.5rem; background: #161b22; padding: 0.6rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid #30363d;">
            <button id="mcpPrevBtn" class="vibe-btn" style="font-size: 0.75rem;">◀ 上一步</button>
            <button id="mcpNextBtn" class="vibe-btn primary" style="font-size: 0.75rem;">下一步 ▶</button>
            <button id="mcpAutoBtn" class="vibe-btn" style="font-size: 0.75rem;">▶ 自動播放</button>
            <button id="mcpResetBtn" class="vibe-btn" style="font-size: 0.75rem;">重設</button>
            <div style="margin-left: auto; font-size: 0.78rem; color: #8b949e; font-family: var(--font-mono);">
              進度：<span id="mcpStepIndicator" style="color: #58a6ff; font-weight: 600;">1 / 6</span>
            </div>
          </div>

          <!-- 主內容展示區 -->
          <div id="mcpContentBody" style="min-height: 280px;">
            <!-- 動態渲染 -->
          </div>

          <!-- 觀念說明卡 -->
          <div style="padding: 0.85rem 1rem; background: #161b22; border-left: 3px solid #bc8cff; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>MCP (Model Context Protocol) 核心價值：</strong>
            過去每個 AI 廠商的 Plugin 規格互不相通。MCP 制定了開放統一的 JSON-RPC 標準，
            讓任何 LLM（Claude, Gemini, ChatGPT 等）都能即插即用連線至本地檔案系統、資料庫或 GitHub 等擴充工具！
          </div>
        </div>
      `;

      this.contentBody = container.querySelector("#mcpContentBody");
      this.stepIndicator = container.querySelector("#mcpStepIndicator");
      this.prevBtn = container.querySelector("#mcpPrevBtn");
      this.nextBtn = container.querySelector("#mcpNextBtn");
      this.autoBtn = container.querySelector("#mcpAutoBtn");
      this.resetBtn = container.querySelector("#mcpResetBtn");
      this.btnFlow = container.querySelector("#mcpModeFlow");
      this.btnJson = container.querySelector("#mcpModeJson");

      // 綁定事件
      this.prevBtn.addEventListener("click", () => {
        this.stopAutoPlay();
        if (this.currentStep > 0) {
          this.currentStep--;
          this.render();
        }
      });

      this.nextBtn.addEventListener("click", () => {
        this.stopAutoPlay();
        if (this.currentStep < MCP_STEPS.length - 1) {
          this.currentStep++;
          this.render();
        }
      });

      this.resetBtn.addEventListener("click", () => {
        this.stopAutoPlay();
        this.currentStep = 0;
        this.render();
      });

      this.autoBtn.addEventListener("click", () => {
        if (this.autoPlayTimer) {
          this.stopAutoPlay();
        } else {
          this.startAutoPlay();
        }
      });

      this.btnFlow.addEventListener("click", () => {
        this.viewMode = "flow";
        this.btnFlow.className = "vibe-btn primary";
        this.btnJson.className = "vibe-btn";
        this.render();
      });

      this.btnJson.addEventListener("click", () => {
        this.viewMode = "json";
        this.btnJson.className = "vibe-btn primary";
        this.btnFlow.className = "vibe-btn";
        this.render();
      });

      this.render();
    },

    startAutoPlay() {
      this.autoBtn.textContent = "⏸ 暫停播放";
      this.autoBtn.classList.add("danger");
      this.autoPlayTimer = setInterval(() => {
        if (this.currentStep < MCP_STEPS.length - 1) {
          this.currentStep++;
          this.render();
        } else {
          this.stopAutoPlay();
        }
      }, 1600);
    },

    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
      this.autoBtn.textContent = "▶ 自動播放";
      this.autoBtn.classList.remove("danger");
    },

    render() {
      this.stepIndicator.textContent = `${this.currentStep + 1} / ${MCP_STEPS.length}`;
      this.prevBtn.disabled = this.currentStep === 0;
      this.nextBtn.disabled = this.currentStep === MCP_STEPS.length - 1;

      if (this.viewMode === "flow") {
        this.renderFlow();
      } else {
        this.renderJson();
      }
    },

    renderFlow() {
      const activeStep = MCP_STEPS[this.currentStep];
      let stepsHtml = "";

      MCP_STEPS.forEach((step, idx) => {
        const isActive = idx === this.currentStep;
        const isDone = idx < this.currentStep;
        const cls = isActive ? "active" : isDone ? "completed" : "";

        stepsHtml += `
          <div class="vibe-mcp-step ${cls}">
            <div class="vibe-mcp-step-num">${isDone ? '✓' : step.id}</div>
            <div style="font-size: 1.25rem;">${step.icon}</div>
            <div style="flex: 1;">
              <div style="font-size: 0.85rem; font-weight: 600; color: ${isActive ? '#58a6ff' : isDone ? '#7ee787' : '#c9d1d9'};">
                ${step.name}
              </div>
              <div style="font-size: 0.75rem; color: #8b949e;">${step.summary}</div>
            </div>
            ${isActive ? '<span class="vibe-badge info" style="font-size: 0.7rem;">進行中</span>' : ''}
          </div>
        `;
      });

      this.contentBody.innerHTML = `
        <div class="vibe-mcp-flow">
          ${stepsHtml}
        </div>
        <div style="margin-top: 0.75rem; background: #090d13; border: 1px solid #30363d; border-radius: var(--radius-sm); padding: 0.85rem;">
          <div style="font-size: 0.75rem; color: #58a6ff; font-weight: 600; margin-bottom: 0.25rem;">
            📌 當前步驟詳解：
          </div>
          <div style="font-size: 0.82rem; color: #f0f6fc;">
            ${activeStep.detail}
          </div>
        </div>
      `;
    },

    renderJson() {
      const activeStep = MCP_STEPS[this.currentStep];
      const jsonStr = JSON.stringify(activeStep.jsonRpc, null, 2);

      this.contentBody.innerHTML = `
        <div style="background: #090d13; border: 1px solid #30363d; border-radius: var(--radius-md); padding: 1rem; font-family: var(--font-mono);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid #21262d; padding-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.1rem;">${activeStep.icon}</span>
              <span style="font-size: 0.85rem; color: #58a6ff; font-weight: 600;">步驟 ${activeStep.id}：${activeStep.rpcType}</span>
            </div>
            <span class="vibe-badge">${activeStep.name}</span>
          </div>
          <pre style="margin: 0; font-size: 0.82rem; line-height: 1.5; color: #c9d1d9; overflow-x: auto;">${this.syntaxHighlight(jsonStr)}</pre>
        </div>
      `;
    },

    syntaxHighlight(json) {
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = "color: #79c0ff;";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "color: #7ee787; font-weight: bold;";
          } else {
            cls = "color: #a5d6ff;";
          }
        } else if (/true|false/.test(match)) {
          cls = "color: #ff7b72;";
        }
        return `<span style="${cls}">${match}</span>`;
      });
    },

    unmount(container) {
      this.stopAutoPlay();
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["mcp-widget"] = McpWidget;
  window.VIBE_WIDGETS["mcp"] = McpWidget;
})();
