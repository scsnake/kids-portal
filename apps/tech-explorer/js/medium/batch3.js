// widgets-batch3.js - Batch 3 Interactive Widgets for Tech-Explorer
// Medium-Priority Redesigns:
// 1. assetdefense   - 【金庫資產防禦戰】(attackers [Slide 1] 駭客想要什麼？)
// 2. hashblender    - 【神奇單向果汁機】(passwordattacks [Slide 3] 網站不該存原密碼)
// 3. mitmforcefield - 【中途攔截者與防護力場】(networkattacks [Slide 0] 有人站在網路中間)
// 4. cookiebackpack - 【Cookie 標籤小背包】(freeapps [Slide 1] 廣告怎麼跟著你？)
// 5. autoplaytug    - 【自動播放拔河戰】(recommend [Slide 2] 停不下來？)
// 6. globetime      - 【旋轉地球儀與晨昏線】(clock [Slide 2] 時區)

export const safeLater = (api, fn, ms) => {
  if (api && typeof api.later === 'function') {
    return api.later(fn, ms);
  }
  return setTimeout(fn, ms);
};

const isAlive = (api) => {
  if (!api || typeof api.alive !== 'function') return true;
  return api.alive();
};

const doShake = (el) => {
  if (!el) return;
  el.classList.remove('wb3-shake');
  void el.offsetWidth;
  el.classList.add('wb3-shake');
};

const doPop = (el) => {
  if (!el) return;
  el.classList.remove('wb3-pop');
  void el.offsetWidth;
  el.classList.add('wb3-pop');
};

const escapeHTML = (val) => String(val).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '(': '&#40;', ')': '&#41;', "'": '&#39;', '"': '&quot;',
})[char]);

