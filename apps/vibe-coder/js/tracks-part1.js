/**
 * Vibe Coder - Tracks Part 1 (Units 1 - 9)
 * 涵蓋 Track 1 ~ Track 3：現代開發者工作台、網路核心與 Git 版本控制
 * 嚴格遵循台灣繁體中文 (zh-TW) 軟體工程詞彙規範
 */

const TRACKS_PART_1 = [
  // =========================================================================
  // TRACK 1: 現代開發者工作台 (Units 1 - 3)
  // =========================================================================
  {
    id: "workspace-modes",
    trackId: "track-1",
    trackTitle: "現代開發者工作台",
    unitNumber: 1,
    title: "IDE vs CLI vs 桌面應用程式：現代開發者工作模式",
    subtitle: "理解不同開發介面的分工與優勢，為 AI 協作打造最高效的工作流",
    readingTime: "6 分鐘",
    prerequisites: ["具備一般電腦檔案管理經驗", "對文字編輯器有基本概念"],
    coreConcepts: [
      {
        title: "IDE (整合開發環境)：視覺化編寫與專案中樞",
        description: "VS Code、Cursor 等現代 IDE 整合了程式碼高亮、語意診斷（LSP）、除錯器、Git 介面與終端機。現代 AI-first IDE 更直接將大型語言模型深度整合至編輯器中，能自動索引多檔案結構、提供智慧行內補全並追蹤變更。",
        points: [
          "視覺化呈現多檔案目錄樹與即時語法提示，大幅降低記憶專案路徑的心智負擔。",
          "透過豐富的擴充套件生態系（Extensions）支援除錯器、資料庫檢視器與主題外觀客製化。",
          "AI 時代的核心工作台：提供完整的專案上下文視窗（Context Window），讓 AI 能夠理解全域符號關聯。"
        ]
      },
      {
        title: "CLI (命令列介面)：極速、自動化與無頭伺服器的共通語言",
        description: "終端機純文字環境（CLI）是所有開發工具的底層基石。從遠端雲端虛擬機（AWS EC2、GCP Compute Engine）、Docker 容器，到 CI/CD 自動化流程與 AI Agent 的背景指令執行，CLI 能用最低的系統資源提供最高的自動化威力。",
        points: [
          "無圖形介面負擔，完全支援腳本化（Scriptable），能透過管線（Pipe）與篩選工具串接多個程式。",
          "遠端伺服器與 Docker 容器運作的業界標準協定，SSH 連線後的必備操作環境。",
          "AI Agent（如 Claude Code、Aider、Antigravity CLI）能直接執行 CLI 指令並讀取輸出結果進行自主除錯與驗證。"
        ]
      },
      {
        title: "GUI Clients 與桌面專用工具：直觀管理特定領域資源",
        description: "如 Git 圖形用戶端（SourceTree、Fork）、API 測試工具（Postman、Bruno）與資料庫管理軟體（TablePlus、DBeaver）。GUI 工具在複雜分支線圖檢視、資料庫表格關聯直覺瀏覽時具有無可取代的視覺優勢。",
        points: [
          "直觀呈現高維度關聯資料（例如多分支合併圖、關聯式資料庫的外鍵樹狀圖）。",
          "適合視覺核對與一次性操作，但無法像 CLI 輕易納入自動化腳本或交由 AI 自動排程。",
          "現代成熟工作流通常採「IDE 核心 + 內嵌 CLI + 輔助 GUI」的混搭模式。"
        ]
      },
      {
        title: "Vibe Coder 的多重工作流搭配策略",
        description: "在 AI 協作開發時代，推薦將現代 IDE（如 Cursor 或 VS Code）作為主視窗，利用其內建的分割終端機運行本機伺服器與 AI Agent，僅在需要複雜資料表比對或複雜衝突解題時呼叫專屬 GUI 工具。",
        points: [
          "主戰場：單一 IDE 視窗管理程式碼與終端機，減少頻繁切換視窗帶來的注意力分散。",
          "Agent 視窗：讓以 CLI 運行的 AI Agent 跑在背景終端機，自動回報進度與測試結果。",
          "快速檢驗：瀏覽器與開發者工具（DevTools）常駐第二螢幕，形成「編碼 - Agent 驗證 - 視覺反饋」的高效閉環。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "誤以為 GUI 與 CLI 的專案狀態互相衝突",
        why: "新手在 VS Code 修改了程式碼，又在終端機執行 git commit，常擔心會不會搞亂檔案，或是因為沒按「儲存（Save）」導致 CLI 讀到舊檔案。",
        fix: "底層檔案系統是唯一的真相來源（Single Source of Truth）。在 IDE 中開啟「Auto Save（自動儲存）」功能，確保編輯內容即時寫入硬碟，CLI 與 GUI 就能讀取一致的狀態。"
      },
      {
        title: "在 GUI 視窗中陷入無限點擊，無法被 AI 代理自動化",
        why: "過度依賴滑鼠點擊按鈕來建置或部署專案。當想要讓 AI Agent 幫忙執行自動測試或自動除錯時，Agent 無法模擬桌面點擊操作。",
        fix: "凡是可重複的建置、測試、打包動作，都應整理成 package.json 中的 npm scripts 或 Makefile 指令，讓人類與 AI 都能用一行指令精確執行。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "code .", desc: "在目前目錄開啟 VS Code 編輯器" },
      { cmd: "cursor .", desc: "在目前目錄開啟 Cursor IDE 編輯器" },
      { cmd: "which code", desc: "檢查 VS Code 指令列工具是否已正確加入系統 PATH" },
      { cmd: "echo $SHELL", desc: "檢查目前終端機所使用的 Shell 種類" }
    ],
    widgetId: "workspace-widget",
    widgetProps: {
      modes: ["ide", "cli", "gui"],
      defaultMode: "ide"
    },
    quiz: [
      {
        question: "關於現代開發工作模式（IDE、CLI、GUI）的選擇，下列敘述何者最符合現代最佳實踐？",
        options: [
          "CLI 已經完全被現代 IDE 取代，學習 CLI 指令對現代開發者毫無價值。",
          "現代最佳實踐通常以 IDE 作為開發編輯中樞，結合內建終端機（CLI）執行自動化腳本與 AI Agent，並以專用 GUI 輔助檢視複雜關聯資料。",
          "所有雲端伺服器與 Docker 容器預設都提供滑鼠點擊的完整桌面 GUI 介面。",
          "AI Agent 只能點擊桌面 GUI 應用程式，無法透過 CLI 讀取終端機輸出。"
        ],
        answer: 1,
        explanation: "現代專業工作流強調以 IDE 作為核心編輯中樞，終端機（CLI）負責快速建置、自動化測試與 AI Agent 互動，而雲端伺服器通常僅提供 CLI 環境。"
      },
      {
        question: "當你在 IDE 撰寫程式碼，但在終端機執行程式時卻發現修改完全沒有生效，最常見的根本原因是什麼？",
        options: [
          "終端機軟體需要重新安裝才能讀取新程式碼。",
          "IDE 中的檔案尚未存檔（未寫入硬碟），底層檔案系統仍保留修改前的舊內容。",
          "CLI 與 IDE 使用完全不同的硬碟分割區，無法存取同一個專案資料夾。",
          "必須先將程式碼推送到 GitHub 雲端，本地終端機才能抓取更新。"
        ],
        answer: 1,
        explanation: "IDE 編輯中的暫存內容若未存檔寫入實體硬碟，終端機執行的直譯器或編譯器只會讀取硬碟上的舊檔案。開啟 VS Code 自動儲存（Auto Save）即可避免此問題。"
      }
    ]
  },

  {
    id: "terminal-shell",
    trackId: "track-1",
    trackTitle: "現代開發者工作台",
    unitNumber: 2,
    title: "終端機與 Shell 核心概念：與作業系統的底層對話",
    subtitle: "搞懂 Terminal vs Shell、環境變數、標準串流與管線 (Pipe) 的串接威力",
    readingTime: "7 分鐘",
    prerequisites: ["了解如何開啟終端機應用程式"],
    coreConcepts: [
      {
        title: "Terminal (終端機視窗) vs Shell (命令直譯器)",
        description: "終端機（Terminal、iTerm2、Ghostty）只是負責顯示字元與接收鍵盤輸入的外殼「視窗」；Shell（zsh、bash、fish）才是背後負責解析指令文字、調度作業系統核心（Kernel）與管理行程的「直譯器程式」。Mac 目前預設 Shell 為 zsh，Linux 伺服器大多預設為 bash。",
        points: [
          "Terminal 負責圖形彩現、字型顯示、色彩主題與游標繪製。",
          "Shell 負責指令語法解析、路徑搜尋（$PATH）、別名（alias）與環境變數展開。",
          "設定檔（如 ~/.zshrc 或 ~/.bashrc）在每次開啟 Shell session 時會被依序讀取載入。"
        ]
      },
      {
        title: "標準串流（Standard Streams）：stdin、stdout 與 stderr",
        description: "每個 Unix 行程啟動時，作業系統都會預設開啟三個檔案描述子（File Descriptors）：標準輸入（stdin / fd 0）、標準輸出（stdout / fd 1）、標準錯誤輸出（stderr / fd 2）。終端機預設將 stdout 與 stderr 同時印在螢幕上，但它們在底層是完全獨立的資料通道。",
        points: [
          "stdin (0)：程式讀取外部資料的串流（通常來自鍵盤輸入或管線傳送）。",
          "stdout (1)：程式正常運行產生的輸出結果。",
          "stderr (2)：錯誤訊息、診斷與告警日誌；即使 stdout 被重新導向，stderr 仍可獨立分離或存檔。"
        ]
      },
      {
        title: "重導向（Redirection）與管線（Pipe |）",
        description: "管線運算子 | 能將前一個程式的 stdout 直接串接到下一個程式的 stdin，實踐 Unix「每個工具只做好一件事，用管線組合強大功能」的哲學。重導向 >（覆寫）與 >>（附加）則將輸出導向檔案；2>&1 能將錯誤輸出合併到正常輸出通道。",
        points: [
          "`command > file.txt`：將標準輸出覆寫存入檔案；`command >> file.txt` 為追加寫入尾端。",
          "`command 2> error.log`：將錯誤訊息獨立儲存至日誌檔，保持螢幕或正常輸出乾淨。",
          "`ps aux | grep node`：將所有運行中處理程序清單藉由管線傳送給 grep 篩選關鍵字。"
        ]
      },
      {
        title: "環境變數（Environment Variables）與 PATH 運作原理",
        description: "當在終端機輸入 python 或 git 時，Shell 並不會盲目搜尋整個硬碟，而是依序檢查 $PATH 環境變數中列出的一連串目錄。如果執行檔不在這些目錄內，Shell 就會回傳 command not found。",
        points: [
          "`echo $PATH` 檢視目錄搜尋順序清單，各目錄以冒號 `:` 分隔。",
          "`export API_KEY=xyz` 設定當前 Shell session 的環境變數，子行程可繼承存取。",
          "若要永久生效需寫入設定檔（Mac 寫入 `~/.zshrc`），儲存後執行 `source ~/.zshrc` 重新載入。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "安裝工具後遭遇 command not found 驚魂記",
        why: "剛用 Homebrew 或 uv 安裝了軟體，但在終端機打指令卻跳出 zsh: command not found。通常是因為執行檔所在目錄尚未加入系統 $PATH，或是尚未重新載入設定檔。",
        fix: "執行 `echo $PATH` 檢查安裝路徑（如 `/opt/homebrew/bin` 或 `~/.local/bin`）。若路徑缺失，在 `~/.zshrc` 底部加入 `export PATH=\"$HOME/.local/bin:$PATH\"` 並執行 `source ~/.zshrc`。"
      },
      {
        title: "誤用 > 覆寫重要日誌或程式碼檔案",
        why: "`>` 運算子會在寫入前直接將目標檔案清空。原本想追加日誌卻誤打成 `>`，導致原有珍貴資料瞬間歸零消失。",
        fix: "日誌追加一律養成使用 `>>` 的肌肉記憶。在執行管線與重導向操作前，務必確認專案已納入 Git 版本控制，或使用 `tee -a` 同時於螢幕輸出並安全追加至檔案。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "echo $SHELL", desc: "顯示目前正在使用的 Shell 種類" },
      { cmd: "printenv", desc: "列出目前環境中所有的環境變數" },
      { cmd: "export KEY=VALUE", desc: "在目前 Shell Session 設定環境變數" },
      { cmd: "cat app.log | grep \"ERROR\"", desc: "以管線讀取檔案並篩選包含 ERROR 的行" },
      { cmd: "npm run build > build.log 2>&1", desc: "將標準輸出與錯誤輸出全部合併寫入 build.log 檔案" },
      { cmd: "source ~/.zshrc", desc: "立即在當前視窗重新載入 zsh 設定檔" }
    ],
    widgetId: "terminal-widget",
    widgetProps: {
      initialCommand: "echo $SHELL",
      allowedCommands: ["echo", "cat", "grep", "export", "env", "source"]
    },
    quiz: [
      {
        question: "下列指令 `cat access.log | grep \"404\" > not_found.txt` 的實際執行行為是什麼？",
        options: [
          "搜尋 access.log 中包含 404 的行，並將篩選結果覆寫輸出到 not_found.txt 檔案中。",
          "把 not_found.txt 的內容傳給 grep，並將包含 404 的紀錄寫入 access.log。",
          "刪除 access.log 中所有標註 404 的伺服器存取紀錄。",
          "檢查 not_found.txt 中是否有 404 錯誤，若有則直接顯示於終端機螢幕。"
        ],
        answer: 0,
        explanation: "`cat access.log` 讀取日誌，管線 `|` 將輸出傳遞給 `grep \"404\"` 進行過濾，最後 `>` 重導向運算子將過濾後的標準輸出覆寫存入 `not_found.txt` 檔案中。"
      },
      {
        question: "當你剛安裝了一個 CLI 工具，但在終端機執行時顯示 `zsh: command not found: mytool`，最可能的原因與正確解法是什麼？",
        options: [
          "該工具只能在 Windows 上執行，Mac 系統絕對無法運行任何命令列工具。",
          "該工具的執行檔安裝路徑未包含在系統的 $PATH 環境變數中，應將其安裝目錄加至 PATH 並重新載入 Shell 設定檔。",
          "電腦硬碟空間不足，導致 Shell 自動隱藏了該指令。",
          "必須立刻格式化重灌作業系統才能讓終端機辨識新指令。"
        ],
        answer: 1,
        explanation: "`command not found` 是因為 Shell 在 `$PATH` 所定義的目錄清單中找不到名為 `mytool` 的可執行檔。將正確安裝目錄加入 `$PATH` 並重新載入設定檔即可正常呼叫。"
      }
    ]
  },

  {
    id: "system-permissions",
    trackId: "track-1",
    trackTitle: "現代開發者工作台",
    unitNumber: 3,
    title: "系統權限與防呆：Mac、Linux 與 sudo 的安全界線",
    subtitle: "理解 POSIX 權限 rwx、避開 root 毀滅性操作，建立乾淨安全的本機環境",
    readingTime: "6 分鐘",
    prerequisites: ["了解基本終端機操作與目錄切換 (cd, ls)"],
    coreConcepts: [
      {
        title: "POSIX 權限模型：User, Group, Others 與 rwx",
        description: "在 Mac 與 Linux 檔案系統中，每個檔案與目錄都擁有專屬的權限標記。透過 `ls -l` 可以看見如 `-rwxr-xr--` 的字串，分別代表三組身分：擁有者（User / u）、群組（Group / g）、其他人（Others / o）。",
        points: [
          "r (Read / 4)：讀取檔案內容或列出目錄清單的權限。",
          "w (Write / 2)：修改檔案內容、在目錄中建立或刪除檔案的權限。",
          "x (Execute / 1)：執行二進位程式/腳本，或進入該目錄的權限。",
          "數字表示法：`chmod 755 script.sh` 代表擁有者擁有完整權限 7 (4+2+1)，群組與他人擁有讀取與執行權 5 (4+1)。"
        ]
      },
      {
        title: "一般使用者 vs root (最高管理者) 與 sudo",
        description: "一般開發者帳號受到系統保護限制，無法竄改系統關鍵系統目錄（如 /usr/bin、/System、/etc）。sudo（SuperUser DO）是讓受信任的使用者在驗證身分密碼後，暫時以 root 最高管理者身分執行單一特權指令的通道。",
        points: [
          "日常生活與本機專案開發（npm install、git commit、uv run）絕不需要 sudo。",
          "sudo 僅限於管理系統服務、設定本機防火牆規則、綁定低於 1024 的特權通訊埠或全域軟體升級。",
          "絕對不要為了圖一時方便直接以 root 帳號常態登入，或是對整個專案資料夾下 `sudo chmod -R 777`。"
        ]
      },
      {
        title: "常見災難指令與防呆意識",
        description: "終端機沒有資源回收筒（Recycle Bin），`rm` 一旦執行就直接從硬碟區塊移除 inode 參照，無法透過「復原」救回。尤其是帶有遞迴與強制參數的 `rm -rf`，若後面接錯變數或路徑（如 `rm -rf $DIR/` 當變數為空時會變成 `rm -rf /`），將直接抹除整台電腦的檔案。",
        points: [
          "`rm -rf` 執行前必須反覆確認路徑，禁止在未驗證變數是否為空的情況下直接拼接路徑。",
          "不要盲目複製網路上未經驗證的 `curl ... | bash` 或帶有 sudo 的一鍵安裝腳本。",
          "Mac 的 SIP (System Integrity Protection) 能保護系統核心檔，但完全無法保護你的個人工作目錄與專案檔案。"
        ]
      },
      {
        title: "權限混亂修復：擺脫 npm 與 Python 套件的 sudo 泥淖",
        description: "新手最常犯的錯誤是：遇到權限不足就加 `sudo npm install -g`，導致 node_modules 的擁有人變成 root。之後一般使用者再執行編譯或刪除時，就會陷入一連串 `EACCES: permission denied`。",
        points: [
          "使用使用者等級的現代套件管理工具（如 uv 管理 Python、nvm 或 fnm 管理 Node.js）。",
          "若本機專案檔案擁有者變成 root，使用 `sudo chown -R $(whoami) .` 將權限轉移回當前登入者。",
          "善用現代工具的虛擬環境隔離（venv、node_modules 局部安裝），避免污染全域作業系統。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "遇到 EACCES: permission denied 就反射性加上 sudo",
        why: "新手看到權限被拒絕，以為加上 sudo 是萬能解法，結果導致新產生的快取與建置產物全變成 root 擁有，未來一般指令完全無法讀取或清除。",
        fix: "停下腳步！檢查為什麼需要權限。如果是本機專案目錄，請用 `ls -la` 檢查擁有者，並使用 `sudo chown -R $(whoami) .` 將目錄權限拿回，而不是讓整個專案變成 root 私產。"
      },
      {
        title: "變數未定義導致 rm -rf \"${TARGET_DIR}/\" 變成刪除根目錄",
        why: "在自動化清理腳本中，若變數 TARGET_DIR 拼錯或為空字串，展開後會直接變成 `rm -rf /`，造成災難性檔案遺失。",
        fix: "在 Shell 腳本開頭加上 `set -euo pipefail`（遇到未定義變數或錯誤立即終止腳本）；刪除前加入防禦性檢查：`[[ -n \"$TARGET_DIR\" ]] && rm -rf \"$TARGET_DIR\"`。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "ls -la", desc: "列出目錄下所有檔案（含隱藏檔）的詳細權限與擁有者" },
      { cmd: "chmod +x run.sh", desc: "為指定的腳本檔案增加可執行權限" },
      { cmd: "chmod 755 script.sh", desc: "設定擁有者具讀寫執行權，群組與他人具讀取與執行權" },
      { cmd: "whoami", desc: "印出當前登入的作業系統使用者帳號名稱" },
      { cmd: "sudo chown -R $(whoami) .", desc: "將目前資料夾及其子目錄所有權轉移給當前登入使用者" }
    ],
    widgetId: "permissions-widget",
    widgetProps: {
      initialPermissions: "-rw-r--r--",
      targetPermissions: "-rwxr-xr-x"
    },
    quiz: [
      {
        question: "在開發本機前端或後端專案時，若執行 `npm run dev` 跳出檔案寫入權限錯誤，下列哪種處理方式最安全且符合業界專業規範？",
        options: [
          "永遠改用 `sudo npm run dev` 啟動開發伺服器，方便快速。",
          "執行 `sudo chmod -R 777 /` 將全電腦所有檔案權限無條件開放給任何人。",
          "檢查專案資料夾的擁有者，使用 `sudo chown -R $(whoami) .` 將檔案所有權改回自己，避免使用 sudo 運行日常專案。",
          "把電腦格式化重灌，因為權限錯誤代表電腦已經中毒。"
        ],
        answer: 2,
        explanation: "日常專案應在一般使用者權限下運行。使用 `chown` 將檔案擁有者改為自己（`$(whoami)`）能徹底解決權限問題，絕不應長期以 sudo 運行開發伺服器或隨意開放 777 權限。"
      },
      {
        question: "檔案權限設定為 `chmod 755 script.sh` 時，該檔案的擁有者（User）與其他人（Others）分別具有什麼權限？",
        options: [
          "擁有者具有可讀、可寫、可執行（7 = 4+2+1）；其他人具有可讀與可執行（5 = 4+1），但不能修改寫入。",
          "所有人都可以任意寫入與刪除該檔案。",
          "擁有者只能讀取，其他人具有最高系統管理者權限。",
          "該檔案被完全加密鎖死，任何人都無法執行。"
        ],
        answer: 0,
        explanation: "7 代表 4(r) + 2(w) + 1(x) = 讀、寫、執行；5 代表 4(r) + 1(x) = 讀、執行。因此擁有者具備完整控制權，其他人僅能讀取與執行該腳本。"
      }
    ]
  },

  // =========================================================================
  // TRACK 2: 用戶端、伺服器與瀏覽器核心 (Units 4 - 6)
  // =========================================================================
  {
    id: "client-server-arch",
    trackId: "track-2",
    trackTitle: "用戶端、伺服器與瀏覽器核心",
    unitNumber: 4,
    title: "前端 vs 後端 vs 資料庫：三層架構與資料流本質",
    subtitle: "釐清程式碼是在使用者的瀏覽器跑，還是在遠端伺服器跑，掌控網路請求全貌",
    readingTime: "7 分鐘",
    prerequisites: ["具備網頁基本瀏覽經驗", "了解 HTML/CSS/JavaScript 的大概功能"],
    coreConcepts: [
      {
        title: "三層式架構（3-Tier Architecture）與職責劃分",
        description: "現代 Web 應用最經典的骨架分為三層：前端（Client / Presentation Tier）、後端（Server / Application Tier）、資料庫（Database / Data Tier）。前端負責呈現視覺與互動，後端負責商業邏輯驗證與安全性把關，資料庫負責資料持久化儲存與交易一致性。",
        points: [
          "前端（Client）：在使用者裝置（瀏覽器、手機 App）上執行，原始碼在用戶端完全公開透明可見。",
          "後端（Server / API）：在私有雲端伺服器或無伺服器架構（Serverless）上運行，掌控私密金鑰與商業機密邏輯。",
          "資料庫（Database）：如 PostgreSQL、MySQL、SQLite，嚴禁前端瀏覽器直接建立資料庫連線。"
        ]
      },
      {
        title: "靜態資源 vs 動態渲染 (Static vs Dynamic)",
        description: "靜態網頁（HTML/CSS/JS、圖片）編譯後內容固定，可直接透過 CDN（如 Cloudflare Pages、Vercel、GitHub Pages）全球快取分發，速度極快且成本趨近於零；動態服務則需要在每次請求到達時，由伺服器即時運算、查詢資料庫並組合回傳 JSON 或 HTML。",
        points: [
          "Jamstack 與 SPA（Single Page Application）：靜態資源載入至瀏覽器後，透過 AJAX/fetch 向後端 API 取得動態 JSON 資料。",
          "SSR（Server-Side Rendering）：伺服器先將資料庫內容填入 HTML 模板再傳給瀏覽器，利於 SEO 搜尋引擎優化與首頁載入速度。",
          "現代獨立微型工具（如本站）：常以「純靜態前端 + 本地儲存 LocalStorage」設計，零伺服器維護成本且隱私安全。"
        ]
      },
      {
        title: "HTTP 請求與回應生命週期 (Request & Response Lifecycle)",
        description: "當使用者在網頁點擊「送出訂單」，瀏覽器發送 HTTP POST 請求至後端 API 端點。請求攜帶標頭 Headers（如 Authorization、Content-Type）與主體 Body（JSON 載荷）。後端驗證權限、更新資料庫後，回傳狀態碼（如 200 OK、201 Created、400 Bad Request、401 Unauthorized、500 Server Error）與回應資料。",
        points: [
          "前端不可信任原則：所有表單欄位驗證（如價格、權限身分）後端必須重新嚴格檢查，絕不能依賴前端防護。",
          "無狀態協定（Stateless）：HTTP 本身不記憶狀態，需透過 JWT Token、Session Cookie 或 API Key 識別請求身分。",
          "資料交換標準：現代通訊絕大多數採用 RESTful API 或 JSON-RPC，以結構化純文字 JSON 格式溝通。"
        ]
      },
      {
        title: "前後端分離中的安全邊界（The Security Boundary）",
        description: "初學者最常犯的重大資安事故，就是把 OpenAI API Key 或 Stripe 私鑰直接寫在前端 JavaScript 檔案中。任何放在前端的程式碼、變數、環境變數（如 VITE_ 或 NEXT_PUBLIC_ 開頭），使用者只要按 F12 開發者工具就能一秒看光。",
        points: [
          "金鑰安全鐵則：機密 API Secret Key 只能存放在後端伺服器的環境變數中，絕不可打包進前端代碼。",
          "前端呼叫自建後端 Proxy 端點，再由後端 Proxy 帶上金鑰安全轉發給第三方 AI 服務。",
          "跨來源資源共享（CORS）：瀏覽器的同源政策保護機制，防止未授權惡意網站偷發跨站 API 請求。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "將 OpenAI / Anthropic 的私鑰（API Key）硬編碼寫在前端 JS 中",
        why: "新手為了圖方便，直接在前端網頁中呼叫 `fetch(\"https://api.openai.com/...\", { headers: { Authorization: \"Bearer sk-...\" } })`，並將程式碼推上 GitHub。",
        fix: "駭客有自動化爬蟲 24 小時掃描公開程式碼與網頁檔案，金鑰會在數分鐘內被盜刷數千美元。正確做法是建立極簡後端 API 端點（如 Cloudflare Worker 或 Vercel Serverless Function）作為保護代理人。"
      },
      {
        title: "僅在前端防堵欄位驗證，後端門戶大開",
        why: "以為 HTML 表單加上 required 或 JS 檢查了密碼長度就萬無一失，忽視惡意使用者可以直接用 curl 或 Postman 繞過前端直接發送違規資料到後端資料庫。",
        fix: "牢記「前端驗證是為了使用者體驗（UX），後端驗證才是為了資安防護（Security）」。後端 API 必須對收到的每項參數進行型別、範圍與合法性檢驗。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "curl -i https://httpbin.org/get", desc: "發送 GET 請求並檢視包含 HTTP 狀態碼與 Headers 的完整回應" },
      { cmd: "curl -X POST -H \"Content-Type: application/json\" -d '{\"name\":\"Alex\"}' https://httpbin.org/post", desc: "發送攜帶 JSON 資料的 POST 請求" },
      { cmd: "python3 -m http.server 8000", desc: "用 Python 快速在本地啟動一個純靜態資源檔案伺服器" }
    ],
    widgetId: "architecture-widget",
    widgetProps: {
      tiers: ["frontend", "backend", "database"],
      interactive: true
    },
    quiz: [
      {
        question: "關於 Web 前端（Client）與後端（Server）的職責分工與安全性，下列敘述何者正確？",
        options: [
          "可以在前端 JavaScript 檔案中直接連線生產環境的資料庫（如 PostgreSQL），這樣速度最快且完全安全。",
          "前端程式碼是下載至使用者裝置上運行的，因此任何寫在前端的私密 API 金鑰都會被使用者看光；私密金鑰必須只存放在後端。",
          "只要在前端輸入框設定 required，後端伺服器就不需要再檢驗任何輸入資料。",
          "靜態網頁（HTML/CSS/JS）無法搭配任何 API 實現動態資料互動。"
        ],
        answer: 1,
        explanation: "前端程式碼完全在使用者端執行，任何人只要打開瀏覽器 DevTools 就能看見所有原始碼。因此高權限的金鑰與關鍵商業邏輯必須嚴格留在後端伺服器。"
      },
      {
        question: "當前端發送 API 請求給伺服器，伺服器回傳 HTTP 狀態碼 `401 Unauthorized`，這通常代表什麼意思？",
        options: [
          "伺服器內部發生崩潰或無窮迴圈（Server Error）。",
          "請求成功且資料已順利在資料庫中新增（Created）。",
          "請求缺少有效的身分驗證憑證（例如未登入或 Token 過期無效）。",
          "請求的網址路徑不存在（Page Not Found）。"
        ],
        answer: 2,
        explanation: "401 代表未經身分驗證（Unauthorized），表明客戶端需要提供合法憑證（如 Authorization header 或 Session Cookie）才能存取該受保護資源。"
      }
    ]
  },

  {
    id: "devtools-dom",
    trackId: "track-2",
    trackTitle: "用戶端、伺服器與瀏覽器核心",
    unitNumber: 5,
    title: "瀏覽器內部與 DevTools 實戰：DOM、Console 與網路監控",
    subtitle: "打開瀏覽器的黑盒子，學會用 F12 現場除錯、攔截 Network 請求與即時測試 JS",
    readingTime: "8 分鐘",
    prerequisites: ["了解 HTML 標籤結構與基礎 JavaScript 變數"],
    coreConcepts: [
      {
        title: "DOM（文件物件模型）與渲染樹（Render Tree）",
        description: "瀏覽器下載 HTML 原始碼後，會將其解析成記憶體中的樹狀物件結構——DOM（Document Object Model）。CSS 則被解析為 CSSOM。兩者結合為 Render Tree，再進行 Layout（版面配置計算）與 Paint（像素繪製）。",
        points: [
          "HTML 是靜態文字檔，DOM 則是瀏覽器執行時期（Runtime）可動態修改的即時記憶體樹狀物件。",
          "JavaScript 透過 `document.querySelector` 等 API 操作 DOM，即時觸發瀏覽器重新計算樣式與重新繪製。",
          "Elements 分頁展示的是記憶體中目前的「即時 DOM」，不一定等於最初下載的 HTML 原始碼。"
        ]
      },
      {
        title: "Console（主控台）：你的即時 JavaScript 實驗室",
        description: "Console 是瀏覽器內建的 REPL 環境。你不僅可以在此檢視 console.log、console.error 的印出資訊，更可以直接存取全域物件（window）、選取目前在 Elements 選中的節點（$0），並動態執行任意 JavaScript 程式碼。",
        points: [
          "`$0`：指向當前在 Elements 面板選中的 DOM 元素，例如 `$0.style.backgroundColor = 'red'`。",
          "`$$('button')`：DevTools 內建捷徑，等同於 `document.querySelectorAll('button')`。",
          "`console.table(data)`：將陣列或物件以清晰易讀的表格格式印出，大幅提升除錯效率。"
        ]
      },
      {
        title: "Network（網路）分頁：解剖每一次資料交換",
        description: "現代前端與 AI 應用仰賴大量的非同步請求（Fetch / XHR）。Network 分頁能清楚記錄每個請求的發送時間、傳輸體積、HTTP 狀態碼、Request Headers、Payload（送出資料）以及 Response（後端回應 JSON）。",
        points: [
          "依類型篩選：點擊 `Fetch/XHR` 只檢視 API 通訊，過濾掉圖片與字型等雜訊檔案。",
          "複製為 cURL：在任一請求按右鍵「Copy > Copy as cURL」，可直接貼到終端機重現該請求以排查問題。",
          "模擬網路環境：透過 Throttling 功能模擬 3G 弱網或離線（Offline）狀態，測試載入骨架屏或斷線錯誤處理。"
        ]
      },
      {
        title: "Application（應用程式）分頁與客戶端儲存",
        description: "瀏覽器提供了多種持久化與階段性儲存方案：LocalStorage（永久儲存字串鍵值）、SessionStorage（關閉分頁即清除）、Cookies（常附帶於 HTTP 請求用於身分驗證）與 IndexedDB（大型本機資料庫）。",
        points: [
          "LocalStorage 儲存上限約 5MB，適合儲存使用者偏好設定、深淺色主題切換或離線暫存資料。",
          "LocalStorage 對所有同源 JavaScript 開放，絕不可將敏感的高權限機密金鑰直接暴露在此（防範 XSS 攻擊竊取）。",
          "可在 Application 面板手動編輯或清除儲存項，快速重設應用程式的本機測試狀態。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "在 Elements 面板修改程式碼以為已經存檔成功",
        why: "在 DevTools Elements 面板中直接修改文字或 CSS 樣式，重新整理（Cmd+R / F5）後所有修改全部消失，誤以為改動沒被儲存。",
        fix: "DevTools 只是本機記憶體中的暫時預覽沙盒。確認視覺效果滿意後，必須將改動的 CSS / HTML 複製回專案編輯器（VS Code / Cursor）中的實際原始檔案存檔。"
      },
      {
        title: "忽略 Console 中的紅字錯誤，盲目猜測伺服器異常",
        why: "網頁按鈕點擊後沒有反應，直接認定伺服器掛了，卻沒打開 Console 查看是否早有 JavaScript 語法錯誤（如 `Uncaught TypeError: Cannot read properties of undefined`）阻斷了後續流程。",
        fix: "排查網頁問題的第一反射動作永遠是「按 F12 開啟 DevTools 看 Console」。若有紅字錯誤，點擊右側的檔案行號連結，DevTools 會直接跳轉到 Sources 面板引導你看是在哪一行出錯。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "$0", desc: "在 Console 中存取當前在 Elements 面板所反白選取的 DOM 元素" },
      { cmd: "document.querySelector('input').value = 'hello'", desc: "在 Console 中以程式碼動態修改輸入框的值" },
      { cmd: "copy(object)", desc: "在 Console 中將任意變數或 JSON 物件直接複製到系統剪貼簿" },
      { cmd: "console.table([{id: 1, name: 'Alice'}])", desc: "以視覺化表格方式在主控台印出結構化資料" },
      { cmd: "clear()", desc: "清空主控台螢幕所有輸出" }
    ],
    widgetId: "devtools-widget",
    widgetProps: {
      tabs: ["elements", "console", "network", "application"],
      defaultTab: "console"
    },
    quiz: [
      {
        question: "在 Chrome DevTools 的 Network 面板中，若你想排查某個按鈕點擊後向後端發送的 API 請求與收到的 JSON 回應，你應該重點檢視哪一個過濾標籤？",
        options: [
          "Img（圖片檔案標籤）",
          "Fetch/XHR（非同步網路請求標籤）",
          "Font（字型檔案標籤）",
          "CSS（樣式表標籤）"
        ],
        answer: 1,
        explanation: "前端呼叫 API 通常使用 fetch 或 XMLHttpRequest，在 Network 面板中篩選 Fetch/XHR 能精確過濾出所有後端資料通訊請求，點擊即可檢視 Headers、Payload 與 Response。"
      },
      {
        question: "在瀏覽器 Console 中，特殊捷徑語法 `$0` 代表什麼意義？",
        options: [
          "關閉目前分頁的瀏覽器系統指令。",
          "目前在 Elements（元素）面板中所反白選取的 DOM 節點物件。",
          "將頁面強制重新整理並清除快取的指令。",
          "呼叫作業系統最高管理者 root 權限。"
        ],
        answer: 1,
        explanation: "`$0` 是 DevTools 提供的便利捷徑，代表 Elements 面板中當前反白選取的那個 DOM 節點，可直接在 Console 操作其樣式屬性或呼叫方法。"
      }
    ]
  },

  {
    id: "localhost-ports",
    trackId: "track-2",
    trackTitle: "用戶端、伺服器與瀏覽器核心",
    unitNumber: 6,
    title: "本地伺服器與通訊埠：Localhost 與 Port 衝突排解",
    subtitle: "解密 127.0.0.1、掌握通訊埠 (Port) 原理，熟練排解 EADDRINUSE 衝突",
    readingTime: "6 分鐘",
    prerequisites: ["了解 Client-Server 基本連線概念", "具備基礎終端機操作能力"],
    coreConcepts: [
      {
        title: "什麼是 Localhost 與環迴位址（Loopback 127.0.0.1）",
        description: "在開發本機網站時，網址常以 `http://localhost:3000` 或 `http://127.0.0.1:5173` 開頭。localhost 是一個主機名稱，在作業系統的 hosts 檔中預設解析至 IPv4 的環迴位址 127.0.0.1。透過此位址發出的網路封包不會流經外部實體網路卡，而是直接在作業系統核心內部繞回給本機應用程式處理。",
        points: [
          "僅供本機內部通訊：預設情況下，同一 Wi-Fi 下的其他裝置無法直接連入你的 127.0.0.1。",
          "區分本機與區域網路：若要讓同網域的手機進行測試，開發伺服器需監聽 `0.0.0.0`（代表接收所有本機網路介面的請求）。",
          "無網際網路也能開發：即使拔掉實體網路線或在飛機上，localhost 開發環境依然能順暢運行。"
        ]
      },
      {
        title: "通訊埠（Port）的概念：公寓的房號門牌",
        description: "如果 IP 位址像是一棟大樓的街景地址，那麼通訊埠（Port）就是大樓內部各住戶的「房間門牌號」。一個 IP 位址共有 65536 個通訊埠（0 到 65535）。",
        points: [
          "特權通訊埠（0 - 1023）：系統預留保留埠，例如 HTTP (80)、HTTPS (443)、SSH (22)，在 Unix 系統綁定需要 sudo 權限。",
          "非特權動態埠（1024 - 65535）：一般開發伺服器使用的連接埠，如 Node.js (3000)、Vite (5173)、PostgreSQL (5432)。",
          "單一佔用原則：在同一個 IP 上，同一個 Port 同一時間只能被一個行程（Process）監聽（Listen）。"
        ]
      },
      {
        title: "惡名昭彰的 EADDRINUSE 衝突錯誤",
        description: "啟動伺服器時最常見的報錯是 `Error: listen EADDRINUSE: address already in use :::3000`。這代表你要使用的 3000 號通訊埠已經被其他背景行程（或是先前沒正確退出的伺服器殘留）佔用。",
        points: [
          "原因通常是之前的終端機視窗直接被關閉，但後台 Node 或 Python 行程並未被 kill。",
          "現代前端工具（如 Vite）有時會自動跳轉到下一個可用 Port（如 5174），但 API 後端寫死 3000 時就會造成連線失敗。",
          "掌握排查三部曲：尋找佔用行程 PID -> 確認是否可終止 -> 發送訊號強制關閉行程。"
        ]
      },
      {
        title: "實戰排解武器庫：lsof 與 kill",
        description: "在 Mac 與 Linux 下，`lsof`（List Open Files）是排查通訊埠佔用的黃金工具；搭配 `kill -9`（SIGKILL 強制終止訊號）能秒殺佔用殘留。",
        points: [
          "`lsof -i :3000`：列出所有正在監聽或連線 3000 埠的行程資訊，重點在於找到 PID（行程識別碼）。",
          "`kill -15 <PID>`（SIGTERM）：友善通知行程優雅結束，讓其有機會釋放檔案與資料庫連線。",
          "`kill -9 <PID>`（SIGKILL）：直接由作業系統核心暴力抹除行程，適用於卡死無回應的孤兒行程。",
          "一行必殺技：`kill -9 $(lsof -t -i:3000)` 自動查出 PID 並強制清除。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "遇到 Port 佔用就盲目改換 Port（3000 -> 3001 -> 3002...）",
        why: "不知道怎麼殺掉舊行程，只要跳出 Port in use 就把設定檔改成 3001，隔天又改成 3002。最後電腦後台跑了十幾個殭屍 Node 伺服器，瘋狂消耗記憶體與 CPU 資源。",
        fix: "養成專業工程衛生習慣！遇到 EADDRINUSE，花 5 秒鐘執行 `lsof -i :3000` 查出誰在佔用，用 `kill -9` 把它結束掉，維持乾淨的開發環境。"
      },
      {
        title: "使用 Ctrl+Z 代替 Ctrl+C 來停止伺服器",
        why: "在終端機看到伺服器在跑，隨手按了 Ctrl+Z。Ctrl+Z 在 Unix 中並不是結束程式，而是「將行程暫停並推入背景（Suspend）」，該行程依然咬住 Port 不放！",
        fix: "結束前端/後端開發伺服器請一律使用 `Ctrl+C`（發送 SIGINT 中斷訊號）。如果不小心按了 Ctrl+Z，可輸入 `fg` 將其調回前景再按 `Ctrl+C`，或用 kill 指令清理。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "lsof -i :3000", desc: "查看佔用 3000 埠的行程名稱、使用者與 PID" },
      { cmd: "lsof -t -i :3000", desc: "僅輸出佔用 3000 埠的 PID 數字（適合傳遞給腳本）" },
      { cmd: "kill -9 <PID>", desc: "強制終止指定 PID 的行程" },
      { cmd: "kill -9 $(lsof -t -i :3000)", desc: "一鍵強制清除佔用 3000 埠的所有行程" },
      { cmd: "curl http://localhost:3000", desc: "測試本機 3000 埠是否有服務正常回應" }
    ],
    widgetId: "ports-widget",
    widgetProps: {
      activePorts: [3000, 5173, 8080],
      conflictPort: 3000
    },
    quiz: [
      {
        question: "當你在終端機啟動後端服務時，終端機回傳 `Error: listen EADDRINUSE: address already in use :::8080`，這代表發生了什麼問題？",
        options: [
          "電腦的 Wi-Fi 網路訊號斷線了。",
          "本機的 8080 通訊埠已經被其他背景行程佔用，導致新伺服器無法綁定監聽。",
          "必須先向網域名稱註冊商付費購買 8080 網址。",
          "硬碟容量已滿，無法寫入新的網路封包快取。"
        ],
        answer: 1,
        explanation: "`EADDRINUSE` 代表 Address already in use，表示指定的通訊埠（此處為 8080）已被先前的行程或其他背景軟體佔用，需釋放該通訊埠後才能重新啟動。"
      },
      {
        question: "在 Mac 終端機中，若想查詢是哪一個程式佔用了 5173 通訊埠並找出其行程代號（PID），應該使用下列哪一個指令？",
        options: [
          "rm -rf :5173",
          "lsof -i :5173",
          "ping 5173",
          "cat /etc/ports"
        ],
        answer: 1,
        explanation: "`lsof -i :5173`（List Open Files）是專門用於檢視網路通訊埠佔用情況的指令，可列出行程名稱（COMMAND）、使用者（USER）以及行程代號（PID）。"
      }
    ]
  },

  // =========================================================================
  // TRACK 3: 版本控制與程式碼衛生 (Units 7 - 9)
  // =========================================================================
  {
    id: "git-fundamentals",
    trackId: "track-3",
    trackTitle: "版本控制與程式碼衛生",
    unitNumber: 7,
    title: "Git 核心基礎：工作區、暫存區與時光機的運作原理",
    subtitle: "搞懂 Working Directory、Staging Area 與 Commit，掌握程式碼的版本歷史",
    readingTime: "7 分鐘",
    prerequisites: ["具備檔案修改與基本終端機操作能力"],
    coreConcepts: [
      {
        title: "為什麼需要版本控制？分散式架構與時光機概念",
        description: "沒有 Git 時，專案資料夾常充斥 final.zip、final_v2.zip、final_really_final.zip。Git 是一個分散式版本控制系統，它將每一次儲存的程式碼狀態記錄為不可竄改的快照（Snapshot）。每位開發者本機都擁有一份完整的版本歷史庫。",
        points: [
          "時光倒流：可隨時檢視、比對或切換回過去任何一個時間點的程式碼歷史狀態。",
          "安全實驗：可以在新分支放心嘗試新功能，寫爛了隨時一鍵拋棄，不傷及穩定版本。",
          "團隊協同：清晰記錄「誰在什麼時間、因為什麼原因、修改了哪幾行程式碼」。"
        ]
      },
      {
        title: "Git 的三層架構：Working Tree、Staging Area 與 Repository",
        description: "理解 Git 最關鍵的心智模型是這三個區域：工作目錄（Working Directory）、暫存區（Staging Area / Index）、儲存庫（Repository / .git 目錄）。",
        points: [
          "Working Directory（工作目錄）：硬碟上實際看到的專案檔案，是你目前正在編輯的地方。",
          "Staging Area（暫存區）：待提交的購物車。透過 `git add` 挑選哪些修改要納入下一次快照。",
          "Repository（本地儲存庫）：透過 `git commit` 將暫存區的檔案正式打包存檔，生成一個 SHA 雜湊值的永久快照。"
        ]
      },
      {
        title: "關鍵工作流三部曲：git status、git add、git commit",
        description: "良好的 Git 衛生習慣始於高頻率的狀態檢查。在做任何操作前後，先下 `git status` 看清楚當前狀態。",
        points: [
          "`git status`：你的導航儀表板，顯示哪些檔案被修改（Modified）、未追蹤（Untracked）或已暫存（Staged）。",
          "`git add <file>`：精確暫存特定檔案；`git diff` 可在暫存前比對到底改動了哪些行。",
          "`git commit -m \"feat: 實作登入按鈕\"`：附帶有意義且遵循規範的提交訊息，為未來的自己與團隊留下清晰歷史。"
        ]
      },
      {
        title: "與遠端連線同步：git pull 與 git push",
        description: "本地的 commit 只是存在本機的 `.git` 資料庫中。要與 GitHub / GitLab 同步，需透過 `git push` 將本機 commit 上傳到遠端伺服器（Remote）；透過 `git pull` 將團隊成員推上遠端的新變更抓回並合併至本機。",
        points: [
          "`git remote -v` 檢視本機綁定的遠端儲存庫網址（通常名為 `origin`）。",
          "`git push origin main` 將本機 main 分支推送到遠端儲存庫。",
          "推送前先 `git pull`，避免因為遠端已有新 commit 而被拒絕推送（Non-fast-forward rejection）。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "閉著眼睛盲打 git add . 與 git commit -m \"update\"",
        why: "不分青紅皂白把包含密碼設定檔（.env）、大型相依套件庫（node_modules）、暫存檔一股腦全部 add 進去，且 commit 訊息完全沒有可讀性，導致歷史紀錄毫無維護價值。",
        fix: "專案第一天就建立 `.gitignore` 檔案排除垃圾與敏感檔案。commit 前先執行 `git status` 與 `git diff`，每次 commit 只聚焦於一個獨立且具備完整意義的修改單元。"
      },
      {
        title: "在本地修改尚未 commit 前就執行覆蓋性還原指令",
        why: "新手看到程式碼有 bug，隨意搜尋網路貼上 `git reset --hard` 或 `git checkout .`，導致剛寫了三小時但尚未暫存的寶貴程式碼被永久抹除。",
        fix: "記住 Git 只能拯救「曾經被 Git 記錄過（add 或 commit）」的檔案。在進行任何重設（reset）或切換前，若有未完成的半成品，可先用 `git stash` 暫存起來，或先做一個臨時 commit。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "git status", desc: "檢視工作目錄與暫存區的目前狀態（最重要的高頻指令）" },
      { cmd: "git diff", desc: "檢視工作目錄中尚未暫存的具體程式碼變更（行級別比對）" },
      { cmd: "git add <file>", desc: "將指定檔案的變更加入暫存區" },
      { cmd: "git commit -m \"feat: 新增使用者認證模組\"", desc: "將暫存區內容正式提交為歷史快照" },
      { cmd: "git log --oneline -n 5", desc: "以精簡單行模式檢視最近 5 筆 commit 歷史" },
      { cmd: "git pull origin main", desc: "從遠端 origin 抓取 main 分支的最新更新並合併" },
      { cmd: "git push origin main", desc: "將本地 main 分支的 commit 推送到遠端 origin" }
    ],
    widgetId: "git-widget",
    widgetProps: {
      initialStage: "working",
      showStaging: true
    },
    quiz: [
      {
        question: "在 Git 工作流程中，「暫存區（Staging Area / Index）」的核心用途是什麼？",
        options: [
          "用來將程式碼自動上傳發布到雲端生產伺服器。",
          "作為提交快照前的緩衝篩選區，讓開發者能自由挑選本次 commit 想要包含的變更，而非被迫一次提交全部修改。",
          "自動刪除專案中所有寫壞的程式碼檔案。",
          "用來儲存本機電腦的密碼金鑰以便全自動登入。"
        ],
        answer: 1,
        explanation: "暫存區如同結帳購物車，允許開發者透過 `git add` 精準挑選要納入本次 commit 的修改檔案，維持每次 commit 職責單一與歷史乾淨。"
      },
      {
        question: "若你剛修改了 `app.js`，但尚未執行 `git add`，想在終端機精確檢視自己到底修改了哪些具體行數，應該使用哪一個指令？",
        options: [
          "git diff",
          "git commit",
          "git push",
          "git init"
        ],
        answer: 0,
        explanation: "`git diff` 會逐行比對工作目錄與暫存區之間的差異，以綠色（新增）與紅色（刪除）清楚標註具體修改的程式碼內容。"
      }
    ]
  },

  {
    id: "repos-licenses",
    trackId: "track-3",
    trackTitle: "版本控制與程式碼衛生",
    unitNumber: 8,
    title: "遠端儲存庫與開源授權：Public vs Private 與授權條款防雷",
    subtitle: "搞懂公開/私有儲存庫、防範 API Key 洩漏災難，挑選正確的開源授權條款",
    readingTime: "7 分鐘",
    prerequisites: ["了解 Git commit 與 push 基本概念"],
    coreConcepts: [
      {
        title: "Public vs Private 儲存庫的界線",
        description: "GitHub / GitLab 上的儲存庫分為公開（Public）與私有（Private）。公開儲存庫對全球完全開放，任何人都能閱讀、克隆（clone）甚至被搜尋引擎與 AI 爬蟲抓取；私有儲存庫則僅限授權的團隊成員或協作者存取。",
        points: [
          "公開專案適合開源分享、技術展示、社群協作與累積技術影響力。",
          "商業專案、客戶資產、含有專利演算法或內部營運工具一律必須設為 Private。",
          "即使專案是 Private，也不代表可以任意把密碼金鑰寫在程式碼中（協作者權限與歷史紀錄仍有洩漏風險）。"
        ]
      },
      {
        title: "機密金鑰洩漏危機與 .gitignore 的防禦機制",
        description: "把包含 AWS、OpenAI、Stripe 密鑰的 `.env` 檔案 push 到 GitHub Public Repo 是全世界工程師每天都在發生的慘劇。網路爬蟲在毫秒級別內就會偵測並盜刷。更可怕的是：即使你隨後發一個 commit 把該檔案刪除，密碼依然永久留存在 Git 的歷史 commit 快照中！",
        points: [
          "`.gitignore` 檔案：列出所有 Git 必須忽略的檔案與目錄（如 `.env`、`node_modules/`、`dist/`、`.DS_Store`）。",
          "範本規範：建立 `.env.example`（僅留變數名稱，不留任何真實數值）供團隊成員複製參考。",
          "預防勝於治療：安裝 git-secrets、trufflehog 或 pre-commit hook，在 commit 觸發前自動阻擋密鑰。"
        ]
      },
      {
        title: "常見開源授權條款（Open Source Licenses）大比拼",
        description: "沒有附帶 LICENSE 檔案的公開專案，法律上預設是「保留所有權利（All Rights Reserved）」，他人連合法引用都可能有法律風險。開源授權條款主要分為兩大派系：寬鬆型（Permissive）與傳染型（Copyleft）。",
        points: [
          "MIT License（極度寬鬆）：最受歡迎。任何人都可以自由使用、修改、閉源甚至商業販售，唯一要求是保留原作者版權宣告。",
          "Apache 2.0（寬鬆 + 專利保護）：類似 MIT，但額外增加了明確的專利權授權與商標保護條款，適合大型企業開源專案。",
          "GPLv3（強傳染型 Copyleft）：若你在軟體中使用了 GPL 程式碼，你的整個衍生作品發行時也必須強制以 GPL 開源並公開原始碼，禁止閉源商業化。"
        ]
      },
      {
        title: "AI 時代的代碼引用法規意識",
        description: "當 AI 協作工具（如 Claude、Copilot、Cursor）幫你產生程式碼時，有時會直接吐出開源專案的片段。了解開源授權條款能幫助自創業者與企業避免未來的著作權侵權官司。",
        points: [
          "商用專案引用第三方開源函式庫時，優先挑選 MIT、Apache 2.0、BSD 授權。",
          "謹慎避開 GPL / AGPL 函式庫，除非你的產品本身就打算全部以開源形式發表。",
          "軟體相依套件審計：定期使用 `license-checker` 等 CLI 工具掃描專案所有相依套件的授權類別。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "誤將 .env 推送到 GitHub 後以為「再做一個 commit 刪掉」就沒事了",
        why: "Git 的本質是時光機，所有歷史快照都保存完整內容。只在最新版本刪除檔案，任何人只要切換到上一筆 commit 或檢視 diff，依然能看見明文密鑰。",
        fix: "發生洩漏時第一時間到服務商後台（如 OpenAI 或 AWS）立即「撤銷（Revoke）並作廢該金鑰」！若要徹底從 Git 歷史抹除該檔案，必須使用 `git-filter-repo` 或 BFG Repo-Cleaner 重寫歷史。"
      },
      {
        title: "開源專案未附帶任何 LICENSE 檔案",
        why: "以為把專案推上 Public Repo 就是開源，忘記加入 LICENSE 檔案。這會導致其他開發者與企業因為法務風險不敢使用或貢獻你的專案。",
        fix: "專案初始化時，在根目錄新增 `LICENSE` 檔案，推薦初創專案直接採用最通用、對社群最友善的 `MIT License`。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "git rm --cached .env", desc: "從 Git 暫存區與追蹤名單中移除 .env，但保留硬碟上的實體檔案" },
      { cmd: "echo \".env\" >> .gitignore", desc: "將 .env 檔案加入忽略清單" },
      { cmd: "npx license-checker --summary", desc: "快速掃描專案所有 npm 套件的授權條款分佈狀態" }
    ],
    widgetId: "licenses-widget",
    widgetProps: {
      licenses: ["MIT", "Apache-2.0", "GPL-3.0", "Proprietary"]
    },
    quiz: [
      {
        question: "如果你正在開發一個商業收費的閉源 SaaS 產品，在挑選第三方程式庫時，下列哪一種授權條款的相依套件具有最大的法律風險，可能迫使你必須公開自己產品的所有原始碼？",
        options: [
          "MIT License",
          "Apache 2.0",
          "GPLv3 (General Public License)",
          "BSD 3-Clause License"
        ],
        answer: 2,
        explanation: "GPL 具有「傳染性（Copyleft）」特性，規定只要衍生作品使用了 GPL 授權程式碼，該作品在發布時也必須強制以 GPL 開源並公開完整原始碼，對閉源商業產品風險極高。"
      },
      {
        question: "當你不小心將包含 OpenAI API 金鑰的檔案 commit 並 push 到了 GitHub 的公開儲存庫，下列哪一個是此時最關鍵、最緊急的第一步行動？",
        options: [
          "立刻到 OpenAI 控制台撤銷（Revoke / Invalidate）該把金鑰，使其立即失效。",
          "發送另一個 commit 把密鑰修改成假字串。",
          "關閉自己的電腦並拔掉網路線。",
          "寄信給 GitHub 客服請他們手動幫忙刪除檔案。"
        ],
        answer: 0,
        explanation: "GitHub 上的公開洩漏會被全球自動化爬蟲在數秒內抓取。唯一的防禦手段是「讓該金鑰立即失去效力」，因此第一時間必須到提供商後台撤銷該金鑰。"
      }
    ]
  },

  {
    id: "branches-worktrees",
    trackId: "track-3",
    trackTitle: "版本控制與程式碼衛生",
    unitNumber: 9,
    title: "分支協作與 Git Worktree：平行多任務與 AI Agent 工作流",
    subtitle: "告別頻繁 stash 與目錄衝突，學會 Git Worktree 讓多個 AI Agent 在平行目錄同時開工",
    readingTime: "8 分鐘",
    prerequisites: ["熟悉 Git 基本指令 (commit, status, branch)"],
    coreConcepts: [
      {
        title: "Git 分支（Branch）本質：低成本的指標移動",
        description: "在 Git 中，分支並不是把整個專案資料夾複製一份，它本質上只是一個指向某個特定 commit 物件的 40 字元雜湊「動態指標（Pointer）」。因此建立或切換分支幾乎是毫秒級瞬間完成。",
        points: [
          "`HEAD` 指標：代表你目前所在的當前分支或當前 commit。",
          "主幹保護原則：`main` 或 `master` 分支代表生產環境穩定版本，日常開發應拉出功能分支（Feature Branch）如 `feature/login`。",
          "合併工作流：開發完成後，透過 Pull Request（PR）或 Merge Request（MR）進行程式碼審查（Code Review）後再合併回主幹。"
        ]
      },
      {
        title: "傳統分支切換的痛點：Stash 煉獄與依賴中斷",
        description: "當你在 feature/checkout 開發到一半，突然來了個緊急 bug 需切換到 hotfix/login 修復。此時你必須執行 `git stash` 將修改暫存，切換分支後還可能因為不同分支的 node_modules 或資料庫 schema 不同而需要重新 npm install。",
        points: [
          "頻繁 `git stash pop` 容易忘記暫存了什麼，甚至引發預期外的程式碼衝突。",
          "現代大型專案建置快取與龐大的相依套件，在分支頻繁切換時會導致開發伺服器不斷重啟或編譯崩潰。",
          "多個 AI Agent（如一個在重構樣式、另一個在寫 API 測試）無法在同一個工作目錄中同時修改不同分支。"
        ]
      },
      {
        title: "Git Worktree：多任務與 AI 協作的終極解法",
        description: "git worktree 是 Git 內建但長期被低估的神級功能。它允許你從「同一個本機 Git 儲存庫（共用 .git 歷史紀錄與物件）」同時簽出（checkout）多個獨立的磁碟實體目錄，每個目錄綁定不同的分支。",
        points: [
          "零衝突平行工作：目錄 A 跑 main 穩定版伺服器，目錄 B 跑 feature-a，目錄 C 跑 bugfix，互不干擾！",
          "大幅節省硬碟空間：所有 worktree 共用底層的 Git 物件庫，不需要重複執行多次完整的 git clone。",
          "AI Agent 的理想容器：你可以給 AI Agent 一個專屬的 worktree 資料夾（如 `.worktrees/agent-task-1`），讓它在裡面盡情修改、執行測試與 commit，完全不卡死你的主編輯器視窗。"
        ]
      },
      {
        title: "Git Worktree 實戰操作與清理生命週期",
        description: "掌握 `git worktree add`、`git worktree list` 與 `git worktree remove`，輕鬆建立與銷毀工作樹。",
        points: [
          "`git worktree add ../my-hotfix -b hotfix-auth main`：基於 main 建立名為 hotfix-auth 的新分支，並簽出到獨立的 `../my-hotfix` 目錄。",
          "`git worktree list`：檢視目前本機所有已掛載的工作樹目錄及其對應分支。",
          "任務完成後：合併分支後，使用 `git worktree remove` 安全移除目錄並清理參照。"
        ]
      }
    ],
    pitfalls: [
      {
        title: "試圖在不同 Worktree 中同時 checkout 同一個分支",
        why: "Git 為了防止版本歷史發生競爭混亂，嚴格禁止兩個不同工作樹同時指向相同的分支。執行 `git worktree add` 若指定已在主目錄簽出的分支會報錯 `fatal: 'main' is already checked out`。",
        fix: "牢記「一個分支同時間只能綁定一個工作樹」。建立新工作樹時，請使用 `-b <new-branch-name>` 建立專屬的新功能分支。"
      },
      {
        title: "手動用 rm -rf 刪除了 worktree 目錄但沒有清理 Git 登記",
        why: "直接在檔案總管或終端機刪除了工作樹資料夾，但 Git 內部的管理清單依然殘留記錄，導致未來無法建立同名工作樹。",
        fix: "推薦使用官方指令 `git worktree remove <path>` 進行正規清理；若已手動刪除目錄，可執行 `git worktree prune` 清理所有失效的無效參照。"
      }
    ],
    commandsCheatsheet: [
      { cmd: "git branch", desc: "列出本機所有分支並標示當前所在分支" },
      { cmd: "git switch -c feature/login", desc: "建立並切換到新分支（現代推薦語法）" },
      { cmd: "git worktree add ../my-feature -b feature/search", desc: "在新目錄建立獨立工作樹並開闢新分支" },
      { cmd: "git worktree list", desc: "列出當前專案所有掛載的工作樹路徑與關聯分支" },
      { cmd: "git worktree remove ../my-feature", desc: "安全移除指定的工作樹目錄並清除登記" },
      { cmd: "git worktree prune", desc: "清理所有已經不存在於硬碟上的過期工作樹參照" }
    ],
    widgetId: "worktree-widget",
    widgetProps: {
      branches: ["main", "feature/ai-chat", "hotfix/cors"],
      worktrees: ["./", "../agent-workspace"]
    },
    quiz: [
      {
        question: "相較於傳統在單一目錄下頻繁切換分支與使用 `git stash`，使用 `git worktree` 的最大核心優勢是什麼？",
        options: [
          "可以不需要安裝 Git 就能直接寫程式碼。",
          "能在獨立的實體檔案目錄中同時簽出並運行多個不同分支，互不干擾，特別適合平行開發與多 AI Agent 同步作業。",
          "能自動幫你寫完所有測試程式碼並發布到線上。",
          "可以同時向同一個分支 push 衝突的程式碼而不會被拒絕。"
        ],
        answer: 1,
        explanation: "`git worktree` 允許共用同一個 Git 儲存庫物件，同時在硬碟上開啟多個獨立工作資料夾並分別簽出不同分支，避免頻繁 stash 與依賴重編譯的痛點，非常適合現代平行多任務。"
      },
      {
        question: "當你手動刪除了一個 Git Worktree 的資料夾後，發現 Git 清單中仍然殘留該工作樹的過期紀錄，你應該執行哪一個指令來清除失效的參照？",
        options: [
          "git worktree prune",
          "git checkout --force",
          "git init --recheck",
          "git rm -rf ."
        ],
        answer: 0,
        explanation: "`git worktree prune` 會掃描所有已註冊的工作樹，若發現對應的實體資料夾已不存在，會自動將其從 Git 管理清單中修剪清除。"
      }
    ]
  }
];

// 支援全域掛載與模組化匯出
if (typeof window !== "undefined") {
  window.TRACKS_PART_1 = TRACKS_PART_1;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TRACKS_PART_1 };
}
