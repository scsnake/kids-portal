import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Mic,
  MicOff,
  BookOpen,
  RotateCcw,
  Lightbulb,
  Download,
  CheckCircle2,
  AlertTriangle,
  History,
  Target,
  X
} from 'lucide-react';
import { countWords, sumCounts, goalProgress } from './wordcount.js';
import { createStore, defaultDoc, docKey } from './storage.js';

const store = createStore();

// How often an automatic snapshot is taken while the kid keeps writing.
const AUTO_SNAPSHOT_MS = 2 * 60 * 1000;

const TEXT = {
  zh: {
    appName: '小小作家',
    htmlLang: 'zh-Hant-TW',
    locale: 'zh-TW',
    speechLang: 'zh-TW',
    otherLang: 'English',
    savedAt: (when) => `已自動儲存 ${when}`,
    autosaveHint: '內容會自動儲存',
    saveFailed: '儲存失敗！請先複製或下載',
    noStorage: '這個瀏覽器不能儲存內容（可能是無痕模式或封鎖了網站資料）。離開前請先「複製全文」或「下載存檔」！',
    history: '歷史版本',
    reset: '清空重寫',
    totalWords: '總字數',
    unit: '字',
    withPunct: (n) => `含標點 ${n}`,
    sectionCount: (c) => `${c.exact} 字 · 含標點 ${c.withPunct}`,
    articleTitle: '作文題目（不算字數）',
    sectionTitle: '段落標題',
    outline: '大綱',
    outlinePlaceholder: '這一段打算寫什麼？（寫作大綱，不算字數）',
    newSectionTitle: '新段落',
    newSectionPlaceholder: '寫點新的東西...',
    addSection: '新增段落',
    moveUp: '上移',
    moveDown: '下移',
    deleteSection: '刪除段落',
    voice: '語音',
    stop: '停止',
    copy: '複製',
    copyAll: '複製全文',
    download: '下載存檔',
    copied: '已複製到剪貼簿！',
    copyFailed: '無法複製',
    downloaded: '文章已下載！',
    defaultFileName: '我的文章',
    needOneSection: '至少需要保留一個段落！',
    confirmDelete: '確定要刪除這個段落嗎？',
    sectionDeleted: '已刪除段落',
    confirmReset: '確定要清空所有內容重新開始嗎？\n（清空前會自動備份，可以從「歷史版本」找回）',
    articleReset: '已清空文章',
    undo: '復原',
    undone: '已復原',
    listening: '正在聆聽... 請清楚說話！',
    voiceUnsupported: '此瀏覽器不支援語音輸入。',
    micError: '麥克風錯誤，請檢查權限。',
    voiceError: '語音輸入中斷了，請再試一次。',
    close: '關閉',
    statsTitle: '字數統計與目標',
    exactLabel: '字數（不含標點）',
    punctLabel: '含標點符號',
    breakdown: { han: '國字', zhuyin: '注音', latin: '英文單字', number: '數字', punct: '標點符號' },
    perSection: '各段字數',
    goalTitle: '目標字數',
    goalHint: '老師規定幾個字？設定後，上方會顯示還差多少字。',
    goalMin: '至少',
    goalMax: '最多（可不填）',
    goalPunct: '標點符號也算字數',
    goalClear: '取消目標',
    goal: {
      below: (g) => `目標 ${g.min} 字，還差 ${g.diff} 字`,
      done: (g) => (g.max ? `${g.min}–${g.max} 字，剛剛好！🎉` : `達成目標 ${g.min} 字！🎉`),
      room: (g) => `上限 ${g.max} 字，還可以寫 ${g.diff} 字`,
      over: (g) => `超過上限 ${g.max} 字，多了 ${g.diff} 字`
    },
    historyNote: '寫作時每幾分鐘會自動備份一次；清空、刪除段落或還原之前也會先備份。備份存在這台裝置的瀏覽器裡。',
    historyEmpty: '還沒有備份。開始寫作後，這裡會出現自動備份。',
    reasons: { auto: '自動備份', reset: '清空前', delete: '刪除段落前', restore: '還原前' },
    untitled: '（沒有題目）',
    restore: '還原',
    confirmRestore: '要還原成這個版本嗎？\n（目前的內容會先備份起來）',
    restored: '已還原到選擇的版本'
  },
  en: {
    appName: 'Little Writer',
    htmlLang: 'en',
    locale: 'en-US',
    speechLang: 'en-US',
    otherLang: '中文',
    savedAt: (when) => `Auto-saved ${when}`,
    autosaveHint: 'Your writing saves automatically',
    saveFailed: 'Not saved! Copy or download first',
    noStorage: 'This browser cannot save your writing (private mode or blocked site data?). Use "Copy All" or "Download" before leaving!',
    history: 'History',
    reset: 'Start Over',
    totalWords: 'Total words',
    unit: 'words',
    withPunct: (n) => `${n} w/ punct.`,
    sectionCount: (c) => `${c.exact} words · ${c.withPunct} w/ punct.`,
    articleTitle: 'Title (not counted)',
    sectionTitle: 'Section Title',
    outline: 'Outline',
    outlinePlaceholder: 'What is this section about? (Outline, not counted)',
    newSectionTitle: 'New Section',
    newSectionPlaceholder: 'Write something new...',
    addSection: 'Add Section',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    deleteSection: 'Delete Section',
    voice: 'Voice',
    stop: 'Stop',
    copy: 'Copy',
    copyAll: 'Copy All',
    download: 'Download',
    copied: 'Copied to clipboard!',
    copyFailed: 'Unable to copy',
    downloaded: 'File downloaded!',
    defaultFileName: 'My_Article',
    needOneSection: 'You need at least one section!',
    confirmDelete: 'Are you sure you want to delete this section?',
    sectionDeleted: 'Section deleted',
    confirmReset: 'Clear everything and start over?\n(A backup is saved first — find it under "History")',
    articleReset: 'Article cleared',
    undo: 'Undo',
    undone: 'Undone',
    listening: 'Listening... Speak clearly!',
    voiceUnsupported: 'Voice typing is not supported in this browser.',
    micError: 'Microphone error. Check permissions.',
    voiceError: 'Voice typing stopped. Please try again.',
    close: 'Close',
    statsTitle: 'Word Count & Goal',
    exactLabel: 'Words',
    punctLabel: 'With punctuation',
    breakdown: { han: 'Chinese', zhuyin: 'Zhuyin', latin: 'Words', number: 'Numbers', punct: 'Punctuation' },
    perSection: 'Words per section',
    goalTitle: 'Word goal',
    goalHint: 'How many words does your teacher want? The bar at the top shows how close you are.',
    goalMin: 'At least',
    goalMax: 'At most (optional)',
    goalPunct: 'Count punctuation too',
    goalClear: 'Remove goal',
    goal: {
      below: (g) => `Goal ${g.min} — ${g.diff} more to go`,
      done: (g) => (g.max ? `${g.min}–${g.max} words — just right! 🎉` : `Goal of ${g.min} reached! 🎉`),
      room: (g) => `Limit ${g.max} — ${g.diff} words left`,
      over: (g) => `Over the ${g.max} limit by ${g.diff}`
    },
    historyNote: 'A backup is taken every few minutes while you write, and before Start Over, deleting a section or restoring. Backups live in this device\'s browser.',
    historyEmpty: 'No backups yet. They will appear here once you start writing.',
    reasons: { auto: 'Auto backup', reset: 'Before start over', delete: 'Before delete', restore: 'Before restore' },
    untitled: '(untitled)',
    restore: 'Restore',
    confirmRestore: 'Restore this version?\n(What you have now is backed up first)',
    restored: 'Version restored'
  }
};