// ============================================================================
// 1. assetdefense - 【金庫資產防禦戰】
// ============================================================================
export function assetdefense(host, _params, api) {
  const assetsData = [
    {
      id: 'game',
      name: '遊戲帳號',
      icon: '🎮',
      desc: '滿等角色與珍貴寶物裝備',
      threat: '駭客想偷寶物裝備轉賣！',
      targetShield: '2fa',
      hint: '雙重驗證 (2FA) 適合保護遊戲帳號登入喔！',
      success: '雙重驗證 (2FA) 啟動！就算密碼被猜中，沒有手機二次確認也進不來！',
    },
    {
      id: 'money',
      name: '零用錢錢包',
      icon: '💳',
      desc: '真實儲值金額與付款點數',
      threat: '駭客想盜刷扣款花光點數！',
      targetShield: 'parent',
      hint: '密碼與大人確認適合保護零用錢扣款喔！',
      success: '密碼與大人確認啟動！付款前必須由家長輸入密碼或指紋，零用錢安全鎖緊！',
    },
    {
      id: 'photo',
      name: '家庭生活與搞怪照',
      icon: '📸',
      desc: '和好朋友扮鬼臉合照與生活日記',
      threat: '壞人想偷看照片拿去嘲弄你，或冒充家人騙人！',
      targetShield: 'privacy',
      hint: '隱私設定不公開適合保護生活合照喔！',
      success: '隱私設定不公開啟動！權限設為僅限親友，陌生人與壞人在網路上完全看不到！',
    },
    {
      id: 'pc',
      name: '家中電腦',
      icon: '💻',
      desc: '連上家用網路的個人電腦',
      threat: '駭客想植入木馬控制成殭屍電腦！',
      targetShield: 'update',
      hint: '系統更新修補弱點適合保護電腦系統喔！',
      success: '系統更新修補弱點啟動！隨時修補漏洞補死後門，駭客病毒無法遠端操縱！',
    },
  ];

  const shieldsData = [
    { id: '2fa', icon: '🛡️', name: '雙重驗證 (2FA)', clue: '登入時手機再確認一次' },
    { id: 'parent', icon: '🔒', name: '密碼與大人確認', clue: '付款需要家長指紋或密碼' },
    { id: 'privacy', icon: '👁️', name: '隱私設定不公開', clue: '設為只限家人，搜尋不到' },
    { id: 'update', icon: '🔄', name: '系統更新修補弱點', clue: '修補漏洞，防被當殭屍遙控' },
  ];

  let defendedCount = 0;
  const defendedAssets = {};
  const usedShields = {};
  let selectedShieldId = null;

  host.innerHTML = `
    <div class="wb3-panel wb3-asset">
      <div class="gemini-tag" data-created-by="gemini" data-info="金庫資產防禦戰 · 認識駭客覬覦的數位資產與防禦護盾"><span class="gemini-spark">✨</span> Gemini 互動設計</div>
      <div class="wb3-header">
        <span class="wb3-title">🛡️ 金庫資產防禦戰</span>
        <span class="wb3-badge">已防禦 <span id="assetDefCount">0</span> / 4</span>
      </div>
      <div class="wb3-tip-badge">💡 任務：幫 4 個數位金庫配對正確的防禦護盾，擋住狡猾狐狸駭客的突襲！</div>

      <!-- 4 Target Asset Chests -->
      <div class="wb3-asset-grid" id="assetGrid">
        ${assetsData.map(a => `
          <div class="wb3-chest-card" id="chest-${a.id}" data-id="${a.id}">
            <div class="wb3-chest-top">
              <span class="wb3-chest-icon">${a.icon}</span>
              <div class="wb3-chest-info">
                <div class="wb3-chest-name">${a.name}</div>
                <div class="wb3-chest-threat">${a.threat}</div>
              </div>
            </div>
            <div class="wb3-shield-slot" id="slot-${a.id}">
              <span>🛡️ 點選或拖曳護盾至此安裝</span>
            </div>
            <div class="wb3-fox-bubble" id="fox-${a.id}">🦊 狐狸駭客突襲中...</div>
          </div>
        `).join('')}
      </div>

      <!-- Defensive Shields Tray -->
      <div class="wb3-shields-tray">
        <div class="wb3-tray-label">
          <span>📦 防禦護盾工具箱（點擊選取或直接拖曳至上方金庫）：</span>
        </div>
        <div class="wb3-shields-grid" id="shieldsGrid">
          ${shieldsData.map(s => `
            <div class="wb3-shield-item" id="shield-${s.id}" data-id="${s.id}" draggable="true">
              <span style="font-size:1.4rem;">${s.icon}</span>
              <div>
                <div>${s.name}</div>
                <div style="font-size: max(15px, 0.76rem); color:#868e96; font-weight:600;">${s.clue}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="wb3-status" id="assetStatus" aria-live="polite">
        請選取下方的防禦護盾，為對應的金庫安裝最強防禦！
      </div>

      <div id="assetActions" style="text-align:center; margin-top:12px; display:none;">
        <button class="wb3-btn wb3-btn-warn" id="btnAssetReset">🔄 再玩一次</button>
      </div>
    </div>
  `;

  const statusEl = host.querySelector('#assetStatus');
  const countEl = host.querySelector('#assetDefCount');
  const actionsEl = host.querySelector('#assetActions');
  const resetBtn = host.querySelector('#btnAssetReset');

  const updateSelectionUI = () => {
    shieldsData.forEach(s => {
      const el = host.querySelector(`#shield-${s.id}`);
      if (!el) return;
      if (usedShields[s.id]) {
        el.classList.add('used');
        el.classList.remove('selected');
        el.setAttribute('draggable', 'false');
      } else if (selectedShieldId === s.id) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
  };

  const tryMatch = (chestId, shieldId) => {
    const asset = assetsData.find(a => a.id === chestId);
    const shield = shieldsData.find(s => s.id === shieldId);
    if (!asset || !shield || defendedAssets[asset.id]) return;

    const chestCard = host.querySelector(`#chest-${chestId}`);
    const slotEl = host.querySelector(`#slot-${chestId}`);
    const foxBubble = host.querySelector(`#fox-${chestId}`);

    if (asset.targetShield === shieldId) {
      // Correct Match
      defendedAssets[asset.id] = true;
      usedShields[shield.id] = true;
      defendedCount++;
      countEl.textContent = String(defendedCount);
      chestCard.classList.add('defended', 'show-fox');
      slotEl.innerHTML = `<span>${shield.icon} 已啟動：${shield.name}</span>`;
      foxBubble.textContent = '🦊⚡ 哎呀！被防護罩彈開了！偷不到！😵';
      doPop(chestCard);
      api.good();

      statusEl.className = 'wb3-status good';
      statusEl.textContent = `✅ 防禦成功！${asset.success}`;

      selectedShieldId = null;
      updateSelectionUI();

      safeLater(api, () => {
        if (!isAlive(api)) return;
        chestCard.classList.remove('show-fox');
      }, 2200);

      if (defendedCount === assetsData.length) {
        safeLater(api, () => {
          if (!isAlive(api)) return;
          statusEl.className = 'wb3-status good';
          statusEl.textContent = '🎉 太厲害了！你幫全部 4 項數位資產都裝上了最強防禦！狡猾的狐狸駭客只能空手而歸！';
          host.querySelector('.wb3-shields-tray').hidden = true;
          host.querySelectorAll('.wb3-chest-card').forEach(card => card.classList.remove('show-fox'));
          actionsEl.style.display = 'block';
          api.done();
        }, 800);
      }
    } else {
      // Mismatch
      chestCard.classList.add('show-fox');
      foxBubble.textContent = '🦊 哈哈！這個護盾保護不了這裡喔！';
      doShake(chestCard);
      api.bad();

      statusEl.className = 'wb3-status bad';
      statusEl.textContent = `❌ 配對不正確！${shield.name} 不太適合用在 ${asset.name}。${shield.clue}，換個金庫試試看！`;

      selectedShieldId = null;
      updateSelectionUI();

      safeLater(api, () => {
        if (!isAlive(api)) return;
        chestCard.classList.remove('show-fox');
      }, 1800);
    }
  };

  // Event Listeners for Shields
  shieldsData.forEach(s => {
    const el = host.querySelector(`#shield-${s.id}`);
    if (!el) return;

    el.addEventListener('click', () => {
      if (usedShields[s.id]) return;
      selectedShieldId = s.id;
      statusEl.className = 'wb3-status';
      statusEl.textContent = `已選取「${s.name}」，請點擊要保護的金庫安裝！`;
      updateSelectionUI();
    });

    el.addEventListener('dragstart', (e) => {
      if (usedShields[s.id]) {
        e.preventDefault();
        return;
      }
      selectedShieldId = s.id;
      updateSelectionUI();
      e.dataTransfer.setData('text/plain', s.id);
    });
  });

  // Event Listeners for Chests
  assetsData.forEach(a => {
    const card = host.querySelector(`#chest-${a.id}`);
    if (!card) return;

    card.addEventListener('click', () => {
      if (defendedAssets[a.id]) {
        statusEl.className = 'wb3-status good';
        statusEl.textContent = `這座「${a.name}」已經安裝好安全防禦囉！`;
        return;
      }
      if (!selectedShieldId) {
        statusEl.className = 'wb3-status';
        statusEl.textContent = `請先在下方工具箱點選一個護盾，再來保護「${a.name}」！`;
        return;
      }
      tryMatch(a.id, selectedShieldId);
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!defendedAssets[a.id]) {
        card.classList.add('drag-over');
      }
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      const shieldId = e.dataTransfer.getData('text/plain') || selectedShieldId;
      if (shieldId) {
        tryMatch(a.id, shieldId);
      }
    });
  });

  resetBtn?.addEventListener('click', () => {
    assetdefense(host, _params, api);
  });
}

