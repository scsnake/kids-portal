#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { APP, validId, git, json, write, writeJson, readBatch, treeHash, snapshot, buildCandidate,
  validateCatalog, serve, newState, releaseModels, changedFiles, prepareCommits, readCourse, digest } from './lib/topics.mjs';

const run = promisify(execFile);
const toolkit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = process.env.TOPICS_REPO || git(toolkit, 'rev-parse', '--show-toplevel').trim();
const [command = 'help', ...args] = process.argv.slice(2);
const options = {};
const positionals = [];
const flags = new Set(['execute', 'no-serve', 'quick']);
for (let i = 0; i < args.length; i++) {
  if (!args[i].startsWith('--')) { positionals.push(args[i]); continue; }
  const key = args[i].slice(2);
  if (flags.has(key)) options[key] = true;
  else {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for --${key}.`);
    options[key] = args[++i];
  }
}
const id = positionals[0];
const stateFile = batch => path.join(repo, '.topic-state', batch, 'review.json');
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const print = value => process.stdout.write(typeof value === 'string' ? value + '\n' : JSON.stringify(value, null, 2) + '\n');

async function reviewed(batchId) {
  const batch = await readBatch(repo, batchId);
  const review = await json(stateFile(batchId));
  const stateRoot = path.join(repo, '.topic-state', batchId) + path.sep;
  if (![review.candidate, review.baseline].every(directory => path.resolve(directory).startsWith(stateRoot))) throw new Error('Invalid review artifact path.');
  if (review.draftHash !== batch.hash) throw new Error('Drafts changed. Create and review a new preview.');
  if (await treeHash(review.candidate) !== review.revision) throw new Error('The reviewed artifact changed. Create a new preview.');
  const marker = await json(path.join(review.candidate, 'release.json'));
  if (marker.id !== review.revision) throw new Error('The release marker does not match the reviewed artifact.');
  if (digest(await fs.readFile(path.join(review.candidate, 'release.json'))) !== review.markerHash) throw new Error('The release marker changed. Create a new preview.');
  if (await treeHash(review.baseline) !== review.baselineHash) throw new Error('The comparison baseline changed. Create a new preview.');
  return { batch, review };
}

async function createTopic() {
  if (!validId(id) || !validId(options.after) || !validId(options.stage)) throw new Error('Use: new <topic-id> --after <unit-id> --stage <stage-id> [--batch <batch-id>].');
  const batchId = options.batch || id;
  if (!validId(batchId)) throw new Error('Invalid batch ID.');
  const directory = path.join(repo, 'topic-drafts', batchId);
  let manifest;
  try { manifest = await json(path.join(directory, 'batch.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; manifest = { topics: [] }; }
  if (manifest.topics.includes(id)) throw new Error('This draft already exists.');
  const location = path.join(directory, id, 'topic.mjs');
  try { await fs.access(location); throw new Error('The draft file already exists.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const { course } = await readCourse(path.join(repo, APP), true);
  const preceding = course.units.find(unit => unit.id === options.after);
  if (!preceding) throw new Error('The preceding unit does not exist.');
  const part = course.stages.find(stage => stage.id === options.stage)?.part || preceding.part;
  const literal = JSON.stringify;
  const source = `// Edit this source, then regenerate the preview. Keep unit and slide IDs stable.\nexport default {\n  ready: false,\n  unit: {\n    id: ${literal(id)}, part: ${literal(part)}, icon: '🔎', title: '新主題', en: 'New Topic',\n    desc: '請填寫這個單元要學什麼', color: '#0f766e',\n    slides: [\n      { id: 'explore', title: '一起探索', text: '請把這裡換成主題說明。',\n        widget: 'choice', params: { question: '這個單元要教什麼？',\n          options: [{ text: '請填寫正確答案', correct: true }, { text: '請填寫其他選項' }],\n          explain: '請填寫答案的說明。' } },\n      { id: 'quiz', title: '考考你', widget: 'choice',\n        params: { question: '學完後，你會怎麼做？',\n          options: [{ text: '請填寫正確答案', correct: true }, { text: '請填寫其他選項' }],\n          explain: '請填寫答案的說明。' } },\n    ],\n  },\n  placement: { after: ${literal(options.after)}, stage: ${literal(options.stage)} },\n  prerequisites: [${literal(options.after)}],\n  readme: 'Describe this topic in one sentence.',\n  changelog: '請填寫家長看得懂的更新說明。',\n  widgets: {},\n  css: '',\n  checks: {},\n};\n`;
  await write(location, source);
  manifest.topics.push(id);
  await writeJson(path.join(directory, 'batch.json'), manifest);
  print(`Draft: ${path.relative(repo, location)}\nNext: node scripts/topics.mjs preview ${batchId}`);
}

async function preview() {
  const batch = await readBatch(repo, id);
  const { state, build } = await newState(repo, id);
  const baseline = path.join(build, 'baseline');
  const candidate = path.join(build, 'candidate');
  const baseCommit = git(repo, 'rev-parse', 'HEAD').trim();
  const date = today();
  await snapshot(repo, baseline, baseCommit);
  await buildCandidate({ baseline, destination: candidate, batch, date });
  const summary = await validateCatalog(candidate, { allowDrafts: true });
  const revision = await treeHash(candidate);
  await writeJson(path.join(candidate, 'release.json'), { id: revision, baseCommit, topics: batch.topics, assetsVersion: summary.version });
  const changed = await changedFiles(baseline, candidate);
  const review = { batch: id, baseCommit, date, draftHash: batch.hash, revision,
    markerHash: digest(await fs.readFile(path.join(candidate, 'release.json'))), baselineHash: await treeHash(baseline), baseline, candidate, changed, checked: false };
  await writeJson(stateFile(id), review);
  print({ revision, baseCommit, topics: batch.topics, changed, state: path.relative(repo, state) });
  if (!options['no-serve']) {
    const server = await serve(candidate, { port: Number(options.port || 8766), host: options.host || '127.0.0.1' });
    print(`Preview: ${server.url}#/u/${batch.topics[0]}/0`);
    print('This snapshot stays fixed. Edit drafts and run preview again for a new revision.');
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await server.close(); process.exit(0); });
  }
}