// Ask the browser not to evict our storage under pressure (Chrome/Firefox,
// Safari 17+). Once per page load, after the first real save.
let persistenceRequested = false;
function requestPersistentStorage() {
  if (persistenceRequested || !navigator.storage?.persist) return;
  persistenceRequested = true;
  navigator.storage
    .persisted()
    .then((already) => already || navigator.storage.persist())
    .catch(() => {});
}

const formatWhen = (at, locale) => {
  const d = new Date(at);
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return d.toDateString() === new Date().toDateString()
    ? time
    : `${d.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' })} ${time}`;
};

// Accepts half- or full-width digits (iPad Chinese keyboards type ３００).
const parseCount = (v) =>
  Math.min(99999, parseInt(v.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0)).replace(/\D/g, ''), 10) || 0);

const mapSection = (doc, id, fn) => {
  if (!doc.sections.some((s) => s.id === id)) return doc;
  return { ...doc, sections: doc.sections.map((s) => (s.id === id ? fn(s) : s)) };
};

function draftText(doc, t) {
  const parts = doc.sections.map((s) =>
    [s.title, s.summary.trim() && `[${t.outline}: ${s.summary}]`, s.content].filter((l) => l !== '' && l != null).join('\n')
  );
  if (doc.title.trim()) parts.unshift(doc.title.trim());
  return parts.join('\n\n---\n\n');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall back to the selection trick for browsers without the Clipboard API.
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

const handleFocus = (e) => {
  const el = e.target;
  // Wait for the iPad keyboard, then bring the field into view. A tall
  // textarea is only nudged so the caret (which iOS tracks itself) stays put.
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: el.offsetHeight > window.innerHeight / 2 ? 'nearest' : 'center' });
  }, 400);
};

