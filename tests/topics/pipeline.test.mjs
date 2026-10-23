import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { APP, git, write, writeJson, json, treeHash, snapshot, buildCandidate, validateCatalog, readBatch, serve, prepareCommits } from '../../scripts/lib/topics.mjs';
import { assembleCourse } from '../../apps/tech-explorer/js/topic-model.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CLI = path.join(ROOT, 'scripts/topics.mjs');
const date = '2026-10-23';
const slide = id => ({ id, title: id, widget: 'choice', params: { question: id, options: [{ text: '對', correct: true }, { text: '再想想' }], explain: '答案說明。' } });
const topic = (id = 'pipeline-example') => ({ ready: true,
  unit: { id, part: 'adv', title: '流程測試', en: 'Pipeline Test', desc: '測試新主題', icon: '🔎', color: '#0f766e', slides: [slide('explore'), slide('quiz')] },
  placement: { after: 'iot', stage: 'ainet' }, prerequisites: ['web'], readme: 'A pipeline test topic.', changelog: '新增流程測試主題。', widgets: {}, checks: {}, css: '' });
const serializeTopic = data => 'export default ' + JSON.stringify(data, null, 2) + ';\n';
function customSource(withChecks = true) {
  const data = topic();
  data.unit.slides[0].widget = 'pipeline-demo';
  if (withChecks) data.checks.explore = [
    { action: 'click', selector: '.pipeline-start' },
    { action: 'expectText', selector: '.pipeline-status', text: '完成' },
  ];
  data.css = '.pipeline-status { color: #0f766e; font-size: 1rem; }';
  return serializeTopic(data).replace('"widgets": {}', `"widgets": { "pipeline-demo": function(host, params, api) {
    host.innerHTML = '<button class="go pipeline-start">開始</button><p class="pipeline-status">等待</p>';
    host.querySelector('button').onclick = () => {
      host.querySelector('.pipeline-status').textContent = '完成'; api.done();
    };
  } }`);
}

async function fixture(t) {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'kids-topics-test-'));
  t.after(async () => { await fs.rm(repo, { recursive: true, force: true }); });
  await snapshot(ROOT, path.join(repo, APP));
  for (const file of ['js/course.js', 'js/topic-model.js', 'js/topic-registry.js', 'js/main.js']) {
    await fs.copyFile(path.join(ROOT, APP, file), path.join(repo, APP, file));
  }
  const source = git(ROOT, 'show', 'HEAD:' + APP + '/js/units.js');
  const original = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const units = original.UNITS.filter(unit => ['web', 'iot'].includes(unit.id));
  const stage = { id: 'ainet', part: 'adv', icon: '🔗', title: '網路怎麼運作', en: 'Networks', units: ['web', 'iot'] };
  await write(path.join(repo, APP, 'js/units.js'),
    'export const UNITS = ' + JSON.stringify(units) + ';\nexport const STAGES = ' + JSON.stringify([stage]) +
    ';\nexport const PARTS = [{id:"adv",title:"原理探索",en:"How It Works"}];\nexport const COMING = [];\n');
  await write(path.join(repo, APP, 'README.md'), '# Fixture\n\nThe home screen groups the units into 1 stages of 2 to 5 units.\n\n**Part 1: 原理探索**\n\n' +
    units.map((unit, i) => `${i + 1}. ${unit.title}: Fixture summary.`).join('\n') + '\n\n## Saved progress\n');
  // Keep the source fixture on a consistent cache version, independent of later bumps.
  const index = await fs.readFile(path.join(repo, APP, 'index.html'), 'utf8');
  const version = index.match(/style\.css\?v=(\d+)/)[1];
  for (const file of ['js/main.js', 'js/course.js']) {
    const filePath = path.join(repo, APP, file);
    await write(filePath, (await fs.readFile(filePath, 'utf8')).replace(/\?v=\d+(?=['"])/g, `?v=${version}`));
  }
  await writeJson(path.join(repo, 'package.json'), { private: true, type: 'module' });
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.name', 'Pipeline Test');
  git(repo, 'config', 'user.email', 'pipeline@example.invalid');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'test: create a local course fixture');
  const directory = path.join(repo, 'topic-drafts', 'example');
  await writeJson(path.join(directory, 'batch.json'), { topics: ['pipeline-example'] });
  await write(path.join(directory, 'pipeline-example', 'topic.mjs'), serializeTopic(topic()));
  return { repo, directory, batch: await readBatch(repo, 'example') };
}

function cli(repo, ...args) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd: repo, env: { ...process.env, TOPICS_REPO: repo }, encoding: 'utf8', timeout: 30000 });
}

