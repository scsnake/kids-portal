// widgets-safety.js - Group B Interactive Widgets (Security, Network, Logic)
// For "科技原理小探險" (tech-explorer)

function doShake(el) {
  if (!el) return;
  el.classList.remove('ws-shake');
  void el.offsetWidth;
  el.classList.add('ws-shake');
}

function doPop(el) {
  if (!el) return;
  el.classList.remove('ws-pop');
  void el.offsetWidth;
  el.classList.add('ws-pop');
}

const escapeHTML = val => String(val).replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
})[char]);

// ============================================================================
// 1. otpdefense: 「驗證碼不能給別人」
// ============================================================================
export function otpdefense(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-otp">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="ws-header">
        <span class="ws-title">🛡️ 驗證碼保衛戰</span>
        <span class="ws-badge ws-badge-warn">簡訊一次性密鑰 (OTP)</span>
      </div>

      <div class="ws-otp-scene">
        <!-- Phone Mockup -->
        <div class="ws-phone-card">
          <div class="ws-phone-notch">
            <span>9:41</span>
            <span>📶 💬 簡訊 (SMS)</span>
          </div>
          <div class="ws-sms-bubble">
            <div class="ws-sms-sender">🔐 遊戲官方帳號中心</div>
            <div class="ws-sms-body">你的登入驗證碼是：</div>
            <div class="ws-code-badge" id="smsCode">7 8 2 5</div>
            <div class="ws-sms-warn">⚠️ 重要提醒：千萬不要告訴任何人！包括親切的網友！</div>
          </div>
          <div class="ws-stranger-bubble" id="strangerBox">
            <span class="ws-avatar-lg">🦊</span>
            <div class="ws-stranger-text">
              <b>陌生人（狐狸叔叔）：</b>
              <span id="strangerMsg">「小朋友！我的驗證碼不小心發到你的手機了，快把 4 個數字給我！」</span>
            </div>
          </div>
        </div>

        <!-- Account Vault -->
        <div class="ws-vault-card">
          <div class="ws-vault-title">🏦 小安的寶物金庫</div>
          <div class="ws-vault-door" id="vaultDoor">
            <span class="ws-vault-wheel">🔒</span>
            <div class="ws-vault-keypad" id="vaultKeypad">
              <span>?</span><span>?</span><span>?</span><span>?</span>
            </div>
          </div>
          <div class="ws-vault-treasures" id="vaultTreasures">
            <span>💎</span><span>💎</span><span>👑</span><span>💎</span>
          </div>
          <p class="ws-vault-label" id="vaultLabel">1,200 顆寶石與限定傳奇造型</p>

          <!-- Energy Barrier Overlay -->
          <div class="ws-energy-barrier" id="energyBarrier">
            <span class="ws-barrier-shield">🛡️✨ 安全護盾啟動！防禦成功！</span>
          </div>
        </div>
      </div>

      <!-- Action Choice Buttons -->
      <div class="ws-otp-actions" id="otpActions">
        <button class="ws-btn ws-btn-danger" id="btnSendOtp">
          💬 傳送驗證碼給陌生人 (7825)
        </button>
        <button class="ws-btn ws-btn-primary" id="btnBlockScam">
          🙅 拒絕並封鎖（這是我的！）
        </button>
      </div>

      <div class="ws-status" id="otpStatus" aria-live="polite">
        陌生人正在向你索取簡訊驗證碼，請做出正確的防守選擇！
      </div>
    </div>
  `;

  const btnSend = host.querySelector('#btnSendOtp');
  const btnBlock = host.querySelector('#btnBlockScam');
  const strangerBox = host.querySelector('#strangerBox');
  const strangerMsg = host.querySelector('#strangerMsg');
  const vaultDoor = host.querySelector('#vaultDoor');
  const vaultKeypad = host.querySelector('#vaultKeypad');
  const vaultTreasures = host.querySelector('#vaultTreasures');
  const vaultLabel = host.querySelector('#vaultLabel');
  const energyBarrier = host.querySelector('#energyBarrier');
  const statusEl = host.querySelector('#otpStatus');
  const actionsEl = host.querySelector('#otpActions');

  // Option 1: Give code away (Bad choice)
  btnSend.addEventListener('click', () => {
    btnSend.disabled = true;
    btnBlock.disabled = true;
    api.bad();
    doShake(strangerBox);

    // Enter digits into keypad
    const digits = ['7', '8', '2', '5'];
    vaultKeypad.innerHTML = digits.map(d => `<span>${d}</span>`).join('');
    strangerMsg.textContent = '「哈哈！拿到驗證碼了！正在開門偷寶石...」';

    api.later(() => {
      if (!api.alive()) return;
      vaultDoor.classList.add('open');
      vaultDoor.querySelector('.ws-vault-wheel').textContent = '🔓';
      vaultTreasures.classList.add('looted');
      vaultLabel.textContent = '😱 寶物都被陌生人搬走了！';
      statusEl.className = 'ws-status bad';
      statusEl.textContent = '❌ 糟糕！驗證碼就像家裡的大門鑰匙，交給陌生人帳號就被偷走了！';

      // Show retry button
      actionsEl.innerHTML = `
        <button class="ws-btn ws-btn-warn" id="btnRetry">
          🔄 再試一次
        </button>
      `;
      host.querySelector('#btnRetry')?.addEventListener('click', () => {
        otpdefense(host, _params, api);
      });
    }, 600);
  });

  // Option 2: Reject and block (Good choice)
  btnBlock.addEventListener('click', () => {
    btnSend.disabled = true;
    btnBlock.disabled = true;
    api.good();

    // Deflect scammer
    energyBarrier.classList.add('active');
    strangerBox.classList.add('scared');
    strangerMsg.textContent = '「哎呀～被識破了！趕快逃跑！💨」';

    vaultDoor.classList.add('safe');
    vaultDoor.querySelector('.ws-vault-wheel').textContent = '⭐';
    doPop(vaultDoor);

    api.later(() => {
      if (!api.alive()) return;
      statusEl.className = 'ws-status good';
      statusEl.textContent = '🎉 太棒了！守住了帳號與寶石！驗證碼是專屬於你的最後防線，任何人都不能給！';
      api.done();
    }, 500);
  });
}

// ============================================================================
// 2. packetsniff: 「公共 Wi-Fi 上做什麼？」
// ============================================================================
export function packetsniff(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-sniff">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="ws-sniff-header">
        <span class="ws-title">☕ 露天咖啡廳 · 公共 Wi-Fi</span>
        <span class="ws-badge ws-badge-warn">⚠️ 開放網路（未加密）</span>
      </div>

      <div class="ws-sniff-stage">
        <!-- Tablet Client -->
        <div class="ws-sniff-box">
          <span class="ws-device-icon" id="tabletIcon">📱</span>
          <span class="ws-device-text" id="tabletText">小朋友的平板</span>
        </div>

        <!-- Air Transmission Path -->
        <div class="ws-air-path" id="airPath">
          <div class="ws-air-waves">🛜 📡 🛜</div>
          <div class="ws-packet-capsule" id="packetCapsule" style="opacity:0">
            <span id="packetIcon">📦</span>
            <span id="packetText">封包</span>
          </div>
        </div>

        <!-- Internet Server -->
        <div class="ws-sniff-box">
          <span class="ws-device-icon">🌐</span>
          <span class="ws-device-text">網站伺服器</span>
        </div>

        <!-- Snooper Fox -->
        <div class="ws-snooper-card" id="snooperCard">
          <span class="ws-snooper-avatar" id="snooperAvatar">🦊</span>
          <div class="ws-snooper-bubble">
            <b>偷看客（拿著天線的駭客）：</b>
            <span id="snooperSpeech">「我在旁邊偷聽空氣中的 Wi-Fi 封包，看看會抓到什麼！」</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="ws-sniff-actions">
        <button class="ws-btn" id="btnWeather">🌤️ 看天氣新聞</button>
        <button class="ws-btn ws-btn-danger" id="btnHttp">🔑 登入輸入密碼 (HTTP)</button>
        <button class="ws-btn ws-btn-primary" id="btnHttps">🛡️ 切換為 HTTPS 加密鎖頭</button>
      </div>

      <div class="ws-status" id="sniffStatus" aria-live="polite">
        公共 Wi-Fi 的無線電波在空氣中傳播，點擊按鈕試試不同的上網行為！
      </div>
    </div>
  `;

  const btnWeather = host.querySelector('#btnWeather');
  const btnHttp = host.querySelector('#btnHttp');
  const btnHttps = host.querySelector('#btnHttps');
  const capsule = host.querySelector('#packetCapsule');
  const pIcon = host.querySelector('#packetIcon');
  const pText = host.querySelector('#packetText');
  const snooperCard = host.querySelector('#snooperCard');
  const snooperAvatar = host.querySelector('#snooperAvatar');
  const snooperSpeech = host.querySelector('#snooperSpeech');
  const tabletText = host.querySelector('#tabletText');
  const statusEl = host.querySelector('#sniffStatus');

  const setButtonsDisabled = disabled => {
    btnWeather.disabled = disabled;
    btnHttp.disabled = disabled;
    btnHttps.disabled = disabled;
  };

  // Action A: Weather News (Public data)
  btnWeather.addEventListener('click', () => {
    setButtonsDisabled(true);
    snooperCard.className = 'ws-snooper-card';
    snooperAvatar.textContent = '🦊';
    capsule.className = 'ws-packet-capsule weather';
    pIcon.textContent = '🌤️';
    pText.textContent = '台北市 22°C 晴時多雲';
    capsule.style.opacity = '1';
    capsule.style.transform = 'scale(1) translateX(0)';

    api.later(() => {
      if (!api.alive()) return;
      snooperSpeech.textContent = '「只是看天氣預報，偷看也沒什麼用～」';
      tabletText.textContent = '🌤️ 取得今日天氣！';
      statusEl.className = 'ws-status';
      statusEl.textContent = '公開的天氣資料就算被看見也沒關係，但私密資訊可不行！';
      api.good();
      setButtonsDisabled(false);
    }, 600);
  });

  // Action B: HTTP Plaintext Login (Vulnerable)
  btnHttp.addEventListener('click', () => {
    setButtonsDisabled(true);
    snooperCard.className = 'ws-snooper-card alert';
    snooperAvatar.textContent = '😈';
    capsule.className = 'ws-packet-capsule http-plain';
    pIcon.textContent = '⚠️';
    pText.textContent = '明文 🔑 密碼: 123456';
    capsule.style.opacity = '1';
    capsule.style.transform = 'scale(1.05) translateY(20px)';
    doShake(snooperCard);

    api.later(() => {
      if (!api.alive()) return;
      snooperSpeech.textContent = '「哈哈！HTTP 沒有加密，經過空氣的密碼全被我看光了！」';
      tabletText.textContent = '🚨 密碼被偷看了！';
      statusEl.className = 'ws-status bad';
      statusEl.textContent = '❌ 危險！HTTP 沒有加密，在公共 Wi-Fi 上就像拿著大聲公喊出密碼！';
      api.bad();
      setButtonsDisabled(false);
    }, 600);
  });

  // Action C: HTTPS Encrypted Safe (Protected)
  btnHttps.addEventListener('click', () => {
    setButtonsDisabled(true);
    snooperCard.className = 'ws-snooper-card';
    snooperAvatar.textContent = '😵';
    capsule.className = 'ws-packet-capsule https-secure';
    pIcon.textContent = '🛡️🔒';
    pText.textContent = '密文保險箱: #&!*@%?';
    capsule.style.opacity = '1';
    capsule.style.transform = 'scale(1) translateX(0)';
    doPop(capsule);

    api.later(() => {
      if (!api.alive()) return;
      snooperSpeech.textContent = '「可惡！被 HTTPS 密碼鎖保護住，偷看到也完全解不開！」';
      tabletText.textContent = '🔒 安全加密登入！';
      statusEl.className = 'ws-status good';
      statusEl.textContent = '🎉 太安全了！HTTPS 會對你的封包全程加密，在公共 Wi-Fi 偷聽客眼中全都是看不懂的亂碼！';
      api.good();
      api.done();
      setButtonsDisabled(false);
    }, 650);
  });
}

