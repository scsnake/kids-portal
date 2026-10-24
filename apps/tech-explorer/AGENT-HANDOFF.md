# Agent preview and deployment handoff

Use this guide when Gemini, Claude, or another agent creates lessons or redesigns existing activities.
Read [TOPICS.md](TOPICS.md), [DESIGN.md](DESIGN.md), and [REDESIGN-STATUS.md](REDESIGN-STATUS.md) first.

## Choose the supported path

| Work | Source | Preview and release path |
|---|---|---|
| Add a topic unit | `topic-drafts/<batch>/<topic>/topic.mjs` | Use `scripts/topics.mjs`; follow TOPICS.md. |
| Change a packaged topic | Existing `topics/<topic>/topic.mjs` in an isolated branch | Use a manual integration release; keep IDs and synchronize registration, source hashes, and any maintained draft. |
| Replace an existing legacy activity | Real app modules, styles, and the existing slide in `js/units.js` | Use an isolated branch and the actual course renderer. Follow the legacy steps below. |

The topic CLI does not load a legacy redesign manifest or preview-only widget bundle.
Its preview and deployment commands support adding topics, not replacing an existing topic package.
An existing topic ID is rejected. Do not promise an automatic update path that the CLI does not implement.
A manifest records scope and checks. It does not register widgets, import CSS, or replace slides automatically.
Do not describe a proposed pipeline as an implemented feature.

## Start from the current release

1. Inspect `git status` and preserve unrelated changes.
2. Fetch `origin/main` and record its full commit ID.
3. Check the live `release.json` and record its revision.
4. Create a separate branch or worktree from the matching release baseline.
5. Record the branch, worktree, base commit, and changed files in the handoff.

An old preview branch may predate deployed fixes. Do not use it as the release baseline without checking its ancestry.
Do not push, deploy, or merge until the owner requests deployment of a specific preview revision.

## Build deployable legacy activities

1. Implement widgets in real modules under `apps/tech-explorer/js/`.
2. Export each widget through the real `WIDGETS` registry.
3. Load scoped styles through the real application entry point.
4. Replace the intended slide using its unit ID and existing title, not its numeric index.
5. Keep unit IDs, slide titles, order, and saved progress identities unchanged unless the owner approves migration.
6. Use `api.done()` for completion and the existing replay lifecycle for cleanup.
7. Cancel timers and remove listeners when a widget unmounts.
8. Keep keyboard operation, tap alternatives to dragging, and reduced-motion behavior working.
9. Preserve the documented course design and use zh-TW copy.
10. Update README summaries, the changelog, and the renewal list.

Use unique CSS prefixes and widget names. Scope badges and reduced-motion rules to the widget bundle.
Do not apply global resets that change unrelated lessons.
Keep labels readable and touch targets at least 44 × 44 pixels.
Check initial, animated, completed, error, and replay states. Completion messages must not hide controls or lesson navigation.
Check clipping inside simulated phones and panels, not only document overflow.

Use the existing widget API. Do not invent API methods without changing and testing the shared renderer.
Keep safety simulations local. Do not execute commands, inspect real passwords, or send attack traffic.
Mark simulated values. Record sources and open factual questions before approval.

## Preview the actual course

For new topics, use the immutable preview command in TOPICS.md.
For legacy changes, serve the isolated worktree's real app from that worktree's repository root:

```sh
node --input-type=module -e 'import {serve} from "./scripts/lib/topics.mjs"; const preview = await serve("apps/tech-explorer", {host:"0.0.0.0",port:8768}); console.log(preview.url);'
```

1. Give the owner a reachable LAN address, not `0.0.0.0` or an agent-only localhost address.
2. Include direct links such as `#/u/devices/1` for each changed activity.
3. Show the real course header, lesson text, progress, replay, and navigation.
4. Commit the review candidate and record its commit ID and app revision hash.
5. Keep that candidate fixed while the owner reviews it.
6. Create a new candidate revision after feedback or code changes.

A separate gallery may help compare designs. It cannot replace the real-course preview or its tests.
Never maintain a second copy of production widget logic inside the gallery.
Do not rely on untracked files, symlinks, absolute local imports, or files outside the deployment root.

