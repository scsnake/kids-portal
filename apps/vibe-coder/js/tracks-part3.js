// apps/vibe-coder/js/tracks-part3.js
// Vibe Coder 軌道 6 與 7：應用程式封裝、雲端發布、品質驗證與金流商業法規 (單元 15 ~ 22)

(function () {
  const TRACKS_PART_3 = [
    // -------------------------------------------------------------
    // 軌道 6: 應用程式封裝與雲端發布 (Units 15 ~ 18)
    // -------------------------------------------------------------
    {
      id: "app-targets",
      trackId: "track-6",
      trackTitle: "應用程式封裝與雲端發布",
      unitNumber: 15,
      title: "應用程式形態與架構選型",
      subtitle: "評估 Web App、PWA 與跨平台原生 App 的開發成本、通路限制與 30% 平台抽成",
      readingTime: "7 分鐘",
      prerequisites: ["前端 HTML/CSS/JS 基礎", "現代瀏覽器運作概念"],
      coreConcepts: [
        {
          title: "Web App 響應式網頁：MVP 驗證的最高效起點",
          description: "Web App 以現代瀏覽器為執行載體。透過 CSS Media Queries 與彈性排版，同一套程式碼能無縫適應桌機、平板與智慧型手機螢幕。對獨立開發者而言，Web App 具備零門檻分發的巨大優勢。你不需要等待應用程式商店審查，推送程式碼後所有使用者即可立即使用最新版本。",
          points: [
            "發布零審查延遲：部署即上線，修復重大錯誤只需數秒鐘。",
            "跨平台覆蓋率最高：只要有瀏覽器就能執行，不受 iOS 或 Android 系統限制。",
            "使用者轉換漏斗極短：只需點擊超連結即可體驗，無需下載數十 MB 的安裝檔。"
          ]
        },
        {
          title: "PWA 漸進式網頁應用：繞過商店抽成的利器",
          description: "PWA 是在 Web App 基礎上擴充的現代標準。透過設定 Web App Manifest 資訊清單與註冊 Service Worker 腳本，網頁能具備如原生 App 般的離線快取、背景推播通知以及「加到手機主畫面」全螢幕執行功能。PWA 完全繞過 App Store 的 30% 數位商品抽成，適合訂閱制 SaaS 工具。",
          points: [
            "主畫面獨立圖示：免經商店安裝，手機桌面直接擁有專屬啟動圖示。",
            "離線快取機制：Service Worker 能攔截網路請求，無網路時依然可檢視快取內容。",
            "百分之百收益保留：直接在網頁完成金流交易，無需支付 15% 至 30% 的應用程式商店稅。"
          ]
        },
        {
          title: "跨平台原生封裝：Capacitor 與 React Native",
          description: "當產品需要調用底層硬體（如藍牙裝置配對、背景精準 GPS 追蹤、離線資料庫 SQLite）或必須在應用程式商店建立品牌信任感時，原生封裝是必經之路。Capacitor 能將既有 Web 前端打包進原生 WebView 容器；React Native 或 Flutter 則將邏輯編譯至原生 UI 元件，提供極致的操作流暢度。",
          points: [
            "Capacitor：現有 Web 專案零重構封裝，一鍵生成 Xcode 與 Android Studio 專案。",
            "底層硬體存取：透過標準外掛程式呼叫相機、感測器、原生通知與安全憑證金鑰庫。",
            "雙商店通路：登上 Apple App Store 與 Google Play，獲取關鍵搜尋流量與平台推薦。"
          ]
        },
        {
          title: "App Store 審查規則與「蘋果稅」經濟學",
          description: "上架行動應用程式商店必須遵守嚴苛審核指南（如 Apple App Store Review Guidelines）。針對數位虛擬服務、付費功能解鎖與雲端訂閱，Apple 強制要求接入 In-App Purchase（IAP）內購系統，並抽取 15% 至 30% 的營收抽成。獨立開發者必須擬定清晰商業策略，避免違規遭到下架下架或帳號停權。",
          points: [
            "蘋果稅抽成結構：年營收 100 萬美元以下適用小型企業方案（15%），超過則為 30%。",
            "禁止外部付款連結：在 iOS App 介面內放置外部 Stripe 信用卡付款連結會被直接駁回。",
            "閱讀器模式（Reader Apps）策略：App 內只提供既有帳號登入與使用，引導使用者至官方網站註冊付費。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "未經市場驗證便急於開發雙平台原生 App",
          why: "新手開發者常誤以為「沒有 App 就沒有真實使用者」。投入數個月配置 iOS 憑證、解決 Android 機型碎片化相容性，上線後才發現核心功能無人問津，浪費寶貴開發週期。",
          fix: "嚴格遵循「Web App 優先」原則。先以響應式網頁驗證付費意願，累積前 100 位活躍付費用戶後，再評估是否透過 Capacitor 進行低成本原生封裝。"
        },
        {
          title: "在 iOS App 內明目張膽引導使用者至外部網頁付款",
          why: "為避開 30% 抽成，許多開發者在 iOS App 的購買按鈕旁標註「請前往官網購買享受 8 折優惠」並附上外部超連結，這直接踩到審核指南 3.1.1 紅線而遭審核人員退件。",
          fix: "若不想串接 IAP，iOS 端應定位為「配套體驗工具」。App 內僅保留「登入既有帳號」入口，不出現任何引導購買或促銷文字，所有新用戶訂閱行為均在桌面端官網獨立完成。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "npm install @capacitor/core @capacitor/cli", desc: "安裝 Capacitor 核心套件與命令列工具" },
        { cmd: "npx cap init", desc: "初始化 Capacitor 專案配置 (設定 App 名稱與 Package ID)" },
        { cmd: "npx cap add ios && npx cap add android", desc: "在現有前端專案中建立 iOS 與 Android 原生工程目錄" },
        { cmd: "npx cap sync", desc: "將最新 Web 打包建置產物同步至原生專案工作目錄" },
        { cmd: "npx cap open ios", desc: "以 macOS Xcode 開啟 iOS 原生專案進行模擬器測試與打包簽署" }
      ],
      widgetId: "deploy-widget",
      widgetProps: { mode: "targets" },
      quiz: [
        {
          question: "獨立開發者想開發一款提供文字摘要的 AI 工具，初期預算有限且希望每週快速迭代更新功能。下列哪一種架構形態最合適？",
          options: [
            "直接使用 Swift 開發純原生 iOS App，上架 App Store",
            "採用響應式 Web App (或 PWA)，部署至邊緣雲端平台",
            "使用 C++ 撰寫跨平台桌面原生軟體",
            "直接委託外包團隊客製 Android APK 安裝檔供使用者手動下載"
          ],
          answer: 1,
          explanation: "Web App/PWA 具備零審查延遲、跨裝置支援與零商店抽成特點。開發者能即時發布更新並驗證商業模式，是初期最佳選型。"
        },
        {
          question: "當你的應用程式在 iOS App Store 審查時，下列哪項做法最容易導致被審核團隊直接駁回（Reject）？",
          options: [
            "支援 Dark Mode 深色外觀切換",
            "在軟體中提供登入既有企業帳號的輸入框",
            "銷售數位會員訂閱，卻在按鈕點擊後彈出外部 Stripe 網頁信用卡付款視窗",
            "使用 Capacitor 打包 Web 程式碼"
          ],
          answer: 2,
          explanation: "Apple 審查指南規定，凡是在 iOS App 內銷售解鎖數位功能或會員訂閱，皆必須接入 Apple In-App Purchase，嚴格禁止繞道至外部付款連結。"
        }
      ]
    },

    {
      id: "cloud-deployment",
      trackId: "track-6",
      trackTitle: "應用程式封裝與雲端發布",
      unitNumber: 16,
      title: "現代部署去處選擇與架構評估",
      subtitle: "比較靜態託管、自架容器 PaaS 與獨立 VPS，找到成本、效能與維運的最佳平衡點",
      readingTime: "8 分鐘",
      prerequisites: ["終端機基礎操作", "Git 版本控制概念"],
      coreConcepts: [
        {
          title: "邊緣靜態託管：Cloudflare Pages 與 Vercel",
          description: "靜態前端託管將預先編譯好的 HTML、CSS 與 JavaScript 部署在全球數百個邊緣節點（CDN）。當使用者存取時，系統會由地理位置最近的機房直接回應快取內容，達成毫秒級載入速度。此類平台提供與 Git 儲存庫深度整合的 CI/CD 管線，每次 git push 均可自動建置並生成獨立預覽網址。",
          points: [
            "全球 Anycast CDN：毫秒級靜態檔案回應，抵禦大規模 DDoS 網路攻擊。",
            "免運維高可用性：完全不需要管理伺服器作業系統、通訊埠或安全補丁。",
            "慷慨免費額度：Cloudflare Pages 提供無上限頻寬，Vercel 適合 Next.js 深度整合生態。"
          ]
        },
        {
          title: "自架現代 PaaS 平台：Coolify 與開源自由度",
          description: "Coolify 被譽為開源自架版 Heroku。只要在一台平價的 Linux VPS（如 Hetzner）上執行單行指令安裝 Coolify，就能透過優雅的 Web 儀表板管理無上限的 Docker 容器、Node.js/Python 伺服器與 PostgreSQL 資料庫。它具備商業 PaaS 的極致開發體驗，卻省去昂貴的按資源計費溢價。",
          points: [
            "擺脫雲端廠商綁定：完全掌控底層伺服器，資料儲存在自己的硬碟上。",
            "自動化 SSL 憑證：整合 Let's Encrypt，網域設定完成自動頒發 HTTPS 憑證。",
            "固定低廉主機成本：每月只需支付 VPS 基礎主機費用，隨意部署數十個小專案。"
          ]
        },
        {
          title: "獨立雲端虛擬伺服器：Hetzner、AWS 與 DigitalOcean",
          description: "獨立 VPS 提供完整的 Linux root 管理員權限，讓開發者擁有最高級別的客製自由。歐洲雲端廠商 Hetzner 以極高的運算性價比聞名，僅需數歐元即可獲得多核心 CPU 與高速 NVMe 硬碟；AWS EC2 則適合需要接入複雜雲端生態（如 S3、SQS、RDS）的企業級工作負載。",
          points: [
            "純粹的 root 控制權：自由安裝任何軟體、設定自訂防火牆 iptables 與微調核心參數。",
            "自主備份與快照：支援整機快照與跨區域異地備份，確保災難復原能力。",
            "自我維護責任：必須自行承擔作業系統安全更新、SSH 防護與防範暴力破解責任。"
          ]
        },
        {
          title: "AI 專案部署選型決策矩陣",
          description: "選擇部署方案時應依據「運算狀態」與「資料持久化需求」進行拆解。前端單頁應用（SPA）與靜態網站首選 Cloudflare Pages；需要執行長期背景工作、存取資料庫或自架開源 LLM 推論服務的後端專案，則推薦選擇 VPS 搭配 Coolify 或 Docker Compose 架構。",
          points: [
            "純前端 / AI API 轉發：Cloudflare Pages + Cloudflare Workers (免費且快)。",
            "全端應用 + 關聯式資料庫：Hetzner VPS + Coolify (高性價比、易管理)。",
            "長期非同步任務 / GPU 運算：專屬 GPU 主機 (如 RunPod) 或獨立雲端虛擬機。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "將全端包含本機 SQLite 資料庫的專案部署至無伺服器（Serverless）環境",
          why: "無伺服器環境（如 Vercel Serverless Functions）是無狀態且短暫存活的。每次函式執行完畢容器即遭凍結或銷毀，寫入本機磁碟的 SQLite 資料庫檔案將在下一次冷啟動時完全消失。",
          fix: "若專案依賴 SQLite，請將程式部署在具備持久化硬碟的 VPS 上（或搭配 Litestream 進行即時 S3 備份），或改用專門的雲端無伺服器資料庫（如 Cloudflare D1 或 Supabase）。"
        },
        {
          title: "使用 AWS 預設配置忘記釋放閒置資源導致帳單暴增",
          why: "AWS 的計費項目極其細碎。例如建立 Elastic IP 後若未綁定執行個體、或忘記關閉 NAT Gateway，即使伺服器關機仍會持續產生按小時計費的閒置費用。",
          fix: "獨立開發者剛起步時建議優先使用固定月費制 VPS（如 Hetzner 或 Linode）。若使用 AWS，請在第一天就設定 CloudWatch 預算警報（Budget Alerts），於扣款達 1 美元時即時以電子郵件通知。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash", desc: "在全新 Ubuntu/Debian VPS 上單行指令自動安裝 Coolify PaaS 平台" },
        { cmd: "npx wrangler pages deploy ./dist", desc: "使用 Cloudflare 官方 CLI 工具將前端產物直推至 Cloudflare Pages" },
        { cmd: "ssh-copy-id -i ~/.ssh/id_ed25519.pub root@<伺服器IP>", desc: "將本地 SSH 公鑰安裝至遠端 VPS 伺服器以啟用免密碼金鑰登入" },
        { cmd: "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable", desc: "在 Ubuntu 上配置並啟用基礎防火牆，僅放行 SSH、HTTP 與 HTTPS" }
      ],
      widgetId: "deploy-widget",
      widgetProps: { mode: "cloud" },
      quiz: [
        {
          question: "你正在開發一個基於 Vue.js 的純前端靜態單元工具，不包含任何後端資料庫，只透過前端呼叫 OpenAI API。下列哪一個部署方案最具性價比且維運負擔最低？",
          options: [
            "租用一台高規格 AWS EC2 伺服器並手動安裝 Nginx",
            "使用 Cloudflare Pages 進行 Git 關聯自動化持續部署",
            "購買實體機房伺服器並申請固定 IP 專線",
            "在本地電腦透過動態網域名稱解析 (DDNS) 24 小時開機分享"
          ],
          answer: 1,
          explanation: "純前端靜態專案使用 Cloudflare Pages 可享受全球邊緣節點加速、免費 SSL 與無限流量頻寬，完全無需維護作業系統與伺服器。"
        },
        {
          question: "使用開源 PaaS 工具 Coolify 的核心價值在於下列何者？",
          options: [
            "它可以替你代寫所有後端程式碼與前端樣式",
            "它能在自己的 VPS 上提供類似 Heroku 的現代 Web 管理介面與自動部署 Docker 容器",
            "它保證免去所有網際網路頻寬與主機租用費用",
            "它會自動將 Python 程式碼編譯成純硬體晶片電路"
          ],
          answer: 1,
          explanation: "Coolify 讓開發者在平價的自備 VPS 上獲得如商業 PaaS 般的優雅部署體驗，支援 Git 自動觸發、Docker 容器管理與 SSL 自動設定。"
        }
      ]
    },

    {
      id: "docker-basics",
      trackId: "track-6",
      trackTitle: "應用程式封裝與雲端發布",
      unitNumber: 17,
      title: "容器化技術入門與 Docker 實戰",
      subtitle: "將程式碼、執行環境與系統相依封裝成標準貨櫃，徹底消滅「在我電腦上能跑」的困境",
      readingTime: "8 分鐘",
      prerequisites: ["終端機命令列基礎", "應用程式伺服器概念"],
      coreConcepts: [
        {
          title: "容器（Container）與映像檔（Image）的本質差異",
          description: "Docker 映像檔是唯讀的靜態模板，包含應用程式碼、執行環境（如 Node.js、Python）、系統函式庫與設定檔；而容器是映像檔啟動後的動態執行個體。容器透過 Linux 核心的 Namespaces 與 Cgroups 技術達成行程與資源隔離，共享主機作業系統核心，啟動速度比傳統虛擬機（VM）快上數十倍且記憶體開銷極低。",
          points: [
            "映像檔（Image）：軟體的唯讀藍圖，具備不可變性與可重複分發特性。",
            "容器（Container）：藍圖實體化後的隔離沙盒，具備獨立的檔案層與行程空間。",
            "輕量高密度：不需要模擬整套硬體 BIOS 與虛擬作業系統，秒級重啟恢復。"
          ]
        },
        {
          title: "Dockerfile 撰寫黃金準則與多階段建置",
          description: "Dockerfile 是用來定義如何建置映像檔的文字腳本。編寫時應注意 Docker 的分層快取（Layer Caching）機制：將變動頻率低的指令（如安裝依賴套件）放在上方，將變動頻繁的程式碼複製指令放在下方。此外，利用多階段建置（Multi-stage Builds）可在建置階段使用完整編譯工具，最終產物只提取精簡二進位檔或靜態資源，大幅壓縮映像檔體積。",
          points: [
            "基礎映像檔精簡化：優先選擇 alpine 或 slim 標籤，縮減容量與潛在弱點。",
            "分層快取優化：先複製 package.json 執行 npm install，再複製其餘原始碼。",
            "多階段建置：分離編譯環境與執行環境，建構輕盈且安全的生產映像檔。"
          ]
        },
        {
          title: "通訊埠對應（Port Mapping）：打通內外網路橋樑",
          description: "Docker 容器預設處於隔離的虛擬橋接網路（bridge network）中，外部主機無法直接存取容器內部服務。使用 `-p 主機通訊埠:容器通訊埠` 指令可以建立通訊埠轉發規則。記住關鍵口訣：「冒號左側是外部主機的通訊埠，冒號右側是容器內部程式監聽的通訊埠」。",
          points: [
            "語法結構：`-p 8080:80` 代表使用者連線主機 8080，請求會被轉發給容器內的 80。",
            "解決衝突：多個容器即使在內部都監聽 3000 埠，只要對應到主機不同通訊埠即可並存。",
            "內部互通：使用 Docker 建立自訂網路時，容器間可直接透過容器名稱作為網域名稱通訊。"
          ]
        },
        {
          title: "資料持久化與資料卷（Volumes）",
          description: "容器本質上是無狀態且具備拋棄性的（Ephemeral）。若容器異常終止或刪除，容器寫入層的資料會一併遺失。為了安全儲存資料庫檔案、使用者上傳素材或系統日誌，必須使用 Docker Volume 或 Bind Mount 將主機磁碟目錄掛載至容器內部特定路徑，確保資料獨立於容器生命週期。",
          points: [
            "具名資料卷（Named Volumes）：由 Docker 統一在主機安全路徑管理，最適合資料庫。",
            "綁定掛載（Bind Mounts）：直接將本地指定資料夾掛載進容器，適合本機開發時即時同步程式碼。",
            "生命週期分離：更新或刪除容器時，資料卷的資料完好無損，重新掛載即可接續運作。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "忘記掛載 Volume，更新資料庫容器後資料全數蒸發",
          why: "在 Docker 中直接執行 PostgreSQL 或 MySQL 容器，未透過 `-v` 宣告資料持久化目錄。當拉取新映像檔並重建容器時，舊容器的寫入層被直接刪除，所有使用者資料庫資料永久遺失。",
          fix: "生產環境部署任何資料庫容器時，必須明確宣告 Volume，例如 `-v pg_data:/var/lib/postgresql/data`，並設定定期遠端自動備份機制。"
        },
        {
          title: "通訊埠對應（Port Mapping）方向顛倒導致網頁無法存取",
          why: "容器內部 Node.js 監聽 3000，開發者在命令列執行 `docker run -p 3000:80`，把主機的 3000 埠對應到容器內不存在的 80 埠，導致瀏覽器瀏覽 http://localhost:3000 顯示連線被拒絕。",
          fix: "牢記語法 `-p <主機開放通訊埠>:<容器內部程式通訊埠>`。在此案例中正確參數應為 `-p 3000:3000` 或 `-p 8080:3000`。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "docker build -t my-app:v1 .", desc: "根據當前目錄的 Dockerfile 建置標籤為 my-app:v1 的映像檔" },
        { cmd: "docker run -d -p 8080:3000 --name web-prod -v app_data:/data my-app:v1", desc: "在背景啟動容器、映射通訊埠、命名容器並掛載持久化資料卷" },
        { cmd: "docker ps -a", desc: "列出主機上所有正在執行與已停止的容器狀態資訊" },
        { cmd: "docker logs -f --tail 100 <容器名稱或ID>", desc: "即時追蹤容器最新輸出的 100 行標準輸出日誌" },
        { cmd: "docker exec -it <容器名稱> /bin/sh", desc: "進入正在執行的容器內部終端機進行即時除錯與環境檢查" }
      ],
      widgetId: "deploy-widget",
      widgetProps: { mode: "docker" },
      quiz: [
        {
          question: "你編寫了一個後端 Node.js 程式，程式碼內部監聽 `port 3000`。你希望外部使用者透過瀏覽器瀏覽伺服器的 `http://IP:8080` 能夠成功造訪。在執行 `docker run` 時應使用下列哪一個通訊埠參數？",
          options: [
            "-p 3000:8080",
            "-p 8080:3000",
            "-p 8080",
            "--expose 3000:8080"
          ],
          answer: 1,
          explanation: "Docker 通訊埠映射語法為 -p <主機通訊埠>:<容器通訊埠>。外部使用者連線 8080，轉發給容器內監聽的 3000，因此為 -p 8080:3000。"
        },
        {
          question: "在 Dockerfile 中使用「多階段建置（Multi-stage Builds）」的主要目的是什麼？",
          options: [
            "讓容器同時執行 Windows 與 Linux 雙作業系統",
            "分離建置工具與最終執行環境，大幅縮減映像檔體積並提升安全性",
            "自動增加 CPU 核心數以提升網路頻寬",
            "強制停用所有 JavaScript 語法以避免記憶體洩漏"
          ],
          answer: 1,
          explanation: "多階段建置可讓你在第一個階段使用肥大的建置依賴環境編譯程式，最後只將編譯完成的純淨產物複製到超輕量的執行映像檔中，顯著減小映像檔大小。"
        }
      ]
    },

    {
      id: "dns-domains",
      trackId: "track-6",
      trackTitle: "應用程式封裝與雲端發布",
      unitNumber: 18,
      title: "網域名稱、DNS 解析與 TLS 傳輸加密",
      subtitle: "掌握 A/CNAME 紀錄解析、DNS 傳播機制與 Let's Encrypt 自動續簽 SSL/TLS 憑證",
      readingTime: "7 分鐘",
      prerequisites: ["用戶端與伺服器網路基礎", "雲端伺服器 IP 位址概念"],
      coreConcepts: [
        {
          title: "網域名稱系統（DNS）的全球階層查詢流程",
          description: "網域名稱系統（DNS）如同網際網路的全球電話簿，負責將人類好記的字串（如 `api.example.com`）轉換為電腦通訊所需的 IP 位址（如 `192.0.2.1`）。當瀏覽器發起查詢時，會依序向本地 DNS 快取、根名稱伺服器（Root Server）、頂級網域伺服器（TLD Server）與權威名稱伺服器（Authoritative Name Server）進行階層式遞迴解析。",
          points: [
            "遞迴查詢：由網際網路服務業者（ISP）或公共 DNS（如 1.1.1.1、8.8.8.8）代為向全球層級伺服器查詢位址。",
            "TTL 快取存活時間（Time To Live）：決定各地快取伺服器保留該筆查詢紀錄的秒數，數值越短更新生效越快。",
            "全球傳播延遲：修改 DNS 紀錄後，因各級節點 TTL 快取尚未過期，通常需等待數分鐘至數小時全面生效。"
          ]
        },
        {
          title: "核心 DNS 紀錄型態：A 紀錄 vs CNAME 紀錄",
          description: "在 DNS 託管面板中最常操作的是 A 紀錄與 CNAME 紀錄。A（Address）紀錄直接將網域指向具體的 IPv4 位址；AAAA 紀錄則指向 IPv6 位址；CNAME（Canonical Name）紀錄則是別名指派，將子網域指向另一個正規網域名稱（由目標網域名稱負責最終 IP 解析）。",
          points: [
            "A 紀錄：直接綁定單一固定 IP，適合自備獨立雲端 VPS 伺服器。",
            "CNAME 紀錄：將子網域別名指向雲端平台提供的網址（如 cname.vercel-dns.com），最適合現代託管平台。",
            "根網域（Apex Domain）限制：標準 RFC 規定根網域（@）不可設定 CNAME，現代託管商（如 Cloudflare）透過 CNAME Flattening 技術克服此限制。"
          ]
        },
        {
          title: "SSL / TLS 傳輸層加密與 HTTPS 握手機制",
          description: "傳統 HTTP 以明文傳輸資料，同網段的中間人（MITM）可輕易竊聽帳號密碼或竄改傳輸內容。HTTPS 即 HTTP over TLS，在傳輸前進行非對稱金鑰握手交換，協商出對稱金鑰對所有資料封包進行端對端高強度加密。數位憑證則由全球信任的憑證授權單位（CA）數位簽名，證明伺服器真偽。",
          points: [
            "端對端隱密性：第三方截獲資料封包只能看到亂碼，有效保護密碼、Cookie 與金流權杖。",
            "身分防偽認證：瀏覽器透過 CA 信任鏈驗證憑證有效性，防止使用者連線至釣魚冒名伺服器。",
            "現代瀏覽器硬性要求：若未使用 HTTPS，瀏覽器會標記為「不安全」並阻擋攝影機、定位與安全 Cookie 存取。"
          ]
        },
        {
          title: "Let's Encrypt 與 ACME 自動憑證續簽",
          description: "過去購買 SSL 憑證費用昂貴且需手動每年重新申請安裝。開源憑證機構 Let's Encrypt 透過 ACME 協定開創了自動化時代。伺服器安裝 Certbot 或現代反向代理（如 Caddy、Traefik），軟體會在憑證到期前自動向 Let's Encrypt 發起 HTTP-01 或 DNS-01 挑戰驗證網域擁有權，自動簽發並安裝 90 天有效期的免費憑證，達成終身免維運。",
          points: [
            "ACME 協定挑戰：透過在網站根目錄提供隨機字串（HTTP 挑戰）或更新 TXT 紀錄（DNS 挑戰）自動完成所有權驗證。",
            "自動定時排程：系統排程工具每日偵測，若憑證低於 30 天則無縫在背景完成續約刷新。",
            "Cloudflare 一鍵邊緣憑證：使用 Cloudflare 代理時，可開啟邊緣 Universal SSL 獲得自動加密保護。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "Cloudflare SSL 模式設定為 Flexible 導致「重新導向次數過多（Redirect Loop）」",
          why: "在 Cloudflare 面板將 SSL 設定為 Flexible 時，Cloudflare 與瀏覽器之間使用 HTTPS，但 Cloudflare 與你的原始伺服器之間卻走明文 HTTP。若你的伺服器（Nginx 或 Apache）強制要求全站轉向 HTTPS，源站會不斷回傳 301 重新導向給 Cloudflare，引發無窮轉址迴圈。",
          fix: "源站伺服器透過 Let's Encrypt 取得憑證後，在 Cloudflare 後台將 SSL/TLS 加密模式切換為「Full」或「Full (Strict)」，確保端對端全程以 HTTPS 加密傳輸。"
        },
        {
          title: "修改 DNS 紀錄未注意長 TTL 導致切換伺服器時長時間服務中斷",
          why: "原先的 A 紀錄將 TTL 設為預設的 86400 秒（24 小時）。在切換雲端機房時更改 IP，全球大量用戶因本地 DNS 快取未過期，長達整整一天仍持續連線至已下線的舊伺服器。",
          fix: "在進行任何預定的伺服器遷移或 IP 變更前 24 小時，提前將 DNS 紀錄的 TTL 調降至 300 秒（5 分鐘）。完成遷移且一切運作正常後，再將 TTL 調整回預設數值。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "dig A api.example.com +short", desc: "使用 dig 工具查詢指定網域解析的 IPv4 位址（適合 Linux/macOS 終端機）" },
        { cmd: "nslookup -type=CNAME app.example.com 8.8.8.8", desc: "向 Google 公共 DNS 伺服器指定查詢 CNAME 別名紀錄" },
        { cmd: "curl -Iv https://example.com", desc: "以詳細模式檢查網站 HTTPS 連線狀態、TLS 握手細節與 SSL 憑證簽發者" },
        { cmd: "sudo certbot --nginx -d example.com -d www.example.com", desc: "使用 Certbot 自動偵測 Nginx 設定並完成 Let's Encrypt 憑證申請與自動重載" }
      ],
      widgetId: "deploy-widget",
      widgetProps: { mode: "dns" },
      quiz: [
        {
          question: "你希望將你的子網域 `shop.mybrand.com` 指向第三方託管服務商提供的 `mybrand.myshopify.com`。你應該在 DNS 控制台新增下列哪一種紀錄類型？",
          options: [
            "A 紀錄",
            "TXT 紀錄",
            "CNAME 紀錄",
            "MX 紀錄"
          ],
          answer: 2,
          explanation: "CNAME（標準名稱）紀錄用於建立網域名稱別名，將一個子網域名稱直接指向另一個現存的網域名稱。"
        },
        {
          question: "當使用者造訪你的 HTTPS 網站時，瀏覽器為什麼能夠信任你的伺服器所出示的 SSL/TLS 憑證？",
          options: [
            "因為該憑證是由電腦硬體廠商在出廠時焊死在主機板上的",
            "因為該憑證由作業系統內建受信任的憑證授權單位（CA）透過數位簽章鏈完成背書驗證",
            "因為網站網址以 www 開頭，國際標準組織規定 www 網址皆自動具備信任等級",
            "因為使用者本地電腦的防毒軟體會即時解密該憑證的伺服器私鑰"
          ],
          answer: 1,
          explanation: "現代作業系統與瀏覽器內建受信任的根憑證授權單位（Root CA）清單。瀏覽器透過驗證憑證鏈上的數位簽章，確認伺服器憑證真偽。"
        }
      ]
    },

    // -------------------------------------------------------------
    // 軌道 7: 品質驗證、金流安全與商業法規 (Units 19 ~ 22)
    // -------------------------------------------------------------
    {
      id: "playwright-testing",
      trackId: "track-7",
      trackTitle: "品質驗證、金流安全與商業法規",
      unitNumber: 19,
      title: "端對端自動化測試與 Playwright 實戰",
      subtitle: "用程式碼驅動無頭瀏覽器模擬真實使用者操作，在上線前自動抓出致命業務邏輯缺陷",
      readingTime: "7 分鐘",
      prerequisites: ["JavaScript 基本語法", "網頁 DOM 元素與選擇器概念"],
      coreConcepts: [
        {
          title: "測試金字塔與端對端（E2E）測試的關鍵價值",
          description: "在軟體品質工程中，測試金字塔由底部的單元測試（Unit Test）、中層的整合測試（Integration Test）以及頂層的端對端測試（E2E Test）組成。E2E 測試啟動真實瀏覽器引擎，直接模擬真實使用者的操作流程（如：開啟首頁 -> 搜尋商品 -> 加入購物車 -> 填寫地址 -> 點擊結帳）。它是確保核心商業營收鏈路上線不暴斃的最強防線。",
          points: [
            "高信心度保證：直接在真實瀏覽器中驗證，能覆蓋網路請求、DOM 渲染與跨頁面跳轉完整鏈路。",
            "回歸防護網：在快速迭代程式碼或重構元件時，自動化執行所有測試腳本，防止舊功能損壞。",
            "守護關鍵路徑：為註冊、登入與結帳三大核心營收流程撰寫 E2E 測試，能創造最高的投資報酬率。"
          ]
        },
        {
          title: "Playwright 的現代架構優勢與自動等待機制",
          description: "由微軟開源的 Playwright 已成為現代前端自動化測試的事實標準。它原生支援 Chromium、Firefox 與 WebKit（Safari 核心），並擁有顛覆傳統自動化測試的「自動等待（Auto-waiting）」機制。在執行點擊或輸入操作前，Playwright 會自動等待元素完成 DOM 附加、變為可見、動畫停止並具備可點擊狀態，大幅消除因非同步載入導致測試忽過忽不過的 Flaky 問題。",
          points: [
            "真實多瀏覽器支援：單一 API 統一操控三大瀏覽器核心，完美模擬跨平台真實表現。",
            "內建智慧等待：徹底告別不可靠的死等 sleep 指令，大幅提高自動化測試腳本穩定性。",
            "網路模擬與攔截：輕鬆 mock 後端 API 回傳狀態或故意模擬 500 錯誤以測試前端容錯介面。"
          ]
        },
        {
          title: "無頭模式（Headless）與有頭模式（Headful）的應用場景",
          description: "Playwright 支援兩種執行模式。無頭模式（Headless）在沒有圖形介面的背景環境中執行，消耗記憶體與 CPU 極低，是 GitHub Actions 等 CI/CD 自動化管線的最愛；有頭模式（Headful）則會實際彈出實體瀏覽器視窗，搭配 Playwright Inspector 或 UI Mode，讓開發者直觀觀看步驟執行、逐步中斷除錯並即時檢視頁面狀態。",
          points: [
            "Headless 模式：速度極快、資源開銷小，專為無伺服器 CI/CD 持續整合自動測試設計。",
            "Headful 模式：視覺化直觀呈現，在本地端開發新測試案例或排查失敗細節時不可或缺。",
            "Tracing 追蹤錄製：測試失敗時自動儲存 DOM 快照、主控台日誌與網路瀑布流，事後可逐步倒帶重播。"
          ]
        },
        {
          title: "健壯的定位器哲學與視覺回歸比對",
          description: "撰寫自動化測試最忌諱使用脆弱的 CSS 路徑（例如 `div > span:nth-child(2)`），一旦前端調整樣式測試即刻崩潰。Playwright 提倡「以使用者為中心」的語意定位策略（Role-based Locators），例如尋找角色為 button 且名稱為「確認付款」的元件。此外，Playwright 支援視覺截圖像素比對（Snapshot Comparison），自動揪出 CSS 跑版或排版錯位。",
          points: [
            "語意化定位優先：使用 page.getByRole()、page.getByLabel()、page.getByPlaceholder()。",
            "測試專用識別碼：次選為穩定耐用的自訂屬性 page.getByTestId('submit-btn')。",
            "視覺回歸驗證：透過 expect(page).toHaveScreenshot() 確保重要設計元件在外觀上無非預期跑版。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "在測試中使用固定睡眠時間 `page.waitForTimeout(5000)`",
          why: "新手為了等待後端資料或動畫加載，常濫用固定等待秒數。這會大幅拖慢整個 CI 測試套件的執行速度，且在網路延遲稍有波動的低規格雲端環境中依然會超時報錯，形成最典型的 Flaky 測試。",
          fix: "依賴 Playwright 內建的語意斷言等待，例如 `await expect(page.getByText('歡迎回來')).toBeVisible()`。系統會自動輪詢直至元素出現或達到全域逾時時間，既快速又可靠。"
        },
        {
          title: "將測試環境建立在真實外部第三方金流正式環境上",
          why: "E2E 測試直接對 Stripe 正式環境刷真實信用卡，不僅產生真實交易手續費與風控警告，還會污染正式環境的會計報表與使用者數據庫。",
          fix: "在測試環境中使用金流商提供的沙盒金鑰（Test API Keys）與官方測試卡號，或利用 `page.route()` 攔截後端付款端點請求並模擬回傳成功 JSON，確保測試安全且無成本。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "npm init playwright@latest", desc: "在現有專案中快速初始化 Playwright 測試框架與範本設定檔" },
        { cmd: "npx playwright test", desc: "以預設無頭模式（Headless）並行執行所有測試檔案" },
        { cmd: "npx playwright test --ui", desc: "啟動互動式 Playwright UI Mode，提供時間軸倒帶與即時定位器偵錯" },
        { cmd: "npx playwright codegen https://example.com", desc: "啟動程式碼錄製器：手動在瀏覽器操作，系統自動生成對應的測試程式碼" },
        { cmd: "npx playwright show-report", desc: "以本機網頁伺服器開啟豐富的測試執行結果報告與失敗截圖" }
      ],
      widgetId: "playwright-widget",
      widgetProps: { mode: "e2e" },
      quiz: [
        {
          question: "在編寫 Playwright 端對端測試腳本時，下列哪一種元素定位方式最符合官方最佳實踐，且最不易因 UI 樣式改版而損壞？",
          options: [
            "page.locator('.btn-primary.mt-4.rounded')",
            "page.locator('body > div:nth-child(2) > form > button')",
            "page.getByRole('button', { name: '送出訂單' })",
            "page.locator('xpath=//button[1]')"
          ],
          answer: 2,
          explanation: "getByRole 透過無障礙輔助樹（Accessibility Tree）語意定位，完全不依賴易變動的 CSS 類別或 DOM 層級結構，最貼近真實使用者認知且極為穩健。"
        },
        {
          question: "在 GitHub Actions 或 GitLab CI 等自動化整合管線中執行 Playwright 測試時，通常偏好使用哪種模式，其主要優勢為何？",
          options: [
            "有頭模式（Headful），因為可以讓雲端伺服器管理員看見畫面跳動",
            "無頭模式（Headless），因為無需圖形介面系統，記憶體與 CPU 開銷小且執行速度快",
            "除錯模式（Debug），因為遇到任何錯誤會自動永久暫停伺服器等待人工介入",
            "單機錄製模式（Codegen），因為每次執行都會重新覆寫測試檔案"
          ],
          answer: 1,
          explanation: "CI 伺服器通常沒有安裝 X11 等桌面視窗環境。無頭模式（Headless）資源消耗極低，啟動迅速，是自動化管線的首選。"
        }
      ]
    },

    {
      id: "monetization-models",
      trackId: "track-7",
      trackTitle: "品質驗證、金流安全與商業法規",
      unitNumber: 20,
      title: "軟體收費模式與全球金流架構",
      subtitle: "拆解 Payment Gateway 與 Merchant of Record 差異，搞定全球銷售稅與合法收款",
      readingTime: "8 分鐘",
      prerequisites: ["現代 Web 應用架構基礎", "基本商業營運概念"],
      coreConcepts: [
        {
          title: "現代軟體商業收費模式剖析",
          description: "數位產品的收費方式直接決定了商業模式的可持續性。主要分為三類：一次性買斷（Lifetime Deal, LTD），在初期能快速收攏現金流但缺乏長期收入；週期訂閱制（Subscription / SaaS），按月或按年收費，能創造可預測的每月經常性收入（MRR）；以及用量計費制（Usage-based），按 API 呼叫次數或 Token 點數扣點，極契合 AI 代理型產品的成本結構。",
          points: [
            "買斷制（LTD）：適合獨立小型單機工具，降低初次轉換門檻，但長期有維運負擔。",
            "訂閱制（SaaS）：軟體即服務標配，具備顧客終身價值（LTV）疊加優勢。",
            "點數用量制：將使用者消費與後端 LLM API 調用成本深度綁定，防止被大用量用戶吃垮利潤。"
          ]
        },
        {
          title: "金流閘道（Payment Gateway，如 Stripe）的本質",
          description: "Stripe 是全球領先的金流技術基礎設施。作為金流閘道，Stripe 負責連線發卡組織（Visa、Mastercard）與銀行網路，處理信用卡扣款授權與款項劃撥。使用 Stripe 時，你的公司是交易中法律認定的「紀錄商家（Merchant of Record）」。Stripe 的手續費相對較低（通常約 2.9% + 0.30 美元），但要求開發者自行承擔各國稅務申報與實體合規責任。",
          points: [
            "開發者即法定賣家：發票與信用卡帳單上直接顯示你的公司名稱與統一編號。",
            "手續費費率較低：單筆手續費成本低，但背後衍生會計申報成本。",
            "需具備當地註冊公司：開通特定國家 Stripe 帳號通常需要當地合法商業實體與商業銀行帳戶。"
          ]
        },
        {
          title: "紀錄商家（Merchant of Record, MoR，如 Lemon Squeezy、Paddle）",
          description: "MoR 是為跨國數位獨立開發者打造的神級架構。當消費者下單時，消費者在法律上是向 MoR 平台（轉售商）購買產品，MoR 平台再將淨利潤分潤結算給你。這意味著全球 100 多個國家的複雜數位稅務（歐盟 VAT、美國各州 Sales Tax、英國 VAT）、電子發票開立與合規追討，全部由 MoR 平台全權依法代繳申報。",
          points: [
            "平台替你承擔全球稅務：自動依據買方 IP 與郵遞區號計算並代繳各地增值稅，免除稅務訴訟風險。",
            "手續費稍高但省心：通常費率約 5% + 0.50 美元，但省去聘請跨國跨州會計師的天價成本。",
            "個人開發者最愛：多數支援個人身分註冊收款，透過 Wise 或 Payoneer 定期提領美金至本地帳戶。"
          ]
        },
        {
          title: "全球數位銷售稅（VAT / Sales Tax）的法律風險",
          description: "許多新手開發者以為只要收到美金就萬事大吉。然而，歐盟、英國、澳洲以及美國超過 40 個州都設有數位產品增值稅（VAT/GST/Sales Tax）法規。即使你人不在該國境內，只要向該國居民銷售軟體或線上服務，超過特定經濟聯結起徵點（Economic Nexus），就有法律義務向當地稅捐機關登記並繳納稅金。未依規定申報可能面臨巨額滯納金與跨國追討。",
          points: [
            "歐盟反逃稅嚴規：歐盟規定即使只賣出 1 歐元的數位電子書或 SaaS，也必須透過 MOSS 系統申報增值稅。",
            "美國銷售稅碎片化：每個州、甚至每個縣市的軟體課稅標準各不相同，手動計算幾乎不可能。",
            "合規選型鐵律：沒有配置跨國稅務團隊的小微團隊與個人，首選 MoR 平台是唯一理智的護城河。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "個人開發者在無海外公司情況下嘗試以非正式管道強開海外 Stripe",
          why: "網路上充斥使用虛假地址或代理公司開通海外 Stripe 的教學。Stripe 具備強大的 AI 詐欺與洗錢防制風控系統，一旦要求二次驗證護照與在地水電帳單而無法提供，帳號會立即遭到永久凍結且資金扣留 180 天。",
          fix: "若無合法海外實體，請直接採用專為獨立開發者與遠端團隊量身打造的 MoR 服務商（如 Paddle 或 Lemon Squeezy），以個人或本地公司身分合法合規開展全球收費。"
        },
        {
          title: "忽略信用卡拒付（Chargeback）手續費帶來的毀滅性打擊",
          why: "當消費者向銀行主張信用卡被盜刷或要求強行退款時，除了被追回原本款項，金流商還會向開發者額外加收每筆 15 至 25 美元的高昂拒付處理手續費。若拒付率超過 1%，金流商會將帳號直接列入黑名單。",
          fix: "在官網提供顯眼的取消訂閱管道與聯絡信箱。面對不滿意的使用者，寧可主動無條件全額退款，也絕對不要讓交易演變成銀行端的強制拒付（Dispute/Chargeback）。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "npm install stripe", desc: "安裝 Stripe 官方 Node.js 伺服器端 SDK 套件" },
        { cmd: "stripe.checkout.sessions.create({ ... })", desc: "在後端建立託管型 Checkout Session 取得安全付款跳轉網址" },
        { cmd: "https://<your-store>.lemonsqueezy.com/buy/<variant-id>", desc: "Lemon Squeezy 預設託管結帳收銀台網址格式" },
        { cmd: "stripe customers portal create --customer <ID>", desc: "建立 Stripe 客戶自助入口（Customer Portal）讓用戶自行管理或取消訂閱" }
      ],
      widgetId: "stripe-widget",
      widgetProps: { mode: "pricing" },
      quiz: [
        {
          question: "對於身在台灣的一人獨立開發者，準備向全球銷售一款月費 10 美元的 AI 寫作輔助軟體，且沒有在美國或歐盟設立實體公司。下列哪一種金流方案的法律稅務合規風險最低且維護成本最省？",
          options: [
            "自行建立信用卡收單伺服器，直接在資料庫儲存顧客卡號手動扣款",
            "使用紀錄商家平台（Merchant of Record，如 Paddle 或 Lemon Squeezy）",
            "在自己網站貼上個人的海外私人銀行電匯 SWIFT 代碼要求用戶手動匯款",
            "要求所有全球使用者直接以實體美金現鈔郵寄至個人通訊地址"
          ],
          answer: 1,
          explanation: "MoR 平台在法律上作為經銷商，替開發者代扣代繳全球數十個國家的增值稅與消費稅，並承擔開立合規發票責任，極適合個人獨立開發者。"
        },
        {
          question: "使用標準 Payment Gateway（例如純 Stripe 帳號）與使用 Merchant of Record（如 Paddle）最大的法律責任差異在於何者？",
          options: [
            "使用 Stripe 時消費者無法使用信用卡付款",
            "使用 Stripe 時開發者自己是法定賣家，必須自行依法申報各國跨國數位銷售稅（Sales Tax / VAT）",
            "使用 Paddle 時軟體的智慧財產權會永久強制歸屬於 Paddle 官方所有",
            "兩者在法律與稅務責任上完全一模一樣，沒有任何差別"
          ],
          answer: 1,
          explanation: "Payment Gateway 僅代為處理金流收單，交易的法定賣方仍是開發者本人，開發者須自負稅務合規；而 MoR 平台則在法律上成為法定轉售賣方，替你承擔全球稅務。"
        }
      ]
    },

    {
      id: "secure-transactions",
      trackId: "track-7",
      trackTitle: "品質驗證、金流安全與商業法規",
      unitNumber: 21,
      title: "交易安全性、PCI-DSS 與 Webhook 防禦",
      subtitle: "嚴守 PCI-DSS 規範絕不經手卡號，利用 Webhook 數位簽章與冪等性防重複扣款與偽造通知",
      readingTime: "8 分鐘",
      prerequisites: ["後端 HTTP 請求與 API 概念", "金流閘道基礎知識"],
      coreConcepts: [
        {
          title: "PCI-DSS 合規規範與「卡號絕不落地」原則",
          description: "支付卡產業資料安全標準（PCI-DSS）是由 Visa、Mastercard 等國際發卡機構制定的嚴格安全標準。任何經手、傳輸或儲存持卡人未加密信用卡號、有效期限與 CVC 安全碼的系統，都必須通過耗資數萬美元的專業實地合規稽核。現代金流架構透過前端元件（如 Stripe Elements）或託管收銀台（Hosted Checkout），讓使用者的信用卡敏感資訊在瀏覽器直接加密直傳金流商伺服器，只回傳不具敏感性的 Token（如 tok_xxx 或 pm_xxx）給開發者後端。",
          points: [
            "卡號絕不接觸私有伺服器：後端資料庫與應用伺服器永遠不要接觸或儲存完整卡號與 CVC。",
            "大幅簡化 PCI 合規：採用託管元件即可符合最簡易的 SAQ A 合規等級，免去巨額審計負擔。",
            "保護企業免於天價外洩賠償：即便你的伺服器遭駭客入侵，資料庫中也完全沒有任何可盜刷的卡號資料。"
          ]
        },
        {
          title: "Webhook 事件驅動架構與非同步付款確認",
          description: "線上付款是一個非同步的網路流程。使用者輸入卡號後可能需要進行 3D Secure 簡訊 OTP 驗證、或者透過歐洲轉帳等延遲支付方式。因此，絕對不能僅依賴前端瀏覽器跳轉回傳的「付款成功」頁面來發放軟體使用權益（因為使用者可能在跳轉中斷線或惡意篡改前端 URL）。金流伺服器在確認入帳後，會主動向你的後端 API 發送 HTTP POST Webhook 事件通知，這才是發放權限的唯一依據。",
          points: [
            "非同步終態確認：金流伺服器端對伺服器端（S2S）直接通知，不受瀏覽器斷線或分頁關閉影響。",
            "關鍵核心事件監聽：例如 checkout.session.completed（結帳完成）、customer.subscription.deleted（退訂停權）。",
            "快速回傳 HTTP 200：收到 Webhook 後應迅速回應 200 OK 告知金流商接收成功，耗時工作交給背景處理佇列。"
          ]
        },
        {
          title: "Webhook 數位簽章驗證（`stripe-signature`）",
          description: "既然 Webhook 端點是一個公開暴露在網際網路上的 HTTP 路由，惡意攻擊者就能輕易偽造一個看似「付款成功」的假 JSON 負載（Payload）傳送給你的端點，意圖騙取免費用戶 VIP 權限。為了防禦此攻擊，金流商會使用你在面板取得的 Webhook Secret，對請求內容計算 HMAC SHA-256 數位簽章，並放在 HTTP 標頭（如 `Stripe-Signature`）。你的後端必須在處理任何商業邏輯前，嚴格執行簽章比對驗證。",
          points: [
            "防止偽造通知：未經密鑰正確簽名的惡意請求會直接被後端識別並拋出 400 錯誤攔截。",
            "防範重放攻擊（Replay Attacks）：簽章標頭內包含時間戳記（timestamp），超時過舊的請求將自動作廢。",
            "原始請求主體（Raw Body）：計算雜湊簽章時必須使用未經 JSON.parse 解析轉換的原始位元組字串。"
          ]
        },
        {
          title: "冪等性（Idempotency）與重複扣款防禦",
          description: "在分散式網路環境中，若金流商發送 Webhook 後因網路暫時不穩定沒有即時收到你回傳的 200 OK，金流伺服器會依照指數退避策略重試發送相同事件數次。如果你的程式碼每次收到通知都執行「增加 100 點點數」，使用者將在一次付款中獲得數百點。實踐「冪等性處理」要求：無論同一個事件通知被重試接收多少次，系統狀態變更結果必須與僅執行一次完全相同。",
          points: [
            "全域唯一事件識別碼（Event ID）：每個 Webhook 事件具備唯一 ID（如 evt_1Nz...）。",
            "資料庫去重紀錄：在交易資料表中設定 event_id 為唯一索引（UNIQUE INDEX），或在 Redis 記錄處理狀態。",
            "已處理即略過：收到通知時先查詢該 event_id 是否已存在，若已成功處理則直接回傳 200 OK 結束流程。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "在 Node.js 中先使用 `express.json()` 解析 Body，導致 Webhook 簽章驗證永遠失敗",
          why: "`stripe.webhooks.constructEvent()` 需要計算請求 Raw Body 的原始字串位元組。若 Express 預先將 Body 解析為 JSON 物件再轉回字串，鍵值排列順序或空白字元的細微變動會導致雜湊值完全不吻合。",
          fix: "為 Webhook 路由專門配置 `express.raw({ type: 'application/json' })` 中介軟體，保留未被篡改的原始二進位 Payload 供 SDK 驗證簽章。"
        },
        {
          title: "僅在前端的 Success URL 跳轉頁面發送發放權益的 API 請求",
          why: "攻擊者只要在瀏覽器手動輸入 `https://yoursite.com/checkout/success?session_id=fake_123`，前端如果輕率呼叫 API 升級會員，等於為所有黑客開了一扇免費開通 VIP 的大門。",
          fix: "前端 Success 頁面僅負責顯示「交易確認中，請稍候」等提示畫面。所有實質的資料庫使用者權限變更、訂閱狀態啟用，必須百分之百只由通過簽章驗證的 Webhook 伺服器端程式碼觸發。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "stripe listen --forward-to localhost:3000/api/webhook", desc: "使用 Stripe CLI 在本機開發時即時轉發雲端 Webhook 事件到本地端點進行即時偵錯" },
        { cmd: "stripe trigger checkout.session.completed", desc: "以命令列工具主動觸發模擬特定結帳完成事件以測試本地後端處理常式" },
        { cmd: "app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => ...)", desc: "Express 中保留 Raw Body 以正確驗證 Webhook 簽章的標準端點寫法" },
        { cmd: "stripe.webhooks.constructEvent(payload, sig, endpointSecret)", desc: "Stripe 官方 SDK 用於驗證數位簽章與時間戳記的核心保護函式" }
      ],
      widgetId: "stripe-widget",
      widgetProps: { mode: "webhook" },
      quiz: [
        {
          question: "當你的後端 API 接收到來自金流商的 Webhook 通知時，為什麼必須進行 `stripe-signature` 數位簽章驗證？",
          options: [
            "為了確認使用者的信用卡晶片表面沒有刮傷",
            "為了驗證該請求確實由金流官方伺服器發出且內容未遭中間人竄改，防止偽造付款通知騙取權益",
            "為了讓資料庫查詢速度提升兩倍以上",
            "為了強制將所有扣款幣別轉換為黃金或虛擬貨幣"
          ],
          answer: 1,
          explanation: "Webhook 路由是公開網路端點。透過共用的密鑰驗證 HMAC 數位簽章，後端能確定該請求確實來自金流官方且資料完整未被假冒。"
        },
        {
          question: "金流伺服器因網路短暫延遲在 5 分鐘內連續向你的 Webhook 端點傳送了 3 次一模一樣的「訂單付款成功」通知。如何設計後端才能避免讓使用者重複獲得 3 次儲值點數？",
          options: [
            "每次收到通知都自動對資料庫執行刪除清空操作",
            "直接關閉伺服器防火牆並停用所有 Webhook 機制",
            "實作冪等性機制：在資料庫以該事件的唯一識別碼（Event ID）做去重檢查，已處理過則直接回應成功並跳過加點",
            "要求使用者在收到每次扣款簡訊時致電銀行申請爭議處理"
          ],
          answer: 2,
          explanation: "透過資料庫記錄唯一的 event_id 達成冪等性（Idempotency），保證即便收到多次重發事件，也只會執行一次業務狀態變更。"
        }
      ]
    },

    {
      id: "legal-compliance",
      trackId: "track-7",
      trackTitle: "品質驗證、金流安全與商業法規",
      unitNumber: 22,
      title: "商業合規、法律文件與產品上線清單",
      subtitle: "建立隱私權政策、服務條款與責任免責聲明，保護獨立開發者免於法律訴訟與合規風險",
      readingTime: "7 分鐘",
      prerequisites: ["基本網路商業常識", "軟體產品發布流程基礎"],
      coreConcepts: [
        {
          title: "獨立開發者必備的三大法律護城河文件",
          description: "將軟體推向公眾市場並開始收費時，法律文件不是可有可無的裝飾，而是保障開發者個人資產不因惡意訴訟而破產的重要盾牌。任何公開營運的產品都應具備清晰易尋的獨立網頁連結：隱私權政策（Privacy Policy）、服務條款（Terms of Service, ToS），以及明訂責任上限的免責聲明（Disclaimer & Limitation of Liability）。",
          points: [
            "隱私權政策：向使用者誠實揭露你蒐集了哪些個人資料（Email、IP）、如何使用，以及與哪些第三方共享（如 Google Analytics、Stripe）。",
            "服務條款：定義雙方的契約關係、使用者的行為準則（禁止濫用、禁止逆向工程）、智慧財產權歸屬以及帳號終止條款。",
            "責任限制條款：聲明軟體「依現狀提供（AS IS）」，並明訂若發生服務中斷或資料損壞時，最高賠償金額不超過使用者過去數月所支付的實際費用。"
          ]
        },
        {
          title: "全球隱私與個資保護法規（GDPR、CCPA 與台灣個資法）",
          description: "歐盟的一般資料保護規則（GDPR）被譽為全球最嚴苛的隱私法。如果你的網站吸引歐盟居民造訪，你必須取得使用者的明示同意才能埋設追蹤 Cookie；此外，使用者享有「資料被遺忘權」（刪除其個人所有歷史資料與帳號）與「資料可攜權」。美國加州的 CCPA 與台灣的個人資料保護法亦明確要求蒐集個人資料時須明確告知目的，並禁止將用戶資料轉售給未授權第三方。",
          points: [
            "Cookie 同意橫幅：非必要之行銷追蹤 Cookie 必須提供「拒絕全部」與「接受」的同等權重選項。",
            "被遺忘權實作：在會員設定面板中提供「刪除我的帳號與所有資料」的自助功能或聯絡管道。",
            "資料最小化原則：僅蒐集產品運作所絕對必要的資訊，不主動索取與業務無關的敏感個人隱私。"
          ]
        },
        {
          title: "數位商品退款條例與爭議風險控管",
          description: "不同國家對於數位虛擬商品的退款法律有不同規定。例如台灣消保法第 19 條規定「非以有形媒介提供之數位內容或一經提供即為完成之線上服務，經消費者事先同意始提供者，得排除 7 天猶豫期（鑑賞期）」。歐盟亦有類似放棄撤銷權之同意規範。然而，在結帳畫面上必須以顯著文字取得消費者勾選同意，否則消費者依然依法享有全額退款權益。",
          points: [
            "明確揭示退款規範：在定價頁與結帳按鈕上方清楚標記退款政策（如：提供 14 天內退款保障，或開通即不退款）。",
            "主動溝通消弭爭議：在扣款前數天自動寄發即將續約通知信，顯著降低使用者因忘記取消而引發的憤怒投訴。",
            "降低 Chargeback 風險：完善的退款政策與及時的客服回應是防止金流帳號因過高拒付率被停權的最有效解法。"
          ]
        },
        {
          title: "AI 代理產品的專屬免責條款與合理使用政策（AUP）",
          description: "以大型語言模型（LLM）為核心的現代 AI 代理產品具備獨特的法律風險：模型可能會產生幻覺（Hallucinations）、生成含有偏見的文字、甚至產生含有安全漏洞的程式碼。如果使用者將你產出的程式碼用於醫療、航空或高風險金融系統並遭受損失，你可能面臨巨額索賠。因此，條款中必須明確加入 AI 內容免責聲明與禁止用途規範。",
          points: [
            "AI 產出免責聲明：明確提示「AI 生成之內容僅供參考，系統不保證其完全正確無誤，使用者應自行審閱承擔風險」。",
            "禁止使用守則（AUP）：明確禁止使用者利用你的 AI 工具進行惡意攻擊程式開發、自動化垃圾郵件散播或散布仇恨言論。",
            "智慧財產權授權：明確規範由 AI 所協助生成的專案原始碼，其著作財產權百分之百歸屬於付費使用者本人。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "直接複製競爭對手的隱私權政策與服務條款，未經審閱直接上線",
          why: "每家公司的法律主體、營運註冊國家、管轄法院、蒐集的資料欄位與使用的第三方服務皆不相同。複製來的條款可能指定了加州法院為管轄地、載明了非你擁有的商標，甚至違反你所在當地的強制法規，產生嚴重的法律漏洞。",
          fix: "使用開源法規範本或合規條款生成器（如 TermsFeed 或 iubenda），根據產品實際使用的資料庫與第三方分析工具誠實勾選生成草案，並在產品頁面清楚載明真實聯絡電子郵件。"
        },
        {
          title: "在網站中靜默植入第三方行銷追蹤碼，完全沒有隱私宣告與同意機制",
          why: "許多開發者隨手在 HTML head 加入 Google Tag Manager、Meta Pixel 或 Hotjar 錄影腳本，卻未在隱私政策中揭露或未提供 Cookie 同意橫幅，這在歐盟市場直接違反 GDPR 規範，可能招致主管機關警告罰鍰。",
          fix: "在網站上線前盤點所有載入的第三方 JavaScript SDK。若包含非必要之廣告與跨站追蹤腳本，必須在使用者首次造訪時彈出符合規範的 Cookie 同意橫幅，並在隱私權政策中完整列出所有合作服務商清單。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "npx termsfeed-cli generate --type privacy-policy", desc: "使用合規命令列工具或雲端產生器生成標準隱私權政策 Markdown 初稿" },
        { cmd: "document.cookie = 'cookie_consent=true; max-age=31536000; path=/; SameSite=Lax; Secure'", desc: "在使用者點擊同意後，將 Cookie 同意狀態安全寫入瀏覽器 Cookie 中" },
        { cmd: "curl -X DELETE https://api.yoursite.com/v1/user/account", desc: "符合 GDPR 被遺忘權規範的使用者個人帳號與資料完整抹除端點標準範例" },
        { cmd: "git checkout -b feature/legal-pages", desc: "建立專用 Git 分支，維護 /privacy、/terms 與 /refund 靜態法規路由頁面" }
      ],
      widgetId: "stripe-widget",
      widgetProps: { mode: "compliance" },
      quiz: [
        {
          question: "你正在營運一個提供 AI 自動寫程式功能的 SaaS 產品。為了避免使用者因 AI 產出有缺陷的程式碼造成其伺服器當機而向你求償天價損失，你必須在服務條款中明訂下列哪一項重要法律條款？",
          options: [
            "保證開發者本人為所有 AI 產出代碼承擔無限連帶賠償責任條款",
            "責任限制（Limitation of Liability）與免責聲明（Disclaimer），聲明軟體依現狀提供且賠償上限不超過其已支付費用",
            "禁止使用者在下雨天使用電腦的限制條款",
            "強制要求使用者將所有寫出的程式碼著作權無償轉讓給微軟"
          ],
          answer: 1,
          explanation: "責任限制條款與「依現狀提供（AS IS）」免責聲明能有效限定開發者的法律賠償邊界，防止因軟體 Bug 或 AI 幻覺衍生的間接商業損失索賠。"
        },
        {
          question: "依據歐盟一般資料保護規則（GDPR）的「被遺忘權（Right to be Forgotten）」，當使用者正式提出要求時，你的軟體服務有義務履行下列哪項行為？",
          options: [
            "拒絕該請求，並將該使用者的個人資料公佈在社群媒體上",
            "在合理時限內，永久且不可逆地刪除該使用者在系統資料庫中儲存的所有個人識別資訊",
            "向使用者額外收取 1000 歐元的資料管理手續費",
            "將使用者的密碼以明文寄送至其備用電子信箱"
          ],
          answer: 1,
          explanation: "GDPR 的被遺忘權賦予使用者要求企業全面清除其個人資料的權利，企業在無正當法定保留事由（如會計法規防洗錢保存年限）時必須如實清除。"
        }
      ]
    }
  ];

  // 將資料註冊至全域物件
  if (typeof window !== "undefined") {
    window.TRACKS_PART_3 = TRACKS_PART_3;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = TRACKS_PART_3;
  }
})();
