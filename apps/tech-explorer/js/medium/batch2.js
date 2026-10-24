// ==========================================================================
// 科技原理小探險 (tech-explorer) - Batch 2 Interactive Widgets
// Standard widget signature: (host, params, api) => void
// API: { good(), bad(), done(), later(fn, ms), alive() }
// Language: Taiwan Mandarin (zh-TW)
//
// Widgets:
// 1. deskrelay: 【辦公桌與大書架連動】(inside Slide 0)
// 2. sensorheroes: 【感測器解謎任務】(screens Slide 1)
// 3. urltrain: 【網址火車掛鉤拼圖】(web Slide 0)
// 4. tlshandshake: 【數位印章與金鑰拼合】(web Slide 4)
// ==========================================================================

const safeLater = (api, fn, ms) => {
  if (api && typeof api.later === 'function') {
    return api.later(() => {
      if (api.alive && !api.alive()) return;
      fn();
    }, ms);
  }
  return setTimeout(fn, ms);
};

const safeGood = api => {
  if (api && typeof api.good === 'function') api.good();
};

const safeBad = api => {
  if (api && typeof api.bad === 'function') api.bad();
};

const safeDone = api => {
  if (api && typeof api.done === 'function') api.done();
};

const pop = el => {
  if (!el) return;
  el.classList.remove('b2-pop');
  void el.offsetWidth;
  el.classList.add('b2-pop');
};

const shake = el => {
  if (!el) return;
  el.classList.remove('b2-shake');
  void el.offsetWidth;
  el.classList.add('b2-shake');
};

// ==========================================================================
// 1. deskrelay: 【辦公桌與大書架連動】(Inside the Computer)
// ==========================================================================