test('catalog assembly keeps stable progress keys and rejects invalid placement', () => {
  const base = { units: [{ id: 'a', part: 'adv', slides: [slide('a'), slide('b')] }, { id: 'b', part: 'adv', slides: [slide('c'), slide('d')] }],
    parts: [{ id: 'adv' }], coming: [], stages: [{ id: 'one', part: 'adv', units: ['a', 'b'] }], widgets: { choice() {} } };
  const draft = topic('c');
  draft.placement = { after: 'b', stage: 'one' };
  draft.prerequisites = ['a'];
  const result = assembleCourse(base, [{ topic: draft, releasedAt: date }]);
  assert.equal(result.units[2].slides[0].progressKey, 'c/explore');
  draft.unit.slides[0].title = '改過的標題';
  assert.equal(assembleCourse(base, [{ topic: draft, releasedAt: date }]).units[2].slides[0].progressKey, 'c/explore');
  draft.placement.after = 'missing';
  assert.throws(() => assembleCourse(base, [{ topic: draft, releasedAt: date }]), /unknown preceding/);
  draft.placement.after = 'b';
  draft.unit.slides[1].id = 'explore';
  assert.throws(() => assembleCourse(base, [{ topic: draft, releasedAt: date }]), /duplicate slide/);
});

test('new stages can be previewed before all units are complete', () => {
  const base = { units: [{ id: 'a', part: 'adv', slides: [slide('a'), slide('b')] }, { id: 'b', part: 'adv', slides: [slide('c'), slide('d')] }],
    parts: [{ id: 'adv' }], coming: [], stages: [{ id: 'one', part: 'adv', units: ['a', 'b'] }], widgets: { choice() {} } };
  const first = topic('first');
  first.placement = { after: 'b', stage: 'two', newStage: { id: 'two', after: 'one', part: 'adv', title: '新階段', en: 'New Stage', icon: '🔎' } };
  first.prerequisites = ['a'];
  const initial = [{ topic: first, releasedAt: date }];
  assert.equal(assembleCourse(base, initial, { allowDrafts: true }).stages.length, 2);
  assert.throws(() => assembleCourse(base, initial), /2 to 5 units/);
  const second = topic('second');
  second.placement = { after: 'first', stage: 'two' };
  second.prerequisites = ['first'];
  assert.equal(assembleCourse(base, [...initial, { topic: second, releasedAt: date }]).units.length, 4);
  first.widgets = { choice() {} };
  assert.throws(() => assembleCourse(base, initial, { allowDrafts: true }), /duplicate or invalid widget/);
});

test('the scaffold creates a previewable draft and blocks release until ready', async t => {
  const { repo } = await fixture(t);
  const created = cli(repo, 'new', 'fresh-topic', '--after', 'iot', '--stage', 'ainet', '--batch', 'fresh-batch');
  assert.equal(created.status, 0, created.stderr);
  const preview = cli(repo, 'preview', 'fresh-batch', '--no-serve');
  assert.equal(preview.status, 0, preview.stderr);
  const review = await json(path.join(repo, '.topic-state/fresh-batch/review.json'));
  await assert.rejects(validateCatalog(review.candidate), /mark the reviewed topic ready/);
  assert.notEqual(cli(repo, 'new', 'fresh-topic', '--after', 'iot', '--stage', 'ainet', '--batch', 'fresh-batch').status, 0);
});

