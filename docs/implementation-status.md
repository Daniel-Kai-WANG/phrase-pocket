# Implementation status

Checked 10 November 2026 (Brisbane).

## Published application

- Public feed revision 2 contains 144 personal expressions and nine Daily Three lessons (27 expressions), including 10 November. Eight uncertain source items remain outside the recall queue.
- GitHub repository: `Daniel-Kai-WANG/phrase-pocket`. Frontend publication uses GitHub Pages Actions and uploads only the static build.
- Backend: `daniel-backup-projects/phrase-pocket-coach`. The verified staged deployment returns health 200 and rejects unauthenticated assessment requests with 401.
- Production credentials, provider key and the Pages allowed origin are configured. Health reports `coachConfigured: true`; authenticated live requests have succeeded.
- Private imports, raw conversation data, credentials, recordings and local build artifacts are excluded from publication. The publishable file scan found no credential patterns.

## Verified

- 69 unit/integration tests across 16 files passed.
- All 36 browser tests passed across desktop Chromium and mobile WebKit. Coverage includes search, hints, history, responsive overflow, retry without false progress, hinted recall, plan persistence, daily scenes and resetting scroll when switching tabs.
- Type checking, lint, formatting checks and the production frontend build passed.
- Earlier manual checks verified offline recall, service-worker updates, backup recovery and preservation of learning progress during feed sync.
- The separate live semantic evaluation passed 20/20 cases after correcting a grammar-versus-meaning judgement issue. This is bounded evaluation evidence, not a guarantee of perfect future judgements.
- Live custom plans generated six expressions through the API and nine through the published website's preview. The preview was not added to personal learning progress.
- Synthetic speech passed raw-audio feedback, transcription and conversational reply. A valid silent WAV returned `audioUsable: false` with no invented transcript. This does not verify a real microphone.
- The installed iPhone app loaded the new daily-world design and retained its learning data. Microphone, playback and offline launch still need real-device checks; the latest mirror attempt could not find the phone.
- Real daily generation passed in workflow run `42776287964`, producing an English-only three-expression preview without changing published content. Daily scheduling is enabled for approximately 06:17 Brisbane; the first scheduled generation-to-publication run remains unverified.
- The personal-source checkpoint matches published revision 2, and the hourly desktop bridge is active. No new source turn was available to exercise scheduled publication.

## Implemented

- Searchable phrase library, English-only explanations, scenario recall, progressive hints, hint-aware spaced review and a memory trail.
- Daily lesson history, custom-plan preview and lifecycle, device-local progress and backups.
- Recording and replay, separate transcript and raw-audio feedback routes, and private coaching endpoints with origin/credential checks.
- PWA icons, scoped service worker, offline static content and explicit update/reload controls.
- Reviewed content import, source continuity checks, daily lesson generation and exact-revision publication workflows.

## Still required

- Verify the first scheduled daily content commit and dependent Pages release. The original daily conversation schedule remains active until that succeeds; a temporary hourly verification task will then request and verify its pause.
- Verify a new personal source turn through scheduled publication. Current conversation reads expose only five recent turns; they do not prove a complete fresh history export.
- Complete pending source-context/pronunciation review. The app fetches the published feed; it cannot read a private conversation itself.
- Finish the installed iPhone's private coach connection and verify microphone, playback, offline launch and the latest tab-scroll fix. The request limiter is per process, not a durable global spending cap.

## Browser handling

Use the user's original GitHub and Vercel Chrome tabs. Native UI control works after exiting Chrome full screen; do not open replacement tabs for deployment.
