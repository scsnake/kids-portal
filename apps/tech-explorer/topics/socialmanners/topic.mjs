const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const FEELS = [
  { id: 'happy', label: '😊 開心' },
  { id: 'unsure', label: '😕 不確定，有點擔心' },
  { id: 'upset', label: '😟 好像不高興' },
];

const REPLIES = [
  { text: '喔。', feel: 'unsure', why: '只有一個字和句號，看不出你喜不喜歡。他可能會一直猜。' },
  { text: '哇，改得好棒！謝謝你 😊', feel: 'happy', why: '說出你喜歡哪裡，再加一個笑臉，對方就知道你是開心的。' },
  { text: '隨便啦，你高興就好。', feel: 'upset', why: '你可能只是累了，可是讀起來像在生氣。打字時，語氣要說清楚。' },
];

// One reply at a time: guess how the friend may feel, then see how most readers take it.
function tone(host, _, api) {
  let i = 0;
  host.innerHTML = `
    <div class="et-demo">
      <div class="et-chat">
        <p class="et-head">💬 小涵</p>
        <p class="et-bub et-them">我把我們的海報改好了，你看看？🖼️</p>
        <p class="et-bub et-me"></p>
      </div>
      <p class="et-ask">小涵讀到你的回覆，可能會覺得……</p>
      <div class="et-feels">${FEELS.map(f => `<button class="option" data-feel="${f.id}">${f.label}</button>`).join('')}</div>
      <div class="et-reveal" role="status" aria-live="polite"></div>
      <div class="et-foot"><span class="et-count"></span><button class="go et-next" hidden>下一句 ▶</button></div>
    </div>`;
  const $ = sel => host.querySelector(sel);
  const show = () => {
    $('.et-me').textContent = REPLIES[i].text;
    $('.et-me').classList.remove('et-in');
    void $('.et-me').offsetWidth;
    $('.et-me').classList.add('et-in');
    $('.et-reveal').textContent = '';
    $('.et-reveal').className = 'et-reveal';
    $('.et-next').hidden = true;
    $('.et-count').textContent = `第 ${i + 1} 句 / 共 ${REPLIES.length} 句`;
    host.querySelectorAll('[data-feel]').forEach(b => { b.disabled = false; b.classList.remove('right', 'et-picked'); });
  };
  host.querySelector('.et-feels').addEventListener('click', e => {
    const b = e.target.closest('[data-feel]');
    if (!b || b.disabled) return;
    const r = REPLIES[i];
    const most = FEELS.find(f => f.id === r.feel).label;
    host.querySelectorAll('[data-feel]').forEach(x => {
      x.disabled = true;
      x.classList.toggle('right', x.dataset.feel === r.feel);
    });
    b.classList.add('et-picked');
    const same = b.dataset.feel === r.feel;
    $('.et-reveal').className = 'et-reveal et-shown';
    $('.et-reveal').textContent = (same ? '你猜對了！' : '你猜的不一樣，很多人會覺得「' + most + '」。') + r.why;
    api.good();
    if (i < REPLIES.length - 1) { $('.et-next').hidden = false; return; }
    $('.et-count').textContent = '🎉 三句都看完了：同一件事，寫法不同，感覺就不同。';
    api.done();
  });
  $('.et-next').onclick = () => { i++; show(); };
  show();
}