test('candidate generation updates catalogs and excludes untracked application files', async t => {
  const { repo, batch } = await fixture(t);
  await write(path.join(repo, APP, 'private.json'), '{"private":true}');
  const baseline = path.join(repo, 'base');
  await snapshot(repo, baseline);
  await assert.rejects(fs.access(path.join(baseline, 'private.json')));
  await write(path.join(batch.directory, 'pipeline-example', '.env'), 'PRIVATE=value');
  const candidate = path.join(repo, 'candidate');
  await buildCandidate({ baseline, destination: candidate, batch: await readBatch(repo, 'example'), date });
  await assert.rejects(fs.access(path.join(candidate, 'topics/pipeline-example/.env')));
  const result = await validateCatalog(candidate);
  assert.equal(result.units, 3);
  assert.equal(result.stages, 1);
  const baseVersion = (await fs.readFile(path.join(baseline, 'index.html'), 'utf8')).match(/style\.css\?v=(\d+)/)[1];
  assert.equal(result.version, String(Number(baseVersion) + 1));
  assert.equal(result.course.stages.find(stage => stage.id === 'ainet').units.length, 3);
  assert.match(await fs.readFile(path.join(candidate, 'README.md'), 'utf8'), /流程測試: A pipeline test topic/);
  assert.ok((await json(path.join(candidate, 'changelog.json')))[0].changes.includes(topic().changelog));
  const second = path.join(repo, 'candidate-again');
  await buildCandidate({ baseline, destination: second, batch, date });
  assert.equal(await treeHash(candidate), await treeHash(second));
});

test('validation fails on stale catalogs, missing widget checks, and draft topics', async t => {
  const { repo, batch } = await fixture(t);
  const baseline = path.join(repo, 'base');
  await snapshot(repo, baseline);
  const candidate = path.join(repo, 'candidate');
  await buildCandidate({ baseline, destination: candidate, batch, date });
  const readme = path.join(candidate, 'README.md');
  const originalReadme = await fs.readFile(readme, 'utf8');
  await write(readme, originalReadme.replace('1 stages', '9 stages'));
  await assert.rejects(validateCatalog(candidate), /README/);
  const data = topic();
  data.ready = false;
  await write(path.join(batch.directory, 'pipeline-example/topic.mjs'), serializeTopic(data));
  const draft = path.join(repo, 'draft-candidate');
  await buildCandidate({ baseline, destination: draft, batch, date });
  await validateCatalog(draft, { allowDrafts: true });
  await assert.rejects(validateCatalog(draft), /mark the reviewed topic ready/);
  await write(path.join(batch.directory, 'pipeline-example/topic.mjs'), customSource(false));
  const unchecked = path.join(repo, 'unchecked-candidate');
  await buildCandidate({ baseline, destination: unchecked, batch, date });
  await assert.rejects(validateCatalog(unchecked), /provide interaction checks/);
  await write(readme, originalReadme);
  await write(path.join(candidate, 'topics/pipeline-example/extra.js'), 'export const changed = true;');
  await assert.rejects(validateCatalog(candidate), /package files differ/);
});

test('CLI preview binds an immutable artifact and deploy defaults to a plan', async t => {
  const { repo, directory } = await fixture(t);
  const originalHead = git(repo, 'rev-parse', 'HEAD').trim();
  const preview = cli(repo, 'preview', 'example', '--no-serve');
  assert.equal(preview.status, 0, preview.stderr);
  const state = await json(path.join(repo, '.topic-state/example/review.json'));
  const initialHash = await treeHash(state.candidate);
  const plan = cli(repo, 'deploy', 'example', '--review-model', 'Test Model', '--fix-model', 'Test Model');
  assert.equal(plan.status, 0, plan.stderr);
  assert.match(plan.stdout, /Plan only/);
  assert.equal(git(repo, 'rev-parse', 'HEAD').trim(), originalHead);
  await write(path.join(directory, 'pipeline-example/topic.mjs'), serializeTopic({ ...topic(), changelog: '修改過的更新說明。' }));
  assert.equal(await treeHash(state.candidate), initialHash);
  const changed = cli(repo, 'deploy', 'example', '--review-model', 'Test Model', '--fix-model', 'Test Model');
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /Drafts changed/);
  assert.equal(git(repo, 'rev-parse', 'HEAD').trim(), originalHead);
});