// ============================================================================
// 2. hashblender - 【神奇單向果汁機】
// ============================================================================
export function mitmforcefield(host, _params, api) {
  let currentMode = 'http'; // 'http' or 'https'
  let testedHttp = false;
  let testedHttps = false;
  let isTransmitting = false;

  host.innerHTML = `
    <div class="wb3-panel wb3-mitm">
      <div class="gemini-tag" data-created-by="gemini" data-info="中途攔截者與防護力場 · 體驗 HTTP 與 HTTPS 的差異"><span class="gemini-spark">✨</span> Gemini 互動設計</div>
      <div class="wb3-header">
        <span class="wb3-title">🛡️ 中途攔截者與防護力場</span>
        <span class="wb3-badge">網路中間人攻擊 (MitM)</span>
      </div>
      <div class="wb3-tip-badge">💡 學習重點：比較「未加密 HTTP」與「HTTPS 加密安全通道」，看看狐狸中間人能做什麼！</div>

      <!-- Mode Selector -->
      <div class="wb3-mitm-modes">
        <button class="wb3-mode-tab active-http" id="tabHttp">
          <span>🔓 模式一：未加密 HTTP（透明明信片）</span>
        </button>
        <button class="wb3-mode-tab" id="tabHttps">
          <span>🔒 模式二：HTTPS 加密安全通道（安全連線）</span>
        </button>
      </div>

      <!-- Transmission Pipeline Scene -->
      <div class="wb3-mitm-stage" id="mitmStage">
        <!-- Client: Tablet -->
        <div class="wb3-mitm-node">
          <div class="wb3-node-icon" id="nodeTablet">📱</div>
          <div class="wb3-node-name">小安的平板</div>
          <div style="font-size: max(15px, 0.75rem); color:#868e96;" id="tabletResult">準備點餐</div>
        </div>

        <!-- Wire / Forcefield Cable -->
        <div class="wb3-mitm-wire" id="mitmWire"></div>

        <!-- Middle: Fox Interceptor -->
        <div class="wb3-middle-fox" id="middleFox">
          <div class="wb3-fox-avatar" id="foxAvatar">🦊✏️</div>
          <div class="wb3-fox-bubble-box" id="foxBubble">守在網路中間偷聽</div>
        </div>

        <!-- Server: Ice Cream Shop -->
        <div class="wb3-mitm-node">
          <div class="wb3-node-icon" id="nodeServer">🍦</div>
          <div class="wb3-node-name">冰淇淋店伺服器</div>
          <div style="font-size: max(15px, 0.75rem); color:#868e96;" id="serverResult">等待訂單</div>
        </div>

        <!-- Flying Packet -->
        <div class="wb3-packet" id="flyingPacket">我要買冰淇淋 🍦</div>
      </div>

      <!-- Action Button -->
      <div style="text-align:center; margin-top:16px;">
        <button class="wb3-btn wb3-btn-primary" id="btnSendPacket" style="min-width:280px; font-size:1.02rem;">
          🚀 發送點餐訊息：「我要買草莓冰淇淋 🍦」
        </button>
      </div>

      <div class="wb3-status" id="mitmStatus" aria-live="polite">
        目前為【未加密 HTTP】模式。請點擊上方按鈕發送點餐封包！
      </div>
    </div>
  `;

  const tabHttp = host.querySelector('#tabHttp');
  const tabHttps = host.querySelector('#tabHttps');
  const mitmWire = host.querySelector('#mitmWire');
  const foxAvatar = host.querySelector('#foxAvatar');
  const foxBubble = host.querySelector('#foxBubble');
  const middleFox = host.querySelector('#middleFox');
  const tabletResult = host.querySelector('#tabletResult');
  const serverResult = host.querySelector('#serverResult');
  const flyingPacket = host.querySelector('#flyingPacket');
  const btnSend = host.querySelector('#btnSendPacket');
  const statusEl = host.querySelector('#mitmStatus');

  const setMode = (mode) => {
    if (isTransmitting) return;
    currentMode = mode;
    tabHttp.className = `wb3-mode-tab ${mode === 'http' ? 'active-http' : ''}`;
    tabHttps.className = `wb3-mode-tab ${mode === 'https' ? 'active-https' : ''}`;

    if (mode === 'http') {
      mitmWire.classList.remove('shielded');
      foxAvatar.textContent = '🦊✏️';
      foxBubble.textContent = '未加密！隨時準備偷看篡改！';
      statusEl.className = 'wb3-status';
      statusEl.textContent = '已切換為【未加密 HTTP】模式。資料如同透明明信片，傳輸毫無防護！';
    } else {
      mitmWire.classList.add('shielded');
      foxAvatar.textContent = '🦊👀';
      foxBubble.textContent = '哇！加密通道密不透風，碰不到也看不懂！';
      statusEl.className = 'wb3-status';
      statusEl.textContent = '已啟動【HTTPS 加密安全通道】！資料將被端對端高強度加密保護！';
    }
    tabletResult.textContent = '準備點餐';
    serverResult.textContent = '等待訂單';
  };

  tabHttp.addEventListener('click', () => setMode('http'));
  tabHttps.addEventListener('click', () => setMode('https'));

  btnSend.addEventListener('click', () => {
    if (isTransmitting) return;
    isTransmitting = true;
    btnSend.disabled = true;
    tabHttp.disabled = true;
    tabHttps.disabled = true;

    tabletResult.textContent = '發送中...';
    serverResult.textContent = '連線中...';

    flyingPacket.style.display = 'block';
    flyingPacket.style.left = '75px';
    flyingPacket.style.transition = 'none';

    if (currentMode === 'http') {
      // HTTP MODE: Intercepted and tampered
      flyingPacket.className = 'wb3-packet http';
      flyingPacket.textContent = '我要買草莓冰淇淋 🍦';
      statusEl.className = 'wb3-status';
      statusEl.textContent = '📡 點餐封包正從平板飛出，沿著網路線前進...';

      // Move to Fox
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.transition = 'left 0.7s linear';
        flyingPacket.style.left = 'calc(50% - 60px)';
      }, 50);

      // Fox snatches and alters
      safeLater(api, () => {
        if (!isAlive(api)) return;
        doShake(middleFox);
        foxAvatar.textContent = '🦊✏️💥';
        foxBubble.textContent = '哈哈！擦掉冰淇淋，改成辣椒醬！';
        flyingPacket.textContent = '我要買特辣辣椒醬 🌶️';
        doPop(flyingPacket);
      }, 850);

      // Move from Fox to Server
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.transition = 'left 0.7s linear';
        flyingPacket.style.left = 'calc(100% - 150px)';
      }, 1600);

      // Server receives altered request
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.display = 'none';
        serverResult.textContent = '確認：特辣辣椒醬 🌶️';
        tabletResult.textContent = '收到辣椒醬 😱';
        doShake(host.querySelector('#nodeTablet'));
        api.bad();
        testedHttp = true;

        statusEl.className = 'wb3-status bad';
        statusEl.textContent = '❌ 糟糕！送來的是特辣辣椒醬 🌶️！HTTP 訊息在半路被狐狸中間人偷看並惡意修改了！請切換到【HTTPS 加密安全通道】試試看！';

        isTransmitting = false;
        btnSend.disabled = false;
        tabHttp.disabled = false;
        tabHttps.disabled = false;

        if (testedHttp && testedHttps) {
          api.done();
        }
      }, 2400);
    } else {
      // HTTPS MODE: Shielded, Fox shocked, safe arrival
      flyingPacket.className = 'wb3-packet https';
      flyingPacket.textContent = '🔒 [AES 加密亂碼: @8#x9!&k]';
      statusEl.className = 'wb3-status';
      statusEl.textContent = '🛡️ 加密封包進入 HTTPS 安全加密通道，受到全程加密保護...';

      // Move toward Fox
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.transition = 'left 0.8s linear';
        flyingPacket.style.left = 'calc(50% - 70px)';
      }, 50);

      // Fox tries to touch and gets shocked!
      safeLater(api, () => {
        if (!isAlive(api)) return;
        doShake(middleFox);
        foxAvatar.textContent = '⚡🦊⚡';
        foxBubble.textContent = '哎唷好麻！被防護罩電到了！碰不到！😵';
      }, 850);

      // Move past Fox to Server
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.transition = 'left 0.8s linear';
        flyingPacket.style.left = 'calc(100% - 160px)';
      }, 1400);

      // Server unlocks safely
      safeLater(api, () => {
        if (!isAlive(api)) return;
        flyingPacket.style.display = 'none';
        serverResult.textContent = '解密：草莓冰淇淋 🍦';
        tabletResult.textContent = '順利吃到冰淇淋 🍦😋';
        doPop(host.querySelector('#nodeTablet'));
        api.good();
        testedHttps = true;

        statusEl.className = 'wb3-status good';
        statusEl.textContent = '🎉 太棒了！HTTPS 加密防護罩讓中間人碰不到也看不懂，草莓冰淇淋 🍦 原封不動安全送到！';

        isTransmitting = false;
        btnSend.disabled = false;
        tabHttp.disabled = false;
        tabHttps.disabled = false;

        if (testedHttp && testedHttps) {
          api.done();
        }
      }, 2300);
    }
  });
}

