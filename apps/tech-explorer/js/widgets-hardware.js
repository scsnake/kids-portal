// ==========================================================================
// 科技原理小探險 (tech-explorer) - 硬體與裝置探索 (Group A: Hardware, Storage, GPU)
// Standard widget signature: (host, params, api) => void
// API: { good(), bad(), done(), later(fn, ms), alive() }
// Language: Taiwan Mandarin (zh-TW)
// ==========================================================================

const safeLater = (api, fn, ms) => {
  if (api && typeof api.later === 'function') {
    return api.later(fn, ms);
  }
  return setTimeout(fn, ms);
};

const pop = el => {
  if (!el) return;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
};

const shake = el => {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
};

const isReducedMotion = () => {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// --------------------------------------------------------------------------
// 1. juicebox: 「電腦是什麼？」 (Input -> Process -> Output)
// --------------------------------------------------------------------------

export function juicebox(host, params, api) {
  const FRUITS = [
    { id: 'apple', icon: '🍎', name: '蘋果', juice: '蘋果汁' },
    { id: 'orange', icon: '🍊', name: '柳丁', juice: '柳丁汁' },
    { id: 'carrot', icon: '🥕', name: '紅蘿蔔', juice: '綜合蔬果汁' },
  ];

  host.innerHTML = `
    <div class="hw-panel hw-juicebox">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-jb-steps" aria-label="運作流程">
        <div class="hw-jb-step active" data-step="1">📥 1. 輸入（收到水果）</div>
        <span class="hw-jb-arrow">➔</span>
        <div class="hw-jb-step" data-step="2">⚙️ 2. 處理（想一想）</div>
        <span class="hw-jb-arrow">➔</span>
        <div class="hw-jb-step" data-step="3">📤 3. 輸出（送出果汁）</div>
      </div>

      <div class="hw-jb-stage">
        <!-- Input Fruit Basket -->
        <div class="hw-jb-zone">
          <div class="hw-jb-zone-title">點選或投入水果</div>
          <div class="hw-jb-fruits">
            ${FRUITS.map(f => `
              <button class="hw-jb-fruit-btn" data-fruit="${f.id}" aria-label="投入${f.name}">
                <span class="hw-jb-fruit-icon">${f.icon}</span>
                <span>${f.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Juicer / Processing Machine -->
        <div class="hw-jb-machine">
          <div class="hw-jb-hopper" data-zone="hopper">📥 投入漏斗</div>
          <div class="hw-jb-chamber">
            <div class="hw-jb-gears">
              <span class="hw-jb-gear">⚙️</span>
              <span class="hw-jb-gear">⚙️</span>
            </div>
            <div class="hw-jb-circuits">✨ 💡 ✨</div>
            <div class="hw-jb-screen">待機中，請投入水果</div>
            <div class="hw-jb-meter"><div class="hw-jb-meter-fill"></div></div>
          </div>
        </div>

        <!-- Output Tray -->
        <div class="hw-jb-zone">
          <div class="hw-jb-zone-title">輸出成品區</div>
          <div class="hw-jb-tray">
            ${FRUITS.map(f => `
              <div class="hw-jb-cup-slot" data-slot="${f.id}">
                <span class="hw-jb-cup-icon">🧃</span>
                <span>${f.juice}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <p class="hw-status" aria-live="polite">請點選一顆水果，放入漏斗讓電腦處理！</p>
    </div>
  `;

  const status = host.querySelector('.hw-status');
  const machine = host.querySelector('.hw-jb-machine');
  const screen = host.querySelector('.hw-jb-screen');
  const meterFill = host.querySelector('.hw-jb-meter-fill');
  const steps = host.querySelectorAll('.hw-jb-step');
  const hopper = host.querySelector('.hw-jb-hopper');

  const juiced = new Set();
  let isProcessing = false;

  const setStep = n => {
    steps.forEach(s => s.classList.toggle('active', s.dataset.step === String(n)));
  };

  const processFruit = fruitId => {
    if (isProcessing || juiced.has(fruitId)) return;
    const fruit = FRUITS.find(f => f.id === fruitId);
    if (!fruit) return;

    isProcessing = true;
    setStep(2);
    machine.classList.add('processing');
    hopper.classList.add('pulse');
    screen.textContent = `⚙️ 想一想... 正在處理「${fruit.name}」！`;
    meterFill.style.width = '100%';

    const delay = isReducedMotion() ? 150 : 1200;

    safeLater(api, () => {
      machine.classList.remove('processing');
      hopper.classList.remove('pulse');
      meterFill.style.width = '0%';
      screen.textContent = `✅ 榨好「${fruit.juice}」！`;

      // Update Fruit button
      const fruitBtn = host.querySelector(`[data-fruit="${fruit.id}"]`);
      if (fruitBtn) {
        fruitBtn.classList.add('done');
        fruitBtn.disabled = true;
      }

      // Update Tray slot
      const slot = host.querySelector(`[data-slot="${fruit.id}"]`);
      if (slot) {
        slot.classList.add('filled');
        pop(slot);
      }

      setStep(3);
      api.good?.();
      juiced.add(fruit.id);
      isProcessing = false;

      if (juiced.size === FRUITS.length) {
        status.className = 'hw-status good';
        status.textContent = '🎉 太棒了！輸入水果 ➔ 處理想一想 ➔ 輸出果汁！每一台電腦都是這樣：收到指令，大腦想一想處理，再把結果送出去！';
        steps.forEach(s => s.classList.add('active'));
        api.done?.();
      } else {
        status.textContent = `太棒了！已做出 ${juiced.size}/3 種果汁，再選一顆水果試試看！`;
      }
    }, delay);
  };

  // Support both Drag-and-Drop and Direct Tap
  host.querySelectorAll('.hw-jb-fruit-btn').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      if (btn.disabled || isProcessing || e.button > 0) return;
      const fruitId = btn.dataset.fruit;
      const sx = e.clientX, sy = e.clientY, id = e.pointerId;
      let moved = false;
      const hopperEl = host.querySelector('[data-zone="hopper"]');

      const move = ev => {
        if (ev.pointerId !== id) return;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 8) return;
        if (!moved) {
          moved = true;
          btn.classList.add('dragging');
        }
        btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
        if (hopperEl && hopperEl.getBoundingClientRect) {
          const rect = hopperEl.getBoundingClientRect();
          const over = ev.clientX >= rect.left && ev.clientX <= rect.right &&
                       ev.clientY >= rect.top && ev.clientY <= rect.bottom;
          hopperEl.classList.toggle('over', over);
        }
      };

      const up = ev => {
        if (ev.pointerId !== id) return;
        window.removeEventListener?.('pointermove', move);
        window.removeEventListener?.('pointerup', up);
        window.removeEventListener?.('pointercancel', up);
        btn.classList.remove('dragging');
        btn.style.transform = '';
        let droppedOnHopper = false;
        if (hopperEl && hopperEl.getBoundingClientRect) {
          const rect = hopperEl.getBoundingClientRect();
          droppedOnHopper = ev.clientX >= rect.left && ev.clientX <= rect.right &&
                            ev.clientY >= rect.top && ev.clientY <= rect.bottom;
          hopperEl.classList.remove('over');
        }
        if (!moved || droppedOnHopper) {
          processFruit(fruitId);
        }
      };

      window.addEventListener?.('pointermove', move);
      window.addEventListener?.('pointerup', up);
      window.addEventListener?.('pointercancel', up);
    });

    btn.addEventListener('click', () => {
      if (!isProcessing) processFruit(btn.dataset.fruit);
    });
  });
}

