const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

// A drawn sponsored post from a made-up finance celebrity. Four parts are clues; a tap on
// any other part of the post only says to look again. The countdown ticks like a real ad.
const CLUES = {
  promise: ['保證獲利', '「保證獲利、穩賺不賠」：投資一定有風險，說「保證」的就是警訊。'],
  face: ['名人照片', '名人的照片和名字很容易被盜用，本人可能根本不知道這個廣告。'],
  limit: ['限額倒數', '「限額、倒數」：催你快點決定，讓你沒時間查證。'],
  line: ['拉進群組', '不是找合法的公司，而是拉你進 LINE 群組，聽「老師」的話。'],
};

function ad(host, _, api) {
  host.innerHTML = `
    <div class="is-demo">
      <div class="is-post">
        <div class="is-top"><span class="is-avatar" aria-hidden="true">👨‍💼</span><div><b>財經名人 林大明</b><small>贊助</small></div></div>
        <p class="is-text"><span class="is-c" data-clue="promise">每月保證獲利 30%，穩賺不賠！</span>跟著我，退休金翻倍。</p>
        <div class="is-c is-photo" data-clue="face"><span aria-hidden="true">👨‍💼🎙️</span><small>林大明上節目的照片</small></div>
        <div class="is-c is-limit" data-clue="limit">⏰ 限額 50 名・倒數 <b class="is-clock">02:59</b></div>
        <div class="is-c is-join" data-clue="line">加入免費 LINE 投資群組</div>
        <p class="is-likes">👍 2.3 萬　💬 1,024 則留言</p>
      </div>
      <div class="is-chips">${Object.entries(CLUES).map(([id, c]) => `<span class="is-chip" data-chip="${id}">❔ ${c[0]}</span>`).join('')}</div>
      <p class="is-status" role="status" aria-live="polite">點廣告裡可疑的地方。<b class="is-count">0/4</b></p>
    </div>`;
  const found = new Set();
  const status = host.querySelector('.is-status');

  let secs = 179;
  const tick = () => {
    if (!api.alive()) return;
    secs = secs > 0 ? secs - 1 : 179;
    host.querySelector('.is-clock').textContent = '0' + Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    api.later(tick, 1000);
  };
  api.later(tick, 1000);

  host.querySelector('.is-post').addEventListener('click', e => {
    const c = e.target.closest('[data-clue]');
    if (!c) {
      status.innerHTML = '再找找看。<b class="is-count">' + found.size + '/4</b>';
      return;
    }
    const id = c.dataset.clue;
    if (found.has(id)) return;
    found.add(id);
    c.classList.add('is-found');
    const chip = host.querySelector('[data-chip="' + id + '"]');
    chip.textContent = '🚩 ' + CLUES[id][0];
    chip.classList.add('is-got');
    api.good();
    status.innerHTML = CLUES[id][1] + ' <b class="is-count">' + found.size + '/4</b>';
    if (found.size === 4) {
      status.innerHTML = '🎉 4 個警訊都找到了！這是假名人廣告。<b class="is-count">4/4</b>';
      api.done();
    }
  });
}

// An investment group chat. Tap each member to see who they really are.
const MEMBERS = [
  { icon: '👨‍💼', name: '林老師', says: '明天這支股票一定大漲，跟上！📈', who: '冒用名人的詐騙集團' },
  { icon: '👩‍💻', name: '助理小珍', says: '老師太準了！還沒跟的快私訊我', who: '同一夥人，負責叫你匯錢' },
  { icon: '👵', name: '阿美', says: '昨天賺了 5 萬，謝謝老師 🙏', who: '暗樁：假裝是學生，說自己賺錢' },
  { icon: '🧔', name: '小李', says: '我也是！截圖給大家看 📊', who: '暗樁：獲利截圖是做出來的' },
  { icon: '👩', name: '王姐', says: '我已經加碼 50 萬了！', who: '暗樁：假裝加碼，讓你跟著加' },
];

