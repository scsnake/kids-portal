const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

// A forwarded post in a family chat. Each suspicious word is a button with a short reason.
function forward(host, _, api) {
  const words = [
    { text: '轉給你愛的人', why: '用愛和緊張催你快點轉傳，來不及想是不是真的。' },
    { text: '醫生不會告訴你', why: '把醫生說成壞人，讓你不去問真正懂的人。' },
    { text: '量子', why: '聽起來很科學的詞，被拿來賣東西。它跟這瓶水沒有關係。' },
    { text: '天然無副作用', why: '天然的東西，也可能讓人過敏或不舒服。' },
    { text: '排毒', why: '身體本來就會處理廢物。「排毒」常常沒說排的是什麼。' },
    { text: '治百病', why: '沒有一種東西能治好所有的病。說得越神奇，越要小心。' },
  ];
  const w = i => '<button class="hm-word" data-hm-word="' + i + '" aria-pressed="false">' + words[i].text + '</button>';
  host.innerHTML =
    '<div class="hm-demo">' +
      '<div class="hm-chat">' +
        '<p class="hm-chat-head">💬 相親相愛一家人</p>' +
        '<p class="hm-from">👵 阿嬤 <small>轉傳的訊息</small></p>' +
        '<div class="hm-bubble">' +
          '<p>【' + w(0) + '】' + w(1) + '的祕密！</p>' +
          '<p>💧 ' + w(2) + '能量水，' + w(3) + '。</p>' +
          '<p>每天喝一杯，幫身體' + w(4) + '，從頭痛到失眠，' + w(5) + '！</p>' +
          '<p class="hm-link">👉 water.example.tw</p>' +
        '</div>' +
      '</div>' +
      '<p class="hm-count">找到的可疑說法：0/6</p>' +
      '<p class="hm-status" role="status" aria-live="polite">點一點訊息裡可疑的說法。</p>' +
    '</div>';
  const status = host.querySelector('.hm-status');
  const found = new Set();
  host.querySelector('.hm-chat').addEventListener('click', e => {
    const b = e.target.closest('[data-hm-word]');
    if (!b) { status.textContent = '再找找看：哪些字說得太神奇，或在催你？'; return; }
    const i = Number(b.dataset.hmWord);
    status.textContent = '「' + words[i].text + '」：' + words[i].why;
    if (found.has(i)) return;
    found.add(i);
    b.setAttribute('aria-pressed', 'true');
    host.querySelector('.hm-count').textContent = '找到的可疑說法：' + found.size + '/6';
    api.good();
    if (found.size === words.length) {
      status.textContent = '🎉 6 個都找到了！這種訊息先不要轉傳，查一查再說。';
      api.done();
    }
  });
}