// --------------------------------------------------------------------------
// 2. phonepeek: 「口袋裡的電腦」
// --------------------------------------------------------------------------

export function phonepeek(host, params, api) {
  const CHIPS = [
    {
      id: 'cpu',
      icon: '🧠',
      name: 'CPU 處理器',
      desc: '電腦的大腦！體積只有指甲大，每秒鐘能算幾十億次數學，手機才能滑得超快！',
      top: 15,
    },
    {
      id: 'battery',
      icon: '🔋',
      name: '鋰電池',
      desc: '比桌上主機的插頭方便！把電裝在隨身輕薄電池裡，出門一整天隨時有電！',
      top: 95,
    },
    {
      id: 'sensors',
      icon: '🪟',
      name: '觸控螢幕與感測器',
      desc: '看得到也摸得到！螢幕把鍵盤和滑鼠合為一體，陀螺儀還知道你把手機橫放還是直放！',
      top: 175,
    },
  ];

  host.innerHTML = `
    <div class="hw-panel hw-phonepeek">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-phonepeek-layout">
        <!-- Phone Frame with X-Ray Chips & Beam -->
        <div class="hw-pp-phone-wrap">
          <div class="hw-pp-phone" aria-label="手機透視圖">
            <div class="hw-pp-notch"></div>
            <div class="hw-pp-screen-content">
              <div class="hw-pp-xray-beam" style="top:15px;"></div>
              ${CHIPS.map((c, i) => `
                <button class="hw-pp-chip ${i === 0 ? 'active found' : ''}" data-chip="${c.id}" data-idx="${i}">
                  <span class="hw-pp-chip-icon">${c.icon}</span>
                  <span class="hw-pp-chip-name">${c.name}</span>
                </button>
              `).join('')}
            </div>
            <div class="hw-pp-home-bar"></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;max-width:170px;">
            <span style="color:var(--ink-2);font-weight:800;font-size: max(15px, 0.85rem);">🩻 X-Ray 透視滑桿</span>
            <input type="range" class="hw-pp-xray-range hw-pp-range" min="0" max="2" value="0" step="1" aria-label="透視手機內部">
          </div>
        </div>

        <!-- Details & Shrink Slider -->
        <div class="hw-pp-details">
          <div class="hw-pp-card">
            <div class="hw-pp-card-title">${CHIPS[0].icon} ${CHIPS[0].name}</div>
            <p class="hw-pp-card-desc">${CHIPS[0].desc}</p>
          </div>

          <div class="hw-pp-shrink-box">
            <div class="hw-pp-shrink-header">
              <span>🖥️ 縮小滑桿：把大電腦縮成口袋機</span>
              <b class="hw-pp-percent">100%</b>
            </div>
            <input type="range" class="hw-pp-range hw-pp-shrink-range" min="15" max="100" value="100" aria-label="縮小電腦尺寸">
            <div class="hw-pp-morph-visual">🖥️ 大主機 (10kg) + 螢幕 + 粗電源線 + 鍵盤滑鼠</div>
          </div>
        </div>
      </div>

      <p class="hw-status" aria-live="polite">滑動 X-Ray 透視鏡找出 3 個零件，並將滑桿拉到 15% 裝進口袋！</p>
    </div>
  `;

  const found = new Set(['cpu']);
  let hasShrunk = false;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const cardTitle = host.querySelector('.hw-pp-card-title');
  const cardDesc = host.querySelector('.hw-pp-card-desc');
  const shrinkRange = host.querySelector('.hw-pp-shrink-range');
  const xrayRange = host.querySelector('.hw-pp-xray-range');
  const xrayBeam = host.querySelector('.hw-pp-xray-beam');
  const percentText = host.querySelector('.hw-pp-percent');
  const morphVisual = host.querySelector('.hw-pp-morph-visual');
  const chipBtns = host.querySelectorAll('.hw-pp-chip');

  const checkDone = () => {
    if (finished) return;
    if (found.size === CHIPS.length && hasShrunk) {
      finished = true;
      status.className = 'hw-status good';
      status.textContent = '🎉 太神奇了！你找到了大腦、電池與螢幕，並把大電腦縮小放進口袋！手機就是一台迷你的超級電腦！';
      api.done?.();
    } else if (found.size === CHIPS.length) {
      status.textContent = '3 個零件都找到了！再把縮小滑桿拉到 15%，裝進口袋！';
    } else if (hasShrunk) {
      status.textContent = `已縮小到口袋尺寸！還剩下 ${CHIPS.length - found.size} 個手機零件還沒點開！`;
    }
  };

  const selectChip = index => {
    const chip = CHIPS[index];
    if (!chip) return;

    chipBtns.forEach((b, i) => b.classList.toggle('active', i === index));
    const targetBtn = chipBtns[index];
    if (targetBtn) {
      targetBtn.classList.add('found');
      pop(targetBtn);
    }

    if (xrayBeam) {
      xrayBeam.style.top = `${chip.top}px`;
    }
    if (xrayRange) {
      xrayRange.value = String(index);
    }

    cardTitle.innerHTML = `${chip.icon} ${chip.name}`;
    cardDesc.textContent = chip.desc;

    api.good?.();
    found.add(chip.id);
    checkDone();
  };

  // Chip direct click
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      selectChip(idx);
    });
  });

  // X-Ray Slider input
  xrayRange?.addEventListener('input', e => {
    const idx = parseInt(e.target.value, 10);
    selectChip(idx);
  });

  // Shrink Slider
  shrinkRange?.addEventListener('input', e => {
    const val = parseInt(e.target.value, 10);
    percentText.textContent = `${val}%`;

    if (val > 70) {
      morphVisual.innerHTML = '🖥️ <b>桌上型大電腦</b><br><small>巨大主機 (10kg) + 27吋螢幕 + 粗電源線 + 鍵盤滑鼠</small>';
      morphVisual.style.transform = 'scale(1)';
    } else if (val > 35) {
      morphVisual.innerHTML = '💻 <b>筆記型電腦</b><br><small>主機與螢幕摺疊在一起，但還是需要背包裝著走</small>';
      morphVisual.style.transform = 'scale(0.95)';
    } else if (val > 20) {
      morphVisual.innerHTML = '📱 <b>掌上小平板</b><br><small>拿在手上剛剛好，不用再插著電源線</small>';
      morphVisual.style.transform = 'scale(0.9)';
    } else {
      morphVisual.innerHTML = '👖 <b>口袋手機！</b><br><small>極致微型化！整台電腦咻一下滑進牛仔褲口袋！</small>';
      morphVisual.style.transform = 'scale(0.85)';
      if (!hasShrunk) {
        hasShrunk = true;
        pop(morphVisual);
        api.good?.();
      }
    }
    checkDone();
  });
}