function group(host, _, api) {
  host.innerHTML = `
    <div class="is-demo">
      <div class="is-chat">
        <p class="is-chat-head">💰 林老師財富自由群（200 人）</p>
        <div class="is-msgs">${MEMBERS.map(m => `<p class="is-msg"><b>${m.icon} ${m.name}</b>${m.says}</p>`).join('')}</div>
      </div>
      <div class="is-members">${MEMBERS.map((m, i) => `
        <button class="is-member" data-member="${i}" aria-pressed="false">
          <span class="is-m-icon" aria-hidden="true">${m.icon}</span><span class="is-m-name">${m.name}</span>
        </button>`).join('')}</div>
      <p class="is-reveal" role="status" aria-live="polite">點每個人，看看他到底是誰。</p>
    </div>`;
  const seen = new Set();
  const reveal = host.querySelector('.is-reveal');
  host.querySelector('.is-members').addEventListener('click', e => {
    const b = e.target.closest('[data-member]');
    if (!b) return;
    const i = Number(b.dataset.member);
    if (seen.has(i)) return;
    seen.add(i);
    b.setAttribute('aria-pressed', 'true');
    b.classList.add('is-unmasked');
    b.querySelector('.is-m-icon').textContent = '🎭';
    api.good();
    reveal.textContent = MEMBERS[i].name + '：' + MEMBERS[i].who + '（' + seen.size + '/' + MEMBERS.length + '）';
    if (seen.size === MEMBERS.length) {
      reveal.textContent = '😮 群組有 200 人，可是真正想投資的「學生」，可能只有你一個。';
      reveal.classList.add('is-all');
      api.done();
    }
  });
}

