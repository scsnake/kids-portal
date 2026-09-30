// Stroke rules, kept free of React so they can be tested (test/trace.test.js).
//
// The finger's movement arrives as sparse pointer samples: a fast swipe can jump tens of
// board units between two samples. Snapping only at each sample skipped dots the finger
// crossed and could join a dot the finger never went near, so extendPath walks the segment
// between consecutive samples in small steps and lets dots join in the order the finger
// actually passed them.

// Board units between hit tests along a segment; well under the smallest catch radius.
const STEP = 1.5;
// How far a finger may wander off a line while tracing it without catching another dot.
const WOBBLE = 4;
const MIN_RADIUS = 7;
const MAX_RADIUS = 12;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function segmentDistance(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

const cache = new WeakMap();

// Per-level lookup tables and catch radius. The radius is as generous as the level allows
// (up to 12 units) but always leaves WOBBLE between a dot's catch circle and any line the
// dot isn't on, and never lets two dots' circles overlap.
function info(level) {
  let entry = cache.get(level);
  if (entry) return entry;
  const byId = new Map(level.nodes.map((n) => [n.id, n]));
  const edges = new Set(level.edges.map(([a, b]) => edgeKey(a, b)));
  let limit = MAX_RADIUS;
  for (const n of level.nodes) {
    for (const m of level.nodes) if (m !== n) limit = Math.min(limit, dist(n, m) / 2 - 1);
    for (const [a, b] of level.edges) {
      if (a !== n.id && b !== n.id) limit = Math.min(limit, segmentDistance(n, byId.get(a), byId.get(b)) - WOBBLE);
    }
  }
  entry = { byId, edges, radius: Math.max(MIN_RADIUS, limit) };
  cache.set(level, entry);
  return entry;
}

export const hitRadius = (level) => info(level).radius;

// The dot under point p, or null.
export function nodeAt(level, p, radius = hitRadius(level)) {
  let nearest = null;
  let best = radius;
  for (const node of level.nodes) {
    const d = dist(node, p);
    if (d < best) {
      best = d;
      nearest = node;
    }
  }
  return nearest;
}

export const traversedEdges = (path) => {
  const done = new Set();
  for (let i = 0; i < path.length - 1; i++) done.add(edgeKey(path[i], path[i + 1]));
  return done;
};

// Can the stroke go from its current end straight to `id`?
export function canStep(level, path, id) {
  const last = path[path.length - 1];
  if (last === undefined || id === last) return false;
  const key = edgeKey(last, id);
  return info(level).edges.has(key) && !traversedEdges(path).has(key);
}

// The path after the finger moves from `from` to `to` (board coordinates). Returns the same
// array when nothing joined. Dots the finger crosses that aren't a legal next step are
// passed over, never connected.
export function extendPath(level, path, from, to, radius = hitRadius(level)) {
  if (!path.length) return path;
  const { edges } = info(level);
  const done = traversedEdges(path);
  const steps = Math.max(1, Math.ceil(dist(from, to) / STEP));
  let next = path;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const node = nodeAt(level, { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }, radius);
    if (!node) continue;
    const last = next[next.length - 1];
    const key = edgeKey(last, node.id);
    if (node.id === last || !edges.has(key) || done.has(key)) continue;
    done.add(key);
    next = [...next, node.id];
  }
  return next;
}

// Is there still an untraced line from the end of the stroke? False means the child is stuck
// (or done).
export function hasMoves(level, path) {
  const last = path[path.length - 1];
  if (last === undefined) return true;
  const done = traversedEdges(path);
  return level.edges.some(([a, b]) => (a === last || b === last) && !done.has(edgeKey(a, b)));
}