export function deskrelay(host, _params, api) {
  host.innerHTML = `
    <div class="b2-panel b2-deskrelay">
      <div class="gemini-tag" data-created-by="gemini" data-info="辦公桌與大書架連動（CPU、RAM 與硬碟分工）">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b2-info-banner">
        <span class="b2-info-icon">💡</span>
        <span class="b2-info-text">探索電腦分工：硬碟容量大但拿書慢、記憶體像桌面隨手拿但斷電清空、CPU 在桌面飛快處理！</span>
      </div>

      <div class="b2-header">
        <div class="b2-title-row">
          <span class="b2-title">🧠 電腦裡面的好朋友：辦公桌與大書架連動</span>
        </div>
        <p class="b2-subtitle">跟著工作者依序操作，體驗開啟大相簿、CPU 快速修圖、存檔放回，以及突然斷電的奇妙差別！</p>
      </div>

      <div class="b2-dr-stage">
        <!-- Left: 📚 大書架 (Hard Drive / 硬碟與 SSD) -->
        <div class="b2-dr-shelf-zone">
          <div class="b2-dr-zone-header">
            <span class="b2-dr-zone-title">📚 大書架（硬碟 HDD/SSD）</span>
            <span class="b2-dr-zone-badge">容量：512 GB · 永久保存</span>
          </div>

          <div class="b2-dr-bookcase">
            <div class="b2-dr-shelf-row">
              <div class="b2-dr-book highlight" id="b2DrTargetBook">📖 500MB 大相簿</div>
              <div class="b2-dr-book normal">🎮 賽車遊戲 4GB</div>
            </div>
            <div class="b2-dr-shelf-row">
              <div class="b2-dr-book normal">🎨 畫畫軟體 2GB</div>
              <div class="b2-dr-book system">📝 暑假日記 5MB</div>
            </div>
          </div>

          <div class="b2-dr-safe-badge">
            🔒 斷電也安全無恙
          </div>
        </div>

        <!-- Center: 走道與 CPU 核心工作者 -->
        <div class="b2-dr-corridor">
          <div class="b2-dr-path-line"></div>
          <div class="b2-dr-worker" id="b2DrWorker">
            <div class="b2-dr-worker-bubble" id="b2DrBubble">準備開工！</div>
            <span class="b2-dr-worker-avatar">👨‍🍳</span>
          </div>
        </div>

        <!-- Right: 🪑 辦公桌 (RAM / 記憶體) -->
        <div class="b2-dr-desk-zone" id="b2DrDeskZone">
          <div class="b2-dr-zone-header">
            <span class="b2-dr-zone-title">🪑 辦公桌（記憶體 RAM）</span>
            <span class="b2-dr-zone-badge">容量：8 GB · 隨手快取</span>
          </div>

          <div class="b2-dr-desk-surface" id="b2DrDeskSurface">
            <span class="b2-dr-desk-empty" id="b2DrDeskEmpty">桌面空空的，等待載入資料</span>
            <div class="b2-dr-album-card" id="b2DrDeskAlbum" style="display: none;">
              <span class="b2-dr-sparkles" id="b2DrSparkles" style="display: none;">✨</span>
              <span class="b2-dr-album-photo" id="b2DrPhoto">🐱</span>
              <span class="b2-dr-album-title" id="b2DrAlbumTitle">500MB 大相簿 (載入中)</span>
            </div>
          </div>

          <div class="b2-dr-power-badge" id="b2DrPowerBadge">
            🟢 電源正常供應中
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="b2-dr-controls">
        <button class="b2-btn b2-btn-primary" id="b2DrBtnLoad">
          <span>📖 1. 開啟大相簿</span>
        </button>
        <button class="b2-btn b2-btn-action" id="b2DrBtnFilter" disabled>
          <span>🎨 2. 修圖套用濾鏡</span>
        </button>
        <button class="b2-btn b2-btn-save" id="b2DrBtnSave" disabled>
          <span>💾 3. 儲存並放回</span>
        </button>
        <button class="b2-btn b2-btn-warn" id="b2DrBtnPower">
          <span>⚡ 4. 突然停電！</span>
        </button>
        <button class="b2-btn b2-btn-reset" id="b2DrBtnReset">
          <span>🔄 再試一次</span>
        </button>
      </div>

      <div class="b2-status" id="b2DrStatus" role="status" aria-live="polite">
        請點選「1. 開啟大相簿」，讓工作者去大書架把相簿搬到辦公桌上！
      </div>
    </div>
  `;

  // Selectors
  const statusEl = host.querySelector('#b2DrStatus');
  const targetBookEl = host.querySelector('#b2DrTargetBook');
  const workerEl = host.querySelector('#b2DrWorker');
  const bubbleEl = host.querySelector('#b2DrBubble');
  const deskZoneEl = host.querySelector('#b2DrDeskZone');
  const deskEmptyEl = host.querySelector('#b2DrDeskEmpty');
  const deskAlbumEl = host.querySelector('#b2DrDeskAlbum');
  const photoEl = host.querySelector('#b2DrPhoto');
  const albumTitleEl = host.querySelector('#b2DrAlbumTitle');
  const sparklesEl = host.querySelector('#b2DrSparkles');
  const powerBadgeEl = host.querySelector('#b2DrPowerBadge');

  const btnLoad = host.querySelector('#b2DrBtnLoad');
  const btnFilter = host.querySelector('#b2DrBtnFilter');
  const btnSave = host.querySelector('#b2DrBtnSave');
  const btnPower = host.querySelector('#b2DrBtnPower');
  const btnReset = host.querySelector('#b2DrBtnReset');

  // State
  let isMoving = false;
  let bookLoaded = false;
  let isFiltered = false;
  let isSaved = false;

  const setStatus = (msg, type = '') => {
    statusEl.textContent = msg;
    statusEl.className = 'b2-status ' + type;
    pop(statusEl);
  };

  // Button 1: Load from Shelf to Desk
  btnLoad.addEventListener('click', () => {
    if (isMoving || bookLoaded) return;
    isMoving = true;
    btnLoad.disabled = true;
    bubbleEl.textContent = '去大書架拿 500MB 大相簿...';
    workerEl.style.transform = 'translateX(-30px)';

    safeLater(api, () => {
      targetBookEl.classList.add('ghost');
      targetBookEl.textContent = '📖 [已搬到桌面]';
      bubbleEl.textContent = '搬到辦公桌（記憶體）囉！';
      workerEl.classList.add('carrying');
      workerEl.style.transform = 'translateX(40px)';

      safeLater(api, () => {
        workerEl.classList.remove('carrying');
        workerEl.style.transform = 'translateX(0)';
        bubbleEl.textContent = '隨手翻閱超快速！';

        deskEmptyEl.style.display = 'none';
        deskAlbumEl.style.display = 'flex';
        albumTitleEl.textContent = '500MB 大相簿 (已載入)';
        photoEl.textContent = '🐱';
        photoEl.classList.remove('filtered');
        pop(deskAlbumEl);

        bookLoaded = true;
        isMoving = false;
        btnFilter.disabled = false;
        setStatus('從硬碟載入記憶體！桌面隨手拿得到，運算速度快 1000 倍！', 'good');
        safeGood(api);
      }, 500);
    }, 400);
  });

  // Button 2: Apply filter on desk
  btnFilter.addEventListener('click', () => {
    if (isMoving || !bookLoaded || isFiltered) return;
    isMoving = true;
    btnFilter.disabled = true;
    bubbleEl.textContent = 'CPU 核心正在極速修圖...';
    sparklesEl.style.display = 'block';

    safeLater(api, () => {
      photoEl.classList.add('filtered');
      photoEl.textContent = '😻';
      albumTitleEl.textContent = '✨ 500MB 大相簿 (璀璨濾鏡)';
      pop(photoEl);
      sparklesEl.style.display = 'none';

      isFiltered = true;
      isMoving = false;
      btnSave.disabled = false;
      bubbleEl.textContent = '運算完成！別忘了存檔喔！';
      setStatus('CPU 在記憶體桌面快速運算！濾鏡修圖瞬間完成！', 'good');
      safeGood(api);
    }, 450);
  });

  // Button 3: Save and return to shelf
  btnSave.addEventListener('click', () => {
    if (isMoving || !bookLoaded || !isFiltered || isSaved) return;
    isMoving = true;
    btnSave.disabled = true;
    bubbleEl.textContent = '修好了！抱回大書架永久儲存...';
    workerEl.classList.add('carrying');
    workerEl.style.transform = 'translateX(-30px)';

    deskAlbumEl.style.display = 'none';
    deskEmptyEl.style.display = 'block';

    safeLater(api, () => {
      workerEl.classList.remove('carrying');
      workerEl.style.transform = 'translateX(0)';
      bubbleEl.textContent = '書本已在書架安全存檔！';

      targetBookEl.classList.remove('ghost');
      targetBookEl.textContent = '⭐ 500MB 大相簿 (已保存)';
      targetBookEl.classList.add('normal');
      pop(targetBookEl);

      isSaved = true;
      isMoving = false;
      setStatus('寫入硬碟永久保存！就算關機，相簿也不會不見囉！', 'good');
      safeGood(api);
      safeDone(api);
    }, 600);
  });

  // Button 4: Sudden power cut!
  btnPower.addEventListener('click', () => {
    if (isMoving) return;
    deskZoneEl.classList.remove('powercut');
    void deskZoneEl.offsetWidth;
    deskZoneEl.classList.add('powercut');
    powerBadgeEl.className = 'b2-dr-power-badge off';
    powerBadgeEl.textContent = '⚡ 斷電停機！';

    // Clear desk immediately
    const lostUnsaved = bookLoaded && !isSaved;
    deskAlbumEl.style.display = 'none';
    deskEmptyEl.style.display = 'block';
    deskEmptyEl.textContent = '⚡ 斷電清空！桌面所有東西都消失了！';

    bubbleEl.textContent = '⚡ 哇！突然沒電了！';
    shake(workerEl);

    safeLater(api, () => {
      if (lostUnsaved) {
        setStatus('⚡ 突然停電！記憶體斷電資料會消失，但硬碟裡的書還在！這就是為什麼一定要記得存檔！', 'warn');
      } else {
        setStatus('⚡ 突然停電！桌面清空了，但大書架（硬碟）裡的書依然安然無恙！', 'warn');
      }

      // Reset power badge after 1.8s
      safeLater(api, () => {
        powerBadgeEl.className = 'b2-dr-power-badge';
        powerBadgeEl.textContent = '🟢 電源正常供應中';
        deskEmptyEl.textContent = '桌面空空的，等待載入資料';
        deskZoneEl.classList.remove('powercut');
      }, 1800);
    }, 200);
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    isMoving = false;
    bookLoaded = false;
    isFiltered = false;
    isSaved = false;

    workerEl.style.transform = 'translateX(0)';
    workerEl.classList.remove('carrying');
    bubbleEl.textContent = '準備開工！';

    targetBookEl.className = 'b2-dr-book highlight';
    targetBookEl.textContent = '📖 500MB 大相簿';

    deskAlbumEl.style.display = 'none';
    deskEmptyEl.style.display = 'block';
    deskEmptyEl.textContent = '桌面空空的，等待載入資料';
    photoEl.classList.remove('filtered');
    photoEl.textContent = '🐱';
    sparklesEl.style.display = 'none';

    powerBadgeEl.className = 'b2-dr-power-badge';
    powerBadgeEl.textContent = '🟢 電源正常供應中';
    deskZoneEl.classList.remove('powercut');

    btnLoad.disabled = false;
    btnFilter.disabled = true;
    btnSave.disabled = true;

    setStatus('請點選「1. 開啟大相簿」，讓工作者去大書架把相簿搬到辦公桌上！');
  });
}

