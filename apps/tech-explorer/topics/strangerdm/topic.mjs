const t = (zh, en) => '<b class="term">' + zh + '<span class="en" lang="en">' + en + '</span></b>';
const click = selector => ({ action: 'click', selector });
const expect = (selector, text) => ({ action: 'expectText', selector, text });

const shake = el => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

// A stranger's private messages, one at a time. The child marks each one as a warning
// sign or not. A right answer tags the bubble; the next message then arrives.
const MESSAGES = [
  { text: '嗨！你也在玩方塊島嗎？', red: false, tag: '聊遊戲很平常。可是你還不知道他是誰。', hint: '問你玩不玩遊戲，本身還好。' },
  { text: '我跟你一樣，也是六年級喔 😊', red: true, tag: '🚩 說跟你一樣大：網路上看不到他是誰', hint: '他真的是六年級嗎？你看不到他。' },
  { text: '你畫的圖是我看過最棒的！你比同學成熟多了', red: true, tag: '🚩 一直稱讚你，說你很特別', hint: '剛認識就一直說你很特別，要小心。' },
  { text: '今天的任務好難，你過了嗎？', red: false, tag: '問遊戲任務，很平常。', hint: '聊任務，本身還好。' },
  { text: '送你 500 點遊戲點數，不用還喔 🎁', red: true, tag: '🚩 送你東西，讓你覺得欠他', hint: '不認識的人為什麼送你東西？' },
  { text: '這是我們的祕密，不要跟爸媽說喔', red: true, tag: '🚩 要你保密，不讓大人知道', hint: '要你對爸媽保密，是很重要的警訊。' },
  { text: '這裡不方便，我們換到另一個 App 聊', red: true, tag: '🚩 要換到大人看不到的地方', hint: '為什麼要換地方？可能是想躲開大人。' },
  { text: '傳一張你的照片給我看看嘛', red: true, tag: '🚩 跟你要照片', hint: '跟不認識的人要照片，是警訊。' },
];
const RED = MESSAGES.filter(m => m.red).length;

function signs(host, _, api) {
  host.innerHTML = `
    <div class="sd-demo">
      <div class="sd-phone">
        <p class="sd-head">💬 星星小雨 <small>不認識的人</small></p>
        <div class="sd-thread"></div>
      </div>
      <div class="sd-ask">
        <p class="sd-q">這一則，是警訊嗎？</p>
        <div class="sd-btns">
          <button class="sd-btn" data-v="red">🚩 是警訊</button>
          <button class="sd-btn" data-v="ok">👌 還好</button>
        </div>
      </div>
      <p class="sd-status" role="status" aria-live="polite">一則一則看，判斷是不是警訊。</p>
      <p class="sd-count">警訊 0/${RED}</p>
    </div>`;
  const $ = sel => host.querySelector(sel);
  const thread = $('.sd-thread');
  let n = 0, found = 0, bubble = null;

  const show = () => {
    bubble = document.createElement('div');
    bubble.className = 'sd-bub sd-now';
    bubble.innerHTML = '<p>' + MESSAGES[n].text + '</p>';
    thread.append(bubble);
    thread.scrollTop = thread.scrollHeight;
  };

  host.querySelector('.sd-btns').addEventListener('click', e => {
    const b = e.target.closest('[data-v]');
    if (!b || n >= MESSAGES.length) return;
    const m = MESSAGES[n];
    if ((b.dataset.v === 'red') !== m.red) {
      shake(bubble);
      $('.sd-status').textContent = '再想想：' + m.hint;
      api.bad();
      return;
    }
    api.good();
    bubble.classList.remove('sd-now');
    bubble.classList.add(m.red ? 'sd-red' : 'sd-ok');
    bubble.insertAdjacentHTML('beforeend', '<small class="sd-tag">' + m.tag + '</small>');
    if (m.red) found++;
    $('.sd-count').textContent = '警訊 ' + found + '/' + RED;
    $('.sd-status').textContent = m.red ? '對，這是警訊。' : '對，這一則還好。';
    n++;
    if (n < MESSAGES.length) { show(); return; }
    $('.sd-ask').hidden = true;
    $('.sd-status').textContent = '🎉 ' + RED + ' 個警訊都找到了！先拉近關係，再要你保密、換地方、要照片：這就是誘騙的套路。';
    api.done();
  });
  show();
}

