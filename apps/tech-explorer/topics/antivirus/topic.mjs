const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });

function scanner(host, params, api) {
  const behavior = params.mode === 'behavior';
  const cases = behavior ? [
    {
      icon: '📝',
      name: '筆記程式',
      activity: '只儲存你正在寫的筆記',
      flag: false,
      detail: '這次沒有偵測到異常，不代表永遠沒有風險。',
      pattern: '單一文字寫入 (正常行為)',
      badge: '✅ 行為守規矩',
      filesAffected: [true, false, false, false],
    },
    {
      icon: '🎮',
      name: '假遊戲工具',
      activity: '突然連續改寫大量範例檔案',
      flag: true,
      detail: '行為可疑，模擬防護先阻止它繼續改寫。這次被偵測到，不代表每次都會成功。',
      pattern: '狂改多個無關檔案 (疑似勒索軟體行為)',
      badge: '🚨 可疑行為觸發攔截',
      filesAffected: [true, true, true, true],
    },
  ] : [
    {
      icon: '📦',
      name: '已知有害程式',
      activity: '符合已知的有害樣式',
      flag: true,
      detail: '找到符合的樣式，先隔離。隔離不等於修好了所有受影響的資料。',
      pattern: '指紋樣式：[▲-◆-■] (符合黑名單)',
      badge: '⚠️ 已比對出病毒特徵碼',
      filesAffected: [],
    },
    {
      icon: '🖼️',
      name: '範例照片',
      activity: '這次沒有找到符合的樣式',
      flag: false,
      detail: '沒有發現威脅，不是保證完全安全。新變種、漏判和誤判都可能發生。',
      pattern: '指紋樣式：[●-★-◆] (非已知病毒)',
      badge: '🔎 無已知惡意特徵',
      filesAffected: [],
    },
  ];

  let selected = 0, epoch = 0;
  const seen = new Set();

  host.innerHTML = `
    <div class="av-demo">
      <div class="av-files">
        ${cases.map((c, i) => `
          <button data-av-file="${i}" aria-pressed="${i === 0}">
            <span class="av-file-icon">${c.icon}</span>
            <div class="av-file-info">
              <strong>${c.name}</strong>
              <small>${behavior ? (i === 0 ? '平常工具' : '未知下載') : (i === 0 ? '有害程式' : '正常檔案')}</small>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- High-tech Inspection Deck -->
      <div class="av-machine" data-mode="${behavior ? 'behavior' : 'patterns'}">
        <div class="av-scanner-head">
          <div class="av-shield">🛡️</div>
          <div class="av-meta">
            <strong class="av-mode">${behavior ? '行為檢查（簡化模擬）' : '已知樣式比對（簡化模擬）'}</strong>
            <p class="av-activity"></p>
            <div class="av-tech-badge"></div>
          </div>
        </div>

        <!-- Laser Scanner Visual -->
        <div class="av-laser-zone">
          <div class="av-laser-beam" aria-hidden="true"></div>
          <div class="av-sandbox-grid">
            <div class="av-box-item" data-box="0">📄 文件</div>
            <div class="av-box-item" data-box="1">🖼️ 照片</div>
            <div class="av-box-item" data-box="2">🎵 音樂</div>
            <div class="av-box-item" data-box="3">📊 功課</div>
          </div>
          <div class="av-quarantine-dome" aria-hidden="true">
            <span class="av-dome-icon">🫧🔒</span>
            <span class="av-dome-label">已隔離至安全沙盒</span>
          </div>
        </div>

        <span class="av-sweep" aria-hidden="true">🔎</span>
      </div>

      <div class="av-status" role="status" aria-live="polite">選一個檔案，再檢查。</div>
      <div class="av-foot">
        <button class="go av-scan">檢查這個範例</button>
        <span class="av-count">已檢查 0/2</span>
      </div>
    </div>
  `;

  const status = host.querySelector('.av-status');
  const machine = host.querySelector('.av-machine');
  const scan = host.querySelector('.av-scan');
  const activityEl = host.querySelector('.av-activity');
  const badgeEl = host.querySelector('.av-tech-badge');
  const boxes = host.querySelectorAll('.av-box-item');

  const show = () => {
    activityEl.textContent = cases[selected].activity;
    badgeEl.textContent = cases[selected].pattern;
    host.querySelectorAll('[data-av-file]').forEach(b => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.avFile) === selected));
    });
    boxes.forEach(box => box.className = 'av-box-item');
  };
  show();

  host.querySelectorAll('[data-av-file]').forEach(b => {
    b.onclick = () => {
      epoch++;
      selected = Number(b.dataset.avFile);
      machine.classList.remove('av-running', 'av-found', 'av-cleared');
      scan.disabled = false;
      status.textContent = '已選擇「' + cases[selected].name + '」。按下檢查，看看結果。';
      show();
    };
  });

  scan.onclick = () => {
    const ticket = ++epoch, index = selected;
    scan.disabled = true;
    machine.classList.remove('av-running', 'av-found', 'av-cleared');
    void machine.offsetWidth;
    machine.classList.add('av-running');
    status.textContent = '檢查中……正在掃描代碼與行為記錄';

    if (behavior && cases[index].flag) {
      boxes.forEach((box, bi) => {
        api.later(() => {
          if (ticket === epoch) box.classList.add('av-threatened');
        }, bi * 120);
      });
    }

    api.later(() => {
      if (ticket !== epoch) return;
      const c = cases[index];
      seen.add(index);
      machine.classList.remove('av-running');
      machine.classList.toggle('av-found', c.flag);
      machine.classList.toggle('av-cleared', !c.flag);

      if (c.flag) {
        status.textContent = '⚠️ 已阻止並隔離。 ' + c.detail;
      } else {
        status.textContent = '🔎 這次未發現威脅。 ' + c.detail;
      }

      host.querySelector('.av-count').textContent = '已檢查 ' + seen.size + '/2';
      scan.disabled = false;
      if (seen.size === 2) api.done();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 700);
  };
}

function limits(host, _, api) {
  const scenarios = [
    ['🔎', '沒有警告，可以放心嗎？', '這次掃描沒有找到威脅。它可能真的沒問題，也可能漏判；仍要確認來源、更新系統。', '未收錄的新變種可能溜過'],
    ['⚠️', '被隔離，一定是病毒嗎？', '可能是威脅，也可能誤判。不要為了開檔就關閉保護；請可信任的人或官方管道協助確認。', '正常學校軟體有時被誤會'],
    ['💬', '驗證碼已經傳出去呢？', '防毒可能幫忙擋可疑連結，但不能保證阻止你自願交出驗證碼。要立即請可信任的人協助保護帳號。', '防毒無法阻止主動給密碼'],
    ['📱', 'iPad 也能掃整台裝置嗎？', '不同系統開放的權限不同。iPad 的 App 不能像桌面防毒那樣掃描其他 App 的全部資料。', '各 App 都在沙盒隔間裡'],
  ];
  const seen = new Set();
  host.innerHTML = `
    <div class="av-demo">
      <div class="av-limit-list">
        ${scenarios.map((s, i) => `
          <button data-av-limit="${i}" aria-pressed="false">
            <span class="av-limit-icon">${s[0]}</span>
            <div class="av-limit-body">
              <strong>${s[1]}</strong>
              <small>${s[3]}</small>
            </div>
            <span class="av-limit-check" aria-hidden="true">✓</span>
          </button>
        `).join('')}
      </div>
      <div class="av-status" role="status" aria-live="polite">點四種情況，看看防護的界線。</div>
    </div>
  `;

  host.querySelectorAll('[data-av-limit]').forEach(b => {
    b.onclick = () => {
      const i = Number(b.dataset.avLimit);
      seen.add(i);
      b.setAttribute('aria-pressed', 'true');
      host.querySelector('.av-status').textContent = scenarios[i][2] + '（' + seen.size + '/4）';
      if (seen.size === 4) api.done();
    };
  });
}

export default {
  ready: true,
  unit: {
    id: 'antivirus',
    part: 'adv',
    icon: '🛡️',
    color: '#216d85',
    title: '防毒軟體能做什麼？',
    en: 'What Antivirus Can Do',
    desc: '偵測、隔離和多層保護，也看懂防毒的界線',
    slides: [
      { id: 'patterns', title: '認出已知的有害樣式', text: t('防毒軟體', 'antivirus') + '會用多種方法找威脅，' + t('樣式比對', 'signature matching') + '是其中之一。試著檢查兩個假檔案。這裡不會掃描你的裝置。', widget: 'av-scanner', params: { mode: 'patterns' } },
      { id: 'behavior', title: '名字換了，動作仍然可疑', text: '有些防護也看' + t('程式行為', 'behavior monitoring') + '，不只認名字或舊樣式。短時間改寫很多檔案，可能引起警告；但仍可能漏判。比較兩個範例。', widget: 'av-scanner', params: { mode: 'behavior' } },
      { id: 'limits', title: '防毒不是「一定安全」保證書', text: '保護工具有幫助，但會有' + t('誤判', 'false positive') + '和' + t('漏判', 'false negative') + '。它也不能替你判斷每一句話。點點看四種情況。', widget: 'av-limits', params: {} },
      { id: 'layers', title: '多幾層，不靠一面盾牌', text: t('多層防護', 'defense in depth') + '讓一道保護失效時，還有其他機會擋住或復原。每件事該靠什麼？分分看！', widget: 'sort', params: {
        bins: [{ id: 'prevent', label: '降低發生機會', icon: '🚦' }, { id: 'recover', label: '準備復原', icon: '🧰' }],
        rest: 'recover',
        items: [
          { icon: '🔄', label: '安裝官方更新', bin: 'prevent' },
          { icon: '🛡️', label: '保持防護啟用並更新', bin: 'prevent' },
          { icon: '✋', label: '不執行陌生指令', bin: 'prevent' },
          { icon: '💾', label: '保留獨立備份並測試還原', bin: 'recover' },
        ],
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '掃描結果寫「未發現威脅」，陌生人就叫你關掉防護來執行工具。你會？',
        options: [
          { text: '✋ 不關閉防護，改用可信任的官方來源', correct: true },
          { text: '✅ 沒掃到，就一定沒有問題' },
          { text: '🔓 為了領獎，暫時關掉就好' },
        ],
        explain: '沒有警告不是安全保證。保留保護、確認來源，加上更新和獨立備份，比只靠一次掃描可靠。',
      } },
    ],
  },
  placement: { after: 'trickdoors', stage: 'defense' },
  prerequisites: ['trickdoors'],
  readme: 'Known-pattern and behavior detection, quarantine, missed threats and false alarms, platform limits, and layered protection.',
  changelog: '新增「防毒軟體能做什麼？」：比較樣式和行為檢查，理解隔離、誤判、漏判與多層防護。',
  widgets: { 'av-scanner': scanner, 'av-limits': limits },
  checks: {
    patterns: [click('[data-av-file="0"]'), click('.av-scan'), { action: 'expectText', selector: '.av-status', text: '已阻止並隔離' }, click('[data-av-file="1"]'), click('.av-scan'), { action: 'expectText', selector: '.av-count', text: '2/2' }],
    behavior: [click('[data-av-file="0"]'), click('.av-scan'), { action: 'expectText', selector: '.av-status', text: '未發現威脅' }, click('[data-av-file="1"]'), click('.av-scan'), { action: 'expectText', selector: '.av-count', text: '2/2' }],
    limits: [0, 1, 2, 3].map(i => click('[data-av-limit="' + i + '"]')),
  },
  css: `
.av-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 14px; font-size: 18px; line-height: 1.55; }
.av-demo button { min-height: 52px; min-width: 44px; padding: 10px 14px; font-size: 17px; font-weight: 700; border: 2px solid var(--line); border-radius: 14px; background: var(--card); transition: background 150ms, transform 150ms cubic-bezier(.23,1,.32,1), border-color 150ms; }
.av-demo button[aria-pressed=true] { background: #e3f1f6; border-color: var(--c); }
.av-files { display: flex; flex-wrap: wrap; gap: 12px; }
.av-files button { flex: 1; display: flex; align-items: center; gap: 12px; text-align: left; }
.av-file-icon { font-size: 30px; flex-shrink: 0; }
.av-file-info { display: flex; flex-direction: column; gap: 2px; }
.av-file-info small { font-size: 15px; font-weight: 400; color: var(--ink-2); }

/* High-tech Inspection Machine */
.av-machine { position: relative; min-height: 170px; background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.03); transition: all 250ms; }
.av-scanner-head { display: flex; align-items: center; gap: 16px; }
.av-shield { font-size: 48px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1)); }
.av-meta { flex: 1; }
.av-mode { color: var(--c); font-size: 17px; }
.av-activity { margin: 4px 0 0; font-size: 15px; color: var(--ink); }
.av-tech-badge { font-family: ui-monospace, monospace; font-size: 15px; color: var(--ink-2); background: #f1eee8; padding: 3px 8px; border-radius: 6px; display: inline-block; margin-top: 4px; }

/* Interactive Laser and Sandbox Zone */
.av-laser-zone { position: relative; min-height: 70px; background: #faf9f6; border: 1px dashed var(--line); border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 10px; overflow: hidden; }
.av-laser-beam { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #216d85; opacity: 0; filter: drop-shadow(0 0 8px #216d85); }
.av-sandbox-grid { display: flex; gap: 8px; width: 100%; justify-content: space-around; }
.av-box-item { font-size: 15px; padding: 6px 10px; background: #fff; border: 1px solid var(--line); border-radius: 8px; transition: all 200ms; }
.av-box-item.av-threatened { background: #ffe3c0; border-color: #b07429; transform: scale(1.05); }

/* Quarantine Dome */
.av-quarantine-dome { position: absolute; inset: 6px; background: rgba(255, 244, 227, 0.94); border: 2px solid #b07429; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; opacity: 0; transform: scale(0.85); transition: all 250ms cubic-bezier(.34,1.56,.64,1); pointer-events: none; }
.av-dome-icon { font-size: 30px; }
.av-dome-label { font-size: 15px; font-weight: 700; color: #944a00; }

/* States */
.av-sweep { position: absolute; font-size: 28px; left: 14%; bottom: 8px; opacity: 0; }
.av-running .av-laser-beam { opacity: 1; animation: av-laser-sweep 700ms ease-in-out infinite alternate; }
.av-running .av-sweep { animation: av-sweep 650ms linear; }
.av-found { border-color: #b07429; background: #fffaf2; }
.av-found .av-quarantine-dome { opacity: 1; transform: scale(1); }
.av-cleared { border-color: #2b8a3e; background: #f6fbf7; }

@keyframes av-laser-sweep {
  0% { left: 5%; }
  100% { left: 95%; }
}
@keyframes av-sweep {
  0% { opacity: 0; transform: translateX(0); }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateX(340px); }
}

.av-status { min-height: 85px; border-radius: 14px; background: #eef1ef; padding: 14px 18px; }
.av-foot { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.av-demo .go { background: var(--c); border-color: var(--c); color: white; }
.av-count { font-size: 16px; font-weight: 700; color: var(--ink-2); }

.av-limit-list { display: grid; gap: 10px; }
.av-limit-list button { display: flex; align-items: center; gap: 12px; text-align: left; }
.av-limit-icon { font-size: 28px; flex-shrink: 0; }
.av-limit-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.av-limit-body small { font-size: 15px; font-weight: 400; color: var(--ink-2); }
.av-limit-check { font-size: 18px; opacity: 0; font-weight: 800; color: var(--good, #2b8a3e); }
.av-limit-list button[aria-pressed=true] .av-limit-check { opacity: 1; }
.av-demo button:active { transform: translateY(2px); }

@media (max-width: 899px) {
  .av-demo { gap: 12px; }
  .av-machine { min-height: 150px; padding: 14px; }
  .av-sandbox-grid { flex-wrap: wrap; }
}

@media (prefers-reduced-motion: reduce) {
  .av-demo button, .av-box-item { transition: none; }
  .av-running .av-sweep, .av-running .av-laser-beam { animation: none !important; }
}
  `,
};