export default {
  ready: true,
  unit: {
    id: 'investscam',
    part: 'basic',
    icon: '📉',
    color: '#2b6e5f',
    title: '投資群組和假名人廣告',
    en: 'Investment Groups and Fake Celebrity Ads',
    desc: '認出假名人廣告和投資群組的套路，陪家人一起查證',
    slides: [
      {
        id: 'ad',
        title: '名人真的在找你投資？',
        text: `${t('假名人廣告', 'fake celebrity ad')}會盜用名人的照片和名字，說跟著他就能賺錢。它在可信度階梯的最下面：詐騙。找出 4 個可疑的地方！`,
        widget: 'is-ad',
        params: {},
      },
      {
        id: 'group',
        title: '群組裡的人，都是真的嗎？',
        text: `${t('投資群組', 'investment group')}裡的「老師」、「助理」，和一直說賺錢的成員，可能都是同一夥人，叫做${t('暗樁', 'shill')}。點每個人看看！`,
        widget: 'is-group',
        params: {},
      },
      {
        id: 'path',
        title: '假投資的套路',
        text: '假投資常常照著同一套步驟走。先讓你小賺，你才會放心匯更多錢。越早停下來，損失越少。排排看！',
        widget: 'order',
        params: {
          items: [
            { icon: '📱', label: '看到名人投資廣告' },
            { icon: '💬', label: '加入群組，「老師」報明牌' },
            { icon: '💵', label: '先讓你小賺一點' },
            { icon: '🏦', label: '叫你下載 App，匯更多錢到個人帳戶' },
            { icon: '🔒', label: '想領錢，要先繳「保證金」，結果領不出來' },
          ],
        },
      },
      {
        id: 'words',
        title: '聽到這些話，要小心',
        text: '合法的投資公司會提醒你有風險，也不會跟你約見面收現金。哪些是詐騙的警訊？分分看！',
        widget: 'sort',
        params: {
          bins: [
            { id: 'scam', icon: '🚩', label: '詐騙警訊' },
            { id: 'ok', icon: '✅', label: '合法公司會這樣' },
          ],
          rest: 'ok',
          items: [
            { icon: '🤫', label: '有內線消息，明天一定漲', bin: 'scam' },
            { icon: '🏧', label: '把錢匯到個人帳戶', bin: 'scam' },
            { icon: '🤝', label: '派人來拿現金（面交）', bin: 'scam' },
            { icon: '📄', label: '傳「金管會核准」的圖片要你放心', bin: 'scam' },
            { icon: '⚖️', label: '提醒你：投資有賺也有賠', bin: 'ok' },
            { icon: '🔍', label: '在金管會證期局網站查得到', bin: 'ok' },
            { icon: '⏳', label: '讓你慢慢考慮，不催你', bin: 'ok' },
            { icon: '💯', label: '保證獲利、穩賺不賠', bin: 'scam' },
          ],
        },
      },
      {
        id: 'help',
        title: '陪家人一起查證',
        text: `根據 165 打詐儀錶板，2025 年台灣被騙走最多錢的，是假投資。家人想投資時，可以陪他一起查證。選選看！`,
        widget: 'chatpick',
        params: {
          name: '💬 阿公',
          messages: ['我加入一個投資群組，老師超準的！', '老師叫我明天匯 10 萬到助理的帳戶'],
          steps: [
            {
              ask: '阿公要匯錢了，你先怎麼做？',
              options: [
                { text: '✋ 請阿公先不要匯', ok: true, act: '✋ 阿公先停下來了' },
                { text: '👍 老師很準，快匯', why: '匯到助理的個人帳戶，是很大的警訊。先停下來。' },
                { text: '🤐 不關我的事', why: '阿公需要你提醒。家人一起想，比較不會被騙。' },
              ],
            },
            {
              ask: '接下來，要怎麼查證？',
              options: [
                { text: '📞 打 165 反詐騙專線問問看', ok: true, act: '📞 165 說：這是假投資的手法' },
                { text: '💬 在群組裡問老師是不是真的', why: '群組裡的人可能都是同一夥人，他們一定說是真的。' },
              ],
            },
            {
              ask: '還可以怎麼確認？',
              options: [
                { text: '🔍 上金管會證期局網站，查是不是合法公司', ok: true, act: '🔍 查不到這家公司' },
                { text: '📊 看群組裡大家的獲利截圖', why: '截圖可以做假，不能當證據。' },
              ],
            },
            {
              ask: '最後呢？',
              options: [
                { text: '👨‍👩‍👧 告訴其他家人，一起提醒阿公', ok: true, act: '👨‍👩‍👧 全家一起幫忙' },
                { text: '🙈 怕阿公丟臉，誰都不說', why: '被騙不丟臉。家人知道了，才能一起幫忙。' },
              ],
            },
          ],
          end: '🎉 你幫阿公守住了錢！有疑問，就打 165。',
        },
      },
      {
        id: 'quiz',
        title: '考考你',
        widget: 'choice',
        params: {
          question: '群組「老師」說：「先繳 20% 保證金，才能把賺的錢領出來。」這代表什麼？',
          options: [
            { text: '🚩 很可能是詐騙，先停下來，打 165', correct: true },
            { text: '✅ 正常手續，繳了就能領' },
            { text: '💰 再多匯一點，可以賺更多' },
          ],
          explain: '合法公司不會要你先繳錢，才讓你領自己的錢。越繳越多，錢也領不回來。',
        },
      },
    ],
  },
  placement: { after: 'adcopy', stage: 'seethrough' },
  prerequisites: ['adcopy', 'safety', 'pay'],
  readme: 'Find the clues in a fake celebrity investment ad, unmask the shills in an investment group chat, order the fake-investment path, sort warning words, and help a grandparent verify with 165 and the FSC licensed list.',
  changelog: '新增「投資群組和假名人廣告」：在假的名人廣告裡找警訊，揭開投資群組裡的「老師」和暗樁，認識假投資的套路，並練習陪家人打 165、上金管會證期局查證。',
  widgets: { 'is-ad': ad, 'is-group': group },
  checks: {
    ad: [
      click('.is-likes'), expect('.is-status', '再找找看'),
      click('[data-clue="promise"]'),
      click('[data-clue="face"]'),
      click('[data-clue="limit"]'),
      click('[data-clue="line"]'),
      expect('.is-count', '4/4'),
      { action: 'expectCount', selector: '.is-chip.is-got', count: 4 },
    ],
    group: [
      click('[data-member="0"]'),
      click('[data-member="1"]'),
      click('[data-member="2"]'),
      click('[data-member="3"]'),
      click('[data-member="4"]'),
      expect('.is-reveal', '只有你一個'),
    ],
    help: [
      click('.cp-opts [data-i="1"]'), expect('.cp-why', '警訊'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      expect('.cp-q', '守住'),
    ],
  },
  css: `
.is-demo { width: 100%; max-width: 620px; margin: auto; display: grid; gap: 12px; font-size: 17px; line-height: 1.45; }
.is-post { background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 12px 14px; display: grid; gap: 8px; box-shadow: 0 4px 12px rgba(29,39,56,.06); }
.is-top { display: flex; gap: 10px; align-items: center; }
.is-avatar { font-size: 32px; line-height: 1; }
.is-top b { display: block; }
.is-top small { color: var(--ink-3); font-size: 15px; }
.is-text { margin: 0; font-weight: 600; }
.is-c { border-radius: 10px; outline: 3px solid transparent; outline-offset: 2px; cursor: pointer; transition: outline-color 200ms, background 200ms; }
.is-text .is-c { display: inline-block; padding: 4px 6px; margin-right: 4px; font-weight: 800; color: #b02a37; min-height: 44px; }
.is-photo { display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 84px; background: #f1f3f5; font-size: 40px; }
.is-photo small { font-size: 15px; color: var(--ink-2); }
.is-limit { padding: 10px; min-height: 44px; text-align: center; font-weight: 800; color: #b35c00; background: #fff4e6; }
.is-clock { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.is-join { min-height: 52px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; background: #2f9e44; }
.is-likes { margin: 0; font-size: 15px; color: var(--ink-3); }
.is-c.is-found { outline-color: var(--bad); }
.is-chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.is-chip { min-height: 44px; display: flex; align-items: center; justify-content: center; padding: 4px 6px; border: 2px dashed var(--line); border-radius: 14px; font-size: 15px; font-weight: 800; color: var(--ink-3); text-align: center; }
.is-chip.is-got { border-style: solid; border-color: #ffa8a8; background: #fff5f5; color: #c92a2a; }
.is-status, .is-reveal { margin: 0; padding: 10px 14px; border-radius: 14px; background: #edf5f2; min-height: 3.2em; font-weight: 700; }
.is-count { margin-left: 6px; color: var(--c); }
.is-chat { border-radius: 18px; background: #ebfbee; border: 2px solid var(--line); overflow: hidden; }
.is-chat-head { margin: 0; padding: 8px 14px; background: var(--card); border-bottom: 2px solid var(--line); font-weight: 800; }
.is-msgs { display: grid; gap: 6px; padding: 10px 12px; }
.is-msg { margin: 0; justify-self: start; max-width: 92%; padding: 6px 12px; border-radius: 14px 14px 14px 4px; background: var(--card); font-weight: 600; }
.is-msg b { display: block; font-size: 15px; color: var(--ink-2); }
.is-members { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.is-member { min-height: 72px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: var(--card); border: 2px solid var(--line); border-radius: 14px; box-shadow: 0 3px 0 var(--line); font-weight: 800; }
.is-m-icon { font-size: 28px; line-height: 1; }
.is-m-name { font-size: 15px; }
.is-member.is-unmasked { border-color: #ffa8a8; background: #fff5f5; color: #c92a2a; }
.is-reveal.is-all { background: #fff5f5; color: #c92a2a; }
@media (max-width: 899px) { .is-chips { grid-template-columns: repeat(2, 1fr); } }
@media (prefers-reduced-motion: reduce) { .is-c { transition: none; } }
  `,
};
