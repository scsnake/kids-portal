// ==========================================================================
// 科技原理小探險 (tech-explorer) - Medium-Priority Redesigns (Batch 1)
// Standard widget signature: export function widgetName(host, params, api)
// API: { good(), bad(), done(), later(fn, ms), alive() }
// Language: Taiwan Mandarin (zh-TW)
// Widgets:
// 1. backpackfit: 【書包收納大挑戰】(devices [Slide 1] 桌機和筆電)
// 2. workbench: 【實體外接工作台】(devices [Slide 4] 輸入還是輸出？)
// 3. charginghazards: 【臥室危險抓抓樂】(battery [Slide 4] 充電安全)
// 4. ewastechute: 【回收管道精準投遞】(ewaste [Slide 0] 舊 3C 要丟哪裡？)
// ==========================================================================

const safeLater = (api, fn, ms) => {
  if (api && typeof api.later === 'function') {
    return api.later(fn, ms);
  }
  return setTimeout(fn, ms);
};

const isAlive = (api) => {
  if (api && typeof api.alive === 'function') {
    return api.alive();
  }
  return true;
};

const doShake = el => {
  if (!el) return;
  el.classList.remove('b1-shake');
  void el.offsetWidth;
  el.classList.add('b1-shake');
};

const doPop = el => {
  if (!el) return;
  el.classList.remove('b1-pop');
  void el.offsetWidth;
  el.classList.add('b1-pop');
};

// ==========================================================================
// 1. backpackfit: 【書包收納大挑戰】
// devices [Slide 1] 桌機和筆電
// ==========================================================================

