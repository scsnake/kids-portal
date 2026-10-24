const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const card = (id, icon, title, detail, sub = '') =>
  '<div class="bk-store" data-store="' + id + '">' +
    '<div class="bk-store-badge">' + (sub || title) + '</div>' +
    '<span class="bk-icon">' + icon + '</span>' +
    '<strong>' + title + '</strong>' +
    '<span class="bk-detail">' + detail + '</span>' +
    '<span class="bk-health-badge">🟢 狀態完好</span>' +
  '</div>';

function frame(host, body, controls, note) {
  host.innerHTML = '<div class="gemini-tag" data-created-by="gemini"></div><div class="bk-demo">' + body + '<div class="bk-status" role="status" aria-live="polite">' + note + '</div><div class="bk-controls">' + controls + '</div></div>';
  return host.querySelector('.bk-status');
}

function copies(host, _, api) {
  let separate = false;
  const status = frame(
    host,
    '<div class="bk-copies-scene">' +
      '<div class="bk-row">' +
        card('original', '💻', '原本的硬碟', '🖼️ 照片一份', '主要電腦') +
        card('copy', '📁', '同一顆硬碟', '🖼️ 複製一份', '備份位置') +
      '</div>' +
      '<div class="bk-hardware-note">儲存配置：<b class="bk-hw-status">都在同一顆硬碟的分割區</b></div>' +
    '</div>',
    '<button data-copy="same" aria-pressed="true">放同一顆硬碟</button>' +
    '<button data-copy="other" aria-pressed="false">改存外接硬碟</button>' +
    '<button class="go bk-fail">模擬原硬碟故障</button>' +
    '<button class="bk-copies-reset" type="button">↺ 重來</button>',
    '兩份檔案不一定能避開同一次故障。換個位置試試。'
  );

  function draw() {
    const orig = host.querySelector('[data-store="original"]');
    orig.classList.remove('bk-lost');
    const origBadge = orig.querySelector('.bk-health-badge');
    if (origBadge) origBadge.textContent = '🟢 狀態完好';

    const c = host.querySelector('[data-store="copy"]');
    c.classList.remove('bk-lost', 'bk-safe');
    c.querySelector('.bk-icon').textContent = separate ? '💽' : '📁';
    c.querySelector('strong').textContent = separate ? '另一個儲存裝置' : '同一顆硬碟';
    c.querySelector('.bk-detail').textContent = '🖼️ 複製一份';
    c.querySelector('.bk-store-badge').textContent = separate ? '獨立外接硬碟' : '同一硬碟資料夾';
    const cBadge = c.querySelector('.bk-health-badge');
    if (cBadge) cBadge.textContent = '🟢 狀態完好';

    host.querySelector('.bk-hw-status').textContent = separate ? '分開在獨立的外接裝置上' : '都在同一顆硬碟的分割區';
    host.querySelectorAll('[data-copy]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.copy === 'other') === separate)));
    status.textContent = separate ? '副本在另一個裝置。再模擬原硬碟故障。' : '副本仍在原硬碟上，會一起受到同一次硬碟故障影響。';
  }

  host.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { separate = b.dataset.copy === 'other'; draw(); });
  host.querySelector('.bk-fail').onclick = () => {
    const orig = host.querySelector('[data-store="original"]');
    orig.classList.add('bk-lost');
    const origBadge = orig.querySelector('.bk-health-badge');
    if (origBadge) origBadge.textContent = '💥 磁區壞軌損毀！';

    const c = host.querySelector('[data-store="copy"]');
    c.classList.toggle('bk-lost', !separate);
    c.classList.toggle('bk-safe', separate);
    const cBadge = c.querySelector('.bk-health-badge');
    if (cBadge) cBadge.textContent = separate ? '✅ 副本完好安全！' : '💥 一起損毀無法讀取！';

    status.textContent = separate ?
      '✅ 原硬碟故障，但另一個裝置上的副本還在。接著還要考慮火災、失竊和惡意程式。' :
      '⚠️ 同一顆硬碟壞掉，兩份都無法讀取。改存另一個裝置，再試一次。';
    if (separate) api.done(); else api.bad();
  };

  const resetBtn = host.querySelector('.bk-copies-reset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      separate = false;
      draw();
      status.textContent = '已重來。試著點選「改存外接硬碟」，再模擬硬碟故障！';
    };
  }
}

