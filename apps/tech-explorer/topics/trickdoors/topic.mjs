const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const clicks = (...selectors) => selectors.map(selector => ({ action: 'click', selector }));

function paths(host, _, api) {
  const routes = [
    ['🗣️', '騙人幫忙', '假客服索取驗證碼，假修復網頁請你執行指令。', '先停一下，用原本知道的方法查證。', '門口的說服話術'],
    ['🎟️', '冒用登入', '利用外洩密碼或被偷走的登入憑證，假裝成帳號主人。', '不同帳號用不同密碼，也要保護登入中的裝置。', '偷走門禁鑰匙'],
    ['📦', '執行惡意程式', '把有害程式包成遊戲、工具或更新，等人下載執行。', '從官方來源取得軟體，不隨意略過警告。', '包裝成禮物的木馬'],
    ['🚪', '利用漏洞', '利用程式的錯誤，做出原本不該被允許的事。', '安裝官方更新，搭配其他保護。', '未鎖好的窗戶'],
  ];
  const seen = new Set();
  host.innerHTML = `
    <div class="td-demo">
      <div class="td-hub">
        <div class="td-target">
          <div class="td-target-icon">🏠</div>
          <strong>你的裝置與帳號</strong>
          <span class="td-target-sub">要保護的核心目標</span>
        </div>
      </div>
      <div class="td-map">
        ${routes.map((r, i) => `
          <button class="td-route" data-route="${i}" aria-pressed="false">
            <span class="td-route-icon">${r[0]}</span>
            <div class="td-route-info">
              <strong>${r[1]}</strong>
              <small>${r[4]}</small>
            </div>
            <span class="td-route-shield" aria-hidden="true">🛡️</span>
          </button>
        `).join('')}
      </div>
      <div class="td-report" role="status" aria-live="polite">點四條路，看看攻擊怎麼開始，又該在哪裡擋住。</div>
    </div>
  `;

  host.querySelectorAll('[data-route]').forEach(button => {
    button.onclick = () => {
      const i = Number(button.dataset.route);
      seen.add(i);
      button.setAttribute('aria-pressed', 'true');
      host.querySelector('.td-report').textContent = routes[i][2] + ' ' + routes[i][3] + '（' + seen.size + '/4）';
      if (seen.size === 4) api.done();
    };
  });
}

