// Lesson content. Each unit is a list of slides; a slide has a title, a short text and either
// a static `art` (HTML) or a `widget` (an interaction from widgets.js) with its params.
// Keep each text to two or three short sentences: a child reads it in one breath.
// A unit or slide added after the first version has `added: 'YYYY-MM-DD'`; the home screen
// shows it as new (🆕) in browsers that started before that day.

// A new term, shown in zh-TW with its English name beside it.
const t = (zh, en) => `<b class="term">${zh}<span class="en" lang="en">${en}</span></b>`;

// Plug ends (filled) and ports (hollow) for the cables unit, as small inline SVGs.
const PLUGS = {
  'usb-a': '<rect x="6" y="9" width="44" height="18" rx="2"/><rect x="11" y="13" width="34" height="5" fill="#fff"/>',
  'usb-c': '<rect x="10" y="11" width="36" height="14" rx="7"/><rect x="16" y="16" width="24" height="4" rx="2" fill="#fff"/>',
  lightning: '<rect x="12" y="12" width="32" height="12" rx="4"/><g fill="#fcc419"><rect x="16" y="15" width="3" height="6"/><rect x="22" y="15" width="3" height="6"/><rect x="28" y="15" width="3" height="6"/><rect x="34" y="15" width="3" height="6"/></g>',
  micro: '<path d="M14 12h28l-4 12H18z"/><rect x="20" y="15" width="16" height="3" fill="#fff"/>',
};
const plug = k => `<svg class="conn" viewBox="0 0 56 36" fill="#495057">${PLUGS[k]}</svg>`;
const port = k => `<svg class="conn port" viewBox="0 0 56 36" fill="none" stroke="#212529" stroke-width="2.5">${PLUGS[k].replace(/ fill="[^"]*"/g, ' fill="none"')}</svg>`;

// A USB flash drive; no emoji draws one (🔑 read as a key).
const USB = '<svg class="usb-ico" viewBox="0 0 32 32" aria-hidden="true"><g transform="rotate(-40 16 16)"><rect x="2" y="10.5" width="19" height="11" rx="3" fill="#1c7ed6"/><rect x="21" y="12" width="9" height="8" rx="1" fill="#dee2e6" stroke="#868e96" stroke-width="1.2"/><rect x="24.5" y="13.8" width="2.4" height="1.8" fill="#495057"/><rect x="24.5" y="16.4" width="2.4" height="1.8" fill="#495057"/><circle cx="6.5" cy="16" r="1.8" fill="#fff"/></g></svg>';

// The picture on '網路是什麼？': a dotted world map, devices joined by curved lines with data
// dots running both ways, and satellites in the corners.
// Land on a 5° grid: for each latitude, the longitude ranges that are land (rough, by eye).
const LAND = {
  80: [[-92, -62], [-70, -20], [12, 28], [95, 105]],
  75: [[-120, -75], [-70, -20], [55, 60], [90, 115], [135, 145]],
  70: [[-165, -85], [-80, -65], [-55, -22], [18, 180]],
  65: [[-165, -85], [-75, -62], [-52, -38], [-24, -14], [10, 180]],
  60: [[-165, -95], [-78, -62], [-48, -42], [5, 18], [22, 165]],
  55: [[-130, -90], [-80, -60], [-6, 0], [8, 12], [20, 162]],
  50: [[-125, -55], [-5, -3], [-1, 140], [142, 144]],
  45: [[-124, -65], [-1, 28], [41, 47], [54, 135], [140, 145]],
  40: [[-124, -74], [-9, 3], [9, 18], [20, 23], [26, 50], [54, 122], [125, 129], [139, 142]],
  35: [[-120, -76], [-6, 11], [35, 120], [127, 129], [132, 140]],
  30: [[-115, -81], [-10, 33], [35, 48], [50, 122], [130, 131]],
  25: [[-114, -110], [-108, -97], [-81, -80], [-15, 35], [38, 57], [60, 120], [121, 122]],
  20: [[-105, -87], [-77, -70], [-17, 37], [40, 57], [70, 87], [93, 110], [120, 122]],
  15: [[-92, -84], [-17, 40], [43, 52], [74, 80], [98, 109], [120, 125]],
  10: [[-85, -62], [-15, 50], [76, 80], [98, 107], [122, 126]],
  5: [[-77, -52], [-8, 48], [95, 104], [114, 119]],
  0: [[-80, -50], [9, 42], [98, 104], [109, 118], [120, 125]],
  '-5': [[-81, -35], [12, 40], [102, 106], [110, 116], [120, 123], [132, 150]],
  '-10': [[-78, -36], [13, 40], [118, 126], [141, 150]],
  '-15': [[-75, -39], [12, 40], [44, 50], [125, 145]],
  '-20': [[-70, -40], [13, 35], [44, 48], [115, 150]],
  '-25': [[-70, -47], [15, 33], [45, 47], [113, 153]],
  '-30': [[-72, -51], [17, 31], [115, 153]],
  '-35': [[-72, -57], [18, 24], [115, 120], [135, 150], [173, 178]],
  '-40': [[-73, -62], [145, 148], [172, 178]],
  '-45': [[-75, -66], [167, 172]],
  '-50': [[-75, -68]],
  '-55': [[-72, -65]],
};
const X = lon => (lon + 180) * 2, Y = lat => (80 - lat) * 2 + 20;

// Dots every 2.5°; a row between two listed rows keeps only land that both of them have.
function worldDots() {
  const land = (lat, lon) => (LAND[lat] || []).some(([a, b]) => lon >= a - 1 && lon <= b + 1);
  let d = '';
  for (let lat = 80; lat >= -55; lat -= 2.5) {
    for (let lon = -178.75; lon < 180; lon += 2.5) {
      const on = lat % 5 === 0 ? land(lat, lon) : land(lat + 2.5, lon) && land(lat - 2.5, lon);
      if (on) d += `M${X(lon)} ${Y(lat)}h0`;
    }
  }
  return d;
}

