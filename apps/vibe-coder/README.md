# Vibe Coder 指南 (apps/vibe-coder)

> ⚡ **AI 代理時代的軟體工程實戰手冊**
> 專為想用 AI Agent 打造產品的成人、職場工作者與獨立開發者（Solopreneur）設計。

---

## 專案定位

本系列與以國中小為主的 [`apps/tech-explorer`](file:///Users/scsnake/scripts/kids-portal/apps/tech-explorer) 區隔，採用現代開發者設計語彙（深色介面、等寬字型、程式碼與終端機雙欄沙盒），專注於：
1. **工具定位與環境邊界**：IDE、CLI、Shell 與 OS 權限。
2. **網路通訊與排錯**：前端、後端、DOM 操作與 Localhost 通訊埠。
3. **版本控制與開源**：Git 暫存區、開源授權條款、Git Worktree。
4. **遠端與安全**：SSH 公私鑰、tmux 背景常駐、Tailscale 私有網。
5. **AI 代理生態**：REST API、Bearer 權杖、Skills 與 Model Context Protocol (MCP)。
6. **應用發布與雲端**：Web vs 原生 App、靜態託管 vs Coolify 容器、Docker、DNS/TLS。
7. **品質驗證與收費**：Playwright 自動化測試、Stripe vs 紀錄商家 (MoR)、Webhook 簽章驗證、商業法規。

---

## 7 大軌道與 22 個實戰單元

```
軌道 1: 現代開發者工作台 (Units 1-3)
├── 1. IDE vs CLI vs 桌面應用程式
├── 2. 終端機與 Shell 核心概念 (zsh, bash, pipe)
└── 3. 系統權限與防呆 (Mac, Linux, sudo 與 root 風險)

軌道 2: 用戶端、伺服器與瀏覽器核心 (Units 4-6)
├── 4. 前端 vs 後端 vs 資料庫 (三層架構與資料流)
├── 5. 瀏覽器內部與 DevTools 實戰 (DOM 操作與 Console 執行)
└── 6. 本地伺服器與通訊埠 (Localhost, 127.0.0.1, Port 衝突與 kill -9)

軌道 3: 版本控制與程式碼衛生 (Units 7-9)
├── 7. Git 核心基礎 (Commit, Push, Pull, Status 與暫存區)
├── 8. 遠端儲存庫與開源授權 (Public vs Private, 金鑰防洩漏, MIT/Apache/GPL)
└── 9. 分支協作與 Git Worktree (分支切換、PR、平行多工工作樹)

軌道 4: 遠端系統與安全網路 (Units 10-11)
├── 10. 遠端登入與安全金鑰 (SSH 公私鑰、authorized_keys)
└── 11. 背景常駐與私有連線 (tmux 長期會話、Tailscale 內網)

軌道 5: AI 擴充生態與代理通訊協定 (Units 12-14)
├── 12. 應用程式介面與 JSON (REST API, HTTP Methods, Headers, Payload)
├── 13. 機器認證與憑證安全 (API Key, Bearer Token, OAuth, .env 與限速)
└── 14. AI 代理擴充協定 (Skills, Model Context Protocol MCP, Plugins, 工具呼叫)

軌道 6: 應用程式封裝與雲端發布 (Units 15-18)
├── 15. 應用程式形態與架構 (Web App, PWA, 跨平台原生 App, App Store 規範)
├── 16. 現代部署去處選擇 (Cloudflare Pages vs Coolify 容器 vs 獨立 VPS)
├── 17. 容器化技術入門 (Dockerfile, 映像檔 vs 容器, Port 對應, Volumes)
└── 18. 網域名稱、DNS 與 TLS 加密 (A/CNAME 紀錄, DNS 解析, HTTPS 與憑證)

軌道 7: 品質驗證、金流安全與商業法規 (Units 19-22)
├── 19. 端對端自動化測試 (Playwright, 無頭瀏覽器 Headless, 選擇器與斷言)
├── 20. 軟體收費與金流模式 (金流閘道 Stripe vs 紀錄商家 MoR 如 Paddle / Lemon Squeezy, 全球稅務)
├── 21. 交易安全性與 Webhook (信用卡代碼化 Token, Webhook 簽章驗證, 冪等性)
└── 22. 商業合規與上線準備 (隱私權政策, 服務條款, 退款法規與責任免責)
```

---

## 本地預覽

在專案根目錄下已有 HTTP 伺服器運行於 `8765` 埠：

```sh
# 開啟瀏覽器訪問
open http://localhost:8765/apps/vibe-coder/
```

或從 Portal 預覽：
```sh
open http://localhost:8765/portal/
```
