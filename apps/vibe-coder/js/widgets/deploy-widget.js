// apps/vibe-coder/js/widgets/deploy-widget.js
// 雲端架構與部署平台決策推薦器 (Architecture & Deployment Recommender)

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const DeployWidget = {
    mount(container, props = {}) {
      this.container = container;

      // 選擇狀態
      this.state = {
        appType: "static", // 'static' | 'backend' | 'fullstack'
        dbType: "none",    // 'none' | 'sqlite' | 'postgres'
        budget: "zero"     // 'zero' | 'low' | 'scale'
      };

      container.innerHTML = `
        <div class="vibe-widget vibe-deploy-container" role="region" aria-label="部署架構決策推薦器">
          <!-- 頂部快速情境範本 -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.85rem; font-weight: 600;">選擇你的產品架構參數，即時產出最佳部署方案：</div>
            <div style="display: flex; gap: 0.4rem;">
              <button class="vibe-btn" data-preset="sideproject" style="font-size: 0.75rem;">⚡ 範本：個人免費靜態站</button>
              <button class="vibe-btn" data-preset="microbackend" style="font-size: 0.75rem;">🖥️ 範本：獨立 VPS 後端</button>
              <button class="vibe-btn" data-preset="saas" style="font-size: 0.75rem;">🚀 範本：全端 SaaS 原型</button>
            </div>
          </div>

          <!-- 三大維度選擇卡片 -->
          <div class="vibe-deploy-questions">
            <!-- 問題 1: 專案類型 -->
            <div class="vibe-deploy-q-card">
              <div class="vibe-deploy-q-title">1. 應用程式類型 (App Type)</div>
              <div class="vibe-deploy-option selected" data-q="appType" data-val="static">
                <span>📄 純靜態 HTML / SPA (React/Vue/純JS)</span>
              </div>
              <div class="vibe-deploy-option" data-q="appType" data-val="backend">
                <span>⚙️ 常駐後端 API (Node / Express / FastAPI)</span>
              </div>
              <div class="vibe-deploy-option" data-q="appType" data-val="fullstack">
                <span>⚡ 全端 SSR 框架 (Next.js / Nuxt / Remix)</span>
              </div>
            </div>

            <!-- 問題 2: 資料庫需求 -->
            <div class="vibe-deploy-q-card">
              <div class="vibe-deploy-q-title">2. 資料庫需求 (Database)</div>
              <div class="vibe-deploy-option selected" data-q="dbType" data-val="none">
                <span>🚫 無需資料庫 (靜態呈現或純呼叫第三方 API)</span>
              </div>
              <div class="vibe-deploy-option" data-q="dbType" data-val="sqlite">
                <span>📁 輕量單檔 SQLite (嵌入式極致低成本)</span>
              </div>
              <div class="vibe-deploy-option" data-q="dbType" data-val="postgres">
                <span>🐘 關聯式 PostgreSQL (支援連線池與向量搜尋)</span>
              </div>
            </div>

            <!-- 問題 3: 預算考量 -->
            <div class="vibe-deploy-q-card">
              <div class="vibe-deploy-q-title">3. 營運預算考量 (Monthly Budget)</div>
              <div class="vibe-deploy-option selected" data-q="budget" data-val="zero">
                <span>🎁 $0 零元起步 (善用免費額度與邊緣運算)</span>
              </div>
              <div class="vibe-deploy-option" data-q="budget" data-val="low">
                <span>💵 $4 ~ $10 / 月 (高性價比 VPS，成本完全受控)</span>
              </div>
              <div class="vibe-deploy-option" data-q="budget" data-val="scale">
                <span>🏢 $20+ / 月 (全代管託管、全球 CDN 與高可用備份)</span>
              </div>
            </div>
          </div>

          <!-- 即時推薦結果卡片 -->
          <div id="deployResult" class="vibe-deploy-result-card">
            <!-- 由 JavaScript 動態計算並注入 -->
          </div>
        </div>
      `;

      this.resultEl = container.querySelector("#deployResult");

      // 監聽選項點擊
      container.querySelectorAll(".vibe-deploy-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          const q = opt.getAttribute("data-q");
          const val = opt.getAttribute("data-val");

          // 更新同群組的選中樣式
          container.querySelectorAll(`.vibe-deploy-option[data-q="${q}"]`).forEach((el) => {
            el.classList.remove("selected");
          });
          opt.classList.add("selected");

          this.state[q] = val;
          this.calculateRecommendation();
        });
      });

      // 快速範本按鈕
      container.querySelectorAll("button[data-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const p = btn.getAttribute("data-preset");
          if (p === "sideproject") {
            this.setPreset("static", "none", "zero");
          } else if (p === "microbackend") {
            this.setPreset("backend", "sqlite", "low");
          } else if (p === "saas") {
            this.setPreset("fullstack", "postgres", "zero");
          }
        });
      });

      this.calculateRecommendation();
    },

    setPreset(appType, dbType, budget) {
      this.state = { appType, dbType, budget };
      this.container.querySelectorAll(".vibe-deploy-option").forEach((opt) => {
        const q = opt.getAttribute("data-q");
        const val = opt.getAttribute("data-val");
        if (this.state[q] === val) {
          opt.classList.add("selected");
        } else {
          opt.classList.remove("selected");
        }
      });
      this.calculateRecommendation();
    },

    calculateRecommendation() {
      const { appType, dbType, budget } = this.state;
      let title = "";
      let stackBadge = "";
      let cost = "";
      let why = "";
      let pros = [];
      let cons = [];

      if (appType === "static" && dbType === "none") {
        title = "Cloudflare Pages 或 GitHub Pages (全球邊緣靜態託管)";
        stackBadge = "Cloudflare Pages + 自動 HTTPS";
        cost = "$0 / 月 (永久免費無流量陷阱)";
        why = "純前端靜態站完全不需要租用伺服器！直接透過 Git 連結 Cloudflare Pages，享受全球 300+ 城市的 CDN 快取加速與抗 DDoS 保護。";
        pros = ["無限頻寬免費額度", "極速建置，推送 Git 即可自動部署", "內建免費 SSL 憑證與自訂網域名稱"];
        cons = ["無法運行伺服器端腳本或 Python/Node.js 背景進程"];
      } else if (budget === "low" || dbType === "sqlite" || appType === "backend") {
        if (budget === "zero" && appType === "backend") {
          title = "Render 或 Fly.io 免費方案 (搭配 Supabase 免費 PostgreSQL)";
          stackBadge = "Fly.io / Render + Supabase";
          cost = "$0 / 月 (初創期免費測試)";
          why = "想要 0 元驗證後端 API 與資料庫時的首選組合。";
          pros = ["零成本即可上線測試真實後端", "Supabase 提供直覺的資料表管理介面"];
          cons = ["Render 免費版閒置 15 分鐘會休眠，首次喚醒需等待 30-50 秒 (Cold Start)"];
        } else {
          title = "Hetzner Cloud VPS 搭配 Coolify (獨立私有 PaaS)";
          stackBadge = "Hetzner (€4/月) + Coolify (開源 PaaS) + Docker";
          cost = "約 $4.5 ~ $6 / 月 (性價比天花板)";
          why = "現代獨立開發者最強大的配置！只需一台超高性價比的 Hetzner VPS，安裝開源 Coolify，即可擁有如 Vercel/Heroku 般的 Git 點擊自動部署，還能在同一台主機掛載多個 Node/Python 後端與 SQLite/PostgreSQL 資料庫。";
          pros = ["成本死守每月幾美元，不用擔心無預警帳單暴增", "伺服器完全由你掌控，可隨意跑 Docker、Cron 背景排程", "極度適合搭配輕量 SQLite 單檔資料庫"];
          cons = ["需具備基本 Linux 終端機與 SSH 金鑰維護常識"];
        }
      } else if (appType === "fullstack") {
        if (budget === "zero") {
          title = "Vercel Hobby 方案 搭配 Neon Serverless Postgres";
          stackBadge = "Vercel + Neon DB + Cloudflare DNS";
          cost = "$0 / 月起步";
          why = "Next.js 的官方母公司託管平台，對 Serverless Functions 與 SSR 支援最無痛。";
          pros = ["零配置部署 Next.js", "自動邊緣快取與圖片最佳化", "Neon 提供極速無伺服器 PostgreSQL 分支功能"];
          cons = ["商業化商用需升級 Pro ($20/人/月)，超出免費頻寬計費昂貴"];
        } else {
          title = "Supabase 全代管後端 + Vercel 或 Coolify 自建主機";
          stackBadge = "Next.js SSR + Supabase Pro ($25/mo)";
          cost = "約 $20 ~ $30 / 月";
          why = "具備商業規模與客戶付款產品的穩健骨幹。擁有自動每日異地備份與獨立連線池。";
          pros = ["開箱即用 Auth 身份驗證、資料列安全 (RLS) 與即時 WebSocket", "高可用性與專屬支援團隊"];
          cons = ["每月固定開銷較高，適合有穩定現金流的產品"];
        }
      } else {
        title = "Cloudflare Workers / Pages + Supabase";
        stackBadge = "Cloudflare Edge + Supabase DB";
        cost = "$0 ~ $5 / 月";
        why = "極低延遲的現代邊緣架構，兼顧低成本與全球分發能力。";
        pros = ["全球冷啟動時間近乎為 0", "高彈性擴展"];
        cons = ["需適應 Serverless / Edge Runtime 的 API 限制"];
      }

      this.resultEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span class="vibe-badge success" style="margin-bottom: 0.4rem;">🏆 推薦部署架構方案</span>
            <h3 style="font-size: 1.1rem; color: #58a6ff; margin: 0.2rem 0;">${title}</h3>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #7ee787;">${cost}</div>
            <div style="font-size: 0.75rem; color: #8b949e;">${stackBadge}</div>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: #c9d1d9; line-height: 1.5; margin: 0.3rem 0;">
          ${why}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
          <div style="background: rgba(46, 160, 67, 0.1); border: 1px solid rgba(46, 160, 67, 0.3); border-radius: 4px; padding: 0.6rem 0.8rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #7ee787; margin-bottom: 0.3rem;">✓ 優勢亮點：</div>
            <ul style="margin: 0; padding-left: 1.1rem; font-size: 0.78rem; color: #c9d1d9; line-height: 1.4;">
              ${pros.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>

          <div style="background: rgba(248, 81, 73, 0.1); border: 1px solid rgba(248, 81, 73, 0.3); border-radius: 4px; padding: 0.6rem 0.8rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #f85149; margin-bottom: 0.3rem;">⚠️ 潛在限制與注意事項：</div>
            <ul style="margin: 0; padding-left: 1.1rem; font-size: 0.78rem; color: #c9d1d9; line-height: 1.4;">
              ${cons.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    },

    unmount(container) {
      container.innerHTML = "";
    }
  };

  window.VIBE_WIDGETS["deploy-widget"] = DeployWidget;
  window.VIBE_WIDGETS["deploy"] = DeployWidget;
  window.VIBE_WIDGETS["architecture-widget"] = DeployWidget;
})();
