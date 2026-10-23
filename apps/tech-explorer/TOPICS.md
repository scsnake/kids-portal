# Topic preview and release workflow

Use this workflow for new tech-explorer topics. It replaces preview copying and regex-based merging.
The owner requests topics, reviews previews, requests changes, and then says “deploy this preview.”
That instruction authorizes the release steps. Do not request a separate “apply” approval.

## Requirements

- Node 22 or later, Git, and `uv`.
- Playwright browsers: `uv run --with playwright playwright install chromium webkit`.
- Deployment needs the existing Git remote, SSH access to `cthgpu`, and its existing Coolify token.

Run commands from the repository root. The checked-in browser runner mutes audio and speech.

## Author and preview

1. Use a separate branch or worktree for each topic batch.
2. Commit shared engine changes first. Previews use committed `HEAD` as their baseline.
3. Create a draft:

   ```sh
   node scripts/topics.mjs new example-topic --after malwareholes --stage security --batch example-batch
   ```

4. Edit `topic-drafts/example-batch/example-topic/topic.mjs`.
5. Keep unit and slide IDs stable when changing titles or wording.
6. Set `ready: true` when content and checks are complete.
7. Create the preview:

   ```sh
   node scripts/topics.mjs preview example-batch --host 0.0.0.0 --port 8766
   ```

8. Give the owner the printed link, replacing `0.0.0.0` with this computer’s LAN address.
9. Include the revision identifier and a short change description.
10. After feedback, edit the draft, stop the server, and repeat the preview command.

Each preview is a fixed snapshot. Editing drafts does not change an existing preview.
Preview and production use the same renderer, lesson source, widgets, and styles.
Drafts stay outside the published app. Use `--no-serve` to prepare a snapshot without starting its server.

## Topic package

Each module exports one object:

- `unit`: ID, part, icon, title, English title, description, color, and two to seven slides.
- `placement`: preceding unit and target stage. Optional `newStage` defines a stage and its preceding stage.
- `prerequisites`: unit IDs that must come earlier.
- `readme` and `changelog`: catalog summary and parent-facing update text.
- `widgets`: optional widget functions with unique names.
- `css`: optional styles with a unique prefix.
- `checks`: interaction steps for custom widgets, keyed by slide ID.
- `ready`: whether the package can pass release checks.

The builder generates registration, stage membership, README numbering, stage counts, changelog entries, release dates, and cache versions.
Existing lessons can remain in `units.js` and `widgets.js`. New packages need no copying into those files.
New progress uses `unit-id/slide-id`. Existing progress keeps its original keys.

Define a new stage with:

```js
placement: {
  after: 'iot', stage: 'new-stage',
  newStage: {
    id: 'new-stage', after: 'ainet', part: 'adv',
    icon: '🔎', title: '新的階段', en: 'New Stage',
  },
},
```

A completed stage needs two to five units. Add multiple topics with repeated `new ... --batch <same-batch>` commands.

## Validate and test

```sh
node scripts/topics.mjs validate
node scripts/topics.mjs check example-batch
```

Validation checks IDs, placement, prerequisites, widget names, catalog summaries, changelog entries, and cache versions.
Browser checks use Chromium and WebKit at both iPad orientations and two desktop sizes. New topics also run with reduced motion.
They check new interactions, stars, replay, layout, text size, touch targets, and table-of-contents links.
The whole course receives a layout scan. Existing overflow is compared with the committed baseline and reported separately.
Failures return a nonzero status. Passing reports belong to one exact candidate revision.

`check ... --quick` tests only new topics at iPad sizes. It does not satisfy the deployment gate.
Choice, sort, and order widgets have automatic checks. Other widgets need checks such as:

```js
checks: {
  explore: [
    { action: 'click', selector: '.example-start' },
    { action: 'waitFor', selector: '.example-done' },
    { action: 'expectText', selector: '.example-status', text: '完成' },
    { action: 'expectCount', selector: '.example-item', count: 3 },
  ],
},
```

Supported actions are `click`, `fill`, `waitFor`, `expectText`, and `expectCount`.
Widget completion must award a star. The runner repeats checks after “重新玩.”

## Deploy after approval

### Approved redesign checklist

Use this checklist when an approved preview changes existing lessons.
Owner approval covers the visual direction. Integration checks do not repeat that approval.

1. Preserve the approved source on its branch. Use an isolated release worktree.
2. Map preview activities to actual unit IDs and slide titles. Preview indices may be stale.
3. Connect activities to the production renderer. Preserve titles, IDs, progress keys, and navigation.
4. Synchronize published packages and draft sources. Update registry hashes, catalogs, cache versions, and release notes.
5. Test every changed activity for completion, stars, and replay in Chromium and WebKit.
6. Check tablet orientations, desktop sizes, reduced motion, text size, and touch targets.
7. Scan the full course for new overflow. Compare existing overflow with the deployed baseline.
8. Test shared navigation and saved progress. Check representative screenshots and every reported failure.
9. Correct integration defects without changing the approved visual direction. Repeat the affected checks.
10. Commit the release with implementation, review, and fix attribution. Record the exact content revision.
11. Deploy staging. Verify its release marker before publishing production.
12. Deploy production. Verify the live revision and interactions, then synchronize the release and main branches.

Every changed activity needs automated checks in the actual course.
A separate manual design review of every page is not required.
Preview-only checks do not prove production layout, progress, or replay behavior.

### New topic batches

Inspect the plan:

```sh
node scripts/topics.mjs deploy example-batch \
  --review-model 'actual review model' --fix-model 'actual fix model'
```

After the owner approves that preview, add `--execute` to the command.
Use actual model names. Do not claim an independent review unless one occurred.

The command verifies the revision and report, then creates commits in an isolated worktree.
It creates one commit per unit and a separate asset-version commit. Each commit records the review and fix models.
Hooks run normally. The original worktree and its unrelated changes remain untouched.

The command pushes staging, triggers Coolify over SSH, and verifies `release.json` at the staging origin.
It then pushes production, verifies the same revision on Cloudflare Pages, and runs browser smoke checks.
A failure returns a nonzero status. Inspect the saved deployment phase before retrying.

`.topic-state/<batch>/review.json` records the previous production commit and the release commits for rollback.
Rollback requires a new revert commit. Never force-push production.
Keep the release worktree until acceptance. Synchronize the development branch before starting another batch.

## Test this workflow

```sh
node --test tests/topics/pipeline.test.mjs
TOPICS_BROWSER=1 node --test tests/topics/pipeline.test.mjs
```

These tests use temporary repositories and local servers. They do not push or deploy.