// ============================================================================
// 4. cookiebackpack - 【Cookie 標籤小背包】
// ============================================================================
export function cookiebackpack(host, _params, api) {
  let currentStep = 1; // 1: Shoes Store, 2: News Site, 3: Clear
  let hasShoeCookie = false;
  let seenTargetedAd = false;
  let hasClearedCookie = false;

  host.innerHTML = `
    <div class="wb3-panel wb3-cookie">
      <div class="gemini-tag" data-created-by="gemini" data-info="Cookie 標籤小背包 · 揭開跨網站廣告追蹤的秘密"><span class="gemini-spark">✨</span> Gemini 互動設計</div>
      <div class="wb3-header">
        <span class="wb3-title">🎒 Cookie 標籤小背包</span>
        <span class="wb3-badge">跨網站廣告追蹤</span>
      </div>
      <div class="wb3-tip-badge">💡 學習重點：親身體驗瀏覽器 Cookie 如何記錄偏好，以及如何清除 Cookie 停止追蹤！</div>

      <!-- Kid Browser HUD -->
      <div class="wb3-cookie-hud">
        <div class="wb3-hud-kid">
          <span class="wb3-hud-avatar">🎒🧒</span>
          <div>
            <div class="wb3-hud-title">小安的瀏覽器 Cookie 小背包</div>
            <div style="font-size: max(15px, 0.78rem); color:#868e96;">用來存放造訪過的網站給予的小紀錄</div>
          </div>
        </div>
        <div class="wb3-backpack-slots" id="backpackSlots">
          <span class="wb3-cookie-empty" id="emptyCookieNote">（背包空空如也，沒有追蹤標籤）</span>
        </div>
      </div>

      <!-- Steps Navigation Tabs -->
      <div class="wb3-cookie-steps">
        <button class="wb3-step-tab active" id="tabStep1">
          <span>1. 👟 逛球鞋特賣店</span>
        </button>
        <button class="wb3-step-tab" id="tabStep2">
          <span>2. 📰 兒童科學新聞台</span>
        </button>
        <button class="wb3-step-tab" id="tabStep3">
          <span>3. 🧹 清除 Cookie</span>
        </button>
      </div>

      <!-- Dynamic Stage Container -->
      <div class="wb3-cookie-stage" id="cookieStage"></div>

      <div class="wb3-status" id="cookieStatus" aria-live="polite">
        請點擊「逛球鞋特賣店」，看看瀏覽器背包會發生什麼事！
      </div>
    </div>
  `;

  const stage = host.querySelector('#cookieStage');
  const statusEl = host.querySelector('#cookieStatus');
  const backpackSlots = host.querySelector('#backpackSlots');
  const tabStep1 = host.querySelector('#tabStep1');
  const tabStep2 = host.querySelector('#tabStep2');
  const tabStep3 = host.querySelector('#tabStep3');

  const updateBackpackUI = () => {
    if (hasShoeCookie) {
      backpackSlots.innerHTML = `
        <span class="wb3-cookie-tag" id="shoeTag">
          👟 慢跑鞋偏好標籤 (Cookie)
        </span>
      `;
    } else {
      backpackSlots.innerHTML = `
        <span class="wb3-cookie-empty">（背包空空如也，沒有追蹤標籤）</span>
      `;
    }
  };

  const renderStep = (step) => {
    currentStep = step;
    tabStep1.className = `wb3-step-tab ${step === 1 ? 'active' : ''}`;
    tabStep2.className = `wb3-step-tab ${step === 2 ? 'active' : ''}`;
    tabStep3.className = `wb3-step-tab ${step === 3 ? 'active' : ''}`;

    if (step === 1) {
      // Scene 1: Shoes Store
      stage.innerHTML = `
        <div class="wb3-store-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:1.05rem; color:#d9480f;">🏬 炫彩運動鞋特賣旗艦店</b>
            <span style="font-size: max(15px, 0.8rem); background:#fff3bf; color:#d9480f; padding:2px 8px; border-radius:6px; font-weight:700;">購物網站</span>
          </div>
          <div class="wb3-store-item">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:2.5rem;">👟</span>
              <div>
                <b style="font-size:1rem;">超輕量疾速慢跑鞋</b>
                <div style="font-size: max(15px, 0.82rem); color:#868e96;">透氣避震、最新潮流配色</div>
              </div>
            </div>
            <button class="wb3-btn wb3-btn-primary" id="btnInspectShoes">
              👟 逛球鞋並點擊查看
            </button>
          </div>
          <div style="font-size: max(15px, 0.85rem); color:#495057; line-height:1.4;">
            你在購物網站瀏覽了一雙慢跑鞋。網站會想辦法記住你的喜好喔！
          </div>
        </div>
      `;

      host.querySelector('#btnInspectShoes')?.addEventListener('click', () => {
        hasShoeCookie = true;
        updateBackpackUI();
        api.good();
        doPop(host.querySelector('#backpackSlots'));

        statusEl.className = 'wb3-status good';
        statusEl.textContent = '📌 球鞋商店悄悄在你的背包放了一張 Cookie 標籤：『小安喜歡慢跑鞋』！請點擊上方「2. 兒童科學新聞台」！';
      });
    } else if (step === 2) {
      // Scene 2: News Site with Ad Billboard
      stage.innerHTML = `
        <div class="wb3-news-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-size:1.05rem; color:#1864ab;">📰 兒童科學新聞日報</b>
            <span style="font-size: max(15px, 0.8rem); background:#e7f5ff; color:#1971c2; padding:2px 8px; border-radius:6px; font-weight:700;">新聞網站</span>
          </div>
          <div style="background:#f8f9fa; padding:12px; border-radius:12px; border-left:4px solid #339af0;">
            <div style="font-size:1rem; font-weight:800; color:#1d2738;">🦖 暴龍最新完整化石在恐龍谷出土！</div>
            <div style="font-size: max(15px, 0.84rem); color:#495057; margin-top:4px;">
              古生物學家今天宣布發現了白堊紀晚期保存最完整的暴龍骨骼，頭部保存完好...
            </div>
          </div>

          <!-- Dynamic Advertising Billboard -->
          <div class="wb3-ad-billboard ${hasShoeCookie ? 'wb3-billboard-tracked' : ''}" id="adBillboard">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:2.2rem;">${hasShoeCookie ? '👟' : '⛅'}</span>
              <div>
                <div style="font-size: max(15px, 0.75rem); color:#868e96; font-weight:800;">📢 贊助商廣告（廣告聯播網）</div>
                <div style="font-size:0.95rem; font-weight:800; color:${hasShoeCookie ? '#c92a2a' : '#2b8a3e'};">
                  ${hasShoeCookie ? '🔥 剛剛看的慢跑鞋 8 折限時特賣！免運送到家！' : '⛅ 今日天氣晴朗舒適，適合戶外運動！'}
                </div>
              </div>
            </div>
            <div style="font-size: max(15px, 0.8rem); font-weight:750; color:#495057;">
              📡 廣告雷達掃描背包
            </div>
          </div>
        </div>
      `;

      if (hasShoeCookie) {
        seenTargetedAd = true;
        api.good();
        statusEl.className = 'wb3-status bad';
        statusEl.textContent = '😮 奇怪？明明是在看恐龍新聞，看板怎麼知道我想買鞋？因為廣告聯播網讀取了你背包裡的 Cookie 標籤！這就叫「跨網站廣告追蹤」！';
      } else {
        statusEl.className = 'wb3-status good';
        statusEl.textContent = '😊 背包裡沒有 Cookie 追蹤標籤，廣告看板讀不到你的隱私，只能顯示普通的公共天氣廣告！';
      }
    } else if (step === 3) {
      // Scene 3: Clean Cookie
      stage.innerHTML = `
        <div style="text-align:center; padding:14px 8px;">
          <div style="font-size:3rem; margin-bottom:8px;">🧹✨</div>
          <div style="font-size:1.1rem; font-weight:800; margin-bottom:6px;">清理瀏覽器小背包</div>
          <p style="font-size: max(15px, 0.88rem); color:#495057; max-width:480px; margin:0 auto 16px;">
            當你不想被廣告商一直跟蹤時，可以在瀏覽器設定中按下「清除 Cookie」。
          </p>
          <button class="wb3-btn wb3-btn-warn" id="btnClearAction" style="font-size:1.02rem; padding:12px 24px;">
            🧹 按下清除所有 Cookie 標籤
          </button>
        </div>
      `;

      host.querySelector('#btnClearAction')?.addEventListener('click', () => {
        hasShoeCookie = false;
        hasClearedCookie = true;
        updateBackpackUI();
        api.good();
        doPop(host.querySelector('#backpackSlots'));

        statusEl.className = 'wb3-status good';
        statusEl.textContent = '✨ 成功！小背包裡的所有 Cookie 標籤都被掃乾淨了！現在點擊回「2. 兒童科學新聞台」看看廣告有什麼變化！';

        if (seenTargetedAd && hasClearedCookie) {
          safeLater(api, () => {
            if (!isAlive(api)) return;
            statusEl.textContent = '🎉 任務完成！你親身體驗了 Cookie 廣告追蹤的原理，也學會了如何清除 Cookie 保護隱私！';
            api.done();
          }, 1000);
        }
      });
    }
  };

  tabStep1.addEventListener('click', () => renderStep(1));
  tabStep2.addEventListener('click', () => renderStep(2));
  tabStep3.addEventListener('click', () => renderStep(3));

  // Initialize Step 1
  renderStep(1);
}