// --------------------------------------------------------------------------
// 3. hddseek: 「硬碟：會轉的圓盤」
// --------------------------------------------------------------------------

export function hddseek(host, params, api) {
  const TRACKS = [
    { id: 'photo', name: '照片', trackName: '內圈軌道', angle: 16, radius: 45, icon: '📸' },
    { id: 'music', name: '音樂', trackName: '中圈軌道', angle: 27, radius: 75, icon: '🎵' },
    { id: 'game', name: '遊戲', trackName: '外圈軌道', angle: 38, radius: 105, icon: '🎮' },
  ];

  host.innerHTML = `
    <div class="hw-panel hw-hddseek">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-hdd-enclosure">
        <svg class="hw-hdd-svg" viewBox="0 0 380 280">
          <defs>
            <radialGradient id="platterGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#868e96" />
              <stop offset="40%" stop-color="#ced4da" />
              <stop offset="70%" stop-color="#adb5bd" />
              <stop offset="100%" stop-color="#495057" />
            </radialGradient>
          </defs>

          <!-- Magnetic Platter (Spinning) -->
          <g class="hw-hdd-platter-group">
            <circle cx="150" cy="140" r="120" fill="url(#platterGrad)" stroke="#343a40" stroke-width="2" />
            <!-- Track rings -->
            <circle cx="150" cy="140" r="105" fill="none" stroke="#f1f3f5" stroke-dasharray="6,4" stroke-width="2" opacity="0.8" />
            <circle cx="150" cy="140" r="75" fill="none" stroke="#f1f3f5" stroke-dasharray="6,4" stroke-width="2" opacity="0.8" />
            <circle cx="150" cy="140" r="45" fill="none" stroke="#f1f3f5" stroke-dasharray="6,4" stroke-width="2" opacity="0.8" />
            <!-- Spindle Center -->
            <circle cx="150" cy="140" r="24" fill="#dee2e6" stroke="#495057" stroke-width="3" />
            <circle cx="150" cy="140" r="8" fill="#212529" />
            <!-- Scratch mark (hidden initially) -->
            <path class="hw-hdd-scratch" d="M 80 120 Q 150 180 220 130" stroke="#e03131" stroke-width="4" stroke-linecap="round" fill="none" style="display:none;" />
          </g>

          <!-- Mechanical Arm (Pivot at 290, 40) -->
          <g class="hw-hdd-arm-group" transform="rotate(0 290 40)">
            <!-- Arm Base / Actuator -->
            <circle cx="290" cy="40" r="20" fill="#495057" stroke="#212529" stroke-width="3" />
            <circle cx="290" cy="40" r="7" fill="#ced4da" />
            <!-- Arm Blade -->
            <polygon points="290,34 290,46 150,143 148,137" fill="#adb5bd" stroke="#343a40" stroke-width="1.5" />
            <!-- Head Slider Tip -->
            <rect x="142" y="136" width="10" height="7" rx="1.5" fill="#f59f00" stroke="#d9480f" stroke-width="1" />
            <circle cx="145" cy="139" r="2" fill="#e03131" />
          </g>
        </svg>
        <div class="hw-hdd-sparks" style="top:120px;left:130px;">💥 ✨</div>
      </div>

      <!-- File Select Buttons -->
      <div class="hw-hdd-files">
        ${TRACKS.map(t => `
          <button class="hw-hdd-file-btn" data-track="${t.id}">
            <span>${t.icon} ${t.name}</span>
            <small style="display:block;font-size: max(15px, 0.8rem);color:var(--ink-2);">${t.trackName}</small>
          </button>
        `).join('')}
      </div>

      <!-- Shock Action & Reset -->
      <div class="hw-actions">
        <button class="hw-btn danger hw-hdd-shock-btn">💥 摔到筆電／劇烈震動！</button>
        <button class="hw-btn hw-hdd-repair-btn" style="display:none;">🔧 換新硬碟重來</button>
      </div>

      <div class="hw-hdd-alert" style="display:none;"></div>
      <p class="hw-status" aria-live="polite">點選檔案讀取資料，並測試摔到筆電會發生什麼事！</p>
    </div>
  `;

  const readTracks = new Set();
  let shockTested = false;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const armGroup = host.querySelector('.hw-hdd-arm-group');
  const platterGroup = host.querySelector('.hw-hdd-platter-group');
  const scratchPath = host.querySelector('.hw-hdd-scratch');
  const sparks = host.querySelector('.hw-hdd-sparks');
  const alertBox = host.querySelector('.hw-hdd-alert');
  const enclosure = host.querySelector('.hw-hdd-enclosure');
  const repairBtn = host.querySelector('.hw-hdd-repair-btn');

  const checkDone = () => {
    if (finished) return;
    if (readTracks.size === TRACKS.length && shockTested) {
      finished = true;
      status.className = 'hw-status good';
      status.textContent = '🎉 你發現了！機械硬碟靠轉動圓盤與機械臂讀取，運作時最怕搖晃摔倒！這也是為什麼現代電腦大多改用 SSD 囉！';
      api.done?.();
    }
  };

  // Track button click
  host.querySelectorAll('.hw-hdd-file-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.track;
      const t = TRACKS.find(item => item.id === trackId);
      if (!t) return;

      host.querySelectorAll('.hw-hdd-file-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.classList.add('read');

      armGroup.style.transform = `rotate(${t.angle}deg)`;
      readTracks.add(t.id);
      pop(btn);
      api.good?.();

      status.textContent = `🎯 機械臂滑動到【${t.trackName}】，成功讀取「${t.icon} ${t.name}」！`;
      checkDone();
    });
  });

  // Shock button click
  host.querySelector('.hw-hdd-shock-btn').addEventListener('click', () => {
    shockTested = true;
    shake(enclosure);
    api.bad?.();

    // Show scratch and sparks
    scratchPath.style.display = 'block';
    platterGroup.classList.add('scratched');
    sparks.classList.add('active');
    repairBtn.style.display = 'inline-flex';

    safeLater(api, () => {
      sparks.classList.remove('active');
    }, 700);

    alertBox.style.display = 'block';
    alertBox.innerHTML = '⚠️ <b>危險！機械零件最怕震動！</b><br>圓盤每分鐘轉 7200 圈，機械臂被震歪直接刮傷圓盤，造成「壞軌」，裡面的檔案就讀不到了！';
    status.className = 'hw-status bad';
    status.textContent = '⚠️ 嚴重刮傷！機械硬碟在開機轉動時，千萬不能大力碰撞或摔落！';
    checkDone();
  });

  // Repair button
  repairBtn.addEventListener('click', () => {
    scratchPath.style.display = 'none';
    platterGroup.classList.remove('scratched');
    alertBox.style.display = 'none';
    repairBtn.style.display = 'none';
    status.className = 'hw-status';
    status.textContent = '已換上全新的乾淨硬碟！請繼續點選檔案。';
    api.good?.();
  });
}