function sync(host, _, api) {
  let locked = false;
  const status = frame(
    host,
    '<div class="bk-sync-scene">' +
      '<div class="bk-row">' +
        card('device', '💻', '這台電腦', '🖼️ 現在的檔案') +
        '<div class="bk-sync-arrow" aria-hidden="true"><span>⇄</span><small>即時同步傳播</small></div>' +
        card('sync', '☁️', '同步資料夾', '🖼️ 跟著變動') +
        card('history', '🕰️', '另有版本記錄', '🖼️ 昨天的版本') +
      '</div>' +
      '<p class="bk-caption">這個範例的雲端另外保留舊版本；各家服務的功能和保存期限不同。</p>' +
    '</div>',
    '<button class="bk-lock">模擬檔案被鎖住</button><button class="go bk-version">找出可用的舊版本</button>',
    '同步會跟著變動。舊版本和獨立備份，是另外的保護。'
  );

  host.querySelector('.bk-lock').onclick = () => {
    locked = true;
    for (const id of ['device', 'sync']) {
      const c = host.querySelector('[data-store="' + id + '"]');
      c.classList.add('bk-lost');
      c.querySelector('.bk-detail').textContent = '🔒 現在的檔案被鎖住';
    }
    host.querySelector('[data-store="history"]').classList.remove('bk-safe');
    status.textContent = '⚠️ 這個範例把變更同步過去了，兩邊目前的檔案都被鎖住。看看有沒有另外保留舊版本。';
  };

  host.querySelector('.bk-version').onclick = () => {
    if (!locked) {
      status.textContent = '先模擬檔案被鎖住，再比較現在的檔案和舊版本。';
      return;
    }
    host.querySelector('[data-store="history"]').classList.add('bk-safe');
    status.textContent = '✅ 找到可用舊版本。這只是挑選版本；要先處理受影響的裝置，再由可信任的人協助還原。';
    api.done();
  };
}

function plan(host, _, api) {
  const selected = new Set();
  const status = frame(
    host,
    '<div class="bk-row">' +
      card('original', '💻', '原本的一份', '電腦的 SSD') +
      card('disk', '💽', '外接備份', '另一顆 HDD 硬碟') +
      card('cloud', '☁️', '異地備份', '雲端備份服務') +
    '</div>' +
    '<div class="bk-count">目前：1 份、1 種儲存方式、0 份異地</div>',
    '<button data-plan="same">同資料夾再複製</button>' +
    '<button data-plan="disk" aria-pressed="false">加入外接備份</button>' +
    '<button data-plan="cloud" aria-pressed="false">加入異地雲端備份</button>',
    '試著安排：含原檔共三份、至少兩種儲存方式，其中一份在別的地方。'
  );

  host.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => {
    const id = b.dataset.plan;
    if (id === 'same') {
      status.textContent = '同資料夾的副本仍怕同一顆硬碟故障，也沒有放到別的地方。';
      api.bad();
      return;
    }
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    b.setAttribute('aria-pressed', String(selected.has(id)));
    const c = host.querySelector('[data-store="' + id + '"]');
    c.classList.toggle('bk-safe', selected.has(id));
    c.querySelector('.bk-detail').textContent = selected.has(id) ?
      (id === 'disk' ? 'HDD 備份，平時離線' : '不同地點，保留舊版本') :
      (id === 'disk' ? '另一顆 HDD 硬碟' : '雲端備份服務');
    host.querySelector('.bk-count').textContent = '目前：' + (1 + selected.size) + ' 份、' + (1 + selected.size) + ' 種儲存方式、' + (selected.has('cloud') ? 1 : 0) + ' 份異地';
    status.textContent = selected.size === 2 ?
      '✅ 這是 3-2-1 的一種安排。還要定期更新備份、保護存取權限，並測試能否還原。' :
      '再加上不同儲存方式，以及不同地點的一份。';
    if (selected.size === 2) api.done();
  });
}