// ==========================================================================
// 2. sensorheroes: 【感測器解謎任務】(Screens & Sensors)
// ==========================================================================

export function sensorheroes(host, _params, api) {
  const MISSIONS = [
    {
      id: 0,
      name: '走進黑夜街道 🌙',
      title: '任務 1：天黑了，手機好刺眼！',
      sensorNeeded: 'light',
      desc: '走在夜晚街道上，手機螢幕太刺眼，需要一位感測器英雄幫忙調節！',
    },
    {
      id: 1,
      name: '開車地圖轉彎 🚗',
      title: '任務 2：開車右轉，地圖方向反了！',
      sensorNeeded: 'gyro',
      desc: '車子右轉彎了，但地圖還直直的，需要感測器英雄讓地圖順暢旋轉轉向！',
    },
    {
      id: 2,
      name: '貼近耳朵講電話 📞',
      title: '任務 3：講電話時，臉頰快碰到按鈕了！',
      sensorNeeded: 'prox',
      desc: '手機貼近臉頰講電話，需要感測器英雄關閉螢幕，防止臉頰誤觸掛斷鍵！',
    },
    {
      id: 3,
      name: '呼叫語音助理 🗣️',
      title: '任務 4：雙手拿滿東西，想查天氣！',
      sensorNeeded: 'mic',
      desc: '雙手拿著厚厚課本，對著手機喊「嘿 Siri，明天會下雨嗎？」，需要誰來聽見聲音並喚醒小幫手？',
    },
  ];

  const HEROES = [
    {
      id: 'light',
      name: '光線感測器',
      icon: '💡',
      en: 'Ambient Light Sensor',
      duty: '偵測周圍環境光線強弱',
    },
    {
      id: 'gyro',
      name: '陀螺儀與加速度計',
      icon: '🧭',
      en: 'Gyroscope & Accelerometer',
      duty: '偵測旋轉角度與移動方向',
    },
    {
      id: 'prox',
      name: '距離感測器',
      icon: '📏',
      en: 'Proximity Sensor',
      duty: '偵測物體是否貼近螢幕表面',
    },
    {
      id: 'mic',
      name: '麥克風',
      icon: '🎙️',
      en: 'Microphone',
      duty: '偵測周圍聲音與說話大小聲',
    },
  ];

  host.innerHTML = `
    <div class="b2-panel b2-sensorheroes">
      <div class="gemini-tag" data-created-by="gemini" data-info="感測器解謎任務（環境光、陀螺儀、距離感測器、麥克風）">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b2-info-banner">
        <span class="b2-info-icon">💡</span>
        <span class="b2-info-text">手機遇到 4 大生活情境！請派出正確的「感測器英雄」發揮超能力解決問題！</span>
      </div>

      <div class="b2-header">
        <div class="b2-title-row">
          <span class="b2-title">📱 手機的超能力：感測器解謎任務</span>
        </div>
      </div>

      <!-- Missions Navigation Tabs -->
      <div class="b2-sh-missions" role="tablist">
        ${MISSIONS.map((m, idx) => `
          <button class="b2-sh-mission-tab ${idx === 0 ? 'active' : ''}" data-mid="${m.id}" role="tab">
            <span>${m.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Phone Simulator Stage -->
      <div class="b2-sh-stage">
        <div class="b2-sh-phone">
          <div class="b2-sh-phone-notch">
            <span class="b2-sh-sensor-dot" id="b2ShDotLight" title="光線感測器"></span>
            <span class="b2-sh-sensor-dot" id="b2ShDotCam" title="鏡頭"></span>
            <span class="b2-sh-sensor-dot proximity" id="b2ShDotProx" title="距離感測器"></span>
            <span class="b2-sh-sensor-dot mic" id="b2ShDotMic" title="麥克風收音孔"></span>
          </div>

          <div class="b2-sh-phone-screen" id="b2ShScreen">
            <!-- Dynamic view injected by JS -->
          </div>
        </div>
      </div>

      <!-- Heroes Deck -->
      <div class="b2-sh-heroes">
        ${HEROES.map(h => `
          <button class="b2-sh-hero-card" data-hero="${h.id}">
            <span class="b2-sh-hero-icon">${h.icon}</span>
            <div class="b2-sh-hero-info">
              <span class="b2-sh-hero-name">${h.name}</span>
              <span class="b2-sh-hero-desc">${h.duty}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="b2-status" id="b2ShStatus" role="status" aria-live="polite">
        請派遣一位感測器英雄來幫助手機！
      </div>

      <div style="display: flex; justify-content: center; margin-top: 4px;">
        <button class="b2-btn b2-btn-reset" id="b2ShResetBtn">
          <span>🔄 再試一次</span>
        </button>
      </div>
    </div>
  `;

  // Selectors
  const screenEl = host.querySelector('#b2ShScreen');
  const statusEl = host.querySelector('#b2ShStatus');
  const tabs = host.querySelectorAll('.b2-sh-mission-tab');
  const heroCards = host.querySelectorAll('.b2-sh-hero-card');
  const dotLight = host.querySelector('#b2ShDotLight');
  const dotProx = host.querySelector('#b2ShDotProx');
  const dotMic = host.querySelector('#b2ShDotMic');
  const resetBtn = host.querySelector('#b2ShResetBtn');

  let currentMissionId = 0;
  const completedMissions = new Set();

  const setStatus = (msg, type = '') => {
    statusEl.textContent = msg;
    statusEl.className = 'b2-status ' + type;
    pop(statusEl);
  };

  const renderMission = id => {
    currentMissionId = id;
    tabs.forEach(t => {
      const mid = Number(t.dataset.mid);
      t.classList.toggle('active', mid === id);
      t.classList.toggle('done', completedMissions.has(mid));
    });

    // Reset sensor dots
    dotLight.classList.remove('active');
    dotProx.classList.remove('active');
    if (dotMic) dotMic.classList.remove('active');

    if (id === 0) {
      const isDone = completedMissions.has(0);
      if (isDone) dotLight.classList.add('active');
      screenEl.innerHTML = `
        <div class="b2-sh-view-night" style="${isDone ? 'filter: brightness(0.65);' : ''}">
          <span class="b2-sh-night-moon">🌙 ✨</span>
          ${isDone ? `
            <div class="b2-sh-night-dimmed">
              <span>💡 光線感測器防護中</span><br>
              <small>自動切換舒適暗色護眼模式 😊</small>
            </div>
          ` : `
            <div class="b2-sh-night-glare" id="b2ShGlare">
              <span>⚠️ 刺眼白光 (100% 亮度)</span><br>
              <small>好刺眼啊！快叫感測器幫忙！😵</small>
            </div>
          `}
        </div>
      `;
      if (!isDone) {
        setStatus('任務 1：天黑了，手機太亮好刺眼！哪位英雄能感覺到周圍的光線？');
      }
    } else if (id === 1) {
      const isDone = completedMissions.has(1);
      screenEl.innerHTML = `
        <div class="b2-sh-view-map">
          <div class="b2-sh-map-canvas" id="b2ShMapCanvas" style="transform: rotate(${isDone ? '90deg' : '0deg'});">
            <div class="b2-sh-map-road"></div>
            <span class="b2-sh-map-arrow">🚗</span>
          </div>
          <div class="b2-sh-map-status">
            ${isDone ? '🧭 地圖已旋轉 90 度，箭頭朝正前方！' : '⚠️ 車子已右轉，但地圖還沒轉向！'}
          </div>
        </div>
      `;
      if (!isDone) {
        setStatus('任務 2：車子右轉彎了，哪位英雄能感測手機旋轉與翻轉角度？');
      }
    } else if (id === 2) {
      const isDone = completedMissions.has(2);
      if (isDone) dotProx.classList.add('active');
      screenEl.innerHTML = `
        <div class="b2-sh-view-call ${isDone ? 'dimmed' : ''}">
          <span class="b2-sh-cheek-anim ${isDone ? 'close' : ''}">👤</span>
          <div>
            <div class="b2-sh-call-avatar">👩‍🦰</div>
            <div class="b2-sh-call-name">媽媽通話中</div>
            <div class="b2-sh-call-time">通話時間 01:23</div>
          </div>
          <div class="b2-sh-call-end-btn">📞</div>
          ${isDone ? `
            <div class="b2-sh-screen-shield">
              <span>🛡️ 防誤觸模式已啟動</span>
              <small>螢幕關閉，臉頰碰不到按鍵囉！</small>
            </div>
          ` : ''}
        </div>
      `;
      if (!isDone) {
        setStatus('任務 3：手機貼近臉頰講電話，哪位英雄能測量物體貼近距離？');
      }
    } else if (id === 3) {
      const isDone = completedMissions.has(3);
      if (isDone && dotMic) dotMic.classList.add('active');
      screenEl.innerHTML = `
        <div class="b2-sh-view-voice">
          <div class="b2-sh-voice-user">
            <div style="font-size: 2.2rem;">📚 🧒 📚</div>
            <div class="b2-sh-voice-bubble">
              🗣️「嘿 Siri，明天會下雨嗎？」
            </div>
          </div>
          ${isDone ? `
            <div class="b2-sh-siri-box">
              <div class="b2-sh-siri-orb"></div>
              <div class="b2-sh-soundwaves">
                <span class="b2-sh-soundwave-bar"></span>
                <span class="b2-sh-soundwave-bar"></span>
                <span class="b2-sh-soundwave-bar"></span>
                <span class="b2-sh-soundwave-bar"></span>
                <span class="b2-sh-soundwave-bar"></span>
              </div>
              <div class="b2-sh-siri-response">
                🔮 <b>Siri 回應：</b><br>
                「明天降雨機率 10%，晴空萬里不用帶傘喔！☀️」
              </div>
            </div>
          ` : `
            <div class="b2-sh-voice-waiting">
              <span>雙手拿滿課本沒空按螢幕...</span><br>
              <b>誰能聽見聲音並喚醒語音助理？</b>
            </div>
          `}
        </div>
      `;
      if (!isDone) {
        setStatus('任務 4：雙手拿滿東西沒手按螢幕，哪位英雄能聽見「嘿 Siri」的語音指令？');
      }
    }
  };

  // Switch tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      renderMission(Number(tab.dataset.mid));
    });
  });

  // Hero clicked
  heroCards.forEach(card => {
    card.addEventListener('click', () => {
      const heroId = card.dataset.hero;
      const mission = MISSIONS[currentMissionId];

      if (heroId === mission.sensorNeeded) {
        // Correct Match!
        completedMissions.add(currentMissionId);
        card.classList.add('matched');
        safeGood(api);

        if (currentMissionId === 0) {
          dotLight.classList.add('active');
          const glare = host.querySelector('#b2ShGlare');
          if (glare) {
            glare.style.transform = 'scale(0.8)';
            glare.style.opacity = '0';
          }
          safeLater(api, () => {
            renderMission(0);
            setStatus('✨ 感測到變暗，自動調暗螢幕！保護眼睛真貼心！', 'good');
          }, 350);
        } else if (currentMissionId === 1) {
          const map = host.querySelector('#b2ShMapCanvas');
          if (map) map.style.transform = 'rotate(90deg)';
          safeLater(api, () => {
            renderMission(1);
            setStatus('✨ 感測到旋轉，地圖順暢跟著轉向！開車不會迷路！', 'good');
          }, 400);
        } else if (currentMissionId === 2) {
          dotProx.classList.add('active');
          const cheek = host.querySelector('.b2-sh-cheek-anim');
          if (cheek) cheek.classList.add('close');
          safeLater(api, () => {
            renderMission(2);
            setStatus('✨ 感測到臉頰貼近，關閉螢幕防誤觸！安心講電話！', 'good');
          }, 400);
        } else if (currentMissionId === 3) {
          if (dotMic) dotMic.classList.add('active');
          safeLater(api, () => {
            renderMission(3);
            setStatus('✨ 麥克風成功接收聲波！Siri 被喚醒並回答了天氣問題！', 'good');
          }, 400);
        }

        // Check if all done
        if (completedMissions.size === MISSIONS.length) {
          safeLater(api, () => {
            setStatus('🎉 太棒了！4 大感測器英雄全部成功解決任務，手機真的超聰明！', 'good');
            safeDone(api);
          }, 800);
        } else {
          // Advance to next unfinished mission
          safeLater(api, () => {
            const nextMission = MISSIONS.find(m => !completedMissions.has(m.id));
            if (nextMission) {
              renderMission(nextMission.id);
            }
          }, 1400);
        }
      } else {
        // Wrong match
        shake(card);
        safeBad(api);
        if (currentMissionId === 3) {
          setStatus('🤔 這個英雄聽不到聲音喔！需要能接收「說話聲波」的麥克風英雄！', 'bad');
        } else if (heroId === 'mic') {
          setStatus('🤔 麥克風專門聽聲音與說話，沒辦法解決這個情境喔！請想想看哪位英雄專門處理？', 'bad');
        } else if (currentMissionId === 0) {
          setStatus('🤔 這個英雄不知道天色暗不暗喔！需要能測量「周圍光線」的光線感測器！', 'bad');
        } else if (currentMissionId === 1) {
          setStatus('🤔 這個英雄不知道車子有沒有轉彎喔！需要能測量「角度旋轉」的陀螺儀！', 'bad');
        } else if (currentMissionId === 2) {
          setStatus('🤔 這個英雄不知道臉頰有沒有靠過來喔！需要能測量「物體距離」的距離感測器！', 'bad');
        }
      }
    });
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    completedMissions.clear();
    heroCards.forEach(c => c.classList.remove('matched'));
    renderMission(0);
    setStatus('任務重來：請點選光線感測器，幫黑夜街道上的手機調暗護眼！');
  });

  // Initial render
  renderMission(0);
}

