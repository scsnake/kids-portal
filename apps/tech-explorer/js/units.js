// Lesson content. Each unit is a list of slides; a slide has a title, a short text and either
// a static `art` (HTML) or a `widget` (an interaction from widgets.js) with its params.
// Keep each text to two or three short sentences: a child reads it in one breath.

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
        text: `${t('電腦', 'computer')}是一台很聽話、又超級快的機器。它只會做三件事：<b>收到</b>、<b>想一想</b>、<b>送出去</b>。`,
        art: '<div class="art-row"><span>👀</span><span class="art-arrow">→</span><span>🧠</span><span class="art-arrow">→</span><span>📣</span></div>',
      },
      {
        title: '桌機和筆電',
        text: `${t('桌上型電腦', 'desktop')}的${t('主機', 'tower')}、螢幕和鍵盤是分開的，放在固定的桌上，要插電才能用。${t('筆記型電腦', 'laptop')}把它們合在一起，有電池和${t('觸控板', 'trackpad')}，可以帶著走。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'desk', icon: '🖥️', label: '桌上型電腦', en: 'desktop' },
            { id: 'lap', icon: '💻', label: '筆記型電腦', en: 'laptop' },
          ],
          items: [
            { icon: '🔌', label: '一定要插電才能用', bin: 'desk' },
            { icon: '🔧', label: '容易換零件、升級', bin: 'desk' },
            { icon: '🏠', label: '適合放在家裡固定的書桌', bin: 'desk' },
            { icon: '🔋', label: '有電池，可以帶去上課', bin: 'lap' },
            { icon: '👆', label: '鍵盤下面有觸控板', bin: 'lap' },
            { icon: '😴', label: '闔上蓋子就進入睡眠', bin: 'lap' },
          ],
        },
      },
      {
        title: '口袋裡的電腦',
        text: `${t('手機', 'phone')}和${t('平板', 'tablet')}其實就是小電腦，一樣會輸入、處理、輸出，只是多了一顆${t('電池', 'battery')}，可以帶著走。`,
        art: '<div class="art-row"><span>📱</span><span class="art-eq">=</span><span>💻</span><span class="art-eq">+</span><span>🔋</span></div>',
      },
      {
        title: '輸入 → 處理 → 輸出',
        text: `你按鍵盤是${t('輸入', 'input')}，電腦的大腦算一算是${t('處理', 'process')}，螢幕顯示出來是${t('輸出', 'output')}。按按看！`,
        widget: 'keys',
        params: { keys: ['A', 'B', 'C', 'D', 'E', 'F'], goal: 4 },
      },
      {
        title: '輸入還是輸出？',
        text: `把東西送進電腦的叫${t('輸入裝置', 'input device')}，把結果送出來給我們的叫${t('輸出裝置', 'output device')}。分分看！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'in', icon: '📥', label: '輸入（送進去）', en: 'input' },
            { id: 'out', icon: '📤', label: '輸出（送出來）', en: 'output' },
          ],
          items: [
            { icon: '⌨️', label: '鍵盤', en: 'keyboard', bin: 'in' },
            { icon: '🖱️', label: '滑鼠', en: 'mouse', bin: 'in' },
            { icon: '🎙️', label: '麥克風', en: 'microphone', bin: 'in' },
            { icon: '📷', label: '相機', en: 'camera', bin: 'in' },
            { icon: '🖥️', label: '螢幕', en: 'screen', bin: 'out' },
            { icon: '🔊', label: '喇叭', en: 'speaker', bin: 'out' },
            { icon: '🖨️', label: '印表機', en: 'printer', bin: 'out' },
            { icon: '🎧', label: '耳機', en: 'headphones', bin: 'out' },
          ],
        },
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
        text: '電池裡裝了很多能量，用錯方法可能會過熱，甚至起火。分分看哪些是安全的做法！',
        widget: 'sort',
        params: {
          rest: 'safe',
          bins: [
            { id: 'safe', icon: '✅', label: '安全' },
            { id: 'danger', icon: '⚠️', label: '危險' },
          ],
          items: [
            { icon: '🏷️', label: '用有「商品安全標章」的充電器', bin: 'safe' },
            { icon: '🪵', label: '放在硬硬的桌面上充電', bin: 'safe' },
            { icon: '🧳', label: '搭飛機時，行動電源放隨身包包', bin: 'safe' },
            { icon: '🛏️', label: '充電時蓋在棉被或枕頭下', bin: 'danger' },
            { icon: '🩹', label: '線破皮了還繼續用', bin: 'danger' },
            { icon: '💧', label: '手濕濕的去拔插頭', bin: 'danger' },
          ],
        },
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
            { icon: '🔑', label: '隨身碟', en: 'USB drive', bin: 'no' },
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
        text: `登入或付錢時，手機常會收到一組${t('驗證碼', 'verification code')}。它就像一次性的鑰匙，有了它，別人就能登入你的帳號或付錢。真正的客服不會跟你要驗證碼。`,
        widget: 'choice',
        params: {
          question: '網友說：「我的驗證碼不小心傳到你手機了，可以唸給我聽嗎？」你會怎麼做？',
          options: [
            { text: '🙅 不給他，告訴大人', correct: true },
            { text: '📱 唸給他聽，幫個忙' },
            { text: '🔢 只給他前面三個數字' },
          ],
          explain: '這是很常見的騙法。驗證碼就是你的鑰匙，誰都不能給，包括說自己是客服的人。',
        },
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
        text: '電腦裡面也有分工。把每個零件拖到它的工作。',
        widget: 'sort',
        params: {
          bins: [
            { id: 'cpu', icon: '🧠', label: '負責思考的大腦' },
            { id: 'ram', icon: '🗒️', label: '正在用的書桌' },
            { id: 'disk', icon: '📚', label: '收東西的書櫃' },
          ],
          items: [
            { icon: '🔲', label: '處理器', en: 'CPU', bin: 'cpu' },
            { icon: '📏', label: '記憶體', en: 'RAM', bin: 'ram' },
            { icon: '💽', label: '硬碟', en: 'hard drive', bin: 'disk' },
          ],
        },
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
        text: `一個 0 或 1 叫一個${t('位元', 'bit')}，8 個位元合起來叫一個${t('位元組', 'byte')}，大約能存一個英文字母。網速用小寫 b（位元），檔案大小用大寫 B（位元組），兩個差 8 倍。`,
        widget: 'choice',
        params: {
          question: '網速 80 Mbps，一秒大約能下載多少 MB？',
          options: [
            { text: '📦 10 MB（80 ÷ 8）', correct: true },
            { text: '📦 80 MB' },
            { text: '📦 640 MB' },
          ],
          explain: 'Mbps 算的是位元，MB 算的是位元組。8 個位元才是 1 個位元組，所以要除以 8。',
        },
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
        text: `手機身上有很多${t('感測器', 'sensor')}，像是它的眼睛、耳朵。把每個感測器拖到它的工作。`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'see', icon: '👀', label: '看東西' },
            { id: 'hear', icon: '👂', label: '聽聲音' },
            { id: 'where', icon: '🗺️', label: '知道自己在哪裡' },
            { id: 'turn', icon: '🔄', label: '知道被轉向了' },
          ],
          items: [
            { icon: '📷', label: '相機', en: 'camera', bin: 'see' },
            { icon: '🎙️', label: '麥克風', en: 'microphone', bin: 'hear' },
            { icon: '🛰️', label: '定位', en: 'GPS', bin: 'where' },
            { icon: '🧭', label: '陀螺儀', en: 'gyroscope', bin: 'turn' },
          ],
        },
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
        text: `${t('印表機', 'printer')}的噴頭一行一行來回跑，在對的地方噴上小墨點。先畫一張圖，再按「列印」。`,
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
        text: `傳統${t('硬碟', 'hard disk')}裡面有一片很快轉動的圓盤，用超小的${t('磁鐵', 'magnet')}記錄 0 和 1。它很怕摔。`,
        art: '<div class="platter"><div class="platter-disc"></div><div class="platter-arm"></div></div>',
      },
      {
        title: '隨身碟和 SSD：不會動',
        text: `${t('隨身碟', 'USB flash drive')}和${t('固態硬碟', 'SSD')}用好多小格子把電子關起來，記錄 0 和 1。沒有會動的零件，所以更快、也比較不怕摔。`,
        art: '<div class="cells" aria-hidden="true">' + '<i></i>'.repeat(24) + '</div>',
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
            { icon: '🔑', label: '隨身碟', en: 'USB flash drive', bin: 'local' },
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
            { text: '🔑 隨身碟', correct: true },
            { text: '🗒️ 記憶體' },
            { text: '🖨️ 印表機' },
          ],
          explain: '隨身碟小小的、可以帶著走，拔下來東西也不會不見。記憶體一關機就清空了。',
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
        text: `${t('CPU 中央處理器', 'Central Processing Unit')}像幾位很厲害的大廚，每一位叫做一個${t('核心', 'core')}。什麼菜都會做，可是人數不多，一次只能做幾件事。`,
        art: '<div class="art-row"><span>👨‍🍳</span><span>👩‍🍳</span><span>👨‍🍳</span><span>👩‍🍳</span></div>',
      },
      {
        title: 'GPU：一大群小幫手',
        text: `${t('GPU 圖形處理器', 'Graphics Processing Unit')}有幾千個小幫手。每個只會做簡單的事，但是可以同時一起做，這叫做${t('平行運算', 'parallel computing')}。`,
        art: '<div class="ants" aria-hidden="true">' + '<span>🐜</span>'.repeat(40) + '</div>',
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
        text: `${t('人工智慧', 'AI, Artificial Intelligence')}學東西時，要做超多超多次簡單的計算。很多小幫手一起算最快，所以 AI 大多用 GPU 來${t('訓練', 'train')}。`,
        art: '<div class="art-row"><span>🤖</span><span class="art-heart">❤️</span><span>🐜🐜🐜</span></div>',
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
        text: `就像寄信要寫地址，網路上每台裝置都有一個地址，叫做${t('IP 位址', 'IP address')}。把信送到對的地址！`,
        widget: 'sort',
        params: {
          bins: [
            { id: 'a', icon: '🏠', label: '10.0.0.1' },
            { id: 'b', icon: '🏫', label: '10.0.0.2' },
            { id: 'c', icon: '🏥', label: '10.0.0.3' },
          ],
          items: [
            { icon: '✉️', label: '寄到 10.0.0.2', bin: 'b' },
            { icon: '✉️', label: '寄到 10.0.0.3', bin: 'c' },
            { icon: '✉️', label: '寄到 10.0.0.1', bin: 'a' },
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
        text: `${t('路由器', 'router')}會看封包上的 IP 位址，決定下一步往哪條路送。封包經過一台又一台路由器，最後才到達目的地。家裡的 Wi-Fi 分享器裡面，也有一台小路由器。`,
        art: '<div class="art-row"><span>📦</span><span class="art-arrow">→</span><span>📡</span><span class="art-arrow">→</span><span>📡</span><span class="art-arrow">→</span><span>💻</span></div>',
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
        text: `網址的英文叫 ${t('URL', 'Uniform Resource Locator')}，就像網路上的地址。它可以分成三段，點每一段看看它的意思！`,
        widget: 'url',
      },
      {
        title: 'DNS：網路的通訊錄',
        text: `電腦其實是用 IP 位址找到彼此。${t('DNS', 'Domain Name System')} 就像手機的通訊錄，把好記的網址換成 IP 位址。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '⌨️', label: '你輸入網址 kids.example.tw' },
            { icon: '📒', label: 'DNS 查通訊錄，找到 IP 位址' },
            { icon: '📨', label: '平板連到那個 IP 位址的伺服器' },
            { icon: '📄', label: '伺服器把網頁傳回來' },
          ],
        },
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
        text: `https 用一套叫 ${t('TLS', 'Transport Layer Security')} 的規則來上鎖。開始傳資料前，瀏覽器和網站會先${t('握手', 'handshake')}：檢查網站的${t('憑證', 'certificate')}（像身分證），再約好一把只有雙方知道的鑰匙。依順序點一點。`,
        widget: 'order',
        params: {
          items: [
            { icon: '👋', label: '瀏覽器：你好，我想安全連線' },
            { icon: '🪪', label: '網站拿出憑證（身分證）' },
            { icon: '🔍', label: '瀏覽器檢查憑證是真的' },
            { icon: '🔑', label: '雙方約好一把祕密鑰匙' },
            { icon: '🔒', label: '用鑰匙加密，開始傳資料' },
          ],
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
        text: `每次都猜中間，再依照「大一點」或「小一點」刪掉一半，叫做${t('二分搜尋', 'binary search')}。想一個數字，讓電腦來猜！`,
        widget: 'guess',
        params: { max: 64 },
      },
      {
        title: '把東西排好',
        text: `把東西從小排到大，叫做${t('排序', 'sorting')}。電腦一次只比較兩個，順序不對就交換。按 ⇄ 交換相鄰的卡片，把數字排好！`,
        widget: 'swapsort',
        params: { nums: [1, 3, 4, 6, 8, 9] },
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
        text: `App 會看情況做不同的事，這叫${t('條件判斷', 'if-then')}。App 也會一直${t('重複', 'loop')}檢查：時間到了沒？有沒有人按按鈕？`,
        widget: 'choice',
        params: {
          question: '鬧鐘 App 的程式：「如果時間到了 7:00，就……」接下來應該是什麼？',
          options: [
            { text: '⏰ 響鈴', correct: true },
            { text: '📴 關機' },
            { text: '🗑️ 刪掉照片' },
          ],
          explain: '寫程式的人要把每一種情況想清楚，告訴電腦「如果怎樣，就做什麼」。',
        },
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
];

// Home screen sections, in order.
export const PARTS = [
  { id: 'basic', title: '第一部：認識和使用', en: 'Part 1 · Using Devices', desc: '先學會用：操作、充電、拍照、檔案、上網、帳號和 App。' },
  { id: 'adv', title: '第二部：原理探索', en: 'Part 2 · How It Works', desc: '再看裡面：0 和 1、螢幕、儲存、網路、加密和寫程式。' },
];

// Shown greyed out on the home screen until the unit is written.
export const COMING = [];