export default {
  ready: true,
  unit: {
    id: 'strangerdm',
    part: 'basic',
    icon: '📩',
    color: '#364fc7',
    title: '陌生人的私訊',
    en: 'Messages from Strangers',
    desc: '認出誘騙的警訊，被要照片或被威脅時怎麼做',
    slides: [
      {
        id: 'signs',
        title: '他想拉近關係？',
        text: `有些壞人會假裝是同年紀的朋友，一步一步拉近關係，再提出要求，這叫${t('誘騙', 'grooming')}。一則一則看，找出警訊！`,
        widget: 'sd-signs',
        params: {},
      },
      {
        id: 'sort',
        title: '警訊，還是平常？',
        text: '網路上的朋友不一定是壞人，但有些要求是警訊。看到警訊，就停下來，告訴信任的大人。分分看！',
        widget: 'sort',
        params: {
          bins: [
            { id: 'red', icon: '🚩', label: '警訊' },
            { id: 'ok', icon: '👌', label: '平常' },
          ],
          rest: 'ok',
          items: [
            { icon: '🎁', label: '送你點數或遊戲造型', bin: 'red' },
            { icon: '📲', label: '要你換到別的 App 聊', bin: 'red' },
            { icon: '📷', label: '要你的照片或開視訊', bin: 'red' },
            { icon: '💔', label: '說「只有我懂你」', bin: 'red' },
            { icon: '🏫', label: '問你住哪、讀哪間學校', bin: 'red' },
            { icon: '📚', label: '同學在班級群組問作業', bin: 'ok' },
            { icon: '🎮', label: '隊友說「剛剛打得好！」', bin: 'ok' },
            { icon: '🧑‍🏫', label: '老師在班級群組發通知', bin: 'ok' },
            { icon: '🤫', label: '要你保密，不要跟爸媽說', bin: 'red' },
          ],
        },
      },
      {
        id: 'photo',
        title: '跟你要私密照片',
        text: `有人跟你要${t('私密照片', 'private photo')}，像穿很少或沒穿衣服的照片。不管他是誰、說什麼，你都可以拒絕。選出最好的做法！`,
        widget: 'chatpick',
        params: {
          name: '💬 星星小雨',
          messages: ['我們是好朋友吧？', '傳一張穿很少衣服的照片給我，只有我會看 🤫'],
          steps: [
            {
              ask: '他跟你要這種照片，先怎麼做？',
              options: [
                { text: '🙅 不傳，也不用回', ok: true, act: '🙅 你沒有傳照片' },
                { text: '📷 傳一張，他說只有他會看', why: '照片傳出去就收不回來。對方可以存下來、傳給別人。' },
                { text: '😟 怕他生氣，先答應', why: '他生氣不是你的錯。你不用答應。' },
              ],
            },
            {
              ask: '接下來呢？',
              options: [
                { text: '📸 截圖，留下證據', ok: true, act: '📸 已截圖' },
                { text: '🗑️ 刪掉聊天，當作沒發生', why: '刪掉就沒有證據了。先截圖，大人才能幫忙。' },
              ],
            },
            {
              ask: '截好圖了，再來呢？',
              options: [
                { text: '🙋 告訴信任的大人', ok: true, act: '🙋 已經告訴爸爸' },
                { text: '🤐 不敢說，怕被罵', why: '你沒有做錯事。說出來，大人才能保護你。' },
              ],
            },
            {
              ask: '不想再收到他的訊息，可以怎麼做？',
              options: [
                { text: '🚫 封鎖，並檢舉這個帳號', ok: true, act: '🚫 已封鎖、已檢舉' },
                { text: '💬 再跟他講道理', why: '不用再跟他聊。封鎖、檢舉就好。' },
              ],
            },
          ],
          end: '🎉 做得好！跟你要這種照片的人，就是不對。你可以拒絕，也一定要說出來。',
        },
      },
      {
        id: 'threat',
        title: '被威脅了，怎麼辦？',
        text: `如果有人拿照片威脅你，要錢或要更多照片，這叫${t('性勒索', 'sextortion')}。不是你的錯，什麼時候說都不晚，大人會幫你。排排看！`,
        widget: 'order',
        params: {
          items: [
            { icon: '🛑', label: '不付錢，也不再傳任何照片' },
            { icon: '📸', label: '截圖：對方的帳號、訊息和網址' },
            { icon: '🙋', label: '馬上告訴信任的大人' },
            { icon: '🚓', label: '大人陪你打 110 報警，也可以請「性影像處理中心」幫忙下架' },
          ],
        },
      },
      {
        id: 'quiz',
        title: '考考你',
        widget: 'choice',
        params: {
          question: '小安傳過一張照片。現在對方說：「不再傳更多，我就傳給你全班。」小安可以怎麼想？',
          options: [
            { text: '🤝 不是我的錯，現在告訴大人還來得及', correct: true },
            { text: '😣 都是我的錯，只能自己解決' },
            { text: '💸 先付錢或照做，他就會刪掉' },
          ],
          explain: '照做或付錢，對方常常會要更多。說出來，大人和警察會幫忙；衛福部「性影像處理中心」可以幫忙下架照片，也可以打 113 保護專線。',
        },
      },
    ],
  },
  placement: { after: 'influencers', stage: 'social' },
  prerequisites: ['influencers', 'maps', 'photoshare', 'kind'],
  readme: 'Spot grooming warning signs in a stranger\'s messages, refuse requests for private photos, and respond to sextortion threats by keeping evidence and telling a trusted adult.',
  changelog: '新增「陌生人的私訊」：在模擬私訊裡找出誘騙的警訊（裝同年紀、送禮物、要保密、換 App、要照片），學會拒絕私密照片的要求；被威脅時不付錢、留證據、告訴大人，並認識 110、113 和性影像處理中心。',
  widgets: { 'sd-signs': signs },
  checks: {
    signs: [
      click('.sd-btns [data-v="red"]'), expect('.sd-status', '再想想'),
      click('.sd-btns [data-v="ok"]'),
      click('.sd-btns [data-v="red"]'),
      click('.sd-btns [data-v="red"]'),
      click('.sd-btns [data-v="ok"]'),
      click('.sd-btns [data-v="red"]'),
      click('.sd-btns [data-v="red"]'),
      click('.sd-btns [data-v="red"]'),
      click('.sd-btns [data-v="red"]'),
      expect('.sd-count', '警訊 6/6'),
      expect('.sd-status', '誘騙'),
    ],
    photo: [
      click('.cp-opts [data-i="1"]'), expect('.cp-why', '收不回來'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      click('.cp-opts [data-i="0"]'),
      expect('.cp-q', '做得好'),
    ],
  },
  css: `
.sd-demo { width: 100%; max-width: 640px; margin: auto; display: grid; gap: 12px; font-size: 17px; line-height: 1.5; }
.sd-phone { border-radius: 18px; background: #edf2ff; border: 2px solid var(--line); overflow: hidden; }
.sd-head { margin: 0; padding: 8px 14px; background: var(--card); border-bottom: 2px solid var(--line); font-weight: 800; }
.sd-head small { margin-left: 6px; font-size: 15px; font-weight: 700; color: var(--ink-3); }
.sd-thread { display: flex; flex-direction: column; gap: 8px; height: min(34vh, 300px); overflow-y: auto; padding: 10px 12px; scroll-behavior: smooth; }
.sd-bub { align-self: flex-start; max-width: 88%; padding: 8px 12px; border-radius: 14px 14px 14px 4px; background: var(--card); border: 2px solid transparent; }
.sd-bub p { margin: 0; font-weight: 600; }
.sd-bub.sd-now { border-color: #1c7ed6; box-shadow: 0 0 0 3px #e7f5ff; }
.sd-bub.sd-red { border-color: #ffa8a8; background: #fff5f5; }
.sd-bub.sd-ok { border-color: #b2f2bb; }
.sd-tag { display: block; margin-top: 4px; font-size: 15px; font-weight: 800; color: var(--ink-2); }
.sd-bub.sd-red .sd-tag { color: #c92a2a; }
.sd-ask { display: grid; gap: 8px; }
.sd-ask[hidden] { display: none; }
.sd-q { margin: 0; font-weight: 800; }
.sd-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sd-btn { min-height: 52px; font-size: 18px; font-weight: 800; background: var(--card); border: 2px solid var(--line); border-radius: 14px; box-shadow: 0 3px 0 var(--line); }
.sd-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--line); }
.sd-status { margin: 0; padding: 10px 14px; border-radius: 14px; background: #eef1f8; min-height: 3.2em; font-weight: 700; }
.sd-count { margin: 0; text-align: center; font-weight: 800; color: var(--c); }
@media (prefers-reduced-motion: reduce) { .sd-thread { scroll-behavior: auto; } .sd-btn:active { transform: none; } }
  `,
};