// ==========================================================================
// 3. urltrain: 【網址火車掛鉤拼圖】(URLs & Web Addresses)
// ==========================================================================

export function urltrain(host, _params, api) {
  const CARRIAGES = [
    {
      id: 'proto',
      icon: '🚂',
      text: 'https://',
      label: '1. 安全加密協定 (Protocol)',
      hint: '車頭 · 最前面帶領的動力引擎',
      order: 1,
    },
    {
      id: 'domain',
      icon: '🚃',
      text: 'zoo.gov.tw',
      label: '2. 網域名稱 (Domain Name)',
      hint: '車身 · 動物園網站的大門地址',
      order: 2,
    },
    {
      id: 'path',
      icon: '🚋',
      text: '/panda/photo.jpg',
      label: '3. 網頁路徑 (Path)',
      hint: '車尾 · 熊貓照片的精確寶物房間',
      order: 3,
    },
  ];

  host.innerHTML = `
    <div class="b2-panel b2-urltrain">
      <div class="gemini-tag" data-created-by="gemini" data-info="網址火車掛鉤拼圖（協定、網域名稱、路徑）">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b2-info-banner">
        <span class="b2-info-icon">💡</span>
        <span class="b2-info-text">網址就像一列 3 節磁吸火車！依序掛上協定車頭、網域車身、路徑車尾，火車開進瀏覽器看可愛熊貓！</span>
      </div>

      <div class="b2-header">
        <div class="b2-title-row">
          <span class="b2-title">🚂 網址火車掛鉤拼圖：組成完整網路地址</span>
        </div>
      </div>

      <div class="b2-ut-stage">
        <!-- Top: Mini Browser Window -->
        <div class="b2-ut-browser">
          <div class="b2-ut-browser-bar">
            <div class="b2-ut-dots">
              <span class="b2-ut-dot red"></span>
              <span class="b2-ut-dot yellow"></span>
              <span class="b2-ut-dot green"></span>
            </div>
            <div class="b2-ut-address-input" id="b2UtAddressBar">
              <span>網址：</span>
              <span id="b2UtAddrDisplay" style="color: #868e96;">[等待火車入站載入網址...]</span>
            </div>
          </div>
          <div class="b2-ut-viewport" id="b2UtViewport">
            <div class="b2-ut-waiting-sign" id="b2UtWaitingSign">
              <span>🚉 熊貓月台等待火車進站中...</span>
              <small>將下方 3 節車廂依序掛鉤在鐵軌上！</small>
            </div>
            <div class="b2-ut-panda-page" id="b2UtPandaPage" style="display: none;">
              <span class="b2-ut-panda-photo">🐼🎋</span>
              <div class="b2-ut-panda-details">
                <span class="b2-ut-panda-heading">臺北市立動物園 · 大熊貓即時照</span>
                <span class="b2-ut-panda-desc">圓寶正在開心吃新鮮竹子！歡迎光臨大貓熊館！</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle: Railway Track & Snap Slots -->
        <div class="b2-ut-track-zone">
          <div class="b2-ut-slots">
            <div class="b2-ut-slot" id="b2UtSlot1" data-slot="1">
              <span class="b2-ut-slot-hint">【第 1 節：協定 Protocol】</span>
              <span id="b2UtSlotContent1">等待火車頭...</span>
            </div>
            <div class="b2-ut-slot" id="b2UtSlot2" data-slot="2">
              <span class="b2-ut-slot-hint">【第 2 節：網域名稱 Domain】</span>
              <span id="b2UtSlotContent2">等待車身...</span>
            </div>
            <div class="b2-ut-slot" id="b2UtSlot3" data-slot="3">
              <span class="b2-ut-slot-hint">【第 3 節：網頁路徑 Path】</span>
              <span id="b2UtSlotContent3">等待車尾...</span>
            </div>
          </div>
          <div class="b2-ut-track-rails"></div>
        </div>

        <!-- Bottom: Shuffled Carriages Dock -->
        <div class="b2-ut-dock" id="b2UtDock">
          <!-- Rendered in shuffled order -->
        </div>
      </div>

      <div class="b2-status" id="b2UtStatus" role="status" aria-live="polite">
        請點選第 1 節「協定車頭 https://」掛上鐵軌！
      </div>

      <div style="display: flex; justify-content: center;">
        <button class="b2-btn b2-btn-reset" id="b2UtResetBtn">
          <span>🔄 再試一次</span>
        </button>
      </div>
    </div>
  `;

  // Selectors
  const dockEl = host.querySelector('#b2UtDock');
  const statusEl = host.querySelector('#b2UtStatus');
  const addrDisplayEl = host.querySelector('#b2UtAddrDisplay');
  const waitingSignEl = host.querySelector('#b2UtWaitingSign');
  const pandaPageEl = host.querySelector('#b2UtPandaPage');
  const resetBtn = host.querySelector('#b2UtResetBtn');

  const slot1 = host.querySelector('#b2UtSlot1');
  const slot2 = host.querySelector('#b2UtSlot2');
  const slot3 = host.querySelector('#b2UtSlot3');
  const slotContent1 = host.querySelector('#b2UtSlotContent1');
  const slotContent2 = host.querySelector('#b2UtSlotContent2');
  const slotContent3 = host.querySelector('#b2UtSlotContent3');

  let attachedCount = 0;
  const attachedIds = new Set();

  const setStatus = (msg, type = '') => {
    statusEl.textContent = msg;
    statusEl.className = 'b2-status ' + type;
    pop(statusEl);
  };

  const renderDock = () => {
    // Shuffled list
    const shuffled = [...CARRIAGES].sort(() => Math.random() - 0.5);
    dockEl.innerHTML = shuffled.map(c => `
      <button class="b2-ut-carriage ${c.id}" data-id="${c.id}" data-order="${c.order}">
        <span class="b2-ut-car-icon">${c.icon}</span>
        <div class="b2-ut-car-info">
          <span class="b2-ut-car-text">${c.text}</span>
          <span class="b2-ut-car-label">${c.label}</span>
        </div>
      </button>
    `).join('');

    dockEl.querySelectorAll('.b2-ut-carriage').forEach(btn => {
      btn.addEventListener('click', () => onCarriageClick(btn));
    });
  };

  const updateAddressBar = () => {
    const p1 = attachedIds.has('proto') ? '<span class="b2-ut-addr-part b2-ut-addr-proto">https://</span>' : '';
    const p2 = attachedIds.has('domain') ? '<span class="b2-ut-addr-part b2-ut-addr-domain">zoo.gov.tw</span>' : '';
    const p3 = attachedIds.has('path') ? '<span class="b2-ut-addr-part b2-ut-addr-path">/panda/photo.jpg</span>' : '';

    if (!p1 && !p2 && !p3) {
      addrDisplayEl.innerHTML = '<span style="color: #868e96;">[等待火車入站載入網址...]</span>';
    } else {
      addrDisplayEl.innerHTML = `🔒 ${p1}${p2}${p3}`;
    }
  };

  const onCarriageClick = btn => {
    const id = btn.dataset.id;
    const order = Number(btn.dataset.order);

    if (attachedIds.has(id)) return;

    // Must be in order: 1 -> 2 -> 3
    if (order !== attachedCount + 1) {
      shake(btn);
      safeBad(api);
      if (attachedCount === 0) {
        setStatus('🚂 火車需要先掛上最前面的動力車頭（協定 https://）喔！', 'bad');
      } else if (attachedCount === 1) {
        setStatus('🚃 請先掛上第 2 節車身（網域名稱 zoo.gov.tw）喔！', 'bad');
      }
      return;
    }

    // Attach successfully!
    attachedIds.add(id);
    attachedCount++;
    btn.classList.add('attached');
    safeGood(api);

    if (id === 'proto') {
      slot1.classList.add('filled');
      slotContent1.innerHTML = '<b>🚂 https://</b><br><small>加密協定車頭</small>';
      pop(slot1);
      setStatus('🚂 協定車頭掛上了！代表用安全的 https 加密協定通訊！請接著掛上網域車身！', 'good');
    } else if (id === 'domain') {
      slot2.classList.add('filled');
      slotContent2.innerHTML = '<b>🚃 zoo.gov.tw</b><br><small>網域名稱車身</small>';
      pop(slot2);
      setStatus('🚃 網域名稱車身掛上了！帶領我們前往動物園的伺服器！最後掛上路徑車尾！', 'good');
    } else if (id === 'path') {
      slot3.classList.add('filled');
      slotContent3.innerHTML = '<b>🚋 /panda/photo.jpg</b><br><small>網頁路徑車尾</small>';
      pop(slot3);
    }

    updateAddressBar();

    // Check completion
    if (attachedCount === 3) {
      safeLater(api, () => {
        waitingSignEl.style.display = 'none';
        pandaPageEl.style.display = 'flex';
        pop(pandaPageEl);
        setStatus('🎉 鳴——！🚂💨💨 火車全速進站！完整網址拼裝完成，成功開啟動物園熊貓照片！', 'good');
        safeGood(api);
        safeDone(api);
      }, 500);
    }
  };

  resetBtn.addEventListener('click', () => {
    attachedCount = 0;
    attachedIds.clear();

    slot1.classList.remove('filled');
    slotContent1.textContent = '等待火車頭...';
    slot2.classList.remove('filled');
    slotContent2.textContent = '等待車身...';
    slot3.classList.remove('filled');
    slotContent3.textContent = '等待車尾...';

    waitingSignEl.style.display = 'flex';
    pandaPageEl.style.display = 'none';
    updateAddressBar();

    renderDock();
    setStatus('請點選第 1 節「協定車頭 https://」掛上鐵軌！');
  });

  // Initial
  renderDock();
}

