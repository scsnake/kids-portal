// apps/vibe-coder/js/widgets/git-widget.js
// Git 傳統切換分支 vs Git Worktree (工作樹平行開發) 視覺化比較沙盒

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const GitWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.currentMode = "worktree"; // 'checkout' 或 'worktree'

      container.innerHTML = `
        <div class="vibe-widget vibe-git-container" role="region" aria-label="Git Worktree 視覺化比較沙盒">
          <!-- 模式切換器 -->
          <div class="vibe-git-toggle-bar">
            <button id="toggleWorktree" class="vibe-git-toggle-btn active">
              ✨ 模式 B：Git Worktree 工作樹平行多工 (現代 AI 協作主流)
            </button>
            <button id="toggleCheckout" class="vibe-git-toggle-btn">
              ⚠️ 模式 A：傳統分支切換 (git checkout / switch)
            </button>
          </div>

          <!-- 主要畫布內容區 -->
          <div id="gitCanvas" class="vibe-git-visual-canvas">
            <!-- 內容由 JavaScript 動態渲染 -->
          </div>

          <!-- 說明卡片 -->
          <div style="padding: 0.85rem 1rem; background: #161b22; border-left: 3px solid #bc8cff; border-radius: var(--radius-sm); font-size: 0.82rem; color: #c9d1d9;">
            💡 <strong>為什麼 AI 開發必備 Git Worktree？</strong>
            當 AI 代理（如 Claude Code、Cursor、Gemini）在另一個分支進行耗時的大規模重構時，使用 <code>git worktree add</code> 可以在硬碟不同目錄同時開啟兩個分支。
            無需 <code>git stash</code>、無需中斷正在運行的 <code>npm run dev</code> 伺服器，更不會引發未存檔檔案覆寫衝突！
          </div>
        </div>
      `;

      this.canvas = container.querySelector("#gitCanvas");
      this.btnWorktree = container.querySelector("#toggleWorktree");
      this.btnCheckout = container.querySelector("#toggleCheckout");

      this.btnWorktree.addEventListener("click", () => {
        this.currentMode = "worktree";
        this.btnWorktree.classList.add("active");
        this.btnCheckout.classList.remove("active");
        this.renderWorktreeMode();
      });

      this.btnCheckout.addEventListener("click", () => {
        this.currentMode = "checkout";
        this.btnCheckout.classList.add("active");
        this.btnWorktree.classList.remove("active");
        this.renderCheckoutMode();
      });

      // 預設渲染 Worktree
      this.renderWorktreeMode();
    },

    renderWorktreeMode() {
      this.canvas.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <span class="vibe-badge success">GIT WORKTREE</span>
              <span style="font-size: 0.88rem; font-weight: 600; margin-left: 0.5rem;">單一 Git 儲存庫，平行獨立目錄</span>
            </div>
            <button id="btnSimulateWorktree" class="vibe-btn primary" style="font-size: 0.75rem;">
              ⚡ 執行 git worktree add
            </button>
          </div>

          <!-- 中央核心 Git 儲存庫圖示 -->
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: #21262d; border: 1px dashed #58a6ff; padding: 0.4rem 1.2rem; border-radius: 9999px; font-size: 0.8rem; font-family: var(--font-mono);">
              📦 共享的底層資料夾：<code>~/projects/vibe-app/.git</code> (所有歷史紀錄、Commit 與分支物件)
            </div>
          </div>

          <!-- 兩個平行的工作樹目錄 -->
          <div class="vibe-worktree-split">
            <!-- 目錄 1: 主分支 -->
            <div class="vibe-worktree-folder active">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-family: var(--font-mono); font-size: 0.85rem; color: #58a6ff; font-weight: 600;">
                  📁 ~/projects/vibe-app
                </span>
                <span class="vibe-badge success">分支: main</span>
              </div>
              <div style="font-size: 0.75rem; color: #8b949e; margin-bottom: 0.75rem;">
                狀態：正在運行生產測試伺服器 (Port 3000)
              </div>
              <div style="background: #090d13; border: 1px solid #21262d; border-radius: 4px; padding: 0.6rem; font-family: var(--font-mono); font-size: 0.78rem;">
                <div>📄 package.json</div>
                <div>📄 app.js <span style="color: #7ee787;">(運行中)</span></div>
                <div>📁 node_modules/</div>
              </div>
            </div>

            <!-- 目錄 2: 獨立特徵分支 -->
            <div class="vibe-worktree-folder" id="featureWorktreeFolder" style="border: 2px dashed #30363d;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-family: var(--font-mono); font-size: 0.85rem; color: #a5d6ff; font-weight: 600;">
                  📁 ~/projects/vibe-app-oauth
                </span>
                <span class="vibe-badge info">分支: feature/oauth</span>
              </div>
              <div style="font-size: 0.75rem; color: #8b949e; margin-bottom: 0.75rem;">
                狀態：AI 代理正在此獨立目錄重構登入邏輯
              </div>
              <div style="background: #090d13; border: 1px solid #21262d; border-radius: 4px; padding: 0.6rem; font-family: var(--font-mono); font-size: 0.78rem;">
                <div>📄 oauth-service.ts <span style="color: #58a6ff;">(AI 正在編輯)</span></div>
                <div>📄 app.js <span style="color: #bc8cff;">(全新重構版)</span></div>
                <div style="color: #8b949e;">↳ 完全不干擾左側的 main 分支！</div>
              </div>
            </div>
          </div>

          <!-- 指令終端模擬日誌 -->
          <div id="gitTerminalOutput" style="margin-top: 1rem; background: #090d13; border: 1px solid #21262d; border-radius: 6px; padding: 0.75rem; font-family: var(--font-mono); font-size: 0.78rem; color: #c9d1d9;">
            <div style="color: #8b949e;">$ git worktree list</div>
            <div>/Users/vibe/projects/vibe-app        7f8a91b [main]</div>
            <div>/Users/vibe/projects/vibe-app-oauth  3d4e5f2 [feature/oauth]</div>
          </div>
        </div>
      `;

      const simBtn = this.canvas.querySelector("#btnSimulateWorktree");
      const folder2 = this.canvas.querySelector("#featureWorktreeFolder");
      const term = this.canvas.querySelector("#gitTerminalOutput");

      simBtn.addEventListener("click", () => {
        folder2.style.borderColor = "#7ee787";
        folder2.style.background = "rgba(46, 160, 67, 0.08)";
        term.innerHTML = `
          <div style="color: #58a6ff;">$ git worktree add ../vibe-app-oauth feature/oauth</div>
          <div>Preparing worktree (checking out 'feature/oauth')</div>
          <div>HEAD is now at 3d4e5f2 feat: add oauth2 login callback</div>
          <div style="color: #7ee787; margin-top: 0.4rem;">✓ 成功建立新工作樹！現在你可以在 VS Code 同時開啟兩個視窗編輯不同分支，無需頻繁切換。</div>
        `;
      });
    },

    renderCheckoutMode() {
      this.canvas.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div>
              <span class="vibe-badge danger">TRADITIONAL CHECKOUT</span>
              <span style="font-size: 0.88rem; font-weight: 600; margin-left: 0.5rem;">單一工作目錄，頻繁覆寫檔案</span>
            </div>
            <button id="btnTryCheckout" class="vibe-btn danger" style="font-size: 0.75rem;">
              💥 嘗試執行 git checkout feature/oauth
            </button>
          </div>

          <!-- 單一工作目錄示意 -->
          <div style="background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: var(--font-mono); font-size: 0.85rem; color: #58a6ff;">
                📁 ~/projects/vibe-app (單一目錄)
              </span>
              <span class="vibe-badge warning">目前分支: main (有未暫存修改)</span>
            </div>
            <div style="margin-top: 0.6rem; font-size: 0.8rem; color: #8b949e;">
              你在 <code>app.js</code> 寫了 20 行尚未 commit 的程式碼，同時伺服器正在背景運行。
            </div>
          </div>

          <!-- 衝突輸出視窗 -->
          <div id="checkoutErrorLog" style="background: #090d13; border: 1px solid #f85149; border-radius: 6px; padding: 0.85rem; font-family: var(--font-mono); font-size: 0.78rem; color: #f85149;">
            <div>點擊上方按鈕模擬切換分支，觀察 Git 的安全阻擋訊息...</div>
          </div>
        </div>
      `;

      const tryBtn = this.canvas.querySelector("#btnTryCheckout");
      const errorLog = this.canvas.querySelector("#checkoutErrorLog");

      tryBtn.addEventListener("click", () => {
        errorLog.innerHTML = `
          <div style="color: #58a6ff;">$ git checkout feature/oauth</div>
          <div style="color: #f85149; font-weight: bold; margin-top: 0.3rem;">
            error: Your local changes to the following files would be overwritten by checkout:<br>
            &nbsp;&nbsp;app.js<br>
            Please commit your changes or stash them before you switch branches.<br>
            Aborting
          </div>
          <div style="color: #d29922; margin-top: 0.5rem; border-top: 1px dashed #30363d; padding-top: 0.5rem;">
            ⚠️ <strong>痛點分析：</strong><br>
            如果使用傳統 checkout，你必須被迫執行 <code>git stash</code> 或隨意 commit 半成品，切換後 node_modules 還可能需要重新安裝。<br>
            這正是切換為 <strong>Git Worktree</strong> 能大幅節省時間的核心原因！
          </div>
        `;
      });
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["git-widget"] = GitWidget;
  window.VIBE_WIDGETS["git"] = GitWidget;
  window.VIBE_WIDGETS["worktree-widget"] = GitWidget;
  window.VIBE_WIDGETS["licenses-widget"] = GitWidget;
})();
