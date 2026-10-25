// apps/vibe-coder/js/widgets/index.js
// Vibe Coder 實戰沙盒模組集中註冊與管理索引

(function () {
  window.VIBE_WIDGETS = window.VIBE_WIDGETS || {};

  const WIDGET_REGISTRY = [
    {
      id: "terminal-widget",
      name: "CLI & Shell 終端機模擬器",
      track: 1,
      desc: "互動式命令列、歷史指令與安全防護攔截"
    },
    {
      id: "devtools-widget",
      name: "Chrome DevTools 與 DOM 檢視器",
      track: 2,
      desc: "即時主控台腳本執行與用戶端 DOM 竄改演示"
    },
    {
      id: "ports-widget",
      name: "Localhost 通訊埠衝突排解器",
      track: 2,
      desc: "EADDRINUSE 診斷、lsof 查詢與 kill -9 行程清理"
    },
    {
      id: "git-widget",
      name: "Git Worktree 平行開發視覺化",
      track: 3,
      desc: "傳統 checkout 衝突風險 vs 工作樹多工平行切換"
    },
    {
      id: "api-widget",
      name: "Mini REST API & Token 測試器",
      track: 5,
      desc: "HTTP 請求發送、Bearer Token 驗證與 JSON 語法著色"
    },
    {
      id: "mcp-widget",
      name: "MCP 模型上下文協定循序檢視器",
      track: 5,
      desc: "Tool-calling 生命週期分解與 JSON-RPC 2.0 封包檢視"
    },
    {
      id: "deploy-widget",
      name: "雲端架構與部署平台決策器",
      track: 6,
      desc: "三維度架構評估與性價比方案推薦"
    },
    {
      id: "playwright-widget",
      name: "Playwright 自動化端對端測試",
      track: 7,
      desc: "無頭瀏覽器逐行步進、滑鼠軌跡與斷言驗證"
    },
    {
      id: "stripe-widget",
      name: "國際金流 (Stripe/MoR) 與 Webhook 簽名",
      track: 7,
      desc: "跨國稅務負擔對比與 HMAC 簽章防偽造攔截"
    }
  ];

  // 公開輔助函式
  window.VIBE_WIDGETS.list = function () {
    return WIDGET_REGISTRY.map(item => ({
      ...item,
      isMounted: !!window.VIBE_WIDGETS[item.id]
    }));
  };

  window.VIBE_WIDGETS.get = function (widgetId) {
    return window.VIBE_WIDGETS[widgetId] || null;
  };

  window.VIBE_WIDGETS.mount = function (widgetId, container, props = {}) {
    const widget = window.VIBE_WIDGETS.get(widgetId);
    if (widget && typeof widget.mount === "function") {
      widget.mount(container, props);
      return widget;
    }
    console.warn(`[VIBE_WIDGETS] 找不到名為 ${widgetId} 的互動沙盒組件`);
    return null;
  };

  // 派發組件就緒事件
  window.dispatchEvent(new CustomEvent("vibe-widgets-ready", {
    detail: { count: WIDGET_REGISTRY.length, widgets: WIDGET_REGISTRY }
  }));

  console.log(`[Vibe Coder] 9 大實戰互動沙盒組件全數載入完成！`);
})();