// --------------------------------------------------------------------------
// 4. flashtrap: 「隨身碟和 SSD：不會動」
// --------------------------------------------------------------------------

export function flashtrap(host, params, api) {
  const CELLS = [
    { id: 1, val: '1' },
    { id: 2, val: '0' },
    { id: 3, val: '1' },
    { id: 4, val: '0' },
    { id: 5, val: '1' },
    { id: 6, val: '1' },
  ];

  host.innerHTML = `
    <div class="hw-panel hw-flashtrap">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-ft-grid">
        ${CELLS.map(c => `
          <div class="hw-ft-cell" data-cell="${c.id}">
            <div class="hw-ft-cell-label">微觀浮柵單元 #${c.id}</div>
            <div class="hw-ft-gate" title="控制柵 (Control Gate)"></div>
            <div class="hw-ft-insulator" title="絕緣氧化層"></div>
            <div class="hw-ft-chamber">
              <span class="hw-ft-bit">0</span>
              <span class="hw-ft-electron" style="display:none;">⚡</span>
            </div>
            <div class="hw-ft-badge">空 (未寫入)</div>
          </div>
        `).join('')}
      </div>

      <div class="hw-actions">
        <button class="hw-btn primary hw-ft-write-btn">⚡ 寫入資料（注入電子）</button>
        <button class="hw-btn danger hw-ft-shake-btn">💥 用力搖晃／摔一下！</button>
        <button class="hw-btn hw-ft-clear-btn">🧹 清除重來</button>
      </div>

      <p class="hw-status" aria-live="polite">請點選「寫入資料」，看看電子怎麼被關在晶片裡！</p>
    </div>
  `;

  let hasData = false;
  let hasShaken = false;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const cells = host.querySelectorAll('.hw-ft-cell');
  const panel = host.querySelector('.hw-flashtrap');

  const checkDone = () => {
    if (finished) return;
    if (hasData && hasShaken) {
      finished = true;
      status.className = 'hw-status good';
      status.textContent = '🎉 這就是隨身碟和 SSD！裡面完全沒有會轉的圓盤與機械臂，靠電子開關記住資料，耐摔、安靜又超快速！';
      api.done?.();
    }
  };

  // Write Data
  host.querySelector('.hw-ft-write-btn').addEventListener('click', () => {
    hasData = true;
    cells.forEach((cell, i) => {
      const c = CELLS[i];
      cell.classList.add('trapped');
      cell.querySelector('.hw-ft-bit').textContent = c.val;
      cell.querySelector('.hw-ft-electron').style.display = 'inline';
      cell.querySelector('.hw-ft-badge').textContent = '🔒 牢牢鎖住';
      pop(cell);
    });
    api.good?.();
    status.className = 'hw-status good';
    status.textContent = '⚡ 資料已寫入！電子被緊緊鎖在浮柵絕緣層裡，就算拔掉電源也跑不出來！現在摔一下試試看！';
    checkDone();
  });

  // Shake Stage
  host.querySelector('.hw-ft-shake-btn').addEventListener('click', () => {
    hasShaken = true;
    shake(panel);

    if (hasData) {
      api.good?.();
      status.className = 'hw-status good';
      status.textContent = '✅ 沒有會動的零件，防震又超快！不管怎麼震動，電子依然安全鎖在裡面！';
    } else {
      status.textContent = '晃動完全沒有影響！請先寫入資料，看看電子是否依然鎖住。';
    }
    checkDone();
  });

  // Clear Data
  host.querySelector('.hw-ft-clear-btn').addEventListener('click', () => {
    hasData = false;
    cells.forEach(cell => {
      cell.classList.remove('trapped');
      cell.querySelector('.hw-ft-bit').textContent = '0';
      cell.querySelector('.hw-ft-electron').style.display = 'none';
      cell.querySelector('.hw-ft-badge').textContent = '空 (未寫入)';
    });
    status.className = 'hw-status';
    status.textContent = '資料已抹除，電子已釋放回到原點。';
  });
}