async function check(batchId, quick = false) {
  const { batch, review } = await reviewed(batchId);
  const summary = await validateCatalog(review.candidate);
  const plan = { topics: batch.topics, checks: Object.fromEntries(summary.entries.filter(entry => batch.topics.includes(entry.topic.unit.id))
    .map(({ topic }) => [topic.unit.id, topic.checks || {}])) };
  const planPath = path.join(path.dirname(stateFile(batchId)), 'test-plan.json');
  const reportPath = path.join(path.dirname(stateFile(batchId)), quick ? 'quick-check.json' : 'checks.json');
  await writeJson(planPath, plan);
  const current = await serve(review.candidate);
  const previous = await serve(review.baseline);
  try {
    const argv = ['run', '--no-project', '--python', '3.12', '--with', 'playwright', 'python',
      path.join(toolkit, 'tests/topics/browser.py'), '--base', current.url, '--baseline', previous.url,
      '--plan', planPath, '--report', reportPath];
    if (quick) argv.push('--quick');
    const process = await run('uv', argv, { cwd: repo, maxBuffer: 8 * 1024 * 1024, timeout: 15 * 60 * 1000 });
    print(process.stdout.trim());
  } finally { await current.close(); await previous.close(); }
  const report = await json(reportPath);
  if (!report.passed || report.quick !== quick) throw new Error('Browser checks did not pass.');
  if (!quick) {
    review.checked = true;
    review.checkRevision = review.revision;
    review.checkReportHash = digest(await fs.readFile(reportPath));
    await writeJson(stateFile(batchId), review);
  }
  return review;
}

async function verifyReport(review) {
  if (!review.checked || review.checkRevision !== review.revision) return false;
  try { return digest(await fs.readFile(path.join(repo, '.topic-state', review.batch, 'checks.json'))) === review.checkReportHash; }
  catch { return false; }
}

