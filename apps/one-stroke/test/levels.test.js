import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../levels.js';

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const segmentDistance = (p, a, b) => {
  const vx = b.x - a.x, vy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
};

test('levels are numbered 1..N in order', () => {
  assert.deepEqual(LEVELS.map((l) => l.id), LEVELS.map((_, i) => i + 1));
});

for (const level of LEVELS) {
  test(`level ${level.id} ${level.name}: solvable and legible`, () => {
    const byId = new Map(level.nodes.map((n) => [n.id, n]));
    assert.deepEqual(level.nodes.map((n) => n.id), level.nodes.map((_, i) => i), 'node ids are 0..n-1');

    const seen = new Set();
    const degree = new Map(level.nodes.map((n) => [n.id, 0]));
    const adj = new Map(level.nodes.map((n) => [n.id, []]));
    for (const [a, b] of level.edges) {
      assert.ok(byId.has(a) && byId.has(b) && a !== b, `edge ${a}-${b} joins two different dots`);
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      assert.ok(!seen.has(key), `edge ${key} listed once`);
      seen.add(key);
      degree.set(a, degree.get(a) + 1);
      degree.set(b, degree.get(b) + 1);
      adj.get(a).push(b);
      adj.get(b).push(a);
    }

    // One stroke exists iff the dots are connected and 0 or 2 have an odd number of lines.
    const reached = new Set([0]);
    const stack = [0];
    while (stack.length) for (const m of adj.get(stack.pop())) if (!reached.has(m)) reached.add(m), stack.push(m);
    assert.equal(reached.size, level.nodes.length, 'every dot is reachable');
    const odd = [...degree.values()].filter((d) => d % 2).length;
    assert.ok(odd === 0 || odd === 2, `0 or 2 odd dots (got ${odd})`);

    for (const n of level.nodes) {
      assert.ok(Math.min(n.x, n.y, 100 - n.x, 100 - n.y) >= 5, `dot ${n.id} inside the board`);
      for (const m of level.nodes) if (m.id > n.id) assert.ok(dist(n, m) >= 16, `dots ${n.id} and ${m.id} not crowded`);
      // A dot sitting on (or brushing) a line it isn't part of makes the picture ambiguous and
      // lets a stroke along that line snap onto the dot.
      for (const [a, b] of level.edges) {
        if (a === n.id || b === n.id) continue;
        const gap = segmentDistance(n, byId.get(a), byId.get(b));
        assert.ok(gap >= 11, `dot ${n.id} is ${gap.toFixed(1)} from line ${a}-${b}`);
      }
    }
  });
}
