import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, defaultDoc, docKey, thinHistory, MAX_SNAPSHOTS } from '../storage.js';

// Storage-like backend with an optional size quota (in characters).
function fakeStorage(limit = Infinity) {
  const m = new Map();
  const size = () => [...m].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem(k, v) {
      const old = m.get(k);
      m.set(k, String(v));
      if (size() > limit) {
        if (old === undefined) m.delete(k);
        else m.set(k, old);
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      }
    },
    removeItem: (k) => void m.delete(k)
  };
}

const withText = (lang, content, updatedAt = 1) => {
  const doc = defaultDoc(lang);
  doc.sections[0].content = content;
  doc.updatedAt = updatedAt;
  return doc;
};

test('fresh store gives the default article per language', () => {
  const store = createStore(fakeStorage());
  assert.equal(store.durable, true);
  assert.equal(store.loadLang(), 'zh');
  assert.deepEqual(
    store.loadDoc('zh').sections.map((s) => s.title),
    ['前言', '正文', '結語']
  );
  assert.equal(store.loadDoc('en').sections[0].title, 'Introduction');
});

test('saved article comes back exactly, per language', () => {
  const backend = fakeStorage();
  const store = createStore(backend);
  const zh = withText('zh', '我的暑假很好玩。', 123);
  zh.title = '我的暑假';
  zh.goal = { min: 300, max: 500, punct: true };
  assert.equal(store.saveDoc('zh', zh), true);
  // A second store over the same backend = the page reloading.
  const again = createStore(backend);
  assert.deepEqual(again.loadDoc('zh'), zh);
  assert.equal(again.loadDoc('en').sections[0].content, '');
});

test('unreadable data is parked in a rescue key, not overwritten', () => {
  const backend = fakeStorage();
  backend.setItem(docKey('zh'), '{"sections": [oops');
  const store = createStore(backend);
  assert.equal(store.loadDoc('zh').sections[0].title, '前言');
  store.saveDoc('zh', withText('zh', '新的'));
  assert.equal(backend.getItem('littleWriter:v2:rescue:zh'), '{"sections": [oops');
});

test('damaged fields are repaired on load', () => {
  const backend = fakeStorage();
  backend.setItem(
    docKey('zh'),
    JSON.stringify({ sections: [{ id: 1, content: 'a' }, { id: 1, content: 'b' }, null, { content: 5 }], goal: 'x' })
  );
  const doc = createStore(backend).loadDoc('zh');
  assert.deepEqual(
    doc.sections.map((s) => [s.id, s.content]),
    [[1, 'a'], [2, 'b'], [3, '']]
  );
  assert.deepEqual(doc.goal, { min: 0, max: 0, punct: false });
});

test('no storage at all: works in memory and reports not durable', () => {
  const store = createStore(null);
  assert.equal(store.durable, false);
  assert.equal(store.saveDoc('zh', withText('zh', '暫存')), true);
  assert.equal(store.loadDoc('zh').sections[0].content, '暫存');
});

test('snapshots skip blank and unchanged docs, newest first', () => {
  const store = createStore(fakeStorage());
  const titleOnly = defaultDoc('zh');
  titleOnly.title = '我的暑假';
  assert.equal(store.addSnapshot('zh', defaultDoc('zh'), 'auto', 1000), false);
  assert.equal(store.addSnapshot('zh', titleOnly, 'auto', 1500), false, 'a title alone is not backed up');
  assert.equal(store.addSnapshot('zh', withText('zh', '一'), 'auto', 2000), true);
  assert.equal(store.addSnapshot('zh', withText('zh', '一'), 'auto', 2500), false);
  assert.equal(store.addSnapshot('zh', withText('zh', '一二'), 'auto', 3000), true);
  const list = store.loadHistory('zh');
  assert.deepEqual(
    list.map((e) => [e.at, e.reason, e.doc.sections[0].content]),
    [
      [3000, 'auto', '一二'],
      [2000, 'auto', '一']
    ]
  );
  assert.equal(store.newestSnapshotAt('zh'), 3000);
  assert.equal(store.loadHistory('en').length, 0);
});

test('reset right after an identical backup relabels it instead of hiding it', () => {
  const store = createStore(fakeStorage());
  store.addSnapshot('zh', withText('zh', '一'), 'delete', 1000);
  assert.equal(store.addSnapshot('zh', withText('zh', '一'), 'reset', 2000), true);
  assert.deepEqual(
    store.loadHistory('zh').map((e) => [e.at, e.reason]),
    [[2000, 'reset']]
  );
});

test('history stays bounded but spread over time, keeping first and latest', () => {
  const store = createStore(fakeStorage());
  const minute = 60_000;
  // A kid writing on and off for 10 days, snapshot every 2 minutes for an hour a day.
  let n = 0;
  for (let day = 0; day < 10; day++) {
    for (let k = 0; k < 30; k++) {
      const at = day * 24 * 60 * minute + k * 2 * minute;
      store.addSnapshot('zh', withText('zh', `v${n++}`), 'auto', at);
    }
  }
  const list = store.loadHistory('zh');
  assert.equal(list.length, MAX_SNAPSHOTS);
  assert.equal(list[0].doc.sections[0].content, `v${n - 1}`);
  assert.equal(list.at(-1).doc.sections[0].content, 'v0');
  const days = new Set(list.map((e) => Math.floor(e.at / (24 * 60 * minute))));
  assert.ok(days.size >= 5, `snapshots should cover many days, got ${[...days]}`);
});

test('thinning drops automatic snapshots before reset ones', () => {
  const list = [
    { at: 100, reason: 'auto' },
    { at: 99, reason: 'reset' },
    { at: 98, reason: 'auto' },
    { at: 10, reason: 'auto' }
  ];
  thinHistory(list, 3, 100);
  assert.deepEqual(list.map((e) => e.reason), ['auto', 'reset', 'auto']);
  assert.deepEqual(list.map((e) => e.at), [100, 99, 10]);
});

test('when storage is full, old snapshots are given up to save the article', () => {
  const backend = fakeStorage(6000);
  const store = createStore(backend);
  for (let i = 0; i < 20; i++) store.addSnapshot('zh', withText('zh', `${i}`.repeat(40)), 'auto', i * 1000);
  const before = store.loadHistory('zh').length;
  assert.ok(before > 3);
  const big = withText('zh', '字'.repeat(3000), 99);
  assert.equal(store.saveDoc('zh', big), true);
  assert.equal(createStore(backend).loadDoc('zh').sections[0].content.length, 3000);
  assert.ok(store.loadHistory('zh').length < before);
});

test('saveDoc reports failure when even the article cannot fit', () => {
  const store = createStore(fakeStorage(100));
  assert.equal(store.saveDoc('zh', withText('zh', '字'.repeat(500))), false);
});