export function backpackfit(host, _params, api) {
  const ITEMS = [
    { id: 'tower', name: '巨大桌機主機', icon: '🖥️', weight: '12 kg · 🔌 插座專用', portable: false },
    { id: 'monitor', name: '27吋厚重螢幕', icon: '📺', weight: '8 kg · 🔌 插座專用', portable: false },
    { id: 'laptop', name: '輕薄筆電', icon: '💻', weight: '1.3 kg · 🔋 內建電池', portable: true },
    { id: 'tablet', name: '隨身平板', icon: '📱', weight: '0.5 kg · 🔋 內建電池', portable: true },
  ];

  host.innerHTML = `
    <div class="b1-panel b1-backpack">
      <div class="gemini-tag" data-created-by="gemini" data-info="書包收納大挑戰 · 桌機 vs 筆電平板">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b1-header">
        <div class="b1-title-group">
          <span class="b1-title">🎒 書包收納大挑戰</span>
          <span class="b1-badge b1-badge-blue">桌機 vs 筆電平板</span>
        </div>
        <div class="b1-counter" id="bpCounter">已裝入：0 / 2</div>
      </div>

      <div class="b1-backpack-scene">
        <!-- Item Shelf -->
        <div class="b1-shelf-col">
          <div class="b1-shelf-title">請點選要裝進書包的 3C 裝置：</div>
          <div class="b1-items-grid">
            ${ITEMS.map(it => `
              <button class="b1-item-card" data-item="${it.id}" aria-label="收納 ${it.name}">
                <span class="b1-item-icon">${it.icon}</span>
                <span class="b1-item-name">${it.name}</span>
                <span class="b1-item-tag ${it.portable ? 'b1-tag-portable' : 'b1-tag-heavy'}">${it.weight}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Backpack Area -->
        <div class="b1-backpack-col">
          <div class="b1-backpack-visual" id="bpVisual">
            <div class="b1-backpack-handle"></div>
            <div class="b1-backpack-zipper" id="bpZipper">
              <span class="b1-zipper-pull">🤐</span>
              <span class="b1-zipper-track"></span>
              <span class="b1-zipper-label">拉鍊保護</span>
            </div>
            <div class="b1-backpack-pocket" id="bpPocket">
              <div class="b1-pocket-label">🎒 探險上學書包</div>
              <div class="b1-packed-tray" id="bpPackedTray"></div>
              <div class="b1-pocket-tip" id="bpPocketTip">等待放入便攜裝置...</div>
            </div>
            <div class="b1-bonk-effect" id="bpBonk">💥 太大塞不下！</div>
          </div>
        </div>
      </div>

      <div class="b1-status" id="bpStatus" aria-live="polite">
        點選左側裝置，試著把能隨身帶著走的 3C 裝進書包！
      </div>

      <div class="b1-completion-box" id="bpCompletion" style="display: none;">
        <span class="b1-star-trophy">🌟</span>
        <div class="b1-completion-msg">
          <b>恭喜完成收納！</b><br>
          桌機主機和厚重螢幕太大太重、而且一定要插座，適合放家裡書桌；<br>
          筆電與平板輕巧又有內建電池，才能隨身放進書包帶著走！
        </div>
        <button class="b1-btn b1-btn-reset" id="bpResetBtn">🔄 再試一次</button>
      </div>
    </div>
  `;

  const visual = host.querySelector('#bpVisual');
  const bonk = host.querySelector('#bpBonk');
  const packedTray = host.querySelector('#bpPackedTray');
  const pocketTip = host.querySelector('#bpPocketTip');
  const status = host.querySelector('#bpStatus');
  const counter = host.querySelector('#bpCounter');
  const completionBox = host.querySelector('#bpCompletion');
  const resetBtn = host.querySelector('#bpResetBtn');
  const itemBtns = host.querySelectorAll('.b1-item-card');

  const packed = new Set();
  let doneTriggered = false;

  const updateUI = () => {
    counter.textContent = `已裝入：${packed.size} / 2`;
    if (packed.size > 0) {
      pocketTip.style.display = 'none';
    } else {
      pocketTip.style.display = 'block';
    }

    if (packed.size === 2 && !doneTriggered) {
      doneTriggered = true;
      completionBox.style.display = 'flex';
      doPop(completionBox);
      status.className = 'b1-status good';
      status.textContent = '🎉 任務完成！所有便攜裝置都整齊裝進書包了！';
      if (api && typeof api.done === 'function') {
        api.done();
      }
    }
  };

  const handleItemClick = (it, btn) => {
    if (packed.has(it.id)) {
      status.className = 'b1-status';
      status.textContent = `${it.name} 已經在書包裡囉！`;
      return;
    }

    if (!it.portable) {
      // Heavy items: Tower or Monitor
      btn.classList.add('rejected');
      doShake(btn);
      visual.classList.add('rebound');
      bonk.classList.add('show');
      status.className = 'b1-status bad';
      status.textContent = '太重太大了！放不進書包！需要插座，適合放家裡書桌！';

      if (api && typeof api.bad === 'function') {
        api.bad();
      }

      safeLater(api, () => {
        if (!isAlive(api)) return;
        visual.classList.remove('rebound');
        bonk.classList.remove('show');
        btn.classList.remove('rejected');
      }, 700);
    } else {
      // Portable items: Laptop or Tablet
      packed.add(it.id);
      btn.classList.add('packed');
      btn.disabled = true;

      // Zip animation
      visual.classList.remove('zipped');
      void visual.offsetWidth;
      visual.classList.add('zipped');

      const chip = document.createElement('div');
      chip.className = 'b1-packed-chip';
      chip.innerHTML = `<span>${it.icon} ${it.name}</span><span style="color:#2b8a3e;">✅ 裝入</span>`;
      packedTray.appendChild(chip);

      status.className = 'b1-status good';
      status.textContent = '成功放進書包！有內建電池，隨身帶著走！';

      if (api && typeof api.good === 'function') {
        api.good();
      }

      safeLater(api, () => {
        if (!isAlive(api)) return;
        visual.classList.remove('zipped');
      }, 600);

      updateUI();
    }
  };

  itemBtns.forEach(btn => {
    const itId = btn.dataset.item;
    const it = ITEMS.find(item => item.id === itId);
    if (!it) return;
    btn.addEventListener('click', () => handleItemClick(it, btn));
  });

  resetBtn.addEventListener('click', () => {
    packed.clear();
    doneTriggered = false;
    packedTray.innerHTML = '';
    itemBtns.forEach(b => {
      b.classList.remove('packed', 'rejected');
      b.disabled = false;
    });
    completionBox.style.display = 'none';
    status.className = 'b1-status';
    status.textContent = '點選左側裝置，試著把能隨身帶著走的 3C 裝進書包！';
    updateUI();
  });
}

// ==========================================================================
// 2. workbench: 【實體外接工作台】
// devices [Slide 4] 輸入還是輸出？
// ==========================================================================

export function workbench(host, _params, api) {
  const PERIPHERALS = [
    {
      id: 'mic',
      name: '麥克風',
      icon: '🎙️',
      type: 'in',
      typeName: '輸入裝置',
      flowIcon: '〰️ 🎙️ 〰️',
      flowAnim: 'b1-stream-in',
      screenMsg: '【收到聲音波形】🎙️ 「喂喂喂！收到小朋友說話聲音！」',
      statusMsg: '🎙️ 聲音送進電腦：這是【輸入裝置】！',
    },
    {
      id: 'kbd',
      name: '鍵盤',
      icon: '⌨️',
      type: 'in',
      typeName: '輸入裝置',
      flowIcon: '🔤 A B C ⌨️',
      flowAnim: 'b1-stream-in',
      screenMsg: '【收到鍵盤按鍵】⌨️ 「Hello World! 打字訊號已接收！」',
      statusMsg: '⌨️ 打字信號送進電腦：這是【輸入裝置】！',
    },
    {
      id: 'printer',
      name: '印表機',
      icon: '🖨️',
      type: 'out',
      typeName: '輸出裝置',
      flowIcon: '📄 🌈 🖼️',
      flowAnim: 'b1-stream-out',
      screenMsg: '【傳送列印任務】🖨️ 「彩色圖畫印出紙張完成！」',
      statusMsg: '🖨️ 電腦把圖畫印出來：這是【輸出裝置】！',
    },
    {
      id: 'headphones',
      name: '耳機',
      icon: '🎧',
      type: 'out',
      typeName: '輸出裝置',
      flowIcon: '🎵 🎶 ✨',
      flowAnim: 'b1-stream-out',
      screenMsg: '【播放音訊串流】🎧 「悠揚動聽的音樂傳送到耳機！」',
      statusMsg: '🎧 電腦把音樂播出來：這是【輸出裝置】！',
    },
  ];

  host.innerHTML = `
    <div class="b1-panel b1-workbench">
      <div class="gemini-tag" data-created-by="gemini" data-info="實體外接工作台 · 輸入與輸出裝置">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b1-header">
        <div class="b1-title-group">
          <span class="b1-title">🔌 實體外接工作台</span>
          <span class="b1-badge b1-badge-blue">輸入還是輸出？</span>
        </div>
        <div class="b1-counter" id="wbCounter">已探索：0 / 4</div>
      </div>

      <div class="b1-wb-scene">
        <!-- Central Computer Terminal -->
        <div class="b1-wb-terminal">
          <div class="b1-wb-screen-top">
            <span class="b1-wb-screen-title">🖥️ 探險電腦主機工作站</span>
            <div class="b1-wb-dots">
              <span class="b1-wb-dot red"></span>
              <span class="b1-wb-dot yellow"></span>
              <span class="b1-wb-dot green"></span>
            </div>
          </div>
          <div class="b1-wb-screen-content">
            <div class="b1-wb-screen-msg" id="wbScreenMsg">待機中，請點選下方外接設備連接工作台</div>
            <div class="b1-wb-anim-stage" id="wbAnimStage">💡 隨插即用</div>
          </div>
        </div>

        <!-- Connection Ports -->
        <div class="b1-wb-ports-row">
          <div class="b1-wb-port-box b1-port-in" id="portIn">
            <span class="b1-wb-port-title">📥 輸入插孔 (Input)</span>
            <div class="b1-wb-socket"><div class="b1-wb-socket-pins"></div></div>
            <span class="b1-wb-port-status" id="portInStatus">把信號送進電腦</span>
          </div>
          <div class="b1-wb-port-box b1-port-out" id="portOut">
            <span class="b1-wb-port-title">📤 輸出插孔 (Output)</span>
            <div class="b1-wb-socket"><div class="b1-wb-socket-pins"></div></div>
            <span class="b1-wb-port-status" id="portOutStatus">把結果送出給我們</span>
          </div>
        </div>

        <!-- Peripherals Shelf -->
        <div class="b1-wb-shelf">
          <div class="b1-wb-shelf-label">外接周邊配件架（點選測試插上電腦）：</div>
          <div class="b1-wb-peripherals">
            ${PERIPHERALS.map(p => `
              <button class="b1-wb-dev-btn" data-dev="${p.id}" aria-label="連接 ${p.name}">
                <span class="b1-wb-dev-icon">${p.icon}</span>
                <span class="b1-wb-dev-name">${p.name}</span>
                <span class="b1-wb-dev-tested-badge" id="badge-${p.id}" style="display: none;">已測試</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="b1-status" id="wbStatus" aria-live="polite">
        點選任一個外接設備，觀察訊號是送進去還是送出來！
      </div>

      <div class="b1-completion-box" id="wbCompletion" style="display: none;">
        <span class="b1-star-trophy">🌟</span>
        <div class="b1-completion-msg">
          <b>太厲害了！全部搞懂囉！</b><br>
          把聲音和指令送進去的是【輸入裝置】（麥克風、鍵盤）；<br>
          把畫面、音樂和紙張送出來的是【輸出裝置】（耳機、印表機）！
        </div>
        <button class="b1-btn b1-btn-reset" id="wbResetBtn">🔄 再試一次</button>
      </div>
    </div>
  `;

  const portIn = host.querySelector('#portIn');
  const portOut = host.querySelector('#portOut');
  const portInStatus = host.querySelector('#portInStatus');
  const portOutStatus = host.querySelector('#portOutStatus');
  const screenMsg = host.querySelector('#wbScreenMsg');
  const animStage = host.querySelector('#wbAnimStage');
  const status = host.querySelector('#wbStatus');
  const counter = host.querySelector('#wbCounter');
  const completionBox = host.querySelector('#wbCompletion');
  const resetBtn = host.querySelector('#wbResetBtn');
  const devBtns = host.querySelectorAll('.b1-wb-dev-btn');

  const tested = new Set();
  let doneTriggered = false;

  const testPeripheral = (p, btn) => {
    // Reset previous actives
    devBtns.forEach(b => b.classList.remove('active'));
    portIn.classList.remove('active');
    portOut.classList.remove('active');

    btn.classList.add('active', 'tested');
    tested.add(p.id);

    const devBadge = host.querySelector(`#badge-${p.id}`);
    if (devBadge) devBadge.style.display = 'inline-block';

    counter.textContent = `已探索：${tested.size} / 4`;

    if (p.type === 'in') {
      portIn.classList.add('active');
      portInStatus.textContent = `⚡ 正在傳入 ${p.name} 訊號`;
      portOutStatus.textContent = '待命中';
    } else {
      portOut.classList.add('active');
      portOutStatus.textContent = `⚡ 電腦正在送出到 ${p.name}`;
      portInStatus.textContent = '待命中';
    }

    screenMsg.textContent = p.screenMsg;
    animStage.innerHTML = `<span class="${p.flowAnim}">${p.flowIcon}</span>`;

    status.className = 'b1-status good';
    status.textContent = p.statusMsg;

    if (api && typeof api.good === 'function') {
      api.good();
    }

    if (tested.size === 4 && !doneTriggered) {
      doneTriggered = true;
      completionBox.style.display = 'flex';
      doPop(completionBox);
      if (api && typeof api.done === 'function') {
        api.done();
      }
    }
  };

  devBtns.forEach(btn => {
    const devId = btn.dataset.dev;
    const p = PERIPHERALS.find(item => item.id === devId);
    if (!p) return;
    btn.addEventListener('click', () => testPeripheral(p, btn));
  });

  resetBtn.addEventListener('click', () => {
    tested.clear();
    doneTriggered = false;
    counter.textContent = '已探索：0 / 4';
    devBtns.forEach(b => {
      b.classList.remove('active', 'tested');
    });
    PERIPHERALS.forEach(p => {
      const b = host.querySelector(`#badge-${p.id}`);
      if (b) b.style.display = 'none';
    });
    portIn.classList.remove('active');
    portOut.classList.remove('active');
    portInStatus.textContent = '把信號送進電腦';
    portOutStatus.textContent = '把結果送出給我們';
    screenMsg.textContent = '待機中，請點選下方外接設備連接工作台';
    animStage.innerHTML = '💡 隨插即用';
    completionBox.style.display = 'none';
    status.className = 'b1-status';
    status.textContent = '點選任一個外接設備，觀察訊號是送進去還是送出來！';
  });
}

// ==========================================================================
// 3. charginghazards: 【臥室危險抓抓樂】
// battery [Slide 4] 充電安全
// ==========================================================================

export function charginghazards(host, _params, api) {
  host.innerHTML = `
    <div class="b1-panel b1-hazards">
      <div class="gemini-tag" data-created-by="gemini" data-info="臥室危險抓抓樂 · 電池與充電安全">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b1-header">
        <div class="b1-title-group">
          <span class="b1-title">🛏️ 臥室危險抓抓樂</span>
          <span class="b1-badge b1-badge-blue">充電安全大掃除</span>
        </div>
        <div class="b1-counter" id="hzCounter">已消除隱患：0 / 3</div>
      </div>

      <div class="b1-hazards-scene" id="hzScene">
        <div class="b1-room-bg-window">🌙✨</div>

        <!-- Safe Wooden Desk -->
        <div class="b1-safe-desk">
          <div class="b1-desk-header">🪵 空曠通風書桌</div>
          <div class="b1-desk-surface" id="deskSurface">
            <span class="b1-desk-phone-slot" id="deskSlot">等待安全放置</span>
          </div>
        </div>

        <!-- Cozy Bed -->
        <div class="b1-room-bed">
          <div class="b1-bed-headboard"></div>
          <div class="b1-bed-mattress">
            <div class="b1-pillow"></div>
            <div class="b1-blanket"></div>

            <!-- Hazard 1: Phone Overheating under pillow -->
            <button class="b1-hz-phone-btn" id="hzPhoneBtn" aria-label="排查枕頭下發燙手機">
              <span id="hzPhoneIcon">♨️ 📱</span>
              <span class="b1-hz-tag b1-hz-tag-danger" id="hzPhoneTag">85°C 散熱差</span>
            </button>
          </div>
        </div>

        <!-- Carpet Floor Area -->
        <div class="b1-room-carpet">
          <!-- Hazard 2: Frayed Wire -->
          <button class="b1-hz-wire-btn sparking" id="hzWireBtn" aria-label="修復破損露出銅線的電線">
            <span>⚡ <span id="wireDesc">破損露出銅線</span></span>
            <span class="b1-hz-tag b1-hz-tag-danger" id="hzWireTag">漏電危險</span>
          </button>

          <!-- Hazard 3: Overloaded Power Strip -->
          <button class="b1-hz-strip-btn overloaded" id="hzStripBtn" aria-label="排查插滿電器的延長線">
            <span>🔌 <span id="stripDesc">延長線插滿 6 個大電器</span></span>
            <span class="b1-hz-tag b1-hz-tag-danger" id="hzStripTag">負載超標</span>
          </button>
        </div>

        <div class="b1-peace-shield" id="peaceShield" style="display: none;">
          🛡️ 安全防護完成！睡覺好安心！
        </div>
      </div>

      <div class="b1-status" id="hzStatus" aria-live="polite">
        臥室裡有 3 個危險的充電習慣，點點看畫面把它們修復吧！
      </div>

      <div class="b1-completion-box" id="hzCompletion" style="display: none;">
        <span class="b1-star-trophy">🌟</span>
        <div class="b1-completion-msg">
          <b>太棒了！臥室充電安全滿分！</b><br>
          手機放在通風硬桌上充電、換掉破損漏充電線、拔掉多餘大電器，<br>
          守護全家人的用電安全，夜晚睡得最安心！
        </div>
        <button class="b1-btn b1-btn-reset" id="hzResetBtn">🔄 再試一次</button>
      </div>
    </div>
  `;

  const scene = host.querySelector('#hzScene');
  const deskSlot = host.querySelector('#deskSlot');
  const hzPhoneBtn = host.querySelector('#hzPhoneBtn');
  const hzPhoneIcon = host.querySelector('#hzPhoneIcon');
  const hzPhoneTag = host.querySelector('#hzPhoneTag');

  const hzWireBtn = host.querySelector('#hzWireBtn');
  const wireDesc = host.querySelector('#wireDesc');
  const hzWireTag = host.querySelector('#hzWireTag');

  const hzStripBtn = host.querySelector('#hzStripBtn');
  const stripDesc = host.querySelector('#stripDesc');
  const hzStripTag = host.querySelector('#hzStripTag');

  const peaceShield = host.querySelector('#peaceShield');
  const status = host.querySelector('#hzStatus');
  const counter = host.querySelector('#hzCounter');
  const completionBox = host.querySelector('#hzCompletion');
  const resetBtn = host.querySelector('#hzResetBtn');

  const fixed = new Set();
  let doneTriggered = false;

  const checkAllFixed = () => {
    counter.textContent = `已消除隱患：${fixed.size} / 3`;
    if (fixed.size === 3 && !doneTriggered) {
      doneTriggered = true;
      scene.classList.add('all-safe');
      peaceShield.style.display = 'flex';
      completionBox.style.display = 'flex';
      doPop(peaceShield);
      doPop(completionBox);
      status.className = 'b1-status good';
      status.textContent = '🎉 臥室 3 大充電危險全部排除！睡覺好安心！';

      if (api && typeof api.done === 'function') {
        api.done();
      }
    }
  };

  // Hazard 1: Phone under pillow
  hzPhoneBtn.addEventListener('click', () => {
    if (fixed.has('phone')) return;
    fixed.add('phone');
    hzPhoneBtn.classList.add('fixed');
    hzPhoneIcon.textContent = '📱 ❄️';
    hzPhoneTag.className = 'b1-hz-tag b1-hz-tag-safe';
    hzPhoneTag.textContent = '35°C 涼爽';

    // Move to wooden desk
    deskSlot.innerHTML = '📱 💨 通風充電中';
    hzPhoneBtn.style.position = 'static';
    deskSlot.innerHTML = '';
    deskSlot.appendChild(hzPhoneBtn);

    status.className = 'b1-status good';
    status.textContent = '移到通風桌上！不再發燙！散熱良好才安全！';

    if (api && typeof api.good === 'function') {
      api.good();
    }
    checkAllFixed();
  });

  // Hazard 2: Frayed Wire
  hzWireBtn.addEventListener('click', () => {
    if (fixed.has('wire')) return;
    fixed.add('wire');
    hzWireBtn.classList.remove('sparking');
    hzWireBtn.classList.add('fixed');
    wireDesc.textContent = '換上全新絕緣編織線';
    hzWireTag.className = 'b1-hz-tag b1-hz-tag-safe';
    hzWireTag.textContent = '安全絕緣';

    status.className = 'b1-status good';
    status.textContent = '換成完整絕緣電線！不再漏電！遠離觸電與走火！';

    if (api && typeof api.good === 'function') {
      api.good();
    }
    checkAllFixed();
  });

  // Hazard 3: Overloaded Power Strip
  hzStripBtn.addEventListener('click', () => {
    if (fixed.has('strip')) return;
    fixed.add('strip');
    hzStripBtn.classList.remove('overloaded');
    hzStripBtn.classList.add('fixed');
    stripDesc.textContent = '拔掉大電器，只留 1 個專用充電器';
    hzStripTag.className = 'b1-hz-tag b1-hz-tag-safe';
    hzStripTag.textContent = '負載安全 20%';

    status.className = 'b1-status good';
    status.textContent = '拔掉多餘插頭！避免電線走火！一條延長線不插太多大電器！';

    if (api && typeof api.good === 'function') {
      api.good();
    }
    checkAllFixed();
  });

  resetBtn.addEventListener('click', () => {
    fixed.clear();
    doneTriggered = false;
    scene.classList.remove('all-safe');
    peaceShield.style.display = 'none';
    completionBox.style.display = 'none';

    // Reset phone
    const bedMattress = host.querySelector('.b1-bed-mattress');
    hzPhoneBtn.style.position = 'absolute';
    hzPhoneBtn.classList.remove('fixed');
    hzPhoneIcon.textContent = '♨️ 📱';
    hzPhoneTag.className = 'b1-hz-tag b1-hz-tag-danger';
    hzPhoneTag.textContent = '85°C 散熱差';
    bedMattress.appendChild(hzPhoneBtn);
    deskSlot.textContent = '等待安全放置';

    // Reset wire
    hzWireBtn.classList.add('sparking');
    hzWireBtn.classList.remove('fixed');
    wireDesc.textContent = '破損露出銅線';
    hzWireTag.className = 'b1-hz-tag b1-hz-tag-danger';
    hzWireTag.textContent = '漏電危險';

    // Reset strip
    hzStripBtn.classList.add('overloaded');
    hzStripBtn.classList.remove('fixed');
    stripDesc.textContent = '延長線插滿 6 個大電器';
    hzStripTag.className = 'b1-hz-tag b1-hz-tag-danger';
    hzStripTag.textContent = '負載超標';

    counter.textContent = '已消除隱患：0 / 3';
    status.className = 'b1-status';
    status.textContent = '臥室裡有 3 個危險的充電習慣，點點看畫面把它們修復吧！';
  });
}

// ==========================================================================
// 4. ewastechute: 【回收管道精準投遞】
// ewaste [Slide 0] 舊 3C 要丟哪裡？
// ==========================================================================