function protectedCopy(host, _, api) {
  let connected = true;
  const status = frame(
    host,
    '<div class="bk-row bk-airgap-row">' +
      card('pc', '💻', '受影響的電腦', '🖼️ 範例檔案') +
      '<div class="bk-cable" aria-label="連接狀態">' +
        '<div class="bk-plug-wire"></div>' +
        '<span class="bk-plug-icon">🔌</span>' +
        '<span class="bk-cable-status">目前接著</span>' +
      '</div>' +
      card('backup', '💽', '外接備份', '🖼️ 備份一份') +
    '</div>',
    '<button class="bk-disconnect" aria-pressed="false">中斷備份連接</button><button class="go bk-attack">模擬惡意改寫</button>',
    '這個簡化範例假設程式能改寫接上的硬碟。先試試，再改變連接狀態。'
  );

  host.querySelector('.bk-disconnect').onclick = () => {
    connected = !connected;
    const b = host.querySelector('.bk-disconnect');
    b.setAttribute('aria-pressed', String(!connected));
    b.textContent = connected ? '中斷備份連接' : '重新接上（模擬）';
    const cable = host.querySelector('.bk-cable');
    cable.classList.toggle('bk-off', !connected);
    cable.querySelector('.bk-cable-status').textContent = connected ? '目前接著' : '離線隔離 (Air Gap)';
    cable.querySelector('.bk-plug-icon').textContent = connected ? '🔌' : '⚡';
    for (const c of host.querySelectorAll('.bk-store')) {
      c.classList.remove('bk-lost', 'bk-safe');
      const badge = c.querySelector('.bk-health-badge');
      if (badge) badge.textContent = '🟢 狀態完好';
    }
    status.textContent = connected ?
      '範例已重設。接上的硬碟可能被這個程式一起改寫。' :
      '範例已重設。備份平時離線，現在再試一次。';
  };

  host.querySelector('.bk-attack').onclick = () => {
    const pc = host.querySelector('[data-store="pc"]');
    pc.classList.add('bk-lost');
    const pcBadge = pc.querySelector('.bk-health-badge');
    if (pcBadge) pcBadge.textContent = '💥 電腦遭改寫/損毀！';

    const backup = host.querySelector('[data-store="backup"]');
    backup.classList.toggle('bk-lost', connected);
    backup.classList.toggle('bk-safe', !connected);
    const bBadge = backup.querySelector('.bk-health-badge');
    if (bBadge) bBadge.textContent = connected ? '💥 連線中被一起改寫！' : '✅ 離線拔插頭，安全！';

    status.textContent = connected ?
      '⚠️ 這次連備份也被改寫。中斷備份連接後，再比較一次。' :
      '✅ 離線備份沒有被這次程式改寫。備份時才連接；受感染時，不要為了還原就急著接回去。';
    if (!connected) api.done(); else api.bad();
  };
}

