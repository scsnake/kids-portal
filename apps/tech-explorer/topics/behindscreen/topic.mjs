const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const shake = el => {
  if (!still()) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 });
};

// The same boy, in class and behind an anonymous account. Each thing added back
// (face, name, seeing the other person's reaction) makes the online words softer.
function mask(host, _, api) {
  const says = [
    '「畫這什麼爛東西，笑死。」',
    '「畫這什麼東西，好醜。」',
    '「嗯……這張我不太喜歡。」',
    '「你的畫很有趣耶，背景可以再亮一點。」',
  ];
  const added = new Set();
  let finished = false;
  host.innerHTML = `
    <div class="bs-demo">
      <div class="bs-pair">
        <div class="bs-card">
          <div class="bs-where">🏫 在教室</div>
          <div class="bs-face">🙂</div>
          <b class="bs-name">阿哲</b>
          <p class="bs-say">${says[3]}</p>
        </div>
        <div class="bs-card bs-online">
          <div class="bs-where">📱 在網路上</div>
          <div class="bs-face bs-on-face">👤</div>
          <b class="bs-name bs-on-name">user_8812</b>
          <p class="bs-say bs-on-say">${says[0]}</p>
          <p class="bs-react" hidden>😢 小美看了，眼眶紅紅的</p>
        </div>
      </div>
      <div class="bs-controls">
        <button class="option" data-bs-add="face" aria-pressed="false">🙂 加回臉</button>
        <button class="option" data-bs-add="name" aria-pressed="false">🏷️ 加回名字</button>
        <button class="option" data-bs-add="react" aria-pressed="false">😢 看到對方的反應</button>
      </div>
      <p class="bs-status bs-mask-status" role="status" aria-live="polite">網路上少了三樣東西。一個一個加回去，看看阿哲說的話會不會變。</p>
    </div>`;
  const $ = sel => host.querySelector(sel);
  const draw = () => {
    $('.bs-on-face').textContent = added.has('face') ? '🙂' : '👤';
    $('.bs-on-name').textContent = added.has('name') ? '阿哲' : 'user_8812';
    $('.bs-react').hidden = !added.has('react');
    $('.bs-on-say').textContent = says[added.size];
    host.querySelectorAll('[data-bs-add]').forEach(b => b.setAttribute('aria-pressed', String(added.has(b.dataset.bsAdd))));
    $('.bs-online').classList.toggle('bs-calm-card', added.size === 3);
    if (added.size === 3) {
      $('.bs-mask-status').textContent = '✅ 臉、名字和反應都回來了，阿哲說話又像在教室一樣。網路上少了這些，有些人就會說出平常不會說的話。';
      if (!finished) { finished = true; api.good(); api.done(); }
    } else {
      $('.bs-mask-status').textContent = `已加回 ${added.size}/3 樣。阿哲的話變了嗎？`;
    }
  };
  host.querySelectorAll('[data-bs-add]').forEach(b => b.onclick = () => {
    const k = b.dataset.bsAdd;
    if (added.has(k)) added.delete(k); else added.add(k);
    draw();
  });
}

