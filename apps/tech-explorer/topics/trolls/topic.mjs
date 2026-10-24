const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

// What each reply adds to the thread: your comment, then the replies it starts.
const MOVES = {
  angry: {
    mine: '😡 你：你才笨！鳳梨披薩超好吃！',
    more: ['🧌 小Z：哈哈，生氣了喔 😏', '👤 路人：吵什麼，我也要來留言', '👤 路人：笨的是你們兩個'],
    add: 9,
    note: '⚠️ 吵起來了！留言越多，App 越會把它推給更多人看。',
  },
  argue: {
    mine: '🗣️ 你：我寫了三段話，告訴你鳳梨為什麼很好吃……',
    more: ['🧌 小Z：寫這麼長，你認真了 😂', '👤 路人：我也來分析一下'],
    add: 6,
    note: '⚠️ 酸民不是想討論，他想要你的反應。互動又變多了。',
  },
};

// A ragebait post: feeding it (any reply) raises engagement and reach; muting lets it sink.
function feed(host, _, api) {
  let comments = 2, quiet = false;
  host.innerHTML = `
    <div class="tq-demo">
      <div class="tq-post">
        <p class="tq-who">🧌 怪咖小Z</p>
        <p class="tq-say">只有笨蛋才喜歡吃鳳梨披薩 🍍🍕！不服來吵啊 😏</p>
        <div class="tq-stats">
          <span>💬 留言 <b class="tq-c">0</b></span>
          <span>🔥 互動 <b class="tq-e">0</b></span>
          <span>👀 被推給 <b class="tq-r">0</b> 人</span>
        </div>
      </div>
      <div class="tq-thread"></div>
      <div class="tq-moves">
        <button class="option" data-tq="angry">😡 罵回去</button>
        <button class="option" data-tq="argue">🗣️ 寫長長的道理</button>
        <button class="option" data-tq="mute">🔇 不回，按靜音</button>
      </div>
      <div class="tq-status" role="status" aria-live="polite">這是一篇引戰文。你會怎麼回？試試不同的回法。</div>
    </div>`;
  const $ = sel => host.querySelector(sel);
  const engage = () => comments * 3 + 5;
  const reach = () => 50 + engage() * 40;
  const draw = () => {
    $('.tq-c').textContent = comments;
    $('.tq-e').textContent = engage();
    $('.tq-r').textContent = reach();
  };
  const say = (text, cls = '') => {
    const p = document.createElement('p');
    p.className = 'tq-bub ' + cls;
    p.textContent = text;
    const thread = $('.tq-thread');
    thread.append(p);
    while (thread.children.length > 4) thread.firstElementChild.remove();
  };
  say('👤 路人：真的嗎？', 'tq-old');
  say('👤 路人：我不喜歡，但不會罵人', 'tq-old');
  draw();
  host.querySelector('.tq-moves').addEventListener('click', e => {
    const b = e.target.closest('[data-tq]');
    if (!b || quiet) return;
    const kind = b.dataset.tq;
    if (kind === 'mute') {
      quiet = true;
      host.querySelectorAll('[data-tq]').forEach(x => { x.disabled = true; });
      b.classList.add('right');
      $('.tq-demo').classList.add('tq-calm');
      $('.tq-status').textContent = '🔇 你沒有回他，也看不到他的貼文了。沒人理他……';
      api.later(() => {
        $('.tq-r').textContent = Math.round(reach() / 3);
        $('.tq-status').textContent = '✅ 沒人回，這篇慢慢沉下去了。不要餵酸民！';
        $('.tq-demo').classList.add('tq-sunk');
        api.good();
        api.done();
      }, 1200);
      return;
    }
    const m = MOVES[kind];
    say(m.mine, 'tq-mine');
    comments++;
    draw();
    $('.tq-status').textContent = m.note;
    api.bad();
    m.more.forEach((line, k) => api.later(() => {
      if (quiet) return;
      say(line);
      comments++;
      draw();
    }, 450 + k * 450));
  });
}

const WORDS = [
  ['那家店', 0], ['真可惡', 1], ['，竟然偷偷漲價！', 0],
  ['這種', 0], ['無恥', 1], ['的老闆，太', 0], ['丟臉', 1], ['了！', 0],
];

