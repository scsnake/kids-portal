import test from 'node:test';
import assert from 'node:assert/strict';
import { countWords, sumCounts, goalProgress } from '../wordcount.js';

const pick = (c, ...keys) => Object.fromEntries(keys.map((k) => [k, c[k]]));

test('empty text counts nothing', () => {
  assert.deepEqual(pick(countWords(''), 'exact', 'withPunct'), { exact: 0, withPunct: 0 });
  assert.deepEqual(pick(countWords('   \n　'), 'exact', 'withPunct'), { exact: 0, withPunct: 0 });
});

test('Chinese characters and punctuation', () => {
  const c = countWords('今天天氣很好，我們去公園玩！');
  assert.deepEqual(pick(c, 'han', 'punct', 'exact', 'withPunct'), { han: 12, punct: 2, exact: 12, withPunct: 14 });
});

test('ellipsis and dashes count per character, like on 稿紙', () => {
  assert.deepEqual(pick(countWords('好……'), 'han', 'punct'), { han: 1, punct: 2 });
  assert.deepEqual(pick(countWords('「對——就是他」'), 'han', 'punct'), { han: 4, punct: 4 });
});

test('iPad smart apostrophe keeps contractions as one word', () => {
  const c = countWords('I don’t like it.');
  assert.deepEqual(pick(c, 'latin', 'punct'), { latin: 4, punct: 1 });
});

test('ASCII apostrophes and hyphens join words', () => {
  assert.equal(countWords("It's a well-known fact.").latin, 4);
});

test('numbers with separators are one number each', () => {
  const c = countWords('I have 3.14 apples and 1,000 pens at 10:30');
  assert.deepEqual(pick(c, 'latin', 'number', 'punct'), { latin: 6, number: 3, punct: 0 });
});

test('a sentence-ending period after a number is still punctuation', () => {
  assert.deepEqual(pick(countWords('I am 9.'), 'latin', 'number', 'punct'), { latin: 2, number: 1, punct: 1 });
});

test('letters mixed with digits are one word', () => {
  assert.deepEqual(pick(countWords('5th COVID-19 A4'), 'latin', 'number'), { latin: 3, number: 0 });
});

test('accented letters stay inside the word', () => {
  assert.equal(countWords('café naïve').latin, 2);
});

test('Chinese mixed with English words', () => {
  const c = countWords('我喜歡 Minecraft 和 Roblox。');
  assert.deepEqual(pick(c, 'han', 'latin', 'punct', 'exact'), { han: 4, latin: 2, punct: 1, exact: 6 });
});

test('full-width digits count as a number', () => {
  assert.deepEqual(pick(countWords('２０２４年'), 'han', 'number'), { han: 1, number: 1 });
});

test('zhuyin syllables count like the characters they stand for', () => {
  assert.deepEqual(pick(countWords('我很ㄍㄠˋㄒㄧㄥˋ'), 'han', 'zhuyin', 'punct', 'exact'), {
    han: 2,
    zhuyin: 2,
    punct: 0,
    exact: 4
  });
  assert.equal(countWords('ㄏㄠˇ˙ㄇㄚ').zhuyin, 2, 'light-tone mark before the syllable');
  assert.equal(countWords('ㄇㄚ˙').zhuyin, 1, 'light-tone mark after the syllable');
  assert.equal(countWords('ㄓㄓ').zhuyin, 2, 'two bare initials');
  assert.equal(countWords('ㄧㄚ').zhuyin, 1, 'medial + final');
  assert.equal(countWords('ㄍㄨㄛˊ').zhuyin, 1, 'initial + medial + final');
  assert.equal(countWords('ㄧㄨ').zhuyin, 2, 'two medials are two syllables');
  assert.equal(countWords('˙').withPunct, 0, 'a lone tone mark is neither word nor punctuation');
});

test('emoji count as symbols, not words', () => {
  assert.deepEqual(pick(countWords('好😀'), 'exact', 'withPunct'), { exact: 1, withPunct: 2 });
});

test('sumCounts adds every bucket', () => {
  const total = sumCounts([countWords('你好。'), countWords('Hi there!')]);
  assert.deepEqual(pick(total, 'han', 'latin', 'punct', 'exact', 'withPunct'), {
    han: 2,
    latin: 2,
    punct: 2,
    exact: 4,
    withPunct: 6
  });
});

test('goalProgress states', () => {
  const total = { exact: 250, withPunct: 290 };
  assert.equal(goalProgress({ min: 0, max: 0 }, total), null);
  assert.deepEqual(pick(goalProgress({ min: 300, max: 0 }, total), 'state', 'diff'), { state: 'below', diff: 50 });
  assert.deepEqual(pick(goalProgress({ min: 300, max: 0, punct: true }, total), 'state', 'diff', 'count'), {
    state: 'below',
    diff: 10,
    count: 290
  });
  assert.deepEqual(pick(goalProgress({ min: 200, max: 0 }, total), 'state', 'ratio'), { state: 'done', ratio: 1 });
  assert.deepEqual(pick(goalProgress({ min: 200, max: 300 }, total), 'state', 'diff'), { state: 'done', diff: 50 });
  assert.deepEqual(pick(goalProgress({ min: 100, max: 200 }, total), 'state', 'diff'), { state: 'over', diff: 50 });
  assert.deepEqual(pick(goalProgress({ min: 0, max: 500 }, total), 'state', 'diff', 'ratio'), {
    state: 'room',
    diff: 250,
    ratio: 0.5
  });
  // A max below the min is ignored rather than contradicting it.
  assert.deepEqual(pick(goalProgress({ min: 300, max: 100 }, total), 'state', 'max'), { state: 'below', max: 0 });
});
