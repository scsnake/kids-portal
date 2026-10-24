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

export function ewastechute(host, _params, api) {
  const ITEMS = [
    {
      id: 'battery',
      name: '用完的乾電池',
      icon: '🔋',
      target: 'yellow',
      dangerMsg: '⚠️ 危險！廢乾電池含重金屬，丟進垃圾車會污染環境！請投廢乾電池回收筒！',
      successMsg: '✅ 投遞成功！用完的乾電池投入專用廢電池回收筒，交給專業回收處理！',
    },
    {
      id: 'phone',
      name: '碎屏舊手機',
      icon: '📱',
      target: 'green',
      dangerMsg: '⚠️ 舊手機內含貴重金屬與鋰電池，不能丟一般垃圾！請送去便利商店或門市回收！',
      successMsg: '✅ 投遞成功！舊手機送至超商或電信門市回收，安全又能提煉貴金屬！',
    },
    {
      id: 'cable',
      name: '壞掉充電線',
      icon: '🔌',
      target: 'green',
      dangerMsg: '⚠️ 充電線內有金屬銅線，可以回收再利用，請送至超商或門市 3C 回收！',
      successMsg: '✅ 投遞成功！舊線材銅線可提煉再利用，減少資源浪費！',
    },
    {
      id: 'tissue',
      name: '用過的衛生紙',
      icon: '🧻',
      target: 'red',
      dangerMsg: '用過的衛生紙含有髒污無法回收，不能投進 3C 或電池專用回收管道喔！',
      successMsg: '✅ 投遞成功！用過的衛生紙不能回收，屬於一般垃圾，應丟進垃圾桶！',
    },
  ];

  const CHUTES = [
    {
      id: 'green',
      title: '便利商店 / 門市回收',
      sub: '舊手機、舊平板、筆電、線材',
      icon: '🟢',
      colorClass: 'b1-chute-green',
    },
    {
      id: 'yellow',
      title: '廢電池專用回收桶',
      sub: '用完的乾電池、舊鈕扣電池',
      icon: '🟡',
      colorClass: 'b1-chute-yellow',
    },
    {
      id: 'red',
      title: '一般垃圾桶',
      sub: '🚫 絕不能丟鋰電池與 3C',
      icon: '🔴',
      colorClass: 'b1-chute-red',
    },
  ];

  host.innerHTML = `
    <div class="b1-panel b1-chute">
      <div class="gemini-tag" data-created-by="gemini" data-info="回收管道精準投遞 · 舊 3C 與鋰電池安全回收">
        <span class="gemini-spark">✨</span> Gemini 互動設計
      </div>

      <div class="b1-header">
        <div class="b1-title-group">
          <span class="b1-title">♻️ 回收管道精準投遞</span>
          <span class="b1-badge b1-badge-green">舊 3C 丟哪裡？</span>
        </div>
        <div class="b1-counter" id="ewCounter">已正確投遞：0 / 4</div>
      </div>

      <div class="b1-chute-scene">
        <!-- 3 Chutes -->
        <div class="b1-chutes-row">
          ${CHUTES.map(c => `
            <div class="b1-chute-box ${c.colorClass}" data-chute="${c.id}" role="button" tabindex="0" aria-label="投進 ${c.title}">
              <div class="b1-chute-header">
                <span class="b1-chute-icon">${c.icon}</span>
                <span class="b1-chute-title">${c.title}</span>
                <span class="b1-chute-subtitle">${c.sub}</span>
              </div>
              <div class="b1-chute-mouth" id="mouth-${c.id}">
                <div class="b1-chute-flap"></div>
                <span class="b1-chute-drop-slot">投入口 ⬇️</span>
              </div>
              <span class="b1-chute-count-badge" id="chuteCount-${c.id}">已投：0 件</span>
            </div>
          `).join('')}
        </div>

        <!-- E-waste items shelf -->
        <div class="b1-ewaste-dock">
          <div class="b1-dock-title">待分類物品（請先點選物品，再點選要投遞的回收桶）：</div>
          <div class="b1-dock-items">
            ${ITEMS.map(it => `
              <button class="b1-waste-item-btn" data-item="${it.id}" aria-label="選擇 ${it.name}">
                <span class="b1-waste-item-icon">${it.icon}</span>
                <span class="b1-waste-item-name">${it.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="b1-status" id="ewStatus" aria-live="polite">
        請先點選下方待分類物品，再投進正確的回收管道！
      </div>

      <div class="b1-completion-box" id="ewCompletion" style="display: none;">
        <span class="b1-star-trophy">🌟</span>
        <div class="b1-completion-msg">
          <b>恭喜成為 3C 回收分類小達人！</b><br>
          廢乾電池與舊手機內含重金屬，絕不能丟進垃圾車！<br>
          舊手機與線材拿去超商或電信門市，安全回收還能點石成金！<br>
          <div style="margin-top:6px; padding:6px 10px; background:#fff3bf; border-left:4px solid #f59f00; border-radius:6px; font-size: max(15px, 0.8rem); color:#903000; font-weight:700; text-align:left; line-height:1.4;">
            ⚠️ <b>安全守則</b>：電池如果膨脹、發燙或漏液，不要自己拆卸、擠壓或投進回收桶。先告訴大人，請回收人員協助處理。
          </div>
        </div>
        <button class="b1-btn b1-btn-reset" id="ewResetBtn">🔄 再試一次</button>
      </div>
    </div>
  `;

  const status = host.querySelector('#ewStatus');
  const counter = host.querySelector('#ewCounter');
  const completionBox = host.querySelector('#ewCompletion');
  const resetBtn = host.querySelector('#ewResetBtn');
  const itemBtns = host.querySelectorAll('.b1-waste-item-btn');
  const chuteBoxes = host.querySelectorAll('.b1-chute-box');

  let selectedItemId = null;
  const sortedItems = new Set();
  const chuteCounts = { green: 0, yellow: 0, red: 0 };
  let doneTriggered = false;
  let isAnimating = false;

  const tokens = new Set();

  const cleanupTokens = () => {
    tokens.forEach(token => {
      token.getAnimations().forEach(animation => animation.cancel());
      token.remove();
    });
    tokens.clear();
  };

  const selectItem = it => {
    if (isAnimating || sortedItems.has(it.id)) return;
    selectedItemId = it.id;
    itemBtns.forEach(b => {
      b.classList.toggle('selected', b.dataset.item === it.id);
    });
    status.className = 'b1-status';
    status.textContent = `已選取「${it.name}」，請點選上方回收桶進行投遞！`;
  };

  const handleChuteClick = chuteId => {
    if (isAnimating) return;

    if (!selectedItemId) {
      status.className = 'b1-status warn';
      status.textContent = '請先在下方點選一個待分類的物品喔！';
      return;
    }

    const currentItem = ITEMS.find(it => it.id === selectedItemId);
    if (!currentItem) return;

    const chuteBox = host.querySelector(`[data-chute="${chuteId}"]`);
    const mouth = host.querySelector(`#mouth-${chuteId}`);
    const itemBtn = host.querySelector(`[data-item="${currentItem.id}"]`);
    if (!chuteBox || !mouth || !itemBtn) return;

    isAnimating = true;

    // Viewport-based coordinates: 100% accurate, immune to scrolling and containers!
    const itemRect = itemBtn.getBoundingClientRect();
    const mouthRect = mouth.getBoundingClientRect();

    const startX = itemRect.left + (itemRect.width / 2);
    const startY = itemRect.top + (itemRect.height / 2);
    const destX = mouthRect.left + (mouthRect.width / 2);
    const destY = mouthRect.top + (mouthRect.height / 2);

    const midX = (startX + destX) / 2;
    const arcLift = Math.max(50, Math.abs(startY - destY) * 0.45);
    const midY = Math.min(startY, destY) - arcLift;

    // Create flying token on document.body with fixed position
    const token = document.createElement('div');
    token.className = 'b1-flying-token';
    token.innerHTML = `<span class="b1-flying-icon">${currentItem.icon}</span><span class="b1-flying-name">${currentItem.name}</span>`;
    document.body.appendChild(token);
    tokens.add(token);
    // Fixed token coordinates must also match the course's desktop zoom.
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    token.style.zoom = String(1 / zoom);
    const watchLifetime = () => {
      if (!host.isConnected || !isAlive(api)) {
        cleanupTokens();
        return;
      }
      if (token.isConnected) requestAnimationFrame(watchLifetime);
    };
    requestAnimationFrame(watchLifetime);

    // Dim source item button
    itemBtn.style.opacity = '0.35';

    const isCorrect = currentItem.target === chuteId;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finalizeSuccess = () => {
      cleanupTokens();
      mouth.classList.remove('open');

      sortedItems.add(currentItem.id);
      chuteCounts[chuteId] += 1;
      const countBadge = host.querySelector(`#chuteCount-${chuteId}`);
      if (countBadge) {
        countBadge.textContent = `已投：${chuteCounts[chuteId]} 件`;
        doPop(countBadge);
      }

      itemBtn.style.opacity = '';
      itemBtn.classList.remove('selected');
      itemBtn.classList.add('sorted');
      itemBtn.disabled = true;

      selectedItemId = null;
      isAnimating = false;
      counter.textContent = `已正確投遞：${sortedItems.size} / 4`;

      status.className = 'b1-status good';
      status.textContent = currentItem.successMsg;

      if (api && typeof api.good === 'function') {
        api.good();
      }

      if (sortedItems.size === 4 && !doneTriggered) {
        doneTriggered = true;
        completionBox.style.display = 'flex';
        doPop(completionBox);
        if (api && typeof api.done === 'function') {
          api.done();
        }
      }
    };

    const finalizeFailure = () => {
      cleanupTokens();
      itemBtn.style.opacity = '';
      isAnimating = false;
    };

    if (prefersReducedMotion) {
      if (isCorrect) {
        finalizeSuccess();
      } else {
        doShake(chuteBox);
        if (currentItem.id === 'battery' && chuteId === 'red') {
          chuteBox.classList.add('b1-siren-flash');
          safeLater(api, () => chuteBox.classList.remove('b1-siren-flash'), 1200);
        }
        if (api && typeof api.bad === 'function') {
          api.bad();
        }
        status.className = 'b1-status bad';
        status.textContent = currentItem.dangerMsg;
        finalizeFailure();
      }
      return;
    }

    // Step 1: Smooth arc throw trajectory from item up to chute mouth
    const flyAnim = token.animate([
      { transform: `translate3d(${startX}px, ${startY}px, 0) translate(-50%, -50%) scale(0.9) rotate(0deg)` },
      { transform: `translate3d(${midX}px, ${midY}px, 0) translate(-50%, -50%) scale(1.12) rotate(${destX > startX ? 12 : -12}deg)`, offset: 0.55 },
      { transform: `translate3d(${destX}px, ${destY}px, 0) translate(-50%, -50%) scale(1.0) rotate(0deg)` }
    ], {
      duration: 380,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    flyAnim.onfinish = () => {
      if (!isAlive(api)) {
        cleanupTokens();
        return;
      }

      if (isCorrect) {
        mouth.classList.add('open');
        token.classList.add('dropping');

        // Step 2: Drop into the chute hole
        const dropAnim = token.animate([
          { transform: `translate3d(${destX}px, ${destY}px, 0) translate(-50%, -50%) scale(1.0)`, opacity: 1 },
          { transform: `translate3d(${destX}px, ${destY + 28}px, 0) translate(-50%, -50%) scale(0.18)`, opacity: 0 }
        ], {
          duration: 220,
          easing: 'cubic-bezier(0.5, 0, 0.75, 0)',
          fill: 'forwards'
        });

        dropAnim.onfinish = () => {
          if (!isAlive(api)) {
            cleanupTokens();
            return;
          }
          // Chute box swallow bounce
          chuteBox.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.04) translateY(3px)' },
            { transform: 'scale(1)' }
          ], { duration: 240, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });

          finalizeSuccess();
        };
      } else {
        // Rebound on wrong chute
        token.classList.add('rebound');
        doShake(chuteBox);

        if (currentItem.id === 'battery' && chuteId === 'red') {
          chuteBox.classList.add('b1-siren-flash');
          safeLater(api, () => {
            if (!isAlive(api)) return;
            chuteBox.classList.remove('b1-siren-flash');
          }, 1200);
        }

        const bounceDirection = destX > startX ? -35 : 35;
        const reboundAnim = token.animate([
          { transform: `translate3d(${destX}px, ${destY}px, 0) translate(-50%, -50%) scale(1.0) rotate(0deg)`, opacity: 1 },
          { transform: `translate3d(${destX + bounceDirection}px, ${destY + 45}px, 0) translate(-50%, -50%) scale(1.06) rotate(${bounceDirection < 0 ? -22 : 22}deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate3d(${destX + bounceDirection * 1.5}px, ${destY + 95}px, 0) translate(-50%, -50%) scale(0.7) rotate(${bounceDirection < 0 ? -35 : 35}deg)`, opacity: 0 }
        ], {
          duration: 420,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'forwards'
        });

        reboundAnim.onfinish = () => {
          finalizeFailure();
        };

        if (api && typeof api.bad === 'function') {
          api.bad();
        }
        status.className = 'b1-status bad';
        status.textContent = currentItem.dangerMsg;
      }
    };
  };

  itemBtns.forEach(btn => {
    const itId = btn.dataset.item;
    const it = ITEMS.find(item => item.id === itId);
    if (!it) return;
    btn.addEventListener('click', () => selectItem(it));
  });

  chuteBoxes.forEach(chute => {
    const chuteId = chute.dataset.chute;
    chute.addEventListener('click', () => handleChuteClick(chuteId));
    chute.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleChuteClick(chuteId);
      }
    });
  });

  resetBtn.addEventListener('click', () => {
    cleanupTokens();
    selectedItemId = null;
    sortedItems.clear();
    doneTriggered = false;
    isAnimating = false;
    chuteCounts.green = 0;
    chuteCounts.yellow = 0;
    chuteCounts.red = 0;

    CHUTES.forEach(c => {
      const badge = host.querySelector(`#chuteCount-${c.id}`);
      if (badge) badge.textContent = '已投：0 件';
      const m = host.querySelector(`#mouth-${c.id}`);
      if (m) m.classList.remove('open');
    });

    itemBtns.forEach(b => {
      b.classList.remove('selected', 'sorted');
      b.disabled = false;
      b.style.opacity = '';
    });

    counter.textContent = '已正確投遞：0 / 4';
    completionBox.style.display = 'none';
    status.className = 'b1-status';
    status.textContent = '請先點選下方待分類物品，再投進正確的回收管道！';
  });
}