test('preview server handles modules and blocks private files and traversal', async t => {
  const { repo } = await fixture(t);
  const root = path.join(repo, APP);
  await write(path.join(root, '.env'), 'PRIVATE=value');
  await fs.symlink(path.join(repo, 'package.json'), path.join(root, 'outside.json'));
  const server = await serve(root);
  t.after(server.close);
  const index = await fetch(server.url);
  assert.equal(index.status, 200);
  assert.equal(index.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(server.url + 'js/course.js')).headers.get('content-type'), 'text/javascript');
  for (const route of ['.env', 'outside.json', '..%2fpackage.json', 'README.md']) {
    assert.equal((await fetch(server.url + route)).status, 404, route);
  }
});

test('CLI validation reports errors with a failing status', async t => {
  const { repo } = await fixture(t);
  assert.equal(cli(repo, 'validate').status, 0);
  const index = path.join(repo, APP, 'index.html');
  await write(index, (await fs.readFile(index, 'utf8')).replace(/style\.css\?v=\d+/, 'style.css?v=999'));
  const invalid = cli(repo, 'validate');
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /versions differ/);
});

test('browser checks complete the candidate through the production renderer', { timeout: 180000 }, async t => {
  if (process.env.TOPICS_BROWSER !== '1') return t.skip('Set TOPICS_BROWSER=1 to run the browser integration test.');
  const { repo } = await fixture(t);
  const module = path.join(repo, 'topic-drafts/example/pipeline-example/topic.mjs');
  await write(module, customSource());
  const preview = cli(repo, 'preview', 'example', '--no-serve');
  assert.equal(preview.status, 0, preview.stderr);
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI, 'check', 'example'], { cwd: repo, env: { ...process.env, TOPICS_REPO: repo }, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', status => resolve({ status, output }));
  });
  assert.equal(result.status, 0, result.output);
  const report = await json(path.join(repo, '.topic-state/example/checks.json'));
  assert.equal(report.passed, true);
  assert.equal(report.results.length, 2);
  assert.ok(report.results.every(result => result.played === 10));
  const review = await json(path.join(repo, '.topic-state/example/review.json'));
  assert.equal(review.checked, true);
  assert.equal(review.checkRevision, review.revision);
  // A modified marker cannot reuse the passing report or reach an external command.
  const markerPath = path.join(review.candidate, 'release.json');
  const markerText = await fs.readFile(markerPath, 'utf8');
  await write(markerPath, markerText + '\n');
  const invalid = cli(repo, 'deploy', 'example', '--review-model', 'Test Model', '--fix-model', 'Test Model');
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /marker changed/);
  await write(markerPath, markerText);
  const batch = await readBatch(repo, 'example');
  const head = git(repo, 'rev-parse', 'HEAD').trim();
  const attribution = 'Review: Test Review Model.\nFixes: Test Fix Model.';
  const release = await prepareCommits(repo, batch, review, attribution);
  assert.equal(release.commits.length, 2);
  assert.equal(git(repo, 'rev-parse', 'HEAD').trim(), head);
  assert.equal(await treeHash(path.join(release.worktree, APP)), review.revision);
  assert.match(git(release.worktree, 'log', '-1', '--format=%B'), /Review: Test Review Model/);
  assert.match(git(release.worktree, 'log', '-1', '--format=%B'), /Fixes: Test Fix Model/);
});
