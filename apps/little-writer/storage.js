// Persistence for Little Writer.
//
// Each language keeps its own article in localStorage on this app's own
// origin (kids-writer.scsnake.xyz), so leaving the page, rotating the iPad or
// iOS discarding the tab can't wipe it the way the Gemini canvas sandbox did.
// main.js writes on every edit; this module adds:
//   - validation on load, with unreadable data parked in a rescue key rather
//     than overwritten by the next save
//   - a rolling set of snapshots (auto every few minutes, and before reset /
//     delete / restore) so accidents can be rolled back
//   - quota handling that gives up old snapshots before ever failing to save
//     the article itself

const NS = 'littleWriter:v2';
const LANG_KEY = `${NS}:lang`;
const historyKey = (lang) => `${NS}:history:${lang}`;
const rescueKey = (lang) => `${NS}:rescue:${lang}`;
export const docKey = (lang) => `${NS}:doc:${lang}`;

export const LANGS = ['zh', 'en'];
export const MAX_SNAPSHOTS = 30;

const DEFAULT_SECTIONS = {
  zh: [
    ['前言', '在這裡開始你的故事...'],
    ['正文', '發生了什麼事？'],
    ['結語', '結局是如何呢？'],
  ],
  en: [
    ['Introduction', 'Start your story here...'],
    ['Body', 'What happened next?'],
    ['Conclusion', 'How does it end?'],
  ],
};

export function defaultDoc(lang) {
  return {
    title: '',
    goal: { min: 0, max: 0, punct: false },
    sections: DEFAULT_SECTIONS[lang].map(([title, placeholder], i) => ({
      id: i + 1,
      title,
      summary: '',
      content: '',
      placeholder,
    })),
    updatedAt: 0,
  };
}

const text = (v) => (typeof v === 'string' ? v : '');
const wholeNumber = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

// Coerce anything read back from storage into a well-formed doc, or null.
export function normalizeDoc(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections)) return null;
  const items = raw.sections.filter((s) => s && typeof s === 'object');
  const used = new Set();
  let nextId = 1 + Math.max(0, ...items.map((s) => (Number.isInteger(s.id) ? s.id : 0)));
  const sections = items.map((s) => {
    const id = Number.isInteger(s.id) && s.id > 0 && !used.has(s.id) ? s.id : nextId++;
    used.add(id);
    return {
      id,
      title: text(s.title),
      summary: text(s.summary),
      content: text(s.content),
      placeholder: text(s.placeholder),
    };
  });
  if (!sections.length) return null;
  const goal = raw.goal && typeof raw.goal === 'object' ? raw.goal : {};
  return {
    title: text(raw.title),
    goal: { min: wholeNumber(goal.min), max: wholeNumber(goal.max), punct: goal.punct === true },
    sections,
    updatedAt: wholeNumber(raw.updatedAt),
  };
}

// A title alone isn't worth a backup; any outline or body text is.
export const isBlank = (doc) => doc.sections.every((s) => !s.content.trim() && !s.summary.trim());

const contentKey = (doc) =>
  JSON.stringify([doc.title, doc.sections.map((s) => [s.title, s.summary, s.content])]);

// Keep history spread over time. When over the limit, drop the snapshot whose
// removal leaves the smallest gap relative to its age: recent minutes stay
// dense, older days thin out but stay represented. The newest and the oldest
// are always kept, and automatic snapshots go before reset/delete/restore ones.
export function thinHistory(list, max, now) {
  while (list.length > max) {
    let victim = -1;
    for (const autoOnly of [true, false]) {
      let best = Infinity;
      for (let i = 1; i < list.length - 1; i++) {
        if (autoOnly && list[i].reason !== 'auto') continue;
        const score = (list[i - 1].at - list[i + 1].at) / (now - list[i].at + 1);
        if (score < best) {
          best = score;
          victim = i;
        }
      }
      if (victim !== -1) break;
    }
    list.splice(victim === -1 ? list.length - 1 : victim, 1);
  }
  return list;
}

function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
  };
}

function openLocalStorage() {
  try {
    const s = globalThis.localStorage;
    s.getItem(LANG_KEY); // throws when site data is blocked
    return s;
  } catch {
    return null;
  }
}

// `backend` is a Storage-like object; null means none is available, in which
// case we keep working in memory and report `durable: false` so the UI can warn.
export function createStore(backend = openLocalStorage()) {
  const durable = backend != null;
  const storage = backend ?? memoryStorage();

  function loadHistory(lang) {
    try {
      const list = JSON.parse(storage.getItem(historyKey(lang)) || '[]');
      if (!Array.isArray(list)) return [];
      return list
        .map((e) => {
          const doc = e && Number.isFinite(e.at) ? normalizeDoc(e.doc) : null;
          return doc && { at: e.at, reason: typeof e.reason === 'string' ? e.reason : 'auto', doc };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  // Write the list, halving it until it fits. Returns the list actually kept.
  function writeHistory(lang, list) {
    for (;;) {
      try {
        if (list.length) storage.setItem(historyKey(lang), JSON.stringify(list));
        else storage.removeItem(historyKey(lang));
        return list;
      } catch {
        if (!list.length) return list;
        list = list.slice(0, Math.floor(list.length / 2));
      }
    }
  }

  function trimAllHistory(keep) {
    for (const lang of LANGS) {
      const list = loadHistory(lang);
      if (list.length > keep) writeHistory(lang, list.slice(0, keep));
    }
  }

  return {
    durable,

    loadLang() {
      try {
        return storage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh';
      } catch {
        return 'zh';
      }
    },

    saveLang(lang) {
      try {
        storage.setItem(LANG_KEY, lang);
      } catch {
        // not worth failing over
      }
    },

    loadDoc(lang) {
      let raw = null;
      try {
        raw = storage.getItem(docKey(lang));
        if (raw == null) return defaultDoc(lang);
        const doc = normalizeDoc(JSON.parse(raw));
        if (doc) return doc;
      } catch {
        // fall through to rescue
      }
      if (raw != null) {
        try {
          if (storage.getItem(rescueKey(lang)) == null) storage.setItem(rescueKey(lang), raw);
        } catch {
          // nothing more we can do
        }
      }
      return defaultDoc(lang);
    },

    // True when the article is safely written. On quota errors, old snapshots
    // are sacrificed (halved, then down to 3, then all) before giving up.
    saveDoc(lang, doc) {
      const json = JSON.stringify(doc);
      for (const keep of [null, Math.floor(MAX_SNAPSHOTS / 2), 3, 0]) {
        if (keep != null) trimAllHistory(keep);
        try {
          storage.setItem(docKey(lang), json);
          return true;
        } catch {
          // retry with more room
        }
      }
      return false;
    },

    loadHistory,

    newestSnapshotAt(lang) {
      return loadHistory(lang)[0]?.at ?? 0;
    },

    // reason: 'auto' | 'reset' | 'delete' | 'restore'. Blank docs are skipped.
    // If the newest snapshot already holds this exact text, an automatic one is
    // skipped, while a reset/delete/restore relabels it so the history reads
    // "before reset" where the kid will look for it. True if history changed.
    addSnapshot(lang, doc, reason, now = Date.now()) {
      if (isBlank(doc)) return false;
      const list = loadHistory(lang);
      if (list[0] && contentKey(list[0].doc) === contentKey(doc)) {
        if (reason === 'auto') return false;
        list.shift();
      }
      list.unshift({ at: now, reason, doc });
      const kept = writeHistory(lang, thinHistory(list, MAX_SNAPSHOTS, now));
      return kept.length > 0 && kept[0].at === now;
    },
  };
}
