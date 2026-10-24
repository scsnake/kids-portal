# Tech-explorer agent workflow

Read `DESIGN.md`, `README.md`, and `TOPICS.md` before adding topics.
Read `AGENT-HANDOFF.md` before creating previews or handing work to a deployment agent.
Check `REDESIGN-STATUS.md` before selecting activities for another redesign batch.
`TOPICS.md` is the shared source for preview, validation, and deployment steps.

## Owner checkpoints

1. Build the requested topics as draft packages.
2. Give the owner a preview link and revision identifier.
3. Apply feedback to drafts and create a new preview revision.
4. When the owner says “deploy this preview,” run the release workflow.

That deployment instruction includes promotion, tests, commits, staging, and production verification.
Do not request another “apply” confirmation for that approved revision.
Do not publish merely because the owner approved implementing the workflow itself.

## Source and catalogs

- Create new packages with `node scripts/topics.mjs new ...` from the repository root.
- Keep draft packages outside the published application, under `topic-drafts/`.
- Preview and production must use the same topic source and renderer.
- Keep unit and slide IDs stable. Existing browser progress must remain readable.
- Include placement, prerequisites, README summary, changelog text, and custom-widget checks.
- Use unique widget names and CSS prefixes. Keep Chinese copy in zh-TW.
- Do not copy new packages into the legacy lesson arrays or use the old regex merge scripts.

## Verification and release

- Run `node scripts/topics.mjs validate` and the batch's full `check` command.
- A quick check cannot authorize deployment. Changed drafts need a new preview.
- The checked-in browser runner mutes audio and tests Chromium and WebKit.
- Use actual model names in `--review-model` and `--fix-model`.
- Never claim an independent review unless one occurred.
- Keep hooks enabled. Never force-push production.
- Preserve unrelated changes and the original worktree. Releases use an isolated worktree.
- Report the live revision after deployment, or the saved failed phase if verification fails.

Test pipeline changes with `TOPICS_BROWSER=1 node --test tests/topics/pipeline.test.mjs`.
