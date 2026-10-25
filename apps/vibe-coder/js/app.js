// apps/vibe-coder/js/app.js
// Vibe Coder 核心應用控制器

(function () {
  "use strict";

  // 狀態管理
  const state = {
    currentUnitId: null,
    currentTab: "concepts",
    searchQuery: "",
    completedUnits: new Set(JSON.parse(localStorage.getItem("vibe_coder_completed_units") || "[]")),
    quizState: JSON.parse(localStorage.getItem("vibe_coder_quiz_state") || "{}"),
    activeWidgetInstance: null
  };

  // DOM 元素快取
  const dom = {
    tracksNav: document.getElementById("tracksNav"),
    unitTitle: document.getElementById("unitTitle"),
    unitSubtitle: document.getElementById("unitSubtitle"),
    breadcrumbTrack: document.getElementById("breadcrumbTrack"),
    breadcrumbUnit: document.getElementById("breadcrumbUnit"),
    metaReadingTime: document.getElementById("metaReadingTime"),
    metaPrereq: document.getElementById("metaPrereq"),
    unitStatusTag: document.getElementById("unitStatusTag"),
    conceptsContainer: document.getElementById("conceptsContainer"),
    pitfallsContainer: document.getElementById("pitfallsContainer"),
    sandboxWidgetName: document.getElementById("sandboxWidgetName"),
    sandboxWidgetBody: document.getElementById("sandboxWidgetBody"),
    resetSandboxBtn: document.getElementById("resetSandboxBtn"),
    cheatsheetContainer: document.getElementById("cheatsheetContainer"),
    quizContainer: document.getElementById("quizContainer"),
    prevUnitBtn: document.getElementById("prevUnitBtn"),
    prevUnitTitle: document.getElementById("prevUnitTitle"),
    nextUnitBtn: document.getElementById("nextUnitBtn"),
    nextUnitTitle: document.getElementById("nextUnitTitle"),
    progressText: document.getElementById("progressText"),
    progressFill: document.getElementById("progressFill"),
    searchInput: document.getElementById("searchInput"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    mobileNavToggle: document.getElementById("mobileNavToggle"),
    appSidebar: document.getElementById("appSidebar"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    tabs: document.querySelectorAll(".tab-btn"),
    tabPanes: document.querySelectorAll(".tab-pane")
  };

  // 初始化主題
  function initTheme() {
    const savedTheme = localStorage.getItem("vibe_coder_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    dom.themeToggleBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";

    dom.themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("vibe_coder_theme", next);
      dom.themeToggleBtn.textContent = next === "dark" ? "🌙" : "☀️";
    });
  }

  // 儲存進度
  function saveProgress() {
    localStorage.setItem("vibe_coder_completed_units", JSON.stringify([...state.completedUnits]));
    localStorage.setItem("vibe_coder_quiz_state", JSON.stringify(state.quizState));
    updateProgressUI();
  }

  function updateProgressUI() {
    const allUnits = window.VIBE_CODER_META.getAllUnits();
    const total = allUnits.length || 22;
    const completed = state.completedUnits.size;
    const percent = Math.round((completed / total) * 100);

    dom.progressText.textContent = `${completed} / ${total} 完成`;
    dom.progressFill.style.width = `${percent}%`;

    // 更新側邊欄勾選標記
    document.querySelectorAll(".unit-item").forEach(item => {
      const uId = item.getAttribute("data-unit-id");
      if (state.completedUnits.has(uId)) {
        item.classList.add("completed");
        const checkEl = item.querySelector(".unit-check");
        if (checkEl) checkEl.textContent = "✓";
      } else {
        item.classList.remove("completed");
        const checkEl = item.querySelector(".unit-check");
        if (checkEl) checkEl.textContent = "○";
      }
    });

    // 更新目前單元狀態標籤
    if (state.currentUnitId) {
      if (state.completedUnits.has(state.currentUnitId)) {
        dom.unitStatusTag.textContent = "✓ 已掌握";
        dom.unitStatusTag.style.color = "var(--accent-green)";
      } else {
        dom.unitStatusTag.textContent = "學習中";
        dom.unitStatusTag.style.color = "var(--accent-blue-hover)";
      }
    }
  }

  // 建立側邊欄導覽
  function renderSidebar() {
    const tracks = window.VIBE_CODER_META.tracks;
    const allUnits = window.VIBE_CODER_META.getAllUnits();

    dom.tracksNav.innerHTML = "";

    tracks.forEach(track => {
      const trackUnits = allUnits.filter(u => u.trackId === track.id);
      if (trackUnits.length === 0) return;

      const group = document.createElement("div");
      group.className = "track-group open";
      group.id = `group-${track.id}`;

      const btn = document.createElement("button");
      btn.className = "track-button";
      btn.innerHTML = `
        <div class="track-button-left">
          <span class="track-icon">${track.icon}</span>
          <span>軌道 ${track.number}: ${track.title}</span>
        </div>
        <span class="track-chevron">▶</span>
      `;
      btn.addEventListener("click", () => {
        group.classList.toggle("open");
      });

      const list = document.createElement("ul");
      list.className = "unit-list";

      trackUnits.forEach(unit => {
        const isCompleted = state.completedUnits.has(unit.id);
        const li = document.createElement("li");
        li.className = `unit-item ${unit.id === state.currentUnitId ? "active" : ""} ${isCompleted ? "completed" : ""}`;
        li.setAttribute("data-unit-id", unit.id);
        li.innerHTML = `
          <a href="#${unit.id}" class="unit-link">
            <span>${unit.unitNumber}. ${unit.title}</span>
            <span class="unit-check">${isCompleted ? "✓" : "○"}</span>
          </a>
        `;
        li.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          selectUnit(unit.id);
          closeMobileSidebar();
        });
        list.appendChild(li);
      });

      group.appendChild(btn);
      group.appendChild(list);
      dom.tracksNav.appendChild(group);
    });
  }

  // 選取單元
  function selectUnit(unitId) {
    const unit = window.VIBE_CODER_META.getUnitById(unitId);
    if (!unit) return;

    state.currentUnitId = unit.id;
    window.location.hash = unit.id;
    localStorage.setItem("vibe_coder_current_unit", unit.id);

    // 更新側邊欄 active 狀態
    document.querySelectorAll(".unit-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-unit-id") === unit.id);
    });

    // 確保所在軌道群組是展開的
    const parentGroup = document.getElementById(`group-${unit.trackId}`);
    if (parentGroup) parentGroup.classList.add("open");

    // 渲染單元頂部資訊
    const track = window.VIBE_CODER_META.tracks.find(t => t.id === unit.trackId);
    dom.breadcrumbTrack.textContent = track ? `軌道 ${track.number}: ${track.title}` : unit.trackTitle;
    dom.breadcrumbUnit.textContent = `單元 ${unit.unitNumber}`;
    dom.unitTitle.textContent = `${unit.unitNumber}. ${unit.title}`;
    dom.unitSubtitle.textContent = unit.subtitle;
    dom.metaReadingTime.textContent = unit.readingTime || "5 分鐘";
    dom.metaPrereq.textContent = (unit.prerequisites && unit.prerequisites.length) ? unit.prerequisites.join("、") : "無限制";

    // 渲染核心觀念卡片
    renderConcepts(unit.coreConcepts || []);

    // 渲染新手地雷卡片
    renderPitfalls(unit.pitfalls || []);

    // 渲染速查表
    renderCheatsheet(unit.commandsCheatsheet || []);

    // 渲染測驗
    renderQuiz(unit);

    // 掛載實戰沙盒
    mountWidget(unit);

    // 渲染底部上下單元按鈕
    renderNavFooter(unit);

    // 預設切換至核心觀念標籤
    switchTab(state.currentTab);
    updateProgressUI();

    // 捲動至頂部
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 渲染核心觀念
  function renderConcepts(concepts) {
    if (!concepts.length) {
      dom.conceptsContainer.innerHTML = `<p style="color: var(--text-muted);">本單元概念準備中…</p>`;
      return;
    }
    dom.conceptsContainer.innerHTML = concepts.map(c => `
      <div class="concept-card">
        <h3 class="concept-title">💡 ${c.title}</h3>
        <p class="concept-desc">${c.description}</p>
        ${c.points && c.points.length ? `
          <ul class="concept-points">
            ${c.points.map(pt => `<li class="concept-point">${pt}</li>`).join("")}
          </ul>
        ` : ""}
      </div>
    `).join("");
  }

  // 渲染新手地雷
  function renderPitfalls(pitfalls) {
    if (!pitfalls.length) {
      dom.pitfallsContainer.innerHTML = `<p style="color: var(--text-muted);">本單元目前無重大特定地雷。</p>`;
      return;
    }
    dom.pitfallsContainer.innerHTML = pitfalls.map(p => `
      <div class="pitfall-card">
        <h3 class="pitfall-title">⚠️ ${p.title}</h3>
        <p class="pitfall-why"><strong>原因分析：</strong>${p.why}</p>
        <div class="pitfall-fix">
          <strong>標準解法：</strong>${p.fix}
        </div>
      </div>
    `).join("");
  }

  // 渲染速查表
  function renderCheatsheet(cheatsheet) {
    if (!cheatsheet.length) {
      dom.cheatsheetContainer.innerHTML = `<p style="color: var(--text-muted);">本單元無需記憶之特殊指令。</p>`;
      return;
    }
    dom.cheatsheetContainer.innerHTML = `
      <div class="cheatsheet-table-wrap">
        <table class="cheatsheet-table">
          <thead>
            <tr>
              <th style="width: 45%;">指令 / 關鍵語法</th>
              <th style="width: 55%;">功能說明與使用情境</th>
            </tr>
          </thead>
          <tbody>
            ${cheatsheet.map(item => `
              <tr>
                <td><code class="code-badge">${escapeHtml(item.cmd)}</code></td>
                <td>${item.desc}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // 渲染隨堂測驗
  function renderQuiz(unit) {
    const quizList = unit.quiz || [];
    if (!quizList.length) {
      dom.quizContainer.innerHTML = `<p style="color: var(--text-muted);">本單元暫無隨堂測驗。</p>`;
      return;
    }

    const savedUnitAnswers = state.quizState[unit.id] || {};

    dom.quizContainer.innerHTML = quizList.map((q, qIdx) => {
      const selected = savedUnitAnswers[qIdx];
      const isAnswered = selected !== undefined;
      const isCorrect = selected === q.answer;

      return `
        <div class="quiz-question-card" data-q-idx="${qIdx}">
          <h4 class="quiz-question-text">第 ${qIdx + 1} 題：${q.question}</h4>
          <div class="quiz-options">
            ${q.options.map((opt, oIdx) => {
              let optClass = "quiz-option-btn";
              if (isAnswered) {
                if (oIdx === q.answer) optClass += " correct";
                else if (oIdx === selected) optClass += " wrong";
              }
              return `
                <button
                  type="button"
                  class="${optClass}"
                  data-o-idx="${oIdx}"
                  ${isAnswered ? "disabled" : ""}
                >${opt}</button>
              `;
            }).join("")}
          </div>
          ${isAnswered ? `
            <div class="quiz-explanation">
              <strong>${isCorrect ? "✅ 答對了！" : "❌ 觀念解析："}</strong> ${q.explanation}
            </div>
          ` : ""}
        </div>
      `;
    }).join("");

    // 綁定測驗點擊事件
    dom.quizContainer.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".quiz-question-card");
        const qIdx = parseInt(card.getAttribute("data-q-idx"), 10);
        const oIdx = parseInt(btn.getAttribute("data-o-idx"), 10);

        if (!state.quizState[unit.id]) state.quizState[unit.id] = {};
        state.quizState[unit.id][qIdx] = oIdx;

        // 重新渲染測驗以更新狀態
        renderQuiz(unit);

        // 檢查是否所有題目都答對了
        checkUnitCompletion(unit);
        saveProgress();
      });
    });
  }

  // 檢查是否掌握本單元
  function checkUnitCompletion(unit) {
    const quizList = unit.quiz || [];
    if (!quizList.length) {
      state.completedUnits.add(unit.id);
      return;
    }

    const saved = state.quizState[unit.id] || {};
    const allAnswered = quizList.every((q, idx) => saved[idx] !== undefined);
    const allCorrect = quizList.every((q, idx) => saved[idx] === q.answer);

    if (allCorrect) {
      state.completedUnits.add(unit.id);
    }
  }

  // 掛載互動沙盒
  function mountWidget(unit) {
    const widgetId = unit.widgetId || "terminal-widget";
    dom.sandboxWidgetName.textContent = widgetId ? `[${widgetId}]` : "";

    // 先卸載舊 Widget
    if (state.activeWidgetInstance && typeof state.activeWidgetInstance.unmount === "function") {
      try {
        state.activeWidgetInstance.unmount(dom.sandboxWidgetBody);
      } catch (err) {
        console.error("Widget unmount error:", err);
      }
    }
    dom.sandboxWidgetBody.innerHTML = "";

    const widget = window.VIBE_WIDGETS && window.VIBE_WIDGETS[widgetId];
    if (widget && typeof widget.mount === "function") {
      try {
        widget.mount(dom.sandboxWidgetBody, unit.widgetProps || {});
        state.activeWidgetInstance = widget;
      } catch (err) {
        dom.sandboxWidgetBody.innerHTML = `<div style="color: var(--accent-red); padding: 1rem;">沙盒載入錯誤：${err.message}</div>`;
      }
    } else {
      dom.sandboxWidgetBody.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚡</div>
          <p>此單元實戰互動沙盒 [${widgetId}] 即將就緒</p>
        </div>
      `;
    }
  }

  // 重置沙盒按鈕
  dom.resetSandboxBtn.addEventListener("click", () => {
    const unit = window.VIBE_CODER_META.getUnitById(state.currentUnitId);
    if (unit) mountWidget(unit);
  });

  // 底部換頁按鈕
  function renderNavFooter(unit) {
    const allUnits = window.VIBE_CODER_META.getAllUnits();
    const currentIndex = allUnits.findIndex(u => u.id === unit.id);

    if (currentIndex > 0) {
      const prev = allUnits[currentIndex - 1];
      dom.prevUnitBtn.style.visibility = "visible";
      dom.prevUnitTitle.textContent = `${prev.unitNumber}. ${prev.title}`;
      dom.prevUnitBtn.onclick = (e) => {
        e.preventDefault();
        selectUnit(prev.id);
      };
    } else {
      dom.prevUnitBtn.style.visibility = "hidden";
    }

    if (currentIndex < allUnits.length - 1) {
      const next = allUnits[currentIndex + 1];
      dom.nextUnitBtn.style.visibility = "visible";
      dom.nextUnitTitle.textContent = `${next.unitNumber}. ${next.title}`;
      dom.nextUnitBtn.onclick = (e) => {
        e.preventDefault();
        selectUnit(next.id);
      };
    } else {
      dom.nextUnitBtn.style.visibility = "hidden";
    }
  }

  // 標籤分頁切換
  function switchTab(tabKey) {
    state.currentTab = tabKey;
    dom.tabs.forEach(tab => {
      const isTarget = tab.getAttribute("data-tab") === tabKey;
      tab.classList.toggle("active", isTarget);
      tab.setAttribute("aria-selected", isTarget);
    });

    dom.tabPanes.forEach(pane => {
      const isTarget = pane.id === `tab-${tabKey}`;
      pane.classList.toggle("active", isTarget);
    });
  }

  dom.tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.getAttribute("data-tab"));
    });
  });

  // 搜尋功能
  dom.searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    state.searchQuery = query;

    document.querySelectorAll(".unit-item").forEach(item => {
      const uId = item.getAttribute("data-unit-id");
      const unit = window.VIBE_CODER_META.getUnitById(uId);
      if (!unit) return;

      const matches = !query ||
        unit.title.toLowerCase().includes(query) ||
        unit.subtitle.toLowerCase().includes(query) ||
        (unit.commandsCheatsheet || []).some(c => c.cmd.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));

      item.style.display = matches ? "" : "none";
    });
  });

  // 鍵盤快速鍵 (/ 聚焦搜尋, Esc 清除)
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== dom.searchInput) {
      e.preventDefault();
      dom.searchInput.focus();
    } else if (e.key === "Escape" && document.activeElement === dom.searchInput) {
      dom.searchInput.value = "";
      dom.searchInput.blur();
      dom.searchInput.dispatchEvent(new Event("input"));
    }
  });

  // 手機版側邊欄控制
  function openMobileSidebar() {
    dom.appSidebar.classList.add("open");
    dom.sidebarBackdrop.style.display = "block";
  }

  function closeMobileSidebar() {
    dom.appSidebar.classList.remove("open");
    dom.sidebarBackdrop.style.display = "none";
  }

  dom.mobileNavToggle.addEventListener("click", openMobileSidebar);
  dom.sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // 輔助函式：HTML 跳脫
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 應用程式進入點
  function init() {
    initTheme();
    renderSidebar();

    const allUnits = window.VIBE_CODER_META.getAllUnits();
    if (!allUnits.length) {
      console.warn("No units loaded yet. Waiting for track scripts.");
      return;
    }

    // 取得初始單元 (依序檢查 Hash、LocalStorage、預設第一個單元)
    let initUnitId = window.location.hash.replace(/^#/, "");
    if (!initUnitId || !window.VIBE_CODER_META.getUnitById(initUnitId)) {
      initUnitId = localStorage.getItem("vibe_coder_current_unit") || allUnits[0].id;
    }

    selectUnit(initUnitId);
    updateProgressUI();
  }

  // 監聽載入完成事件
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // 全域暴露重新載入方法以配合動態腳本載入
  window.VIBE_CODER_APP = {
    reload() {
      init();
    },
    selectUnit(id) {
      selectUnit(id);
    }
  };
})();