// ==========================================================================
// 4. tlshandshake: 【數位印章與金鑰拼合】(TLS Handshake)
// ==========================================================================

export function tlshandshake(host, _params, api) {
  const STEPS = [
    { num: 1, title: '1. 敲門問好', desc: 'Client Hello' },
    { num: 2, title: '2. 驗證印章', desc: '憑證驗證' },
    { num: 3, title: '3. 拼合金鑰', desc: '建立對稱金鑰' },
    { num: 4, title: '4. 悄悄話開講', desc: '安全加密傳輸' },
  ];

  host.innerHTML = `
    <div class="b2-panel b2-tlshandshake">
      <div class="gemini-tag" data-created-by="gemini" data-info="TLS 握手與金鑰拼合（打招呼、數位憑證、會話金鑰、加密通道）">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b2-info-banner">
        <span class="b2-info-icon">💡</span>
        <span class="b2-info-text">在傳送秘密資料前，平板與伺服器會先「握手」：核對官方印章身分證、合成一把專用金鑰，啟動防偷看通道！</span>
      </div>

      <div class="b2-header">
        <div class="b2-title-row">
          <span class="b2-title">🔐 TLS：先握手，再說悄悄話</span>
        </div>
      </div>

      <!-- Steps Indicator -->
      <div class="b2-tls-steps">
        ${STEPS.map(s => `
          <div class="b2-tls-step-pill ${s.num === 1 ? 'active' : ''}" data-step="${s.num}">
            <span>${s.title}</span>
          </div>
        `).join('')}
      </div>

      <!-- Stage -->
      <div class="b2-tls-stage">
        <!-- Left: Tablet Client -->
        <div class="b2-tls-node">
          <span class="b2-tls-node-icon">📱</span>
          <span class="b2-tls-node-name">我的平板電腦</span>
          <span class="b2-tls-node-badge" id="b2TlsClientBadge">準備連線</span>
        </div>

        <!-- Center: Cable / Shield Tunnel -->
        <div class="b2-tls-wire-zone">
          <div class="b2-tls-cable" id="b2TlsCable"></div>

          <!-- Dynamic Wire Content -->
          <div id="b2TlsWireContent">
            <span style="font-size: max(15px, 0.8rem); color: #868e96; font-weight: 700;">連線待命中</span>
          </div>
        </div>

        <!-- Right: School Server -->
        <div class="b2-tls-node">
          <span class="b2-tls-node-icon">🏫</span>
          <span class="b2-tls-node-name">學校官方伺服器</span>
          <span class="b2-tls-node-badge" id="b2TlsServerBadge">school.edu.tw</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="b2-tls-actions">
        <button class="b2-btn b2-btn-primary" id="b2TlsBtn1">
          <span>🙋 1. 敲門打招呼 (Client Hello)</span>
        </button>
        <button class="b2-btn b2-btn-action" id="b2TlsBtn2" disabled>
          <span>🔍 2. 拿放大鏡檢驗數位印章</span>
        </button>
        <button class="b2-btn b2-btn-action" id="b2TlsBtn3" disabled>
          <span>🧩 3. 拼合專用通訊金鑰</span>
        </button>
        <button class="b2-btn b2-btn-save" id="b2TlsBtn4" disabled>
          <span>💬 4. 傳送加密悄悄話</span>
        </button>
        <button class="b2-btn b2-btn-reset" id="b2TlsBtnReset">
          <span>🔄 再試一次</span>
        </button>
      </div>

      <div class="b2-status" id="b2TlsStatus" role="status" aria-live="polite">
        請點選「1. 敲門打招呼」，讓平板向學校伺服器發送連線請求！
      </div>
    </div>
  `;

  // Selectors
  const statusEl = host.querySelector('#b2TlsStatus');
  const wireContentEl = host.querySelector('#b2TlsWireContent');
  const cableEl = host.querySelector('#b2TlsCable');
  const clientBadge = host.querySelector('#b2TlsClientBadge');
  const serverBadge = host.querySelector('#b2TlsServerBadge');
  const stepPills = host.querySelectorAll('.b2-tls-step-pill');

  const btn1 = host.querySelector('#b2TlsBtn1');
  const btn2 = host.querySelector('#b2TlsBtn2');
  const btn3 = host.querySelector('#b2TlsBtn3');
  const btn4 = host.querySelector('#b2TlsBtn4');
  const btnReset = host.querySelector('#b2TlsBtnReset');

  let currentStep = 1;

  const setStatus = (msg, type = '') => {
    statusEl.textContent = msg;
    statusEl.className = 'b2-status ' + type;
    pop(statusEl);
  };

  const setStep = n => {
    currentStep = n;
    stepPills.forEach(p => {
      const stepNum = Number(p.dataset.step);
      p.classList.toggle('active', stepNum === n);
      p.classList.toggle('done', stepNum < n);
    });
  };

  // Step 1: Client Hello
  btn1.addEventListener('click', () => {
    if (currentStep !== 1) return;
    btn1.disabled = true;

    wireContentEl.innerHTML = `
      <div class="b2-tls-packet">
        <span>👋 哈囉！我想安全連線！</span>
      </div>
    `;
    clientBadge.textContent = '發送問候 ➔';

    safeLater(api, () => {
      wireContentEl.innerHTML = `
        <div class="b2-tls-cert-card">
          <span class="b2-tls-cert-stamp" id="b2TlsCertStamp">🏛️ 📜</span>
          <span class="b2-tls-cert-title">學校數位身分證（憑證）</span>
          <span class="b2-tls-cert-desc">包含教育部官方認證數位公章</span>
        </div>
      `;
      serverBadge.textContent = '出示數位憑證';
      setStep(2);
      btn2.disabled = false;
      setStatus('平板向伺服器打招呼！伺服器回傳官方身分證（數位憑證）！', 'good');
      safeGood(api);
    }, 600);
  });

  // Step 2: Verify Certificate Seal
  btn2.addEventListener('click', () => {
    if (currentStep !== 2) return;
    btn2.disabled = true;

    const stamp = host.querySelector('#b2TlsCertStamp');
    if (stamp) stamp.classList.add('verified');

    safeLater(api, () => {
      wireContentEl.innerHTML = `
        <div class="b2-tls-cert-card" style="border-color: #51cf66; background: #ebfbee;">
          <span style="font-size: 2rem;">✨ 🏛️ ✅</span>
          <span class="b2-tls-cert-title" style="color: #2b8a3e;">檢驗通過！100% 正版學校</span>
          <span class="b2-tls-cert-desc" style="color: #2b8a3e;">印章真實有效，不是冒牌釣魚網站！</span>
        </div>
      `;
      clientBadge.textContent = '身分已確認';
      setStep(3);
      btn3.disabled = false;
      setStatus('✨ 驗證通過！這是真正的學校官方網站，不是冒牌者！', 'good');
      safeGood(api);
    }, 500);
  });

  // Step 3: Key Agreement (Puzzle pieces)
  btn3.addEventListener('click', () => {
    if (currentStep !== 3) return;
    btn3.disabled = true;

    wireContentEl.innerHTML = `
      <div class="b2-tls-puzzle-dock" id="b2TlsPuzzleDock">
        <div class="b2-tls-key-half" id="b2TlsKeyLeft">🧩 鑰匙前半段 (平板)</div>
        <div class="b2-tls-key-half" id="b2TlsKeyRight">🗝️ 鑰匙後半段 (伺服器)</div>
      </div>
    `;

    safeLater(api, () => {
      const dock = host.querySelector('#b2TlsPuzzleDock');
      if (dock) dock.classList.add('joined');

      safeLater(api, () => {
        wireContentEl.innerHTML = `
          <div class="b2-tls-puzzle-dock joined">
            <div class="b2-tls-key-half" style="font-size: 0.95rem; padding: 10px 16px;">
              <span>🌟 喀嚓！合成專屬通訊金鑰 🔑</span>
            </div>
          </div>
        `;
        clientBadge.textContent = '金鑰已約定 🔑';
        serverBadge.textContent = '金鑰已約定 🔑';
        setStep(4);
        btn4.disabled = false;
        setStatus('喀嚓！雙方約好合成為專用通訊金鑰！只有我們兩個知道！', 'good');
        safeGood(api);
      }, 500);
    }, 300);
  });

  // Step 4: Encrypted Channel
  btn4.addEventListener('click', () => {
    if (currentStep !== 4) return;
    btn4.disabled = true;

    cableEl.classList.add('shielded');

    wireContentEl.innerHTML = `
      <div class="b2-tls-cipher-msg">
        <span>🛡️ [密文：%#@*&^]</span>
        <small style="color: #adb5bd;">（偷看者只看得到亂碼）</small>
      </div>
    `;

    safeLater(api, () => {
      wireContentEl.innerHTML = `
        <div class="b2-tls-cipher-msg decrypted">
          <span>🎉 解密成功：期末考全部優等 100 分！</span>
        </div>
      `;
      pop(wireContentEl);
      clientBadge.textContent = '🔒 安全通道保護中';
      serverBadge.textContent = '🔒 安全通道保護中';
      stepPills.forEach(p => p.classList.add('done'));

      setStatus('太棒了！在 TLS 綠色盾牌保護下，駭客在中間只能看見一堆亂碼，悄悄話安全抵達！', 'good');
      safeGood(api);
      safeDone(api);
    }, 700);
  });

  // Reset
  btnReset.addEventListener('click', () => {
    setStep(1);
    cableEl.classList.remove('shielded');
    clientBadge.textContent = '準備連線';
    serverBadge.textContent = 'school.edu.tw';
    wireContentEl.innerHTML = '<span style="font-size: max(15px, 0.8rem); color: #868e96; font-weight: 700;">連線待命中</span>';

    btn1.disabled = false;
    btn2.disabled = true;
    btn3.disabled = true;
    btn4.disabled = true;

    setStatus('請點選「1. 敲門打招呼」，讓平板向學校伺服器發送連線請求！');
  });
}
