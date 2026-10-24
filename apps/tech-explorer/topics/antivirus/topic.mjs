const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });

function scanner(host, params, api) {
  const behavior = params.mode === 'behavior';
  const cases = behavior ? [
    {
      icon: '📄',
      name: '小安的學校作業',
      filename: 'homework.doc',
      sub: '正常文書檔案 (只存自己的作業)',
      activity: '沙盒動態觀察：只儲存正在編輯的文字內容，未碰觸其他任何檔案。',
      flag: false,
      detail: '動作單純未觸發異常，沙盒判定允許正常儲存。這次沒有異常，不代表永遠沒有風險。',
      pattern: '行為監控：單一文字寫入 (正常行為，未觸發警戒)',
      badge: '✅ 行為守規矩',
      filesAffected: [true, false, false, false],
    },
    {
      icon: '🎮',
      name: '假遊戲工具 (未知下載)',
      filename: 'cheat.exe',
      sub: '網路上隨意下載的不知名外掛工具',
      activity: '沙盒動態觀察：偷偷在背景連續瘋狂竄改大量無關個人檔案！',
      flag: true,
      detail: '動作符合勒索軟體特徵！沙盒看門狗緊急攔截，阻止它繼續竄改。這次被攔截，不代表每次都會成功。',
      pattern: '行為監控：狂改多個無關檔案 (符合勒索軟體特徵)',
      badge: '🚨 觸發動態看門狗攔截',
      filesAffected: [true, true, true, true],
    },
  ] : [
    {
      icon: '🦠',
      name: '已知有害木馬程式',
      filename: 'trojan.exe',
      sub: '已列入病毒資料庫黑名單的有害程式',
      activity: '特徵碼比對結果：特徵碼與已知病毒特徵庫完全吻合！',
      flag: true,
      detail: '找到符合的病毒指紋，立即隔離。隔離不等於修好了所有受影響的資料。',
      pattern: '指紋樣式：[▲-◆-■] (命中病毒庫黑名單)',
      badge: '🚨 命中已知病毒特徵碼',
      filesAffected: [],
    },
    {
      icon: '📄',
      name: '範例照片/作業',
      filename: 'photo.jpg',
      sub: '乾淨的正常生活照片檔案',
      activity: '特徵碼比對結果：掃描完畢，未命中任何已知惡意特徵。',
      flag: false,
      detail: '沒有發現威脅，不是保證完全安全。新變種、漏判和誤判都可能發生。',
      pattern: '指紋樣式：[●-★-◆] (非已知病毒特徵)',
      badge: '🟢 未發現已知惡意特徵',
      filesAffected: [],
    },
  ];

  let selected = 0, epoch = 0;
  const seen = new Set();

  host.innerHTML = `
    <div class="gemini-tag" data-created-by="gemini"></div>
    <div class="av-demo">
      <div class="av-lab-header">
        <div class="av-step-indicator">
          <span class="av-step-badge">步驟 1</span>
          <span class="av-step-title">選擇送入檢驗艙的檔案樣本：</span>
        </div>
      </div>

      <div class="av-files" role="tablist">
        ${cases.map((c, i) => `
          <button data-av-file="${i}" aria-pressed="${i === 0}" class="av-file-card" type="button">
            <span class="av-file-icon" aria-hidden="true">${c.icon}</span>
            <div class="av-file-info">
              <div class="av-file-title-row">
                <strong class="av-file-name">${c.name}</strong>
                <code class="av-filename-tag">${c.filename}</code>
              </div>
              <small class="av-file-sub">${c.sub}</small>
            </div>
            <span class="av-file-select-pill">${i === 0 ? '已放入' : '待選取'}</span>
          </button>
        `).join('')}
      </div>

      <!-- High-tech Arcade Inspection Machine -->
      <div class="av-machine" data-mode="${behavior ? 'behavior' : 'patterns'}">
        <div class="av-scanner-head">
          <div class="av-scanner-status-light">
            <div class="av-pulse-dot" aria-hidden="true"></div>
            <div class="av-shield" aria-hidden="true">${behavior ? '🧪' : '🛡️'}</div>
          </div>
          <div class="av-meta">
            <strong class="av-mode">${behavior ? '🧪 動態行為沙盒檢驗艙 (監控檔案改寫動作)' : '🔍 特徵碼比對台 (比對已知病毒特徵庫)'}</strong>
            <p class="av-activity">${cases[0].activity}</p>
            <div class="av-tech-badge">${cases[0].pattern}</div>
          </div>
          <div class="av-siren" aria-hidden="true">🚨</div>
        </div>

        <!-- Testing Chamber -->
        <div class="av-laser-zone">
          <div class="av-laser-beam" aria-hidden="true">
            <div class="av-laser-glow"></div>
          </div>
          <span class="av-sweep" aria-hidden="true">🔎</span>

          <!-- Mode A Specimen Stage -->
          <div class="av-specimen-stage" aria-hidden="true">
            <div class="av-chamber-sample">
              <span class="av-chamber-sample-icon">${cases[0].icon}</span>
              <span class="av-chamber-sample-name">${cases[0].filename}</span>
            </div>
            <div class="av-db-reader">
              <span class="av-db-title">病毒指紋黑名單：</span>
              <span class="av-db-chip">[▲-◆-■ 木馬特徵]</span>
            </div>
          </div>

          <!-- Mode B Virtual Sandbox -->
          <div class="av-sandbox-grid" aria-label="虛擬沙盒受測檔案">
            <div class="av-box-item" data-box="0">
              <span class="av-box-icon">📄</span>
              <span class="av-box-name">學校文件</span>
              <span class="av-box-state">待命</span>
            </div>
            <div class="av-box-item" data-box="1">
              <span class="av-box-icon">🖼️</span>
              <span class="av-box-name">家庭照片</span>
              <span class="av-box-state">待命</span>
            </div>
            <div class="av-box-item" data-box="2">
              <span class="av-box-icon">🎵</span>
              <span class="av-box-name">歡樂音樂</span>
              <span class="av-box-state">待命</span>
            </div>
            <div class="av-box-item" data-box="3">
              <span class="av-box-icon">📊</span>
              <span class="av-box-name">作業報告</span>
              <span class="av-box-state">待命</span>
            </div>
          </div>

          <!-- Pneumatic Quarantine Dome -->
          <div class="av-quarantine-dome" aria-hidden="true">
            <div class="av-dome-hazard-stripe"></div>
            <div class="av-dome-content">
              <span class="av-dome-icon">🫧🔒</span>
              <div class="av-dome-text-group">
                <strong class="av-dome-label">⚠️ 已成功攔截並隔離至安全沙盒！</strong>
                <small class="av-dome-sub">惡意威脅已移至安全隔離區 (Quarantine)，無法危害系統</small>
              </div>
            </div>
          </div>

          <!-- Clean Approval Seal -->
          <div class="av-clean-badge" aria-hidden="true">
            <span class="av-clean-icon">🟢🛡️</span>
            <div class="av-clean-text-group">
              <strong class="av-clean-label">檢驗合格：未發現異常威脅</strong>
              <small class="av-clean-sub">未命中已知黑名單，行為符合安全規範</small>
            </div>
          </div>
        </div>
      </div>

      <div class="av-status" role="status" aria-live="polite">選一個檔案，再按下「開始檢查」。</div>
      <div class="av-foot">
        <button class="go av-scan" type="button">⚡ 開始檢查檔案</button>
        <button class="av-reset-btn" type="button">↺ 重來</button>
        <span class="av-count">已檢查 0/2</span>
      </div>
    </div>
  `;

  const status = host.querySelector('.av-status');
  const machine = host.querySelector('.av-machine');
  const scan = host.querySelector('.av-scan');
  const resetBtn = host.querySelector('.av-reset-btn');
  const activityEl = host.querySelector('.av-activity');
  const badgeEl = host.querySelector('.av-tech-badge');
  const boxes = host.querySelectorAll('.av-box-item');

  const show = () => {
    activityEl.textContent = cases[selected].activity;
    badgeEl.textContent = cases[selected].pattern;
    host.querySelectorAll('[data-av-file]').forEach(b => {
      const val = Number(b.dataset?.avFile || b.getAttribute('data-av-file'));
      const isSel = val === selected;
      b.setAttribute('aria-pressed', String(isSel));
      const pill = b.querySelector('.av-file-select-pill');
      if (pill) pill.textContent = isSel ? '已放入' : '待選取';
    });

    const specIcon = host.querySelector('.av-chamber-sample-icon');
    const specName = host.querySelector('.av-chamber-sample-name');
    if (specIcon) specIcon.textContent = cases[selected].icon;
    if (specName) specName.textContent = cases[selected].filename;

    boxes.forEach(box => {
      box.className = 'av-box-item';
      const st = box.querySelector('.av-box-state');
      if (st) st.textContent = '待命';
    });
  };
  show();

  host.querySelectorAll('[data-av-file]').forEach(b => {
    b.onclick = () => {
      epoch++;
      selected = Number(b.dataset?.avFile || b.getAttribute('data-av-file'));
      machine.classList.remove('av-running', 'av-found', 'av-cleared');
      scan.disabled = false;
      status.textContent = '已選擇「' + cases[selected].name + '」。按下「開始檢查」看看結果。';
      show();
    };
  });

  if (resetBtn) {
    resetBtn.onclick = () => {
      epoch++;
      selected = 0;
      seen.clear();
      machine.classList.remove('av-running', 'av-found', 'av-cleared');
      scan.disabled = false;
      host.querySelector('.av-count').textContent = '已檢查 0/2';
      status.textContent = '已重來。選一個檔案，再按下「開始檢查」。';
      show();
    };
  }

  scan.onclick = () => {
    const ticket = ++epoch, index = selected;
    scan.disabled = true;
    machine.classList.remove('av-running', 'av-found', 'av-cleared');
    void machine.offsetWidth;
    machine.classList.add('av-running');
    status.textContent = behavior
      ? '🧪 動態沙盒執行中……看門狗正在全天候監控程式行為軌跡'
      : '🔍 特徵碼比對中……正在掃描程式碼並比對已知病毒特徵庫';

    boxes.forEach(box => {
      box.className = 'av-box-item';
      const st = box.querySelector('.av-box-state');
      if (st) st.textContent = '監控中';
    });

    if (behavior) {
      if (cases[index].flag) {
        boxes.forEach((box, bi) => {
          api.later(() => {
            if (ticket === epoch) {
              box.classList.add('av-threatened');
              const st = box.querySelector('.av-box-state');
              if (st) st.textContent = '🚨 竄改中!';
            }
          }, (bi + 1) * 80);
        });
      } else {
        api.later(() => {
          if (ticket === epoch) {
            boxes[0].classList.add('av-writing');
            const st = boxes[0].querySelector('.av-box-state');
            if (st) st.textContent = '✓ 正常寫入';
          }
        }, 120);
      }
    }

    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 60 : 500;
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
    }, duration);
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
    <div class="gemini-tag" data-created-by="gemini"></div>
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
      { id: 'patterns', title: '認出已知的有害樣式', text: t('防毒軟體', 'antivirus') + '會用多種方法找威脅，' + t('特徵碼比對', 'signature matching') + '是其中之一。試著檢查兩個假檔案。這裡不會掃描你的裝置。', widget: 'av-scanner', params: { mode: 'patterns' } },
      { id: 'behavior', title: '名字換了，動作仍然可疑', text: '有些防護也看' + t('程式行為', 'behavior monitoring') + '，不只認名字或舊樣式。短時間改寫很多檔案，可能引起警告；但仍可能漏判。比較兩個範例。', widget: 'av-scanner', params: { mode: 'behavior' } },
      { id: 'limits', title: '防毒不是「一定安全」保證書', text: '保護工具有幫助，但會有' + t('誤判', 'false positive') + '和' + t('漏判', 'false negative') + '。它也不能替你判斷每一句話。點點看四種情況。', widget: 'av-limits', params: {} },
      { id: 'layers', title: '多幾層，不靠一面盾牌', text: t('多層防護', 'defense in depth') + '讓一道保護失效時，還有其他機會擋住或復原。每件事該靠什麼？分分看！', widget: 'sort', params: {
        bins: [{ id: 'prevent', label: '降低發生機會', icon: '🚦' }, { id: 'recover', label: '準備復原', icon: '🧰' }],
        rest: 'recover',
        items: [
          { icon: '🔄', label: '安裝官方更新', bin: 'prevent' },
          { icon: '🛡️', label: '保持防護啟用並更新', bin: 'prevent' },
          { icon: '✋', label: '不執行陌生指令', bin: 'prevent' },
          { icon: '💽', label: '保留獨立備份並測試還原', bin: 'recover' },
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
/* Antivirus Lab Layout */
.av-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 14px; font-size: 17px; line-height: 1.55; }
.av-lab-header { display: flex; align-items: center; justify-content: space-between; }
.av-step-indicator { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: var(--ink-2); }
.av-step-badge { font-size: max(15px, 12px); font-weight: 800; padding: 2px 8px; border-radius: 12px; background: #e3f1f6; color: #1a5e73; border: 1px solid #bfdfea; }

/* Files Selection Cards */
.av-files { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.av-file-card { min-height: 66px; min-width: 44px; padding: 12px 14px; font-family: inherit; font-size: 16px; border: 2px solid var(--line); border-radius: 14px; background: var(--card); display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.03); transition: background 150ms, transform 150ms cubic-bezier(.23,1,.32,1), border-color 150ms, box-shadow 150ms; }
.av-file-card:hover { border-color: #216d85; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(33,109,133,0.12); }
.av-file-card:active { transform: translateY(2px); }
.av-file-card[aria-pressed=true] { background: #f0f7f9; border-color: #216d85; box-shadow: 0 0 0 2px rgba(33,109,133,0.2), 0 4px 12px rgba(33,109,133,0.12); }
.av-file-icon { font-size: 32px; flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.av-file-info { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.av-file-title-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.av-file-name { font-size: 15px; font-weight: 800; color: var(--ink); }
.av-filename-tag { font-family: ui-monospace, SFMono-Regular, monospace; font-size: max(15px, 11px); font-weight: 700; background: #e8e6e1; color: #444; padding: 1px 6px; border-radius: 4px; }
.av-file-sub { font-size: max(15px, 13px); font-weight: 400; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.av-file-select-pill { font-size: max(15px, 11px); font-weight: 800; padding: 3px 8px; border-radius: 20px; background: #eae8e3; color: #666; white-space: nowrap; transition: all 150ms; }
.av-file-card[aria-pressed=true] .av-file-select-pill { background: #216d85; color: white; }

/* High-tech Inspection Machine */
.av-machine { position: relative; min-height: 200px; background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.04); transition: border-color 250ms, box-shadow 250ms, background 250ms; }
.av-scanner-head { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 1px solid #f0eee8; }
.av-scanner-status-light { position: relative; width: 48px; height: 48px; border-radius: 12px; background: #f2f6f8; display: flex; align-items: center; justify-content: center; border: 1.5px solid #d0dee3; flex-shrink: 0; }
.av-pulse-dot { position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: #216d85; border: 2px solid white; box-shadow: 0 0 6px #216d85; }
.av-shield { font-size: 26px; }
.av-meta { flex: 1; min-width: 0; }
.av-mode { color: #216d85; font-size: 16px; font-weight: 800; display: block; }
.av-activity { margin: 3px 0 0; font-size: max(15px, 14px); font-weight: 600; color: var(--ink); }
.av-tech-badge { font-family: ui-monospace, SFMono-Regular, monospace; font-size: max(15px, 13px); color: #37535e; background: #edf4f6; border: 1px solid #cfe0e6; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-top: 5px; }
.av-siren { font-size: 28px; opacity: 0; transform: scale(0.6); transition: all 200ms; flex-shrink: 0; }

/* Testing Chamber */
.av-laser-zone { position: relative; min-height: 100px; background: radial-gradient(circle at 50% 50%, #fbfdfd 0%, #f1f6f8 100%); border: 1.5px solid #d4e2e7; border-radius: 14px; display: flex; align-items: center; justify-content: center; padding: 14px; overflow: hidden; }

/* Mode A: Specimen Stage */
.av-machine[data-mode="patterns"] .av-specimen-stage { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; z-index: 1; }
.av-machine[data-mode="behavior"] .av-specimen-stage { display: none; }
.av-chamber-sample { display: flex; align-items: center; gap: 8px; background: white; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #d5e3e8; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
.av-chamber-sample-icon { font-size: 24px; }
.av-chamber-sample-name { font-family: ui-monospace, monospace; font-size: max(15px, 13px); font-weight: 700; color: #216d85; }
.av-db-reader { display: flex; align-items: center; gap: 6px; font-size: max(15px, 12px); font-weight: 700; color: var(--ink-2); }
.av-db-chip { font-family: ui-monospace, monospace; background: #fdf2f2; color: #c92a2a; border: 1px solid #ffc9c9; padding: 2px 8px; border-radius: 6px; }

/* Mode B: Sandbox Grid */
.av-machine[data-mode="behavior"] .av-sandbox-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; z-index: 1; }
.av-machine[data-mode="patterns"] .av-sandbox-grid { display: none; }
.av-box-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 6px; background: white; border: 1.5px solid #dbe6ea; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: all 180ms ease-out; }
.av-box-icon { font-size: 24px; }
.av-box-name { font-size: max(15px, 12px); font-weight: 700; color: var(--ink); }
.av-box-state { font-size: max(15px, 11px); font-weight: 700; color: #216d85; background: #eef6f8; padding: 1px 6px; border-radius: 4px; }
.av-box-item.av-threatened { background: #fff0f0; border-color: #d63333; transform: scale(1.06); box-shadow: 0 0 10px rgba(214,51,51,0.3); animation: av-shake 250ms infinite; }
.av-box-item.av-threatened .av-box-state { background: #d63333; color: white; }
.av-box-item.av-writing { background: #f0faf3; border-color: #2b8a3e; transform: scale(1.04); box-shadow: 0 0 8px rgba(43,138,62,0.25); }
.av-box-item.av-writing .av-box-state { background: #2b8a3e; color: white; }

/* Laser Beam & Sweep */
.av-laser-beam { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #00bcd4; opacity: 0; filter: drop-shadow(0 0 10px #00bcd4); pointer-events: none; z-index: 5; }
.av-laser-glow { position: absolute; left: -16px; top: 0; bottom: 0; width: 36px; background: linear-gradient(90deg, rgba(0,188,212,0) 0%, rgba(0,188,212,0.35) 50%, rgba(0,188,212,0) 100%); pointer-events: none; }
.av-sweep { position: absolute; font-size: 28px; left: 14%; bottom: 8px; opacity: 0; z-index: 4; }

/* Quarantine Containment Dome */
.av-quarantine-dome { position: absolute; inset: 4px; background: rgba(255, 245, 240, 0.97); border: 2.5px solid #d9480f; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; opacity: 0; transform: translateY(-25px) scale(0.92); transition: all 260ms cubic-bezier(.17,1.4,.45,1); pointer-events: none; z-index: 10; box-shadow: 0 8px 24px rgba(217,72,15,0.25); }
.av-dome-hazard-stripe { position: absolute; top: 0; left: 0; right: 0; height: 5px; background: repeating-linear-gradient(45deg, #d9480f, #d9480f 8px, #ffa94d 8px, #ffa94d 16px); border-radius: 9px 9px 0 0; }
.av-dome-content { display: flex; align-items: center; gap: 10px; padding: 0 12px; }
.av-dome-icon { font-size: 34px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15)); }
.av-dome-text-group { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.av-dome-label { font-size: 15px; font-weight: 800; color: #c92a2a; }
.av-dome-sub { font-size: max(15px, 12px); font-weight: 600; color: #8c3b00; }

/* Clean Approval Seal */
.av-clean-badge { position: absolute; inset: 4px; background: rgba(243, 252, 245, 0.97); border: 2.5px solid #2b8a3e; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0; transform: translateY(20px) scale(0.92); transition: all 260ms cubic-bezier(.17,1.4,.45,1); pointer-events: none; z-index: 10; box-shadow: 0 8px 24px rgba(43,138,62,0.15); }
.av-clean-icon { font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12)); }
.av-clean-text-group { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.av-clean-label { font-size: 15px; font-weight: 800; color: #2b8a3e; }
.av-clean-sub { font-size: max(15px, 12px); font-weight: 600; color: #1e6b30; }

/* Interactive Machine States */
.av-running .av-laser-beam { opacity: 1; animation: av-laser-sweep 700ms ease-in-out infinite alternate; }
.av-running .av-sweep { animation: av-sweep 650ms linear; }
.av-running .av-pulse-dot { background: #00bcd4; box-shadow: 0 0 8px #00bcd4; animation: av-blink 300ms infinite alternate; }

.av-found { border-color: #d9480f; background: #fffaf7; box-shadow: 0 6px 20px rgba(217,72,15,0.15); }
.av-found .av-siren { opacity: 1; transform: scale(1.15); animation: av-siren-wiggle 400ms infinite alternate; }
.av-found .av-pulse-dot { background: #d9480f; box-shadow: 0 0 8px #d9480f; }
.av-found .av-quarantine-dome { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

.av-cleared { border-color: #2b8a3e; background: #f6fbf8; box-shadow: 0 6px 20px rgba(43,138,62,0.12); }
.av-cleared .av-pulse-dot { background: #2b8a3e; box-shadow: 0 0 8px #2b8a3e; }
.av-cleared .av-clean-badge { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

@keyframes av-laser-sweep { 0% { left: 4%; } 100% { left: 96%; } }
@keyframes av-siren-wiggle { 0% { transform: scale(1.15) rotate(-12deg); } 100% { transform: scale(1.15) rotate(12deg); } }
@keyframes av-shake { 0%, 100% { transform: translateX(0) scale(1.06); } 25% { transform: translateX(-3px) scale(1.06); } 75% { transform: translateX(3px) scale(1.06); } }
@keyframes av-blink { 0% { opacity: 0.3; } 100% { opacity: 1; } }
@keyframes av-sweep { 0% { opacity: 0; transform: translateX(0); } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(320px); } }

/* Status Display */
.av-status { min-height: 80px; border-radius: 14px; background: #f3f6f7; border: 1.5px solid #dbe6ea; padding: 14px 18px; font-size: 16px; font-weight: 600; color: var(--ink); line-height: 1.5; display: flex; align-items: center; transition: all 200ms; }
.av-found ~ .av-status { background: #fff5f2; border-color: #ffc9b8; color: #9c2718; }
.av-cleared ~ .av-status { background: #f2fbf4; border-color: #b9e6c4; color: #1e6b30; }

/* Foot Controls */
.av-foot { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.av-demo .go.av-scan { min-height: 50px; min-width: 140px; padding: 10px 22px; font-size: 17px; font-weight: 800; border-radius: 14px; background: #216d85; border: 2px solid #216d85; color: white; cursor: pointer; transition: all 180ms cubic-bezier(.2,.8,.4,1); box-shadow: 0 3px 8px rgba(33,109,133,0.3); }
.av-demo .go.av-scan:hover { background: #19586c; transform: translateY(-1px); box-shadow: 0 5px 12px rgba(33,109,133,0.4); }
.av-demo .go.av-scan:active { transform: translateY(2px); box-shadow: 0 1px 3px rgba(33,109,133,0.3); }
.av-demo .go.av-scan:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.av-reset-btn { min-height: 50px; min-width: 80px; padding: 10px 18px; font-family: inherit; font-size: 16px; font-weight: 700; border-radius: 14px; background: #f1f3f4; border: 2px solid #d5dadc; color: var(--ink); cursor: pointer; transition: all 180ms; }
.av-reset-btn:hover { background: #e4e7e9; border-color: #bcc3c6; }
.av-reset-btn:active { transform: translateY(2px); }
.av-count { font-size: 16px; font-weight: 800; color: var(--ink-2); margin-left: auto; }

/* Limits widget preservation */
.av-limit-list { display: grid; gap: 10px; }
.av-limit-list button { min-height: 52px; min-width: 44px; padding: 10px 14px; font-family: inherit; font-size: 17px; font-weight: 700; border: 2px solid var(--line); border-radius: 14px; background: var(--card); display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; transition: background 150ms, transform 150ms cubic-bezier(.23,1,.32,1), border-color 150ms; }
.av-limit-list button[aria-pressed=true] { background: #e3f1f6; border-color: var(--c); }
.av-limit-icon { font-size: 28px; flex-shrink: 0; }
.av-limit-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.av-limit-body small { font-size: 15px; font-weight: 400; color: var(--ink-2); }
.av-limit-check { font-size: 18px; opacity: 0; font-weight: 800; color: var(--good, #2b8a3e); }
.av-limit-list button[aria-pressed=true] .av-limit-check { opacity: 1; }
.av-demo button:active { transform: translateY(2px); }

/* Responsive adjustments */
@media (max-width: 899px) {
  .av-demo { gap: 12px; }
  .av-files { grid-template-columns: 1fr; }
  .av-machine { min-height: 180px; padding: 14px; }
  .av-machine[data-mode="behavior"] .av-sandbox-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
}

.av-demo { gap: 10px; }
.av-machine { padding: 12px; gap: 8px; }
.av-machine[data-mode="behavior"] .av-laser-zone { padding: 8px; }
.av-scanner-head { padding-bottom: 8px; }
.av-status { min-height: 72px; padding: 10px 14px; }

@media (prefers-reduced-motion: reduce) {
  .av-demo button, .av-box-item, .av-quarantine-dome, .av-clean-badge { transition: none !important; }
  .av-running .av-sweep, .av-running .av-laser-beam, .av-box-item.av-threatened, .av-siren { animation: none !important; }
}
  `,
};