function testRestore(host, _, api) {
  let healthy = false, clean = false;
  const status = frame(
    host,
    '<div class="bk-row">' +
      card('source', '💽', '選擇備份', '🔒 不可用的版本', '備份來源') +
      card('target', '💻', '測試裝置', '尚未確認乾淨', '還原目標') +
    '</div>' +
    '<div class="bk-preview-stage">' +
      '<div class="bk-screen">' +
        '<div class="bk-screen-head">還原測試螢幕</div>' +
        '<div class="bk-preview">還原後，應該看見：🌳 昨天畫的樹</div>' +
      '</div>' +
    '</div>',
    '<button class="bk-healthy" aria-pressed="false">改選可用備份版本</button>' +
    '<button class="bk-clean" aria-pressed="false">確認使用乾淨裝置</button>' +
    '<button class="go bk-test">開始還原測試</button>',
    '先選備份、確認裝置，再試著開啟還原的檔案。這裡不會處理真檔案。'
  );

  const resetResult = () => {
    host.querySelector('[data-store="target"]').classList.remove('bk-safe');
    host.querySelector('.bk-preview').textContent = '尚未還原。測試後應該看見：🌳 昨天畫的樹';
    host.querySelector('.bk-preview-stage').classList.remove('bk-preview-ok');
    status.textContent = '設定已變更，請重新測試能否還原。';
  };

  host.querySelector('.bk-healthy').onclick = () => {
    resetResult();
    healthy = !healthy;
    host.querySelector('.bk-healthy').setAttribute('aria-pressed', String(healthy));
    host.querySelector('[data-store="source"] .bk-detail').textContent = healthy ? '🖼️ 可用的舊版本' : '🔒 不可用的版本';
  };

  host.querySelector('.bk-clean').onclick = () => {
    resetResult();
    clean = !clean;
    host.querySelector('.bk-clean').setAttribute('aria-pressed', String(clean));
    host.querySelector('[data-store="target"] .bk-detail').textContent = clean ? '已由可信任的人確認乾淨' : '尚未確認乾淨';
  };

  host.querySelector('.bk-test').onclick = () => {
    resetResult();
    if (!clean) {
      status.textContent = '⚠️ 先確認使用乾淨的裝置，避免還原的檔案再次受影響。';
      api.bad();
      return;
    }
    if (!healthy) {
      status.textContent = '⚠️ 這份備份無法開啟。請檢查日期，改選可用的版本。';
      api.bad();
      return;
    }
    host.querySelector('[data-store="target"]').classList.add('bk-safe');
    host.querySelector('.bk-preview').textContent = '🌳 昨天畫的樹：已還原，能正常開啟！';
    host.querySelector('.bk-preview-stage').classList.add('bk-preview-ok');
    status.textContent = '✅ 還原測試成功。不只要「有備份」，還要知道它能還原哪些日期的檔案。';
    api.done();
  };
}

