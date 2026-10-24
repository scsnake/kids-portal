const safeLater = (api, fn, ms) => {
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

export function hashblender(host, _params, api) {
  const fruitRecipes = [
    {
      id: 'strawbanana',
      name: '🍓 草莓 + 🍌 香蕉',
      password: '草莓香蕉2026',
      smoothieName: '🍓🍌 鮮甜粉紅草莓香蕉奶昔',
      liquidColor: '#f783ac',
      hash: 'e8a9f4c2b19d77e4a6015d83',
      fruitsHtml: '<span>🍓</span><span>🍌</span>',
    },
    {
      id: 'applegrape',
      name: '🍏 蘋果 + 🍇 葡萄',
      password: '青蘋果葡萄888',
      smoothieName: '🍏🍇 夢幻紫晶蘋果葡萄果汁',
      liquidColor: '#b197fc',
      hash: '3d71ba82e054ff916a2c3104',
      fruitsHtml: '<span>🍏</span><span>🍇</span>',
    },
    {
      id: 'mangopine',
      name: '🥭 芒果 + 🍍 鳳梨',
      password: '熱帶芒果鳳梨99',
      smoothieName: '🥭🍍 金黃熱帶綜合果汁',
      liquidColor: '#ffd43b',
      hash: '9f02c65a1e7bd4128f3099c2',
      fruitsHtml: '<span>🥭</span><span>🍍</span>',
    },
  ];

  let currentRecipeIndex = 0;
  let isBlended = false;
  let triedReverse = false;
  let blendCount = 0;

  host.innerHTML = `
    <div class="wb3-panel wb3-blender">
      <div class="gemini-tag" data-created-by="gemini" data-info="神奇單向果汁機 · 體驗單向雜湊運算與不可逆保護"></div>
      <div class="wb3-header">
        <span class="wb3-title">🍹 神奇單向果汁機</span>
        <span class="wb3-badge">單向雜湊演算法</span>
      </div>
      <div class="wb3-tip-badge">💡 學習重點：雜湊不能直接倒轉成原密碼，但壞人仍可能一組一組猜，再比對結果。密碼還是要夠長，每個網站都不同。</div>

      <!-- Fruit Password Selector -->
      <div style="font-size: max(15px, 0.9rem); font-weight:800; margin-bottom:8px; color:#495057;">
        步驟 1：選擇一組水果作為登入密碼：
      </div>
      <div class="wb3-fruit-shelf" id="fruitShelf">
        ${fruitRecipes.map((r, i) => `
          <button class="wb3-fruit-opt ${i === 0 ? 'active' : ''}" data-idx="${i}">
            ${r.name}
          </button>
        `).join('')}
      </div>

      <!-- Blender Scene & Database Display -->
      <div class="wb3-blender-scene">
        <!-- Left: Blender Visual -->
        <div class="wb3-blender-frame" id="blenderFrame">
          <div class="wb3-pitcher-lid"></div>
          <div class="wb3-pitcher" id="pitcher">
            <div class="wb3-pitcher-liquid" id="pitcherLiquid"></div>
            <div class="wb3-fruit-particles" id="fruitParticles">
              ${fruitRecipes[0].fruitsHtml}
            </div>
          </div>
          <div class="wb3-pitcher-base">
            <span style="font-size: max(15px, 0.75rem); font-weight:800; color:#495057;">SHA-256 單向果汁機</span>
          </div>
          <div style="margin-top:10px; font-size: max(15px, 0.85rem); font-weight:750; color:#495057;" id="blenderStatusNote">
            果汁機裡是新鮮水果密碼
          </div>
        </div>

        <!-- Right: Server Database Storage -->
        <div class="wb3-db-card">
          <div class="wb3-db-title">🖥️ 網站伺服器資料庫</div>
          <div class="wb3-db-row">
            <div><b>帳號名稱：</b>小安 (ann_tw)</div>
          </div>
          <div class="wb3-db-row">
            <div><b>原始水果密碼：</b></div>
            <div class="wb3-db-raw" id="dbRawPassword">❌ 絕不儲存原始密碼！</div>
          </div>
          <div class="wb3-db-row">
            <div><b>伺服器儲存的雜湊指紋：</b> <span style="font-size: max(15px, 0.75rem); color:#ced4da; font-weight:600;">（單向概念示意，不是真正的密碼儲存程式。）</span></div>
            <div class="wb3-db-hash" id="dbHashValue">（等待果汁機打出雜湊指紋...）</div>
          </div>
          <div style="font-size: max(15px, 0.75rem); color:#495057; line-height:1.4; margin-top:6px; background:#f8f9fa; padding:4px 8px; border-radius:6px;">
            📌 雜湊不能直接倒轉成原密碼，但壞人仍可能一組一組猜，再比對結果。密碼還是要夠長，每個網站都不同。
          </div>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="wb3-blender-actions">
        <button class="wb3-btn wb3-btn-success" id="btnBlend">
          🍹 打成果汁（雜湊運算）
        </button>
        <button class="wb3-btn wb3-btn-warn" id="btnReverse">
          ⏪ 倒轉果汁機還原水果（試圖還原）
        </button>
      </div>

      <div class="wb3-status" id="blenderStatus" aria-live="polite">
        請點擊「打成果汁」，看水果密碼如何變身成獨一無二的雜湊指紋！
      </div>
    </div>
  `;

  const blenderFrame = host.querySelector('#blenderFrame');
  const fruitParticles = host.querySelector('#fruitParticles');
  const pitcherLiquid = host.querySelector('#pitcherLiquid');
  const blenderStatusNote = host.querySelector('#blenderStatusNote');
  const dbHashValue = host.querySelector('#dbHashValue');
  const dbRawPassword = host.querySelector('#dbRawPassword');
  const btnBlend = host.querySelector('#btnBlend');
  const btnReverse = host.querySelector('#btnReverse');
  const statusEl = host.querySelector('#blenderStatus');
  const shelfBtns = host.querySelectorAll('.wb3-fruit-opt');

  const updateFruitSelection = (idx) => {
    currentRecipeIndex = idx;
    shelfBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
    const recipe = fruitRecipes[idx];

    isBlended = false;
    fruitParticles.innerHTML = recipe.fruitsHtml;
    fruitParticles.style.opacity = '1';
    pitcherLiquid.style.height = '0%';
    blenderStatusNote.textContent = `果汁機裡是新鮮水果密碼：${recipe.name}`;
    dbHashValue.textContent = '（等待果汁機打出雜湊指紋...）';
    statusEl.className = 'wb3-status';
    statusEl.textContent = `已放入【${recipe.name}】（密碼：${recipe.password}），請點擊「打成果汁」！`;
  };

  shelfBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      updateFruitSelection(idx);
    });
  });

  // Action 1: Blend into Smoothie (Hash)
  btnBlend.addEventListener('click', () => {
    const recipe = fruitRecipes[currentRecipeIndex];
    btnBlend.disabled = true;
    btnReverse.disabled = true;
    shelfBtns.forEach(button => { button.disabled = true; });
    blenderFrame.classList.add('wb3-blender-whirl');
    statusEl.className = 'wb3-status';
    statusEl.textContent = '🌀 果汁機高速旋轉中！正在進行單向雜湊計算 (SHA-256)...';

    safeLater(api, () => {
      if (!isAlive(api)) return;
      blenderFrame.classList.remove('wb3-blender-whirl');
      fruitParticles.style.opacity = '0';
      pitcherLiquid.style.backgroundColor = recipe.liquidColor;
      pitcherLiquid.style.height = '75%';
      isBlended = true;
      blendCount++;

      blenderStatusNote.textContent = `打成了美味的：${recipe.smoothieName}`;
      dbHashValue.textContent = `🥤 ${recipe.hash}...`;
      doPop(blenderFrame);
      api.good();

      btnBlend.disabled = false;
      btnReverse.disabled = false;
      shelfBtns.forEach(button => { button.disabled = false; });

      statusEl.className = 'wb3-status good';
      statusEl.textContent = `✨ 成功！密碼打成了獨一無二的雜湊指紋【${recipe.hash.slice(0, 10)}...】！網站只保存這杯果汁的指紋代碼！`;

      if (triedReverse) {
        api.done();
      }
    }, 700);
  });

  // Action 2: Try to Reverse
  btnReverse.addEventListener('click', () => {
    if (!isBlended) {
      statusEl.className = 'wb3-status bad';
      statusEl.textContent = '果汁機裡還是完整的水果，請先點擊「打成果汁」再來試著倒轉！';
      doShake(blenderFrame);
      api.bad();
      return;
    }

    triedReverse = true;
    btnBlend.disabled = true;
    btnReverse.disabled = true;
    shelfBtns.forEach(button => { button.disabled = true; });
    doShake(blenderFrame);
    api.bad();

    statusEl.className = 'wb3-status bad';
    statusEl.textContent = '⚠️ 嗶嗶！沒辦法倒轉！不可能把果汁變回完整的水果！這就是「單向雜湊」的數學特性！';

    safeLater(api, () => {
      if (!isAlive(api)) return;
      btnBlend.disabled = false;
      btnReverse.disabled = false;

      statusEl.className = 'wb3-status good';
      statusEl.textContent = '💡 雜湊不能直接倒轉成原密碼，但壞人仍可能一組一組猜，再比對結果。密碼還是要夠長，每個網站都不同。（單向概念示意，不是真正的密碼儲存程式。）';
      shelfBtns.forEach(button => { button.disabled = false; });
      api.done();
    }, 1200);
  });
}

// ============================================================================
// 3. mitmforcefield - 【中途攔截者與防護力場】