// ============================================================================
// 5. autoplaytug - 【自動播放拔河戰】
// ============================================================================
export function autoplaytug(host, _params, api) {
  let countdownSec = 4;
  let timerId = null;
  let isPaused = false;
  let batteryPct = 100;
  let currentEpIndex = 0;

  const EPISODES = [
    { ep: 5, title: '《可愛小貓玩毛線球 第 5 集》' },
    { ep: 6, title: '《搞笑柴犬溜滑梯 第 6 集》' },
    { ep: 7, title: '《超炫遙控飛機特技 第 7 集》' },
    { ep: 8, title: '《彩色骨牌推倒大骨牌 第 8 集》' },
    { ep: 9, title: '《恐龍公園大冒險 第 9 集》' },
  ];

  const HP_STATES = {
    100: { avatar: '😄', desc: '精神飽滿，元氣 100%！', tag: '活力滿點' },
    75: { avatar: '🥱', desc: '小安打了個大哈欠，眼睛開始乾澀...', tag: '有點想睡' },
    50: { avatar: '😵', desc: '小安雙眼發昏、腦袋昏昏沉沉...', tag: '專注力下滑' },
    25: { avatar: '🫠', desc: '小安身體無力癱軟，幾乎要睡著了...', tag: '極度疲倦' },
    0: { avatar: '😴', desc: '體力透支！小安完全斷電睡著了！', tag: '電量耗盡' },
  };

  host.innerHTML = `
    <div class="wb3-panel wb3-autoplay">
      <div class="gemini-tag" data-created-by="gemini" data-info="自動播放拔河戰 · 奪回看螢幕的主導權"><span class="gemini-spark">✨</span> Gemini 互動設計</div>
      <div class="wb3-header">
        <span class="wb3-title">⏸️ 自動播放拔河戰</span>
        <span class="wb3-badge" id="tugBadge">連續播放中</span>
      </div>
      <div class="wb3-tip-badge">💡 學習重點：認識影片 App 自動播放的心理陷阱，學習停下來喝水休息、自己做決定！</div>

      <!-- Mock Video Player Frame -->
      <div class="wb3-player-box">
        <div style="font-size: max(15px, 0.82rem); color:#868e96; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span id="currentVideoTitle">🎬 影片播畢：${EPISODES[0].title}</span>
          <span id="videoWatchTime">累計觀看：20 分鐘</span>
        </div>
        <div class="wb3-player-screen" id="playerScreen">
          <div class="wb3-countdown-ring" id="countdownBox">
            <span>⏱️</span>
            <span id="countdownDigit">4</span>
            <span style="font-size:1.1rem; color:#ced4da;">秒</span>
          </div>
          <div class="wb3-next-video" id="nextVideoTitle">
            ▶️ 下一部即將自動播放：${EPISODES[1].title}
          </div>
        </div>
      </div>

      <!-- Kid Energy Battery & Character Status -->
      <div class="wb3-battery-hud">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:2.2rem; transition: transform 0.3s;" id="characterAvatar">😄</span>
          <div>
            <div style="font-size: max(15px, 0.92rem); font-weight:800;">⚡ 小安的活力與專注力電池</div>
            <div style="font-size: max(15px, 0.78rem); color:#868e96;" id="characterStatus">精神飽滿，元氣 100%！</div>
          </div>
        </div>
        <div style="width:160px;">
          <div class="wb3-battery-bar">
            <div class="wb3-battery-fill" id="batteryFill" style="width:100%;"></div>
          </div>
          <div style="font-size: max(15px, 0.75rem); text-align:right; font-weight:800; color:#495057; margin-top:2px;" id="batteryText">100%</div>
        </div>
      </div>

      <!-- Tug Choice Buttons -->
      <div class="wb3-tug-actions">
        <button class="wb3-btn wb3-btn-success" id="btnPause" style="font-size:1.02rem; padding:12px 22px;">
          ⏸️ 暫停！喝水休息一下（我自己的決定）
        </button>
        <button class="wb3-btn" id="btnLetItGo" style="font-size: max(15px, 0.92rem);">
          ⏳ 放置不理（讓倒數結束自動連播）
        </button>
      </div>

      <div class="wb3-status" id="tugStatus" aria-live="polite">
        倒數計時中！App 正在試圖幫你自動播放下一部影片...
      </div>

      <div style="text-align:center; margin-top:12px; display:none;" id="replayWrap">
        <button class="wb3-btn wb3-btn-warn" id="btnReplayTug">🔄 再試一次拔河</button>
      </div>
    </div>
  `;

  const countdownDigit = host.querySelector('#countdownDigit');
  const countdownBox = host.querySelector('#countdownBox');
  const currentVideoTitle = host.querySelector('#currentVideoTitle');
  const videoWatchTime = host.querySelector('#videoWatchTime');
  const nextVideoTitle = host.querySelector('#nextVideoTitle');
  const playerScreen = host.querySelector('#playerScreen');
  const characterAvatar = host.querySelector('#characterAvatar');
  const characterStatus = host.querySelector('#characterStatus');
  const batteryFill = host.querySelector('#batteryFill');
  const batteryText = host.querySelector('#batteryText');
  const btnPause = host.querySelector('#btnPause');
  const btnLetItGo = host.querySelector('#btnLetItGo');
  const statusEl = host.querySelector('#tugStatus');
  const replayWrap = host.querySelector('#replayWrap');
  const btnReplay = host.querySelector('#btnReplayTug');

  const stopTimer = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const updateHud = () => {
    const state = HP_STATES[batteryPct] || HP_STATES[0];
    characterAvatar.textContent = state.avatar;
    characterStatus.textContent = state.desc;
    batteryFill.style.width = `${batteryPct}%`;
    batteryText.textContent = `${batteryPct}% (${state.tag})`;

    if (batteryPct <= 25) {
      batteryFill.className = 'wb3-battery-fill low';
    } else if (batteryPct <= 50) {
      batteryFill.className = 'wb3-battery-fill med';
    } else {
      batteryFill.className = 'wb3-battery-fill';
    }
  };

  const handleAutoPlayTriggered = () => {
    stopTimer();
    if (isPaused) return;

    // Advance episode
    currentEpIndex = Math.min(EPISODES.length - 1, currentEpIndex + 1);
    batteryPct = Math.max(0, batteryPct - 25);
    updateHud();

    const playedEp = EPISODES[currentEpIndex];
    currentVideoTitle.textContent = `🎬 連續播放中：${playedEp.title}`;
    videoWatchTime.textContent = `累計觀看：${20 + currentEpIndex * 20} 分鐘`;

    if (batteryPct > 0) {
      // Still has HP -> next autoplay cycle
      countdownBox.innerHTML = '<span style="color:#ff6b6b; font-size:1.6rem;">▶️ 自動連播中！</span>';
      const upcomingEp = EPISODES[Math.min(EPISODES.length - 1, currentEpIndex + 1)];
      nextVideoTitle.textContent = `▶️ 即將接著播放：${upcomingEp.title}`;
      playerScreen.style.background = '#2b1d0c';

      doShake(playerScreen);
      api.bad();

      statusEl.className = 'wb3-status bad';
      statusEl.textContent = `⚠️ 連續播放第 ${currentEpIndex + 1} 部！時間不知不覺溜走，小安精力剩 ${batteryPct}%！按【暫停喝水】奪回主導權！`;

      // Restart countdown for next episode
      countdownSec = 3;
      countdownDigit.textContent = '3';
      safeLater(api, () => {
        if (!isAlive(api) || isPaused) return;
        countdownBox.innerHTML = `<span>⏱️</span><span id="countdownDigit">${countdownSec}</span><span style="font-size:1.1rem; color:#ced4da;">秒</span>`;
        timerId = safeLater(api, tick, 1000);
      }, 1000);
    } else {
      // HP reached 0% -> completely exhausted / asleep
      countdownBox.innerHTML = '<span style="color:#e03131; font-size:1.8rem;">😴 體力透支斷電</span>';
      nextVideoTitle.textContent = '小安累趴昏睡了... 眼睛痠痛、大腦疲憊不堪！';
      playerScreen.style.background = '#1a1a1a';
      playerScreen.style.border = '2px solid #e03131';

      doShake(host.querySelector('.wb3-battery-hud'));
      api.bad();

      statusEl.className = 'wb3-status bad';
      statusEl.textContent = '🚨 體力與專注力歸零！自動播放讓小安不知不覺看太久，身體抗議睡著了！快點擊【暫停休息】讓小安滿血復活！';

      btnLetItGo.disabled = true;
      btnPause.innerHTML = '🥤 暫停！喝水休息，滿血復活！';
      btnPause.classList.add('wb3-btn-pulse');
    }
  };

  const handlePauseDecision = () => {
    stopTimer();
    isPaused = true;
    host.querySelector('#tugBadge').textContent = '已暫停觀看';
    countdownBox.innerHTML = '<span style="color:#69db7c; font-size:1.8rem;">⏸️ 已暫停觀看</span>';
    nextVideoTitle.textContent = '🥤 螢幕已休息，喝口水，眼睛看遠方綠色植物！';
    playerScreen.style.background = '#0d2818';
    playerScreen.style.border = '2px solid #51cf66';

    // Battery fully restores
    batteryPct = 100;
    updateHud();
    characterAvatar.textContent = '🥤😄';
    characterStatus.textContent = '神清氣爽！專注力與視力都得到充分放鬆！';
    api.good();
    doPop(characterAvatar);

    statusEl.className = 'wb3-status good';
    statusEl.textContent = '🏆 太棒了！由你做決定，而不是被自動播放牽著走！你的自制力與健康管理滿分！';

    btnPause.disabled = true;
    btnLetItGo.disabled = true;
    replayWrap.style.display = 'block';

    api.done();
  };

  const tick = () => {
    if (!isAlive(api) || isPaused) return;
    const digitEl = host.querySelector('#countdownDigit');
    if (countdownSec > 1) {
      countdownSec--;
      if (digitEl) digitEl.textContent = String(countdownSec);
      timerId = safeLater(api, tick, 1000);
    } else {
      handleAutoPlayTriggered();
    }
  };

  // Start ticking
  timerId = safeLater(api, tick, 1000);

  btnPause.addEventListener('click', handlePauseDecision);
  btnLetItGo.addEventListener('click', handleAutoPlayTriggered);
  btnReplay.addEventListener('click', () => {
    stopTimer();
    autoplaytug(host, _params, api);
  });
}