// Tap the angry, blaming words in a post. Each one found makes the "shared" bar
// about 20% longer, the average from the study.
function words(host, _, api) {
  const angry = WORDS.filter(w => w[1]).length;
  let found = 0;
  host.innerHTML = `
    <div class="tq-demo">
      <div class="tq-post">
        <p class="tq-who">📣 某個帳號的貼文</p>
        <p class="tq-say tq-words">${WORDS.map((w, i) => `<button class="tq-w" data-w="${i}">${w[0]}</button>`).join('')}</p>
      </div>
      <div class="tq-bars">
        <p class="tq-bar-row"><span>平靜的寫法</span><span class="tq-bar"><i style="width:40%"></i></span><b>1 倍</b></p>
        <p class="tq-bar-row"><span>這篇的寫法</span><span class="tq-bar"><i class="tq-hot" style="width:40%"></i></span><b class="tq-x">1 倍</b></p>
      </div>
      <p class="tq-cite">示意圖：用研究的平均數字估算（Brady 等人，2017）</p>
      <div class="tq-status" role="status" aria-live="polite">點一點：哪些詞又生氣、又在罵人不對？還有 ${angry} 個。</div>
    </div>`;
  const $ = sel => host.querySelector(sel);
  host.querySelector('.tq-words').addEventListener('click', e => {
    const b = e.target.closest('[data-w]');
    if (!b || b.classList.contains('tq-found')) return;
    if (!WORDS[b.dataset.w][1]) {
      $('.tq-status').textContent = '「' + WORDS[b.dataset.w][0].replace(/[，！]/g, '') + '」只是在說事情，沒有罵人。再找找。';
      api.bad();
      return;
    }
    b.classList.add('tq-found');
    found++;
    const x = Math.pow(1.2, found);
    $('.tq-hot').style.width = Math.round(40 * x) + '%';
    $('.tq-x').textContent = '約 ' + x.toFixed(1) + ' 倍';
    api.good();
    if (found < angry) {
      $('.tq-status').textContent = '找到「' + WORDS[b.dataset.w][0] + '」！多一個這種詞，轉傳就多約 20%。還有 ' + (angry - found) + ' 個。';
      return;
    }
    $('.tq-status').textContent = '🎉 都找到了！生氣的話傳得快，不代表它是對的。看到這種貼文，先停一下。';
    api.done();
  });
}

