# Implementation status

Checked 10 November 2026 (Brisbane).

## Publication candidate

- Public feed revision 2 contains 144 personal expressions and nine Daily Three lessons (27 expressions), including 10 November. Eight uncertain source items remain outside the recall queue.
- GitHub repository: `Daniel-Kai-WANG/phrase-pocket`. Frontend publication uses GitHub Pages Actions and uploads only the static build.
- Backend: `daniel-backup-projects/phrase-pocket-coach`. The verified staged deployment returns health 200 and rejects unauthenticated assessment requests with 401.
- Production access credentials and the Pages allowed origin are configured. No provider key is configured; health accurately reports `coachConfigured: false`.
- Private imports, raw conversation data, credentials, recordings and local build artifacts are excluded from publication. The publishable file scan found no credential patterns.

## Verified

- 69 unit/integration tests across 16 files passed.
- All 14 browser tests passed across desktop Chromium and mobile WebKit. Coverage includes search, hints, history, responsive overflow, retry without false progress, hinted recall and plan persistence.
- Type checking, lint, formatting checks and the production frontend build passed.
- Earlier manual checks verified offline recall, service-worker updates, backup recovery and preservation of learning progress during feed sync.
- Provider responses in automated tests are mocked. Browser WebKit is not a real iPhone microphone or installation check.

## Implemented

- Searchable phrase library, English-only explanations, scenario recall, progressive hints, hint-aware spaced review and a memory trail.
- Daily lesson history, custom-plan preview and lifecycle, device-local progress and backups.
- Recording and replay, separate transcript and raw-audio feedback routes, and private coaching endpoints with origin/credential checks.
- PWA icons, scoped service worker, offline static content and explicit update/reload controls.
- Reviewed content import, source continuity checks, daily lesson generation and exact-revision publication workflows.

## Still required

- Configure the provider key and verify live semantic feedback, custom plans and raw-audio feedback. The request limiter is per process, not a durable global spending cap.
- Verify a manual daily publication before enabling `DAILY_UPDATES_ENABLED`. Keep the original daily conversation schedule active until app updates are confirmed.
- Establish a published personal-source checkpoint and activate the currently paused hourly bridge. Current conversation reads expose only five recent turns; they do not prove a complete fresh history export.
- Complete pending source-context/pronunciation review. The app fetches the published feed; it cannot read a private conversation itself.
- Install on the real iPhone with Safari Add to Home Screen and verify microphone, playback and offline launch.

## Browser handling

Use the user's original GitHub and Vercel Chrome tabs. Native UI control works after exiting Chrome full screen; do not open replacement tabs for deployment.