// ============================================================================
// 3. realwallet: 「遊戲裡的錢是真的錢」
// ============================================================================
export function realwallet(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-wallet">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="ws-header">
        <span class="ws-title">🎮 遊戲商城與真實荷包</span>
        <span class="ws-badge ws-badge-warn">遊戲內購安全 (IAP)</span>
      </div>

      <!-- Shop Item Card -->
      <div class="ws-shop-item">
        <div class="ws-item-preview">
          <span class="ws-item-icon">🤖✨</span>
          <div>
            <div class="ws-item-title">超能機甲戰士限定造型</div>
            <div class="ws-item-price">💎 1,000 顆寶石 (售價 NT$ 300)</div>
          </div>
        </div>
        <button class="ws-btn ws-btn-primary" id="btnBuySkin">
          💎 點我購買造型
        </button>
      </div>

      <!-- Conduit Scene -->
      <div class="ws-conduit-scene" id="conduitScene">
        <div class="ws-conduit-wire" id="conduitWire">
          <span>⚡ 金流傳輸管線（隱藏扣款路徑）⚡</span>
        </div>

        <div class="ws-real-wallet-box" id="walletBox">
          <span class="ws-wallet-big-icon">👛</span>
          <div>
            <b>爸媽的真實皮夾與信用卡</b>
            <div style="font-size: max(15px, 0.85rem); color:var(--ink-2)">
              遊戲裡按一下，扣的是真實世界的辛苦錢！
            </div>
          </div>
        </div>

        <div class="ws-converter-banner" id="converterBanner" hidden>
          🍱 換算真實世界：NT$ 300 ＝ <b>3 個學校營養便當</b> 或 <b>6 大瓶營養鮮奶</b>！🥛
        </div>

        <!-- Parent Modal Mock -->
        <div class="ws-parent-dialog" id="parentDialog" hidden>
          <div class="ws-parent-header">
            <span>📱 媽媽的手機收到「購買前詢問」通知</span>
          </div>
          <p style="margin:0 0 10px; font-size: max(15px, 0.92rem)">
            「小安想在遊戲中購買 1,000 顆寶石 (NT$ 300)，需要家長同意。」
          </p>
          <div class="ws-parent-choices">
            <button class="ws-btn ws-btn-success" id="btnParentApprove">
              ✅ 一起討論後批准
            </button>
            <button class="ws-btn ws-btn-ghost" id="btnParentDeny">
              ❌ 暫時拒絕，省下便當錢
            </button>
          </div>
        </div>
      </div>

      <!-- Action Tools -->
      <div class="ws-wallet-tools">
        <button class="ws-btn ws-btn-warn" id="btnXRay">
          🔍 X 光透視真實錢包
        </button>
        <button class="ws-btn ws-btn-primary" id="btnApplyShield">
          🛡️ 裝上「購買前詢問 (Ask to Buy)」防護罩
        </button>
      </div>

      <div class="ws-status" id="walletStatus" aria-live="polite">
        點擊「X 光透視真實錢包」，看看遊戲商城按鈕到底連到哪裡！
      </div>
    </div>
  `;

  const btnBuy = host.querySelector('#btnBuySkin');
  const btnXRay = host.querySelector('#btnXRay');
  const btnShield = host.querySelector('#btnApplyShield');
  const conduitScene = host.querySelector('#conduitScene');
  const converterBanner = host.querySelector('#converterBanner');
  const parentDialog = host.querySelector('#parentDialog');
  const btnApprove = host.querySelector('#btnParentApprove');
  const btnDeny = host.querySelector('#btnParentDeny');
  const statusEl = host.querySelector('#walletStatus');

  let xrayOpened = false;
  let shieldInstalled = false;

  // Toggle X-Ray
  btnXRay.addEventListener('click', () => {
    xrayOpened = true;
    conduitScene.classList.add('xray-on');
    converterBanner.hidden = false;
    doPop(converterBanner);
    api.good();
    statusEl.className = 'ws-status';
    statusEl.textContent = '看清楚了！管線直接連到爸媽的錢包！請點擊「裝上購買前詢問防護罩」！';
  });

  // Apply Shield
  btnShield.addEventListener('click', () => {
    shieldInstalled = true;
    btnShield.disabled = true;
    btnShield.textContent = '✅ 已裝上防護罩 (Ask to Buy)';
    doPop(btnShield);
    api.good();
    statusEl.className = 'ws-status';
    statusEl.textContent = '🛡️ 防護罩安裝完畢！現在點擊「點我購買造型」試試看！';
  });

  // Buy Skin Button
  btnBuy.addEventListener('click', () => {
    if (!shieldInstalled) {
      doShake(btnXRay);
      api.bad();
      statusEl.className = 'ws-status warn';
      statusEl.textContent = '⚠️ 請先使用 X 光看清楚錢從哪裡來，並裝上「購買前詢問」防護罩！';
      return;
    }

    // Intercepted by parent notification!
    parentDialog.hidden = false;
    doPop(parentDialog);
    api.good();
    statusEl.className = 'ws-status';
    statusEl.textContent = '📱 觸發防護！購買請求已傳送給家長審核，不會偷扣錢！';
  });

  // Parent decisions
  const handleParentDecision = approved => {
    parentDialog.hidden = true;
    btnBuy.disabled = true;
    api.good();
    statusEl.className = 'ws-status good';
    if (approved) {
      statusEl.textContent = '🎉 媽媽說：「這次段考很用心，我們討論後同意獎勵！」有商量最安心！';
    } else {
      statusEl.textContent = '🎉 媽媽說：「這個月要買新球鞋，我們先省下便當錢！」好險有詢問機制保護荷包！';
    }
    api.done();
  };

  btnApprove.addEventListener('click', () => handleParentDecision(true));
  btnDeny.addEventListener('click', () => handleParentDecision(false));
}

// ============================================================================
// 4. kickhacker: 「救回帳號」
// ============================================================================
export function kickhacker(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-kick">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="ws-header">
        <span class="ws-title">🛡️ 帳號救援控制台</span>
        <span class="ws-badge ws-badge-bad" id="kickBadge">⚠️ 偵測到未授權登入</span>
      </div>

      <!-- Devices List -->
      <div class="ws-devices-list" id="devicesList">
        <div class="ws-device-row">
          <div class="ws-device-info">
            <span class="ws-dev-icon">📱</span>
            <div class="ws-device-text">
              <b>我的 iPad</b>
              <small>台北市 · 目前本機連線中</small>
            </div>
          </div>
          <span class="ws-badge ws-badge-good">本機使用</span>
        </div>

        <div class="ws-device-row">
          <div class="ws-device-info">
            <span class="ws-dev-icon">🖥️</span>
            <div class="ws-device-text">
              <b>客廳電腦</b>
              <small>客廳 Chrome · 家人使用</small>
            </div>
          </div>
          <span class="ws-badge">信任裝置</span>
        </div>

        <div class="ws-device-row hacker" id="hackerRow">
          <div class="ws-device-info">
            <span class="ws-dev-icon">🦹</span>
            <div class="ws-device-text">
              <b>陌生駭客筆電</b>
              <small>未知國家 (異常 IP) · ⚠️ 正在連線中</small>
            </div>
          </div>
          <span class="ws-badge ws-badge-bad" id="hackerStatus">🚨 異常入侵中</span>
        </div>
      </div>

      <!-- 3 Stepped Actions -->
      <div class="ws-kick-steps">
        <button class="ws-btn ws-step-btn ready" id="btnStep1" data-step="1">
          <span class="ws-step-badge">1</span>
          <span>🔑 設定新強密碼</span>
        </button>

        <button class="ws-btn ws-step-btn" id="btnStep2" data-step="2" disabled>
          <span class="ws-step-badge">2</span>
          <span>🚪 登出所有裝置 (Sign out everywhere)</span>
        </button>

        <button class="ws-btn ws-step-btn" id="btnStep3" data-step="3" disabled>
          <span class="ws-step-badge">3</span>
          <span>🛡️ 開啟雙重驗證 (2FA)</span>
        </button>
      </div>

      <div class="ws-status" id="kickStatus" aria-live="polite">
        步驟 1：帳號被入侵了，第一步先點擊「設定新強密碼」！
      </div>
    </div>
  `;

  const btnStep1 = host.querySelector('#btnStep1');
  const btnStep2 = host.querySelector('#btnStep2');
  const btnStep3 = host.querySelector('#btnStep3');
  const hackerRow = host.querySelector('#hackerRow');
  const kickBadge = host.querySelector('#kickBadge');
  const statusEl = host.querySelector('#kickStatus');

  // Step 1: Change Password
  btnStep1.addEventListener('click', () => {
    btnStep1.disabled = true;
    btnStep1.className = 'ws-btn ws-step-btn done';
    btnStep1.querySelector('span:last-child').textContent = '✅ 新密碼已設定：[Xk9#mP!2]';
    api.good();

    btnStep2.disabled = false;
    btnStep2.classList.add('ready');
    doPop(btnStep2);

    statusEl.className = 'ws-status';
    statusEl.textContent = '密碼改好了！但駭客的電腦還開著連線，必須進行步驟 2：登出所有裝置！';
  });

  // Step 2: Sign out everywhere (Kick hacker!)
  btnStep2.addEventListener('click', () => {
    btnStep2.disabled = true;
    btnStep2.className = 'ws-btn ws-step-btn done';
    btnStep2.querySelector('span:last-child').textContent = '✅ 已強制登出所有其他裝置';
    api.good();

    // Comic Boot kick animation
    const boot = document.createElement('span');
    boot.className = 'ws-boot-drop';
    boot.textContent = '🥾💥';
    hackerRow.prepend(boot);

    api.later(() => {
      if (!api.alive()) return;
      hackerRow.classList.add('kicked');
      kickBadge.className = 'ws-badge ws-badge-good';
      kickBadge.textContent = '✅ 駭客連線已被踢除';

      btnStep3.disabled = false;
      btnStep3.classList.add('ready');
      doPop(btnStep3);

      statusEl.className = 'ws-status';
      statusEl.textContent = '太痛快了！大腳把駭客踢出去了！最後一步：點擊步驟 3 開啟雙重驗證！';
    }, 450);
  });

  // Step 3: Turn on 2FA
  btnStep3.addEventListener('click', () => {
    btnStep3.disabled = true;
    btnStep3.className = 'ws-btn ws-step-btn done';
    btnStep3.querySelector('span:last-child').textContent = '✅ 雙重驗證 (2FA) 防護已開啟';
    api.good();

    statusEl.className = 'ws-status good';
    statusEl.textContent = '🎉 成功救回帳號！改強密碼 ➔ 登出所有裝置 ➔ 開啟 2FA，三步驟徹底保護帳號！';
    api.done();
  });
}