// A comment section under a post. Reveal the authors, then find the two accounts
// that wrote most of it. Ends with the Pew 2019 bar.
function loud(host, _, api) {
  const accts = {
    bear: { icon: '🐻', name: '小黑熊', n: 5 },
    angry: { icon: '😤', name: '怒怒', n: 4 },
    cat: { icon: '🐱', name: '喵喵', n: 1 },
    sun: { icon: '🌻', name: '向日葵', n: 1 },
    bike: { icon: '🚲', name: '阿騎', n: 1 },
  };
  const comments = [
    ['bear', '爛透了！'], ['angry', '氣死我了'], ['cat', '我覺得還好耶'], ['bear', '誰想出來的？'],
    ['angry', '根本不能吃'], ['bear', '我說真的，超爛'], ['sun', '咖哩很好吃'], ['angry', '退錢啦'],
    ['bear', '大家快來罵'], ['bike', '希望多一點青菜'], ['angry', '再說一次：很爛'], ['bear', '爛爛爛！'],
  ];
  const found = new Set();
  host.innerHTML = `
    <div class="bs-demo">
      <p class="bs-post">📢 學校公布了新的午餐菜單</p>
      <div class="bs-comments">${comments.map(([a, text]) => `
        <p class="bs-cmt" data-acct="${a}"><span class="bs-av">❔</span><span><small class="bs-by">？？？</small>${text}</span></p>`).join('')}</div>
      <div class="bs-act">
        <button class="go bs-reveal">👀 看是誰留的</button>
        <div class="bs-legend" hidden>${Object.entries(accts).map(([id, a]) => `
          <button class="option" data-bs-acct="${id}">${a.icon} ${a.name}<small>${a.n} 則</small></button>`).join('')}</div>
        <div class="bs-pew" hidden>
          <p>美國的調查（Pew，2019）：最常發文的 10% 使用者，發了大約 80% 的推文。</p>
          <div class="bs-bar"><span>人</span><div class="bs-track"><i style="width:10%"></i></div><b>10%</b></div>
          <div class="bs-bar"><span>推文</span><div class="bs-track"><i style="width:80%"></i></div><b>80%</b></div>
        </div>
      </div>
      <p class="bs-status bs-loud-status" role="status" aria-live="polite">12 則留言，好像很多人在生氣。真的是這樣嗎？</p>
    </div>`;
  const $ = sel => host.querySelector(sel);
  $('.bs-reveal').onclick = () => {
    host.querySelectorAll('.bs-cmt').forEach(c => {
      const a = accts[c.dataset.acct];
      c.querySelector('.bs-av').textContent = a.icon;
      c.querySelector('.bs-by').textContent = a.name;
      c.classList.add('bs-shown', 'bs-' + c.dataset.acct);
    });
    $('.bs-reveal').hidden = true;
    $('.bs-legend').hidden = false;
    $('.bs-loud-status').textContent = '現在看得到名字了。哪兩個帳號留最多？點點看！';
  };
  host.querySelectorAll('[data-bs-acct]').forEach(b => b.onclick = () => {
    const id = b.dataset.bsAcct;
    if (found.has(id)) return;
    if (accts[id].n < 4) {
      shake(b);
      api.bad();
      $('.bs-loud-status').textContent = `${accts[id].name}只留了 1 則。再找找看，誰留最多？`;
      return;
    }
    found.add(id);
    b.classList.add('right');
    api.good();
    if (found.size < 2) {
      $('.bs-loud-status').textContent = `對！${accts[id].name}留了 ${accts[id].n} 則。還有一個帳號也留很多。`;
      return;
    }
    $('.bs-legend').hidden = true;
    $('.bs-pew').hidden = false;
    $('.bs-loud-status').textContent = '✅ 12 則裡，有 9 則是 2 個帳號留的。看起來很多人在生氣，其實是少數人一直留言。';
    api.done();
  });
}