// --------------------------------------------------------------------------
// 5. cpuchefs: 「CPU：幾位聰明大廚」
// --------------------------------------------------------------------------

export function cpuchefs(host, params, api) {
  const CHEFS = [
    { id: 0, name: '大廚一號 (Core 0)', avatar: '👨‍🍳' },
    { id: 1, name: '大廚二號 (Core 1)', avatar: '👩‍🍳' },
    { id: 2, name: '大廚三號 (Core 2)', avatar: '🧑‍🍳' },
    { id: 3, name: '大廚四號 (Core 3)', avatar: '👨‍🍳' },
  ];

  const STEPS = [
    { name: '洗菜', icon: '🥬' },
    { name: '切菜', icon: '🔪' },
    { name: '熱鍋', icon: '🍳' },
    { name: '盛盤', icon: '🍲' },
  ];

  const DISHES = ['🥗 鮮脆彩蔬沙拉', '🥩 香煎多汁牛排', '🍜 豚骨炙燒拉麵', '🍛 濃郁日式咖哩'];

  host.innerHTML = `
    <div class="hw-panel hw-cpuchefs">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-cc-grid">
        ${CHEFS.map(c => `
          <div class="hw-cc-chef" data-chef="${c.id}">
            <div class="hw-cc-header">
              <span class="hw-cc-name">${c.avatar} ${c.name}</span>
              <span class="hw-cc-state">待命中</span>
            </div>
            <div class="hw-cc-dish">等待點餐...</div>
            <div class="hw-cc-steps">
              ${STEPS.map((s, idx) => `
                <div class="hw-cc-step-badge" data-s="${idx}">${s.name} ${s.icon}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="hw-actions">
        <button class="hw-btn primary hw-cc-order-btn">🍽️ 點一道菜（指派給空閒大廚）</button>
      </div>

      <div class="hw-cc-shelf">
        <span>出餐櫃檯：</span>
        <span class="hw-cc-dishes-done" style="color:var(--ink-3);">尚無完成餐點</span>
      </div>

      <p class="hw-status" aria-live="polite">CPU 擁有 4 位厲害的核心大廚！點餐看看大廚如何一步步料理！</p>
    </div>
  `;

  const chefStates = [false, false, false, false];
  let dishesDone = 0;
  let dishIndex = 0;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const shelf = host.querySelector('.hw-cc-dishes-done');
  const chefs = host.querySelectorAll('.hw-cc-chef');

  const runChefPipeline = chefId => {
    if (chefStates[chefId]) return;
    chefStates[chefId] = true;

    const dishName = DISHES[dishIndex % DISHES.length];
    dishIndex++;

    const chefEl = chefs[chefId];
    chefEl.classList.add('busy');
    chefEl.querySelector('.hw-cc-state').textContent = '烹調中';
    chefEl.querySelector('.hw-cc-dish').textContent = dishName;

    const badges = chefEl.querySelectorAll('.hw-cc-step-badge');
    const stepDuration = isReducedMotion() ? 60 : 350;

    // Immediate prompt to encourage pressing fast and more (multitasking demonstration)
    const busyCount = chefStates.filter(Boolean).length;
    status.className = 'hw-status';
    if (busyCount <= 1) {
      status.textContent = '⚡ 大廚開工了！快！趁大廚在做菜，連續多按幾次「點餐」，看看 4 位大廚能不能同時多工做菜！';
    } else if (busyCount < 4) {
      status.textContent = `🔥 太棒了！已經有 ${busyCount} 位大廚同時在做菜！繼續按，把 4 位大廚通通叫起來！`;
    } else {
      status.textContent = '🍳 滿載全開！4 位大廚同時多工料理！這就是多核心 CPU 的威力！';
    }

    const runStep = stepIdx => {
      if (stepIdx < STEPS.length) {
        badges.forEach((b, i) => {
          b.classList.toggle('now', i === stepIdx);
          b.classList.toggle('done', i < stepIdx);
        });
        safeLater(api, () => runStep(stepIdx + 1), stepDuration);
      } else {
        // Complete Dish
        badges.forEach(b => {
          b.classList.remove('now');
          b.classList.add('done');
        });

        chefEl.classList.remove('busy');
        chefEl.querySelector('.hw-cc-state').textContent = '待命中';
        chefEl.querySelector('.hw-cc-dish').textContent = '完成！等待點餐...';
        chefStates[chefId] = false;

        dishesDone++;
        pop(chefEl);
        api.good?.();

        // Update shelf
        if (dishesDone === 1) shelf.textContent = '';
        const item = document.createElement('span');
        item.style.marginRight = '8px';
        item.textContent = dishName;
        shelf.appendChild(item);
        pop(item);

        if (dishesDone >= 2 && !finished) {
          finished = true;
          status.className = 'hw-status good';
          status.textContent = '🎉 太厲害了！CPU 核心就像米其林大廚，雖然只有 4 位，但每位都能處理最繁複精準的任務！';
          api.done?.();
        } else {
          status.textContent = `太棒了！已出餐 ${dishesDone} 道菜，CPU 能同時讓 4 位大廚各做一道菜！`;
        }
      }
    };

    runStep(0);
  };

  // Order button
  host.querySelector('.hw-cc-order-btn').addEventListener('click', () => {
    const idleId = chefStates.findIndex(busy => !busy);
    if (idleId === -1) {
      shake(host.querySelector('.hw-cc-grid'));
      status.className = 'hw-status warn';
      status.textContent = '⚠️ 4 位大廚都在忙！CPU 核心數量有限，新的菜單必須在佇列中排隊！';
      return;
    }
    runChefPipeline(idleId);
  });

  // Direct chef click
  chefs.forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.chef, 10);
      if (!chefStates[id]) {
        runChefPipeline(id);
      }
    });
  });
}