// ============================================================================
// 5. voiceclone: 「聲音和影片也能假造」
// ============================================================================
export function voiceclone(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-voice">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="ws-voice-phone">
        <div class="ws-phone-status-bar">
          <span>中華電信 5G</span>
          <span>100% 🔋</span>
        </div>

        <div class="ws-call-card">
          <div class="ws-caller-avatar">👩</div>
          <div class="ws-caller-name">媽媽</div>
          <div class="ws-caller-sub" id="callSub">0912-345-678 · 來電中...</div>

          <div class="ws-audio-wave" id="audioWave" hidden>
            <span class="ws-wave-bar"></span>
            <span class="ws-wave-bar"></span>
            <span class="ws-wave-bar"></span>
            <span class="ws-wave-bar"></span>
            <span class="ws-wave-bar"></span>
            <span class="ws-wave-bar"></span>
          </div>

          <div class="ws-ai-gauge" id="aiGauge" hidden>
            ⚠️ AI 聲音分析儀：合成語音特徵（可疑度 92%）
          </div>

          <div class="ws-speech-bubble" id="speechBubble" hidden>
            <b>電話那頭的聲音：</b><br>
            「喂！媽媽手機快沒電了，快點拿書包下樓，有個戴黑帽子的叔叔會接你！」
          </div>
        </div>

        <!-- Initial Incoming Call Button -->
        <div id="incomingAction">
          <button class="ws-btn ws-btn-success" id="btnAnswer" style="width:100%">
            📞 接聽電話
          </button>
        </div>

        <!-- Verification Tools (Shown after answering) -->
        <div class="ws-voice-actions" id="verifyActions" hidden>
          <button class="ws-btn ws-btn-tool-a" id="btnSecretWord">
            💬 工具 A：問約定好的通關密語 (Secret Word)
          </button>
          <button class="ws-btn ws-btn-tool-b" id="btnCallback">
            📞 工具 B：掛斷電話，回撥給媽媽公司電話
          </button>
        </div>
      </div>

      <div class="ws-status" id="voiceStatus" aria-live="polite">
        手機響了！顯示是媽媽的電話，點擊「接聽電話」看看！
      </div>
    </div>
  `;

  const btnAnswer = host.querySelector('#btnAnswer');
  const btnSecretWord = host.querySelector('#btnSecretWord');
  const btnCallback = host.querySelector('#btnCallback');
  const callSub = host.querySelector('#callSub');
  const audioWave = host.querySelector('#audioWave');
  const aiGauge = host.querySelector('#aiGauge');
  const speechBubble = host.querySelector('#speechBubble');
  const incomingAction = host.querySelector('#incomingAction');
  const verifyActions = host.querySelector('#verifyActions');
  const statusEl = host.querySelector('#voiceStatus');

  let testedA = false;
  let testedB = false;

  // Answer call
  btnAnswer.addEventListener('click', () => {
    incomingAction.hidden = true;
    verifyActions.hidden = false;
    audioWave.hidden = false;
    aiGauge.hidden = false;
    speechBubble.hidden = false;
    callSub.textContent = '00:04 通話中';
    api.good();

    statusEl.className = 'ws-status warn';
    statusEl.textContent = '⚠️ 聲音聽起來像媽媽，但 AI 分析儀發出警告！下方兩個工具都能查證，請按按看！';
  });

  const checkToolsComplete = () => {
    if (testedA && testedB) {
      statusEl.className = 'ws-status good';
      statusEl.textContent = '🎉 完美防詐！兩大防線（問通關密語＋回撥查證）全部掌握，AI 變聲再逼真也騙不到你！';
      api.done();
    } else if (testedA) {
      statusEl.className = 'ws-status good';
      statusEl.textContent = '✅ 工具 A 成功抓到破綻！現在點擊「工具 B」，練習掛斷親自回撥查證！';
    } else if (testedB) {
      statusEl.className = 'ws-status good';
      statusEl.textContent = '✅ 工具 B 成功回撥真媽媽！也可以點擊「工具 A」，看看用通關密語怎麼考驗假聲音！';
    }
  };

  // Tool A: Secret Word
  btnSecretWord.addEventListener('click', () => {
    testedA = true;
    btnSecretWord.disabled = true;
    btnSecretWord.innerHTML = '✅ 工具 A：通關密語已問（對方答不出來！）';
    btnSecretWord.classList.add('done');
    api.good();

    speechBubble.innerHTML = `
      <b>小安：</b>「媽媽，請問我們家狗狗叫什麼名字？」<br><br>
      <b>電話那頭（歹徒露出破綻）：</b><br>
      「呃...什麼狗？媽媽急死了哪記得！快點拿書包出來！」<br>
      <small style="color:var(--good, #2b8a3e);font-weight:800;">（抓到了！AI 假聲音根本不知道約定密語！）</small>
    `;
    aiGauge.className = 'ws-ai-gauge ws-badge-bad';
    aiGauge.textContent = '🚨 露出破綻！對方不知道約定密語，這是 AI 變聲假冒的！';

    api.later(() => {
      if (!api.alive()) return;
      checkToolsComplete();
      if (!testedB) {
        api.good();
      }
    }, 400);
  });

  // Tool B: Hang up and call back
  btnCallback.addEventListener('click', () => {
    testedB = true;
    btnCallback.disabled = true;
    btnCallback.innerHTML = '✅ 工具 B：已掛斷並回撥媽媽辦公室！';
    btnCallback.classList.add('done');
    api.good();

    audioWave.hidden = true;
    aiGauge.hidden = true;
    callSub.textContent = '通話已結束 ➔ 回撥「媽媽公司電話」中...';

    api.later(() => {
      if (!api.alive()) return;
      speechBubble.innerHTML = `
        <b>真正的媽媽（辦公室市內電話）：</b><br>
        「喂？小安！我正在公司開會呢，根本沒有叫人接你！好險你聰明掛斷回撥查證，沒有受騙！」
      `;
      speechBubble.style.borderColor = 'var(--good, #2b8a3e)';
      speechBubble.style.background = '#ebfbee';
      checkToolsComplete();
      api.done();
    }, 500);
  });
}

// ============================================================================
// 6. dnslookup: 「DNS：網路的通訊錄」
// ============================================================================
export function dnslookup(host, _params, api) {
  host.innerHTML = `
    <div class="ws-panel ws-dns">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <!-- Browser Address Bar -->
      <div class="ws-browser-bar">
        <span style="font-size:1.2rem">🌐</span>
        <div class="ws-browser-url">https://zoo.example.tw</div>
        <button class="ws-btn ws-btn-primary ws-btn-sm" id="btnDnsQuery">
          🔍 查詢 DNS
        </button>
      </div>

      <!-- Network Stage -->
      <div class="ws-dns-stage">
        <!-- Station 1: Child PC -->
        <div class="ws-dns-station">
          <div class="ws-station-screen" id="pcScreen">
            <span style="font-size:1.8rem">💻</span>
            <span>等待連線...</span>
          </div>
          <b>我的電腦</b>
          <small>只懂數字 IP</small>
        </div>

        <!-- Station 2: DNS Phonebook -->
        <div class="ws-dns-station">
          <div class="ws-yellow-book">
            <div style="font-weight:800; margin-bottom:6px">📔 DNS 網路通訊錄</div>
            <div id="dnsEntries">
              <div class="ws-dns-entry"><span>apple.tw</span> ➔ 104.22.1.8</div>
              <div class="ws-dns-entry"><span>game.tw</span> ➔ 172.16.8.9</div>
              <div class="ws-dns-entry" id="zooEntry"><span>zoo.example.tw</span> ➔ 140.112.1.25</div>
            </div>
          </div>
          <b>🦉 查號貓頭鷹</b>
          <small>DNS 伺服器</small>
        </div>

        <!-- Station 3: Zoo Server -->
        <div class="ws-dns-station">
          <div class="ws-station-screen" id="serverScreen">
            <span style="font-size:1.8rem">🏛️</span>
            <span>IP: 140.112.1.25</span>
          </div>
          <b>動物園伺服器</b>
          <small>等待封包抵達</small>
        </div>
      </div>

      <!-- Envelope & Stamp Tool -->
      <div id="dnsTools" hidden>
        <div class="ws-dns-envelope" id="envelopeBox">
          <span style="font-size:1.4rem">✉️</span>
          <span id="envelopeText">寄件封包：準備蓋上目標 IP 戳印</span>
        </div>
        <div class="ws-dns-tools">
          <button class="ws-btn ws-btn-warn" id="btnStamp">
            🔖 蓋上 IP 戳印：140.112.1.25
          </button>
          <button class="ws-btn ws-btn-primary" id="btnSendPacket" disabled>
            🚀 發送封包到 140.112.1.25
          </button>
        </div>
      </div>

      <div class="ws-status" id="dnsStatus" aria-live="polite">
        電腦看不懂英文網址，點擊「🔍 查詢 DNS」翻開網路通訊錄查號！
      </div>
    </div>
  `;

  const btnQuery = host.querySelector('#btnDnsQuery');
  const zooEntry = host.querySelector('#zooEntry');
  const dnsTools = host.querySelector('#dnsTools');
  const btnStamp = host.querySelector('#btnStamp');
  const btnSend = host.querySelector('#btnSendPacket');
  const envelopeText = host.querySelector('#envelopeText');
  const pcScreen = host.querySelector('#pcScreen');
  const statusEl = host.querySelector('#dnsStatus');

  // Step 1: Query DNS
  btnQuery.addEventListener('click', () => {
    btnQuery.disabled = true;
    zooEntry.classList.add('target');
    dnsTools.hidden = false;
    doPop(zooEntry);
    api.good();

    statusEl.className = 'ws-status';
    statusEl.textContent = '查到了！zoo.example.tw 的門牌號碼是 140.112.1.25！請蓋上 IP 戳印！';
  });

  // Step 2: Stamp IP onto envelope
  btnStamp.addEventListener('click', () => {
    btnStamp.disabled = true;
    envelopeText.innerHTML = '已蓋章 ➔ <b>寄往 IP: 140.112.1.25 (動物園伺服器)</b>';
    doPop(envelopeText);
    api.good();

    btnSend.disabled = false;
    doPop(btnSend);
    statusEl.className = 'ws-status';
    statusEl.textContent = '地址戳印蓋好了！現在點擊「🚀 發送封包」送出連線請求！';
  });

  // Step 3: Send packet and load website
  btnSend.addEventListener('click', () => {
    btnSend.disabled = true;
    api.good();

    statusEl.textContent = '封包正在光纖網路中飛馳... 🚀';

    api.later(() => {
      if (!api.alive()) return;
      pcScreen.innerHTML = `
        <span style="font-size:2rem">🐼</span>
        <b style="color:var(--good, #2b8a3e)">快樂動物園</b>
        <small>大貓熊吃竹子中！</small>
      `;
      doPop(pcScreen);

      statusEl.className = 'ws-status good';
      statusEl.textContent = '🎉 成功抵達！DNS 就像網路的電話簿，把好記的英文網址翻譯成電腦看得懂的 IP 數字！';
      api.done();
    }, 600);
  });
}

// ============================================================================
// 7. ifcondition: 「如果……就……」
// ============================================================================
export function ifcondition(host, _params, api) {
  const scenarios = [
    {
      title: '🌧️ 1. 天氣守則',
      condName: '正在下雨',
      btnTrue: '🌧️ 正在下雨',
      btnFalse: '☀️ 豔陽高照',
      thenText: '☂️ 打開雨傘防雨',
      elseText: '🕶️ 戴上帥氣墨鏡',
      robotTrue: '☂️',
      robotFalse: '🕶️',
      descTrue: '下雨了！小嗶打開了黃色雨傘避雨！',
      descFalse: '出太陽了！小嗶戴上帥氣墨鏡出門！',
    },
    {
      title: '🪨 2. 探險障礙',
      condName: '前方有大石頭',
      btnTrue: '🪨 前方有大石頭',
      btnFalse: '🌿 前方一路平坦',
      thenText: '🦘 奮力跳躍過去！',
      elseText: '🚶 邁步向前走',
      robotTrue: '🦘',
      robotFalse: '🚶',
      descTrue: '前面有障礙！小嗶像袋鼠一樣奮力跳躍！',
      descFalse: '道路暢通！小嗶邁開腳步往前走！',
    },
    {
      title: '🪫 3. 機器人電量',
      condName: '電量低於 20%',
      btnTrue: '🪫 電量 15% (低電量)',
      btnFalse: '🔋 電量 90% (充足)',
      thenText: '🔌 快跑去充電插座',
      elseText: '💃 開心轉圈跳舞！',
      robotTrue: '🔌',
      robotFalse: '💃',
      descTrue: '電量不足！小嗶跑去插上充電插座！',
      descFalse: '電量滿滿！小嗶開心轉圈跳起舞來！',
    },
  ];

  host.innerHTML = `
    <div class="ws-panel ws-ifcond">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <!-- Scenario Switch Tabs -->
      <div class="ws-scenario-tabs" id="scenarioTabs">
        ${scenarios.map((sc, i) => `
          <button class="ws-tab-btn ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-pressed="${i === 0}">
            ${escapeHTML(sc.title)}
          </button>
        `).join('')}
      </div>

      <!-- Scratch Block / Flow Chart Code -->
      <div class="ws-code-block">
        <div class="ws-branch-row" id="rowIf">
          <span class="ws-branch-pill ws-pill-if">如果 ( IF )</span>
          <b id="blockCondName">${escapeHTML(scenarios[0].condName)}</b>
        </div>
        <div class="ws-branch-row ws-indent active" id="rowThen">
          <span class="ws-flow-arrow">↳</span>
          <span class="ws-branch-pill ws-pill-then">那麼 ( THEN ) ➔</span>
          <span id="blockThen">${escapeHTML(scenarios[0].thenText)}</span>
        </div>
        <div class="ws-branch-row" id="rowElseTitle">
          <span class="ws-branch-pill ws-pill-else">否則 ( ELSE )</span>
        </div>
        <div class="ws-branch-row ws-indent" id="rowElse">
          <span class="ws-flow-arrow">↳</span>
          <span class="ws-branch-pill ws-pill-then">那麼 ( THEN ) ➔</span>
          <span id="blockElse">${escapeHTML(scenarios[0].elseText)}</span>
        </div>
      </div>

      <!-- Live Simulation Arena -->
      <div class="ws-arena">
        <div class="ws-robot-stage">
          <span class="ws-robot-body" id="robotBody">🤖</span>
          <span class="ws-robot-accessory" id="robotAccessory">☂️</span>
        </div>
        <div class="ws-robot-action-text" id="actionDesc" role="status" aria-live="polite" aria-atomic="true">
          ${escapeHTML(scenarios[0].descTrue)}
        </div>
      </div>

      <!-- Condition Toggles -->
      <div class="ws-if-toggle-zone">
        <button class="ws-btn active" id="btnCondTrue" aria-pressed="true">🌧️ 正在下雨</button>
        <button class="ws-btn" id="btnCondFalse" aria-pressed="false">☀️ 豔陽高照</button>
      </div>

      <div class="ws-stars-track" id="starsTrack">
        <span id="star0">⭐</span>
        <span id="star1">☆</span>
        <span id="star2">☆</span>
        <small style="font-size: max(15px, 0.85rem); font-weight:800; color:var(--ink-2); margin-left:8px">
          完成進度：<span id="progCount">1</span> / 3
        </small>
      </div>

      <div class="ws-status" id="ifStatus" aria-live="polite">
        點擊下方按鈕切換條件，看看小嗶機器人如何根據條件執行不同分支！
      </div>
    </div>
  `;

  let currentTab = 0;
  let isTrue = true;
  const explored = new Set([0]);

  const tabs = host.querySelectorAll('.ws-tab-btn');
  const blockCond = host.querySelector('#blockCondName');
  const blockThen = host.querySelector('#blockThen');
  const blockElse = host.querySelector('#blockElse');
  const rowThen = host.querySelector('#rowThen');
  const rowElse = host.querySelector('#rowElse');
  const robotAccessory = host.querySelector('#robotAccessory');
  const actionDesc = host.querySelector('#actionDesc');
  const btnTrue = host.querySelector('#btnCondTrue');
  const btnFalse = host.querySelector('#btnCondFalse');
  const progCount = host.querySelector('#progCount');
  const statusEl = host.querySelector('#ifStatus');

  const updateUI = () => {
    const sc = scenarios[currentTab];
    blockCond.textContent = sc.condName;
    blockThen.textContent = sc.thenText;
    blockElse.textContent = sc.elseText;
    btnTrue.textContent = sc.btnTrue;
    btnFalse.textContent = sc.btnFalse;
    btnTrue.setAttribute('aria-pressed', String(isTrue));
    btnFalse.setAttribute('aria-pressed', String(!isTrue));

    if (isTrue) {
      rowThen.classList.add('active');
      rowElse.classList.remove('active');
      btnTrue.classList.add('active');
      btnFalse.classList.remove('active');
      robotAccessory.textContent = sc.robotTrue;
      actionDesc.textContent = sc.descTrue;
    } else {
      rowThen.classList.remove('active');
      rowElse.classList.add('active');
      btnTrue.classList.remove('active');
      btnFalse.classList.add('active');
      robotAccessory.textContent = sc.robotFalse;
      actionDesc.textContent = sc.descFalse;
    }
    doPop(robotAccessory);

    // Update explored stars
    explored.add(currentTab);
    progCount.textContent = explored.size;
    for (let i = 0; i < 3; i++) {
      const star = host.querySelector(`#star${i}`);
      if (star) star.textContent = explored.has(i) ? '⭐' : '☆';
    }

    if (explored.size === 3) {
      statusEl.className = 'ws-status good';
      statusEl.textContent = '🎉 太厲害了！你完全掌握了「如果...就...」條件判斷！電腦就是這樣聰明做決定的！';
      api.good();
      api.done();
    }
  };

  // Switch tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', String(t === tab));
      });
      tab.classList.add('active');
      currentTab = Number(tab.dataset.idx);
      isTrue = true;
      api.good();
      updateUI();
    });
  });

  // Toggle true/false condition
  btnTrue.addEventListener('click', () => {
    isTrue = true;
    api.good();
    updateUI();
  });

  btnFalse.addEventListener('click', () => {
    isTrue = false;
    api.good();
    updateUI();
  });
}