function netArt() {
  const spots = {
    na: [165, 95, '💻'], eu: [385, 82, '🖥️'], as: [585, 115, '📱'],
    af: [400, 185, '🗄️'], sa: [245, 215, '📺'], au: [630, 245, '🎮'],
  };
  const sats = { s1: [668, 34, '🛰️', 30], s2: [48, 34, '🛰️', 22] };
  // A curve from a to b that bows by `bend`; it stops at the edge of each badge.
  const curve = (a, b, bend, ra = 26, rb = 26) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const cx = mx - (dy / len) * bend, cy = my + (dx / len) * bend;
    const cut = (p, r) => { const ux = cx - p[0], uy = cy - p[1], l = Math.hypot(ux, uy); return [p[0] + (ux / l) * r, p[1] + (uy / l) * r]; };
    const [sx, sy] = cut(a, ra), [ex, ey] = cut(b, rb);
    return `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };
  const S = spots;
  const links = [
    [curve(S.na, S.eu, -40), 3.2], [curve(S.eu, S.as, -35), 3.6], [curve(S.eu, S.af, 25), 2.4],
    [curve(S.na, S.sa, 30), 3], [curve(S.af, S.as, 30), 3.4], [curve(S.as, S.au, -25), 2.6],
    [curve(S.sa, S.af, 25), 3.8],
  ];
  const beams = [[curve(sats.s1, S.as, -20, 18), 2.2], [curve(sats.s2, S.na, 20, 14), 2.6]];
  // Lines that run off the edge: the network goes on beyond the picture.
  const strays = ['M640 245Q700 200 735 160', 'M165 95Q90 70 -15 90', 'M245 215Q170 280 120 335', 'M585 115Q660 95 735 70'];
  // Two data dots per line, one each way, at different speeds.
  const flow = ([d, s], i) => `
    <path d="${d}" class="nm-line"/>
    <circle r="3.6" class="nm-bit"><animateMotion dur="${s}s" begin="-${(i * 0.7) % s}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" path="${d}"/></circle>
    <circle r="3" class="nm-bit nm-back"><animateMotion dur="${(s * 1.3).toFixed(1)}s" begin="-${(i * 1.1) % s}s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="${d}"/></circle>`;
  const badge = ([x, y, icon], r = 26, size = 26) => `
    <circle cx="${x}" cy="${y}" r="${r}" class="nm-badge"/><circle cx="${x}" cy="${y}" r="${r + 7}" class="nm-ring"/>
    <text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${icon}</text>`;
  return `
    <svg class="net-map" viewBox="0 0 720 320" role="img" aria-label="世界地圖上，很多裝置用線連在一起，資料在線上跑來跑去">
      <defs>
        <radialGradient id="nm-sky" cx="55%" cy="40%" r="75%"><stop offset="0" stop-color="#3d5a73"/><stop offset="1" stop-color="#14212e"/></radialGradient>
      </defs>
      <rect width="720" height="320" rx="18" fill="url(#nm-sky)"/>
      <path d="${worldDots()}" class="nm-land"/>
      ${strays.map(d => `<path d="${d}" class="nm-line nm-stray"/>`).join('')}
      ${beams.map(([d, s], i) => flow([d, s], i).replace('class="nm-line"', 'class="nm-line nm-beam"')).join('')}
      ${links.map(flow).join('')}
      ${Object.values(spots).map(p => badge(p)).join('')}
      ${Object.values(sats).map(([x, y, icon, size]) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${icon}</text>`).join('')}
    </svg>`;
}

export const UNITS = [
  {
    id: 'devices',
    part: 'basic',
    icon: '🖥️',
    title: '認識 3C 裝置',
    en: 'Meet Your Devices',
    desc: '電腦、筆電、手機和平板',
    color: '#2f6fdf',
    slides: [
      {
        title: '電腦是什麼？',
        text: "電腦其實就像一台神奇的果汁機！<b class=\"term\">輸入<span class=\"en\" lang=\"en\">Input</span></b>收到材料，在肚子裡<b class=\"term\">處理<span class=\"en\" lang=\"en\">Process</span></b>想一想，最後把好喝的果汁<b class=\"term\">輸出<span class=\"en\" lang=\"en\">Output</span></b>送出來。把水果放進漏斗試試看！",
        widget: 'juicebox',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '桌機和筆電',
        text: "<b class=\"term\">桌上型電腦<span class=\"en\" lang=\"en\">desktop</span></b>主機和螢幕分開又厚重，必須插電；<b class=\"term\">筆記型電腦<span class=\"en\" lang=\"en\">laptop</span></b>與平板有內建電池，能裝進書包隨身帶著走。試著把不同電腦裝進書包！",
        widget: "backpackfit",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '口袋裡的電腦',
        text: "智慧型手機就是一台縮小放進口袋的超級電腦！裡面有大腦 <b class=\"term\">處理器<span class=\"en\" lang=\"en\">CPU</span></b>、隨身帶電的<b class=\"term\">鋰電池<span class=\"en\" lang=\"en\">Battery</span></b>，以及能看能摸的<b class=\"term\">觸控螢幕<span class=\"en\" lang=\"en\">Touchscreen</span></b>。點開晶片並拉動滑桿！",
        widget: 'phonepeek',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '輸入 → 處理 → 輸出',
        text: `你按鍵盤是${t('輸入', 'input')}，電腦的大腦算一算是${t('處理', 'process')}，螢幕顯示出來是${t('輸出', 'output')}。按按看！`,
        widget: 'keys',
        params: { keys: ['A', 'B', 'C', 'D', 'E', 'F'], goal: 4 },
      },
      {
        title: '輸入還是輸出？',
        text: "把信號送進電腦的是「<b class=\"term\">輸入裝置<span class=\"en\" lang=\"en\">input device</span></b>」，電腦把結果展示出來的是「<b class=\"term\">輸出裝置<span class=\"en\" lang=\"en\">output device</span></b>」。將工作台上的外接裝置插上電腦，觀察信號傳送方向！",
        widget: "workbench",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '平板的觸控螢幕，是輸入還是輸出？',
          options: [
            { text: '📥 只有輸入' },
            { text: '📤 只有輸出' },
            { text: '🔁 兩個都是', correct: true },
          ],
          explain: '手指點它是輸入，它顯示畫面是輸出。觸控螢幕一個人做兩份工作！',
        },
      },
    ],
  },

  {
    id: 'start',
    part: 'basic',
    icon: '👆',
    title: '開始操作',
    en: 'Getting Started',
    desc: '解鎖、滑鼠、手勢和傾斜',
    color: '#9c36b5',
    slides: [
      {
        title: '為什麼要解鎖？',
        text: `手機和平板裡有照片、訊息和帳號，這些都是你的${t('隱私', 'privacy')}。設定${t('密碼', 'passcode')}，弄丟了別人也打不開。也可以用 ${t('Face ID', 'face recognition')} 看臉，或 ${t('Touch ID', 'fingerprint')} 按指紋來解鎖。試試看！`,
        widget: 'passcode',
        params: { code: '2580' },
      },
      {
        title: '滑鼠的動作',
        text: `${t('按一下', 'click')}用左鍵；${t('按兩下', 'double-click')}要很快連按兩次；${t('右鍵', 'right-click')}會跳出選單；${t('滾輪', 'scroll wheel')}可以上下捲動，也可以按下去當中鍵；按住不放再移動叫${t('拖曳', 'drag')}。沒有滑鼠的話，用手指試試看！`,
        widget: 'mouselab',
      },
      {
        title: '手指的手勢',
        text: `觸控螢幕看得懂很多${t('手勢', 'gesture')}：${t('點一下', 'tap')}、${t('點兩下', 'double-tap')}、${t('長按', 'long press')}、${t('滑動', 'swipe')}，還有兩根手指的${t('縮放', 'pinch')}和${t('旋轉', 'rotate')}。放大以後，一根手指可以${t('拖移', 'pan')}。在照片上試試看！`,
        widget: 'touchlab',
      },
      {
        title: 'iPad 和 iPhone 的系統手勢',
        text: `有些手勢在任何 App 裡都能用，叫做${t('系統手勢', 'system gesture')}。這些是沒有主畫面按鈕的 iPad 和 iPhone 的手勢。先看示範的手指怎麼滑，再換你在下面的 iPad 上試一次。從 iPad 外面的空白開始滑，就像從螢幕的邊邊滑進來。`,
        widget: 'sysgesture',
      },
      {
        title: '傾斜也是一種輸入',
        text: `很多遊戲用${t('傾斜', 'tilt')}來玩：把平板往左歪，球就往左滾。這靠的是${t('陀螺儀', 'gyroscope')}和${t('加速度計', 'accelerometer')}。拖動下面的搖桿，把球滾進洞裡！`,
        widget: 'tilt',
        params: { goal: 3 },
      },
      {
        title: '螢幕為什麼會轉？',
        text: `${t('加速度計', 'accelerometer')}感覺得到地心引力，知道哪一邊是「下面」。平板轉成橫的，畫面就跟著轉正。打開${t('旋轉鎖定', 'rotation lock')}，畫面就不會轉。`,
        widget: 'orient',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '在電腦上，想看看一個檔案還能做什麼（例如重新命名），通常要按什麼？',
          options: [
            { text: '🖱️ 右鍵（平板上是長按）', correct: true },
            { text: '🖱️ 左鍵按兩下' },
            { text: '🛞 滾輪往下滾' },
          ],
          explain: '右鍵會跳出選單，列出可以做的事。在 iPad 上，長按就像右鍵。',
        },
      },
    ],
  },

  {
    id: 'typing',
    part: 'basic',
    icon: '⌨️',
    title: '打字和輸入法',
    en: 'Typing & Keyboards',
    desc: '注音、手寫、語音和特別按鍵',
    color: '#495057',
    slides: [
      {
        title: '換一種方式打字',
        text: `在平板上打字，可以換不同的${t('輸入法', 'input method')}：${t('注音', 'Zhuyin')}、英文、${t('手寫', 'handwriting')}，還有用說的${t('語音輸入', 'dictation')}。按 🌐 可以換鍵盤。打出「貓」試試看！`,
        widget: 'ime',
      },
      {
        title: '鍵盤上的特別按鍵',
        text: '鍵盤上有幾個特別的按鍵，每一個都有自己的工作。把按鍵拖到它的工作。',
        widget: 'sort',
        params: {
          bins: [
            { id: 'up', icon: '🔠', label: '打出大寫字母' },
            { id: 'del', icon: '⬅️', label: '刪掉前一個字' },
            { id: 'ret', icon: '↩️', label: '換到下一行' },
            { id: 'ime', icon: '🔄', label: '換輸入法' },
          ],
          items: [
            { icon: '⇧', label: 'Shift', bin: 'up' },
            { icon: '⌫', label: 'Delete', bin: 'del' },
            { icon: '⏎', label: 'Return', bin: 'ret' },
            { icon: '🌐', label: '地球鍵', bin: 'ime' },
          ],
        },
      },
      {
        title: '復原和重做',
        text: `做錯了不用怕！${t('復原', 'undo')}會回到上一步，${t('重做', 'redo')}會把剛剛復原的再做回來。但是復原以後如果做了新的事，就不能重做了。電腦上按 ⌘Z（Windows 是 Ctrl+Z）；iPad 可以用三根手指往左滑，或按畫面上的 ↶。`,
        widget: 'undo',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '想在訊息裡打一個笑臉 😀，要怎麼做？',
          options: [
            { text: '🌐 按地球鍵，換到表情符號鍵盤', correct: true },
            { text: '⇧ 一直按 Shift' },
            { text: '⌫ 按 Delete' },
          ],
          explain: '表情符號也是一種鍵盤。按 🌐 一直換，就會換到它。',
        },
      },
    ],
  },

  {
    id: 'settings',
    part: 'basic',
    icon: '⚙️',
    title: '設定和通知',
    en: 'Settings & Notifications',
    desc: '字變大、勿擾模式和輔助使用',
    color: '#7950f2',
    slides: [
      {
        title: '設定和通知',
        text: `打開「${t('設定', 'Settings')}」可以把字調大，調亮度和音量。${t('通知', 'notification')}是 App 跳出來的小提醒；打開${t('勿擾模式', 'Do Not Disturb')}，通知就不會響，也不會跳出來。完成三個任務！`,
        widget: 'settings',
      },
      {
        title: '讓每個人都好用',
        text: `每個人看、聽、操作的方式不一樣。設定裡的${t('輔助使用', 'Accessibility')}有放大、粗體字、朗讀螢幕等功能，讓更多人都能用。`,
        widget: 'choice',
        params: {
          question: '外婆說螢幕上的字太小，看不清楚，可以怎麼幫她？',
          options: [
            { text: '🔠 在設定裡把字調大，或打開「放大」', correct: true },
            { text: '🛒 買一台新的平板' },
            { text: '🙅 叫她不要用了' },
          ],
          explain: '不用換新的，打開設定就能調整。幫家人調好，他們用起來會輕鬆很多。',
        },
      },
    ],
  },

  {
    id: 'cables',
    part: 'basic',
    icon: '🔌',
    title: '線材和接頭',
    en: 'Cables & Plugs',
    desc: '每條線的工作、USB 和轉接頭',
    color: '#1098ad',
    slides: [
      {
        title: '每條線都有工作',
        text: `線可以傳${t('電', 'power')}，也可以傳${t('資料', 'data')}、畫面或聲音。把每條線拖到它的工作。`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'tv', icon: '📺', label: '把畫面送到電視' },
            { id: 'net', icon: '🌐', label: '連上網路' },
            { id: 'both', icon: '⚡', label: '充電＋傳資料' },
            { id: 'sound', icon: '🎧', label: '傳聲音' },
          ],
          items: [
            { icon: '🖥️', label: 'HDMI 線', en: 'HDMI cable', bin: 'tv' },
            { icon: '🔗', label: '網路線', en: 'Ethernet cable', bin: 'net' },
            { icon: plug('usb-c'), label: 'USB-C 線', en: 'USB-C cable', bin: 'both' },
            { icon: '🎵', label: '耳機線', en: 'audio cable', bin: 'sound' },
          ],
        },
      },
      {
        title: 'USB 接頭家族',
        text: `${t('USB', 'Universal Serial Bus')} 是最常見的接頭。舊的 ${t('USB-A', 'USB-A')} 是長方形，只能一面插；新的 ${t('USB-C', 'USB-C')} 正反都能插，新的 iPad 和 iPhone 都用它。舊的 iPhone 用 ${t('Lightning', 'Lightning')}。把接頭拖到形狀一樣的孔！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'a', icon: port('usb-a'), label: 'USB-A 孔' },
            { id: 'c', icon: port('usb-c'), label: 'USB-C 孔' },
            { id: 'l', icon: port('lightning'), label: 'Lightning 孔' },
            { id: 'm', icon: port('micro'), label: 'Micro-USB 孔' },
          ],
          items: [
            { icon: plug('usb-a'), label: 'USB-A', bin: 'a' },
            { icon: plug('usb-c'), label: 'USB-C', bin: 'c' },
            { icon: plug('lightning'), label: 'Lightning', bin: 'l' },
            { icon: plug('micro'), label: 'Micro-USB', bin: 'm' },
          ],
        },
      },
      {
        title: '插不進去？用轉接頭',
        text: `接頭和孔的形狀不一樣，就要用${t('轉接頭', 'adapter')}。例如 USB-C 轉 HDMI，可以把 iPad 的畫面送到電視上。`,
        widget: 'choice',
        params: {
          question: 'iPad 只有 USB-C 孔，想接一個舊的 USB-A 鍵盤，需要什麼？',
          options: [
            { text: '🔄 USB-C 轉 USB-A 的轉接頭', correct: true },
            { text: '💪 用力把它塞進去' },
            { text: '📺 HDMI 線' },
          ],
          explain: '轉接頭一邊是 USB-C 接頭，另一邊是 USB-A 孔，就能把兩個不一樣的形狀接起來。',
        },
      },
    ],
  },

  {
    id: 'battery',
    part: 'basic',
    icon: '🔋',
    title: '電池和充電',
    en: 'Battery & Charging',
    desc: '充電器、無線充電、耗電和安全',
    color: '#2f9e44',
    slides: [
      {
        title: '充電器和快充',
        text: `牆上插座的電太強，${t('充電器', 'charger')}會把它變成平板能用的小小的電。充電器上寫的${t('瓦數', 'watts, W')}越大，通常充得越快，不過平板也要支援${t('快充', 'fast charging')}才行。試試看兩種充電器！`,
        widget: 'charge',
      },
      {
        title: '無線充電',
        text: `${t('無線充電', 'wireless charging')}板裡有一圈${t('線圈', 'coil')}，通電後會產生看不見的${t('磁場', 'magnetic field')}。手機裡也有線圈，靠近就能「接」到電，這叫${t('電磁感應', 'electromagnetic induction')}。線圈要對準才充得到，把手機拖到充電板上！`,
        widget: 'qi',
      },
      {
        title: '行動電源',
        text: `${t('行動電源', 'power bank')}就是裝在盒子裡的大電池，出門可以幫手機充電。上面寫的 ${t('mAh', 'milliamp-hour')}（毫安時）表示能裝多少電，數字越大裝越多。`,
        widget: 'choice',
        params: {
          question: '手機電池大約 4000 mAh，一個 10000 mAh 的行動電源，大概能把它充滿幾次？',
          options: [
            { text: '🔋 大約 1～2 次', correct: true },
            { text: '🔋 剛好 2.5 次' },
            { text: '🔋 10 次' },
          ],
          explain: '10000 ÷ 4000 = 2.5，可是充電時會變熱、損失一些電，所以實際上大約只能充滿 1～2 次。',
        },
      },
      {
        title: '什麼最耗電？',
        text: `${t('耗電', 'power use')}最多的通常是螢幕：越亮越耗電。玩遊戲、看影片會讓手機裡的晶片很忙；訊號不好時，手機要更用力找訊號；開著定位（讓手機知道你在哪裡）也要電。電不夠時，可以打開${t('低耗電模式', 'Low Power Mode')}。調調看！`,
        widget: 'battery',
      },
      {
        title: '充電安全',
        text: "睡覺時給 3C 充電，如果悶在被子裡或電線破損，很容易過熱起火！在臥室裡找出 3 個充電危險並動手排除！",
        widget: "charginghazards",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '行動電源變得鼓鼓的，像吹氣球一樣，怎麼辦？',
          options: [
            { text: '🛑 不要再用，請大人拿去電池回收', correct: true },
            { text: '🔌 繼續充電看看' },
            { text: '✋ 用力把它壓平' },
          ],
          explain: '膨脹表示電池壞了，可能會起火。不要壓它、不要丟一般垃圾，要拿去電池回收。',
        },
      },
    ],
  },

  {
    id: 'care',
    part: 'basic',
    icon: '🩹',
    title: '愛護 3C',
    en: 'Device Care',
    desc: '怕水、怕摔、怕熱',
    color: '#e03131',
    slides: [
      {
        title: '怕水也怕食物',
        text: `水和飲料會讓電路${t('短路', 'short circuit')}，食物屑會卡進鍵盤。很多手機寫著${t('防水', 'water resistant')}，其實只是「抗水」：能擋一點水，不能拿去泡水，用久了也會變差。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不要這樣做' },
          ],
          items: [
            { icon: '🧼', label: '用乾淨的手拿平板', bin: 'ok' },
            { icon: '🥤', label: '飲料放遠一點', bin: 'ok' },
            { icon: '🧽', label: '用軟布擦螢幕', bin: 'ok' },
            { icon: '🍪', label: '邊吃餅乾邊打字', bin: 'no' },
            { icon: '🛁', label: '帶手機進浴缸泡澡', bin: 'no' },
            { icon: '☕', label: '把杯子放在筆電旁邊', bin: 'no' },
          ],
        },
      },
      {
        title: '螢幕是玻璃做的',
        text: `手機和平板的螢幕是${t('玻璃', 'glass')}，很硬，可是很脆，一摔就可能裂開。${t('保護殼', 'case')}保護邊角，${t('保護貼', 'screen protector')}保護螢幕。也不要把手機放在褲子後口袋再坐下去。摔摔看！`,
        widget: 'drop',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '手機的電池最怕什麼？',
          options: [
            { text: '🔥 放在大太陽下的車子裡', correct: true },
            { text: '🌙 晚上放在桌上' },
            { text: '🎵 一直聽音樂' },
          ],
          explain: '電池太熱會壞掉，甚至會膨脹。不要把手機放在很熱的地方。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '平板不小心泡到水，第一件事要做什麼？',
          options: [
            { text: '📴 馬上關機、擦乾，交給大人處理', correct: true },
            { text: '🔌 立刻插電充電，看看還能不能用' },
            { text: '💨 用吹風機的熱風猛吹' },
          ],
          explain: '濕濕的時候充電最危險。熱風會傷到零件，Apple 也建議不要把手機埋進米裡，要讓它自然晾乾。',
        },
      },
    ],
  },

  {
    id: 'ewaste',
    part: 'basic',
    icon: '♻️',
    title: '電子廢棄物',
    en: 'E-waste',
    desc: '舊 3C 要丟哪裡、手機裡有什麼、送走前先清乾淨',
    color: '#1864ab',
    added: '2026-10-19',
    slides: [
      {
        title: '舊 3C 要丟哪裡？',
        text: "壞掉的手機、線材和用完的乾電池不能丟進垃圾車！用過的髒衛生紙是一般垃圾。將物品精準投入正確的回收管道！",
        widget: 'ewastechute',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '手機裡面有什麼？',
        text: '舊手機裡有寶貝，也有危險的東西。回收工廠會把它拆開，好的材料再用一次，危險的東西安全處理。點點看！',
        widget: 'phoneparts',
      },
      {
        title: '送走以前，先清乾淨',
        text: '舊手機要回收或送人以前，裡面的照片和帳號要先處理好，不然別人可能看得到。排排看！',
        widget: 'order',
        params: {
          items: [
            { icon: '☁️', label: '備份照片和資料' },
            { icon: '🔓', label: '登出帳號，關掉「尋找」' },
            { icon: '🧹', label: '清除所有內容和設定' },
            { icon: '♻️', label: '拿去回收，或送給別人' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '家裡抽屜有 3 支不用的舊手機。怎麼做最好？',
          options: [
            { text: '♻️ 清空資料以後，拿去電信門市或回收點', correct: true },
            { text: '🗄️ 一直放在抽屜裡' },
            { text: '🗑️ 丟進一般垃圾桶' },
          ],
          explain: '放在抽屜裡，裡面的金屬就浪費了，舊電池也可能慢慢鼓起來。清空資料再回收，最安全。',
        },
      },
    ],
  },

  {
    id: 'health',
    part: 'basic',
    icon: '🧘',
    title: '健康使用 3C',
    en: 'Healthy Screen Use',
    desc: '3010 護眼、姿勢、睡前和螢幕使用時間',
    color: '#099268',
    added: '2026-10-19',
    slides: [
      {
        title: '護眼口訣 3010',
        text: '眼睛一直看近的東西，會很累。台灣的護眼口訣「3010」：用眼 30 分鐘，就休息 10 分鐘，看看遠方，或到戶外走走。試試看！',
        widget: 'eyerest',
      },
      {
        title: '看螢幕的姿勢',
        text: '看螢幕的姿勢也很重要。低頭太久，脖子會痠；離太近、光線太暗，眼睛會累。分分看，哪些是好習慣？',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不要這樣做' },
          ],
          items: [
            { icon: '🪑', label: '坐好，背靠著椅背', bin: 'ok' },
            { icon: '📏', label: '眼睛離平板 30 公分以上', bin: 'ok' },
            { icon: '💡', label: '在明亮的地方看', bin: 'ok' },
            { icon: '🛌', label: '躺著滑手機', bin: 'no' },
            { icon: '🌑', label: '關了燈，在黑暗中看', bin: 'no' },
            { icon: '🚶', label: '邊走路邊看手機', bin: 'no' },
          ],
        },
      },
      {
        title: '睡前放下螢幕',
        text: '睡前看螢幕，亮亮的光和好看的影片會讓大腦太興奮，比較難睡著。睡前一小時就放下 3C，放在房間外面充電。',
        widget: 'choice',
        params: {
          question: '晚上 9 點要睡覺，什麼時候放下平板最好？',
          options: [
            { text: '🕗 8 點就放下', correct: true },
            { text: '🕘 8 點 55 分再放下' },
            { text: '🛏️ 帶進被窩，看到睡著' },
          ],
          explain: '睡前留一小時不看螢幕，比較好睡。平板放在房間外面充電，就不會想偷看。',
        },
      },
      {
        title: '螢幕使用時間',
        text: `iPad 的${t('螢幕使用時間', 'Screen Time')}會記錄每天用了多久，也能設定每種 App 一天可以用多久。爸媽也可以用它幫忙管理。把影片和遊戲調到 2 小時以內！`,
        widget: 'screentime',
        params: {
          goal: 120,
          apps: [
            { icon: '🎬', name: '影片', min: 150, fun: true },
            { icon: '🎮', name: '遊戲', min: 90, fun: true },
            { icon: '📚', name: '學習', min: 30 },
            { icon: '💬', name: '傳訊息', min: 15 },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '已經看平板 30 分鐘了，最好怎麼做？',
          options: [
            { text: '🌳 休息 10 分鐘，看看遠方或到外面走走', correct: true },
            { text: '🔆 把螢幕調亮一點，繼續看' },
            { text: '📱 換成手機繼續看' },
          ],
          explain: '換一個螢幕，眼睛還是在看近的東西。休息時看遠方，眼睛才會放鬆。',
        },
      },
    ],
  },

  {
    id: 'camera',
    part: 'basic',
    icon: '📷',
    title: '拍照和錄影',
    en: 'Camera',
    desc: '相機怎麼用、鏡頭在哪裡',
    color: '#5c940d',
    slides: [
      {
        title: '用相機拍照和錄影',
        text: `相機 App 有${t('拍照', 'photo')}和${t('錄影', 'video')}兩種模式。按大大的${t('快門', 'shutter')}按鈕就拍一張，拍到的是按下去那一刻的畫面。拍照時按住快門不放，會直接錄影，放開就停。在錄影模式，按紅色按鈕開始，再按一次停止。還可以切換${t('前鏡頭', 'front camera')}和${t('後鏡頭', 'back camera')}。完成五個任務！`,
        widget: 'camera',
      },
      {
        title: '鏡頭在哪裡？',
        text: `筆電的鏡頭在螢幕上方。平板和手機的前鏡頭在螢幕邊框上，後鏡頭在背面。點點看，把鏡頭找出來！`,
        widget: 'findcam',
      },
      {
        title: '鏡頭和隱私',
        text: `鏡頭打開時，筆電旁邊的小燈會亮；iPhone 和 iPad 的螢幕上方會出現${t('綠色小點', 'camera indicator')}。拍到的東西都是${t('隱私', 'privacy')}，要小心。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不可以' },
          ],
          items: [
            { icon: '🙋', label: '拍別人之前先問一聲', bin: 'ok' },
            { icon: '📴', label: '視訊結束就關掉鏡頭', bin: 'ok' },
            { icon: '🟢', label: '沒在用卻看到綠燈，告訴大人', bin: 'ok' },
            { icon: '🤫', label: '偷偷拍同學', bin: 'no' },
            { icon: '🏫', label: '把看得到學校名字的照片貼上網', bin: 'no' },
            { icon: '👤', label: '不認識的網友叫你開鏡頭就開', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: 'iPad 螢幕上方出現一個綠色小點，表示什麼？',
          options: [
            { text: '📷 有 App 正在使用鏡頭', correct: true },
            { text: '🔋 電池充飽了' },
            { text: '📶 Wi-Fi 很快' },
          ],
          explain: '綠點表示鏡頭正在用，橘點表示麥克風正在用。沒有在拍照或視訊卻看到它，要告訴大人。',
        },
      },
    ],
  },

  {
    id: 'files',
    part: 'basic',
    icon: '🗂️',
    title: '檔案和資料夾',
    en: 'Files & Folders',
    desc: '選取、資料夾、拷貝和貼上',
    color: '#a0522d',
    slides: [
      {
        title: '資料和檔案',
        text: `照片、影片、歌曲、作業，在電腦裡都是${t('資料', 'data')}，一份一份${t('儲存', 'save')}成${t('檔案', 'file')}。很多檔案可以放進同一個${t('資料夾', 'folder')}，就像把紙放進文件夾。點點看，把檔案放進資料夾！`,
        widget: 'stash',
      },
      {
        title: '選取',
        text: `要對檔案做事，先要${t('選取', 'select')}它。點一下選一個，再點一下就${t('取消選取', 'deselect')}。按住 Shift 可以${t('連續選取', 'range select')}一整排；按住 ⌘（Windows 是 Ctrl）可以${t('跳著選取', 'multi-select')}。在 iPad 的照片 App，先按「選取」，再用手指滑過去，也能一次選很多張。`,
        widget: 'select',
      },
      {
        title: '資料夾和路徑',
        text: `檔案多了，就要用${t('資料夾', 'folder')}整理，資料夾裡面還可以再放資料夾，像一棵倒過來的樹。從最上層一路走到某個檔案的路線，叫做${t('路徑', 'path')}。先${t('新增資料夾', 'new folder')}，再把檔案拖進去，或先點檔案、再點資料夾！`,
        widget: 'folders',
      },
      {
        title: '拷貝、剪下、貼上',
        text: `${t('拷貝', 'copy')}會多做一份，原本的還在；${t('剪下', 'cut')}會把原本的拿走。拿起來的東西先放在看不見的${t('剪貼簿', 'clipboard')}，再${t('貼上', 'paste')}到新的地方。文字和檔案都可以這樣做。`,
        widget: 'clipboard',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '想把照片「搬」到另一個資料夾，原本的地方不要留，應該用哪一個？',
          options: [
            { text: '✂️ 剪下，再貼上', correct: true },
            { text: '📄 拷貝，再貼上' },
            { text: '🗑️ 直接刪除' },
          ],
          explain: '剪下再貼上就是搬家；拷貝再貼上會變成兩份，佔兩倍的空間。',
        },
      },
    ],
  },

  {
    id: 'space',
    part: 'basic',
    icon: '🗑️',
    title: '刪除和容量',
    en: 'Delete & Storage Space',
    desc: '最近刪除、永久刪除和 KB／MB／GB',
    color: '#862e9c',
    slides: [
      {
        title: '重新命名和刪除',
        text: `檔案可以${t('重新命名', 'rename')}、${t('移動', 'move')}到資料夾，不要的可以${t('刪除', 'delete')}。刪掉的東西會先放進「最近刪除」，大約 30 天後才真的消失；按了${t('永久刪除', 'delete permanently')}，就再也找不回來了。完成所有任務！`,
        widget: 'files',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '照片刪掉以後，在「最近刪除」裡放超過 30 天，會怎樣？',
          options: [
            { text: '💨 永遠消失，找不回來', correct: true },
            { text: '🔁 自己跑回相簿' },
            { text: '🎬 變成一段影片' },
          ],
          explain: '刪除前要想清楚。重要的照片最好先備份，也就是多存一份在別的地方。',
        },
      },
      {
        title: '從小排到大',
        text: '資料有大有小。從<b>最小</b>的開始，依順序點一點。',
        widget: 'order',
        params: {
          items: [
            { icon: '🔤', label: '一個字' },
            { icon: '📷', label: '一張照片' },
            { icon: '🎬', label: '一部電影' },
            { icon: '🎮', label: '一整個大型遊戲' },
          ],
        },
      },
      {
        title: 'KB、MB、GB、TB',
        text: `檔案大小的單位是${t('位元組', 'byte')}，寫成大寫 B。${t('KB', 'kilobyte')}、${t('MB', 'megabyte')}、${t('GB', 'gigabyte')}、${t('TB', 'terabyte')}，每一級大約是前一級的 1000 倍。平板寫著 128 GB，就是它能裝多少東西。把每個東西拖到差不多的大小！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'kb', icon: '🐜', label: 'KB' },
            { id: 'mb', icon: '🐕', label: 'MB' },
            { id: 'gb', icon: '🐘', label: 'GB' },
            { id: 'tb', icon: '🐋', label: 'TB' },
          ],
          items: [
            { icon: '📝', label: '一頁文字', bin: 'kb' },
            { icon: '📧', label: '一封短短的信', bin: 'kb' },
            { icon: '📷', label: '一張照片', bin: 'mb' },
            { icon: '🎵', label: '一首歌', bin: 'mb' },
            { icon: '🎬', label: '一部電影', bin: 'gb' },
            { icon: '🎮', label: '一個大型遊戲', bin: 'gb' },
            { icon: '🗄️', label: '一千部電影', bin: 'tb' },
          ],
        },
      },
    ],
  },

  {
    id: 'formats',
    part: 'basic',
    icon: '📄',
    title: '檔案格式',
    en: 'File Types',
    desc: '副檔名、用對的 App 打開、壓縮檔',
    color: '#3b5bdb',
    added: '2026-10-19',
    slides: [
      {
        title: '檔名的尾巴',
        text: `檔名最後的「.jpg」「.mp4」叫做${t('副檔名', 'file extension')}，它告訴裝置這是什麼檔案、要用哪個 App 打開。幫每個檔案找到對的 App！`,
        widget: 'openwith',
      },
      {
        title: '改名字，不會變格式',
        text: `把「小星星.mp3」改名成「小星星.mp4」，裡面還是聲音，不會變成影片。要換格式，要用 App ${t('轉檔', 'convert')}。`,
        widget: 'choice',
        params: {
          question: '阿公的舊電腦打不開孫子傳來的「全家福.heic」照片。怎麼做比較好？',
          options: [
            { text: '📤 請孫子改傳 .jpg，或用 App 轉成 .jpg', correct: true },
            { text: '✏️ 把檔名改成「全家福.jpg」' },
            { text: '🗑️ 照片壞掉了，刪掉吧' },
          ],
          explain: '.heic 是 iPhone 常用的照片格式，有些舊電腦看不懂。改名字不會改裡面的內容，要真的轉檔才行。',
        },
      },
      {
        title: '看最後一個點',
        text: '壞人會把程式取名成「發票.pdf.exe」，看起來像文件。副檔名要看<b>最後一個點</b>後面。.exe、.apk 是程式，陌生人傳來的不要打開。分分看！',
        widget: 'sort',
        params: {
          bins: [
            { id: 'pic', icon: '🖼️', label: '照片' },
            { id: 'doc', icon: '📄', label: '文件' },
            { id: 'app', icon: '⚠️', label: '程式，先別打開' },
          ],
          items: [
            { icon: '📎', label: '海邊.jpg', bin: 'pic' },
            { icon: '📎', label: '貓咪.png', bin: 'pic' },
            { icon: '📎', label: '報告.docx', bin: 'doc' },
            { icon: '📎', label: '通知單.pdf', bin: 'doc' },
            { icon: '📎', label: '發票.pdf.exe', bin: 'app' },
            { icon: '📎', label: '可愛照片.jpg.apk', bin: 'app' },
            { icon: '📎', label: '免費遊戲.exe', bin: 'app' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '老師寄來「學習單.zip」，點開以後變成一個資料夾，裡面有 3 個 .pdf。這是怎麼回事？',
          options: [
            { text: '🗜️ .zip 是壓縮檔，打開時把裡面的檔案拿出來了', correct: true },
            { text: '🦠 檔案中毒，自己變多了' },
            { text: '📮 老師寄錯了' },
          ],
          explain: '.zip 把好幾個檔案包成一個，比較小，也比較好傳。iPad 的「檔案」App 點一下就能解壓縮。',
        },
      },
    ],
  },

  {
    id: 'online',
    part: 'basic',
    icon: '📶',
    title: '連上網路',
    en: 'Getting Online',
    desc: '上線、離線和三種上網方法',
    color: '#0b7285',
    slides: [
      {
        title: '網路是什麼？',
        text: `${t('網路', 'network')}就是很多電腦連在一起，可以互相傳東西。全世界的網路連起來，就叫做${t('網際網路', 'Internet')}。`,
        art: netArt(),
      },
      {
        title: '上線還是離線？',
        text: `連上網路叫做${t('上線', 'online')}，沒有連上叫做${t('離線', 'offline')}。有些事離線也能做，有些一定要上線。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'on', icon: '🟢', label: '要上線', en: 'online' },
            { id: 'off', icon: '⚪', label: '離線也可以', en: 'offline' },
          ],
          items: [
            { icon: '📹', label: '和外婆視訊', bin: 'on' },
            { icon: '🔍', label: '上網查資料', bin: 'on' },
            { icon: '💬', label: '傳訊息給同學', bin: 'on' },
            { icon: '📷', label: '用相機拍照', bin: 'off' },
            { icon: '🧮', label: '用計算機算數學', bin: 'off' },
            { icon: '🎞️', label: '看已經下載好的影片', bin: 'off' },
          ],
        },
      },
      {
        title: '三種上網的方法',
        text: `插${t('網路線', 'Ethernet cable')}最穩定；${t('Wi-Fi', 'wireless network')}用看不見的${t('無線電波', 'radio waves')}，在家裡、學校不用線；出門在外，手機用${t('行動網路', 'cellular data')}連到基地台，像 4G、5G。在大海、高山這些特別的地方，沒有基地台，還可以用${t('衛星網路', 'satellite internet')}，訊號從太空傳下來。幫每個人選對方法！`,
        widget: 'connect',
        params: {
          rounds: [
            { who: '🖥️', scene: '電腦教室的桌上型電腦，旁邊有網路孔', want: 'cable' },
            { who: '📱', scene: '在公車上，沒有 Wi-Fi，也沒有網路線', want: 'cell' },
            { who: '📲', scene: '在家裡的沙發上用平板', want: 'wifi' },
            { who: '🚢', scene: '在大海中間的船上，附近沒有基地台', want: 'sat', no: { cell: '大海中間離基地台太遠，收不到訊號' } },
          ],
        },
      },
      {
        title: '個人熱點',
        text: `手機可以把自己的行動網路分享出去，變成一個小小的 Wi-Fi，叫做${t('個人熱點', 'personal hotspot')}。平板或筆電連上它就能上網，不過會用掉手機的${t('流量', 'mobile data')}和電，記得設密碼。試試看！`,
        widget: 'hotspot',
      },
      {
        title: '網路有多快？',
        text: `網路速度的單位是 ${t('Mbps', 'megabits per second')}，意思是「每秒能傳幾百萬個位元」。數字越大，下載越快。用不同的網速，下載同一部 50 MB 的影片試試看！`,
        widget: 'speed',
        params: { sizeMB: 50 },
      },
    ],
  },

  {
    id: 'wireless',
    part: 'basic',
    icon: '🛰️',
    title: '藍牙、GPS 和飛航模式',
    en: 'Bluetooth, GPS & Airplane Mode',
    desc: '耳機怎麼連、手機怎麼知道你在哪',
    color: '#0c8599',
    slides: [
      {
        title: '藍牙：近距離的連線',
        text: `${t('藍牙', 'Bluetooth')}也是無線的，但只能連很近的東西，大約一個房間那麼遠，而且很省電。第一次使用要先${t('配對', 'pair')}：打開耳機的配對模式，再到 iPad 的設定裡點它的名字。分分看，哪些用藍牙，哪些用 Wi-Fi？`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'bt', icon: '🔵', label: '藍牙', en: 'Bluetooth' },
            { id: 'wifi', icon: '🛜', label: 'Wi-Fi' },
          ],
          items: [
            { icon: '🎧', label: '無線耳機', bin: 'bt' },
            { icon: '⌚', label: '智慧手錶', bin: 'bt' },
            { icon: '⌨️', label: '無線鍵盤', bin: 'bt' },
            { icon: '📺', label: '看線上影片', bin: 'wifi' },
            { icon: '📹', label: '和朋友視訊', bin: 'wifi' },
            { icon: '⬇️', label: '下載 App', bin: 'wifi' },
          ],
        },
      },
      {
        title: 'GPS：手機怎麼知道你在哪？',
        text: `天上有很多${t('GPS 衛星', 'GPS satellite')}，一直發出「現在幾點」的訊號。手機收到以後，算出離每顆衛星多遠，收到 3～4 顆就能算出你的${t('位置', 'location')}。GPS 不用網路也能用，可是在室內、地下室會收不到。點三顆衛星試試看！`,
        widget: 'gps',
      },
      {
        title: '飛航模式',
        text: `打開${t('飛航模式', 'airplane mode')}，手機會關掉所有會發出訊號的連線：行動網路、Wi-Fi 和藍牙。在飛機上，可以再自己打開 Wi-Fi 或藍牙。打開${t('控制中心', 'Control Center')}試試看！`,
        widget: 'radios',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '在飛機上，手機開了「飛航模式」，還可以做什麼？',
          options: [
            { text: '🎞️ 看已經下載好的影片', correct: true },
            { text: '📹 和朋友視訊' },
            { text: '🔍 上網查資料' },
          ],
          explain: '飛航模式會關掉 Wi-Fi 和行動網路，手機就離線了，只能用已經存在手機裡的東西。',
        },
      },
    ],
  },

  {
    id: 'browser',
    part: 'basic',
    icon: '🧭',
    title: '瀏覽器和網頁',
    en: 'Browsers & Web Pages',
    desc: '網址列、上一頁、重新整理和連結',
    color: '#1971c2',
    slides: [
      {
        title: '用瀏覽器看網頁',
        text: `看網頁的 App 叫做${t('瀏覽器', 'browser')}，像 Safari、Chrome。上面的${t('網址列', 'address bar')}可以輸入網址，打好以後要按 Enter 才會出發；點網頁上的${t('連結', 'link')}會到另一頁。按${t('上一頁', 'back')} ← 回去，${t('下一頁', 'forward')} → 再過去，${t('重新整理', 'reload')} ⟳ 會重新載入這一頁。`,
        widget: 'browser',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '網頁卡住了，或內容好像沒有更新，可以先試試哪一個？',
          options: [
            { text: '⟳ 重新整理', correct: true },
            { text: '← 一直按上一頁' },
            { text: '📴 把平板關機' },
          ],
          explain: '重新整理會重新載入這一頁。不過正在填、還沒送出的表單，重新整理後可能會不見。',
        },
      },
    ],
  },

  {
    id: 'account',
    part: 'basic',
    icon: '🔑',
    title: '帳號和雲端',
    en: 'Accounts & Cloud',
    desc: '註冊、密碼、雲端和小鎖頭',
    color: '#364fc7',
    slides: [
      {
        title: '帳號、註冊和登入',
        text: `很多 App 和網站要先${t('註冊', 'sign up')}一個${t('帳號', 'account')}：取一個${t('使用者名稱', 'user name')}，再設一組${t('密碼', 'password')}。使用者名稱別人看得到，不要用真的名字、生日或學校。下次用一樣的名稱和密碼${t('登入', 'log in')}，它就認得你，你的資料也會跟著你。`,
        widget: 'account',
      },
      {
        title: '好密碼，壞密碼',
        text: '密碼就像家裡的鑰匙。好的密碼要夠長、不好猜，而且不要告訴別人（爸爸媽媽除外）。分分看！',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不要這樣做' },
          ],
          items: [
            { icon: '📏', label: '用一句長長的話當密碼', bin: 'ok' },
            { icon: '🔀', label: '每個網站用不一樣的密碼', bin: 'ok' },
            { icon: '👨‍👩‍👧', label: '只告訴爸爸媽媽', bin: 'ok' },
            { icon: '🔢', label: '用 123456 當密碼', bin: 'no' },
            { icon: '🎂', label: '用自己的生日當密碼', bin: 'no' },
            { icon: '🗒️', label: '寫在紙上貼在螢幕旁邊', bin: 'no' },
          ],
        },
      },
      {
        title: '雲端不在天上！',
        text: `${t('雲端', 'cloud')}其實是很遠的地方的大電腦，叫做${t('伺服器', 'server')}。你把資料${t('上傳', 'upload')}過去，換一台裝置、登入同一個帳號，就能${t('下載', 'download')}回來。試試看！`,
        widget: 'cloud',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '照片有同步到雲端。在 iPad 上刪掉它，iPhone 上的那一張會怎樣？',
          options: [
            { text: '☁️ 也一起不見了', correct: true },
            { text: '📱 還在，不會變' },
            { text: '📸 變成兩張' },
          ],
          explain: '同步就是讓每台裝置都一樣，所以在一台刪掉，其他裝置也會跟著刪掉。刪除前要想清楚！',
        },
      },
      {
        title: 'https 和小鎖頭',
        text: `網址開頭的 ${t('https', 'HTTP Secure')}，最後的 s 就是「安全」的意思。用 https 時，資料在路上都是鎖起來的，網址列會出現小鎖頭 🔒。只有 http 沒有 s，資料就沒有上鎖。`,
        widget: 'choice',
        params: {
          question: '要輸入密碼的登入頁面，網址開頭應該是哪一個？',
          options: [
            { text: '🔒 https://', correct: true },
            { text: 'http://' },
            { text: '都一樣，沒關係' },
          ],
          explain: '有 s 的 https 會把密碼鎖起來再傳，路上的人偷看也看不懂。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '網址列有小鎖頭 🔒，就表示這一定是好網站嗎？',
          options: [
            { text: '🤔 不一定，只表示路上沒人能偷看', correct: true },
            { text: '👍 一定是好網站' },
            { text: '🎁 表示可以領獎品' },
          ],
          explain: '假網站也可以有小鎖頭。小鎖頭只保護「傳送的路上」，網址拼得對不對，還是要自己看清楚。',
        },
      },
    ],
  },

  {
    id: 'passkey',
    part: 'basic',
    icon: '🗝️',
    title: '密碼管理和通行密鑰',
    en: 'Passwords and Passkeys',
    desc: '每個網站不同密碼、密碼 App、通行密鑰',
    color: '#087f5b',
    added: '2026-10-19',
    slides: [
      {
        title: '一個密碼走天下？',
        text: `很多人每個網站都用同一個密碼。可是只要一個網站被駭、密碼被偷走，這叫${t('資料外洩', 'data breach')}，壞人就能拿它打開你所有的帳號。試試看！`,
        widget: 'reuse',
      },
      {
        title: '讓 App 幫你記密碼',
        text: `每個網站都用不一樣的密碼，誰記得住？交給${t('密碼管理工具', 'password manager')}，像 iPad 的「密碼」App：它幫你想很難猜的密碼、幫你記住，用臉或指紋就能填進去。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好方法' },
            { id: 'no', icon: '🙅', label: '不要這樣' },
          ],
          items: [
            { icon: '🔑', label: '用「密碼」App 記住密碼', bin: 'ok' },
            { icon: '🎲', label: '讓它想一個很難猜的密碼', bin: 'ok' },
            { icon: '🧩', label: '每個網站都不一樣', bin: 'ok' },
            { icon: '📝', label: '寫在便利貼，貼在螢幕上', bin: 'no' },
            { icon: '🐼', label: '每個網站都用 panda123', bin: 'no' },
            { icon: '🤫', label: '告訴好朋友，請他幫忙記', bin: 'no' },
          ],
        },
      },
      {
        title: '通行密鑰：不用打密碼',
        text: `${t('通行密鑰', 'passkey')}存在你的裝置裡，用臉、指紋或解鎖密碼就能登入，不用打密碼。它只對真正的網站有用，假網站偷不走。有的網站叫它「通行金鑰」或「密碼金鑰」。試試看！`,
        widget: 'passkeylogin',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你玩的遊戲網站公告：「我們的密碼資料被偷了。」你應該怎麼做？',
          options: [
            { text: '🔁 改掉這個網站的密碼；別的網站用一樣的密碼，也要改', correct: true },
            { text: '🙈 不用理它，又不是我被偷' },
            { text: '📧 回信，把新密碼寄給他們' },
          ],
          explain: '被偷的密碼，壞人會拿去試別的網站。每個網站密碼都不一樣，就只要改一個。',
        },
      },
    ],
  },

  {
    id: 'appbasics',
    part: 'basic',
    icon: '📲',
    title: 'App 和更新',
    en: 'Apps & Updates',
    desc: '安裝、權限，還有為什麼要更新',
    color: '#d6336c',
    slides: [
      {
        title: '硬體和軟體',
        text: `摸得到的零件叫${t('硬體', 'hardware')}，像螢幕、鍵盤。在裡面工作的程式叫${t('軟體', 'software')}，手機上的叫 ${t('App', 'application')}。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'hw', icon: '🔩', label: '硬體', en: 'hardware' },
            { id: 'sw', icon: '✨', label: '軟體', en: 'software' },
          ],
          items: [
            { icon: '🖥️', label: '螢幕', en: 'screen', bin: 'hw' },
            { icon: '🔋', label: '電池', en: 'battery', bin: 'hw' },
            { icon: '⌨️', label: '鍵盤', en: 'keyboard', bin: 'hw' },
            { icon: '🎮', label: '遊戲', en: 'game', bin: 'sw' },
            { icon: '🗺️', label: '地圖 App', en: 'maps app', bin: 'sw' },
            { icon: '🧮', label: '計算機 App', en: 'calculator app', bin: 'sw' },
          ],
        },
      },
      {
        title: '怎麼安裝 App？',
        text: `App 要先${t('下載', 'download')}、${t('安裝', 'install')}才能用，不用了可以${t('刪除', 'delete')}。iPad 和 iPhone 的 App 要從官方的 ${t('App Store', 'App Store')} 下載，不要從奇怪的網站下載。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '🅰️', label: '打開 App Store' },
            { icon: '🔍', label: '搜尋 App 的名字' },
            { icon: '⭐', label: '看評價和適合的年齡' },
            { icon: '🙋', label: '問大人可不可以' },
            { icon: '⬇️', label: '點「取得」安裝' },
          ],
        },
      },
      {
        title: 'App 想用什麼？',
        text: `App 第一次要用相機、麥克風或位置時，會先問你，這叫做${t('權限', 'permission')}。想一想：這個 App 真的需要嗎？分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👌', label: '合理，可以允許' },
            { id: 'odd', icon: '🤨', label: '奇怪，不要允許' },
          ],
          items: [
            { icon: '📷', label: '相機 App 要用相機', bin: 'ok' },
            { icon: '🗺️', label: '地圖 App 要用位置', bin: 'ok' },
            { icon: '📹', label: '視訊 App 要用麥克風', bin: 'ok' },
            { icon: '🔦', label: '手電筒 App 要看通訊錄', bin: 'odd' },
            { icon: '🧮', label: '計算機 App 要用麥克風', bin: 'odd' },
            { icon: '🎨', label: '畫畫 App 要知道你在哪裡', bin: 'odd' },
          ],
        },
      },
      {
        title: '這個 App 是真的嗎？',
        text: `壞人會做出${t('山寨 App', 'fake app')}，名字和圖示都很像真的，裡面卻藏著廣告或${t('惡意程式', 'malware')}。下載前看清楚${t('開發者', 'developer')}、評分和權限。點出真的那一個！`,
        widget: 'fakeapp',
        added: '2026-10-23',
      },
      {
        title: '為什麼要更新？',
        text: `寫 App 的人會一直改進它，再推出${t('更新', 'update')}：修好${t('錯誤', 'bug')}、補好壞人能鑽進來的${t('安全漏洞', 'security hole')}，有時候還加上新功能。跟著步驟試試看！`,
        widget: 'update',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: 'iPad 跳出「有新的軟體更新」，最好怎麼做？',
          options: [
            { text: '🔌 請大人幫忙，在充電、連 Wi-Fi 時更新', correct: true },
            { text: '🙈 永遠都不要更新' },
            { text: '✂️ 更新到一半把電源關掉' },
          ],
          explain: '更新會修好漏洞，讓裝置更安全。更新要花一點時間，所以要接著充電，也不要中途關機。',
        },
      },
    ],
  },

  {
    id: 'apps',
    part: 'basic',
    icon: '🧰',
    title: '常用的 App',
    en: 'Everyday Apps',
    desc: '傳訊息、開會、搜尋和寫報告',
    color: '#e67700',
    slides: [
      {
        title: '傳訊息和寫信',
        text: `${t('即時通訊', 'messenger')} App 像面對面聊天，對方馬上看到、馬上回。${t('電子郵件', 'email')}像寫信，適合比較正式、比較長的內容。`,
        widget: 'choice',
        params: {
          question: '想問同學「明天要帶直笛嗎？」，用哪一種最快？',
          options: [
            { text: '💬 即時通訊 messenger', correct: true },
            { text: '📧 電子郵件 email' },
            { text: '📮 寄一封紙本信' },
          ],
          explain: '即時通訊適合短短的、要馬上知道答案的問題。',
        },
      },
      {
        title: '視訊會議',
        text: `${t('視訊會議', 'video meeting')}讓大家在不同地方，也能看著對方說話。它要用到好幾個裝置一起合作。把需要的東西拖到左邊！`,
        widget: 'sort',
        params: {
          rest: 'no',
          bins: [
            { id: 'need', icon: '✅', label: '視訊會議需要' },
            { id: 'no', icon: '❌', label: '用不到' },
          ],
          items: [
            { icon: '📷', label: '相機', en: 'camera', bin: 'need' },
            { icon: '🎙️', label: '麥克風', en: 'microphone', bin: 'need' },
            { icon: '📶', label: '網路', en: 'Internet', bin: 'need' },
            { icon: '🔊', label: '喇叭或耳機', en: 'speaker', bin: 'need' },
            { icon: '🖨️', label: '印表機', en: 'printer', bin: 'no' },
            { icon: USB, label: '隨身碟', en: 'USB drive', bin: 'no' },
          ],
        },
      },
      {
        title: '社群網站',
        text: `在${t('社群網站', 'social media')}上，大家可以${t('發文', 'post')}、看別人的照片、按讚和${t('分享', 'share')}。一張照片可以傳得又快又遠。依順序點一點，看看它怎麼傳出去。`,
        widget: 'order',
        params: {
          items: [
            { icon: '🤳', label: '你貼了一張照片' },
            { icon: '👫', label: '你的朋友看到了' },
            { icon: '🔁', label: '朋友按了分享' },
            { icon: '🌍', label: '很多不認識的人也看到了' },
          ],
        },
      },
      {
        title: '搜尋引擎怎麼找到答案？',
        text: `${t('搜尋引擎', 'search engine')}有很多小機器人，每天去讀全世界的${t('網頁', 'web page')}，做成一本超大的${t('索引', 'index')}。你輸入${t('關鍵字', 'keywords')}，它就從索引裡找出最相關的網頁。`,
        widget: 'choice',
        params: {
          question: '想知道「動物園幾點開門」，哪一組關鍵字最好？',
          options: [
            { text: '🔍 動物園 開放時間', correct: true },
            { text: '🔍 我想去玩' },
            { text: '🔍 動物' },
          ],
          explain: '關鍵字要短，而且要包含最重要的詞，搜尋引擎才找得準。',
        },
      },
      {
        title: '文書軟體三兄弟',
        text: `${t('文書處理', 'word processor')}用來打字、寫報告；${t('試算表', 'spreadsheet')}用表格算數字；${t('簡報', 'presentation')}用一頁一頁的投影片上台報告。幫每件工作找對的軟體！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'doc', icon: '📄', label: '文書處理', en: 'word processor' },
            { id: 'sheet', icon: '📊', label: '試算表', en: 'spreadsheet' },
            { id: 'slide', icon: '📽️', label: '簡報', en: 'presentation' },
          ],
          items: [
            { icon: '✏️', label: '打一篇作文', bin: 'doc' },
            { icon: '💌', label: '寫一張邀請卡', bin: 'doc' },
            { icon: '💰', label: '記錄零用錢花多少', bin: 'sheet' },
            { icon: '📈', label: '統計全班最愛的水果', bin: 'sheet' },
            { icon: '🎤', label: '上台介紹我的寵物', bin: 'slide' },
            { icon: '🦕', label: '做恐龍報告給全班看', bin: 'slide' },
          ],
        },
      },
    ],
  },

  {
    id: 'handy',
    part: 'basic',
    icon: '🧭',
    title: '實用小技巧',
    en: 'Handy Skills',
    desc: '截圖、QR Code、備份和尋找裝置',
    color: '#c2255c',
    slides: [
      {
        title: '截圖',
        text: `把螢幕上看到的畫面存成一張照片，叫做${t('截圖', 'screenshot')}。沒有主畫面按鈕的 iPad，要同時按「頂端按鈕」和「調高音量」。試試看！`,
        widget: 'screenshot',
      },
      {
        title: 'QR Code',
        text: `${t('QR Code', 'QR code')}是方方的黑白格子，裡面藏著一個網址或文字。打開相機對著它，就能讀出來。但是打開前，要先看清楚網址！`,
        widget: 'qr',
      },
      {
        title: '備份',
        text: `${t('備份', 'backup')}就是把重要的東西多存一份在別的地方。平板壞了或換新的，就能從備份把東西搬回來。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '☁️', label: '舊平板備份到雲端' },
            { icon: '📲', label: '新平板登入同一個帳號' },
            { icon: '↩️', label: '選「從備份回復」' },
            { icon: '🎉', label: '照片和 App 都回來了' },
          ],
        },
      },
      {
        title: '平板不見了怎麼辦？',
        text: `用另一台裝置打開「${t('尋找', 'Find My')}」，可以在地圖上看到它在哪裡、讓它發出聲音，或打開${t('遺失模式', 'Lost Mode')}把它鎖起來。`,
        widget: 'findmy',
      },
    ],
  },

  {
    id: 'maps',
    part: 'basic',
    icon: '🗺️',
    title: '地圖和導航',
    en: 'Maps and Navigation',
    desc: '找地方、選路線、跟著導航走、分享位置',
    color: '#1971c2',
    added: '2026-10-19',
    slides: [
      {
        title: '用地圖 App 找路',
        text: `手機用 GPS 知道你在哪。${t('地圖 App', 'maps app')}可以找地方、看${t('路線', 'route')}，還會一步一步告訴你怎麼走，這叫${t('導航', 'navigation')}。去圖書館看看！`,
        widget: 'mapnav',
      },
      {
        title: '位置要給誰看？',
        text: `地圖 App 可以把你在哪裡${t('分享位置', 'share location')}給別人。家人知道你在哪，比較安心；陌生人知道，就危險了。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👨‍👩‍👧', label: '可以分享' },
            { id: 'no', icon: '🙅', label: '不要分享' },
          ],
          items: [
            { icon: '👩', label: '媽媽', bin: 'ok' },
            { icon: '👴', label: '來接你放學的阿公', bin: 'ok' },
            { icon: '👨‍👩‍👧', label: '一起出門的家人', bin: 'ok' },
            { icon: '🎮', label: '遊戲裡認識的網友', bin: 'no' },
            { icon: '📸', label: '公開貼文打卡「我在家」', bin: 'no' },
            { icon: '❓', label: '不認識的人問「你在哪」', bin: 'no' },
          ],
        },
      },
      {
        title: '網友要你的位置？',
        text: '網路上的人，不一定是他說的那個人。位置、學校、家裡地址，都不要給網友。',
        widget: 'choice',
        params: {
          question: '遊戲裡的網友說：「我們住很近耶！分享你的位置給我，我拿禮物給你。」你可以怎麼做？',
          options: [
            { text: '🙅 不分享，告訴爸媽', correct: true },
            { text: '📍 分享一下下，拿到禮物就關掉' },
            { text: '🏫 不給位置，改說學校的名字' },
          ],
          explain: '說要送禮物，是壞人常用的方法。告訴大人，一起把他封鎖。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '要去公園：走路要 12 分鐘；坐公車只要 4 分鐘，可是下一班公車 15 分鐘後才來。哪一個比較快到？',
          options: [
            { text: '🚶 走路，12 分鐘就到', correct: true },
            { text: '🚌 坐公車，4 分鐘就到' },
            { text: '🤝 一樣快' },
          ],
          explain: '坐公車要加上等車的時間：15 + 4 = 19 分鐘。地圖 App 也會把等車的時間算進去。',
        },
      },
    ],
  },

  {
    id: 'pay',
    part: 'basic',
    icon: '💳',
    title: '行動支付',
    en: 'Mobile Payment',
    desc: '感應付款、付款碼、付錢前看清楚',
    color: '#b45309',
    added: '2026-10-19',
    slides: [
      {
        title: '嗶一下就付錢',
        text: `悠遊卡和手機裡，都有很小的天線。靠近感應機，就能傳資料付錢，這叫${t('近場通訊', 'NFC')}。離太遠就感應不到。試試看！`,
        widget: 'nfctap',
      },
      {
        title: '付款碼就像錢',
        text: `也可以掃碼付錢：你掃店家的 QR Code，或讓店員掃你手機上的${t('付款碼', 'payment code')}。付款碼就像錢包，只給收銀機掃。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '可以' },
            { id: 'no', icon: '🙅', label: '不可以' },
          ],
          items: [
            { icon: '🏪', label: '結帳時，讓店員掃付款碼', bin: 'ok' },
            { icon: '🔍', label: '付錢前，看清楚金額', bin: 'ok' },
            { icon: '🙋', label: '要用手機付錢，先問爸媽', bin: 'ok' },
            { icon: '📸', label: '把付款碼截圖，傳給網友', bin: 'no' },
            { icon: '🔑', label: '把付款密碼告訴同學', bin: 'no' },
            { icon: '🎁', label: '掃陌生人給的 QR Code 領獎金', bin: 'no' },
          ],
        },
      },
      {
        title: '付錢以前，看清楚',
        text: '按下「確認付款」以前，看三件事：是付款還是收錢？付給誰？多少錢？有一個不對，就按「取消」。試試看！',
        widget: 'paycheck',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '悠遊卡裡面沒有電池，為什麼還能「嗶」？',
          options: [
            { text: '🧲 感應機用電磁感應，把電送給卡片', correct: true },
            { text: '☀️ 卡片裡有太陽能板' },
            { text: '🔋 卡片晚上會自己充電' },
          ],
          explain: '和無線充電一樣，線圈靠近才接得到電，所以卡片要靠得很近才會「嗶」。',
        },
      },
    ],
  },

  {
    id: 'aichat',
    part: 'basic',
    icon: '🤖',
    title: 'AI 聊天機器人',
    en: 'Chatting with AI',
    desc: '會說話，但不一定都對',
    color: '#0ca678',
    slides: [
      {
        title: '和 AI 聊天',
        text: `${t('AI 聊天機器人', 'AI chatbot')}讀過非常非常多文字，會照著你的問題「接下去說」。它很會說話，可是不一定都對，有時候會很有自信地說錯。問問看，找出它說錯的地方！`,
        widget: 'chatbot',
      },
      {
        title: 'AI 的好用法',
        text: 'AI 可以是很好的幫手，但要用對方法。分分看！',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好用法' },
            { id: 'no', icon: '🙅', label: '不要這樣用' },
          ],
          items: [
            { icon: '💡', label: '請它幫忙想點子', bin: 'ok' },
            { icon: '📖', label: '請它解釋看不懂的詞', bin: 'ok' },
            { icon: '🔍', label: '重要的事再查一次', bin: 'ok' },
            { icon: '📝', label: '叫它寫好作業，直接交出去', bin: 'no' },
            { icon: '🏠', label: '告訴它家裡地址和密碼', bin: 'no' },
            { icon: '💯', label: '它說的每一句都相信', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: 'AI 給了一個你不確定的答案，最好怎麼做？',
          options: [
            { text: '🔍 查查課本或可靠的網站，或問大人', correct: true },
            { text: '💯 AI 很聰明，直接相信' },
            { text: '😡 罵它' },
          ],
          explain: 'AI 是從很多文字學會說話的，裡面也有錯的東西。重要的答案要自己查證。',
        },
      },
    ],
  },

  {
    id: 'voice',
    part: 'basic',
    icon: '🎙️',
    title: '語音助理',
    en: 'Voice Assistants',
    desc: '說清楚的指令、喚醒詞、好用和要小心',
    color: '#7048e8',
    added: '2026-10-19',
    slides: [
      {
        title: '嘿 Siri！',
        text: `對著裝置說話，它就幫你做事，這叫${t('語音助理', 'voice assistant')}，像 iPhone 和 iPad 的 Siri。話要說清楚：要做什麼、什麼時候。試試看！`,
        widget: 'voicecmd',
      },
      {
        title: '它一直在聽嗎？',
        text: `語音助理一直在等一個${t('喚醒詞', 'wake word')}，像「嘿 Siri」。聽到以前，它不會把聲音送出去；聽到以後，才去理解你說的話，常常要傳到網路上。`,
        widget: 'choice',
        params: {
          question: '客廳的智慧音箱突然亮起來，說「我在聽」，可是沒有人叫它。最可能發生了什麼？',
          options: [
            { text: '📺 電視裡有人說了很像喚醒詞的話', correct: true },
            { text: '👻 家裡有看不見的人' },
            { text: '🔋 它快沒電了' },
          ],
          explain: '聲音很像喚醒詞，它就可能被叫醒。不想讓它聽的時候，可以在設定裡把「嘿 Siri」關掉。',
        },
      },
      {
        title: '語音助理的好用法',
        text: '手在忙、看不清楚小字的時候，用說的最方便。可是它也會聽錯，你說的話也會傳到網路上。分分看！',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好用' },
            { id: 'care', icon: '⚠️', label: '要小心' },
          ],
          items: [
            { icon: '⏱️', label: '煮東西時設計時器', bin: 'ok' },
            { icon: '📞', label: '手不方便時打給家人', bin: 'ok' },
            { icon: '☔', label: '出門前問天氣', bin: 'ok' },
            { icon: '🎵', label: '請它播音樂', bin: 'ok' },
            { icon: '🔑', label: '大聲說出密碼', bin: 'care' },
            { icon: '🛒', label: '叫它幫你買東西', bin: 'care' },
            { icon: '🤔', label: '它說什麼都相信', bin: 'care' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '阿嬤看不清楚手機上的小字，想打電話給兒子。最快的方法是？',
          options: [
            { text: '🗣️ 說「嘿 Siri，打電話給兒子」', correct: true },
            { text: '🔍 把手機拿遠一點，慢慢找' },
            { text: '⏳ 等兒子打來' },
          ],
          explain: '不用找、不用點，說一句話就能打電話。手機裡的聯絡人要先存好「兒子」這個名字。',
        },
      },
    ],
  },

  {
    id: 'ailabel',
    part: 'basic',
    icon: '🏷️',
    title: 'AI 生成內容的標示',
    en: 'Labels on AI Content',
    desc: '找 AI 標示、自己做的要標示、作業和 AI',
    color: '#9c36b5',
    added: '2026-10-19',
    slides: [
      {
        title: '找找 AI 標示',
        text: `有些 App 會在 AI 做的圖片、影片旁邊寫「AI 生成」，這叫${t('AI 標示', 'AI label')}。標示可能在圖上、名字下面，或在文字裡。找找看！`,
        widget: 'aifeed',
      },
      {
        title: '自己做的，也要標示',
        text: '用 AI 做了圖或影片要分享時，老實說是 AI 做的，別人才不會當真。很多 App 分享時有「AI 標示」的開關。發一則貼文看看！',
        widget: 'aipost',
      },
      {
        title: '作業可以用 AI 嗎？',
        text: `作業是要讓你自己練習。用 AI 寫，卻說是自己寫的，就是${t('抄襲', 'plagiarism')}。`,
        widget: 'choice',
        params: {
          question: '老師出了作文作業，你想用 AI 幫忙。怎麼做最好？',
          options: [
            { text: '🙋 先問老師可不可以用；用了，就老實說哪裡是 AI 寫的', correct: true },
            { text: '📋 請 AI 寫好，直接交，老師看不出來' },
            { text: '✏️ 把 AI 的句子改幾個字，就說是自己寫的' },
          ],
          explain: '有的老師允許用 AI 找點子，有的不行。先問清楚，用了就說，這樣最誠實。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '一張很驚人的照片，旁邊沒有「AI 生成」的標示。它一定是真的嗎？',
          options: [
            { text: '🔍 不一定，有些人不標示，還是要查來源', correct: true },
            { text: '✅ 一定是真的，沒標示就是真的' },
            { text: '❌ 一定是假的' },
          ],
          explain: '標示要靠做的人或 App 加上去，有人會忘記，也有人故意不寫。看不出來時，就查是誰發的。',
        },
      },
    ],
  },

  {
    id: 'copyright',
    part: 'basic',
    icon: '©️',
    title: '網路上的著作權',
    en: 'Copyright Online',
    desc: '別人的作品、創用 CC、分享連結',
    color: '#2f6fdf',
    added: '2026-10-19',
    slides: [
      {
        title: '這是誰做的？',
        text: `照片、圖畫、音樂、影片和文章，都是作者的心血，作者有${t('著作權', 'copyright')}。用別人的作品以前，要先看可不可以用。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ask',
          bins: [
            { id: 'mine', icon: '✅', label: '可以直接用' },
            { id: 'ask', icon: '✋', label: '要先問作者' },
          ],
          items: [
            { icon: '📷', label: '自己拍的照片', bin: 'mine' },
            { icon: '🖍️', label: '自己畫的圖', bin: 'mine' },
            { icon: '📖', label: '自己寫的故事', bin: 'mine' },
            { icon: '🖼️', label: '網路上找到的漂亮照片', bin: 'ask' },
            { icon: '🎵', label: '流行歌當影片的配樂', bin: 'ask' },
            { icon: '🧸', label: '把卡通人物印在要賣的貼紙上', bin: 'ask' },
            { icon: '🎨', label: '好朋友畫的圖', bin: 'ask' },
          ],
        },
      },
      {
        title: '找可以用的圖',
        text: `有些作者願意分享，會標上${t('創用 CC', 'Creative Commons')}，照規定就能用，通常要寫出作者。${t('公有領域', 'public domain')}的作品，大家都能自由用。幫報告找 2 張圖！`,
        widget: 'credit',
      },
      {
        title: '喜歡，就分享連結',
        text: '把別人的影片下載下來，再上傳到自己的頻道，就是拿走作者的作品。想分享，就分享原本的連結。',
        widget: 'choice',
        params: {
          question: '你很喜歡一部卡通，想讓同學也看到。怎麼做才對？',
          options: [
            { text: '🔗 分享官方影片的連結', correct: true },
            { text: '⬇️ 下載下來，上傳到自己的頻道' },
            { text: '📹 錄下螢幕，再上傳' },
          ],
          explain: '分享連結，作者看得到有多少人喜歡，也能繼續做新的卡通。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '報告用了一張「創用 CC 姓名標示」的照片，要寫上什麼？',
          options: [
            { text: '✍️ 作者的名字，和它的授權', correct: true },
            { text: '🙅 什麼都不用寫' },
            { text: '🌐 只寫「圖片來自網路」' },
          ],
          explain: '「姓名標示」就是要寫出作者是誰。只寫「網路」，別人找不到作者。',
        },
      },
    ],
  },

  {
    id: 'shareddoc',
    part: 'basic',
    icon: '📝',
    title: '共用文件和雲端硬碟',
    en: 'Shared Documents',
    desc: '一起寫一份文件、分享權限、版本記錄',
    color: '#0b7285',
    added: '2026-10-19',
    slides: [
      {
        title: '一起寫同一份文件',
        text: `寫小組報告，可以用${t('共用文件', 'shared document')}，像 Google 文件。文件存在${t('雲端硬碟', 'cloud drive')}裡，大家同時打字，都看得到別人寫的。試試看！`,
        widget: 'coedit',
      },
      {
        title: '分享連結的權限',
        text: `分享文件時，可以選每個人的${t('權限', 'permission')}：只能看、可以留言，或可以改。給剛好夠用的就好。選選看！`,
        widget: 'shareperm',
      },
      {
        title: '改錯了也不怕',
        text: `共用文件會自動存檔，還有${t('版本記錄', 'version history')}，記住每一次是誰改了什麼。不小心刪掉，也能把舊版本找回來。試試看！`,
        widget: 'versions',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '小美改了共用文件裡的報告。你要怎麼看到最新的？',
          options: [
            { text: '🔗 打開同一個連結，就是最新的', correct: true },
            { text: '📧 請她把檔案寄給你' },
            { text: '🖨️ 等她印出來給你' },
          ],
          explain: '大家改的是雲端上的同一份文件，所以打開就是最新的，不用傳來傳去。',
        },
      },
    ],
  },

  {
    id: 'photoshare',
    part: 'basic',
    icon: '📸',
    title: '分享照片之前',
    en: 'Before You Share a Photo',
    desc: '照片裡的線索、位置資訊、傳出去就收不回來',
    color: '#7048e8',
    added: '2026-10-19',
    slides: [
      {
        title: '照片裡的小線索',
        text: '分享照片以前，先看看背景。名牌、門牌、站牌，都會告訴別人你是誰、住在哪裡。找找看！',
        widget: 'photoclue',
      },
      {
        title: '照片藏著位置',
        text: `手機拍照時，常會把拍照地點的${t('位置資訊', 'location data')}，一起存進照片。傳給別人以前，可以在「選項」把位置關掉。試試看！`,
        widget: 'photoloc',
      },
      {
        title: '傳出去，就收不回來',
        text: '照片傳出去，別人可以存下來、再轉傳，就收不回來了。有些照片，分享前要先想一想。分分看！',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '可以分享' },
            { id: 'stop', icon: '✋', label: '先想一想' },
          ],
          items: [
            { icon: '🌅', label: '海邊的風景', bin: 'ok' },
            { icon: '🖍️', label: '自己畫的圖', bin: 'ok' },
            { icon: '🐶', label: '家裡的小狗', bin: 'ok' },
            { icon: '🎫', label: '機票和登機證', bin: 'stop' },
            { icon: '🪪', label: '健保卡和身分證', bin: 'stop' },
            { icon: '🙈', label: '朋友出糗的照片', bin: 'stop' },
            { icon: '🏫', label: '穿制服站在校門口', bin: 'stop' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你想把和好朋友的合照，貼到網路上。要先做什麼？',
          options: [
            { text: '🙋 先問朋友可不可以', correct: true },
            { text: '📤 直接貼，反正是合照' },
            { text: '🤐 先貼，以後再跟他說' },
          ],
          explain: '照片裡有朋友，也是他的隱私。先問一聲，他說可以再分享。',
        },
      },
    ],
  },

  {
    id: 'safety',
    part: 'basic',
    icon: '🛡️',
    title: '上網安全',
    en: 'Staying Safe Online',
    desc: '詐騙、驗證碼、病毒和個人資料',
    color: '#e8590c',
    slides: [
      {
        title: '這是詐騙嗎？',
        text: `${t('詐騙', 'scam')}的人會假裝成銀行、客服、遊戲公司，甚至假裝成家人。他們常說「很急」、「中獎了」、「點這個連結」。看看每一則訊息，正常還是可疑？`,
        widget: 'inbox',
        params: {
          messages: [
            { from: '💬 媽媽', text: '晚餐吃咖哩喔，六點回家。', scam: false, why: '熟悉的人、平常的內容，沒有要你點連結或給東西。' },
            { from: '📩 不認識的號碼', text: '恭喜你抽中 iPhone！快點連結填資料領獎 ipone-gift.top', scam: true, why: '中獎、奇怪的網址（iPhone 拼錯了）、要你填資料：典型的詐騙。' },
            { from: '📩 「銀行客服」', text: '您的帳戶異常，請在 30 分鐘內點連結登入，否則將被凍結。', scam: true, why: '一直催你「很急」，又要你點連結登入。真的銀行不會這樣做。' },
            { from: '📩 「爸爸」新號碼', text: '我換新號碼了。先幫我買兩張遊戲點數，拍照傳給我。', scam: true, why: '換新號碼又要你買點數，是冒充家人的詐騙。先打原本的電話問爸爸。' },
            { from: '🏫 學校通知', text: '明天戶外教學，記得帶水壺和帽子。', scam: false, why: '平常的通知，沒有要錢、要密碼或要你點奇怪的連結。' },
            { from: '🎮 「遊戲官方」', text: '送你 1000 顆免費鑽石，請回覆你的帳號和密碼。', scam: true, why: '官方不會跟你要密碼。給了密碼，帳號就會被偷走。' },
          ],
        },
      },
      {
        title: '網頁上的陷阱',
        text: `上網時也有陷阱：搜尋結果最上面的假廣告、突然跳出來的${t('彈出式視窗', 'pop-up')}、假的病毒警告，還有${t('網路釣魚', 'phishing')}：做一個跟真的很像的假網站，騙你輸入帳號、密碼或信用卡。一個一個看，正常還是可疑？`,
        widget: 'webtrap',
      },
      {
        title: '驗證碼不能給別人',
        text: "<b class=\"term\">簡訊驗證碼<span class=\"en\" lang=\"en\">SMS OTP</span></b>就像大門的單次鑰匙。壞人常假裝「不小心傳錯了」向你要數字。千萬別交出去！",
        widget: 'otpdefense',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '雙重驗證',
        text: `${t('雙重驗證', 'two-factor authentication')}就是登入時除了密碼，還要再用手機確認一次。就算密碼被偷了，沒有你的手機也進不來。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '🔑', label: '輸入帳號和密碼' },
            { icon: '📱', label: '手機收到驗證碼或通知' },
            { icon: '✅', label: '輸入驗證碼或按「允許」' },
            { icon: '🔓', label: '登入成功' },
          ],
        },
      },
      {
        title: '病毒和惡意程式',
        text: `${t('惡意程式', 'malware')}，像是${t('電腦病毒', 'computer virus')}，會偷資料，或把檔案鎖起來跟你要錢。病毒也會躲在${t('隨身碟', 'USB drive')}裡，一插進電腦就跑進去。分分看，哪些做法比較安全？`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '✅', label: '比較安全' },
            { id: 'no', icon: '⚠️', label: '很危險' },
          ],
          items: [
            { icon: '🔄', label: '系統有更新就更新', bin: 'ok' },
            { icon: '🅰️', label: '只從 App Store 下載', bin: 'ok' },
            { icon: '🙋', label: '不確定時先問大人', bin: 'ok' },
            { icon: '📎', label: '打開陌生人寄來的附件', bin: 'no' },
            { icon: '🆓', label: '從奇怪網站下載「免費」遊戲', bin: 'no' },
            { icon: '🚨', label: '點「你的手機中毒了！按這裡」', bin: 'no' },
            { icon: USB, label: '把撿到的隨身碟插進電腦', bin: 'no' },
          ],
        },
      },
      {
        title: '個人資料要保護',
        text: `${t('個人資料', 'personal information')}可以用來找到你，或假裝成你，不要隨便放上網路或告訴陌生人。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '🙂', label: '可以分享' },
            { id: 'no', icon: '🔒', label: '要保密' },
          ],
          items: [
            { icon: '🎨', label: '最喜歡的顏色', bin: 'ok' },
            { icon: '🐼', label: '最喜歡的動物', bin: 'ok' },
            { icon: '🏠', label: '家裡地址', bin: 'no' },
            { icon: '🏫', label: '學校和班級', bin: 'no' },
            { icon: '🪪', label: '身分證字號', bin: 'no' },
            { icon: '🔑', label: '密碼', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '收到一則讓你覺得怪怪的訊息，最好怎麼做？',
          options: [
            { text: '📸 不回覆、不點連結，截圖給大人看', correct: true },
            { text: '🔗 先點連結看看是什麼' },
            { text: '🤫 自己處理，不要讓大人知道' },
          ],
          explain: '覺得怪怪的，就先停下來。在台灣，也可以打 165 反詐騙專線問問看。',
        },
      },
    ],
  },

  {
    id: 'wifishop',
    part: 'basic',
    icon: '🛒',
    title: '公共 Wi-Fi 和網購',
    en: 'Public Wi-Fi and Shopping',
    desc: '選對的 Wi-Fi、認出假商店、付錢要小心',
    color: '#2b8a3e',
    added: '2026-10-19',
    slides: [
      {
        title: '哪個 Wi-Fi 可以連？',
        text: `圖書館、車站、餐廳的免費 Wi-Fi 叫${t('公共 Wi-Fi', 'public Wi-Fi')}。名字很像的、沒有密碼又寫「免費」的，可能是壞人開的。連店家貼出來的那一個！`,
        widget: 'wifipick',
      },
      {
        title: '公共 Wi-Fi 上做什麼？',
        text: "咖啡廳的公共開放 Wi-Fi 就像在廣場講話，任何人都能竊聽。<b class=\"term\">HTTPS 加密<span class=\"en\" lang=\"en\">HTTPS Encryption</span></b>會把資料鎖在保險箱裡！",
        widget: 'packetsniff',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '這家網路商店可信嗎？',
        text: `在網路上買東西叫${t('網購', 'online shopping')}。有些假商店只想騙錢：便宜得不像話、一直催你、只能轉帳。找找看！`,
        widget: 'shopcheck',
      },
      {
        title: '遊戲裡的錢是真的錢',
        text: "遊戲裡的寶石與金幣都是用家裡的真實新台幣買的。打開<b class=\"term\">購買前詢問<span class=\"en\" lang=\"en\">Ask to Buy</span></b>，保護荷包不亂花！",
        widget: 'realwallet',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '在購物網站上買東西，賣家說：「加我 LINE，私下用 ATM 轉帳，可以便宜 500 元。」怎麼辦？',
          options: [
            { text: '🙅 不要，留在購物網站裡付款', correct: true },
            { text: '👍 好啊，便宜就好' },
            { text: '💰 先轉一半的錢試試看' },
          ],
          explain: '離開購物網站私下轉帳，被騙了網站也幫不了你。覺得怪怪的，打 165 反詐騙專線問問看。',
        },
      },
    ],
  },

  {
    id: 'hacked',
    part: 'basic',
    icon: '🚨',
    title: '被駭了怎麼辦？',
    en: 'Hacked: What to Do',
    desc: '帳號被盜的徵兆、救回帳號、勒索軟體和備份、撿到的隨身碟',
    color: '#1e6091',
    added: '2026-10-23',
    slides: [
      {
        title: '帳號被盜的徵兆',
        text: `${t('帳號被盜', 'account takeover')}就是別人偷到你的密碼，用你的帳號做事。這時會出現一些怪事。分分看，哪些是被盜的${t('徵兆', 'warning sign')}？`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'warn', icon: '⚠️', label: '可能被盜了' },
            { id: 'ok', icon: '😌', label: '平常的事' },
          ],
          items: [
            { icon: '📍', label: '通知說「新的地方登入」，可是不是你', bin: 'warn' },
            { icon: '🔑', label: '密碼突然不能用了', bin: 'warn' },
            { icon: '💬', label: '朋友說收到你傳的怪連結', bin: 'warn' },
            { icon: '🛒', label: '帳號裡多了你沒買的東西', bin: 'warn' },
            { icon: '📱', label: '你自己登入新 iPad，收到通知', bin: 'ok' },
            { icon: '🔄', label: 'App 提醒你更新', bin: 'ok' },
            { icon: '🖼️', label: '朋友在照片裡標記你', bin: 'ok' },
          ],
        },
      },
      {
        title: '救回帳號',
        text: "發現帳號有陌生人登入？改密碼、<b class=\"term\">登出所有裝置<span class=\"en\" lang=\"en\">Sign out everywhere</span></b>，再加上<b class=\"term\">雙重驗證<span class=\"en\" lang=\"en\">2FA</span></b>！",
        widget: 'kickhacker',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '檔案被鎖住了',
        text: `${t('勒索軟體', 'ransomware')}會把檔案鎖起來，再跟你要錢，才給解開的「鑰匙」。看到這個畫面，該怎麼辦？選選看！`,
        widget: 'hkransom',
      },
      {
        title: '撿到的隨身碟',
        text: `在走廊撿到一個${t('隨身碟', 'USB drive')}，上面寫著「全班合照」，好想看看喔！可是陌生的隨身碟可能藏著${t('惡意程式', 'malware')}。你會怎麼做？`,
        widget: 'hkusb',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '朋友問你：「你昨天幹嘛傳奇怪的連結給我？」可是你沒有傳。最先該做什麼？',
          options: [
            { text: '🙋 告訴大人，用自己的另一台裝置改密碼', correct: true },
            { text: '🤷 不理它，過幾天就好了' },
            { text: '🔗 點那個連結，看看是什麼' },
          ],
          explain: '這是帳號可能被盜的徵兆。先告訴大人，改密碼、登出所有裝置、打開雙重驗證，再請朋友不要點那個連結。',
        },
      },
    ],
  },

  {
    id: 'fakes',
    part: 'basic',
    icon: '🕵️',
    title: '假訊息和 AI 假圖',
    en: 'Fake News & AI Fakes',
    desc: '看來源、看日期，找出假圖和假聲音',
    color: '#5f3dc4',
    added: '2026-10-19',
    slides: [
      {
        title: '網路上的消息，不一定是真的',
        text: `${t('假訊息', 'misinformation')}常常寫得很嚇人，要你「快轉傳」。先看${t('來源', 'source')}：是誰說的、什麼時候說的，再決定信不信。看看每一則，可信還是可疑？`,
        widget: 'inbox',
        params: {
          labels: ['👍 可信', '🚩 可疑'],
          messages: [
            { from: '📲 群組轉傳', text: '<mark>轉傳給所有人！</mark>每天喝檸檬水，<mark>可以殺死癌細胞</mark>，醫生都不說！', scam: true, why: '不知道是誰寫的，又說得太神奇。要你「轉傳給所有人」，是假訊息常見的樣子。' },
            { from: '🌦️ 中央氣象署 官方網站', text: '明天白天高溫 33 度，出門記得多喝水、注意防曬。', scam: false, why: '來源是負責天氣的單位，內容平常，沒有要你轉傳。' },
            { from: '📲 群組轉傳', text: '緊急通知：LINE 明天開始收費！<mark>轉傳給 10 個人就可以免費</mark>。', scam: true, why: '這是流傳很多年的假消息。轉傳幾個人就免費，根本不合理。' },
            { from: '📲 群組轉傳的截圖', text: '<mark>2019 年 8 月 9 日</mark>：颱風要來了，明天全台停班停課！', scam: true, why: '看日期，這是很多年前的舊消息，不是明天。舊新聞常被拿出來再傳一次。' },
            { from: '📚 市立圖書館 官方網站', text: '這個星期六下午 2 點，兒童室有說故事時間，歡迎參加。', scam: false, why: '來源清楚，日期和地點都寫得很明白，是一般的活動通知。' },
          ],
        },
      },
      {
        title: 'AI 也會做假圖',
        text: `現在 AI 能做出看起來很真的照片，叫 ${t('AI 生成圖', 'AI-generated image')}。以前的 AI 圖常有破綻，像手指數目不對、字歪七扭八。點點看，這張圖哪裡怪怪的？`,
        widget: 'spotfake',
      },
      {
        title: '聲音和影片也能假造',
        text: "現在 AI 能學會親人的聲音打電話假冒。遇到緊急要錢或接送，記得問<b class=\"term\">通關密語<span class=\"en\" lang=\"en\">Secret Passcode</span></b>並掛斷回撥！",
        widget: 'voiceclone',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '看起來像卡通，其實不是',
        text: `有些影片用小朋友喜歡的卡通人物，內容卻很奇怪、很可怕，國外叫${t('艾莎門', 'Elsagate')}。它們故意做得像卡通，好騙到更多人點。看看每一支，可以看還是不對勁？`,
        widget: 'vidcheck',
        params: {
          videos: [
            { thumb: '🔭', hue: 210, time: '6:12', title: '為什麼天空是藍色的？', channel: '小小科學家 ✔︎ 官方', why: '官方頻道，標題清楚，內容是一般的知識。' },
            { thumb: '👸😭💉', hue: 330, time: '11:59', bad: true, title: '<mark>公主 超人 打針 哭哭 寶寶 學顏色 驚喜蛋 搞笑</mark>', channel: '<mark>Kids Fun TV 8823</mark>', why: '標題是一堆關鍵字亂排，卡通人物在做奇怪、可怕的事，也不是官方頻道。' },
            { thumb: '🐷🧺', hue: 100, time: '5:03', title: '小豬一家去野餐｜第 12 集', channel: '小豬一家 ✔︎ 官方', why: '官方頻道，有集數，標題和內容都很普通。' },
            { thumb: '🐷😱', hue: 10, time: '9:47', bad: true, title: '小豬生病了好可怕！！<mark>你一定要看到最後</mark>', channel: '<mark>Cartoon Fun 4K</mark>', why: '熟悉的卡通，卻不是官方頻道。縮圖很嚇人，還要你「一定要看到最後」。' },
            { thumb: '🎵🔤', hue: 50, time: '3:20', title: '跟著唱：ㄅㄆㄇ兒歌', channel: '兒歌小天地 ✔︎ 官方', why: '官方頻道，就是一首普通的兒歌。' },
          ],
        },
      },
      {
        title: '看到怪怪的影片怎麼辦？',
        text: '不舒服的影片，不用看完。關掉不是你的錯，也不會被罵。告訴大人，還可以一起設定，讓這種影片少出現。',
        widget: 'choice',
        params: {
          question: '你在看卡通，自動播放接到下一支：同樣的卡通人物，卻開始做很可怕的事。你可以怎麼做？',
          options: [
            { text: '✋ 馬上關掉，告訴爸媽', correct: true },
            { text: '👀 看到最後，看看會怎樣' },
            { text: '📤 分享給同學，一起看' },
          ],
          explain: '爸媽可以幫你改用兒童版的 App、關掉自動播放，再「檢舉」這支影片，讓平台把它拿掉。',
        },
      },
      {
        title: '轉傳之前，先停一下',
        text: `看到很驚人的消息，先停一下，不要急著轉傳。可以搜尋看看別的新聞有沒有報，或查${t('事實查核', 'fact-check')}網站。分分看，哪些是好習慣？`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不要這樣做' },
          ],
          items: [
            { icon: '🔍', label: '先看是誰說的', bin: 'ok' },
            { icon: '📅', label: '看日期，是不是舊消息', bin: 'ok' },
            { icon: '📰', label: '搜尋看看別的新聞有沒有報', bin: 'ok' },
            { icon: '🙋', label: '不確定時問大人', bin: 'ok' },
            { icon: '😱', label: '標題很嚇人，馬上轉傳', bin: 'no' },
            { icon: '🔁', label: '說「轉傳 10 個人」就照做', bin: 'no' },
            { icon: '👀', label: '只看標題，不看內容', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '群組裡有人傳了一張很驚人的照片，說是昨天發生的。最好怎麼做？',
          options: [
            { text: '🔍 先查來源和日期，不確定就不轉傳', correct: true },
            { text: '🔁 很多人都在傳，應該是真的' },
            { text: '📲 先轉傳給家人，提醒大家' },
          ],
          explain: '很多人傳，不代表是真的。查不到可靠的來源，就先不要轉傳。',
        },
      },
    ],
  },

  {
    id: 'kind',
    part: 'basic',
    icon: '🤝',
    title: '網路禮儀和網路霸凌',
    en: 'Kindness Online',
    desc: '發文前想一想，被欺負時怎麼做',
    color: '#e64980',
    added: '2026-10-19',
    slides: [
      {
        title: '發文之前，先想一想',
        text: `網路上的話和照片，可能被截圖、轉傳，很難收回來。發文前先想：這樣說，會不會讓人難過？這就是${t('網路禮儀', 'netiquette')}。分分看，哪些可以發？`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '可以發' },
            { id: 'no', icon: '✋', label: '先不要' },
          ],
          items: [
            { icon: '🎂', label: '祝同學生日快樂', bin: 'ok' },
            { icon: '🐶', label: '自己家小狗的照片', bin: 'ok' },
            { icon: '👏', label: '稱讚朋友的畫', bin: 'ok' },
            { icon: '🤳', label: '同學跌倒的醜照片', bin: 'no' },
            { icon: '😡', label: '生氣時罵人的話', bin: 'no' },
            { icon: '🤫', label: '朋友偷偷告訴你的祕密', bin: 'no' },
          ],
        },
      },
      {
        title: '被欺負了怎麼辦？',
        text: `在網路上一直取笑、威脅、排擠別人，或亂傳別人的照片，就是${t('網路霸凌', 'cyberbullying')}。被欺負不是你的錯。一步一步，選出最好的做法。`,
        widget: 'chatpick',
        params: {
          name: '💬 阿強',
          messages: ['你很笨耶 😝', '大家都不想跟你玩', '明天不要來學校啦'],
          steps: [
            {
              ask: '有人一直傳難聽的話給你，先怎麼做？',
              options: [
                { text: '✋ 先不要回，停下來', ok: true, act: '✋ 你沒有回嘴' },
                { text: '😡 罵回去', why: '罵回去，對方常常會更兇，事情變得更嚴重。' },
                { text: '🙇 跟他說對不起', why: '不是你的錯，不用道歉。先不要回。' },
              ],
            },
            {
              ask: '接下來呢？',
              options: [
                { text: '📸 截圖，留下證據', ok: true, act: '📸 已截圖' },
                { text: '🗑️ 馬上把訊息全部刪掉', why: '刪掉就沒有證據了。先截圖，再交給大人處理。' },
              ],
            },
            {
              ask: '截好圖了，再來呢？',
              options: [
                { text: '🙋 告訴爸媽或老師', ok: true, act: '🙋 已經告訴媽媽' },
                { text: '🤐 自己忍耐，不讓別人知道', why: '說出來，大人才能幫你。這不是告狀，是保護自己。' },
              ],
            },
            {
              ask: '不想再收到他的訊息，可以怎麼做？',
              options: [
                { text: '🚫 封鎖他，也可以檢舉', ok: true, act: '🚫 已封鎖「阿強」' },
                { text: '📣 找更多朋友一起罵他', why: '一起罵人，也會變成霸凌。封鎖他，讓大人來處理。' },
              ],
            },
          ],
          end: '🎉 做得好！不回嘴、截圖、告訴大人、封鎖。',
        },
      },
      {
        title: '看到別人被欺負',
        text: '霸凌常常發生在群組裡，很多人在旁邊看。不跟著一起笑、一起轉傳，就是在幫忙。也可以私下關心被欺負的人，再告訴大人。',
        widget: 'choice',
        params: {
          question: '班上群組裡，大家都在笑一位同學的照片，還一直按讚。你會怎麼做？',
          options: [
            { text: '🤝 不跟著笑，私下關心他，再告訴老師', correct: true },
            { text: '👍 跟著按讚，大家都這樣' },
            { text: '📤 把照片轉給別班的朋友' },
          ],
          explain: '按讚和轉傳，會讓更多人看到，被欺負的人會更難過。在台灣，也可以打 1953 反霸凌專線。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '朋友傳來一張別人的醜照片，說：「超好笑，快轉給大家！」你會怎麼做？',
          options: [
            { text: '🙅 不轉傳，跟朋友說這樣會讓人難過', correct: true },
            { text: '🤏 只轉給一兩個好朋友就好' },
            { text: '🎨 加上好笑的字再傳出去' },
          ],
          explain: '照片一傳出去，就收不回來了。換成是你的照片，你也不會想被大家笑。',
        },
      },
    ],
  },

  {
    id: 'sos',
    part: 'basic',
    icon: '🆘',
    title: '緊急求救',
    en: 'Emergency Help',
    desc: '119 和 110、鎖住也能打、醫療卡',
    color: '#c92a2a',
    added: '2026-10-19',
    slides: [
      {
        title: '緊急電話',
        text: `遇到危險時，可以打免費的${t('緊急電話', 'emergency number')}。失火、有人受傷或昏倒，打 119；遇到壞人或小偷，打 110 找警察。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'fire', icon: '🚑', label: '119 消防和救護' },
            { id: 'police', icon: '🚓', label: '110 警察' },
          ],
          items: [
            { icon: '🔥', label: '家裡失火了', bin: 'fire' },
            { icon: '😵', label: '有人昏倒叫不醒', bin: 'fire' },
            { icon: '🩹', label: '有人受傷流很多血', bin: 'fire' },
            { icon: '🛗', label: '被困在電梯裡', bin: 'fire' },
            { icon: '🦹', label: '看到小偷闖進鄰居家', bin: 'police' },
            { icon: '👣', label: '有陌生人一直跟著你', bin: 'police' },
          ],
        },
      },
      {
        title: '手機鎖住也能打',
        text: '家人昏倒了，手機卻鎖著，怎麼辦？在輸入密碼的畫面，點左下角的「緊急」，不用密碼也能打緊急電話。試試看撥 119（只是練習）。',
        widget: 'sosphone',
      },
      {
        title: '醫療卡',
        text: `${t('醫療卡', 'Medical ID')}可以寫上過敏、吃的藥和${t('緊急聯絡人', 'emergency contact')}。手機鎖著，救護人員也看得到，能更快幫忙。也因為誰都看得到，祕密不要寫進去。分分看！`,
        widget: 'sort',
        params: {
          rest: 'in',
          bins: [
            { id: 'in', icon: '✱', label: '寫進醫療卡' },
            { id: 'out', icon: '🙅', label: '不要寫' },
          ],
          items: [
            { icon: '🥜', label: '對什麼東西過敏', bin: 'in' },
            { icon: '💊', label: '平常吃的藥', bin: 'in' },
            { icon: '🩸', label: '血型', bin: 'in' },
            { icon: '👩', label: '緊急聯絡人', bin: 'in' },
            { icon: '🔢', label: '手機的密碼', bin: 'out' },
            { icon: '💳', label: '信用卡號碼', bin: 'out' },
            { icon: '🚪', label: '家裡大門的密碼', bin: 'out' },
          ],
        },
      },
      {
        title: '緊急 SOS',
        text: `很多手機有${t('緊急 SOS', 'Emergency SOS')}：iPhone 同時按住側邊按鈕和音量鍵，就會出現求救的滑桿。打完電話，手機還會把你的位置傳給緊急聯絡人。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '🔘', label: '同時按住側邊按鈕和音量鍵' },
            { icon: '🆘', label: '畫面出現「緊急 SOS」滑桿' },
            { icon: '👉', label: '把滑桿往右滑' },
            { icon: '📞', label: '手機打給緊急電話' },
            { icon: '📍', label: '把位置傳給緊急聯絡人' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你和爺爺在公園，爺爺突然昏倒叫不醒，他的手機鎖著。最好怎麼做？',
          options: [
            { text: '📞 用鎖定畫面的「緊急」打 119，也大聲請旁邊的大人幫忙', correct: true },
            { text: '⏳ 先等一下，看爺爺會不會自己醒來' },
            { text: '🔢 先試著猜爺爺的手機密碼' },
          ],
          explain: '有人昏倒要馬上求救。不用密碼也能打 119，電話裡說清楚發生什麼事、在哪裡。',
        },
      },
    ],
  },

  {
    id: 'search',
    part: 'basic',
    icon: '🔍',
    title: '搜尋技巧',
    en: 'Search Smarter',
    desc: '挑關鍵字、分辨廣告、比較來源',
    color: '#1d6fa5',
    added: '2026-10-20',
    slides: [
      {
        title: '挑出關鍵字',
        text: `用${t('搜尋引擎', 'search engine')}，不用打一整句話。只挑最重要的${t('關鍵字', 'keywords')}，找到的結果會更準。試試看！`,
        widget: 'kwpick',
      },
      {
        title: '廣告排在最上面',
        text: `搜尋結果最上面，常常是${t('廣告', 'ad')}，旁邊有小小的${t('贊助', 'sponsored')}兩個字。店家付錢就能排上去，不一定是最好的。找出${t('官方網站', 'official website')}！`,
        widget: 'serp',
      },
      {
        title: '這個來源可靠嗎？',
        text: `找到資料，先看${t('來源', 'source')}：誰寫的？什麼時候寫的？別的地方也這樣說嗎？搜尋頁最上面的 AI 摘要也可能說錯。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '📗', label: '可以參考' },
            { id: 'check', icon: '🔎', label: '要再查一查' },
          ],
          items: [
            { icon: '🏛️', label: '政府網站的公告', bin: 'ok' },
            { icon: '📚', label: '圖書館找到的書', bin: 'ok' },
            { icon: '📰', label: '有記者名字和日期的新聞', bin: 'ok' },
            { icon: '🤫', label: '「醫生不會告訴你的祕密」', bin: 'check' },
            { icon: '❓', label: '沒有作者、沒有日期的文章', bin: 'check' },
            { icon: '🛒', label: '賣東西的網站說自己最好', bin: 'check' },
            { icon: '🤖', label: 'AI 摘要，還沒點開來源', bin: 'check' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '搜尋結果最上面寫著「贊助」，這是什麼意思？',
          options: [
            { text: '🪧 這是廣告，店家付錢排在上面', correct: true },
            { text: '🏆 這是最好、最正確的網站' },
            { text: '✅ 這是政府檢查過的網站' },
          ],
          explain: '「贊助」就是廣告。想找官方資料，要往下看名字和網址。',
        },
      },
    ],
  },

  {
    id: 'footprint',
    part: 'basic',
    icon: '👣',
    title: '數位足跡',
    en: 'Digital Footprint',
    desc: '貼文和照片會留很久、被轉傳和被搜尋',
    color: '#9c4221',
    added: '2026-10-20',
    slides: [
      {
        title: '刪掉了，還在嗎？',
        text: `貼文發出去，別人可能馬上截圖、轉傳，搜尋引擎也會存一份。就算你刪掉，別的地方還在。這些留下來的痕跡，叫做${t('數位足跡', 'digital footprint')}。發一篇試試看！`,
        widget: 'postspread',
      },
      {
        title: '誰看得到？',
        text: `發文前，可以選${t('分享對象', 'audience')}：「公開」是全世界都看得到，「朋友」只給朋友看。很多 App 一開始是「公開」，要自己改。試試看！`,
        widget: 'audience',
      },
      {
        title: '十年後的你',
        text: '數位足跡可能留很多年。以後的新同學、老師、老闆，都可能搜尋到。好的足跡也會留下來喔！分分看，十年後還想讓人看到嗎？',
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '十年後也不怕' },
            { id: 'no', icon: '✋', label: '先不要貼' },
          ],
          items: [
            { icon: '🎨', label: '自己畫的作品', bin: 'ok' },
            { icon: '🙋', label: '幫別人解答問題的留言', bin: 'ok' },
            { icon: '🏅', label: '參加比賽的心得', bin: 'ok' },
            { icon: '😡', label: '生氣時罵老師的話', bin: 'no' },
            { icon: '🧗', label: '挑戰危險動作的影片', bin: 'no' },
            { icon: '🙈', label: '別人出糗的影片', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你發了一張照片，後來把它刪掉了。下面哪一個是對的？',
          options: [
            { text: '📸 別人截圖、轉傳的，還在', correct: true },
            { text: '🧹 刪掉以後，全部都消失了' },
            { text: '⏪ 可以請網路把它收回來' },
          ],
          explain: '刪除只刪掉你自己的那一份。別人存下來的，你刪不掉，所以發布前要先想一想。',
        },
      },
    ],
  },

  {
    id: 'subscribe',
    part: 'basic',
    icon: '🔁',
    title: '訂閱和自動續訂',
    en: 'Subscriptions and Auto-Renewal',
    desc: '免費試用、每月扣款和取消訂閱',
    color: '#a61e4d',
    added: '2026-10-20',
    slides: [
      {
        title: '免費試用的陷阱',
        text: `很多 App 可以${t('免費試用', 'free trial')}，時間到了會${t('自動續訂', 'auto-renewal')}，開始每個月扣錢。不想用了，最晚要在試用結束前一天取消。試試看！`,
        widget: 'trialcal',
      },
      {
        title: '每個月加起來',
        text: `${t('訂閱', 'subscription')}每個月只扣一點點，好幾個加起來就很多。很久沒用的，就取消吧。關關看！`,
        widget: 'subsum',
      },
      {
        title: '怎麼取消訂閱？',
        text: `<b>把 App 刪掉，不會停止扣錢！</b>要到「設定」裡的${t('訂閱項目', 'Subscriptions')}取消。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '⚙️', label: '打開「設定」' },
            { icon: '👤', label: '點最上面你的名字' },
            { icon: '🔁', label: '點「訂閱項目」' },
            { icon: '👆', label: '選要取消的訂閱' },
            { icon: '❌', label: '點「取消訂閱」' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '遊戲寫著「第一個月只要 1 元」，你要怎麼做？',
          options: [
            { text: '🙋 先問大人，看清楚第二個月起要多少錢', correct: true },
            { text: '💳 馬上按下去，反正才 1 元' },
            { text: '🙈 先玩再說，說明不用看' },
          ],
          explain: '「1 元」常常只是第一個月，之後會自動續訂，每個月扣比較多的錢。',
        },
      },
    ],
  },

  {
    id: 'wearable',
    part: 'basic',
    icon: '⌚',
    title: '智慧手錶和穿戴裝置',
    en: 'Smartwatches and Wearables',
    desc: '量心跳、和手機合作、跌倒偵測',
    color: '#5a4fcf',
    added: '2026-10-20',
    slides: [
      {
        title: '手錶怎麼量心跳？',
        text: `${t('智慧手錶', 'smartwatch')}背面有綠色的燈。血會吸收綠光，心臟每跳一下，手腕裡的血變多，反射回來的光就變少。量量看！`,
        widget: 'pulse',
      },
      {
        title: '手錶和手機合作',
        text: `手錶很小，有些事自己就能做；要上網的事，大多要透過${t('藍牙', 'Bluetooth')}請手機幫忙。分分看！`,
        widget: 'sort',
        params: {
          rest: 'self',
          bins: [
            { id: 'self', icon: '⌚', label: '手錶自己就能做' },
            { id: 'phone', icon: '📱', label: '要靠手機幫忙' },
          ],
          items: [
            { icon: '👣', label: '算今天走了幾步', bin: 'self' },
            { icon: '❤️', label: '量心跳', bin: 'self' },
            { icon: '⏰', label: '鬧鐘震動叫你起床', bin: 'self' },
            { icon: '💬', label: '收到 LINE 訊息', bin: 'phone' },
            { icon: '📞', label: '接電話', bin: 'phone' },
            { icon: '🌦️', label: '看今天的天氣預報', bin: 'phone' },
          ],
        },
      },
      {
        title: '跌倒偵測',
        text: `有的手錶會${t('偵測跌倒', 'fall detection')}。跌倒以後，手錶會先問你；大約 1 分鐘沒回答，就自動打 119，還把位置傳給家人。試試看！`,
        widget: 'falldetect',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '手錶說你的心跳比平常快很多，怎麼辦？',
          options: [
            { text: '🙋 覺得不舒服，就告訴大人或去看醫生', correct: true },
            { text: '📴 把手錶拿掉，就沒事了' },
            { text: '🤖 手錶比醫生還準，聽手錶的就好' },
          ],
          explain: '手錶可以提醒你，但它不是醫生。心跳、睡眠這些健康資料也很私人，不要隨便分享。',
        },
      },
    ],
  },

  {
    id: 'inside',
    part: 'adv',
    icon: '🧠',
    title: '電腦裡面',
    en: 'Inside the Computer',
    desc: 'CPU、記憶體和 0 與 1',
    color: '#1971c2',
    slides: [
      {
        title: '電腦裡面的好朋友',
        text: "大書架（<b class=\"term\">硬碟<span class=\"en\" lang=\"en\">hard drive</span></b>）負責永久保存，辦公桌（<b class=\"term\">記憶體<span class=\"en\" lang=\"en\">RAM</span></b>）隨手拿來放正在做的事，忙碌小工人（<b class=\"term\">CPU<span class=\"en\" lang=\"en\">CPU</span></b>）飛快動手處理。體驗開啟相簿與突發斷電！",
        widget: "deskrelay",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '關機以後會怎樣？',
        text: `${t('記憶體', 'memory')}像書桌，關機就清空了。${t('硬碟', 'hard drive')}像書櫃，關機後東西還在。跟著步驟試試看。`,
        widget: 'power',
      },
      {
        title: '電腦只懂 0 和 1',
        text: `電腦裡面有好多小開關，開是 1，關是 0，每個開關叫做一個${t('位元', 'bit')}。用 0 和 1 代表數字叫做${t('二進位', 'binary')}。點燈泡湊出數字！`,
        widget: 'binary',
        params: { bits: [8, 4, 2, 1], targets: [3, 9, 14] },
      },
      {
        title: '位元和位元組',
        text: `一個 0 或 1 叫一個${t('位元', 'bit')}，8 個位元合起來叫一個${t('位元組', 'byte')}。一個英文字母剛好存成 1 個位元組，中文字通常要 3 個位元組。小寫 b 是位元，大寫 B 是位元組。`,
        widget: 'bytes',
      },
      {
        title: '每個按鍵都有號碼',
        text: `電腦看不懂字母，只看得懂數字。所以${t('鍵盤', 'keyboard')}的每個按鍵都有自己的${t('號碼', 'code')}，像 A 是 65。按按看，看看號碼怎麼跑。`,
        widget: 'keys',
        params: { keys: ['A', 'B', 'C', 'X', 'Y', 'Z'], goal: 4, showCode: true },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '畫好一張圖，按了「存檔」再關機。圖會放在哪裡？',
          options: [
            { text: '📚 硬碟（書櫃）', correct: true },
            { text: '🗒️ 記憶體（書桌）' },
            { text: '🖥️ 螢幕裡面' },
          ],
          explain: '存檔就是把東西收進書櫃，所以關機也不會不見。',
        },
      },
    ],
  },

  {
    id: 'logic',
    part: 'adv',
    icon: '💡',
    title: '邏輯閘',
    en: 'Logic Gates',
    desc: '用開關和燈泡做判斷：AND、OR、NOT',
    color: '#f76707',
    added: '2026-10-19',
    slides: [
      {
        title: 'AND：而且',
        text: `電腦裡有幾十億個小開關。把開關接在一起，就能做出會判斷的電路，叫${t('邏輯閘', 'logic gate')}。兩個開關排成一排，A 而且 B 都打開，燈才會亮，這叫 ${t('AND 閘', 'AND gate')}。`,
        widget: 'gate',
        params: { gate: 'and' },
      },
      {
        title: 'OR：或',
        text: `兩個開關並排接，A 或 B 只要有一個打開，電就有路可以走，燈就會亮，這叫 ${t('OR 閘', 'OR gate')}。四種開法都試試看！`,
        widget: 'gate',
        params: { gate: 'or' },
      },
      {
        title: 'NOT：相反',
        text: `冰箱的燈很特別：門關上時會壓住一個按鈕，燈就熄了；門一打開，按鈕彈起來，燈就亮。按鈕和燈剛好相反，這叫 ${t('NOT 閘', 'NOT gate')}。`,
        widget: 'gate',
        params: { gate: 'not' },
      },
      {
        title: '生活裡的邏輯閘',
        text: '電腦把好多好多 AND、OR、NOT 組合起來，就能做加法、比大小。生活裡也有一樣的規則。分分看，每一個是哪一種？',
        widget: 'sort',
        params: {
          bins: [
            { id: 'and', icon: '🔗', label: 'AND 而且' },
            { id: 'or', icon: '🔀', label: 'OR 或' },
            { id: 'not', icon: '🔄', label: 'NOT 相反' },
          ],
          items: [
            { icon: '🔐', label: '有鑰匙，而且知道密碼，保險箱才打得開', bin: 'and' },
            { icon: '🎢', label: '夠高，而且有大人陪，才能坐雲霄飛車', bin: 'and' },
            { icon: '🔔', label: '前門或後門有人按，門鈴都會響', bin: 'or' },
            { icon: '💳', label: '用悠遊卡或手機，都可以進捷運站', bin: 'or' },
            { icon: '🌞', label: '外面亮的時候，路燈就不亮', bin: 'not' },
            { icon: '🔇', label: '按下靜音，就沒有聲音', bin: 'not' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '走廊的燈要「有人走過」而且「天黑了」才會自動亮。這是哪一種邏輯閘？',
          options: [
            { text: '🔗 AND（而且）', correct: true },
            { text: '🔀 OR（或）' },
            { text: '🔄 NOT（相反）' },
          ],
          explain: '兩件事都要成立才亮，就是 AND。如果只要一件事成立就亮，就是 OR。',
        },
      },
    ],
  },

  {
    id: 'adder',
    part: 'adv',
    icon: '➕',
    title: '電腦怎麼做加法？',
    en: 'How Computers Add',
    desc: '二進位進位、半加器、全加器',
    color: '#087f5b',
    added: '2026-10-19',
    slides: [
      {
        title: '二進位也會進位',
        text: `十進位的 9 + 1，滿十就${t('進位', 'carry')}，變成 10。二進位只有 0 和 1，所以 1 + 1 就要進位，寫成 10，就是 2。試試看！`,
        widget: 'bincount',
      },
      {
        title: '半加器：兩個邏輯閘',
        text: `${t('XOR 閘', 'XOR gate')}在兩個輸入只有一個是 1 時，才輸出 1。XOR 算出「和」，AND 算出「進位」，合起來叫${t('半加器', 'half adder')}。四種都試試看！`,
        widget: 'halfadder',
      },
      {
        title: '一位一位加上去',
        text: `再多接一條進位的線，就是${t('全加器', 'full adder')}。4 個全加器排成一排，從右邊開始加，進位一位一位傳到左邊。試試看！`,
        widget: 'ripple',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '用二進位算：1 + 1 = ？',
          options: [
            { text: '10', correct: true },
            { text: '11' },
            { text: '0' },
          ],
          explain: '二進位沒有 2。1 + 1 滿 2 就進位，寫成 10，意思就是十進位的 2。',
        },
      },
    ],
  },

  {
    id: 'os',
    part: 'adv',
    icon: '🗂️',
    title: '作業系統',
    en: 'Operating Systems',
    desc: '裝置裡的大管家',
    color: '#5c7cfa',
    slides: [
      {
        title: '裝置裡的大管家',
        text: `${t('作業系統', 'operating system')}是裝置裡的大管家：它管理 App、記憶體、檔案，還有螢幕、鍵盤這些硬體。不同公司做不同的作業系統。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'apple', icon: '🍎', label: 'Apple 做的' },
            { id: 'google', icon: '🔍', label: 'Google 做的' },
            { id: 'ms', icon: '🪟', label: 'Microsoft 做的' },
          ],
          items: [
            { icon: '📲', label: 'iPadOS（iPad）', bin: 'apple' },
            { icon: '📱', label: 'iOS（iPhone）', bin: 'apple' },
            { icon: '💻', label: 'macOS（Mac）', bin: 'apple' },
            { icon: '🤖', label: 'Android（很多手機）', bin: 'google' },
            { icon: '🖥️', label: 'Windows（很多電腦）', bin: 'ms' },
          ],
        },
      },
      {
        title: '同時做好幾件事？',
        text: `一邊聽音樂、一邊下載、一邊畫畫，其實 CPU 是很快地${t('輪流', 'time sharing')}做這些事，快到看起來像同時進行。作業系統負責安排現在輪到誰。`,
        widget: 'multitask',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '誰負責決定現在輪到哪一個 App 使用 CPU？',
          options: [
            { text: '🗂️ 作業系統', correct: true },
            { text: '🖥️ 螢幕' },
            { text: '🔌 充電器' },
          ],
          explain: 'App 不能自己搶著用，作業系統會公平地安排，讓每個 App 都順順地跑。',
        },
      },
    ],
  },

  {
    id: 'screens',
    part: 'adv',
    icon: '🔍',
    title: '螢幕和感測器',
    en: 'Screens & Sensors',
    desc: '觸控、感測器、像素和發光',
    color: '#d9480f',
    slides: [
      {
        title: '螢幕怎麼知道我點哪裡？',
        text: `${t('觸控螢幕', 'touchscreen')}底下有看不見的細線格子。手指一碰，某一條橫線和直線就有感覺，交叉的地方就是你點的位置。`,
        widget: 'touch',
        params: { rows: 5, cols: 7, rounds: 3 },
      },
      {
        title: '手機的超能力',
        text: "手機上有許多神奇的<b class=\"term\">感測器<span class=\"en\" lang=\"en\">sensor</span></b>小英雄，像眼睛和耳朵一樣幫忙察覺周圍環境。遇到天黑、開車轉彎或貼近耳朵時，派出正確的感測英雄！",
        widget: "sensorheroes",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '滑鼠告訴電腦「動了多少」',
        text: `${t('滑鼠', 'mouse')}底下有一個小眼睛，一直看桌面往哪邊動、動了多少，再告訴電腦，螢幕上的${t('游標', 'cursor')}就跟著動。在下面的桌面拖動滑鼠，去抓星星！`,
        widget: 'mouse',
        params: { stars: 3 },
      },
      {
        title: '螢幕是小點點拼成的',
        text: `湊近看，螢幕是由好多好多小點點拼成的，叫做${t('像素', 'pixel')}。照著左邊的圖，把右邊的格子塗出來。`,
        widget: 'pixels',
        params: {
          pattern: [
            '0110110',
            '1111111',
            '1111111',
            '0111110',
            '0011100',
            '0001000',
          ],
          color: '#e8590c',
        },
      },
      {
        title: '紅、綠、藍三盞小燈',
        text: `每個像素裡有紅、綠、藍三盞小燈，英文簡稱 ${t('RGB', 'Red Green Blue')}。亮不同的燈，就會混出不同的顏色。`,
        widget: 'rgb',
        params: {
          targets: [
            { name: '黃色', on: [1, 1, 0] },
            { name: '白色', on: [1, 1, 1] },
            { name: '洋紅色', on: [1, 0, 1] },
          ],
        },
      },
      {
        title: '螢幕怎麼發光？',
        text: `${t('液晶螢幕', 'LCD')}後面有一大片${t('背光', 'backlight')}，前面的${t('液晶', 'liquid crystal')}像百葉窗，開開關關決定透出多少光。${t('OLED', 'organic LED')} 的每個小點自己會發光。大部分 iPad 是液晶，很多手機是 OLED。兩種都切換看看，比比看黑色！`,
        widget: 'screen',
      },
      {
        title: '印表機用小墨點畫圖',
        text: `${t('印表機', 'printer')}有兩種常見的：${t('噴墨印表機', 'inkjet printer')}的噴頭一行一行來回跑，在對的地方噴上小墨點。${t('雷射印表機', 'laser printer')}用雷射在滾筒上畫出靜電圖，吸住${t('碳粉', 'toner')}，再加熱燙到紙上，一次印一整頁。先畫一張圖，兩種都印印看！`,
        widget: 'printer',
        params: { size: 7 },
      },
    ],
  },

  {
    id: 'storage',
    part: 'adv',
    icon: '💾',
    title: '資料怎麼存起來？',
    en: 'How Storage Works',
    desc: '硬碟、SSD 和雲端',
    color: '#7048c8',
    slides: [
      {
        title: '硬碟：會轉的圓盤',
        text: "傳統的<b class=\"term\">機械硬碟<span class=\"en\" lang=\"en\">HDD</span></b>裡面有一張像唱片一樣轉得飛快的金屬圓盤，還有一隻像留聲機的<b class=\"term\">讀寫臂<span class=\"en\" lang=\"en\">Actuator Arm</span></b>在上面讀資料。點點看不同的檔案，再看看摔到筆電會發生什麼事！",
        widget: 'hddseek',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '隨身碟和 SSD：不會動',
        text: "<b class=\"term\">固態硬碟<span class=\"en\" lang=\"en\">SSD</span></b>和隨身碟裡面完全沒有任何會動的轉盤或手臂！它們用微小的<b class=\"term\">浮柵電晶體<span class=\"en\" lang=\"en\">Floating Gate</span></b>把電子牢牢鎖住。把資料寫進去並用力搖晃它！",
        widget: 'flashtrap',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '壓縮：把檔案變小',
        text: `檔案太大時可以${t('壓縮', 'compression')}。像「白白紅紅紅白白」可以寫成「2白3紅2白」，變短了，也能變回原來的樣子。照著暗號把圖塗出來！`,
        widget: 'rle',
        params: {
          pattern: ['0011100', '0111110', '1101011', '1111111', '0100010', '0011100'],
          color: '#e03131',
          colorName: '紅',
        },
      },
      {
        title: '有損和無損',
        text: `ZIP 壓縮檔用的是${t('無損壓縮', 'lossless compression')}，可以完整變回原來的樣子。JPEG 照片用的是${t('有損壓縮', 'lossy compression')}，會丟掉一點細節，換來小很多的檔案。`,
        widget: 'choice',
        params: {
          question: '照片存成 JPEG 會變小很多，是因為？',
          options: [
            { text: '👀 丟掉一些眼睛不太看得出來的細節', correct: true },
            { text: '⚫ 把照片變成黑白' },
            { text: '✂️ 剪掉照片的一半' },
          ],
          explain: '人的眼睛對很細小的顏色變化不敏感，JPEG 就是把這些丟掉，所以照片小很多。',
        },
      },
      {
        title: '要網路才拿得到嗎？',
        text: '有些地方的資料要<b>連上網路</b>才拿得到。分分看！',
        widget: 'sort',
        params: {
          bins: [
            { id: 'net', icon: '📶', label: '要網路', en: 'online' },
            { id: 'local', icon: '🔌', label: '不用網路', en: 'offline' },
          ],
          items: [
            { icon: '☁️', label: '雲端相簿', en: 'cloud photos', bin: 'net' },
            { icon: '📝', label: '線上共用文件', bin: 'net' },
            { icon: USB, label: '隨身碟', en: 'USB flash drive', bin: 'local' },
            { icon: '💽', label: '電腦裡的硬碟', en: 'hard drive', bin: 'local' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '沒有網路，想把電腦裡的作業帶回家，可以存在哪裡？',
          options: [
            { text: `${USB} 隨身碟`, correct: true },
            { text: '🗒️ 記憶體' },
            { text: '🖨️ 印表機' },
          ],
          explain: '隨身碟小小的、可以帶著走，拔下來東西也不會不見。記憶體一關機就清空了。',
        },
      },
    ],
  },

  {
    id: 'soundvideo',
    part: 'adv',
    icon: '🎞️',
    title: '聲音和影片怎麼變成數字',
    en: 'Sound and Video as Numbers',
    desc: '取樣、影格率，還有影片為什麼要壓縮',
    color: '#0b7285',
    added: '2026-10-19',
    slides: [
      {
        title: '聲音變成數字',
        text: `聲音是空氣在振動。${t('麥克風', 'microphone')}每秒量好幾萬次振動有多大，把它變成一串數字，這叫${t('取樣', 'sampling')}。量多一點看看！`,
        widget: 'sampler',
      },
      {
        title: '影片是很多張圖',
        text: `影片是很多張圖片，很快地一張接一張播。每一張叫${t('影格', 'frame')}，一秒播幾張叫${t('影格率', 'frame rate')}。換換看！`,
        widget: 'fps',
      },
      {
        title: '影片為什麼這麼大？',
        text: `一秒 30 張圖，一分鐘就有 1,800 張！所以影片都要${t('壓縮', 'compression')}，例如只記下這一張和上一張「不一樣的地方」。`,
        widget: 'choice',
        params: {
          question: '一張圖 1 MB，一秒 30 張。1 分鐘的影片不壓縮，有多大？',
          options: [
            { text: '📦 1,800 MB', correct: true },
            { text: '📦 60 MB' },
            { text: '📦 30 MB' },
          ],
          explain: '30 × 60 = 1,800 張，就是 1,800 MB，快 2 GB！壓縮成 .mp4 以後，常常只要幾十 MB。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '錄音 App 可以選「高品質」或「一般」。為什麼高品質的檔案比較大？',
          options: [
            { text: '🔢 每秒量比較多次，數字比較多', correct: true },
            { text: '🔊 聲音比較大聲' },
            { text: '⏳ 錄的時間比較長' },
          ],
          explain: '量得越多次，聲音越像原來的，可是要存的數字也越多，檔案就越大。',
        },
      },
    ],
  },

  {
    id: 'biometric',
    part: 'adv',
    icon: '👤',
    title: '人臉和指紋辨識',
    en: 'Face and Fingerprint ID',
    desc: '紅外線小點、臉變成數字、指紋的特徵點',
    color: '#364fc7',
    added: '2026-10-19',
    slides: [
      {
        title: '量臉的高低',
        text: `Face ID 會把 3 萬多個看不見的${t('紅外線', 'infrared')}小點照在臉上，量出哪裡近、哪裡遠。照片是平的，量不出高低。試試看！`,
        widget: 'dotface',
      },
      {
        title: '臉變成一串數字',
        text: '手機不存你的照片，而是把臉的形狀變成一串數字，只存在手機裡。解鎖時再量一次，數字很接近，就打開。誰打得開？',
        widget: 'facematch',
      },
      {
        title: '指紋的特徵點',
        text: `Touch ID 像觸控螢幕一樣，用很小的格子摸出指紋。它記住紋路在哪裡斷掉、在哪裡分岔，這些叫${t('特徵點', 'minutiae')}。找找看！`,
        widget: 'fpmatch',
      },
      {
        title: '密碼還是要記得',
        text: '臉和指紋很方便，可是受傷、戴口罩，都可能認不出來，也不能換一個新的。密碼才是最後一把鑰匙。',
        widget: 'choice',
        params: {
          question: '手指受傷包了 OK 繃，Touch ID 打不開。怎麼辦？',
          options: [
            { text: '🔢 用密碼解鎖', correct: true },
            { text: '🔄 把 iPad 重新開機' },
            { text: '🆕 換一台 iPad' },
          ],
          explain: '臉和指紋打不開時，都可以改用密碼。重新開機以後，iPad 也一定要你先打密碼。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '為什麼拿你的照片，打不開 Face ID？',
          options: [
            { text: '📏 照片是平的，量不出臉的高低', correct: true },
            { text: '🎨 照片的顏色不對' },
            { text: '📐 照片太小了' },
          ],
          explain: '紅外線小點照在照片上，每個點都一樣遠。真的臉有高有低，Face ID 量的就是這個。',
        },
      },
    ],
  },

  {
    id: 'gpu',
    part: 'adv',
    icon: '🎮',
    title: 'CPU 和 GPU',
    en: 'CPU & GPU',
    desc: '聰明大廚和一大群小幫手',
    color: '#c2255c',
    slides: [
      {
        title: 'CPU：幾位聰明大廚',
        text: "<b class=\"term\">中央處理器<span class=\"en\" lang=\"en\">CPU</span></b>裡有幾位算術非常強大的「核心大廚」。不管料理步驟多複雜，大廚都能井然有序地一步一步做完。點餐讓大廚們開工！",
        widget: 'cpuchefs',
        params: {},
        added: '2026-10-24',
      },
      {
        title: 'GPU：一大群小幫手',
        text: "<b class=\"term\">圖形處理器<span class=\"en\" lang=\"en\">GPU</span></b>就像幾千位戴著工作帽的小工蟻。雖然每個人只會蓋簡單的印章，但只要一聲令下全部「同時蓋章」，一瞬間就能畫好整個螢幕！",
        widget: 'gpusimd',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '塗色比賽',
        text: '遊戲畫面有好多點要上色。看看 4 位大廚和 64 個小幫手，誰先塗完？',
        widget: 'race',
      },
      {
        title: '誰比較適合？',
        text: '把工作拖給比較適合的那一邊。',
        widget: 'sort',
        params: {
          bins: [
            { id: 'cpu', icon: '👨‍🍳', label: '大廚', en: 'CPU' },
            { id: 'gpu', icon: '🐜', label: '小幫手', en: 'GPU' },
          ],
          items: [
            { icon: '🖼️', label: '把照片每個點都調亮', bin: 'gpu' },
            { icon: '🕹️', label: '每秒畫 60 張遊戲畫面', bin: 'gpu' },
            { icon: '📋', label: '決定下一步要做什麼', bin: 'cpu' },
            { icon: '🧩', label: '一步接一步的難題', bin: 'cpu' },
          ],
        },
      },
      {
        title: 'AI 也愛用 GPU',
        text: "現代 <b class=\"term\">人工智慧<span class=\"en\" lang=\"en\">AI</span></b> 辨識一張圖片或回答問題，需要計算成千上萬道簡單的數學乘法。如果用 CPU 一題一題算要等很久，但換成 GPU 同步運算，眨眼間就能辨識出小貓！",
        widget: 'aimath',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: 'GPU 為什麼畫遊戲畫面那麼快？',
          options: [
            { text: '🐜 很多小幫手同時一起做', correct: true },
            { text: '🏃 每個小幫手都跑得特別快' },
            { text: '🪄 它會魔法' },
          ],
          explain: '每個小幫手並不特別快，是人數多、可以同時做，才那麼快。',
        },
      },
    ],
  },

  {
    id: 'ailearn',
    part: 'adv',
    icon: '🧠',
    title: 'AI 怎麼學？',
    en: 'How AI Learns',
    desc: '從例子學規律，例子越多越好',
    color: '#12b886',
    slides: [
      {
        title: '從例子學會',
        text: `AI 不是被一條一條寫好規則，而是看很多${t('例子', 'examples')}，自己找出規律，這叫${t('機器學習', 'machine learning')}。這個小 AI 只會看顏色，看看它學得怎麼樣！`,
        widget: 'train',
      },
      {
        title: '考考你',
        text: `AI 學到的，只會跟它看過的例子一樣好。例子太少或太偏，AI 就會有${t('偏見', 'bias')}，對沒看過的東西判斷錯。`,
        widget: 'choice',
        params: {
          question: '一個 AI 只看過大人的臉，它認小朋友的臉會怎樣？',
          options: [
            { text: '😕 比較容易認錯', correct: true },
            { text: '💯 一定認得很準' },
            { text: '👴 會把小朋友變老' },
          ],
          explain: '所以訓練 AI 的例子要夠多，也要包含各種不同的人和東西。',
        },
      },
    ],
  },

  {
    id: 'internet',
    part: 'adv',
    icon: '🌐',
    title: '網路怎麼傳東西？',
    en: 'How Data Travels',
    desc: '電磁波、IP 位址、封包和路由器',
    color: '#6741d9',
    slides: [
      {
        title: '看不見的波',
        text: `Wi-Fi、${t('藍牙', 'Bluetooth')}和行動網路，都是用${t('電磁波', 'electromagnetic wave')}傳資料。光也是電磁波！它們是一家人，只是${t('波長', 'wavelength')}不一樣，有的看得到，有的看不到。點每一段看看。`,
        widget: 'waves',
      },
      {
        title: '每台裝置都有地址',
        text: `就像寄信要寫地址，網路上每台裝置都有一個地址，叫做${t('IP 位址', 'IP address')}。它有 4 段數字，用點隔開；每一段用 1 個位元組存，所以只能是 0 到 255。把信送到對的地址，不可能的地址放到 🚫！`,
        widget: 'sort',
        params: {
          intro: '<div class="ip-parts">' + ['192', '168', '1', '20'].map(n => `<span><b>${n}</b><small>0～255</small></span>`).join('<i>.</i>') + '</div><p>4 段數字，每段 0～255</p>',
          bins: [
            { id: 'a', icon: '🏠', label: '192.168.1.10' },
            { id: 'b', icon: '🏫', label: '192.168.1.20' },
            { id: 'c', icon: '🏥', label: '192.168.1.30' },
            { id: 'x', icon: '🚫', label: '不可能的地址' },
          ],
          items: [
            { icon: '✉️', label: '寄到 192.168.1.20', bin: 'b' },
            { icon: '✉️', label: '寄到 192.168.1.30', bin: 'c' },
            { icon: '✉️', label: '寄到 192.168.1.10', bin: 'a' },
            { icon: '✉️', label: '寄到 192.168.1.300', bin: 'x' },
            { icon: '✉️', label: '寄到 192.256.1.10', bin: 'x' },
          ],
        },
      },
      {
        title: '訊息會切成小包裹',
        text: `要傳的訊息會切成一小包一小包，叫做${t('封包', 'packet')}，每包都有號碼。它們各走各的路，到了以後再照號碼排好。`,
        widget: 'packets',
        params: { parts: ['放學', '一起', '去', '公園'] },
      },
      {
        title: '路由器：網路的交通警察',
        text: `${t('路由器', 'router')}會看封包上的 IP 位址，查自己的路線表，決定下一站往哪裡送，這叫做${t('路由', 'routing')}。網路上有好多路由器連來連去，封包一站一站傳過去。家裡的 Wi-Fi 分享器裡面，也有一台小路由器。換你當路由器：看地址的第三段，點下一站！`,
        widget: 'routing',
      },
      {
        title: '看一部影片發生了什麼？',
        text: `你點一部影片，平板會送出${t('請求', 'request')}給遠方的伺服器，伺服器再傳回來。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '👆', label: '你點了影片' },
            { icon: '📨', label: '平板送出請求' },
            { icon: '🗄️', label: '伺服器找到影片' },
            { icon: '📦', label: '影片切成封包傳回來' },
            { icon: '▶️', label: '平板排好封包播放' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '封包走不同的路，到達的順序亂掉了，怎麼辦？',
          options: [
            { text: '🔢 照封包上的號碼排回來', correct: true },
            { text: '🗑️ 全部丟掉' },
            { text: '🎲 隨便排一排' },
          ],
          explain: '每個封包都有號碼，所以不管誰先到，都能排回原來的樣子。',
        },
      },
    ],
  },

  {
    id: 'networld',
    part: 'adv',
    icon: '🌊',
    title: '網路的實體',
    en: 'The Physical Internet',
    desc: '基地台、海底電纜和資料中心',
    color: '#1971c2',
    added: '2026-10-19',
    slides: [
      {
        title: '訊息怎麼到美國？',
        text: `網路不是在空中飛的。訊息會經過${t('基地台', 'cell tower')}、電信公司的機房，再鑽進海底的電纜，一站一站傳過去。跟著訊息走！`,
        widget: 'seacable',
      },
      {
        title: '海底電纜',
        text: `${t('海底電纜', 'submarine cable')}大約像水管那麼粗，裡面是比頭髮還細的${t('光纖', 'optical fiber')}，用光傳資料。台灣和外國的網路，大部分都走海底電纜。`,
        widget: 'choice',
        params: {
          question: '台灣的網路要連到其他國家，大部分走哪裡？',
          options: [
            { text: '🌊 海底電纜', correct: true },
            { text: '🛰️ 太空中的衛星' },
            { text: '📶 很大很大的 Wi-Fi' },
          ],
          explain: '衛星比較慢，主要用在海上、山上這些拉不到電纜的地方。海底電纜被船錨勾斷時，網路就會變慢，馬祖就發生過。',
        },
      },
      {
        title: '雲端在哪裡？',
        text: `雲端的資料存在${t('資料中心', 'data center')}：一棟大房子，裡面有好幾萬台電腦，一整天開著，很耗電，還要很多冷氣降溫。分分看！`,
        widget: 'sort',
        params: {
          rest: 'cloud',
          bins: [
            { id: 'cloud', icon: '🏭', label: '要用到資料中心' },
            { id: 'local', icon: '📱', label: '手機自己就能做' },
          ],
          items: [
            { icon: '📺', label: '看線上影片', bin: 'cloud' },
            { icon: '🤖', label: '跟 AI 聊天', bin: 'cloud' },
            { icon: '☁️', label: '照片備份到雲端', bin: 'cloud' },
            { icon: '📹', label: '視訊通話', bin: 'cloud' },
            { icon: '🧮', label: '用計算機算數學', bin: 'local' },
            { icon: '📷', label: '拍一張照片', bin: 'local' },
            { icon: '🎬', label: '看已經下載好的影片', bin: 'local' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '看線上影片時，除了你的手機，還有哪裡在用電？',
          options: [
            { text: '🏭 遠方的資料中心和一路上的網路設備', correct: true },
            { text: '🙅 沒有，只有手機在用電' },
            { text: '🛰️ 只有天上的衛星' },
          ],
          explain: '資料中心、機房和基地台都一直開著。不看的影片就關掉，也是在幫地球省電。',
        },
      },
    ],
  },

  {
    id: 'web',
    part: 'adv',
    icon: '🔐',
    title: '網址和加密',
    en: 'URLs & Encryption',
    desc: '網址、DNS、加密和 TLS',
    color: '#2b8a3e',
    slides: [
      {
        title: '網址的三個部分',
        text: "每一條<b class=\"term\">網址<span class=\"en\" lang=\"en\">URL</span></b>就像一列三節小火車：安全火車頭 (https://)、地址大門車廂 (zoo.gov.tw) 與寶物房間車尾 (/panda)。將車廂依序掛鉤拼起來！",
        widget: "urltrain",
        params: {},
        added: '2026-10-24',
      },
      {
        title: 'DNS：網路的通訊錄',
        text: "電腦只認得像「140.112.1.25」這樣的數字門牌。<b class=\"term\">DNS<span class=\"en\" lang=\"en\">Domain Name System</span></b> 就像網路世界的超大電話簿與地址通訊錄，負責把網址翻譯成 IP 位址！",
        widget: 'dnslookup',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '為什麼要加密？',
        text: `封包要經過很多台路由器，就像上課傳紙條要經過好幾位同學，中間的人可能會偷看。${t('加密', 'encryption')}就是把紙條鎖起來，只有收到的人能打開。試試看兩種傳法！`,
        widget: 'cipher',
      },
      {
        title: '祕密暗號',
        text: `把每個字母往後移幾格，就變成別人看不懂的暗號。知道「移幾格」的人才能${t('解密', 'decryption')}，這個祕密數字叫做${t('金鑰', 'key')}。拉動金鑰，解開暗號！`,
        widget: 'caesar',
        params: { secret: 'PANDA', key: 3 },
      },
      {
        title: 'TLS：先握手，再說悄悄話',
        text: "開始傳悄悄話前，<b class=\"term\">瀏覽器<span class=\"en\" lang=\"en\">browser</span></b>和<b class=\"term\">伺服器<span class=\"en\" lang=\"en\">server</span></b>會先握手：驗證防偽印章身分證，再把兩半<b class=\"term\">金鑰<span class=\"en\" lang=\"en\">key</span></b>扣在一起上鎖。一步一步完成安全握手！",
        widget: "tlshandshake",
        params: {},
        added: '2026-10-24',
      },
    ],
  },

  {
    id: 'iot',
    part: 'adv',
    icon: '🏠',
    title: '物聯網和智慧家電',
    en: 'Internet of Things',
    desc: '會上網的家電、感測器、規則和安全',
    color: '#6d28d9',
    added: '2026-10-19',
    slides: [
      {
        title: '會上網的東西',
        text: `不只電腦和手機，燈泡、冷氣、門鈴也能連上網路，用手機就能控制。這些東西連在一起，叫${t('物聯網', 'Internet of Things')}。分分看！`,
        widget: 'sort',
        params: {
          rest: 'off',
          bins: [
            { id: 'net', icon: '🌐', label: '會上網' },
            { id: 'off', icon: '📴', label: '不會上網' },
          ],
          items: [
            { icon: '💡', label: '用手機開關的燈泡', bin: 'net' },
            { icon: '🤖', label: '掃地機器人', bin: 'net' },
            { icon: '📹', label: '網路攝影機', bin: 'net' },
            { icon: '🔊', label: '智慧音箱', bin: 'net' },
            { icon: '🪑', label: '木頭椅子', bin: 'off' },
            { icon: '🔦', label: '裝電池的手電筒', bin: 'off' },
            { icon: '📕', label: '故事書', bin: 'off' },
          ],
        },
      },
      {
        title: '感測器、網路、手機',
        text: '智慧盆栽身上有感測器。土太乾，它就透過 Wi-Fi 傳給雲端的伺服器，伺服器再通知你的手機。依順序點一點。',
        widget: 'order',
        params: {
          items: [
            { icon: '🌱', label: '感測器量到土太乾' },
            { icon: '📶', label: '透過 Wi-Fi 送出去' },
            { icon: '🗄️', label: '雲端的伺服器收到' },
            { icon: '📱', label: '手機跳出「該澆水了」' },
          ],
        },
      },
      {
        title: '照規則做事',
        text: `智慧家電照${t('規則', 'rule')}做事。邏輯閘的 AND、OR 也用得上：選對了，冷氣只在該開的時候開，最省電。試試看！`,
        widget: 'iotrule',
      },
      {
        title: '家裡的攝影機要上鎖',
        text: `很多智慧家電剛買來，${t('預設密碼', 'default password')}都一樣，像 admin 或 1234。壞人知道這些密碼，會在網路上找沒改密碼的攝影機。分分看！`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '👍', label: '好習慣' },
            { id: 'no', icon: '🙅', label: '不要這樣做' },
          ],
          items: [
            { icon: '🔑', label: '改掉預設密碼', bin: 'ok' },
            { icon: '🔄', label: '有更新就更新', bin: 'ok' },
            { icon: '🚪', label: '攝影機不對著臥室和浴室', bin: 'ok' },
            { icon: '🙈', label: '密碼一直用 admin', bin: 'no' },
            { icon: '📤', label: '把攝影機的畫面連結貼到網路上', bin: 'no' },
            { icon: '⏳', label: '一直跳過更新', bin: 'no' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你在學校，用手機按「開燈」，家裡的燈就亮了。訊息是怎麼到家的？',
          options: [
            { text: '☁️ 經過網路和雲端，再到家裡的 Wi-Fi', correct: true },
            { text: '🎧 手機直接用藍牙連到燈泡' },
            { text: '🔮 燈泡自己猜到的' },
          ],
          explain: '藍牙只有一個房間那麼遠。離家很遠時，要靠網路和雲端的伺服器幫忙傳話。',
        },
      },
    ],
  },

  {
    id: 'attackers',
    part: 'adv',
    icon: '🕵️',
    title: '駭客想要什麼？',
    en: 'What Attackers Want',
    desc: '攻擊目的、社交工程和練習界線',
    color: '#6f42c1',
    added: '2026-10-23',
    slides: [
      {
        title: '白帽和黑帽',
        text: `${t('白帽駭客', 'white-hat hacker')}得到允許後找漏洞，幫忙修好。${t('黑帽駭客', 'black-hat hacker')}沒有允許就闖入。關鍵不是技術，而是有沒有得到允許。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'yes', icon: '🛡️', label: '有允許，幫忙防守' },
            { id: 'no', icon: '🚫', label: '沒允許，不能這樣做' },
          ],
          items: [
            { icon: '🏫', label: '學校請專家測試自己的網站', bin: 'yes' },
            { icon: '🧪', label: '在課堂的練習環境找漏洞', bin: 'yes' },
            { icon: '🔑', label: '偷猜同學的帳號密碼', bin: 'no' },
            { icon: '📱', label: '趁朋友不在，翻看他的手機', bin: 'no' },
          ],
        },
      },
      {
        title: '駭客想要什麼？',
        text: "壞人想偷走你的遊戲寶物、零用錢、個人隱私和電腦設備。拖曳對應的防護盾牌，保護你的數位城堡不受侵害！",
        widget: "assetdefense",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '先騙人，比破解電腦容易',
        text: `${t('社交工程', 'social engineering')}是用話術讓人自己交出資料或做出危險動作。它利用的是著急、害怕或貪心，不是電腦漏洞。選出最好的做法！`,
        widget: 'choice',
        params: {
          question: '你收到訊息：「老師急用！現在把驗證碼傳給我。」你該怎麼做？',
          options: [
            { text: '📞 不傳驗證碼，用原本的電話或當面確認', correct: true },
            { text: '⚡ 老師很急，立刻傳過去' },
            { text: '🔁 轉傳給同學，問大家要不要一起傳' },
          ],
          explain: '驗證碼就像一次性的鑰匙，任何人都不該向你索取。用自己原本知道的聯絡方法確認，不用訊息裡的新電話。',
        },
      },
      {
        title: '練習也要有界線',
        text: `沒有允許就進入別人的帳號、電腦或網站，可能觸犯刑法的${t('妨害電腦使用罪', 'computer misuse offences')}。只在自己的裝置、課堂練習環境，或明確允許的系統練習。`,
        widget: 'choice',
        params: {
          question: '哪一種情況可以練習找漏洞？',
          options: [
            { text: '🧪 老師準備的練習網站，而且規則說可以', correct: true },
            { text: '🏪 附近商店的網站，因為只是看看' },
            { text: '🎮 同學的遊戲帳號，因為沒有花錢' },
          ],
          explain: '要先得到系統擁有者的明確允許，並遵守範圍。沒有允許，就不要測試。',
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '有人說：「我只是想幫忙，所以沒有先問也可以測試你的網站。」這句話對嗎？',
          options: [
            { text: '❌ 不對。要先得到明確允許，並遵守範圍', correct: true },
            { text: '✅ 對。只要沒有拿走東西就可以' },
            { text: '✅ 對。會寫程式的人都可以測試' },
          ],
          explain: '白帽工作從允許和清楚範圍開始。好的目的，不能取代同意。',
        },
      },
    ],
  },

  {
    id: 'passwordattacks',
    part: 'adv',
    icon: '🔐',
    title: '密碼怎麼被猜到？',
    en: 'How Passwords Get Guessed',
    desc: '常見密碼、組合數、撞庫和雜湊',
    color: '#b45309',
    added: '2026-10-23',
    slides: [
      {
        title: '常見密碼先被猜',
        text: `攻擊者不必從亂碼開始。像「123456」這種${t('常見密碼', 'common password')}，通常會排在很前面。這是安全示範，只在假的遊戲網站裡進行。試試看！`,
        widget: 'commonpass',
      },
      {
        title: '長度很重要',
        text: `每多一個字，可能的組合就會增加很多。長密碼通常比短密碼更難猜。切換長度和可用的字，讓組合數變大！`,
        widget: 'combinations',
      },
      {
        title: '一個外洩，三個都開？',
        text: `攻擊者會拿外洩的密碼去試其他網站，這叫${t('撞庫', 'credential stuffing')}。每個網站都用同一個密碼，就像所有門都用同一把鑰匙。選一種做法看看！`,
        widget: 'breach',
      },
      {
        title: '網站不該存原密碼',
        text: "安全的網站不會存你的原始密碼，而是用單向果汁機把密碼打成果汁指紋（<b class=\"term\">雜湊<span class=\"en\" lang=\"en\">hash</span></b>）。把水果打成果汁，再試試看能不能把它變回水果！",
        widget: 'hashblender',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '哪一種做法最能防止一個網站外洩後，其他帳號也被打開？',
          options: [
            { text: '🔐 每站用不同長密碼，交給密碼管理器保管', correct: true },
            { text: '🔁 每站都用同一個好記的密碼' },
            { text: '📝 把密碼改成自己的生日' },
          ],
          explain: '每站用不同密碼，外洩就不會一路擴大。能用通行密鑰時，也可以優先使用。',
        },
      },
    ],
  },

  {
    id: 'networkattacks',
    part: 'adv',
    icon: '🛜',
    title: '網路上的攻擊',
    en: 'Attacks on the Network',
    desc: '中間人攻擊、HTTPS 和 DDoS 防護',
    color: '#0f766e',
    added: '2026-10-23',
    slides: [
      {
        title: '有人站在網路中間',
        text: "沒加密的連線就像在空中傳紙條，壞人能半路攔截竄改；啟動 <b class=\"term\">HTTPS<span class=\"en\" lang=\"en\">HTTPS</span></b> 加密安全通道，保護傳輸資料不被偷看竄改！切換兩種連線看看差別！",
        widget: "mitmforcefield",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '網站被塞爆了',
        text: `${t('分散式阻斷服務', 'DDoS')}用許多被控制的裝置同時送來流量，讓真正的使用者進不去。這不是「闖進」網站，而是把門口塞住。打開防護救回商店！`,
        widget: 'traffic',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '你在公共 Wi-Fi 上要登入網站。哪一個做法最安全？',
          options: [
            { text: '🔒 確認網址正確，而且開頭是 https://', correct: true },
            { text: '🛜 只要 Wi-Fi 名字像店名，就一定安全' },
            { text: '⚠️ 網頁說憑證有問題，還是繼續登入' },
          ],
          explain: 'HTTPS 會加密傳輸，但你仍要確認網址正確。看到憑證警告時，不要繼續輸入資料。',
        },
      },
    ],
  },

  {
    id: 'malwareholes',
    part: 'adv',
    icon: '🧩',
    title: '惡意程式和漏洞',
    en: 'Malware and Vulnerabilities',
    desc: '惡意程式、漏洞、零時差和安全更新',
    color: '#9f1239',
    added: '2026-10-23',
    slides: [
      {
        title: '惡意程式不只一種',
        text: `${t('惡意程式', 'malware')}是故意傷害裝置、偷資料或搗亂的程式。名稱常用它怎麼散播，或做了什麼來分類。把四種說明放到對的位置！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'virus', icon: '🦠', label: '病毒' },
            { id: 'worm', icon: '🪱', label: '蠕蟲' },
            { id: 'trojan', icon: '🎁', label: '木馬' },
            { id: 'ransom', icon: '🔒', label: '勒索軟體' },
          ],
          items: [
            { icon: '📎', label: '附在其他檔案上，打開後才跟著執行', bin: 'virus' },
            { icon: '🌐', label: '會自己從一台裝置散播到另一台', bin: 'worm' },
            { icon: '🎮', label: '假裝是好用的 App，裡面卻藏壞東西', bin: 'trojan' },
            { icon: '💰', label: '鎖住檔案，再向你要錢', bin: 'ransom' },
          ],
        },
      },
      {
        title: '漏洞像沒鎖好的門',
        text: `${t('漏洞', 'vulnerability')}是程式裡可能被利用的錯誤，像門因為做錯而鎖不起來。${t('修補', 'patch')}會改正錯誤。先測試，再裝上安全更新！`,
        widget: 'vulnerability',
      },
      {
        title: '修補要趕快裝',
        text: `漏洞已被發現，但修補還沒做好時，常叫${t('零時差漏洞', 'zero-day vulnerability')}。開發者做好更新後，要安裝到裝置上才完成防守。依序點一點！`,
        widget: 'patchline',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '平板跳出「安全更新可以安裝」。最好的做法是什麼？',
          options: [
            { text: '🔄 先備份，再盡快從系統設定安裝更新', correct: true },
            { text: '🙈 永遠不要更新，舊版比較熟悉' },
            { text: '🔗 點陌生訊息裡的連結下載更新檔' },
          ],
          explain: '先備份，再使用裝置的系統設定或官方商店更新。不要從陌生訊息下載更新檔。',
        },
      },
    ],
  },

  {
    id: 'algo',
    part: 'adv',
    icon: '🧩',
    title: '演算法',
    en: 'Algorithms',
    desc: '解決問題的步驟：搜尋和排序',
    color: '#f08c00',
    slides: [
      {
        title: '演算法就是步驟',
        text: `${t('演算法', 'algorithm')}就是解決問題的一步一步的方法，像食譜一樣，照著做就能完成。排好刷牙的步驟！`,
        widget: 'order',
        params: {
          items: [
            { icon: '🪥', label: '拿起牙刷' },
            { icon: '🧴', label: '擠上牙膏' },
            { icon: '😁', label: '上下左右刷乾淨' },
            { icon: '💧', label: '漱口' },
            { icon: '🚿', label: '把牙刷洗乾淨' },
          ],
        },
      },
      {
        title: '猜數字的聰明方法',
        text: `每次都猜中間，再依照「比它大」或「比它小」刪掉一半，叫做${t('二分搜尋', 'binary search')}。想一個數字，讓電腦來猜！`,
        widget: 'guess',
        params: { max: 64 },
      },
      {
        title: '把東西排好',
        text: `把東西從小排到大，叫做${t('排序', 'sorting')}。電腦一次只比較兩個，順序不對就交換。按 ⇄ 交換相鄰的卡片，把數字排好！再看看電腦常用的三種排序方法，比一比誰比較快。`,
        widget: 'swapsort',
        params: { nums: [1, 3, 4, 6, 8, 9] },
      },
    ],
  },

  {
    id: 'recommend',
    part: 'adv',
    icon: '🎯',
    title: '推薦演算法',
    en: 'Recommendations',
    desc: '為什麼 App 一直推薦差不多的影片',
    color: '#ae3ec9',
    added: '2026-10-19',
    slides: [
      {
        title: '為什麼一直推薦一樣的？',
        text: `影片 App 會記下你看了什麼、看多久，再猜你還想看什麼，這叫${t('推薦演算法', 'recommendation algorithm')}。一直點同一種影片，看看推薦會怎麼變！`,
        widget: 'feed',
      },
      {
        title: '同溫層',
        text: `推薦的都是同一種東西，你可能會以為全世界都只有這些，這叫${t('同溫層', 'filter bubble')}。分分看，哪些做法能打破同溫層？`,
        widget: 'sort',
        params: {
          rest: 'ok',
          bins: [
            { id: 'ok', icon: '🌈', label: '打破同溫層' },
            { id: 'no', icon: '🫧', label: '同溫層更厚' },
          ],
          items: [
            { icon: '🔍', label: '搜尋不一樣的主題', bin: 'ok' },
            { icon: '📰', label: '看看不同意見的文章', bin: 'ok' },
            { icon: '🗣️', label: '問問家人朋友的想法', bin: 'ok' },
            { icon: '🧹', label: '有時候清除觀看紀錄', bin: 'ok' },
            { icon: '👍', label: '只按讚自己喜歡的', bin: 'no' },
            { icon: '📺', label: '只看同一種頻道', bin: 'no' },
            { icon: '🚫', label: '看到不同意見就封鎖', bin: 'no' },
          ],
        },
      },
      {
        title: '停不下來？',
        text: "影片播完後倒數 5 秒自動播下一部，大腦很容易被吸引停不下來。在倒數結束前按下「暫停休息」，保衛你的精力電池！",
        widget: "autoplaytug",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '小華最近只看恐龍影片，App 推薦的全部都是恐龍。為什麼？',
          options: [
            { text: '🧠 App 記得他愛看恐龍，就一直推薦差不多的', correct: true },
            { text: '🦖 App 裡面只有恐龍影片' },
            { text: '🏆 恐龍影片是全世界最好看的' },
          ],
          explain: '推薦演算法會照你看過的東西來猜。想看別的，就自己去搜尋。',
        },
      },
    ],
  },

  {
    id: 'freeapps',
    part: 'adv',
    icon: '💰',
    title: '免費 App 怎麼賺錢',
    en: 'How Free Apps Make Money',
    desc: '廣告、Cookie 追蹤和你的資料',
    color: '#c2410c',
    added: '2026-10-19',
    slides: [
      {
        title: '免費的遊戲，誰付錢？',
        text: `很多 App 不用錢就能下載，可是做 App 要花很多錢。它們常靠${t('廣告', 'ad')}賺錢，還會收集你的${t('資料', 'data')}。玩玩看，也看看 App 在背後記下了什麼！`,
        widget: 'freegame',
      },
      {
        title: '廣告怎麼跟著你？',
        text: "看過的球鞋廣告為什麼一直出現在別的網站上？因為瀏覽器的小背包裡被貼上了 <b class=\"term\">Cookie<span class=\"en\" lang=\"en\">cookie</span></b> 追蹤標籤。逛逛看球鞋店並試著清除標籤！",
        widget: "cookiebackpack",
        params: {},
        added: '2026-10-24',
      },
      {
        title: 'App 的三種賺錢方法',
        text: '不用錢的 App 和網站，常用三種方法賺錢：請你花錢買東西、讓你看廣告、用你的資料。分分看！',
        widget: 'sort',
        params: {
          bins: [
            { id: 'buy', icon: '💳', label: '你花錢' },
            { id: 'ad', icon: '📺', label: '看廣告' },
            { id: 'data', icon: '📊', label: '用你的資料' },
          ],
          items: [
            { icon: '💎', label: '買遊戲裡的寶石', bin: 'buy' },
            { icon: '🚫', label: '每個月付錢，就沒有廣告', bin: 'buy' },
            { icon: '🎬', label: '影片前面的廣告', bin: 'ad' },
            { icon: '🎮', label: '過關前要看 30 秒廣告', bin: 'ad' },
            { icon: '🎯', label: '記下你看什麼，挑廣告給你', bin: 'data' },
            { icon: '📍', label: '把你去過哪裡賣給別的公司', bin: 'data' },
          ],
        },
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '一個免費的手電筒 App，要看你的聯絡人和位置。最可能是為什麼？',
          options: [
            { text: '📊 想收集你的資料來賺錢', correct: true },
            { text: '🔦 手電筒要有位置才會亮' },
            { text: '📇 要打電話告訴朋友手電筒開了' },
          ],
          explain: '手電筒不需要聯絡人和位置。App 要了用不到的權限，就按「不允許」。',
        },
      },
    ],
  },

  {
    id: 'coding',
    part: 'adv',
    icon: '👩‍💻',
    title: '程式怎麼做出 App？',
    en: 'How Apps Are Made',
    desc: '程式語言、指令和除錯',
    color: '#1864ab',
    slides: [
      {
        title: '電腦的語言',
        text: `電腦只懂 0 和 1 的${t('機器語言', 'machine code')}。人類發明了比較好懂的${t('程式語言', 'programming language')}，寫好的${t('程式碼', 'code')}再翻譯成 0 和 1。分分看哪些是寫程式的語言！`,
        widget: 'sort',
        params: {
          rest: 'talk',
          bins: [
            { id: 'code', icon: '⌨️', label: '寫程式的語言' },
            { id: 'talk', icon: '🗣️', label: '人說話的語言' },
          ],
          items: [
            { icon: '🐍', label: 'Python', bin: 'code' },
            { icon: '📜', label: 'JavaScript', bin: 'code' },
            { icon: '🐦', label: 'Swift（做 iPhone App）', bin: 'code' },
            { icon: '🐱', label: 'Scratch（拼積木）', bin: 'code' },
            { icon: '🀄', label: '中文', bin: 'talk' },
            { icon: '🔤', label: '英文', bin: 'talk' },
          ],
        },
      },
      {
        title: '程式是一步一步的指令',
        text: `${t('程式', 'program')}就是一連串的${t('指令', 'instruction')}，電腦會一步一步照做，不會自己猜。排好指令，讓機器人走到星星！撞到石頭就是程式有${t('錯誤', 'bug')}，找出來改好叫做${t('除錯', 'debug')}。`,
        widget: 'code',
      },
      {
        title: '如果……就……',
        text: "電腦最擅長依照情況做決定：<b class=\"term\">如果<span class=\"en\" lang=\"en\">IF</span></b> 遇到這件事，<b class=\"term\">就<span class=\"en\" lang=\"en\">THEN</span></b> 做這個動作；<b class=\"term\">否則<span class=\"en\" lang=\"en\">ELSE</span></b> 做另一個動作。組合積木讓機器人動起來！",
        widget: 'ifcondition',
        params: {},
        added: '2026-10-24',
      },
      {
        title: '從程式到 App',
        text: '一個 App 從想法到出現在你的平板上，要經過好幾步。依順序點一點。',
        widget: 'order',
        params: {
          items: [
            { icon: '💡', label: '想一個好點子' },
            { icon: '⌨️', label: '寫程式碼' },
            { icon: '🐞', label: '測試，找出 bug 改好' },
            { icon: '🅰️', label: '放上 App Store' },
            { icon: '🔄', label: '聽大家的意見，推出更新' },
          ],
        },
      },
    ],
  },

  {
    id: 'qrcode',
    part: 'adv',
    icon: '🔳',
    title: 'QR Code 怎麼運作？',
    en: 'How QR Codes Work',
    desc: '格子是位元、三個定位方塊、破了也能讀',
    color: '#343a40',
    added: '2026-10-20',
    slides: [
      {
        title: '三個大方框',
        text: `相機看到 QR Code，會先找三個角上的${t('定位方塊', 'finder pattern')}。有了它們，就知道 QR Code 在哪裡、哪一邊朝上，拿歪了也能讀。點點看！`,
        widget: 'qrfinder',
      },
      {
        title: '黑格子是 1，白格子是 0',
        text: `QR Code 的每個小格子就是一個${t('位元', 'bit')}：黑色是 1，白色是 0。8 個格子合成一個${t('位元組', 'byte')}，可以代表一個字母。塗塗看！`,
        widget: 'qrbits',
      },
      {
        title: '破了一角還能掃',
        text: `QR Code 裡多存了一些備份的資料，叫做${t('錯誤更正', 'error correction')}。髒了、破了一部分，還是能算回來；備份最多的 QR Code，大約能救回 30%。試試看！`,
        widget: 'qrdamage',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: 'QR Code 破了一小角，為什麼還掃得到？',
          options: [
            { text: '🧩 裡面多存了備份資料，可以算回來', correct: true },
            { text: '📷 相機會自己猜網址' },
            { text: '🔦 手機的燈把破掉的地方照亮了' },
          ],
          explain: '這叫錯誤更正。QR Code 多存了一些備份資料；備份最多的，破掉大約 30% 以內都能算回來；可是三個大方框要看得到。',
        },
      },
    ],
  },

  {
    id: 'clock',
    part: 'adv',
    icon: '⏰',
    title: '電腦怎麼記住時間？',
    en: 'How Computers Keep Time',
    desc: '石英震動、網路對時、時區',
    color: '#a65400',
    added: '2026-10-20',
    slides: [
      {
        title: '石英一秒震 32768 次',
        text: `電腦裡有一小片${t('石英', 'quartz')}，通電後每秒剛好震動 32768 次。計數器數滿 32768，就是 1 秒。關機時，有一顆小電池讓它繼續數。切換速度看看！`,
        widget: 'quartz',
      },
      {
        title: '上網對時間',
        text: `石英不是完美的，時間久了會快一點或慢一點。所以手機和電腦會${t('上網對時', 'network time sync')}，問有${t('原子鐘', 'atomic clock')}的時間伺服器：現在幾點？試試看！`,
        widget: 'ntpsync',
      },
      {
        title: '時區',
        text: "地球圓圓的在自轉，太陽只能照到一半。轉動地球儀，看看當台北是陽光明媚的中午時，世界的另一邊正在做什麼！",
        widget: "globetime",
        params: {},
        added: '2026-10-24',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '坐飛機到日本，下飛機打開手機，時間自己變成日本時間了。為什麼？',
          options: [
            { text: '📶 手機連上當地的網路，自動換成當地時區', correct: true },
            { text: '💎 手機裡的石英在日本震得比較快' },
            { text: '✈️ 飛機上的時鐘幫手機改的' },
          ],
          explain: '手機從當地的網路知道自己在哪個時區，再上網對時，所以一下飛機時間就對了。',
        },
      },
    ],
  },

  {
    id: 'gpsmath',
    part: 'adv',
    icon: '🛰️',
    title: 'GPS 怎麼算出位置？',
    en: 'How GPS Finds You',
    desc: '用時間算距離、三個圓找交點、第四顆對時鐘',
    color: '#1b5e9e',
    added: '2026-10-20',
    slides: [
      {
        title: '用時間算距離',
        text: `每顆${t('GPS 衛星', 'GPS satellite')}上都有很準的${t('原子鐘', 'atomic clock')}，訊號裡寫著發出的時間。訊號用${t('光速', 'speed of light')}飛，一秒 30 萬公里，所以晚多久收到，就知道離多遠。找出最近的衛星！`,
        widget: 'sigtime',
      },
      {
        title: '三個圓找交點',
        text: `知道離一顆衛星多遠，你就在一個圓上。兩個圓會交在兩個點，第三個圓只經過其中一點，那就是你在的地方。這叫${t('三邊定位', 'trilateration')}。點點看！`,
        widget: 'trilat',
      },
      {
        title: '為什麼要第 4 顆？',
        text: `手機的時鐘沒有原子鐘準。差 0.001 秒，距離就差 300 公里！所以手機要再收第 4 顆衛星，把自己的${t('時鐘誤差', 'clock error')}算出來。你來調調看！`,
        widget: 'fourthsat',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '在哪裡，手機最難收到 GPS 衛星的訊號？',
          options: [
            { text: '🅿️ 地下停車場', correct: true },
            { text: '🏞️ 空曠的公園' },
            { text: '🏖️ 海邊，手機沒有網路' },
          ],
          explain: 'GPS 訊號從天上來，穿不過厚厚的水泥和土，所以在地下室、隧道裡收不到。GPS 不用網路，在海邊、山上也能用。',
        },
      },
    ],
  },

  {
    id: 'robocar',
    part: 'adv',
    icon: '🚗',
    title: '機器人和自動駕駛怎麼看路？',
    en: 'How Robots and Self-Driving Cars See',
    desc: '感測、判斷、行動；鏡頭、雷達、光達',
    color: '#0f766e',
    added: '2026-10-20',
    slides: [
      {
        title: '感測、判斷、行動',
        text: `自動駕駛車和機器人都照三個步驟做事：${t('感測', 'sense')}、${t('判斷', 'think')}、${t('行動', 'act')}。而且一秒鐘就重複很多次。排排看！`,
        widget: 'senseloop',
        params: {
          items: [
            { icon: '📷', label: '鏡頭看到前面有人' },
            { icon: '🧠', label: '電腦判斷：要停下來' },
            { icon: '🛑', label: '踩煞車' },
            { icon: '🔁', label: '再看一次，一直重複' },
          ],
        },
      },
      {
        title: '不一樣的眼睛',
        text: `自動駕駛車有好幾種眼睛：${t('鏡頭', 'camera')}看顏色，${t('雷達', 'radar')}用電波量距離，${t('光達', 'lidar')}用雷射光畫出形狀。每種都看看，再起霧試試！`,
        widget: 'carsensors',
      },
      {
        title: '掃地機器人怎麼不迷路？',
        text: `${t('掃地機器人', 'robot vacuum')}一邊走，一邊記下哪裡有沙發、牆，慢慢畫出家裡的${t('地圖', 'map')}。底下還有${t('懸崖感測器', 'cliff sensor')}，不會掉下樓梯。試試看！`,
        widget: 'vacuum',
      },
      {
        title: '考考你',
        widget: 'choice',
        params: {
          question: '自動駕駛車遇到哪一種情況，最需要人來幫忙？',
          options: [
            { text: '👮 警察站在路口，用手勢指揮交通', correct: true },
            { text: '🚗 前面的車慢下來' },
            { text: '🔴 前面的紅綠燈變紅燈' },
          ],
          explain: '很少見的情況，像施工改道、警察的手勢、被貼紙蓋住的路標，AI 沒學過就可能看錯，所以還需要人注意。',
        },
      },
    ],
  },
];

// Home screen sections, in order.
export const PARTS = [
  { id: 'basic', title: '第一部：認識和使用', en: 'Part 1 · Using Devices', desc: '先學會用：操作、充電、拍照、檔案、上網、帳號和 App。' },
  { id: 'adv', title: '第二部：原理探索', en: 'Part 2 · How It Works', desc: '再看裡面：0 和 1、螢幕、儲存、網路、加密和寫程式。' },
];

// Stages: small groups of units, each about one sitting. Units keep their UNITS order;
// a stage lists its units by id, and every unit must be in exactly one stage (a unit
// in no stage does not show on the home screen).
export const STAGES = [
  { id: 'hello', part: 'basic', icon: '👋', title: '上手', en: 'First Steps', units: ['devices', 'start', 'typing', 'settings'] },
  { id: 'care', part: 'basic', icon: '🔋', title: '照顧裝置和自己', en: 'Care for Devices and You', units: ['cables', 'battery', 'care', 'ewaste', 'health'] },
  { id: 'media', part: 'basic', icon: '📷', title: '拍照和檔案', en: 'Photos and Files', units: ['camera', 'files', 'space', 'formats'] },
  { id: 'net', part: 'basic', icon: '🌐', title: '上網', en: 'Going Online', units: ['online', 'wireless', 'browser', 'account', 'passkey'] },
  { id: 'apps', part: 'basic', icon: '📲', title: '用 App', en: 'Using Apps', units: ['appbasics', 'apps', 'handy', 'maps', 'pay'] },
  { id: 'helpers', part: 'basic', icon: '🤖', title: 'AI 小幫手', en: 'AI Helpers', units: ['aichat', 'voice'] },
  { id: 'create', part: 'basic', icon: '🎨', title: '創作和分享', en: 'Creating and Sharing', units: ['ailabel', 'copyright', 'shareddoc', 'photoshare'] },
  { id: 'safe', part: 'basic', icon: '🛡️', title: '安全上網', en: 'Staying Safe Online', units: ['safety', 'wifishop', 'hacked'] },
  { id: 'protect', part: 'basic', icon: '🤝', title: '保護自己', en: 'Protecting Yourself', units: ['fakes', 'kind', 'sos'] },
  { id: 'smart', part: 'basic', icon: '🧭', title: '聰明的數位生活', en: 'Smart Digital Life', units: ['search', 'footprint', 'subscribe', 'wearable'] },
  { id: 'inside', part: 'adv', icon: '🧠', title: '電腦裡面', en: 'Inside the Computer', units: ['inside', 'logic', 'adder', 'os'] },
  { id: 'data', part: 'adv', icon: '🖼️', title: '螢幕和資料', en: 'Screens and Data', units: ['screens', 'storage', 'soundvideo', 'biometric'] },
  { id: 'ai', part: 'adv', icon: '⚡', title: 'GPU 和 AI', en: 'GPUs and AI', units: ['gpu', 'ailearn'] },
  { id: 'ainet', part: 'adv', icon: '🔗', title: '網路怎麼運作', en: 'How Networks Work', units: ['internet', 'networld', 'web', 'iot'] },
  { id: 'security', part: 'adv', icon: '🛡️', title: '駭客怎麼攻擊？', en: 'How Attackers Think', units: ['attackers', 'passwordattacks', 'networkattacks', 'malwareholes'] },
  { id: 'code', part: 'adv', icon: '🧩', title: '演算法和程式', en: 'Algorithms and Code', units: ['algo', 'recommend', 'freeapps', 'coding'] },
  { id: 'secret', part: 'adv', icon: '🔬', title: '生活科技的祕密', en: 'Secrets of Everyday Tech', units: ['qrcode', 'clock', 'gpsmath', 'robocar'] },
];

// Shown greyed out on the home screen until the unit is written.
export const COMING = [];
