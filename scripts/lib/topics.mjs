import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const APP = 'apps/tech-explorer';
export const validId = id => typeof id === 'string' && /^[a-z][a-z0-9-]*$/.test(id);
export const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
export const json = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export const write = async (file, text) => { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, text); };
export const writeJson = (file, value) => write(file, JSON.stringify(value, null, 2) + '\n');
export const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const freshImport = file => import(pathToFileURL(file).href + '?check=' + crypto.randomUUID());

export async function files(root) {
  const result = [];
  async function visit(dir, prefix = '') {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in topic artifacts: ${relative}`);
      if (entry.name.startsWith('.')) continue;
      if (entry.isDirectory()) await visit(path.join(dir, entry.name), relative + '/');
      else if (entry.isFile()) result.push(relative);
    }
  }
  await visit(root);
  return result.sort();
}

export async function treeHash(root, excluded = ['release.json']) {
  const entries = [];
  for (const file of await files(root)) {
    if (!excluded.includes(file)) entries.push([file, digest(await fs.readFile(path.join(root, file)))]);
  }
  return digest(JSON.stringify(entries));
}

export async function snapshot(repo, destination, ref = 'HEAD') {
  const names = git(repo, 'ls-tree', '-rz', ref, '--', APP).split('\0').filter(Boolean);
  for (const name of names) {
    const [meta, source] = name.split('\t');
    if (!meta.startsWith('100644 ') && !meta.startsWith('100755 ')) throw new Error(`Unsupported Git entry: ${source}`);
    const relative = source.slice(APP.length + 1);
    const data = execFileSync('git', ['-C', repo, 'show', `${ref}:${source}`]);
    await fs.mkdir(path.dirname(path.join(destination, relative)), { recursive: true });
    await fs.writeFile(path.join(destination, relative), data);
  }
}

export async function readBatch(repo, id) {
  if (!validId(id)) throw new Error('Use a lowercase batch ID.');
  const directory = path.join(repo, 'topic-drafts', id);
  const manifest = await json(path.join(directory, 'batch.json'));
  if (!Array.isArray(manifest.topics) || !manifest.topics.length || new Set(manifest.topics).size !== manifest.topics.length) {
    throw new Error('The batch needs a nonempty list of unique topic IDs.');
  }
  for (const topic of manifest.topics) if (!validId(topic)) throw new Error('Invalid topic directory.');
  return { id, directory, topics: manifest.topics, hash: await treeHash(directory, []) };
}

export async function readCourse(root, allowDrafts = false) {
  const [{ UNITS, STAGES, PARTS, COMING }, { WIDGETS }, { TOPICS }, { assembleCourse }] = await Promise.all([
    freshImport(path.join(root, 'js/units.js')), freshImport(path.join(root, 'js/widgets.js')),
    freshImport(path.join(root, 'js/topic-registry.js')), freshImport(path.join(root, 'js/topic-model.js')),
  ]);
  return { course: assembleCourse({ units: UNITS, stages: STAGES, parts: PARTS, coming: COMING, widgets: WIDGETS }, TOPICS, { allowDrafts }), entries: TOPICS };
}

export function syncReadme(text, course, entries) {
  const descriptions = new Map([...text.matchAll(/^\d+\. (.*?): (.*)$/gm)].map(([, title, description]) => [title, description]));
  for (const { topic } of entries) descriptions.set(topic.unit.title, topic.readme);
  const start = text.indexOf('**Part 1:');
  const end = text.indexOf('## Saved progress');
  if (start < 0 || end < start) throw new Error('README catalog boundaries are missing.');
  let n = 0;
  const sections = course.parts.map((part, i) => {
    const heading = text.split('\n').find(line => line.startsWith(`**Part ${i + 1}:`));
    if (!heading) throw new Error(`README heading missing for ${part.id}.`);
    return heading + '\n\n' + course.units.filter(unit => unit.part === part.id)
      .map(unit => `${++n}. ${unit.title}: ${descriptions.get(unit.title) || unit.desc}`).join('\n');
  }).join('\n\n');
  return (text.slice(0, start) + sections + '\n\n' + text.slice(end))
    .replace(/groups the units into \d+ stages/, `groups the units into ${course.stages.length} stages`);
}

export async function validateCatalog(root, { allowDrafts = false } = {}) {
  const { course, entries } = await readCourse(root, allowDrafts);
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  if (syncReadme(readme, course, entries) !== readme) throw new Error('README unit order, summaries, or stage count is stale.');
  const changelog = await json(path.join(root, 'changelog.json'));
  for (const { topic, releasedAt, module, sourceHash } of entries) {
    if (module !== `topics/${topic.unit.id}/topic.mjs` || !/^[a-f0-9]{64}$/.test(sourceHash || '') ||
      await treeHash(path.dirname(path.join(root, module)), []) !== sourceHash) {
      throw new Error(`${topic.unit.id}: package files differ from the registered source hash.`);
    }
    if (!changelog.some(entry => entry.date === releasedAt && entry.changes.includes(topic.changelog))) {
      throw new Error(`${topic.unit.id}: changelog entry is missing.`);
    }
    for (const slide of topic.unit.slides) {
      if (!allowDrafts && slide.widget && !['choice', 'sort', 'order'].includes(slide.widget) && !topic.checks?.[slide.id]?.length) {
        throw new Error(`${topic.unit.id}/${slide.id}: provide interaction checks for the custom widget.`);
      }
    }
  }
  const index = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const version = index.match(/style\.css\?v=(\d+)/)?.[1];
  if (!version || !index.includes(`js/main.js?v=${version}`)) throw new Error('Entry-point asset versions differ.');
  for (const file of ['js/main.js', 'js/course.js']) {
    const source = await fs.readFile(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/\.\/(?:course|units|widgets|topic-model|topic-registry)\.js\?v=(\d+)/g)) {
      if (match[1] !== version) throw new Error(`${file}: stale module version.`);
    }
  }
  return { units: course.units.length, stages: course.stages.length, slides: course.units.reduce((n, u) => n + u.slides.length, 0), version, course, entries };
}

export async function buildCandidate({ baseline, destination, batch, count = batch.topics.length, date, bump = true }) {
  await fs.cp(baseline, destination, { recursive: true, force: false, errorOnExist: true });
  const { TOPICS: previous } = await freshImport(path.join(baseline, 'js/topic-registry.js'));
  const records = previous.map(({ module, releasedAt, sourceHash }) => ({ module, releasedAt, sourceHash }));
  for (const id of batch.topics.slice(0, count)) {
    const from = path.join(batch.directory, id);
    const to = path.join(destination, 'topics', id);
    if ((await files(destination)).some(file => file.startsWith(`topics/${id}/`))) throw new Error(`Topic package already exists: ${id}`);
    const packageFiles = await files(from); // Reject symlinks before copying.
    await copyChanges(from, to, packageFiles);
    const { default: topic } = await freshImport(path.join(to, 'topic.mjs'));
    if (topic?.unit?.id !== id) throw new Error(`The module ID must match its directory: ${id}`);
    records.push({ module: `topics/${id}/topic.mjs`, releasedAt: date, sourceHash: await treeHash(from, []) });
  }
  const registry = '// Generated by scripts/topics.mjs. Each import points to the reviewed topic source.\n' + records.map((record, i) =>
    `import topic${i} from '../${record.module}?v=${record.sourceHash}';\n`).join('') +
    'export const TOPICS = [\n' + records.map((record, i) => `  { topic: topic${i}, ...${JSON.stringify(record)} },\n`).join('') + '];\n';
  await write(path.join(destination, 'js/topic-registry.js'), registry);
  const { course, entries } = await readCourse(destination, true);
  const readmePath = path.join(destination, 'README.md');
  await write(readmePath, syncReadme(await fs.readFile(readmePath, 'utf8'), course, entries));
  const logPath = path.join(destination, 'changelog.json');
  const log = await json(logPath);
  for (const { topic, releasedAt } of entries.slice(previous.length)) {
    let day = log.find(entry => entry.date === releasedAt);
    if (!day) { day = { date: releasedAt, changes: [] }; log.unshift(day); }
    if (!day.changes.includes(topic.changelog)) day.changes.push(topic.changelog);
  }
  await writeJson(logPath, log);
  if (bump) {
    const version = Number((await fs.readFile(path.join(destination, 'index.html'), 'utf8')).match(/style\.css\?v=(\d+)/)?.[1]) + 1;
    if (!Number.isSafeInteger(version)) throw new Error('Cannot determine the next asset version.');
    for (const file of ['index.html', 'js/main.js', 'js/course.js']) {
      const source = await fs.readFile(path.join(destination, file), 'utf8');
      const next = file === 'index.html' ? source.replace(/(style\.css|js\/main\.js)\?v=\d+/g, `$1?v=${version}`) : source.replace(/\?v=\d+(?=['"])/g, `?v=${version}`);
      await write(path.join(destination, file), next);
    }
  }
  return destination;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
export async function serve(root, { port = 0, host = '127.0.0.1' } = {}) {
  const absolute = await fs.realpath(root);
  const server = http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
      const decoded = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(absolute, '.' + decoded, decoded.endsWith('/') ? 'index.html' : '');
      if (!file.startsWith(absolute + path.sep) || !TYPES[path.extname(file)] || path.relative(absolute, file).split(path.sep).some(p => p.startsWith('.'))) {
        response.writeHead(404); response.end(); return;
      }
      const real = await fs.realpath(file);
      if (!real.startsWith(absolute + path.sep)) throw new Error('Outside preview root.');
      const data = await fs.readFile(real);
      response.writeHead(200, { 'Content-Type': TYPES[path.extname(real)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch { response.writeHead(404); response.end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  return { server, url: `http://${host}:${server.address().port}/`, close: () => new Promise(resolve => server.close(resolve)) };
}

export async function newState(repo, id) {
  if (!validId(id)) throw new Error('Invalid batch ID.');
  const state = path.join(repo, '.topic-state', id);
  await fs.mkdir(state, { recursive: true });
  return { state, build: await fs.mkdtemp(path.join(state, 'review-')) };
}

export function releaseModels(options) {
  const review = options['review-model'];
  const fix = options['fix-model'];
  if (![review, fix].every(model => typeof model === 'string' && model.trim() && !/[\r\n]/.test(model))) {
    throw new Error('Supply --review-model and --fix-model with the actual model names.');
  }
  return `Review: ${review}.\nFixes: ${fix}.`;
}

export async function copyChanges(from, destination, names) {
  for (const file of names) {
    if (path.isAbsolute(file) || file.split('/').some(part => part === '..')) throw new Error('Invalid release path.');
    const source = path.join(from, file);
    await fs.mkdir(path.dirname(path.join(destination, file)), { recursive: true });
    await fs.copyFile(source, path.join(destination, file));
  }
}

export async function changedFiles(baseline, candidate) {
  const changed = [];
  for (const file of await files(candidate)) {
    const next = await fs.readFile(path.join(candidate, file));
    let old;
    try { old = await fs.readFile(path.join(baseline, file)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!old || !old.equals(next)) changed.push(file);
  }
  return changed;
}

export async function prepareCommits(repo, batch, review, attribution) {
  const state = path.join(repo, '.topic-state', batch.id);
  const worktree = path.join(state, 'release-' + review.revision.slice(0, 12));
  try { await fs.access(worktree); throw new Error(`A partial release exists at ${worktree}. Inspect it before retrying.`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  git(repo, 'worktree', 'add', '--detach', worktree, review.baseCommit);
  const commits = [];
  for (let count = 1; count <= batch.topics.length; count++) {
    const intermediate = await fs.mkdtemp(path.join(state, 'promote-'));
    const destination = path.join(intermediate, 'app');
    await buildCandidate({ baseline: review.baseline, destination, batch, count, date: review.date, bump: false });
    const changed = await changedFiles(review.baseline, destination);
    await copyChanges(destination, path.join(worktree, APP), changed);
    git(worktree, 'add', '--', ...changed.map(file => `${APP}/${file}`));
    git(worktree, 'commit', '-m', `feat(tech-explorer): add ${batch.topics[count - 1]} topic`, '-m', attribution);
    commits.push(git(worktree, 'rev-parse', 'HEAD').trim());
  }
  await copyChanges(review.candidate, path.join(worktree, APP), review.changed);
  git(worktree, 'add', '--', ...review.changed.map(file => `${APP}/${file}`));
  git(worktree, 'commit', '-m', 'chore(tech-explorer): version the reviewed topic release', '-m', attribution);
  commits.push(git(worktree, 'rev-parse', 'HEAD').trim());
  if (await treeHash(path.join(worktree, APP)) !== review.revision) throw new Error('Committed release differs from the approved preview.');
  return { worktree, commits, releaseCommit: commits.at(-1) };
}