// Textarea that grows with its content. Re-fits on rotation / resize, and
// keeps the page scroll position so the collapse-then-measure step can't
// make the page jump while typing near the bottom.
const AutoTextarea = (props) => {
  const ref = useRef(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const y = window.scrollY;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    if (window.scrollY !== y) window.scrollTo(0, y);
  }, []);

  useLayoutEffect(fit, [props.value, fit]);

  useEffect(() => {
    const timers = [];
    const onResize = () => {
      fit();
      timers.push(setTimeout(fit, 100), setTimeout(fit, 300));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      timers.forEach(clearTimeout);
    };
  }, [fit]);

  return <textarea ref={ref} rows={3} {...props} />;
};

const Modal = ({ title, onClose, closeLabel, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/40 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-700">{title}</h2>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 pb-8">{children}</div>
      </div>
    </div>
  );
};

const GOAL_STYLES = {
  below: { bar: 'bg-amber-400', text: 'text-amber-700' },
  done: { bar: 'bg-green-500', text: 'text-green-700' },
  room: { bar: 'bg-sky-400', text: 'text-sky-700' },
  over: { bar: 'bg-red-500', text: 'text-red-600' }
};

const GoalBar = ({ progress, t, onClick }) => {
  const style = GOAL_STYLES[progress.state];
  return (
    <button onClick={onClick} className="block w-full max-w-3xl mx-auto px-4 pb-3 text-left">
      <div className="flex items-center gap-3">
        <Target size={16} className={`flex-shrink-0 ${style.text}`} />
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${Math.round(Math.min(1, progress.ratio) * 100)}%` }}
          />
        </div>
        <span className={`text-sm font-bold whitespace-nowrap ${style.text}`}>{t.goal[progress.state](progress)}</span>
      </div>
    </button>
  );
};

const NumberField = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 text-slate-600">
    <span className="text-sm font-bold">{label}</span>
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value || ''}
      onChange={(e) => onChange(parseCount(e.target.value))}
      className="w-24 px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-base font-bold text-slate-700"
      placeholder="0"
    />
  </label>
);

const StatsPanel = ({ doc, counts, total, t, onGoalChange }) => {
  const biggest = Math.max(1, ...counts.map((c) => c.exact));
  const { goal } = doc;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-sky-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-sky-700">{total.exact}</div>
          <div className="text-xs font-bold text-sky-600 mt-1">{t.exactLabel}</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-slate-600">{total.withPunct}</div>
          <div className="text-xs font-bold text-slate-500 mt-1">{t.punctLabel}</div>
        </div>
      </div>

      <dl className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
        {Object.entries(t.breakdown).map(([k, label]) => (
          <div key={k} className="bg-slate-50 rounded-xl py-2">
            <dd className="text-lg font-bold text-slate-700">{total[k]}</dd>
            <dt className="text-[11px] font-bold text-slate-500">{label}</dt>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="text-sm font-bold text-slate-500 mb-2">{t.perSection}</h3>
        <ul className="space-y-2">
          {doc.sections.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span className="w-24 truncate text-slate-600">{s.title || `#${i + 1}`}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(counts[i].exact / biggest) * 100}%` }} />
              </div>
              <span className="w-12 text-right font-bold text-slate-600">{counts[i].exact}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-3">
        <h3 className="flex items-center gap-2 font-bold text-slate-700">
          <Target size={18} className="text-amber-500" />
          {t.goalTitle}
        </h3>
        <p className="text-sm text-slate-500">{t.goalHint}</p>
        <div className="flex flex-wrap gap-4">
          <NumberField label={t.goalMin} value={goal.min} onChange={(min) => onGoalChange({ ...goal, min })} />
          <NumberField label={t.goalMax} value={goal.max} onChange={(max) => onGoalChange({ ...goal, max })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={goal.punct}
            onChange={(e) => onGoalChange({ ...goal, punct: e.target.checked })}
            className="w-5 h-5 accent-sky-500"
          />
          {t.goalPunct}
        </label>
        {(goal.min > 0 || goal.max > 0) && (
          <button
            onClick={() => onGoalChange({ min: 0, max: 0, punct: goal.punct })}
            className="text-sm font-bold text-slate-400 hover:text-red-500"
          >
            {t.goalClear}
          </button>
        )}
      </div>
    </div>
  );
};

const HistoryPanel = ({ lang, t, onRestore }) => {
  const [entries] = useState(() => store.loadHistory(lang));
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{t.historyNote}</p>
      {entries.length === 0 ? (
        <p className="text-center text-slate-400 py-8">{t.historyEmpty}</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e, i) => {
            const words = sumCounts(e.doc.sections.map((s) => countWords(s.content))).exact;
            const preview = e.doc.sections.map((s) => s.content.trim()).find(Boolean) || '';
            return (
              <li key={`${e.at}-${i}`} className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-slate-600">{formatWhen(e.at, t.locale)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        e.reason === 'auto' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.reasons[e.reason] || e.reason}
                    </span>
                    <span className="text-sky-600">
                      {words} {t.unit}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 truncate mt-1">{e.doc.title || t.untitled}</div>
                  <div className="text-sm text-slate-400 truncate">{preview}</div>
                </div>
                <button
                  onClick={() => onRestore(e)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 font-bold text-sm hover:bg-sky-100"
                >
                  {t.restore}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const SectionCard = ({ section, index, total, counts, listening, t, htmlLang, onPatch, onMove, onRemove, onVoice, onCopy }) => (
  <div
    className={`bg-white rounded-3xl shadow-sm border-2 transition-all duration-300 ${
      listening ? 'border-red-400 ring-4 ring-red-100' : 'border-slate-100 hover:border-sky-200'
    }`}
  >
    {/* Section Header Bar */}
    <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50 rounded-t-3xl">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onPatch({ title: e.target.value })}
        onFocus={handleFocus}
        className="bg-transparent font-bold text-slate-600 text-lg focus:outline-none focus:text-sky-600 w-full"
        placeholder={t.sectionTitle}
      />
      <div className="flex items-center gap-1">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="p-2 text-slate-400 hover:text-sky-600 disabled:opacity-30 hover:bg-sky-50 rounded-lg transition-colors"
          title={t.moveUp}
          aria-label={t.moveUp}
        >
          <ArrowUp size={18} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="p-2 text-slate-400 hover:text-sky-600 disabled:opacity-30 hover:bg-sky-50 rounded-lg transition-colors"
          title={t.moveDown}
          aria-label={t.moveDown}
        >
          <ArrowDown size={18} />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-2"></div>
        <button
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title={t.deleteSection}
          aria-label={t.deleteSection}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>

    {/* Editor Area */}
    <div className="p-4 relative">
      {/* Plan/Summary Input */}
      <div className="mb-4 flex items-center gap-2 bg-yellow-50/60 p-2 rounded-xl border border-yellow-100 focus-within:ring-2 focus-within:ring-yellow-200 focus-within:border-yellow-300 transition-all">
        <Lightbulb size={18} className="text-yellow-500 flex-shrink-0 ml-1" />
        <input
          type="text"
          value={section.summary}
          onChange={(e) => onPatch({ summary: e.target.value })}
          onFocus={handleFocus}
          className="w-full bg-transparent border-none text-base text-slate-600 placeholder-yellow-600/50 focus:outline-none"
          placeholder={t.outlinePlaceholder}
        />
      </div>

      <AutoTextarea
        lang={htmlLang}
        value={section.content}
        onChange={(e) => onPatch({ content: e.target.value })}
        onFocus={handleFocus}
        placeholder={section.placeholder}
        className="w-full min-h-[120px] resize-none overflow-hidden focus:outline-none text-slate-700 text-lg leading-relaxed placeholder-slate-300 bg-transparent"
      />

      {/* Action Bar within Section */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">{t.sectionCount(counts)}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={onVoice}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-all ${
              listening ? 'bg-red-500 text-white shadow-md animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            {listening ? t.stop : t.voice}
          </button>

          <button
            onClick={onCopy}
            className="items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 font-bold text-sm hover:bg-sky-100 transition-colors hidden sm:flex"
          >
            <Copy size={16} />
            {t.copy}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TOAST_COLORS = { success: 'bg-green-500', info: 'bg-sky-500', error: 'bg-red-500' };

const App = () => {
  // lang and doc live together so a language switch swaps both atomically.
  const [state, setState] = useState(() => {
    const lang = store.loadLang();
    return { lang, doc: store.loadDoc(lang) };
  });
  const { lang, doc } = state;
  const t = TEXT[lang];

  const latestRef = useRef(state);
  latestRef.current = state;
  // The doc object last written to (or read from) storage.
  const persistedRef = useRef(state.doc);
  // Per language: when this session last took a snapshot. Absent until the
  // first edit of the session.
  const lastSnapshotAtRef = useRef({});
  const [saveStatus, setSaveStatus] = useState({ ok: store.durable, at: state.doc.updatedAt });

  const [panel, setPanel] = useState(null); // 'stats' | 'history'
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [listeningId, setListeningId] = useState(null);
  const recognitionRef = useRef(null);
  const listenTargetRef = useRef(null); // { id, lang } receiving dictation

  // Every edit goes through here. updatedAt only moves forward, which is what
  // lets another tab tell whose copy is newer.
  const editDoc = useCallback((fn) => {
    setState((s) => {
      const next = fn(s.doc);
      if (next === s.doc) return s;
      return { ...s, doc: { ...next, updatedAt: Math.max(Date.now(), s.doc.updatedAt + 1) } };
    });
  }, []);

  const notify = useCallback((msg, type = 'success', action = null) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, type, action });
    toastTimerRef.current = setTimeout(() => setToast(null), action ? 6000 : 3000);
  }, []);

  // --- Save on every change ---
  useEffect(() => {
    const before = persistedRef.current;
    if (doc === before) return;
    persistedRef.current = doc;
    const ok = store.saveDoc(lang, doc);
    setSaveStatus({ ok: ok && store.durable, at: doc.updatedAt });
    if (!ok) return;
    requestPersistentStorage();
    const now = Date.now();
    const last = lastSnapshotAtRef.current[lang];
    if (last === undefined) {
      // First edit this session: back up what was there when the app opened.
      store.addSnapshot(lang, before, 'auto', now);
      lastSnapshotAtRef.current[lang] = now;
    } else if (now - last >= AUTO_SNAPSHOT_MS && store.addSnapshot(lang, doc, 'auto', now)) {
      lastSnapshotAtRef.current[lang] = now;
    }
  }, [lang, doc]);

  // --- Page lifecycle: flush when leaving, pick up newer text from other tabs ---
  useEffect(() => {
    const flush = () => {
      const { lang, doc } = latestRef.current;
      if (doc !== persistedRef.current) {
        persistedRef.current = doc;
        store.saveDoc(lang, doc);
      }
    };
    // A stale tab must never overwrite newer writing from another tab, so
    // adopt whatever is in storage if it's newer than what's on screen.
    const adoptNewer = () => {
      const { lang, doc } = latestRef.current;
      const stored = store.loadDoc(lang);
      if (stored.updatedAt > doc.updatedAt) {
        persistedRef.current = stored;
        setState((s) => (s.lang === lang ? { ...s, doc: stored } : s));
        setSaveStatus({ ok: store.durable, at: stored.updatedAt });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        if (listenTargetRef.current) recognitionRef.current?.stop();
      } else {
        adoptNewer();
      }
    };
    const onStorage = (e) => {
      if (e.key === null || e.key === docKey(latestRef.current.lang)) adoptNewer();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    window.addEventListener('pageshow', adoptNewer);
    window.addEventListener('focus', adoptNewer);
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('pageshow', adoptNewer);
      window.removeEventListener('focus', adoptNewer);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // If saving is broken, at least stop the page from closing silently.
  useEffect(() => {
    if (saveStatus.ok) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [saveStatus.ok]);

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.appName;
  }, [t]);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      }
      finalText = finalText.trim();
      const target = listenTargetRef.current;
      // Ignore late results after a language switch: section ids repeat across languages.
      if (!finalText || !target || target.lang !== latestRef.current.lang) return;
      editDoc((d) =>
        mapSection(d, target.id, (s) => {
          const sep = target.lang === 'en' && s.content && !/\s$/.test(s.content) ? ' ' : '';
          return { ...s, content: s.content + sep + finalText };
        })
      );
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      const tt = TEXT[latestRef.current.lang];
      const denied = ['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error);
      notify(denied ? tt.micError : tt.voiceError, 'error');
    };

    rec.onend = () => {
      listenTargetRef.current = null;
      setListeningId(null);
    };

    recognitionRef.current = rec;
    return () => {
      rec.onend = null;
      rec.abort();
    };
  }, [editDoc, notify]);

  const abortListening = () => {
    listenTargetRef.current = null;
    setListeningId(null);
    recognitionRef.current?.abort();
  };

  const toggleListening = (id) => {
    const rec = recognitionRef.current;
    if (!rec) {
      notify(t.voiceUnsupported, 'error');
      return;
    }
    if (listeningId === id) {
      // stop() still delivers the last words; onend clears the target.
      setListeningId(null);
      rec.stop();
      return;
    }
    if (listeningId !== null) {
      // Already dictating elsewhere: just send the words to this section instead.
      listenTargetRef.current = { id, lang };
      setListeningId(id);
      return;
    }
    rec.lang = t.speechLang;
    try {
      rec.start();
      listenTargetRef.current = { id, lang };
      setListeningId(id);
      notify(t.listening, 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // --- Document actions ---

  const snapshot = (reason) => {
    const now = Date.now();
    if (store.addSnapshot(lang, doc, reason, now)) lastSnapshotAtRef.current[lang] = now;
  };

  const offerUndo = (msg, before) => {
    const forLang = lang;
    notify(msg, 'success', {
      label: t.undo,
      run: () => {
        if (latestRef.current.lang !== forLang) return;
        editDoc(() => before);
        notify(TEXT[forLang].undone);
      }
    });
  };

  const toggleLanguage = () => {
    abortListening();
    setToast(null);
    setPanel(null);
    const next = lang === 'zh' ? 'en' : 'zh';
    const nextDoc = store.loadDoc(next);
    persistedRef.current = nextDoc;
    store.saveLang(next);
    setState({ lang: next, doc: nextDoc });
    setSaveStatus({ ok: store.durable, at: nextDoc.updatedAt });
  };

  const addSection = () => {
    editDoc((d) => ({
      ...d,
      sections: [
        ...d.sections,
        {
          id: Math.max(0, ...d.sections.map((s) => s.id)) + 1,
          title: t.newSectionTitle,
          summary: '',
          content: '',
          placeholder: t.newSectionPlaceholder
        }
      ]
    }));
  };

  const removeSection = (section) => {
    if (doc.sections.length === 1) {
      notify(t.needOneSection, 'error');
      return;
    }
    const hasText = section.content.trim() || section.summary.trim();
    if (hasText && !window.confirm(t.confirmDelete)) return;
    if (listeningId === section.id) abortListening();
    snapshot('delete');
    const before = doc;
    editDoc((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== section.id) }));
    offerUndo(t.sectionDeleted, before);
  };

  const resetAll = () => {
    if (!window.confirm(t.confirmReset)) return;
    abortListening();
    snapshot('reset');
    const before = doc;
    editDoc((d) => ({ ...defaultDoc(lang), goal: d.goal }));
    offerUndo(t.articleReset, before);
  };

  const restoreSnapshot = (entry) => {
    if (!window.confirm(t.confirmRestore)) return;
    abortListening();
    snapshot('restore');
    editDoc(() => entry.doc);
    setPanel(null);
    notify(t.restored);
  };

  const moveSection = (index, delta) => {
    editDoc((d) => {
      const j = index + delta;
      if (j < 0 || j >= d.sections.length) return d;
      const sections = [...d.sections];
      [sections[index], sections[j]] = [sections[j], sections[index]];
      return { ...d, sections };
    });
  };

  const copyAndNotify = async (text) => {
    const ok = await copyText(text);
    notify(ok ? t.copied : t.copyFailed, ok ? 'success' : 'error');
  };

  const downloadFile = () => {
    const name = (doc.title.trim() || t.defaultFileName).replace(/[\\/:*?"<>|]/g, '_');
    const url = URL.createObjectURL(new Blob([draftText(doc, t)], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(t.downloaded);
  };

  // --- Word counts ---
  const counts = useMemo(() => doc.sections.map((s) => countWords(s.content)), [doc.sections]);
  const total = useMemo(() => sumCounts(counts), [counts]);
  const progress = goalProgress(doc.goal, total);
  const closePanel = useCallback(() => setPanel(null), []);

  return (
    <div className="min-h-screen bg-sky-50 font-sans pb-64">
      {/* Notification Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 py-2.5 rounded-full shadow-lg z-[70] flex items-center gap-3 text-white whitespace-nowrap ${
            TOAST_COLORS[toast.type]
          } ${toast.action ? 'pl-6 pr-2' : 'px-6'}`}
        >
          <span>{toast.msg}</span>
          {toast.action && (
            <button
              onClick={toast.action.run}
              className="bg-white/25 hover:bg-white/40 px-3 py-1 rounded-full font-bold transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-sky-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-sky-500 p-2 rounded-xl text-white flex-shrink-0">
              <BookOpen size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-700 leading-none">{t.appName}</h1>
              {saveStatus.ok ? (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                  <CheckCircle2 size={12} className="flex-shrink-0" />
                  <span className="truncate">
                    {saveStatus.at ? t.savedAt(formatWhen(saveStatus.at, t.locale)) : t.autosaveHint}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-red-600 font-bold mt-1">
                  <AlertTriangle size={12} className="flex-shrink-0" />
                  <span className="truncate">{t.saveFailed}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors whitespace-nowrap"
            >
              {t.otherLang}
            </button>

            <button
              onClick={() => setPanel('history')}
              className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
              title={t.history}
              aria-label={t.history}
            >
              <History size={20} />
            </button>

            <button
              onClick={resetAll}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors hidden sm:block"
              title={t.reset}
              aria-label={t.reset}
            >
              <RotateCcw size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Total Word Count — tap for breakdown & goal */}
            <button
              onClick={() => setPanel('stats')}
              className="bg-sky-100 hover:bg-sky-200 transition-colors px-3 py-1.5 rounded-xl flex flex-col items-center min-w-[76px]"
              title={t.statsTitle}
              aria-label={`${t.totalWords} ${total.exact}`}
            >
              <span className="text-sky-800 font-bold text-lg leading-none tracking-tight">
                {total.exact}
                <span className="text-xs ml-0.5">{t.unit}</span>
              </span>
              <span className="text-sky-600 text-[10px] font-bold tracking-wide mt-0.5 whitespace-nowrap">
                {t.withPunct(total.withPunct)}
              </span>
            </button>
          </div>
        </div>
        {progress && <GoalBar progress={progress} t={t} onClick={() => setPanel('stats')} />}
      </header>

      {!store.durable && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-start gap-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl p-3 text-sm font-bold">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            {t.noStorage}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <input
          type="text"
          value={doc.title}
          onChange={(e) => editDoc((d) => ({ ...d, title: e.target.value }))}
          onFocus={handleFocus}
          className="w-full bg-white rounded-3xl shadow-sm border-2 border-slate-100 focus:border-sky-300 px-5 py-4 text-2xl font-bold text-slate-700 text-center placeholder-slate-300 focus:outline-none transition-colors"
          placeholder={t.articleTitle}
        />

        {doc.sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            total={doc.sections.length}
            counts={counts[index]}
            listening={listeningId === section.id}
            t={t}
            htmlLang={t.htmlLang}
            onPatch={(patch) => editDoc((d) => mapSection(d, section.id, (s) => ({ ...s, ...patch })))}
            onMove={(delta) => moveSection(index, delta)}
            onRemove={() => removeSection(section)}
            onVoice={() => toggleListening(section.id)}
            onCopy={() => copyAndNotify(section.content)}
          />
        ))}

        <button
          onClick={addSection}
          className="w-full py-4 border-2 border-dashed border-sky-300 rounded-3xl text-sky-500 font-bold text-lg hover:bg-sky-50 hover:border-sky-400 hover:text-sky-600 transition-all flex items-center justify-center gap-2 group"
        >
          <div className="bg-sky-200 text-white p-1 rounded-full group-hover:bg-sky-500 transition-colors">
            <Plus size={20} />
          </div>
          {t.addSection}
        </button>
      </main>

      {/* Footer / Global Actions */}
      <footer className="fixed left-0 right-0 pointer-events-none z-50 footer-safe">
        <div className="max-w-3xl mx-auto px-4 flex justify-end gap-3">
          <button
            onClick={downloadFile}
            className="pointer-events-auto shadow-lg bg-white border-2 border-slate-200 text-slate-600 px-4 py-3 sm:px-5 sm:py-3 rounded-full font-bold text-sm sm:text-lg hover:bg-slate-50 hover:border-slate-300 transform hover:-translate-y-1 transition-all flex items-center gap-2"
            aria-label={t.download}
          >
            <Download size={20} />
            <span className="hidden sm:inline">{t.download}</span>
          </button>

          <button
            onClick={() => copyAndNotify(draftText(doc, t))}
            className="pointer-events-auto shadow-xl bg-slate-800 text-white px-5 py-3 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-lg hover:bg-slate-900 transform hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <Copy size={20} />
            {t.copyAll}
          </button>
        </div>
      </footer>

      {panel === 'stats' && (
        <Modal title={t.statsTitle} onClose={closePanel} closeLabel={t.close}>
          <StatsPanel
            doc={doc}
            counts={counts}
            total={total}
            t={t}
            onGoalChange={(goal) => editDoc((d) => ({ ...d, goal }))}
          />
        </Modal>
      )}
      {panel === 'history' && (
        <Modal title={t.history} onClose={closePanel} closeLabel={t.close}>
          <HistoryPanel lang={lang} t={t} onRestore={restoreSnapshot} />
        </Modal>
      )}
    </div>
  );
};

export default App;
