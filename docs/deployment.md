# Publication runbook

The frontend targets `Daniel-Kai-WANG/phrase-pocket` on GitHub Pages. The coaching backend targets a separate `phrase-pocket-coach` project in Vercel team `daniel-backup-projects`. The GitHub repository and Vercel project have been created. The backend health and credential rejection paths have passed deployment checks; live coaching remains unavailable until the provider key is configured.

## Release prerequisites

1. Complete local checks and the live coaching acceptance cases. Mock provider responses do not establish feedback quality.
2. Finish sign-in in the original GitHub browser tab. Use the existing Vercel tab for the intended team; do not start commands that auto-open login tabs.
3. Review the repository contents before the first publication. Raw conversation exports and private import batches stay outside this repository. Do not upload `.env.local`, browser state or recordings.
4. Configure the backend project with the Hono preset and the repository root. `index.ts` exports the existing application. `vercel.json` runs type checking and uses the native Hono backend build. Runtime imports use explicit JavaScript extensions for Node ESM.
5. Set server-only `OPENAI_API_KEY`, `COACH_ACCESS_TOKEN` and `ALLOWED_ORIGIN` in Vercel. The access code must have at least 24 characters. Use `https://daniel-kai-wang.github.io` as the Pages origin; the repository path is not part of an origin. Model variables are optional.
6. Verify backend health, rejection of unauthorized requests, live semantic feedback, a full custom plan, and raw-audio feedback. Check deployment logs for failures without logging request bodies or credentials. The in-process burst limiter is not a durable global spending cap.
7. Set GitHub repository variable `COACH_API_URL` to the verified HTTPS backend origin. Select GitHub Actions as the Pages publishing source. Restrict release and secret-bearing workflows to reviewed `main` code.

## Frontend publication

`.github/workflows/pages.yml` runs tests, type checking, lint, formatting checks and the static build. It uploads only `dist`. Pages supplies the base path, so project sites and a future custom-domain root use the appropriate asset and service-worker scope.

Pull requests run checks without publishing. Main-branch changes and manual runs publish the checked artifact. The reusable entry point also accepts the exact content revision produced by the daily publisher. Action versions are pinned to upstream release commits.

After publication, open the actual Pages URL in the existing preview tab. Verify search, a recall scene, retained progress after reload, the live coach, a daily lesson and plan completion. On iPhone, check Safari microphone permission, playback, Add to Home Screen, offline launch and the update flow. Record limitations instead of treating a desktop screenshot as device verification.

## Daily publication

`.github/workflows/daily.yml` is configured for approximately 06:17 Brisbane time each day (20:17 UTC on the preceding date). GitHub scheduled jobs can be delayed; this is not an exact delivery-time guarantee.

Configure `OPENAI_API_KEY` in the `content-publishing` environment, restricted to the reviewed main branch. Run and verify a manual publication before setting repository variable `DAILY_UPDATES_ENABLED=true`; scheduled generation stays disabled until then. An optional `OPENAI_TEXT_MODEL` variable overrides the default. The workflow generates up to seven missing dates per run, preserving existing lesson membership. Completed pages are written atomically. A failed provider call stops the job before any remote publication.

The publisher commits only `public/content.json`, pushes without forcing, then calls the Pages workflow using that exact revision. A repeated run with no changes creates no commit. A competing source update causes the push to fail rather than overwrite it; rerun from the updated main branch. A gap longer than seven days is published in bounded batches across successive runs.

If the content push succeeds but Pages publication fails, run **Verify and publish pocket** on main to publish the existing content; do not regenerate it. Main-branch pushes publish the frontend once Pages is configured. Daily scheduled generation additionally requires its explicit enable variable.

## Personal source synchronization

`npm run content:import -- /absolute/path/to/reviewed-batch.json` merges an English-only reviewed source batch into the public feed without changing device progress. Keep raw source and batch files outside the repository. `sourceBatchSchema` defines the batch format and requires an explicit publication review flag.

The desktop source bridge is not active yet. Current source reads expose only five recent turns. `content:check-source` checks overlap with the last published turn and refuses to treat a missing boundary as a successful import. See [the source continuity and recovery procedure](personal-sync.md). The app's **Sync now** fetches the published feed; it does not itself read a private conversation.

## Recovery

Keep previous deployment URLs and the content commit id in the release record. Roll back the backend through Vercel's deployment controls if a release regresses. Republish the last working frontend source to recover its code, while retaining the latest valid content feed. Do not decrease feed revisions or replace established lesson membership as a code rollback shortcut. Device learning data is independent; export a backup before intentionally restoring older progress.

## Platform references

- [Hono deployment on Vercel](https://vercel.com/docs/frameworks/backend/hono)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub scheduled workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
