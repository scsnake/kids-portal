import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../levels.js';
import { canStep, extendPath, hasMoves, hitRadius, nodeAt } from '../trace.js';

const level = (name) => LEVELS.find((l) => l.name === name);
const at = (lvl, id) => lvl.nodes.find((n) => n.id === id);

test('catch radius stays between 7 and 12 on every level', () => {
  for (const l of LEVELS) {
    const r = hitRadius(l);
    assert.ok(r >= 7 && r <= 12, `${l.name}: ${r}`);
  }
});

test('one fast swipe across three dots joins all of them in order', () => {
  const bridge = level('The Bridge'); // 0 (15,70) — 1 (50,70) — 2 (85,70)
  assert.deepEqual(extendPath(bridge, [0], at(bridge, 0), at(bridge, 2)), [0, 1, 2]);
});

test('a swipe never joins a dot the finger did not pass', () => {
  const knot = level('The Infinite Knot');
  // Straight along line 0-5; dot 4 sits beside that line and must be left alone.
  assert.deepEqual(extendPath(knot, [0], at(knot, 0), at(knot, 5)), [0, 5]);
  const mansion = level('The Mansion');
  // Along the floor line 3-2, under the attic dot 6.
  assert.deepEqual(extendPath(mansion, [3], at(mansion, 3), at(mansion, 2)), [3, 2]);
});

test('dots that are not a legal next step are passed over', () => {
  const bridge = level('The Bridge');
  // 0 → 1 is a line, but 1 → 1 again or 0 → 4 is not: swipe from 0 straight to 4 (no line).
  assert.deepEqual(extendPath(bridge, [0], at(bridge, 0), at(bridge, 4)), [0]);
  // A used line can't be traced twice.
  assert.deepEqual(extendPath(bridge, [0, 1], at(bridge, 1), at(bridge, 0)), [0, 1]);
  assert.equal(canStep(bridge, [0, 1], 0), false);
  assert.equal(canStep(bridge, [0, 1], 2), true);
});

test('returns the same array when nothing joined', () => {
  const tri = level('The Magic Triangle');
  const path = [0];
  assert.equal(extendPath(tri, path, { x: 50, y: 20 }, { x: 52, y: 30 }), path);
});

test('nodeAt only answers inside the catch radius', () => {
  const tri = level('The Magic Triangle');
  const r = hitRadius(tri);
  assert.equal(nodeAt(tri, { x: 50, y: 20 + r - 0.5 })?.id, 0);
  assert.equal(nodeAt(tri, { x: 50, y: 20 + r + 0.5 }), null);
});

// The property the drag bug broke: on every level, a single fast swipe along any line —
// even a few units off to one side — joins exactly that line's two dots and nothing else.
test('every line on every level can be swiped cleanly, even slightly off-line', () => {
  for (const l of LEVELS) {
    for (const [a, b] of l.edges) {
      const A = at(l, a), B = at(l, b);
      const len = Math.hypot(B.x - A.x, B.y - A.y);
      const nx = -(B.y - A.y) / len, ny = (B.x - A.x) / len;
      for (const off of [-3, 0, 3]) {
        const from = { x: A.x + nx * off, y: A.y + ny * off };
        const to = { x: B.x + nx * off, y: B.y + ny * off };
        assert.deepEqual(extendPath(l, [a], from, to), [a, b], `${l.name}: ${a}→${b} offset ${off}`);
        assert.deepEqual(extendPath(l, [b], to, from), [b, a], `${l.name}: ${b}→${a} offset ${off}`);
      }
    }
  }
});

test('every level can be finished by fast swipes along some Euler path', () => {
  for (const l of LEVELS) {
    // Hierholzer: find an Euler path, then replay it as one swipe per line.
    const adj = new Map(l.nodes.map((n) => [n.id, []]));
    l.edges.forEach(([a, b], i) => { adj.get(a).push([b, i]); adj.get(b).push([a, i]); });
    const odd = l.nodes.filter((n) => adj.get(n.id).length % 2).map((n) => n.id);
    const used = new Set(), stack = [odd[0] ?? 0], route = [];
    while (stack.length) {
      const v = stack[stack.length - 1], nxt = adj.get(v).find(([, i]) => !used.has(i));
      if (nxt) { used.add(nxt[1]); stack.push(nxt[0]); } else route.push(stack.pop());
    }
    let path = [route[0]];
    for (let i = 1; i < route.length; i++) path = extendPath(l, path, at(l, route[i - 1]), at(l, route[i]));
    assert.equal(path.length - 1, l.edges.length, `${l.name} finished`);
  }
});

test('hasMoves spots a dead end before the level is finished', () => {
  const bowtie = level('The Bowtie'); // two triangles meeting at dot 2
  assert.equal(hasMoves(bowtie, []), true);
  assert.equal(hasMoves(bowtie, [0, 1]), true);
  // Around the left triangle back to 0: both of 0's lines are used, the right triangle is not.
  assert.equal(hasMoves(bowtie, [0, 1, 2, 0]), false);
  assert.equal(hasMoves(bowtie, [2, 0, 1, 2, 3, 4, 2]), false); // finished
});