## Required handoff files

| File or evidence | Required content |
|---|---|
| Production source | Widget modules, real imports, registry entries, styles, and slide replacements. |
| Scope record | Unit IDs, stable slide identities, widget names, exact paths, inclusions, and exclusions. |
| Interaction checks | Real selectors, expected results, completion, replay, and important alternate paths. |
| Test report | Candidate revision, browser engines, sizes, motion modes, commands, results, and known failures. |
| Screenshots | Actual course at both iPad orientations and desktop; include completed states. |
| Content notes | Sources, simulations, safety limits, and unresolved factual questions. |
| Catalog updates | README, changelog, placement where applicable, and REDESIGN-STATUS.md. |
| Handoff summary | Branch, base, candidate, preview links, files, approval evidence, exclusions, and remaining work. |

The current medium batch uses `tests/redesign/medium/manifest.json` and `checks.json` as its scope and interaction records.
These records must contain valid JSON and resolvable paths. Do not use an unimplemented schema URL.
Future batches must extend the checked-in runner or supply an equivalent runnable test. Merely adding a manifest does nothing.

## Verification before handoff

1. Run `node scripts/topics.mjs validate`.
2. Run the full topic `check` command for new topic batches.
3. Run completion and replay checks for every changed legacy widget in Chromium and WebKit.
4. Test 1180 × 820 and 820 × 1180 touch viewports, plus 1280 × 800 and 1280 × 680 desktops.
5. Test reduced motion and inspect any additional target device requested by the owner.
6. Run the whole-course layout comparison against the committed baseline.
7. Run the home-return tests. Confirm previous stars and saved progress remain readable.
8. Inspect initial and completed screenshots after animations settle.
9. Report console errors, clipping, inaccessible controls, and existing baseline defects separately.
10. Rerun affected checks after fixes. Bind reports to the final candidate revision.

For the currently registered legacy batches:

```sh
uv run --no-project --python 3.12 --with playwright python tests/redesign/browser.py \
  --group all --base http://127.0.0.1:8768/ --report /tmp/redesign-checks.json
uv run --no-project --python 3.12 --with playwright python tests/navigation/home-return.py \
  --base http://127.0.0.1:8768/
```

A smoke test does not authorize release. A gallery-only test does not establish production readiness.
Do not say “all pages verified” when only selected screenshots or happy paths were checked.

## Deployment agent checklist

1. Confirm approval identifies the exact candidate and exclusions.
2. Compare the candidate with current production. Preserve newer deployed fixes.
3. Review source and content changes; inspect each changed activity's interaction and layout evidence.
4. Resolve material issues, or explicitly defer the affected activities with the owner.
5. Complete the required independent review when the applicable design workflow requires it.
6. Update cache versions across changed entry points and module imports.
7. Compute the app revision and write `release.json` using the release workflow's hash rules.
8. Create commits with actual implementation, review, and fix model attribution. Keep hooks enabled.
9. Push staging, trigger deployment, and verify its exact release marker and runtime assets.
10. Push production only after staging verification. Verify Cloudflare serves the same revision and assets.
11. Run live interaction and home-return checks. Record failures without claiming success.
12. Merge or synchronize the approved branches without overwriting unrelated work.
13. Update REDESIGN-STATUS.md with the release version and exclusions.
14. Report the live URL, revision, commits, tests, and rollback reference.

Legacy replacements and existing package updates currently need an integration release.
`topics.mjs deploy <batch>` is not a generic redesign or existing-topic update command.
Keep release worktrees and reports until acceptance. Roll back with a forward revert, never a force push.

## Copy this handoff summary

```text
Batch:
Author/model (exact, or unknown):
Branch and worktree:
Base commit and baseline release:
Candidate commit and revision:
Preview URL and direct lesson links:
Included unit/slide/widget mappings:
Excluded or deferred work:
Production files and catalog updates:
Test commands, reports, sizes, engines, and results:
Screenshot paths and reviewed states:
Content sources and unresolved questions:
Owner approval and approved revision:
Remaining integration or deployment work:
```