async function waitForRelease(readMarker, expected, label) {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    try { if ((await readMarker()).id === expected) { print(`${label}: verified ${expected}`); return; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  throw new Error(`${label} did not serve the reviewed revision within five minutes.`);
}

async function deploy() {
  const { batch, review } = await reviewed(id);
  const attribution = releaseModels(options);
  const planned = { revision: review.revision, baseCommit: review.baseCommit, topics: batch.topics,
    checked: await verifyReport(review), changed: review.changed, attribution,
    staging: 'https://kids-tech-test.scsnake.xyz/', production: 'https://kids-tech.scsnake.xyz/' };
  print(planned);
  if (!options.execute) { print('Plan only. Use --execute after the owner approves this preview.'); return; }
  if (git(repo, 'rev-parse', 'HEAD').trim() !== review.baseCommit) throw new Error('HEAD changed after preview. Regenerate and review the candidate.');
  if (!await verifyReport(review)) Object.assign(review, await check(id));
  git(repo, 'fetch', 'origin', 'main');
  git(repo, 'merge-base', '--is-ancestor', 'origin/main', review.baseCommit);
  const previousProduction = review.deployment?.previousProduction || git(repo, 'rev-parse', 'origin/main').trim();
  const deployment = review.deployment || await prepareCommits(repo, batch, review, attribution);
  if (review.deployment && review.deployment.attribution !== attribution) throw new Error('Use the model attribution recorded for this prepared release.');
  review.deployment = { ...deployment, previousProduction, phase: 'prepared', attribution };
  await writeJson(stateFile(id), review);
  git(repo, 'push', 'origin', `${deployment.releaseCommit}:refs/heads/staging`);
  review.deployment.phase = 'staging-pushed';
  await writeJson(stateFile(id), review);
  const trigger = 'TOK=$(grep "^COOLIFY_TOKEN=" ~/.env | cut -d= -f2-) && test -n "$TOK" && curl -fsS -m 30 -X POST -H "Authorization: Bearer $TOK" "http://100.68.55.39:8000/api/v1/deploy?uuid=akwcwcgs84o0ckks40osk4gk"';
  await run('ssh', ['cthgpu', trigger], { timeout: 40000 });
  const stagingMarker = async () => {
    const { stdout } = await run('ssh', ['cthgpu', 'curl -fkSs -m 15 --resolve kids-tech-test.scsnake.xyz:8444:127.0.0.1 https://kids-tech-test.scsnake.xyz:8444/release.json'], { timeout: 20000 });
    return JSON.parse(stdout);
  };
  await waitForRelease(stagingMarker, review.revision, 'Staging');
  review.deployment.phase = 'staging-verified';
  await writeJson(stateFile(id), review);
  git(repo, 'push', 'origin', `${deployment.releaseCommit}:refs/heads/main`);
  review.deployment.phase = 'production-pushed';
  await writeJson(stateFile(id), review);
  await waitForRelease(async () => {
    const response = await fetch(`https://kids-tech.scsnake.xyz/release.json?revision=${review.revision}`, { signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, review.revision, 'Production');
  review.deployment.phase = 'production-marker-verified';
  await writeJson(stateFile(id), review);
  const planPath = path.join(path.dirname(stateFile(id)), 'test-plan.json');
  await run('uv', ['run', '--no-project', '--python', '3.12', '--with', 'playwright', 'python', path.join(toolkit, 'tests/topics/browser.py'),
    '--base', 'https://kids-tech.scsnake.xyz/', '--baseline', 'https://kids-tech.scsnake.xyz/', '--plan', planPath,
    '--report', path.join(path.dirname(stateFile(id)), 'production-checks.json'), '--quick'], { timeout: 5 * 60 * 1000 });
  review.deployment.phase = 'production-verified';
  await writeJson(stateFile(id), review);
  print({ deployed: deployment.releaseCommit, revision: review.revision, previousProduction,
    rollbackCommits: [...deployment.commits].reverse(), note: 'The release worktree is preserved. Your original worktree is unchanged.' });
}

async function main() {
  if (command === 'help') {
    print('Topic workflow (Node 22+ and uv):\n  new <id> --after <unit> --stage <stage> [--batch <batch>]\n  preview <batch> [--host 0.0.0.0] [--port 8766] [--no-serve]\n  validate\n  check <batch> [--quick]\n  deploy <batch> --review-model NAME --fix-model NAME [--execute]\n\nDrafts: topic-drafts/<batch>/. Review artifacts: .topic-state/<batch>/.\nPreview uses committed HEAD. Commit shared engine changes before previewing new topics.');
  } else if (command === 'new') await createTopic();
  else if (command === 'preview') await preview();
  else if (command === 'validate') {
    const result = await validateCatalog(path.join(repo, APP));
    print({ valid: true, units: result.units, stages: result.stages, slides: result.slides, version: result.version });
  } else if (command === 'check') await check(id, !!options.quick);
  else if (command === 'deploy') await deploy();
  else throw new Error(`Unknown command: ${command}`);
}

main().catch(error => { process.stderr.write(`${error.message}\n${error.stderr || ''}\n`); process.exitCode = 1; });