// The same question in a comment section and in a real class. View both, then
// pick which one is closer to what most people think.
function calm(host, _, api) {
  const seen = new Set(['web']);
  let solved = false;
  host.innerHTML = `
    <div class="bs-demo">
      <p class="bs-post">❓ 學校要不要穿制服？</p>
      <div class="bs-tabs">
        <button class="option" data-bs-view="web" aria-pressed="true">💬 網路留言區</button>
        <button class="option" data-bs-view="class" aria-pressed="false">🏫 你的班上</button>
      </div>
      <div class="bs-view" data-view="web">
        <p class="bs-cmt bs-hot">😡 不穿制服的都是笨蛋</p>
        <p class="bs-cmt bs-hot">🤬 穿制服的學校爛透了</p>
        <p class="bs-cmt bs-hot">😤 吵什麼，閉嘴啦</p>
        <p class="bs-cmt bs-hot">🙄 這種問題也要問？</p>
      </div>
      <div class="bs-view" data-view="class" hidden>
        <div class="bs-bar"><span>想穿</span><div class="bs-track"><i style="width:20%"></i></div><b>6 人</b></div>
        <div class="bs-bar"><span>不想穿</span><div class="bs-track"><i style="width:27%"></i></div><b>8 人</b></div>
        <div class="bs-bar"><span>都可以</span><div class="bs-track"><i style="width:53%"></i></div><b>16 人</b></div>
        <p class="bs-note">🙋 大家輪流說想法，說完一起去吃午餐。</p>
      </div>
      <div class="bs-ask" hidden>
        <p>哪一邊比較像大部分人的想法？</p>
        <div class="bs-tabs">
          <button class="option" data-bs-pick="web">💬 網路留言區</button>
          <button class="option" data-bs-pick="class">🏫 你的班上</button>
        </div>
      </div>
      <p class="bs-status bs-calm-status" role="status" aria-live="polite">留言區好兇喔。再看看你的班上，大家怎麼想？</p>
    </div>`;
  const $ = sel => host.querySelector(sel);
  host.querySelectorAll('[data-bs-view]').forEach(b => b.onclick = () => {
    const v = b.dataset.bsView;
    seen.add(v);
    host.querySelectorAll('[data-bs-view]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    host.querySelectorAll('.bs-view').forEach(x => { x.hidden = x.dataset.view !== v; });
    if (seen.size === 2 && !solved) {
      $('.bs-ask').hidden = false;
      $('.bs-calm-status').textContent = '兩邊都看過了。回答下面的問題！';
    }
  });
  host.querySelectorAll('[data-bs-pick]').forEach(b => b.onclick = () => {
    if (solved) return;
    if (b.dataset.bsPick === 'web') {
      shake(b);
      api.bad();
      $('.bs-calm-status').textContent = '留言區只有幾個人在吵，而且說得特別兇。班上 30 個人，大部分都覺得還好。';
      return;
    }
    solved = true;
    b.classList.add('right');
    api.good();
    $('.bs-calm-status').textContent = '✅ 真實生活裡，大部分的人比較平和。留言區最兇的話，不代表大家都這樣想。';
    api.done();
  });
}

export default {
  ready: true,
  unit: {
    id: 'behindscreen',
    part: 'basic',
    icon: '🎭',
    color: '#0b7285',
    title: '螢幕後面的人',
    en: 'The Person Behind the Screen',
    desc: '網路上的兇話、少數人的大聲、人設和假帳號',
    slides: [
      { id: 'mask', title: '為什麼網路上比較兇？', text: '在網路上，看不到臉、可以不用真名，也看不到對方難過。有些人就會說出平常不會說的話，這叫' + t('網路去抑制效應', 'online disinhibition effect') + '。把少掉的東西加回去！', widget: 'bs-mask', params: {} },
      { id: 'loud', title: '很大聲，不等於很多人', text: '留言區看起來吵翻天，不代表很多人都這樣想。常常是少數幾個帳號，一直重複留言。點「看是誰留的」！', widget: 'bs-loud', params: {} },
      { id: 'accounts', title: '人設和假帳號', text: '有人在網路上演一個很兇的' + t('人設', 'persona') + '，因為吵架能換來關注或賺錢。也有' + t('假帳號', 'fake account') + '、' + t('機器人帳號', 'bot') + '，甚至有人收錢留言，叫' + t('網軍', 'paid trolls') + '。分分看！', widget: 'sort', params: {
        intro: '一個線索不能證明什麼；線索越多，越要小心。',
        bins: [
          { id: 'odd', icon: '🚩', label: '可疑的線索' },
          { id: 'ok', icon: '🙂', label: '比較像真人' },
        ],
        rest: 'ok',
        items: [
          { icon: '🔢', label: '沒有大頭貼，名字是一串數字', bin: 'odd' },
          { icon: '🔁', label: '到處貼一模一樣的話', bin: 'odd' },
          { icon: '⏱️', label: '一天留言 300 則', bin: 'odd' },
          { icon: '📸', label: '有生活照，也跟朋友聊天', bin: 'ok' },
          { icon: '📅', label: '帳號用了好幾年', bin: 'ok' },
          { icon: '🎨', label: '會分享不同的興趣', bin: 'ok' },
          { icon: '🆕', label: '帳號三天前才註冊', bin: 'odd' },
        ],
      } },
      { id: 'calm', title: '真實生活比較平和', text: '同一件事，留言區常常比真實生活兇很多。生活中大部分的人比較平和，也願意好好說話。兩邊都看看！', widget: 'bs-calm', params: {} },
      { id: 'feel', title: '看到兇話，心裡不舒服', text: '陌生人的一句兇話，不代表你不好，也不代表大家都這樣想。先照顧好自己的心情。一步一步，選出最好的做法。', widget: 'chatpick', params: {
        name: '🎨 你貼的畫，下面的留言',
        messages: ['user_5521：畫得好爛', 'user_5521：別再貼了啦', 'user_5521：笑死'],
        steps: [
          { ask: '看到這些留言，先怎麼做？', options: [
            { text: '😮‍💨 深呼吸，想想：這只是一個陌生帳號', ok: true, act: '😮‍💨 你提醒自己：這是一個陌生帳號' },
            { text: '😡 馬上罵回去', why: '罵回去，對方常常更起勁。先停下來。' },
            { text: '🔁 一直重看那幾則留言', why: '一直看，只會更難過。先停下來，深呼吸。' },
          ] },
          { ask: '心情還是很差，接下來呢？', options: [
            { text: '📴 關掉 App，去做別的事', ok: true, act: '📴 你關掉 App，去騎腳踏車' },
            { text: '🌙 熬夜一則一則回他', why: '熬夜回陌生人，只會更累。先離開螢幕。' },
          ] },
          { ask: '過了一陣子，還是會想起來。可以怎麼做？', options: [
            { text: '🙋 跟爸媽或好朋友聊聊', ok: true, act: '🙋 你跟媽媽說了，心情好多了' },
            { text: '🤐 自己忍著，誰都不說', why: '說出來，認識你的人可以陪你，也能幫你處理。' },
          ] },
        ],
        end: '🎉 你沒有讓一個陌生帳號，決定你的心情。',
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '留言區有好多很兇的留言，罵同一件事。這代表什麼？',
        options: [
          { text: '🔍 不一定。可能只是少數幾個帳號一直留', correct: true },
          { text: '🌍 全世界的人都這樣想' },
          { text: '📢 說得越兇，就越是真的' },
        ],
        explain: '大聲不等於很多人，兇也不等於對。看看是誰在說，也想想身邊真實的人怎麼想。',
      } },
    ],
  },
  placement: { after: 'trolls', stage: 'social' },
  prerequisites: ['trolls', 'fakes'],
  readme: 'Online disinhibition, a loud few accounts behind a busy comment section (Pew 2019: 10% of users, 80% of tweets), personas, fake accounts and bots, and why real life is calmer than comments.',
  changelog: '新增「螢幕後面的人」：看懂為什麼網路上比較兇、留言區常是少數人一直留言、什麼是人設和假帳號，也練習看到兇話時先照顧好自己。',
  widgets: { 'bs-mask': mask, 'bs-loud': loud, 'bs-calm': calm },
  checks: {
    mask: [click('[data-bs-add="face"]'), expect('.bs-mask-status', '1/3'), click('[data-bs-add="name"]'), click('[data-bs-add="react"]'), expect('.bs-mask-status', '像在教室一樣')],
    loud: [click('.bs-reveal'), click('[data-bs-acct="cat"]'), expect('.bs-loud-status', '只留了 1 則'), click('[data-bs-acct="bear"]'), click('[data-bs-acct="angry"]'), expect('.bs-loud-status', '9 則是 2 個帳號')],
    calm: [click('[data-bs-view="class"]'), click('[data-bs-pick="web"]'), expect('.bs-calm-status', '大部分都覺得還好'), click('[data-bs-pick="class"]'), expect('.bs-calm-status', '比較平和')],
    feel: [click('.cp-opts [data-i="0"]'), click('.cp-opts [data-i="0"]'), click('.cp-opts [data-i="0"]'), expect('.cp-q', '決定你的心情')],
  },
  css: `
.bs-demo { width: 100%; max-width: 690px; margin: auto; display: grid; gap: 12px; font-size: 17px; line-height: 1.45; }
.bs-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bs-card { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; padding: 14px 10px; background: var(--card); border: 2px solid var(--line); border-radius: 18px; transition: border-color 250ms, background 250ms; }
.bs-online { border-color: #c5ccd6; background: #f4f6f9; }
.bs-online.bs-calm-card { border-color: var(--good); background: #ebfbee; }
.bs-where { font-size: 15px; font-weight: 700; color: var(--ink-2); }
.bs-face { font-size: 46px; line-height: 1; }
.bs-name { font-size: 17px; }
.bs-say { margin: 0; font-size: 17px; min-height: 3em; }
.bs-react { margin: 0; font-size: 15px; color: #c92a2a; font-weight: 700; }
.bs-controls, .bs-tabs { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.bs-controls .option, .bs-tabs .option { font-size: 17px; text-align: center; }
.bs-demo .option[aria-pressed=true] { border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, white); }
.bs-status { margin: 0; padding: 12px 16px; border-radius: 14px; background: #eef3f4; min-height: 52px; }
.bs-post { margin: 0; font-weight: 700; padding: 10px 14px; background: var(--card); border: 2px solid var(--line); border-radius: 14px; }
.bs-comments { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 6px; }
.bs-cmt { margin: 0; display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--card); border: 2px solid var(--line); border-radius: 12px; font-size: 16px; }
.bs-cmt small { display: block; font-size: 15px; color: var(--ink-3); line-height: 1.2; }
.bs-av { font-size: 22px; }
.bs-cmt.bs-bear { border-color: #e8590c; background: #fff4e6; }
.bs-cmt.bs-angry { border-color: #c2255c; background: #fff0f6; }
.bs-cmt.bs-hot { border-color: #ffa8a8; }
.bs-act { display: grid; gap: 10px; justify-items: center; }
.bs-legend { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.bs-legend .option { font-size: 16px; text-align: center; padding: .4rem .8rem; }
.bs-legend small { display: block; font-size: 15px; color: var(--ink-2); font-weight: 400; }
.bs-pew { width: 100%; display: grid; gap: 6px; }
.bs-pew p { margin: 0; font-size: 16px; }
.bs-bar { display: grid; grid-template-columns: 4.5em 1fr 3.5em; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; }
.bs-track { height: 22px; background: #e9ecef; border-radius: 11px; overflow: hidden; }
.bs-track i { display: block; height: 100%; background: var(--c); border-radius: 11px; }
.bs-view { display: grid; gap: 8px; }
.bs-note { margin: 4px 0 0; font-size: 16px; }
.bs-ask { display: grid; gap: 8px; text-align: center; }
.bs-ask p { margin: 0; font-weight: 700; }
@media (max-width: 899px) {
  .bs-face { font-size: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .bs-card { transition: none; }
}
  `,
};