export default {
  ready: true,
  unit: {
    id: 'socialmanners',
    part: 'basic',
    icon: '🙏',
    color: '#2f6fb0',
    title: '社群上的禮貌',
    en: 'Social Media Etiquette',
    desc: '文字沒有表情、群組禮貌、先問再貼、留言還是私訊',
    slides: [
      { id: 'tone', title: '文字沒有表情', text: '打字聊天時，對方看不到你的' + t('表情', 'facial expression') + '，也聽不到語氣。同一件事，換個寫法，感覺就不同。猜猜看，朋友讀了會怎麼想？', widget: 'et-tone', params: {} },
      { id: 'group', title: '群組裡的禮貌', text: '群組裡有很多人，你傳一則，大家都會收到。一直傳貼圖、刷很多則，叫' + t('洗版', 'spamming') + '，會吵到別人。分分看！', widget: 'sort', params: {
        bins: [
          { id: 'ok', icon: '👍', label: '好習慣' },
          { id: 'no', icon: '🙅', label: '不要這樣做' },
        ],
        rest: 'ok',
        items: [
          { icon: '📝', label: '把話整理好，一次傳完', bin: 'ok' },
          { icon: '🌙', label: '很晚了，明天再傳', bin: 'ok' },
          { icon: '⏰', label: '很忙時，先回「晚點回你」', bin: 'ok' },
          { icon: '✉️', label: '只跟一個人有關的事，改用私訊', bin: 'ok' },
          { icon: '🌃', label: '半夜傳 20 張貼圖', bin: 'no' },
          { icon: '📸', label: '把朋友的私訊截圖，貼到群組', bin: 'no' },
          { icon: '📣', label: '一直 @ 所有人，催大家回', bin: 'no' },
        ],
      } },
      { id: 'tag', title: '貼照片和標記之前，先問', text: '在照片裡' + t('標記', 'tag') + '朋友，他的朋友也會看到。照片裡有別人，貼出去、標記之前，都要先問過他。一步一步選選看！', widget: 'chatpick', params: {
        name: '📸 生日派對的合照',
        messages: ['🎂 昨天的派對好好玩！', '你拍了一張大家的合照，裡面有阿哲，想貼到社群上。'],
        steps: [
          {
            ask: '照片裡有阿哲。先怎麼做？',
            options: [
              { text: '📩 先問阿哲：「這張可以貼嗎？」', ok: true, act: '📩 你先問了阿哲' },
              { text: '📤 直接貼，再標記他', why: '照片裡有別人，要先問過他。被標記後，他的朋友也都看得到。' },
              { text: '🤫 偷偷貼，不告訴他', why: '他總會看到的。先問，才不會讓朋友難過。' },
            ],
          },
          {
            ask: '阿哲說：「我那張閉著眼睛，不要貼啦！」接下來呢？',
            options: [
              { text: '🔄 換一張他也喜歡的', ok: true, act: '🔄 換了一張大家都喜歡的' },
              { text: '😜 很好笑，還是貼', why: '他不同意，就不要貼。你覺得好笑，他可能會難過。' },
            ],
          },
          {
            ask: '新照片要標記朋友嗎？',
            options: [
              { text: '🏷️ 問過的人，才標記', ok: true, act: '🏷️ 只標記同意的人' },
              { text: '🏷️ 全部的人都標記', why: '有人不想被標記。標記後，很多不認識的人也可能看到。' },
            ],
          },
        ],
        end: '🎉 照片裡有別人：先問再貼，先問再標記。',
      } },
      { id: 'where', title: '留言還是私訊？', text: t('留言', 'comment') + '很多人看得到，' + t('私訊', 'direct message') + '只有對方看得到。提醒別人的小錯，私下說比較好；有些話，在哪裡都不該說。分分看！', widget: 'sort', params: {
        bins: [
          { id: 'pub', icon: '💬', label: '公開留言' },
          { id: 'dm', icon: '✉️', label: '私訊' },
          { id: 'none', icon: '🙊', label: '都不要說' },
        ],
        items: [
          { icon: '🎉', label: '「恭喜你比賽得獎！」', bin: 'pub' },
          { icon: '🌸', label: '「這張照片拍得好美！」', bin: 'pub' },
          { icon: '🦷', label: '「你照片裡牙齒有菜喔」', bin: 'dm' },
          { icon: '📒', label: '「可以借我數學筆記嗎？」', bin: 'dm' },
          { icon: '🤡', label: '取笑別人的長相', bin: 'none' },
          { icon: '🤐', label: '說出朋友的祕密', bin: 'none' },
        ],
      } },
      { id: 'quiz', title: '考考你', widget: 'choice', params: {
        question: '朋友只回你「喔。」，你覺得他好像在生氣。最好怎麼做？',
        options: [
          { text: '💬 問他：「你是不是不喜歡？我可以再改」', correct: true },
          { text: '😠 回他：「你兇什麼？」' },
          { text: '🔇 從此不理他' },
        ],
        explain: '文字看不出語氣，他可能只是在忙。先問清楚，不要先生氣。',
      } },
    ],
  },
  placement: {
    after: 'wearable', stage: 'social',
    newStage: { id: 'social', after: 'smart', part: 'basic', icon: '💬', title: '社群網路生存指南', en: 'Social Media Survival Guide' },
  },
  prerequisites: ['kind', 'apps', 'footprint'],
  readme: 'Etiquette on social media: text without tone of voice, group-chat manners, asking before posting or tagging someone, and when to use a public comment or a private message.',
  changelog: '新增「社群上的禮貌」：猜猜同一件事換個寫法會讓人怎麼想，學會群組不洗版、貼照片和標記前先問，以及哪些話適合私訊。',
  widgets: { 'et-tone': tone },
  checks: {
    tone: [click('[data-feel="happy"]'), expect('.et-reveal', '很多人會覺得'), click('.et-next'), click('[data-feel="happy"]'), expect('.et-reveal', '你猜對了'), click('.et-next'), click('[data-feel="upset"]'), expect('.et-count', '三句都看完了')],
    tag: [click('.cp-opts [data-i="1"]'), click('.cp-opts [data-i="0"]'), click('.cp-opts [data-i="0"]'), click('.cp-opts [data-i="0"]'), expect('.cp-q', '先問再貼')],
  },
  css: `
.et-demo { width: 100%; max-width: 640px; margin: auto; display: grid; gap: 12px; font-size: 18px; line-height: 1.5; }
.et-chat { background: var(--card); border: 2px solid var(--line); border-radius: 18px; padding: 12px 14px; display: grid; gap: 8px; }
.et-head { margin: 0; font-weight: 700; color: var(--ink-2); font-size: 16px; }
.et-bub { margin: 0; padding: 10px 14px; border-radius: 16px; max-width: 80%; font-size: 19px; }
.et-them { background: #f1f3f5; justify-self: start; border-bottom-left-radius: 4px; }
.et-me { background: #d0ebff; justify-self: end; border-bottom-right-radius: 4px; font-weight: 700; min-height: 1.5em; }
.et-me.et-in { animation: et-pop 260ms cubic-bezier(.23,1,.32,1); }
@keyframes et-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.et-ask { margin: 0; font-weight: 700; }
.et-feels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.et-feels .option { min-height: 56px; font-size: 17px; text-align: center; padding: 8px; }
.et-feels .option.et-picked:not(.right) { border-color: #1c7ed6; background: #e7f5ff; opacity: 1; }
.et-feels .option:disabled { cursor: default; }
.et-reveal { min-height: 84px; padding: 12px 16px; border-radius: 14px; background: #eef2f7; color: var(--ink-2); }
.et-reveal.et-shown { color: var(--ink); }
.et-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 52px; }
.et-count { font-weight: 700; color: var(--ink-2); }
.et-next { min-height: 52px; padding: 0 18px; font-size: 17px; }
@media (max-width: 899px) { .et-feels { grid-template-columns: 1fr; } .et-feels .option { min-height: 52px; } }
@media (prefers-reduced-motion: reduce) { .et-me.et-in { animation: none; } }
  `,
};