function trick(host, params, api) {
  const scenarios = {
    command: {
      kind: 'command',
      icon: '🛠️',
      sender: '陌生網頁 (假修復 ClickFix)',
      promise: '🎬 影片播放失敗！照著指示複製指令，貼進終端機就能修好。',
      item: '【powershell -Command "..." → 執行】',
      label: '這是流程示意，不是真正指令',
      sourceIcon: '🌐',
      sourceName: '可疑網頁',
      vaultIcon: '💻',
      vaultName: '我的電腦',
      itemA: '🖼️ 我的照片',
      itemB: '🔑 儲存的密碼',
      risky: '照著執行（模擬）',
      safe: '關閉網頁，找可信任的人',
      change: '⚠️ 未知程式開始執行，可能讀取或修改你能存取的資料。',
      why: '網頁上的文字變成了電腦要做的動作，不只是貼一段文字。',
      result: '✅ 沒有執行陌生指令。從官方說明查問題，必要時請可信任的大人協助。',
    },
    code: {
      kind: 'code',
      icon: '💬',
      sender: '自稱遊戲客服的人',
      promise: '🎁 恭喜抽中特別道具！快把收到的簡訊驗證碼傳來領獎。',
      item: '🔐 範例驗證碼 521843',
      label: '虛構帳號與驗證碼',
      sourceIcon: '🦊',
      sourceName: '冒牌客服',
      vaultIcon: '🏰',
      vaultName: '遊戲帳號城堡',
      itemA: '⭐ 遊戲進度',
      itemB: '💎 帳號寶物',
      risky: '傳給對方（模擬）',
      safe: '拒絕，回官方管道查證',
      change: '⚠️ 對方把碼填進登入頁，這個虛構帳號被登入了。',
      why: '一次性不代表可以給別人。壞人可能趕在過期前使用。',
      result: '✅ 沒有交出驗證碼。只在自己開啟的真正登入流程使用，不唸給別人。',
    },
    file: {
      kind: 'file',
      icon: '🎮',
      sender: '陌生遊戲群組',
      promise: '⚡ 超強外掛免費送！下載開啟這個檔案，再按「允許修改」。',
      item: '📦 免費道具工具.exe',
      label: '只有畫面上的假檔案，不會下載',
      sourceIcon: '🎁',
      sourceName: '未知外掛檔',
      vaultIcon: '💻',
      vaultName: '我的系統',
      itemA: '📁 範例檔案',
      itemB: '⚙️ 系統設定',
      risky: '執行並允許（模擬）',
      safe: '取消，改到官方商店確認',
      change: '⚠️ 假工具開始改動範例檔案；取得更多權限，影響可能更大。',
      why: '下載、執行和授予權限是不同動作。沒有系統管理員權限，也可能危害自己的資料。',
      result: '✅ 沒有執行假工具。檔名和圖示可以偽裝，陌生人推薦不代表安全。',
    },
  };

  const s = scenarios[params.kind];
  host.innerHTML = `
    <div class="td-demo">
      <div class="td-message">
        <div class="td-sender">${s.icon} ${s.sender}</div>
        <p>${s.promise}</p>
        <div class="td-item">${s.item}</div>
        <p class="td-caption">${s.label}</p>
      </div>

      <!-- Animated Physical Demonstration Stage -->
      <div class="td-stage" data-phase="ready" data-kind="${s.kind}">
        <div class="td-actor td-actor-source">
          <div class="td-actor-avatar">${s.sourceIcon}</div>
          <span class="td-actor-tag">${s.sourceName}</span>
        </div>

        <div class="td-conduit">
          <div class="td-beam"></div>
          <div class="td-spark" aria-hidden="true">⚡</div>
          <div class="td-shield-barrier" aria-hidden="true">🛡️</div>
        </div>

        <div class="td-actor td-actor-dest">
          <div class="td-actor-avatar">${s.vaultIcon}</div>
          <span class="td-actor-tag">${s.vaultName}</span>
          <div class="td-vault-items">
            <span class="td-vitem vitem-a">${s.itemA}</span>
            <span class="td-vitem vitem-b">${s.itemB}</span>
          </div>
        </div>
      </div>

      <!-- Text Node Row for Compatibility -->
      <div class="td-effect" data-phase="ready">
        ${(params.kind === 'code' ? ['💬 對方索取', '🧑 你來決定', '🎟️ 登入帳號'] : ['🌐 陌生來源', '💻 你的裝置', '🗂️ 你的資料'])
          .map(label => `<span class="td-node">${label}</span>`).join('')}
        <span class="td-token" aria-hidden="true">→</span>
      </div>

      <div class="td-outcome" role="status" aria-live="polite">這只是模擬。試試兩種選擇，看結果有什麼不同。</div>
      <div class="td-actions">
        <button class="td-risk">${s.risky}</button>
        <button class="go td-safe">${s.safe}</button>
      </div>
    </div>
  `;

  const stage = host.querySelector('.td-stage');
  const effect = host.querySelector('.td-effect');
  const out = host.querySelector('.td-outcome');
  const safeBtn = host.querySelector('.td-safe');
  const riskBtn = host.querySelector('.td-risk');
  let triedRisk = false;

  riskBtn.onclick = () => {
    triedRisk = true;
    safeBtn.textContent = '重新模擬安全選擇';
    stage.dataset.phase = 'ready';
    effect.dataset.phase = 'ready';
    void stage.offsetWidth;
    stage.dataset.phase = 'risk';
    effect.dataset.phase = 'risk';
    out.className = 'td-outcome td-warning';
    out.textContent = s.change + ' ' + s.why;
    api.bad();
  };

  safeBtn.onclick = () => {
    stage.dataset.phase = 'safe';
    effect.dataset.phase = 'safe';
    out.className = 'td-outcome td-success';
    out.textContent = (triedRisk ? '🔁 從頭改選的結果：' : '') + s.result +
      (triedRisk ? ' 已執行或已傳出的事，不會因關閉網頁就被撤回。' : '');
    triedRisk = false;
    safeBtn.textContent = s.safe;
    api.done();
  };
}

