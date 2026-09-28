// Word counting for kids' compositions (zh-TW and English).
//
// One pass over the text; every character lands in at most one bucket:
//   han    – each 國字 counts as one
//   zhuyin – each 注音 syllable (ㄍㄠˋ) counts as one, like the 國字 it stands for
//   latin  – each English word counts as one; don’t / well-known / 5th are one word
//   number – each number counts as one (2024, 3.14, 1,000, 10:30)
//   punct  – punctuation and symbols (，。！？、「」… and emoji)
// Whitespace is ignored. exact = han + zhuyin + latin + number; withPunct adds punct.

const WORD_CHAR = '[\\p{Script=Latin}\\p{Script=Greek}\\p{Script=Cyrillic}\\p{Nd}\\p{M}]';

const TOKEN = new RegExp(
  [
    '(\\p{Script=Han}|\\p{Script=Hiragana}|\\p{Script=Katakana}|\\p{Script=Hangul})',
    // Bopomofo + extended, and the tone marks ˊ ˇ ˋ ˙
    '([\\u3105-\\u312F\\u31A0-\\u31BF\\u02CA\\u02C7\\u02CB\\u02D9]+)',
    // Apostrophes (incl. iPad smart ’) and hyphens join words; . , : only join digits.
    `(${WORD_CHAR}+(?:(?:['’ʼ\\-]|[.,:](?=\\p{Nd}))${WORD_CHAR}+)*)`,
    '([\\p{P}\\p{S}])',
  ].join('|'),
  'gu'
);

const isInitial = (c) => (c >= 'ㄅ' && c <= 'ㄙ') || (c >= 'ㄪ' && c <= 'ㄬ');
const isMedial = (c) => c >= 'ㄧ' && c <= 'ㄩ';
const isFinal = (c) =>
  (c >= 'ㄚ' && c <= 'ㄦ') || (c >= 'ㄭ' && c <= 'ㄯ') || (c >= 'ㆠ' && c <= 'ㆿ');

// A syllable is [initial][medial][final], at least one present. Tone marks
// sit before (˙) or after (ˊˇˋ˙) a syllable and never add to the count.
function countZhuyinSyllables(run) {
  let n = 0;
  let i = 0;
  while (i < run.length) {
    const start = i;
    if (i < run.length && isInitial(run[i])) i++;
    if (i < run.length && isMedial(run[i])) i++;
    if (i < run.length && isFinal(run[i])) i++;
    if (i > start) n++;
    else i++; // tone mark
  }
  return n;
}

export const emptyCounts = () => ({ han: 0, zhuyin: 0, latin: 0, number: 0, punct: 0, exact: 0, withPunct: 0 });

export function countWords(text) {
  const c = emptyCounts();
  if (!text) return c;
  for (const m of text.matchAll(TOKEN)) {
    if (m[1]) c.han++;
    else if (m[2]) c.zhuyin += countZhuyinSyllables(m[2]);
    else if (m[3]) /\p{L}/u.test(m[3]) ? c.latin++ : c.number++;
    else c.punct++;
  }
  c.exact = c.han + c.zhuyin + c.latin + c.number;
  c.withPunct = c.exact + c.punct;
  return c;
}

export function sumCounts(list) {
  const total = emptyCounts();
  for (const c of list) for (const k in total) total[k] += c[k];
  return total;
}

// Where the article stands against the teacher's word limit.
// goal = { min, max, punct }; 0 means "not set". Returns null without a goal.
//   below – under min      (diff = words still needed)
//   done  – within range   (diff = words left before max, 0 without max)
//   room  – only max set   (diff = words left before max)
//   over  – past max       (diff = words over)
export function goalProgress(goal, total) {
  const min = goal?.min || 0;
  const max = goal?.max && goal.max >= min ? goal.max : 0;
  if (!min && !max) return null;
  const count = goal.punct ? total.withPunct : total.exact;
  const base = { count, min, max, punct: !!goal.punct };
  if (max && count > max) return { ...base, state: 'over', diff: count - max, ratio: 1 };
  if (min && count < min) return { ...base, state: 'below', diff: min - count, ratio: count / min };
  if (!min) return { ...base, state: 'room', diff: max - count, ratio: count / max };
  return { ...base, state: 'done', diff: max ? max - count : 0, ratio: 1 };
}