export default {
  ready: true,
  unit: {
    id: 'trolls',
    part: 'basic',
    icon: '🧌',
    color: '#6741d9',
    title: '酸民和引戰文',
    en: 'Trolls and Ragebait',
    desc: '分辨不同意見和酸民、不要餵酸民、生氣的話為什麼傳得快、靜音封鎖檢舉',
    slides: [
      { id: 'spot', title: '不同意見，還是酸民？', text: '故意說難聽話、惹人生氣的人，叫' + t('酸民', 'troll') + '；故意引起吵架的貼文，叫' + t('引戰文', 'ragebait') + '。不同意見不等於酸民。判斷看看！', widget: 'inbox', params: {
        labels: ['🙂 不同意見', '🧌 酸民或引戰'],
        messages: [
          { from: '💬 小安', text: '我比較喜歡上一集，這集有點太短了。', scam: false, why: '說出自己的想法，也說了原因。這是不同意見。' },
          { from: '💬 路人甲123', text: '畫這什麼垃圾，笑死，不要再畫了', scam: true, why: '只有嘲笑，沒有理由，目的是讓人難過。' },
          { from: '💬 阿凱', text: '顏色好好看！不過貓的耳朵好像有點小？', scam: false, why: '有稱讚，也有建議，是在幫你變更好。' },
          { from: '💬 匿名帳號', text: '喜歡這個遊戲的都是笨蛋，不服來戰 😏', scam: true, why: '罵一整群人，還故意叫大家來吵，就是引戰。' },
          { from: '💬 小樹', text: '我不同意，我覺得兩個遊戲都很好玩。', scam: false, why: '說「不同意」很正常，他沒有罵人。' },
        ],
      } },
      { id: 'feed', title: '不要餵酸民', text: '酸民最想要的，是你的' + t('反應', 'reaction') + '。很多 App 會把留言多、吵得兇的貼文，推給更多人看，生氣的留言也算。試試不同的回法！', widget: 'tq-feed', params: {} },
      { id: 'words', title: '為什麼生氣的話傳得快？', text: '一個研究看了美國的政治貼文：每多一個又生氣、又在罵人不對的詞，平均多被轉傳約 20%。所以引戰文很愛用這種詞。找出來！', widget: 'tq-words', params: {} },
      { id: 'tools', title: '靜音、封鎖、檢舉', text: '不想吵，也有工具可以用：' + t('靜音', 'mute') + '是不再看到他的貼文；' + t('封鎖', 'block') + '是不讓他找你；' + t('檢舉', 'report') + '是請平台處理違規的內容。分分看！', widget: 'sort', params: {
        bins: [
          { id: 'mute', icon: '🔇', label: '靜音' },
          { id: 'block', icon: '🚫', label: '封鎖' },
          { id: 'report', icon: '🚩', label: '檢舉' },
        ],
        items: [
          { icon: '🎮', label: '同學一直貼遊戲截圖，你不想看，但還是朋友', bin: 'mute' },
          { icon: '😮‍💨', label: '有個帳號整天抱怨，你看了心情不好', bin: 'mute' },
          { icon: '📩', label: '不認識的人一直私訊你，叫你回他', bin: 'block' },
          { icon: '🙉', label: '有人一直留言笑你，說了也不停', bin: 'block' },
          { icon: '👊', label: '有人留言說要打人', bin: 'report' },
          { icon: '🎭', label: '有帳號假裝是你，用你的照片', bin: 'report' },
        ],
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '有人在你的影片下留言：「拍這什麼爛東西，不服來吵啊！」最好怎麼做？',
        options: [
          { text: '🔇 不回他，需要時封鎖或檢舉', correct: true },
          { text: '😡 罵回去，不能輸' },
          { text: '📢 找朋友一起去罵他' },
        ],
        explain: '酸民要的是你的反應。不回他，用工具保護自己，再告訴大人。被欺負得很嚴重，也可以打教育部反霸凌專線 1953。',
      } },
    ],
  },
  placement: { after: 'socialmanners', stage: 'social' },
  prerequisites: ['socialmanners', 'kind'],
  readme: 'Tell disagreement from trolling, see in a simulator how replies feed ragebait while muting lets it sink, find the angry blaming words that spread faster, and match mute, block and report to cases.',
  changelog: '新增「酸民和引戰文」：分辨不同意見和酸民，在模擬留言串裡看到「不要餵酸民」的效果，找出讓貼文傳得快的生氣字眼，並學會靜音、封鎖和檢舉。',
  widgets: { 'tq-feed': feed, 'tq-words': words },
  checks: {
    spot: [
      click('.msg-card[data-i="0"] [data-v="ok"]'), click('.msg-card[data-i="1"] [data-v="scam"]'), click('.msg-card[data-i="2"] [data-v="ok"]'),
      click('.msg-card[data-i="3"] [data-v="scam"]'), click('.msg-card[data-i="4"] [data-v="ok"]'), expect('.ib-left', '全部判斷完了'),
    ],
    feed: [click('[data-tq="angry"]'), expect('.tq-status', '吵起來了'), { action: 'waitFor', selector: '.tq-thread .tq-bub:nth-child(4)' }, click('[data-tq="mute"]'), { action: 'waitFor', selector: '.tq-sunk' }, expect('.tq-status', '不要餵酸民')],
    words: [click('[data-w="0"]'), expect('.tq-status', '再找找'), click('[data-w="1"]'), click('[data-w="4"]'), click('[data-w="6"]'), expect('.tq-status', '都找到了'), { action: 'expectCount', selector: '.tq-found', count: 3 }],
  },
  css: `
.tq-demo { width: 100%; max-width: 640px; margin: auto; display: grid; gap: 12px; font-size: 18px; line-height: 1.5; }
.tq-post { background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 12px 16px; display: grid; gap: 6px; transition: opacity 600ms ease; }
.tq-who { margin: 0; font-weight: 700; color: var(--ink-2); font-size: 16px; }
.tq-say { margin: 0; font-size: 20px; font-weight: 700; }
.tq-stats { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 16px; color: var(--ink-2); }
.tq-stats b { color: var(--ink); font-variant-numeric: tabular-nums; }
.tq-thread { display: grid; gap: 6px; height: 196px; align-content: end; overflow: hidden; }
.tq-bub { margin: 0; padding: 7px 12px; border-radius: 14px; background: #f1f3f5; font-size: 16px; animation: tq-in 240ms cubic-bezier(.23,1,.32,1); }
.tq-bub.tq-old { animation: none; }
.tq-bub.tq-mine { background: #fff4e6; border: 1.5px solid #ffc078; }
@keyframes tq-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.tq-moves { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tq-moves .option { min-height: 56px; font-size: 17px; text-align: center; padding: 8px; }
.tq-moves .option:disabled:not(.right) { opacity: .5; }
.tq-status { min-height: 60px; padding: 12px 16px; border-radius: 14px; background: #f0ecfb; }
.tq-calm .tq-thread { opacity: .45; transition: opacity 600ms ease; }
.tq-sunk .tq-post { opacity: .55; }
.tq-words { display: flex; flex-wrap: wrap; gap: 4px; line-height: 1.2; }
.tq-w { min-height: 48px; min-width: 44px; padding: 4px 8px; font: inherit; font-weight: 700; background: #f8f9fa; border: 2px solid var(--line); border-radius: 10px; color: var(--ink); }
.tq-w.tq-found { background: #fff0f6; border-color: #d6336c; color: #a61e4d; }
.tq-bars { display: grid; gap: 8px; margin: 0; }
.tq-bar-row { margin: 0; display: grid; grid-template-columns: 6.5em 1fr 4.5em; align-items: center; gap: 10px; font-size: 16px; }
.tq-bar { height: 22px; border-radius: 11px; background: #f1f3f5; overflow: hidden; }
.tq-bar i { display: block; height: 100%; background: #adb5bd; border-radius: 11px; transition: width 400ms cubic-bezier(.23,1,.32,1); }
.tq-bar i.tq-hot { background: var(--c); }
.tq-cite { margin: 0; font-size: 15px; color: var(--ink-2); }
@media (max-width: 899px) { .tq-thread { height: 176px; } }
@media (prefers-reduced-motion: reduce) { .tq-bub, .tq-bar i, .tq-post, .tq-calm .tq-thread { animation: none; transition: none; } }
  `,
};