// --------------------------------------------------------------------------
// 6. gpusimd: 「GPU：一大群小幫手」
// --------------------------------------------------------------------------

export function gpusimd(host, params, api) {
  const TILES_COUNT = 64; // 8x8

  // Cute rainbow star/heart pattern colors
  const PALETTE = [
    '#ffd43b', '#ff922b', '#ff6b6b', '#f06595',
    '#cc5de8', '#845ef7', '#5c7cfa', '#339af0',
  ];

  host.innerHTML = `
    <div class="hw-panel hw-gpusimd">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-simd-container">
        <div class="hw-simd-board" aria-label="8x8 像素馬賽克牆">
          ${Array.from({ length: TILES_COUNT }, (_, i) => `
            <div class="hw-simd-tile" data-i="${i}"></div>
          `).join('')}
        </div>

        <div class="hw-simd-stats">
          <div class="hw-simd-stat-col gpu-col">
            <span>🐜 GPU 同步蓋：</span>
            <b class="hw-simd-stat-val hw-stat-gpu" style="display:none;">0.05 秒！⚡</b>
          </div>
          <div class="hw-simd-stat-col cpu-col">
            <span>👨‍🍳 CPU 跑著蓋：</span>
            <b class="hw-simd-stat-val hw-stat-cpu" style="display:none;">約 3.0 秒 🐢</b>
          </div>
        </div>
      </div>

      <div class="hw-actions">
        <button class="hw-btn hw-simd-ants-btn">🐜 派出 64 位小工蟻</button>
        <button class="hw-btn primary hw-simd-stamp-btn" disabled>💥 同步蓋章！（SIMD）</button>
        <button class="hw-btn hw-simd-chef-btn">👨‍🍳 讓 1 位大廚跑著蓋</button>
        <button class="hw-btn hw-simd-reset-btn">🔄 重來</button>
      </div>

      <p class="hw-status" aria-live="polite">點選「派出 64 位小工蟻」，體驗 GPU 的威力！</p>
    </div>
  `;

  let antsDeployed = false;
  let isRunning = false;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const tiles = host.querySelectorAll('.hw-simd-tile');
  const antsBtn = host.querySelector('.hw-simd-ants-btn');
  const stampBtn = host.querySelector('.hw-simd-stamp-btn');
  const chefBtn = host.querySelector('.hw-simd-chef-btn');
  const board = host.querySelector('.hw-simd-board');
  const statCpu = host.querySelector('.hw-stat-cpu');
  const statGpu = host.querySelector('.hw-stat-gpu');

  // Deploy Ants
  antsBtn.addEventListener('click', () => {
    if (isRunning) return;
    antsDeployed = true;
    tiles.forEach(tile => {
      tile.classList.add('has-ant');
      tile.textContent = '🐜';
    });
    stampBtn.disabled = false;
    pop(board);
    api.good?.();
    status.textContent = '64 位小工蟻已就定位！每人負責一個方格！點選「同步蓋章」！';
  });

  // Sync Stamp (SIMD)
  stampBtn.addEventListener('click', () => {
    if (isRunning || !antsDeployed) return;
    isRunning = true;
    stampBtn.disabled = true;

    // All tiles stamped simultaneously
    tiles.forEach((tile, i) => {
      tile.classList.remove('has-ant');
      tile.classList.add('stamped');
      tile.style.backgroundColor = PALETTE[i % PALETTE.length];
      tile.textContent = '⭐';
    });

    pop(board);
    api.good?.();
    statGpu.style.display = 'inline-block';
    statGpu.textContent = '0.05 秒！⚡';

    safeLater(api, () => {
      isRunning = false;
      status.className = 'hw-status good';
      status.textContent = '🎉 這就是 GPU！雖然小工蟻只會蓋章，但幾千個人同時動作，一瞬間就把整個螢幕畫滿了！';
      if (!finished) {
        finished = true;
        api.done?.();
      }
    }, 200);
  });

  // Chef runs one by one
  chefBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    antsBtn.disabled = true;
    stampBtn.disabled = true;
    chefBtn.disabled = true;

    // Reset tiles first
    tiles.forEach(t => {
      t.className = 'hw-simd-tile';
      t.style.backgroundColor = '';
      t.textContent = '';
    });

    let current = 0;
    const stepTime = isReducedMotion() ? 10 : 45;

    const stepChef = () => {
      if (current < TILES_COUNT) {
        if (current > 0) {
          tiles[current - 1].textContent = '⭐';
        }
        const tile = tiles[current];
        tile.classList.add('stamped');
        tile.style.backgroundColor = PALETTE[current % PALETTE.length];
        tile.textContent = '👨‍🍳';

        if (current % 12 === 0) {
          status.textContent = `👨‍🍳 大廚跑著蓋：第 ${current + 1}/64 格... 💦 呼～一個人蓋好喘！`;
        }
        current++;
        safeLater(api, stepChef, stepTime);
      } else {
        tiles[TILES_COUNT - 1].textContent = '⭐';
        isRunning = false;
        antsBtn.disabled = false;
        chefBtn.disabled = false;
        statCpu.style.display = 'inline-block';
        statCpu.textContent = '約 3.0 秒 🐢';
        status.textContent = '大廚跑完了！一個人蓋 64 格需要很多時間，現在換小工蟻同時蓋試試看！';
      }
    };

    stepChef();
  });

  // Reset
  host.querySelector('.hw-simd-reset-btn').addEventListener('click', () => {
    if (isRunning) return;
    antsDeployed = false;
    stampBtn.disabled = true;
    statGpu.style.display = 'none';
    statCpu.style.display = 'none';
    tiles.forEach(tile => {
      tile.className = 'hw-simd-tile';
      tile.style.backgroundColor = '';
      tile.textContent = '';
    });
    status.className = 'hw-status';
    status.textContent = '已重來，請重新派出小工蟻或大廚！';
  });
}