// ============================================================================
// 6. globetime - 【旋轉地球儀與晨昏線】
// ============================================================================
export function globetime(host, _params, api) {
  let taipeiHour = 12; // 0 to 23
  let exploreCount = 0;

  // City definitions: offsets relative to UTC
  // Taipei: UTC+8
  // London: UTC+0 (Taipei - 8)
  // New York: UTC-5 (Taipei - 13)
  const cities = [
    {
      id: 'taipei',
      name: '台灣 台北',
      flag: '🇹🇼',
      utc: 8,
      noonDayScenario: '🍱 正在學校教室吃營養午餐、跟同學熱鬧聊天！',
      nightScenario: '😴 窩在溫暖被窩裡睡香甜好覺，街上很安靜！',
    },
    {
      id: 'london',
      name: '英國 倫敦',
      flag: '🇬🇧',
      utc: 0,
      noonDayScenario: '🥪 剛走出大笨鐘與倫敦眼，在草地上吃三明治！',
      nightScenario: '🌙 凌晨時分，路燈亮著，大家都在夢鄉熟睡中！',
    },
    {
      id: 'newyork',
      name: '美國 紐約',
      flag: '🇺🇸',
      utc: -5,
      noonDayScenario: '🌭 正午陽光照射在自由女神像，中央公園散步！',
      nightScenario: '🛏️ 夜深了，剛刷完牙聽完睡前故事準備睡覺！',
    },
  ];

  host.innerHTML = `
    <div class="wb3-panel wb3-globe">
      <div class="gemini-tag" data-created-by="gemini" data-info="旋轉地球儀與晨昏線 · 看懂晝夜交替與全球時區秘密"><span class="gemini-spark">✨</span> Gemini 互動設計</div>
      <div class="wb3-header">
        <span class="wb3-title">🌍 旋轉地球儀與晨昏線</span>
        <span class="wb3-badge">地球自轉與時區</span>
      </div>
      <div class="wb3-tip-badge">💡 學習重點：旋轉地球儀觀察晨昏線，看看為什麼台北吃午餐時，倫敦還在深夜熟睡！</div>

      <!-- Globe & City Cards Scene -->
      <div class="wb3-globe-scene">
        <!-- Rotating Globe Sphere Viewport -->
        <div style="position:relative;">
          <div class="wb3-globe-viewport" id="globeViewport">
            <!-- Daylight on Right half (facing Sun) -->
            <div class="wb3-globe-daylight"></div>
            <!-- Terminator line in the center -->
            <div class="wb3-terminator-line"></div>
            <!-- Fixed Sun beam on the right -->
            <div class="wb3-sun-beam">☀️</div>

            <!-- Globe Surface Layer with City Pins -->
            <div class="wb3-globe-sphere" id="globeSphere">
              <div class="wb3-city-pin" id="pin-taipei">🇹🇼<br>台北</div>
              <div class="wb3-city-pin" id="pin-london">🇬🇧<br>倫敦</div>
              <div class="wb3-city-pin" id="pin-newyork">🇺🇸<br>紐約</div>
            </div>
          </div>
          <div style="font-size: max(15px, 0.76rem); color:#868e96; text-align:center; margin-top:6px; font-weight:700;">
            ← 🌑 背對太陽 (夜晚) ｜ 面向太陽 (白天) ☀️ →
          </div>
        </div>

        <!-- 3 City Real-Time Status Cards -->
        <div class="wb3-city-cards" id="cityCards"></div>
      </div>

      <!-- Rotation Slider & Presets -->
      <div class="wb3-globe-slider-box">
        <div style="display:flex; justify-content:space-between; font-size: max(15px, 0.9rem); font-weight:800; color:#495057;">
          <span>🌍 旋轉地球儀（台北時間）：</span>
          <span id="sliderTimeLabel" style="color:#1971c2;">中午 12:00</span>
        </div>
        <input type="range" class="wb3-globe-slider" id="globeSlider" min="0" max="23" value="12" step="1" aria-label="旋轉地球儀調整時間">
      </div>

      <!-- Quick Preset Buttons -->
      <div class="wb3-globe-presets">
        <button class="wb3-btn" id="presetTaipeiNoon">☀️ 台北中午 12:00（吃午餐）</button>
        <button class="wb3-btn" id="presetLondonDawn">🌙 倫敦凌晨 04:00（熟睡中）</button>
        <button class="wb3-btn" id="presetNyNight">🌆 紐約晚上 23:00（準備睡覺）</button>
      </div>

      <div class="wb3-status" id="globeStatus" aria-live="polite">
        滑動拉桿或點選上方城市按鈕，觀察地球上的白天與黑夜！
      </div>
    </div>
  `;

  const slider = host.querySelector('#globeSlider');
  const sliderLabel = host.querySelector('#sliderTimeLabel');
  const cityCardsContainer = host.querySelector('#cityCards');
  const statusEl = host.querySelector('#globeStatus');
  const pinTaipei = host.querySelector('#pin-taipei');
  const pinLondon = host.querySelector('#pin-london');
  const pinNewYork = host.querySelector('#pin-newyork');

  const updateGlobe = (hour) => {
    taipeiHour = hour;
    slider.value = String(hour);
    sliderLabel.textContent = `${String(hour).padStart(2, '0')}:00`;

    // Calculate hours for each city
    const londonHour = (hour - 8 + 24) % 24;
    const newYorkHour = (hour - 13 + 24) % 24;

    const cityHourMap = {
      taipei: hour,
      london: londonHour,
      newyork: newYorkHour,
    };

    // Update Globe Pins
    // Solar angle: At 12:00 (Noon), facing sun (Right side, angle = 0).
    // At 00:00 (Midnight), facing away (Left side, angle = Math.PI).
    // Globe radius: 110px. Center: (110, 110)
    const centerX = 110;
    const centerY = 110;
    const radius = 80;

    const updatePin = (pinEl, cityHour) => {
      const angle = ((cityHour - 12) / 24) * 2 * Math.PI;
      // Facing sun on right: cos(angle) > 0 means right hemisphere (day), < 0 means left (night)
      const isDay = Math.cos(angle) >= 0;
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + (radius * 0.45) * Math.sin(angle);

      pinEl.style.left = `${px}px`;
      pinEl.style.top = `${py}px`;
      pinEl.style.opacity = Math.cos(angle) < -0.6 ? '0.45' : '1';
      return isDay;
    };

    const isTaipeiDay = updatePin(pinTaipei, hour);
    const isLondonDay = updatePin(pinLondon, londonHour);
    const isNyDay = updatePin(pinNewYork, newYorkHour);

    const isDayMap = {
      taipei: isTaipeiDay,
      london: isLondonDay,
      newyork: isNyDay,
    };

    // Render City Cards
    cityCardsContainer.innerHTML = cities.map(c => {
      const h = cityHourMap[c.id];
      const isDay = isDayMap[c.id];
      const timeStr = `${String(h).padStart(2, '0')}:00`;
      const skyIcon = isDay ? '☀️ 白天' : '🌙 黑夜';
      const scenario = isDay ? c.noonDayScenario : c.nightScenario;

      return `
        <div class="wb3-city-card ${isDay ? 'day' : 'night'}">
          <div>
            <div class="wb3-city-meta">
              ${c.flag} ${c.name}：<span style="font-family:monospace; font-size:1.05rem;">${timeStr}</span> (${skyIcon})
            </div>
            <div class="wb3-city-desc" style="margin-top:2px;">
              ${scenario}
            </div>
          </div>
        </div>
      `;
    }).join('');

    exploreCount++;
    if (exploreCount >= 3) {
      statusEl.className = 'wb3-status good';
      statusEl.textContent = '🌟 太清楚了！地球由西向東自轉，當台灣面向太陽吃午餐時，背對太陽的倫敦與紐約正在熟睡！這就是全世界需要劃分「時區」的原因！';
      api.done();
    }
  };

  slider.addEventListener('input', (e) => {
    updateGlobe(parseInt(e.target.value, 10));
    api.good();
  });

  host.querySelector('#presetTaipeiNoon')?.addEventListener('click', () => {
    updateGlobe(12);
    api.good();
  });

  host.querySelector('#presetLondonDawn')?.addEventListener('click', () => {
    updateGlobe(12); // London is 04:00 when Taipei is 12:00
    api.good();
  });

  host.querySelector('#presetNyNight')?.addEventListener('click', () => {
    updateGlobe(12); // NY is 23:00 previous day when Taipei is 12:00
    api.good();
  });

  // Initialize
  updateGlobe(12);
}
