// apps/vibe-coder/js/tracks-meta.js
// 軌道元資料與單元整合註冊表

(function () {
  const TRACKS_META = [
    {
      id: "track-1",
      number: 1,
      title: "現代開發者工作台",
      enTitle: "Modern Workbench",
      icon: "💻",
      desc: "掌握 IDE、終端機與命令列的本質差異，理解系統權限與防呆機制",
      unitRange: [1, 3]
    },
    {
      id: "track-2",
      number: 2,
      title: "用戶端、伺服器與瀏覽器核心",
      enTitle: "Client-Server & DOM",
      icon: "🌐",
      desc: "搞懂前後端分工、瀏覽器 DOM 操作與 Localhost 通訊埠排解",
      unitRange: [4, 6]
    },
    {
      id: "track-3",
      number: 3,
      title: "版本控制與程式碼衛生",
      enTitle: "Version Control & Hygiene",
      icon: "🌿",
      desc: "學會 Git 暫存區、開源授權防侵權，以及 Worktree 平行多工流",
      unitRange: [7, 9]
    },
    {
      id: "track-4",
      number: 4,
      title: "遠端系統與安全網路",
      enTitle: "Remote Systems & Mesh",
      icon: "🔐",
      desc: "利用 SSH 金鑰安全登入、tmux 長期背景運算與 Tailscale 私有網路",
      unitRange: [10, 11]
    },
    {
      id: "track-5",
      number: 5,
      title: "AI 擴充生態與代理通訊協定",
      enTitle: "AI Extensibility & Protocols",
      icon: "🤖",
      desc: "拆解 REST API、OAuth 與環境變數，搞懂 Skills 與 MCP 模型上下文協定",
      unitRange: [12, 14]
    },
    {
      id: "track-6",
      number: 6,
      title: "應用程式封裝與雲端發布",
      enTitle: "Packaging & Cloud Shipping",
      icon: "🚀",
      desc: "比較 Web/PWA/原生 App，選擇靜態或容器託管，搞定 Docker 與 DNS",
      unitRange: [15, 18]
    },
    {
      id: "track-7",
      number: 7,
      title: "品質驗證、金流安全與商業法規",
      enTitle: "Quality, Monetization & Legal",
      icon: "💳",
      desc: "用 Playwright 自動化測試，安全串接 Stripe 與 MoR 金流，做好合規上線",
      unitRange: [19, 22]
    }
  ];

  window.VIBE_CODER_META = {
    tracks: TRACKS_META,
    getAllUnits() {
      const part1 = window.TRACKS_PART_1 || [];
      const part2 = window.TRACKS_PART_2 || [];
      const part3 = window.TRACKS_PART_3 || [];
      return [...part1, ...part2, ...part3].sort((a, b) => a.unitNumber - b.unitNumber);
    },
    getUnitById(id) {
      return this.getAllUnits().find(u => u.id === id);
    },
    getUnitsByTrack(trackId) {
      return this.getAllUnits().filter(u => u.trackId === trackId);
    }
  };
})();
