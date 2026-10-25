// apps/vibe-coder/js/tracks-part2.js
// Vibe Coder 核心單元第二部分：Track 4 (遠端系統與安全網路) & Track 5 (AI 擴充生態與代理通訊協定)

(function () {
  const TRACKS_PART_2 = [
    // ==========================================
    // Track 4: 遠端系統與安全網路 (Units 10 - 11)
    // ==========================================
    {
      id: "ssh-keys",
      trackId: "track-4",
      trackTitle: "遠端系統與安全網路",
      unitNumber: 10,
      title: "遠端登入與安全金鑰",
      subtitle: "告別脆弱密碼：掌握 SSH 非對稱金鑰機制、安全轉發與遠端伺服器無密碼授權",
      readingTime: "6 分鐘",
      prerequisites: ["終端機基礎操作 (cd, ls, cat)", "檔案系統路徑與權限概念 (如 ~/.ssh 與 chmod)"],
      coreConcepts: [
        {
          title: "密碼登入的弊端 vs 非對稱密碼學 (Asymmetric Cryptography)",
          description: "傳統使用帳號密碼登入遠端伺服器，面臨極大安全風險：密碼長度有限容易被暴力字典攻擊破解，且使用者容易在多台機器複用同一組密碼。一旦中繼網路遭受竊聽或伺服器被滲透，密碼就會立即外洩。現代雲端基礎設施全面採用 SSH 金鑰機制，基於非對稱加密技術，提供堅不可摧的自動化安全防護。",
          points: [
            "非對稱金鑰成對出現：公鑰 (Public Key，副檔名為 .pub) 與私鑰 (Private Key，無副檔名)。",
            "鎖與鑰匙的隱喻：公鑰就像留在伺服器上的堅固鎖頭，任何人都可以看見；私鑰是只有你擁有的唯一鑰匙，必須嚴密保留在本地端電腦，永遠不可傳送至網路上。",
            "數位簽章認證流程：登入時伺服器發送隨機挑戰訊息 (Challenge)，本地端使用私鑰對其進行數學運算簽章，伺服器使用對應公鑰驗證簽章成功即放行，私鑰本體從不離開本機。",
            "演算法首選 Ed25519：相較於過時肥大的 RSA 1024/2048，Ed25519 具備更高安全性、計算速度極快、金鑰長度短且能有效防範側通道與特定碰撞攻擊。"
          ]
        },
        {
          title: "金鑰生命週期：生成、保護與遠端授權 (~/.ssh/authorized_keys)",
          description: "建立金鑰非常迅速，但必須遵守最佳實踐。生成金鑰時應提供註解以便識別用途，並務必設定密碼保護短語 (Passphrase)。在遠端伺服器端，使用者目錄下的 ~/.ssh/authorized_keys 檔案則是守門清單，記錄了所有被允許登入本帳號的公鑰字串。",
          points: [
            "一鍵生成最佳金鑰：執行 ssh-keygen -t ed25519 -C 'your_email@example.com'，系統會詢問儲存位置與密碼短語。",
            "Passphrase 的雙重防線：若筆電遺失或硬碟遭竊，加了 Passphrase 的私鑰即處於 AES-256 加密狀態，沒有密碼任何人都無法調用該私鑰。",
            "快速部署公鑰：利用 ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server_ip 可自動將公鑰正確追加至伺服器的 authorized_keys 檔案末尾並修正權限。",
            "嚴格的檔案權限律則：Linux 核心嚴格檢查權限。~/.ssh 目錄權限必須是 700 (drwx------)，authorized_keys 與私鑰必須是 600 (-rw-------)。"
          ]
        },
        {
          title: "SSH Config 設定檔簡化流程與 ssh-agent 轉發安全性",
          description: "頻繁連線多台伺服器時，每次手動輸入使用者名稱、IP 位址、通訊埠與金鑰路徑極度低效。透過本地端 ~/.ssh/config 設定檔，你可以將繁瑣的連線參數封裝為簡短別名。搭配 ssh-agent 金鑰代理，只需在開機時解鎖一次金鑰，即可享受流暢無阻的遠端開發體驗。",
          points: [
            "設定檔優勢：在 ~/.ssh/config 定義 Host myserver、HostName 203.0.113.10、User ubuntu、IdentityFile ~/.ssh/id_ed25519，之後只需鍵入 ssh myserver 即可連線。",
            "ssh-agent 記憶體金鑰代管：執行 ssh-add ~/.ssh/id_ed25519 將金鑰載入背景記憶體快取，後續所有 SSH 操作 (包含 Git 連線) 均自動簽章，無須反覆敲打密碼短語。",
            "跳板機安全 (ProxyJump)：需要透過跳板機存取內網主機時，推薦使用 ProxyJump bastion 指令或設定，資料全程在端對端加密通道中傳遞。",
            "轉發風險防範 (Agent Forwarding)：除非完全信任目標機器，否則切勿輕易開啟 ssh -A。跳板伺服器的 root 管理員有能力存取你的 ssh-agent 通訊通訊端 (socket) 借用你的身分向外橫向移動。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "權限過於寬鬆觸發 OpenSSH 拒絕連線 (UNPROTECTED PRIVATE KEY FILE)",
          why: "新手常圖省事將 .ssh 目錄或私鑰設定成 chmod 777。OpenSSH 為了保護使用者，在偵測到私鑰檔案可能被系統其他使用者讀取時，會主動拒絕載入金鑰並拋出 Permissions are too open 警告。",
          fix: "依序修正本機權限：chmod 700 ~/.ssh，接著執行 chmod 600 ~/.ssh/id_ed25519 (私鑰)。在遠端伺服器端，確認 ~/.ssh/authorized_keys 權限同樣為 600。"
        },
        {
          title: "致命混淆：將「私鑰」誤當作「公鑰」發布或推送到 GitHub",
          why: "很多人分不清 id_ed25519 與 id_ed25519.pub 的差異，將私鑰複製貼到遠端伺服器、網頁表單，甚至是上傳到公開 Git 儲存庫，造成私鑰徹底外洩。",
          fix: "牢記口訣：『.pub 結尾是 Public 公開鑰匙，全世界都可以看；沒有 .pub 的是 Private 私密鑰匙，打死不出本地電腦』。一旦私鑰曾意外洩漏，該金鑰對已廢，必須立即在所有伺服器的 authorized_keys 中刪除該公鑰行，並重新生成一組新金鑰。"
        },
        {
          title: "配置好金鑰後，雲端伺服器忘記關閉「密碼登入」與 Root 登入",
          why: "許多人設定完金鑰能正常登入後就收工，忽略了伺服器後台仍然開啟密碼認證，雲端主機的 22 通訊埠依舊日夜遭受全球惡意殭屍網路自動化暴力掃描。",
          fix: "確認金鑰可順暢登入後，編輯伺服器的 /etc/ssh/sshd_config：設定 PasswordAuthentication no、PermitRootLogin prohibit-password (或 no)，儲存後執行 sudo systemctl restart sshd。保留目前連線視窗，開新視窗驗證無誤後再關閉。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "ssh-keygen -t ed25519 -C \"name@domain.com\"", desc: "生成現代最高標準的 Ed25519 安全金鑰對" },
        { cmd: "ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server-ip", desc: "將本地公鑰自動上傳並寫入遠端伺服器授權清單" },
        { cmd: "chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_ed25519", desc: "修復本地 SSH 目錄與私鑰的安全存取權限" },
        { cmd: "ssh-add ~/.ssh/id_ed25519", desc: "將私鑰加入本地 ssh-agent 快取記憶體" },
        { cmd: "ssh -i ~/.ssh/id_ed25519 user@host", desc: "指定特定私鑰檔案進行遠端 SSH 連線" },
        { cmd: "ssh -J jumpuser@jumphost targetuser@targethost", desc: "透過跳板機 (Jump Host) 端對端加密連線到目標內網機器" }
      ],
      widgetId: "ssh-widget",
      widgetProps: {
        defaultTab: "inspector",
        keyTypes: ["ed25519", "rsa4096"],
        sampleConfig: "Host production-cloud\n  HostName 203.0.113.88\n  User ubuntu\n  Port 22\n  IdentityFile ~/.ssh/id_ed25519\n  ForwardAgent no"
      },
      quiz: [
        {
          question: "當你在雲端伺服器佈署 SSH 登入憑證時，應該將哪一個檔案的內容放置在遠端伺服器的 ~/.ssh/authorized_keys 中？",
          options: [
            "本地電腦的私鑰檔案 (~/.ssh/id_ed25519)",
            "本地電腦的公鑰檔案 (~/.ssh/id_ed25519.pub)",
            "伺服器自己生成的私鑰檔案",
            "包含 Passphrase 密碼的文字檔"
          ],
          answer: 1,
          explanation: "非對稱加密架構中，只有公鑰 (~/.ssh/id_ed25519.pub) 應該複製並存放在伺服器的 authorized_keys 檔案中。私鑰必須嚴密保存在本機，永遠不可外洩或上傳至伺服器。"
        },
        {
          question: "你在執行 SSH 連線時終端機拋出錯誤訊息：'Permissions 0777 for /Users/dev/.ssh/id_ed25519 are too open. It is required that your private key files are NOT accessible by others.'，請問下列哪一個處理方式最標準正確？",
          options: [
            "使用 sudo ssh 強制跳過權限檢查",
            "在終端機執行 chmod 600 ~/.ssh/id_ed25519 限制僅擁有者可讀寫",
            "刪除該私鑰檔案並改用明文密碼登入",
            "在終端機執行 chmod 777 ~/.ssh 讓所有目錄權限一致"
          ],
          answer: 1,
          explanation: "OpenSSH 內建嚴密的安全防禦機制，若私鑰檔案開放其他群組讀寫 (如 777 或 644)，會判定該私鑰處於高危險洩漏狀態而拒絕載入。執行 chmod 600 限制只有目前使用者本人可讀寫，即可解除此警告。"
        }
      ]
    },

    {
      id: "persistent-mesh",
      trackId: "track-4",
      trackTitle: "遠端系統與安全網路",
      unitNumber: 11,
      title: "背景常駐與私有連線",
      subtitle: "利用 tmux 實現斷線不中斷的持久運算，搭配 Tailscale 零配置穿透組建私有安全網",
      readingTime: "6 分鐘",
      prerequisites: ["SSH 遠端連線基礎", "基礎終端機互動與行程 (Process) 前後端概念"],
      coreConcepts: [
        {
          title: "終端機斷線的致命傷與 tmux 多工器架構 (Terminal Multiplexer)",
          description: "當你透過 SSH 連線到遠端主機執行長時間任務（例如 AI 模型微調、大規模相依套件安裝、爬蟲排程或後端服務編譯）時，該行程是綁定在當前 SSH 會話的虛擬終端 (PTS) 上的。一旦網路斷線、咖啡廳 Wi-Fi 閃爍或闔上筆電，SSH 連線中斷會向作業系統發送 SIGHUP (掛斷信號)，正在跑的任務就會瞬間被強制殺死。tmux 徹底解決了這個痛點。",
          points: [
            "C/S 架構的常駐伺服器：tmux 在遠端主機背景啟動一個獨立伺服器行程 (Server)，它不依賴任何外部 SSH 客戶端。",
            "會話脫離與重新接入 (Detach & Attach)：你的連線只是附著 (Attach) 在 tmux 畫面上；即使你斷線離線，遠端任務依舊在 tmux 內部全速運行，隨時連回伺服器執行 tmux attach 即可恢復完整進度。",
            "工作區多工分割：單一連線即可水平/垂直分割視窗 (Panes)，右邊即時觀察系統監控 (htop)，左上檢視應用程式日誌 (tail -f)，左下執行測試命令。",
            "協同除錯功能：多位開發者可以同時 attach 到同一個 tmux session，即時看到彼此鍵入的指令與輸出畫面，是遠端協同開發與救援的終極利器。"
          ]
        },
        {
          title: "tmux 核心操作哲學與快速鍵體系",
          description: "tmux 的所有操作均由一個觸發鍵發起，稱為「Prefix Key」（前綴鍵），預設組合為 Ctrl + b。按下前綴鍵放開後，再敲擊特定功能單鍵，就能完成視窗管理與會話切換，完全不必依賴滑鼠。",
          points: [
            "會話生命週期管理：使用 tmux new -s mysite 建立具名會話；在會話內按下 Ctrl+b 接 d 即可安全脫離 (Detach) 回到外層終端機；tmux ls 列出所有背景會話；tmux attach -t mysite 隨時接回。",
            "分割窗格直覺快捷鍵：Ctrl+b 接 % 為垂直左右分割 (左右兩欄)；Ctrl+b 接 \" 為水平上下分割；Ctrl+b 接方向鍵在不同窗格間移動游標。",
            "分頁管理 (Windows)：Ctrl+b 接 c 建立新分頁視窗；Ctrl+b 接 n 切換下一個分頁；Ctrl+b 接 p 切換上一個分頁；Ctrl+b 接 0-9 直達指定分頁。",
            "滾動瀏覽歷史輸出 (Copy Mode)：按下 Ctrl+b 接 [ 進入複製瀏覽模式，可用方向鍵或 PageUp/PageDown 上下翻閱超出螢幕的歷史日誌輸出，按 q 鍵離開。"
          ]
        },
        {
          title: "傳統 VPN 的痛點 vs Tailscale 網狀私有網路 (WireGuard Mesh)",
          description: "在傳統架構中，若要安全存取位於公司內網、家中私有伺服器或多台雲端 VM，通常需要架設複雜的 OpenVPN、設定靜態公網 IP、設定路由器連接埠轉發 (Port Forwarding)，並手動簽署繁複憑證。直接將 SSH 的 22 通訊埠暴露在公網更是不斷遭受攻擊。Tailscale 基於現代 WireGuard 協定，實現了零配置的點對點網狀加密網路 (Mesh VPN)。",
          points: [
            "NAT 穿透黑科技：利用 DERP 中繼與 STUN 技術，即使伺服器位在嚴格防火牆或浮動 IP 的家用寬頻內網，兩台裝置也能直接建立端對端 (Peer-to-Peer) 加密隧道。",
            "整合身分提供者 (IdP)：透過 Google、GitHub 或微軟帳號單一登入 (SSO)，免去維護公私鑰伺服器與使用者密碼庫的負擔。",
            "MagicDNS 與私有 100.x.y.z 位址：每台加入 Tailscale 網路的裝置都會獲得唯一的虛擬私有 IP 與裝置名稱，無論你在世界的哪一個角落，連線 myserver 就像在同一個客廳區網般簡單。",
            "全面收縮公網受攻擊面：有了 Tailscale，你可以直接在雲端防火牆上關閉所有對外的 22 通訊埠，只允許來自 Tailscale 介面 (tailscale0) 的連線，達成真正零暴露 (Zero Attack Surface)。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "誤把 tmux 的「脫離 (Detach)」打成 exit 或按了 Ctrl + d",
          why: "新手想暫時把正在運算的模型推到背景，卻習慣性在命令列輸入 exit 或連續敲擊 Ctrl + d。這會直接關閉當前 Shell，若這是該會話最後一個視窗，整個 tmux session 會被當場摧毀，背景程式瞬間夭折。",
          fix: "牢記脫離 tmux 的標準按鍵：按下 Ctrl + b，放開手，再單按 d (代表 Detach)。螢幕會顯示 [detached (from session ...)]，這才代表你的程式已穩妥在後台運行。"
        },
        {
          title: "安裝 Tailscale 後，忘記在雲端安全群組中移除原本對外開放的 22 通訊埠",
          why: "很多人興高采烈安裝了 Tailscale，以為已經安全無虞，但雲端管理後台 (如 AWS EC2 Security Group 或 GCP Firewall) 依然保留了 0.0.0.0/0 存取 22 通訊埠的規則，主機依舊暴露在公網暴力掃描中。",
          fix: "驗證能夠透過 Tailscale 分配的 100.x.y.z 私有 IP 或 MagicDNS 主機名稱成功 SSH 登入後，立刻前往雲端服務商儀表板，將入站規則 (Inbound Rules) 中面向全世界開放的 SSH (Port 22) 規則整條刪除。"
        },
        {
          title: "在 tmux 中執行需要 root 權限的長期工作時權限混亂",
          why: "在一般使用者的 tmux 視窗中突然使用 sudo 執行背景伺服器，中途連線逾時導致 sudo 權限快取過期，或是生成了大量 root 擁有的記錄檔，日後一般使用者無法讀取與清理。",
          fix: "長期服務與常駐守護行程應優先編寫為標準的 systemd service 進行管理與自動重啟；若使用 tmux 進行互動式開發與調試，應保持權限專一，不要隨意在同一會話中交錯使用 sudo su。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "tmux new -s ai-training", desc: "建立並進入名為 ai-training 的全新背景會話" },
        { cmd: "tmux ls", desc: "列出目前主機上所有正在運行的 tmux 會話與視窗數量" },
        { cmd: "tmux attach -t ai-training", desc: "重新接入 (Attach) 指定名稱的背景會話" },
        { cmd: "Ctrl+b 放開後按 d", desc: "安全脫離 (Detach) 當前 tmux 會話，讓程式持續在後台運行" },
        { cmd: "tailscale up", desc: "啟動 Tailscale 客戶端並透過瀏覽器完成身分授權綁定" },
        { cmd: "tailscale status", desc: "檢視當前私有虛擬網格中所有連線裝置的狀態與 IP" },
        { cmd: "tailscale ip -4", desc: "查詢目前本機在 Tailscale 私有網格中的專屬 100.x.y.z IP" }
      ],
      widgetId: "tmux-widget",
      widgetProps: {
        activeSession: "worker-pool",
        panes: [
          { id: 1, title: "bash (tail -f access.log)", width: "50%", height: "100%" },
          { id: 2, title: "htop (CPU 88% MEM 4.2GB)", width: "50%", height: "50%" },
          { id: 3, title: "node server.js (Port 3000)", width: "50%", height: "50%" }
        ],
        meshPeers: [
          { name: "macbook-air", ip: "100.82.14.2", online: true },
          { name: "gpu-server-tokyo", ip: "100.99.210.55", online: true },
          { name: "homelab-nas", ip: "100.64.1.9", online: false }
        ]
      },
      quiz: [
        {
          question: "你正在遠端雲端主機上下載一個 50GB 的模型權重檔，需要耗時三小時。為了避免筆電休眠或咖啡廳網路中斷造成下載失敗，最專業可靠的做法是什麼？",
          options: [
            "保持筆電電源常開並設定永不休眠，盯著螢幕不要關閉 SSH 視窗",
            "在終端機啟動 tmux 會話，在 tmux 視窗內執行下載命令，然後透過 Ctrl+b, d 脫離連線",
            "在連線指令後面加上 & 符號，並直接在終端機輸入 exit 關閉視窗",
            "改用 HTTP 下載並把瀏覽器視窗最小化"
          ],
          answer: 1,
          explanation: "使用 tmux 可以在伺服器端建立獨立常駐的會話。即使你的本地電腦關機或網路中斷，tmux 內部執行的下載程式完全不受影響，重新連線後執行 tmux attach 即可無縫查看下載進度。"
        },
        {
          question: "相較於傳統將伺服器的 SSH 22 通訊埠直接暴露在網際網路上，使用 Tailscale 組建網狀網路的主要安全性優勢是什麼？",
          options: [
            "能將 SSH 的傳輸速度提升十倍以上",
            "可以完全關閉雲端防火牆對公網開放的 22 通訊埠，僅允許私有加密虛擬網路內的授權裝置存取",
            "不需要在作業系統建立任何使用者帳號即可自由登入",
            "可以讓伺服器自動阻擋所有 SQL 資料庫注入攻擊"
          ],
          answer: 1,
          explanation: "Tailscale 建立在 WireGuard 的點對點加密網格之上。透過專屬私有 IP 連線，你可以徹底對公網關閉 22 通訊埠，杜絕全網惡意機器人的暴力密碼探測與掃描，將外部攻擊面降至近乎為零。"
        }
      ]
    },

    // ==========================================
    // Track 5: AI 擴充生態與代理通訊協定 (Units 12 - 14)
    // ==========================================
    {
      id: "api-basics",
      trackId: "track-5",
      trackTitle: "AI 擴充生態與代理通訊協定",
      unitNumber: 12,
      title: "應用程式介面與 JSON 語法",
      subtitle: "解密現代軟體溝通語言：RESTful 設計準則、HTTP 動詞、請求標頭與結構化資料酬載",
      readingTime: "6 分鐘",
      prerequisites: ["網路通訊協定基礎 (HTTP vs HTTPS)", "JavaScript 基礎資料型態 (字串、物件、陣列)"],
      coreConcepts: [
        {
          title: "API 的本質與 RESTful 架構哲學 (Resource-Oriented)",
          description: "API (Application Programming Interface，應用程式介面) 是軟體系統之間溝通的公定介面與合約。就像到餐廳點餐，你不需要走進廚房看廚師如何開瓦斯與切菜，只要根據菜單規格發出訂單，廚房就會送出對應餐點。現代網頁應用與 AI 代理大多基於 REST (Representational State Transfer) 風格架構建置。",
          points: [
            "以『資源 (Resource)』為核心：在 REST 架構中，系統中的每一個實體都視為名詞資源，並擁有唯一且語義清晰的 URI 路徑，例如 /api/v1/projects 或 /api/v1/users/42。",
            "無狀態約束 (Stateless)：伺服器不會在記憶體中維護前後兩次請求之間的會話狀態；每一個 Request 必須自身包含所有必要的驗證憑證與上下文資訊，利於系統水平擴展。",
            "語意明確的介面合約：用戶端不需猜測伺服器內部實作是 Python、Node.js 還是 Go，只要遵照介面規範傳遞資料，就能實現跨語言、跨平台的無縫對接。"
          ]
        },
        {
          title: "精確掌握 HTTP 請求動詞語意與回應狀態碼 (Status Codes)",
          description: "RESTful API 巧妙利用 HTTP 協定既有的動詞來表達對資源的操作意圖。精確使用正確動詞與狀態碼，能讓 API 自我描述、安全且符合網路架構標準（如快取與等冪性）。",
          points: [
            "GET (查詢讀取)：安全且等冪，多次請求絕不改變伺服器狀態，資料置於 URL 查詢字串中。",
            "POST (新增資源)：非等冪操作，通常用於在伺服器上建立全新資源或觸發高耗能計算 (如 AI 生成)。",
            "PUT vs PATCH (更新資源)：PUT 代表全量覆蓋替換既有資料；PATCH 則代表局部修改特定欄位 (例如僅更新使用者的 status)。",
            "DELETE (刪除資源)：移除指定 URI 所代表的資源。",
            "核心狀態碼階層：2xx 代表成功 (200 OK, 201 Created)；4xx 代表用戶端失誤 (400 語法錯誤, 401 未認證, 403 無權限, 404 資源不存在, 429 觸發限速)；5xx 代表伺服器崩潰 (500 內部錯誤, 502/504 閘道逾時)。"
          ]
        },
        {
          title: "解析 HTTP Headers、URL Query Params 與 JSON 酬載 (Payload)",
          description: "一個完整的 HTTP 請求由三大部分組成：起首行 (Method + URL)、標頭群 (Headers) 與本體酬載 (Body)。JSON (JavaScript Object Notation) 則是目前 API 領域統治級的資料交換格式。",
          points: [
            "URL 路徑 vs 查詢參數 (Query String)：路徑用於定位資源 (/users/12/orders)；查詢參數以 ? 號發起，用於排序、篩選或分頁 (?sort=desc&limit=20&page=2)。",
            "關鍵 Headers 的角色：Content-Type 告訴伺服器送過去的本體是什麼格式 (如 application/json)；Accept 聲明期望伺服器回傳什麼格式；Authorization 攜帶身分驗證權杖。",
            "嚴格的 JSON 語法守則：JSON 不是 JavaScript 原始物件！所有屬性名稱 (Key) 必須強制用雙引號 \" 包裹；字串值也必須用雙引號，絕不可使用單引號；最後一個欄位後嚴禁尾隨逗號 (No trailing comma)；不可包含函式、undefined 或註解。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "發送 POST/PUT 請求時，忘記設定 Content-Type: application/json",
          why: "使用 fetch() 或某些 HTTP 工具發送 JSON 字串時，若未顯式宣告 Content-Type 標頭，許多後端框架 (如 Express.js, Django, FastAPI) 會將請求本體視為純文字或表單，導致後端的 req.body 解析失敗變為 undefined 或空物件。",
          fix: "發送 JSON 請求時，養成肌肉記憶務必加上標頭：headers: { 'Content-Type': 'application/json' }，並確認傳入的 body 經過 JSON.stringify(payload) 序列化為合規字串。"
        },
        {
          title: "在 GET 請求的 Query Parameters 中明文傳遞密碼或私密金鑰",
          why: "初學者圖方便把帳號密碼或機密 token 串在 URL 網址後方 (如 /api/login?pwd=secret)。URL 網址會被瀏覽器歷史紀錄、CDN 快取層、反向代理伺服器 access.log 全程明文記錄，造成嚴重資安災難。",
          fix: "敏感機密資訊絕不可置於 URL 查詢字串中！身分驗證資訊應放在 Authorization 標頭，使用者登入或密碼更新必須使用 HTTPS 加密連線搭配 POST 請求置於 Request Body 中傳遞。"
        },
        {
          title: "JSON 格式混入單引號或結尾逗號導致 JSON.parse 崩潰",
          why: "前端開發者習慣寫 JS 物件語法 { name: 'Alex', }，直接當作 JSON 傳遞或儲存，導致程式執行 JSON.parse() 時噴出 Uncaught SyntaxError: Unexpected token 錯誤。",
          fix: "切記標準 JSON 的三不原則：『不用單引號、不留結尾逗號、不寫註解』。所有鍵名一律用英文雙引號包裹，例如 {\"name\": \"Alex\"}。可使用 linter 或線上 JSONLint 工具快速檢驗格式合規性。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "curl -X GET \"https://api.example.com/v1/users?limit=5\"", desc: "以 GET 方法向 API 發送帶有分頁參數的查詢請求" },
        { cmd: "curl -X POST \"https://api.example.com/v1/posts\" -H \"Content-Type: application/json\" -d '{\"title\":\"Hello\"}'", desc: "以 POST 方法攜帶 JSON 酬載建立新資源" },
        { cmd: "curl -I \"https://api.example.com/health\"", desc: "只請求 HTTP 回應標頭 (Headers) 快速檢查伺服器健康度與狀態碼" },
        { cmd: "const data = await res.json();", desc: "在現代 JavaScript 中將 HTTP 回應串流解析為原生物件" },
        { cmd: "JSON.stringify({ active: true, count: 42 })", desc: "將原生 JavaScript 物件序列化為標準 JSON 格式字串" },
        { cmd: "JSON.parse('{\"status\": \"ready\"}')", desc: "將標準 JSON 字串反序列化為記憶體中的物件" }
      ],
      widgetId: "api-widget",
      widgetProps: {
        initialEndpoint: "https://api.vibecoder.dev/v1/ai/generate",
        initialMethod: "POST",
        initialHeaders: [
          { key: "Content-Type", value: "application/json" },
          { key: "Authorization", value: "Bearer sk-test-mock-token" }
        ],
        sampleBody: "{\n  \"model\": \"vibe-fast-1\",\n  \"prompt\": \"Explain REST APIs to a 10 year old\",\n  \"temperature\": 0.7\n}"
      },
      quiz: [
        {
          question: "你正在設計一個使用者個人檔案的 API。當使用者僅僅想要修改其個人的『居住城市 (city)』欄位，而不希望更動其他既有欄位時，依照 RESTful 語意標準，最佳的 HTTP 動詞是哪一個？",
          options: [
            "GET",
            "POST",
            "PUT",
            "PATCH"
          ],
          answer: 3,
          explanation: "PATCH 動詞專門用於對既有資源進行局部部分更新 (Partial Modification)；PUT 則是用於全量替換 (Full Replacement)；POST 用於建立新資源；GET 用於安全讀取。"
        },
        {
          question: "下列哪一個字串符合嚴格的標準 JSON 語法規範？",
          options: [
            "{ 'title': 'Vibe Coding', 'completed': true }",
            "{ \"title\": \"Vibe Coding\", \"completed\": true, }",
            "{ \"title\": \"Vibe Coding\", \"completed\": true }",
            "{ title: \"Vibe Coding\", completed: true }"
          ],
          answer: 2,
          explanation: "標準 JSON 要求所有的鍵名 (Key) 必須強制使用雙引號包裹，字串值也必須使用雙引號，且最後一個欄位後面絕對不可以出現結尾逗號 (Trailing comma)。因此只有第三個選項完全合法。"
        }
      ]
    },

    {
      id: "machine-auth",
      trackId: "track-5",
      trackTitle: "AI 擴充生態與代理通訊協定",
      unitNumber: 13,
      title: "機器認證與憑證安全",
      subtitle: "防禦金鑰洩漏與帳單破產：API Key、Bearer Token、.env 環境變數管理與限速防禦",
      readingTime: "6 分鐘",
      prerequisites: ["REST API 基礎 (Headers 與 Request 結構)", "Git 版本控制概念 (如 .gitignore 與 commit 歷史)"],
      coreConcepts: [
        {
          title: "機器身分認證光譜：API Key、Bearer Token 與 OAuth 2.0",
          description: "在現代雲端與 AI 開發中，程式需要代表特定使用者或系統向外部雲端發出操作。與人類依靠帳號密碼登入不同，機器與服務之間依賴專門的機器認證憑證 (Credentials)。選擇合適的認證等級對於系統安全性至關重要。",
          points: [
            "API Key (應用程式金鑰)：服務商頒發的靜態長字串（如 OpenAI 的 sk-proj-xxxx）。容易設定與使用，但通常具備廣泛權限，一旦外洩攻擊者即可直接冒用你的帳戶調用資源。",
            "Bearer Token (持有人權杖)：在 HTTP 標頭中以 Authorization: Bearer <token> 傳送。通常具備明確的有效期限 (TTL，例如 1 小時) 與數位簽章 (如 JWT)，即使被攔截過期即失效，安全性遠高於永久 API Key。",
            "OAuth 2.0 委派授權框架：常見於『以 Google / GitHub 登入』或串接第三方 SaaS。使用者不需向第三方交出自己的帳號密碼，而是由原廠發行受限範圍 (Scopes) 的 Access Token，且隨時可在帳戶後台單向撤銷權限。"
          ]
        },
        {
          title: "防禦洩漏的核心準則：.env 環境變數管理與隔離架構",
          description: "將機密金鑰直接硬編碼 (Hardcode) 在程式碼中，是現代軟體開發的第一大死因。網路上有成千上萬個自動化爬蟲機器人，在 GitHub 提交記錄中即時嗅探外洩的金鑰。一旦 OpenAI、AWS 或 Stripe 金鑰被爬取，數分鐘內就會被惡意程式盜刷消耗殆盡，造成數萬美元的天價帳單。",
          points: [
            "絕對不硬編碼：程式原始碼中絕不出現任何真實金鑰字串，一律透過 process.env.API_KEY (Node.js) 或 os.environ.get('API_KEY') (Python) 自作業系統環境變數動態讀取。",
            "本地開發隔離 (.env)：本地端將金鑰集中儲存在專案根目錄的 .env 檔案中，並在專案初始化時立即將 .env 加入 .gitignore 忽略清單中。",
            "提供範本檔案 (.env.example)：向團隊成員展示專案所需的環境變數清單，但裡面只保留空字串或假資料 (如 OPENAI_API_KEY=your_key_here)，安全地提交至版本控制中。",
            "生產環境注入機制：雲端託管平台 (Vercel, AWS, Cloudflare, Fly.io) 提供專屬的後台環境變數注入介面，金鑰直接在伺服器記憶體中加載，不落地生成任何實體檔案。"
          ]
        },
        {
          title: "API 限速 (Rate Limiting) 機制與指數退避演算法 (Exponential Backoff)",
          description: "所有商用 API (特別是熱門 AI 模型 API) 都設有嚴格的調用頻率限制，防止伺服器超載。當請求過於頻繁時，API 會拒絕服務並回傳 429 狀態碼。建立具備韌性的重試機制是現代代理程式的必修課。",
          points: [
            "限速維度指標：包含 RPM (Requests Per Minute，每分鐘請求數)、TPM (Tokens Per Minute，每分鐘權杖量) 以及每日花費配額。",
            "429 Too Many Requests 狀態碼：伺服器通常會在回應標頭中附帶 Retry-After: 20 資訊，告知用戶端應暫停等待多少秒後再行重試。",
            "拒絕粗暴的立即重試 (Retry Storm)：若在遭遇 429 時立刻用 while 迴圈密集重試，只會讓伺服器負載加劇，甚至導致整組 IP 被伺服器防火牆列入黑名單永久封鎖。",
            "指數退避與隨機抖動 (Exponential Backoff with Jitter)：重試間隔應隨失敗次數呈指數遞增 (如 1s, 2s, 4s, 8s)，並加上少量隨機毫秒延遲 (Jitter)，避免多個客戶端在同一時刻同時發起請求引發尖峰共振。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "將私密 API Key 暴露在前端 HTML / Vue / React 瀏覽器代碼中",
          why: "新手直接在前端 JavaScript 寫 const apiKey = 'sk-proj-xxxx' 並直接呼叫 OpenAI API。瀏覽器中的所有程式碼與 Network 網路封包對訪客完全透明（按下 F12 開發者工具即可秒看），金鑰等同公諸於世。",
          fix: "金鑰必須且只能存在於後端伺服器 (Serverless Function, Node.js, Python API 或 Cloudflare Worker)！前端只呼叫自己的後端端點 (/api/chat)，由後端在伺服器內部帶著安全金鑰代理向外請求，再將過濾後的結果回傳給前端。"
        },
        {
          title: "已經 git commit 提交了 .env 檔案，才事後把它補進 .gitignore",
          why: "一旦檔案曾經被 commit 存入版本歷史，就算事後在 .gitignore 加上檔名，Git 依然會持續追蹤該檔案的歷史紀錄。將專案推送到遠端時，任何人翻閱 git log 歷史都能完整挖出當時的金鑰明文！",
          fix: "立刻執行 git rm --cached .env 從 Git 索引快取中移除追蹤，重新 commit；但最根本且不可妥協的安全準則是：『只要金鑰曾進入過 commit，該金鑰就必須立刻在雲端服務商控制台註銷廢棄 (Revoke)，並重新生成一組全新金鑰』！"
        },
        {
          title: "未在 API 服務商控制台設定硬性消費上限 (Hard Spending Limit)",
          why: "綁定信用卡啟用 AI API 後，未設定每月配額上限。若程式碼寫出無窮迴圈、代理程式失控狂刷，或是金鑰遭到竊取，信用卡帳單可能在數小時內被刷爆數千甚至數萬美元。",
          fix: "註冊任何付費 API 後的第一件事：立刻前往後端 Billing / Limits 設定頁面，設定硬性中斷上限 (Hard Limit，例如每月最高 30 美元直接阻斷連線)，並設定 50%、80% 門檻時發送 Email 警報通知。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "echo \".env\" >> .gitignore", desc: "將 .env 環境變數檔加入 Git 忽略清單防止提交" },
        { cmd: "git rm --cached .env", desc: "從 Git 版本追蹤中移除已經誤追蹤的 .env 檔案" },
        { cmd: "export OPENAI_API_KEY=\"sk-proj-xxxx\"", desc: "在當前 Shell 工作環境中設定暫時性環境變數" },
        { cmd: "curl -H \"Authorization: Bearer $MY_TOKEN\" https://api.service.com", desc: "以 Bearer Token 形式安全傳遞認證權杖" },
        { cmd: "cp .env.example .env", desc: "複製環境變數範本並準備填入本地私密金鑰" },
        { cmd: "npx gitleaks detect --source . -v", desc: "使用資安工具全域掃描本機 Git 歷史中是否存在洩漏的私鑰與權杖" }
      ],
      widgetId: "auth-widget",
      widgetProps: {
        modes: ["safe-backend", "vulnerable-frontend"],
        rateLimitConfig: {
          rpmLimit: 60,
          currentRpm: 58,
          retryAfterSeconds: 15
        },
        envAuditSample: {
          isGitIgnored: true,
          hasHardcodedKeys: false,
          budgetHardLimitSet: true
        }
      },
      quiz: [
        {
          question: "你正在為個人網站打造一個基於 Claude API 的智慧客服聊天機器人。為了確保 API Key 絕對安全，下列哪一種架構設計是唯一正確的實踐？",
          options: [
            "在前端 React 程式碼中將金鑰設定為 const CLAUDE_KEY = 'sk-ant-...' 並直接 fetch 官方 API",
            "將金鑰放在靜態 public/config.json 檔案中，前端載入網頁時讀取該設定檔",
            "前端只向自己的後端代理端點 (/api/chat) 發送請求，由後端從伺服器環境變數讀取金鑰並代理呼叫 Claude API",
            "將前端程式碼進行 Webpack 壓縮混淆 (Minify/Obfuscate)，金鑰就不會被別人看見"
          ],
          answer: 2,
          explanation: "前端瀏覽器環境的一切資料 (包含程式碼、記憶體、網路請求) 對訪客完全是公開透明的。任何混淆技術都阻擋不了 F12 Network 封包檢查。唯一安全的做法是由自己受控的後端伺服器作為代理 (BFF 架構)，將金鑰嚴格保存在後端環境變數中。"
        },
        {
          question: "當你的自動化程式向 AI API 發送大量批次任務時，收到了 HTTP 429 Too Many Requests 回應，且標頭包含 Retry-After: 30。此時程式應該如何反應最恰當？",
          options: [
            "使用 while (true) 迴圈每隔 100 毫秒立即重試，直到成功為止",
            "暫停發送請求至少 30 秒，並搭配指數退避與隨機抖動 (Exponential Backoff with Jitter) 演算法逐步重試",
            "立刻在請求標頭加上 bypass-cache: true 繞過伺服器限速限制",
            "將 HTTP 動詞從 POST 改為 GET 重新發送相同請求"
          ],
          answer: 1,
          explanation: "HTTP 429 標誌著已超出伺服器的頻率限制。遵守 Retry-After 宣告暫停 30 秒，並採用指數退避演算法 (Exponential Backoff with Jitter) 漸進重試，是維護分散式系統健康與防止本機 IP 被永久封鎖的專業標準作法。"
        }
      ]
    },

    {
      id: "agent-protocols",
      trackId: "track-5",
      trackTitle: "AI 擴充生態與代理通訊協定",
      unitNumber: 14,
      title: "AI 代理擴充協定與工具架構",
      subtitle: "解構自主 AI 的手與眼：從 Function Calling、Skills 到 Model Context Protocol (MCP) 開放標準",
      readingTime: "6 分鐘",
      prerequisites: ["REST API 與 JSON 語法 (Schema 與 JSON-RPC)", "命令列基礎與行程間通訊 (IPC / stdio) 概念"],
      coreConcepts: [
        {
          title: "大語言模型的本質極限與工具調用 (Tool Calling / Function Calling)",
          description: "純大語言模型 (LLM) 本質上只是一個基於海量文字預測下一個 Token 的機率計算機。它擁有豐富的語義世界知識，但先天存在兩大缺陷：無法感知即時動態世界 (知識凍結在訓練截止日)，且無法對現實世界產生實體副作用 (無法真正查詢資料庫、發送 Slack 訊息或下單結帳)。工具調用架構賦予了 AI『手』與『眼』。",
          points: [
            "模型並不直接執行程式碼：很多初學者的誤解以為是 LLM 自己在伺服器上執行了 Python 或 SQL。實際上，模型只是在閱讀使用者的問題後，從開發者提供的工具規格清單中，挑選合適的工具並輸出結構化的 JSON 參數指令。",
            "宿主應用程式 (Host Runtime) 的中介角色：宿主程式 (例如 Cursor, Claude Desktop, 自架 Agent 引擎) 負責接收模型的 JSON 指令，在真實作業系統中執行該函式，再將執行結果回傳給模型。",
            "思維鏈迴圈 (ReAct Loop)：AI 代理依照『思考 (Thought) -> 行動 (Action / Tool Call) -> 觀察 (Observation / Tool Result) -> 再次思考』的迴圈反覆運作，直到最終達成目標。"
          ]
        },
        {
          title: "從擴充孤島到統一標準：Model Context Protocol (MCP) 的興起",
          description: "在過去，每一家 AI 系統（OpenAI GPTs, LangChain, AutoGPT, 專屬外掛）都有自己的一套工具定義規範。如果你開發了一個『查詢 Notion 資料庫』的擴充功能，想移植到另一個 AI 平台，就必須痛苦地重寫整套外掛轉接器。Anthropic 於 2024 年底推出的 Model Context Protocol (MCP) 徹底改寫了這個局面。",
          points: [
            "AI 時代的 USB-C 開放標準：正如 Language Server Protocol (LSP) 統一了程式碼編輯器的語法高亮與自動補全，MCP 致力於統一所有 AI 客戶端與外部資料工具之間的連線標準。",
            "即插即用的開放生態：開發者只需編寫一次 MCP 伺服器 (Server)，即可無縫接入 Claude Desktop, Cursor, Zed, 智慧代理或任何相容的 MCP 客戶端 (Client)。",
            "MCP 的三大核心原語 (Primitives)：\n1. Resources (資源)：類似檔案系統或資料庫唯讀記錄，作為被動上下文餵給模型；\n2. Tools (工具)：具備副作用、需要模型主動調用的可執行函式 (如執行 Git 指令、發送 HTTP 請求)；\n3. Prompts (提示詞範本)：預先封裝好的專業工作流範本與指令提示詞。"
          ]
        },
        {
          title: "MCP 通訊架構 (JSON-RPC 2.0) 與人機協作安全防線 (Human-in-the-Loop)",
          description: "MCP 採用成熟簡潔的 JSON-RPC 2.0 作為傳輸協議，定義了客戶端與伺服器之間的請求、回應與通知機制。由於 AI 代理具備調用工具甚至寫入外部系統的能力，架構設計必須建立嚴格的權限安全機制。",
          points: [
            "傳輸通道 (Transports)：\n- stdio (標準輸入輸出)：用於本機端行程間通訊 (IPC)，宿主直接啟動 MCP 伺服器子行程，安全隔離且延遲極低；\n- SSE (Server-Sent Events) / HTTP：用於遠端雲端架構，支援分散式工具微服務。",
            "Tool Schema 的嚴格性：MCP 工具透過 JSON Schema 明確規範參數名稱、型態、是否必填與功能說明。清晰的自然語言描述是防止模型幻覺與誤呼叫的關鍵。",
            "人機協作授權 (Human-in-the-Loop)：對於具有破壞性、不可逆或牽涉外部連線的工具操作（例如刪除檔案、執行未受限終端機指令、發送付款），宿主客戶端必須跳出確認提示視窗，經由人類使用者親自點擊同意後方可執行。"
          ]
        }
      ],
      pitfalls: [
        {
          title: "給予 AI 代理不受限的 Shell 執行權限引發破壞性災難",
          why: "有些開發者為了讓 Agent『什麼都能做』，直接給它掛載一個可以執行任意 bash 指令且具備 sudo 權限的工具。一旦網頁內容或檢索到的檔案中潛藏著『間接提示詞注入 (Indirect Prompt Injection)』攻擊指令，AI 可能被操縱執行 rm -rf 或將本機 ~/.ssh 私鑰上傳到攻擊者的伺服器。",
          fix: "落實最小權限原則 (Principle of Least Privilege)：工具應為單一職責專屬封裝（如『讀取指定目錄檔案清單』而非『任意系統指令』）；涉及系統修改的操作一律配置沙盒隔離，並強制要求使用者人工確認。"
        },
        {
          title: "Tool Schema 的描述 (description) 含混不清導致調用率低或參數格式崩潰",
          why: "在定義 MCP 工具或 Function Calling 時，把 description 寫得極度簡略（如 desc: 'fetch data'）。模型無法理解該工具何時適用，或者在該傳入 ISO 8601 日期格式時傳入了自然語言文字，導致後端執行拋錯。",
          fix: "將 Schema 的 description 當作 Prompt 來精心撰寫：詳細說明『此工具的用途』、『適用的具體情境』、『各參數的格式範例 (如 YYYY-MM-DD)』與『邊界限制』。高品質的描述能使模型呼叫精準度提升到 95% 以上。"
        },
        {
          title: "本機 stdio 伺服器拋出非 JSON 格式的除錯訊息污染通訊管道",
          why: "開發自己的 MCP 伺服器時，開發者習慣在程式碼中寫 console.log('DEBUG: connected')。在 stdio 通訊模式下，console.log 會直接寫入 stdout，破壞了 JSON-RPC 的資料格式封裝，導致 MCP Client 解析錯誤而閃退斷線。",
          fix: "在 stdio 模式的 MCP 伺服器中，所有內部除錯日誌與狀態追蹤必須一律導向標準錯誤輸出 (stderr，在 Node.js 中為 console.error())，確保 stdout 管道 100% 僅流通合規的 JSON-RPC 訊息。"
        }
      ],
      commandsCheatsheet: [
        { cmd: "npx -y @modelcontextprotocol/create-server my-agent-tool", desc: "快速建立符合官方標準規範的 MCP 伺服器專案腳手架" },
        { cmd: "claude mcp add weather-tool -- node /path/to/server.js", desc: "將本地自建的 MCP 工具伺服器註冊至 Claude Desktop 客戶端" },
        { cmd: "uvx mcp-server-git --repository /path/to/my-repo", desc: "使用 uvx 免安裝即時運行官方開源的 Git MCP 伺服器" },
        { cmd: "tail -f ~/Library/Logs/Claude/mcp*.log", desc: "即時監控 MCP 通訊協定連線日誌與除錯訊息 (macOS)" },
        { cmd: "echo '{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}' | node server.js", desc: "透過 stdio 管道手動測試 MCP 伺服器的工具清單查詢" }
      ],
      widgetId: "mcp-widget",
      widgetProps: {
        activeServer: "github-mcp-server",
        transport: "stdio",
        toolsCatalog: [
          { name: "read_issue", desc: "讀取指定 GitHub 倉庫的 Issue 詳細內容與留言" },
          { name: "create_pull_request", desc: "建立新的 PR 分支合併請求", requiresApproval: true },
          { name: "search_code", desc: "在程式庫中進行語意程式碼檢索" }
        ],
        sampleJsonRpc: "{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 104,\n  \"method\": \"tools/call\",\n  \"params\": {\n    \"name\": \"search_code\",\n    \"arguments\": {\n      \"query\": \"authMiddleware\"\n    }\n  }\n}"
      },
      quiz: [
        {
          question: "在 Model Context Protocol (MCP) 架構中，關於『Tools (工具)』與『Resources (資源)』的差異，下列何者敘述最精確？",
          options: [
            "Tools 只能由人類手動點擊執行；Resources 只能由 AI 自行讀取",
            "Resources 是被動的資料來源 (如唯讀檔案或資料庫記錄) 作為上下文；Tools 則是具備副作用、可由模型主動發起調用的可執行動作",
            "Tools 只能用在 Python 語言；Resources 只能用在 TypeScript 語言",
            "Resources 必須使用 HTTP 傳輸；Tools 只能使用 stdio 傳輸"
          ],
          answer: 1,
          explanation: "在 MCP 規範中，Resources 類似唯讀檔案系統或查詢記錄，專門提供資料給模型閱讀補充上下文；而 Tools 則是可執行的函式，通常會產生外部副作用 (如發送訊息、修改資料庫、建立 Commit)，需要模型決定調用並由宿主管控執行安全。"
        },
        {
          question: "當你使用 Node.js 開發一個基於 stdio (標準輸入輸出) 傳輸的本地 MCP 伺服器時，若需要在程式中印出除錯訊息，應該使用哪一種方式？",
          options: [
            "使用 console.log() 直接輸出到標準輸出",
            "使用 console.error() 輸出到標準錯誤 (stderr)",
            "直接使用 alert() 跳出對話視窗",
            "將文字寫入作業系統剪貼簿中"
          ],
          answer: 1,
          explanation: "在 stdio 傳輸模式下，stdout 專門用於傳遞 JSON-RPC 2.0 協定封包。若使用 console.log() 印出雜訊，會破壞協定解析引發崩潰。因此所有除錯與記錄訊息必須導向 stderr (即 console.error())，才不會干擾通訊。"
        }
      ]
    }
  ];

  window.TRACKS_PART_2 = TRACKS_PART_2;
})();