export default {
  ready: true,
  unit: {
    id: 'healthmyth',
    part: 'basic',
    icon: '💊',
    color: '#4d7c0f',
    title: '健康謠言和神奇產品',
    en: 'Health Myths and Miracle Products',
    desc: '偽科學的用語、假專家、食品不能說治病，以及怎麼查證',
    slides: [
      { id: 'forward', title: '這則轉傳可信嗎？', text: '家族群組常有' + t('健康謠言', 'health myth') + '，用很像科學的' + t('偽科學', 'pseudoscience') + '字眼來賣東西。點出 6 個可疑的說法！', widget: 'hm-forward', params: {} },
      { id: 'experts', title: '穿白袍，就是專家嗎？', text: '廣告常放白袍照片，或一個人說「我吃了就好了」，這叫' + t('見證', 'testimonial') + '。一個人的故事不是證據。分分看！', widget: 'sort', params: {
        rest: 'ok',
        bins: [
          { id: 'no', icon: '🤔', label: '不能當證據' },
          { id: 'ok', icon: '👍', label: '比較可信' },
        ],
        items: [
          { icon: '🎓', label: '自稱「某某博士」，沒寫在哪裡工作', bin: 'no' },
          { icon: '🗣️', label: '一個人說「我喝了就好了」', bin: 'no' },
          { icon: '❔', label: '沒有寫任何來源', bin: 'no' },
          { icon: '🏥', label: '醫院或衛生單位的網站', bin: 'ok' },
          { icon: '📚', label: '可以查得到的研究', bin: 'ok' },
          { icon: '👩‍⚕️', label: '醫生或藥師當面說明', bin: 'ok' },
          { icon: '🥼', label: '一張穿白袍的照片', bin: 'no' },
        ],
      } },
      { id: 'law', title: '食品不能說會治病', text: '依照' + t('食品安全衛生管理法', 'Act Governing Food Safety and Sanitation') + '，食品廣告不能誇大，也不能說能預防或治療疾病。判斷看看，哪些說法可以用？', widget: 'inbox', params: {
        labels: ['✅ 可以這樣說', '🚫 違法說法'],
        messages: [
          { from: '🍵 麥茶廣告', text: '好喝順口，冰過更好喝。', scam: false, why: '只說味道，沒有說能治病，可以這樣說。' },
          { from: '🍵 花草茶廣告', text: '每天一杯，降低血糖！', scam: true, why: '「降低血糖」是說它能治病。食品不能這樣宣傳。' },
          { from: '🍪 餅乾廣告', text: '睡前吃兩片，治療失眠。', scam: true, why: '「治療失眠」是說它能治病。食品不能這樣宣傳。' },
          { from: '🥛 牛奶廣告', text: '有原味和巧克力兩種口味。', scam: false, why: '介紹口味，沒有說能治病，可以這樣說。' },
          { from: '🍬 軟糖廣告', text: '吃了改善視力，不用再戴眼鏡！', scam: true, why: '「改善視力」是說它能治病，也太誇張了。食品不能這樣宣傳。' },
        ],
      } },
      { id: 'family', title: '阿嬤傳來的訊息', text: '家人轉傳，常常是因為關心你。不用笑他，一起' + t('查證', 'fact-check') + '就好。一步一步，選出最好的做法。', widget: 'chatpick', params: {
        name: '💬 相親相愛一家人',
        messages: ['👵 阿嬤：量子能量水，喝了就不用吃降血壓的藥了！', '👵 阿嬤：快轉給你愛的人 ❤️'],
        steps: [
          {
            ask: '看到這則訊息，先怎麼做？',
            options: [
              { text: '✋ 先不要轉傳', ok: true, act: '✋ 你沒有轉傳' },
              { text: '📤 馬上轉給全班同學', why: '還不知道是不是真的，轉出去可能讓更多人受騙。' },
              { text: '😝 在群組說「阿嬤好好騙」', why: '取笑會讓阿嬤難過，她也比較不會聽。溫和一點。' },
            ],
          },
          {
            ask: '想知道是不是真的，可以怎麼查？',
            options: [
              { text: '🔎 用 LINE 訊息查證，或查台灣事實查核中心、MyGoPen、Cofacts', ok: true, act: '🔎 查到了：這是謠言' },
              { text: '👍 看留言，很多人說有效就相信', why: '留言可能是假的，也可能是業配。要看查核的結果。' },
            ],
          },
          {
            ask: '阿嬤說：「那我先把降血壓的藥停掉試試。」',
            options: [
              { text: '👩‍⚕️ 請阿嬤先問醫生或藥師，不要自己停藥', ok: true, act: '👩‍⚕️ 約好下次看診一起問醫生' },
              { text: '👌 好啊，試試看', why: '自己停藥可能很危險。要不要換藥，請醫生或藥師決定。' },
            ],
          },
          {
            ask: '最後，你想怎麼跟阿嬤說？',
            options: [
              { text: '💛「阿嬤，我查到這是謠言，我們一起問醫生好不好？」', ok: true, act: '💛 阿嬤說：「好，謝謝你幫我查。」' },
              { text: '😤「你很好騙耶！」', why: '阿嬤是因為關心大家才轉傳。說話溫和，她比較願意聽。' },
            ],
          },
        ],
        end: '🎉 你溫和地保護了家人：不轉傳、先查證、問醫生。',
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '網路上說：「這種茶天然無副作用，可以治百病。」你會怎麼想？',
        options: [
          { text: '🤔 沒有東西能治百病，先查證、問醫生', correct: true },
          { text: '🍵 天然的，一定很安全' },
          { text: '📤 先轉給家人，讓大家都喝' },
        ],
        explain: '「天然無副作用」「治百病」都是常見的可疑說法。先查證，身體的事問醫生或藥師。',
      } },
    ],
  },
  placement: { after: 'investscam', stage: 'seethrough' },
  prerequisites: ['investscam', 'fakes', 'adcopy'],
  readme: 'Spot pseudoscience words in a forwarded health post, tell testimonials and fake experts from credible sources, learn that food ads may not claim to treat disease, and help family check a rumor kindly.',
  changelog: '新增「健康謠言和神奇產品」：找出「量子」「排毒」「治百病」等可疑說法，分辨假專家和可信的來源，知道食品廣告不能說會治病，並練習溫和地陪家人查證、問醫生。',
  widgets: { 'hm-forward': forward },
  checks: {
    forward: [
      click('.hm-chat-head'), expect('.hm-status', '再找找看'),
      click('[data-hm-word="0"]'), click('[data-hm-word="1"]'), click('[data-hm-word="2"]'),
      click('[data-hm-word="3"]'), click('[data-hm-word="4"]'), click('[data-hm-word="5"]'),
      expect('.hm-count', '6/6'), expect('.hm-status', '都找到了'),
    ],
    law: [
      click('.msg-card[data-i="0"] [data-v="scam"]'),
      click('.msg-card[data-i="0"] [data-v="ok"]'),
      click('.msg-card[data-i="1"] [data-v="scam"]'),
      click('.msg-card[data-i="2"] [data-v="scam"]'),
      click('.msg-card[data-i="3"] [data-v="ok"]'),
      click('.msg-card[data-i="4"] [data-v="scam"]'),
      expect('.ib-left', '全部判斷完了'),
    ],
    family: [
      click('.cp-opts [data-i="1"]'), expect('.cp-why', '可能讓更多人受騙'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      expect('.cp-q', '溫和地保護了家人'),
    ],
  },
  css: `
.hm-demo { width: 100%; max-width: 640px; margin: auto; display: grid; gap: 12px; font-size: 18px; line-height: 1.5; }
.hm-chat { background: #e7f0e2; border: 2px solid var(--line); border-radius: 18px; padding: 10px 14px 14px; display: grid; gap: 6px; }
.hm-chat p { margin: 0; }
.hm-chat-head { font-weight: 800; text-align: center; padding-bottom: 6px; border-bottom: 1px solid #c9d8c0; }
.hm-from { font-weight: 700; }
.hm-from small { font-size: 15px; font-weight: 600; color: var(--ink-2); }
.hm-bubble { background: var(--card); border-radius: 4px 16px 16px 16px; padding: 10px 14px; display: grid; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,.06); }
.hm-bubble p { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.hm-word { min-height: 48px; min-width: 44px; padding: 4px 10px; font: inherit; font-weight: 800; color: #5c3d00; background: #fff9db; border: 2px dashed #fab005; border-radius: 12px; }
.hm-word[aria-pressed=true] { background: #ffe066; border: 2px solid #e67700; }
.hm-link { font-family: ui-monospace, Menlo, monospace; font-size: 16px; color: #1c7ed6; }
.hm-count { margin: 0; font-weight: 800; color: var(--c); }
.hm-status { margin: 0; padding: 12px 16px; border-radius: 14px; background: #f1f6ec; min-height: 76px; }
@media (prefers-reduced-motion: reduce) {
  .hm-word { transition: none; }
}
  `,
};