export default {
  ready: true,
  unit: {
    id: 'backupplan',
    part: 'adv',
    icon: '💽',
    color: '#39734b',
    title: '備份：還有另一份',
    en: 'Backups and Recovery',
    desc: '同步不等於獨立備份，準備好可用的版本和復原方法',
    slides: [
      { id: 'copies', title: '兩份，都在同一顆硬碟？', text: t('備份', 'backup') + '要能幫你度過意外。原檔和副本都放在同一顆硬碟，硬碟壞掉時可能一起讀不到。換個地方試試！', widget: 'bk-copies', params: {} },
      { id: 'sync', title: '同步也會跟著出錯', text: t('同步', 'sync') + '讓資料跟著變動，刪除或鎖檔也可能傳過去。' + t('版本記錄', 'version history') + '和獨立備份，是另外的保護。看看這個範例。', widget: 'bk-sync', params: {} },
      { id: 'plan', title: '3-2-1：分開放，多一份', text: t('3-2-1 備份', '3-2-1 backup') + '是一個安排原則：含原檔至少三份、兩種儲存媒體、一份放異地。範例用 SSD、HDD，再加異地雲端備份。', widget: 'bk-plan', params: {} },
      { id: 'protected', title: '別讓壞程式連備份都改掉', text: '勒索軟體可能改寫它能存取的備份。' + t('離線備份', 'offline backup') + '平時不接著；受保護的雲端版本，也能增加一道防線。比較看看。', widget: 'bk-protected', params: {} },
      { id: 'test', title: '真的還原得回來嗎？', text: t('還原測試', 'restore test') + '是在需要之前，確認備份能讀、檔案完整。選好版本，在乾淨的範例裝置試試。', widget: 'bk-test', params: {} },
      { id: 'response', title: '遇到勒索軟體，先求助', text: '先隔離受影響的裝置，不付贖金，請可信任的人協助。處理感染後，再用乾淨裝置和可用備份還原。排排看！', widget: 'order', params: { items: [
        { icon: '📴', label: '中斷受影響裝置的網路連線' },
        { icon: '🧑', label: '告訴可信任的大人或專業人員' },
        { icon: '🛡️', label: '由專業人員處理感染，準備乾淨裝置' },
        { icon: '💽', label: '挑選可用備份，再還原並檢查' },
      ] } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '從備份找回檔案後，就代表被偷走的資料也收回來了嗎？',
        options: [
          { text: '🙅 不代表。復原檔案不能撤回已外洩的資料', correct: true },
          { text: '✅ 有備份，壞人那邊的副本就會消失' },
          { text: '☁️ 只要同步，所有風險都沒了' },
        ],
        explain: '備份幫助恢復資料，但不能取消已發生的外洩。仍要請可信任的人協助保護帳號、評估影響。',
      } },
    ],
  },
  placement: { after: 'antivirus', stage: 'defense' },
  prerequisites: ['antivirus', 'handy', 'hacked'],
  readme: 'Separate backup copies, sync propagation, version history, 3-2-1 planning, offline protection, restore tests, and ransomware recovery.',
  changelog: '新增「備份：還有另一份」：模擬同步傳播、3-2-1、離線備份與乾淨裝置上的還原測試。',
  widgets: { 'bk-copies': copies, 'bk-sync': sync, 'bk-plan': plan, 'bk-protected': protectedCopy, 'bk-test': testRestore },
  checks: {
    copies: [click('.bk-fail'), expect('.bk-status', '兩份都無法讀取'), click('[data-copy="other"]'), click('.bk-fail'), expect('.bk-status', '副本還在')],
    sync: [click('.bk-lock'), expect('.bk-status', '兩邊目前'), click('.bk-version'), expect('.bk-status', '找到可用舊版本')],
    plan: [click('[data-plan="same"]'), expect('.bk-status', '同一顆硬碟'), click('[data-plan="cloud"]'), expect('.bk-count', '2 份、2 種'), click('[data-plan="disk"]'), expect('.bk-count', '3 份、3 種')],
    protected: [click('.bk-attack'), expect('.bk-status', '備份也被改寫'), click('.bk-disconnect'), click('.bk-attack'), expect('.bk-status', '沒有被這次程式改寫')],
    test: [click('.bk-test'), expect('.bk-status', '先確認'), click('.bk-clean'), click('.bk-test'), expect('.bk-status', '無法開啟'), click('.bk-healthy'), click('.bk-test'), expect('.bk-status', '還原測試成功'), click('.bk-healthy'), click('.bk-test'), expect('.bk-status', '無法開啟'), expect('.bk-preview', '尚未還原'), { action: 'expectCount', selector: '.bk-safe', count: 0 }, click('.bk-healthy'), click('.bk-test'), expect('.bk-status', '還原測試成功')],
  },
  css: `
.bk-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 14px; font-size: 18px; line-height: 1.5; }
.bk-row { display: flex; justify-content: center; gap: 12px; align-items: stretch; position: relative; }
.bk-store { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 8px; text-align: center; padding: 16px 10px; background: #fdfdfd; border: 2.5px solid #8ce99a; border-radius: 18px; min-height: 165px; transition: all 250ms cubic-bezier(.23,1,.32,1); position: relative; box-shadow: 0 4px 12px rgba(43,138,62,0.08); }
.bk-store-badge { font-size: max(15px, 14px); font-weight: 700; color: var(--ink-2); background: #f1eee8; padding: 2px 8px; border-radius: 6px; align-self: center; }
.bk-icon { font-size: 42px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08)); }
.bk-detail { font-size: 15px; overflow-wrap: anywhere; }
.bk-health-badge { display: inline-block; font-size: max(15px, 13px); font-weight: 800; padding: 2px 8px; border-radius: 6px; background: #ebfbee; color: #2b8a3e; border: 1px solid #b2f2bb; margin-top: 2px; }

/* Non-broken vs Broken Visual Differentiation */
.bk-store.bk-lost { background: #fff5f5 !important; border: 2.5px dashed #e03131 !important; transform: translateY(4px) scale(0.98); box-shadow: 0 4px 18px rgba(224, 49, 49, 0.25) !important; animation: bk-shake-damage 0.4s ease; }
.bk-store.bk-lost .bk-icon { filter: drop-shadow(0 0 10px #ff6b6b) grayscale(0.6); }
.bk-store.bk-lost .bk-detail { color: #c92a2a; text-decoration: line-through; }
.bk-store.bk-lost .bk-health-badge { background: #ffe3e3; color: #c92a2a; border-color: #ffa8a8; }
.bk-store.bk-safe { background: #e6fcf5 !important; border: 2.5px solid #2b8a3e !important; box-shadow: 0 4px 16px rgba(43, 138, 62, 0.25) !important; }
.bk-store.bk-safe .bk-health-badge { background: #d3f9d8; color: #2b8a3e; border-color: #8ce99a; }

@keyframes bk-shake-damage {
  0%, 100% { transform: translateY(4px) translateX(0); }
  20% { transform: translateY(4px) translateX(-6px); }
  40% { transform: translateY(4px) translateX(6px); }
  60% { transform: translateY(4px) translateX(-4px); }
  80% { transform: translateY(4px) translateX(4px); }
}

.bk-hardware-note { text-align: center; font-size: 15px; color: var(--ink-2); margin-top: 4px; }
.bk-hw-status { color: var(--c); font-weight: 700; }

.bk-sync-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 26px; color: var(--c); padding: 0 4px; }
.bk-sync-arrow small { font-size: 15px; color: var(--ink-2); text-align: center; white-space: nowrap; }

/* Physical Air Gap Cable Styling */
.bk-airgap-row { align-items: center; }
.bk-cable { min-width: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; position: relative; padding: 0 6px; }
.bk-plug-wire { width: 100%; height: 4px; background: var(--line, #ddd); border-radius: 2px; position: absolute; top: 20px; z-index: 1; }
.bk-plug-icon { font-size: 32px; line-height: 1; z-index: 2; background: var(--card, #fff); border-radius: 50%; padding: 4px; transition: transform 250ms cubic-bezier(.34,1.56,.64,1); }
.bk-cable-status { font-size: 15px; font-weight: 700; text-align: center; color: var(--good, #2b8a3e); white-space: nowrap; }
.bk-cable.bk-off .bk-plug-icon { transform: translateX(-16px); }
.bk-cable.bk-off .bk-cable-status { color: #b77926; }
.bk-cable.bk-off .bk-plug-wire { border-top: 2px dashed #b77926; background: transparent; }

/* Restore Screen */
.bk-preview-stage { background: var(--card); border: 2px solid var(--line); border-radius: 14px; padding: 12px; transition: all 250ms; }
.bk-screen { display: flex; flex-direction: column; gap: 6px; }
.bk-screen-head { font-size: 15px; font-weight: 700; color: var(--ink-2); }
.bk-preview { font-weight: 700; text-align: center; padding: 12px; background: #faf9f6; border: 1px dashed var(--line); border-radius: 10px; font-size: 16px; }
.bk-preview-stage.bk-preview-ok { border-color: var(--good); background: #f6fbf7; }
.bk-preview-stage.bk-preview-ok .bk-preview { border-style: solid; border-color: var(--good); background: #e6f3e8; color: #2b8a3e; }

.bk-status { padding: 14px 18px; border-radius: 14px; background: #eef1e9; min-height: 85px; }
.bk-controls { display: flex; flex-wrap: wrap; gap: 10px; }
.bk-demo button { min-width: 44px; min-height: 52px; font-size: 17px; padding: 10px 14px; background: var(--card); border: 2px solid var(--line); border-radius: 14px; font-weight: 700; transition: transform 150ms cubic-bezier(.23,1,.32,1), background 150ms; }
.bk-demo button[aria-pressed=true] { border-color: var(--c); background: #e6f3e8; }
.bk-demo .go { background: var(--c); color: white; border-color: var(--c); }
.bk-caption { font-size: 15px; margin: 4px 0 0; color: var(--ink-2); text-align: center; }
.bk-count { font-weight: 700; text-align: center; padding: 10px; background: var(--card); border-radius: 12px; border: 1px solid var(--line); font-size: 15px; }

@media (max-width: 899px) {
  .bk-demo { gap: 12px; }
  .bk-store { min-height: 135px; padding: 12px 6px; }
  .bk-status { min-height: 80px; }
}

@media (prefers-reduced-motion: reduce) {
  .bk-store, .bk-plug-icon { transition: none; }
  .bk-store.bk-lost { transform: none; }
}
  `,
};
