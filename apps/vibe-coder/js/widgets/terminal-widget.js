// apps/vibe-coder/js/widgets/terminal-widget.js
// 互動式 CLI 與 Shell 模擬終端機

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const TerminalWidget = {
    mount(container, props = {}) {
      this.container = container;
      this.history = [];
      this.historyIndex = -1;

      // 預設模擬檔案系統與狀態
      this.currentDir = props.initialDir || "~/projects/vibe-app";
      this.serverRunning = false;

      // 構建 DOM 結構
      container.innerHTML = `
        <div class="vibe-widget vibe-terminal" role="region" aria-label="互動式 CLI 模擬終端機">
          <div class="vibe-terminal-header">
            <div class="vibe-terminal-dots">
              <span class="vibe-terminal-dot red" title="關閉"></span>
              <span class="vibe-terminal-dot yellow" title="最小化"></span>
              <span class="vibe-terminal-dot green" title="全螢幕"></span>
            </div>
            <div class="vibe-terminal-title">zsh — vibe-coder@macbook-pro: ${this.currentDir}</div>
            <div style="display: flex; gap: 0.35rem;">
              <span class="vibe-badge">zsh 5.9</span>
              <span class="vibe-badge">node v20.11</span>
            </div>
          </div>

          <!-- 快速常用指令點擊列 -->
          <div class="vibe-terminal-quick-chips">
            <span class="vibe-chip-label">⚡ 點擊快速執行：</span>
            <button class="vibe-terminal-chip" data-cmd="help">help</button>
            <button class="vibe-terminal-chip" data-cmd="pwd">pwd</button>
            <button class="vibe-terminal-chip" data-cmd="ls -la">ls -la</button>
            <button class="vibe-terminal-chip" data-cmd="cat app.js">cat app.js</button>
            <button class="vibe-terminal-chip" data-cmd="curl http://localhost:3000">curl localhost:3000</button>
            <button class="vibe-terminal-chip" data-cmd="sudo apt update">sudo apt update</button>
            <button class="vibe-terminal-chip danger" data-cmd="sudo rm -rf /">sudo rm -rf /</button>
            <button class="vibe-terminal-chip" data-cmd="clear">clear</button>
          </div>

          <!-- 終端輸出視窗 -->
          <div class="vibe-terminal-body" id="termOutput">
            <div class="vibe-terminal-line system">Last login: ${new Date().toLocaleDateString("zh-TW")} on ttys001</div>
            <div class="vibe-terminal-line system">歡迎進入 Vibe Coder 終端機模擬器！輸入 <strong style="color: #58a6ff;">help</strong> 可查看所有支援指令。</div>
            <div class="vibe-terminal-line system" style="margin-bottom: 0.75rem;">──────────────────────────────────────────────────────</div>
          </div>

          <!-- 命令行輸入提示列 -->
          <div class="vibe-terminal-input-row" style="padding: 0.5rem 1rem; background: #0b0f15; border-top: 1px solid #21262d;">
            <div class="vibe-terminal-prompt">
              <span class="user">vibe@dev</span>:<span class="path">${this.currentDir}</span><span class="symbol"> % </span>
            </div>
            <input type="text" class="vibe-terminal-input" id="termInput" autocomplete="off" spellcheck="false" placeholder="在此輸入指令 (如 ls, pwd, help)..." aria-label="終端機命令列輸入" />
          </div>
        </div>
      `;

      // 快取 DOM 元素
      this.outputEl = container.querySelector("#termOutput");
      this.inputEl = container.querySelector("#termInput");

      // 監聽鍵盤事件
      this.onKeyDown = (e) => {
        if (e.key === "Enter") {
          const cmd = this.inputEl.value.trim();
          if (cmd) {
            this.history.push(cmd);
            this.historyIndex = this.history.length;
          }
          this.execute(cmd);
          this.inputEl.value = "";
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (this.history.length > 0) {
            if (this.historyIndex > 0) this.historyIndex--;
            this.inputEl.value = this.history[this.historyIndex] || "";
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (this.history.length > 0) {
            if (this.historyIndex < this.history.length - 1) {
              this.historyIndex++;
              this.inputEl.value = this.history[this.historyIndex] || "";
            } else {
              this.historyIndex = this.history.length;
              this.inputEl.value = "";
            }
          }
        }
      };
      this.inputEl.addEventListener("keydown", this.onKeyDown);

      // 快速按鈕點擊事件
      this.onChipClick = (e) => {
        const chip = e.target.closest(".vibe-terminal-chip");
        if (!chip) return;
        const cmd = chip.getAttribute("data-cmd");
        if (cmd) {
          this.inputEl.value = cmd;
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.execute(cmd);
          this.inputEl.value = "";
        }
      };
      const chipsContainer = container.querySelector(".vibe-terminal-quick-chips");
      chipsContainer.addEventListener("click", this.onChipClick);

      // 聚焦輸入框
      this.inputEl.focus();
    },

    execute(rawCmd) {
      if (!rawCmd) return;

      // 輸出使用者輸入行
      this.appendLine(`
        <div class="vibe-terminal-prompt">
          <span class="user">vibe@dev</span>:<span class="path">${this.currentDir}</span><span class="symbol"> % </span>
          <span style="color: #f0f6fc; font-weight: normal;">${this.escapeHtml(rawCmd)}</span>
        </div>
      `, "command");

      const trimmed = rawCmd.trim();
      const parts = trimmed.split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);

      // 指令模擬分派
      switch (command) {
        case "clear":
          this.outputEl.innerHTML = "";
          return;

        case "help":
          this.appendOutput(`
<span style="color: #58a6ff; font-weight: bold;">[Vibe Coder 內建指令速查]</span>
  <span style="color: #79c0ff;">help</span>                  顯示本指令說明列表
  <span style="color: #79c0ff;">pwd</span>                   顯示目前工作目錄 (Print Working Directory)
  <span style="color: #79c0ff;">ls [-la]</span>              列出目前目錄下的檔案與隱藏設定檔
  <span style="color: #79c0ff;">cat &lt;檔名&gt;</span>            查看純文字檔案內容 (例如: cat app.js)
  <span style="color: #79c0ff;">curl &lt;網址&gt;</span>           發送 HTTP 請求測試本地 API
  <span style="color: #79c0ff;">echo &lt;內容&gt;</span>           輸出文字或環境變數
  <span style="color: #79c0ff;">sudo apt update</span>       模擬 Linux 伺服器軟體庫清單更新
  <span style="color: #f85149;">sudo rm -rf /</span>         模擬刪除根目錄（觸發安全防護機制）
  <span style="color: #79c0ff;">clear</span>                 清空目前終端機螢幕
          `);
          break;

        case "pwd":
          this.appendOutput(`/Users/vibe-coder/projects/vibe-app`);
          break;

        case "ls":
          if (args.includes("-la") || args.includes("-l") || args.includes("-a")) {
            this.appendOutput(`
total 48
drwxr-xr-x   8 vibe  staff   256 Oct 25 10:14 .
drwxr-xr-x   4 vibe  staff   128 Oct 25 09:30 ..
-rw-r--r--   1 vibe  staff   142 Oct 25 10:02 .env
drwxr-xr-x  12 vibe  staff   384 Oct 25 10:11 .git
drwxr-xr-x 412 vibe  staff 13184 Oct 25 10:08 node_modules
-rw-r--r--   1 vibe  staff  1024 Oct 25 10:12 app.js
-rw-r--r--   1 vibe  staff   580 Oct 25 09:55 package.json
-rw-r--r--   1 vibe  staff  1820 Oct 25 09:40 README.md
            `);
          } else {
            this.appendOutput(`
<span style="color: #58a6ff;">node_modules</span>   <span style="color: #7ee787;">app.js</span>   package.json   README.md
            `);
          }
          break;

        case "cat":
          if (args[0] === "app.js") {
            this.appendOutput(`
<span style="color: #8b949e;">// app.js - 現代 Node.js 輕量 HTTP 伺服器</span>
<span style="color: #ff7b72;">import</span> express <span style="color: #ff7b72;">from</span> <span style="color: #a5d6ff;">'express'</span>;
<span style="color: #ff7b72;">const</span> app = express();
<span style="color: #ff7b72;">const</span> PORT = process.env.PORT || <span style="color: #79c0ff;">3000</span>;

app.use(express.json());

app.get(<span style="color: #a5d6ff;">'/'</span>, (req, res) =&gt; {
  res.json({
    status: <span style="color: #a5d6ff;">'ok'</span>,
    service: <span style="color: #a5d6ff;">'vibe-coder-backend'</span>,
    version: <span style="color: #a5d6ff;">'1.0.0'</span>,
    timestamp: Date.now()
  });
});

app.listen(PORT, () =&gt; {
  console.log(<span style="color: #a5d6ff;">\`🚀 伺服器已啟動於 http://localhost:\${PORT}\`</span>);
});
            `);
          } else if (args[0] === "package.json") {
            this.appendOutput(`
{
  <span style="color: #7ee787;">"name"</span>: <span style="color: #a5d6ff;">"vibe-app"</span>,
  <span style="color: #7ee787;">"version"</span>: <span style="color: #a5d6ff;">"1.0.0"</span>,
  <span style="color: #7ee787;">"type"</span>: <span style="color: #a5d6ff;">"module"</span>,
  <span style="color: #7ee787;">"scripts"</span>: {
    <span style="color: #7ee787;">"start"</span>: <span style="color: #a5d6ff;">"node app.js"</span>,
    <span style="color: #7ee787;">"dev"</span>: <span style="color: #a5d6ff;">"nodemon app.js"</span>
  },
  <span style="color: #7ee787;">"dependencies"</span>: {
    <span style="color: #7ee787;">"express"</span>: <span style="color: #a5d6ff;">"^4.19.2"</span>
  }
}
            `);
          } else if (!args[0]) {
            this.appendOutput(`cat: 請指定要檢視的檔案名稱，例如: cat app.js`, "error");
          } else {
            this.appendOutput(`cat: ${args[0]}: 找不到該檔案或目錄`, "error");
          }
          break;

        case "curl":
          const targetUrl = args[0] || "";
          if (targetUrl.includes("localhost:3000") || targetUrl.includes("127.0.0.1:3000")) {
            this.appendOutput(`
<span style="color: #8b949e;">* Connecting to localhost (127.0.0.1) port 3000...
* Connected to localhost port 3000
&gt; GET / HTTP/1.1
&gt; Host: localhost:3000
&gt; User-Agent: curl/8.4.0
&gt; Accept: */*
&lt; HTTP/1.1 200 OK
&lt; Content-Type: application/json; charset=utf-8
&lt; Content-Length: 98</span>

{
  <span style="color: #7ee787;">"status"</span>: <span style="color: #a5d6ff;">"ok"</span>,
  <span style="color: #7ee787;">"service"</span>: <span style="color: #a5d6ff;">"vibe-coder-backend"</span>,
  <span style="color: #7ee787;">"version"</span>: <span style="color: #a5d6ff;">"1.0.0"</span>,
  <span style="color: #7ee787;">"uptime"</span>: <span style="color: #79c0ff;">"42m"</span>
}
            `, "success");
          } else if (!targetUrl) {
            this.appendOutput(`curl: 缺少 URL 參數。用法：curl http://localhost:3000`, "error");
          } else {
            this.appendOutput(`curl: (7) Failed to connect to ${this.escapeHtml(targetUrl)} port 80: 連線逾時`, "error");
          }
          break;

        case "sudo":
          if (rawCmd.includes("rm -rf /") || rawCmd.includes("rm -rf /*")) {
            this.appendOutput(`
<div class="vibe-terminal-line warning" style="margin: 0.5rem 0;">
  <strong>🚨 系統重大安全防護攔截 (System Blocked):</strong><br>
  偵測到毀滅性指令 <code>sudo rm -rf /</code>！<br>
  在真實 Linux / macOS 系統中，這會強行遞迴抹除整顆系統硬碟的所有根目錄檔案與核心程式。<br>
  💡 <strong>Vibe Coder 防呆原則：</strong> 永遠不要在終端機中盲目貼上來路不明的 <code>sudo rm</code> 指令！
</div>
            `);
          } else if (rawCmd.includes("apt update")) {
            this.appendOutput(`
Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Hit:2 http://security.ubuntu.com/ubuntu jammy-security InRelease
Hit:3 http://archive.ubuntu.com/ubuntu jammy-updates InRelease
Reading package lists... Done
Building dependency tree... Done
All packages are up to date.
            `, "system");
          } else {
            this.appendOutput(`[sudo] 模擬環境提示：已授權執行管理員動作。`, "system");
          }
          break;

        case "echo":
          const echoText = args.join(" ").replace(/^["']|["']$/g, "");
          this.appendOutput(this.escapeHtml(echoText));
          break;

        case "whoami":
          this.appendOutput(`vibe-coder (uid=501 gid=20)`);
          break;

        case "node":
          if (args[0] === "-v" || args[0] === "--version") {
            this.appendOutput(`v20.11.0`);
          } else {
            this.appendOutput(`Node.js v20.11.0 (輸入 cat app.js 檢視範例程式碼)`);
          }
          break;

        case "git":
          if (args[0] === "status") {
            this.appendOutput(`
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
            `);
          } else {
            this.appendOutput(`git version 2.44.0 (請至單元 7-9 深入學習 Git Worktree 與版本控制)`);
          }
          break;

        case "ssh":
          this.appendOutput(`
<span style="color: #7ee787;">[SSH 安全通道]</span> 連線至遠端伺服器 (使用 Ed25519 金鑰認證)...
Authenticated with partial pubkey (id_ed25519)
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-31-generic x86_64)
* System load: 0.12  * Memory usage: 18%  * Disk usage: 12%
          `, "system");
          break;

        case "tmux":
          this.appendOutput(`
<span style="color: #58a6ff;">[tmux]</span> 已附加至背景長駐工作階段 [session 0: 1 windows (created Fri Oct 25 10:00:00 2026)]
💡 提示：使用 Ctrl+B 接著按 D 可中斷連線 (Detach)，背景程序仍將持續運行！
          `, "success");
          break;

        default:
          this.appendOutput(`zsh: command not found: ${this.escapeHtml(command)}。輸入 <span style="color: #58a6ff;">help</span> 可查看可用指令清單。`, "error");
          break;
      }

      // 自動捲動到底部
      this.scrollToBottom();
    },

    appendLine(html, type = "") {
      const line = document.createElement("div");
      line.className = `vibe-terminal-line ${type}`;
      line.innerHTML = html;
      this.outputEl.appendChild(line);
    },

    appendOutput(text, type = "output") {
      const line = document.createElement("div");
      line.className = `vibe-terminal-line ${type}`;
      line.innerHTML = text.trim();
      this.outputEl.appendChild(line);
    },

    scrollToBottom() {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    },

    escapeHtml(str) {
      return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    unmount(container) {
      if (this.inputEl && this.onKeyDown) {
        this.inputEl.removeEventListener("keydown", this.onKeyDown);
      }
      container.innerHTML = "";
    }
  };

  // 註冊至全域沙盒庫 (支援別名)
  window.VIBE_WIDGETS["terminal-widget"] = TerminalWidget;
  window.VIBE_WIDGETS["terminal"] = TerminalWidget;
  window.VIBE_WIDGETS["permissions-widget"] = TerminalWidget;
  window.VIBE_WIDGETS["ssh-widget"] = TerminalWidget;
  window.VIBE_WIDGETS["tmux-widget"] = TerminalWidget;
  window.VIBE_WIDGETS["workspace-widget"] = TerminalWidget;
})();