export default {
  ready: true,
  unit: {
    id: 'trickdoors',
    part: 'adv',
    icon: '🧭',
    color: '#7650a1',
    title: '壞人怎麼讓你幫忙開門？',
    en: 'Tricks That Open Doors',
    desc: '假修復、驗證碼和假工具，怎麼變成真正的風險',
    slides: [
      { id: 'paths', title: '攻擊不只一條路', text: '有人靠騙人，有人冒用登入，也有人利用程式或漏洞。點四條路，看看你能在哪裡保護自己。', widget: 'td-paths', params: {} },
      { id: 'command', title: '貼上指令，不只是貼文字', text: '假修復網頁可能騙你執行陌生指令。這是' + t('社交工程', 'social engineering') + '；假修復的騙法也叫 ' + t('ClickFix', 'fake-fix trick') + '。試試畫面上的模擬。', widget: 'td-trick', params: { kind: 'command' } },
      { id: 'code', title: '驗證碼是讓誰登入？', text: '有人拿著你的密碼，可能還缺這組碼。驗證碼只用在自己開啟的真正登入流程，不要傳給「客服」或網友。', widget: 'td-trick', params: { kind: 'code' } },
      { id: 'file', title: '免費工具，為什麼要改電腦？', text: '執行檔可能做出有害動作，' + t('權限', 'permission') + '越大，可能影響越多。不是每個檔案都有問題，但不能只看名字就放心執行。', widget: 'td-trick', params: { kind: 'file' } },
      { id: 'pause', title: '停一下，就多一道保護', text: '對方說很急，也不用照做。先離開催促你的畫面，再用自己原本知道的管道確認。排排看！', widget: 'order', params: { items: [
        { icon: '✋', label: '先停下，不執行也不傳碼' },
        { icon: '🚪', label: '離開可疑網頁或對話' },
        { icon: '📞', label: '用原本知道的官方管道查證' },
        { icon: '🧑', label: '請可信任的人協助處理' },
      ] } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '網頁說：「把這行指令貼進終端機，才能證明你不是機器人。」你會？',
        options: [
          { text: '✋ 不執行，關閉後用可信任的管道查證', correct: true },
          { text: '📋 只有一行，貼上一定沒關係' },
          { text: '🛡️ 有防毒，什麼指令都能試' },
        ],
        explain: '指令可能讓電腦執行程式。驗證網頁不該要求你靠執行陌生指令證明身分。',
      } },
    ],
  },
  placement: {
    after: 'malwareholes',
    stage: 'defense',
    newStage: { id: 'defense', after: 'security', part: 'adv', icon: '🧰', title: '看懂風險，準備復原', en: 'Recognize and Recover' },
  },
  prerequisites: ['malwareholes', 'safety'],
  readme: 'Four attack paths, fake-fix command tricks, verification-code theft, untrusted programs, and pause-and-verify decisions.',
  changelog: '新增「壞人怎麼讓你幫忙開門？」：用安全模擬看懂假修復指令、索取驗證碼和陌生工具的風險。',
  widgets: { 'td-paths': paths, 'td-trick': trick },
  checks: {
    paths: clicks('[data-route="0"]', '[data-route="1"]', '[data-route="2"]', '[data-route="3"]'),
    command: [...clicks('.td-risk'), { action: 'expectText', selector: '.td-outcome', text: '未知程式' }, ...clicks('.td-safe'), { action: 'expectText', selector: '.td-outcome', text: '沒有執行' }],
    code: [...clicks('.td-risk'), { action: 'expectText', selector: '.td-outcome', text: '被登入' }, ...clicks('.td-safe'), { action: 'expectText', selector: '.td-outcome', text: '沒有交出' }],
    file: [...clicks('.td-risk'), { action: 'expectText', selector: '.td-outcome', text: '範例檔案' }, ...clicks('.td-safe'), { action: 'expectText', selector: '.td-outcome', text: '沒有執行' }],
  },
  css: `
.td-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 12px; font-size: 18px; line-height: 1.5; }
.td-hub { text-align: center; margin-bottom: 2px; }
.td-target { display: inline-flex; flex-direction: column; align-items: center; background: var(--card, #fff); border: 2px solid var(--line, #e6dfd0); border-radius: 18px; padding: 10px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.td-target-icon { font-size: 38px; }
.td-target-sub { font-size: 15px; color: var(--ink-2, #666); }
.td-map { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.td-demo button { min-height: 52px; min-width: 44px; font-size: 17px; border: 2px solid var(--line); border-radius: 14px; padding: 10px 14px; background: var(--card); font-weight: 700; transition: transform 150ms cubic-bezier(.23,1,.32,1), background 150ms, border-color 150ms; }
.td-route { display: flex; align-items: center; gap: 12px; text-align: left; position: relative; overflow: hidden; }
.td-route-icon { font-size: 32px; flex-shrink: 0; }
.td-route-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.td-route-info small { font-size: 15px; font-weight: 400; color: var(--ink-2, #666); }
.td-route-shield { font-size: 20px; opacity: 0; transform: scale(0.5); transition: opacity 200ms, transform 200ms; }
.td-route[aria-pressed=true] { border-color: var(--c); background: #f0eaf7; }
.td-route[aria-pressed=true] .td-route-shield { opacity: 1; transform: scale(1); }
.td-report, .td-outcome { padding: 12px 16px; background: #f1eee8; border-radius: 14px; min-height: 80px; }
.td-message { border: 2px solid var(--line); background: var(--card); border-radius: 18px; padding: 14px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.td-sender { font-weight: 800; color: var(--c); font-size: 17px; }
.td-message p { margin: 6px 0; font-size: 16px; }
.td-item { padding: 8px 12px; background: #f1eee8; border-radius: 10px; font-family: ui-monospace, monospace; overflow-wrap: anywhere; font-size: 15px; border-left: 4px solid var(--c); }
.td-caption { font-size: 15px; color: var(--ink-2); margin-top: 4px; }

/* Physical Demonstration Stage */
.td-stage { display: grid; grid-template-columns: 100px 1fr 140px; align-items: center; background: var(--card, #fff); border: 2px solid var(--line, #e6dfd0); border-radius: 18px; padding: 14px; min-height: 140px; position: relative; overflow: hidden; }
.td-actor { display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 2; }
.td-actor-avatar { font-size: 38px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.td-actor-tag { font-size: 15px; font-weight: 700; color: var(--ink, #222); margin-top: 4px; }
.td-conduit { position: relative; height: 32px; display: flex; align-items: center; justify-content: center; margin: 0 8px; }
.td-beam { width: 100%; height: 6px; background: repeating-linear-gradient(90deg, var(--line, #ddd), var(--line, #ddd) 6px, transparent 6px, transparent 12px); border-radius: 3px; }
.td-spark { position: absolute; left: 10px; font-size: 22px; opacity: 0; pointer-events: none; }
.td-shield-barrier { position: absolute; font-size: 32px; opacity: 0; transform: scale(0.5); transition: opacity 220ms, transform 250ms cubic-bezier(.34,1.56,.64,1); }
.td-vault-items { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.td-vitem { font-size: 15px; padding: 2px 6px; border-radius: 6px; background: #f1eee8; border: 1px solid var(--line, #ddd); transition: all 250ms; }

/* Stage Animations by Phase */
.td-stage[data-phase=risk] .td-spark {
  animation: td-spark-travel 650ms cubic-bezier(.23,1,.32,1) forwards;
}
.td-stage[data-phase=risk] .td-actor-dest {
  animation: td-shake 400ms 500ms ease-in-out;
}
.td-stage[data-phase=risk] .td-vitem {
  background: #ffe3c0;
  border-color: #b77926;
  color: #944a00;
  transform: scale(0.96);
}
.td-stage[data-phase=safe] .td-shield-barrier {
  opacity: 1;
  transform: scale(1.15);
}
.td-stage[data-phase=safe] .td-spark {
  animation: td-spark-deflect 450ms ease-in forwards;
}
.td-stage[data-phase=safe] .td-vitem {
  background: #e5f4e6;
  border-color: #51cf66;
  color: #2b8a3e;
}

@keyframes td-spark-travel {
  0% { opacity: 0; transform: translateX(0) scale(0.8); }
  20% { opacity: 1; transform: translateX(20px) scale(1.2); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateX(120px) scale(1); }
}

@keyframes td-spark-deflect {
  0% { opacity: 0; transform: translateX(0); }
  30% { opacity: 1; transform: translateX(30px); }
  60% { opacity: 1; transform: translateX(50px) translateY(-18px); }
  100% { opacity: 0; transform: translateX(30px) translateY(-35px) scale(0.5); }
}

@keyframes td-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Fallback Node Row */
.td-effect { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 4px; }
.td-node { font-size: 15px; display: grid; place-items: center; text-align: center; padding: 8px 4px; background: #f1eee8; border-radius: 10px; transition: background 180ms, transform 180ms; }
.td-effect[data-phase=risk] .td-node:nth-child(3) { background: #ffe3c0; transform: translateY(2px); }
.td-effect[data-phase=safe] .td-node:nth-child(2) { background: #e5f4e6; }
.td-token { pointer-events: none; position: absolute; left: 12%; top: 25%; font-size: 22px; color: var(--c); opacity: 0; }
.td-effect[data-phase=risk] .td-token { animation: td-travel 650ms linear; }
.td-effect[data-phase=safe] .td-token { opacity: 1; left: 48%; font-size: 0; }
.td-effect[data-phase=safe] .td-token::after { content: "🛡️"; font-size: 22px; }

@keyframes td-travel {
  0% { opacity: 0; transform: translateX(0); }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateX(320px); }
}

.td-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.td-actions button { flex: 1; min-width: 170px; }
.td-demo .go { background: var(--c); color: white; border-color: var(--c); }
.td-warning { background: #fff0de; border-left: 4px solid #b77926; }
.td-success { background: #e5f4e6; border-left: 4px solid #2b8a3e; }
.td-demo button:active { transform: translateY(2px); }

@media (max-width: 899px) {
  .td-actions button { min-width: 140px; }
  .td-map { grid-template-columns: 1fr; }
  .td-stage { grid-template-columns: 80px 1fr 110px; padding: 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .td-demo button, .td-node, .td-vitem { transition: none; }
  .td-spark, .td-token { animation: none !important; }
  .td-stage[data-phase=risk] .td-actor-dest { animation: none; }
}
  `,
};