// --------------------------------------------------------------------------
// 7. aimath: 「AI 也愛用 GPU」
// --------------------------------------------------------------------------

export function aimath(host, params, api) {
  const TOTAL_CARDS = 100; // 10x10 matrix

  host.innerHTML = `
    <div class="hw-panel hw-aimath">
      <div class="gemini-tag" data-created-by="gemini"></div>
      <div class="hw-ai-layout">
        <!-- 10x10 Math Matrix -->
        <div class="hw-ai-matrix" aria-label="100 道微觀特徵神經網路算式">
          ${Array.from({ length: TOTAL_CARDS }, (_, i) => `
            <div class="hw-ai-cell" data-idx="${i}"></div>
          `).join('')}
        </div>

        <!-- Robot Console -->
        <div class="hw-ai-console">
          <div class="hw-ai-robot-head">
            <span class="hw-ai-face">🤖</span>
            <div class="hw-ai-meta">
              <span class="hw-ai-target">目標辨識：🐱 貓咪照片</span>
              <span class="hw-ai-count">計算進度：<b class="hw-ai-progress-text">0</b> / 100 題</span>
            </div>
          </div>

          <div class="hw-ai-meter-bar">
            <div class="hw-ai-meter-track"></div>
          </div>

          <div class="hw-ai-verdict">🤔 等待神經網路特徵計算...</div>
        </div>
      </div>

      <div class="hw-actions">
        <button class="hw-btn hw-ai-cpu-btn">🐢 用 CPU 慢慢算（4 題 4 題算）</button>
        <button class="hw-btn primary hw-ai-gpu-btn">⚡ 用 GPU 一起算（100 題瞬間完成）</button>
        <button class="hw-btn hw-ai-reset-btn">🔄 重來</button>
      </div>

      <p class="hw-status" aria-live="polite">AI 辨識一張圖片需要算 100 道算式，比較 CPU 和 GPU 的差異！</p>
    </div>
  `;

  let isRunning = false;
  let finished = false;

  const status = host.querySelector('.hw-status');
  const cells = host.querySelectorAll('.hw-ai-cell');
  const track = host.querySelector('.hw-ai-meter-track');
  const progressText = host.querySelector('.hw-ai-progress-text');
  const verdict = host.querySelector('.hw-ai-verdict');
  const face = host.querySelector('.hw-ai-face');
  const cpuBtn = host.querySelector('.hw-ai-cpu-btn');
  const gpuBtn = host.querySelector('.hw-ai-gpu-btn');

  const setProgress = count => {
    progressText.textContent = String(count);
    track.style.width = `${count}%`;
  };

  // CPU Button: 4 by 4 batch sequential
  cpuBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    cpuBtn.disabled = true;
    gpuBtn.disabled = true;

    // Reset
    cells.forEach(c => c.className = 'hw-ai-cell');
    setProgress(0);
    face.textContent = '🤔';
    verdict.textContent = 'CPU 4 個核心努力計算中... 請稍候...';

    let current = 0;
    const batchSize = 4;
    const delay = isReducedMotion() ? 20 : 160;

    const runBatch = () => {
      if (current < TOTAL_CARDS) {
        for (let i = 0; i < batchSize && current + i < TOTAL_CARDS; i++) {
          cells[current + i].classList.add('computed');
        }
        current += batchSize;
        setProgress(current);
        safeLater(api, runBatch, delay);
      } else {
        isRunning = false;
        cpuBtn.disabled = false;
        gpuBtn.disabled = false;
        face.textContent = '🐱';
        verdict.textContent = '✅ 計算完畢！辨識成功：這是貓咪！';
        status.textContent = 'CPU 算完了！一道一道算需要等好幾秒，現在試試看 GPU 的閃電運算！';
        api.good?.();
      }
    };

    runBatch();
  });

  // GPU Button: All 100 simultaneously
  gpuBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    cpuBtn.disabled = true;
    gpuBtn.disabled = true;

    // Reset
    cells.forEach(c => c.className = 'hw-ai-cell');
    setProgress(0);

    const delay = isReducedMotion() ? 50 : 250;

    safeLater(api, () => {
      cells.forEach(c => {
        c.classList.add('computed');
        c.classList.add('gpu-flash');
      });
      setProgress(100);
      face.textContent = '✨🐱✨';
      pop(face);
      verdict.innerHTML = '⚡ <b>GPU 瞬間全解！</b> 辨識為貓咪（信心度 99.9%）';
      api.good?.();

      isRunning = false;
      cpuBtn.disabled = false;
      gpuBtn.disabled = false;

      status.className = 'hw-status good';
      status.textContent = '🎉 AI 模型的本質就是幾萬個簡單的乘法與加法！因為 GPU 能同時算幾千題，AI 才能在眨眼間看懂照片、回答你的問題！';
      if (!finished) {
        finished = true;
        api.done?.();
      }
    }, delay);
  });

  // Reset
  host.querySelector('.hw-ai-reset-btn').addEventListener('click', () => {
    if (isRunning) return;
    cells.forEach(c => c.className = 'hw-ai-cell');
    setProgress(0);
    face.textContent = '🤖';
    verdict.textContent = '🤔 等待神經網路特徵計算...';
    status.className = 'hw-status';
    status.textContent = '已重來，請選擇用 CPU 還是 GPU 計算！';
  });
}
