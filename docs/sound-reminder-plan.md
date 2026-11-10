# Sound challenges and daily reminders

## Delivery slices

1. MVP: personal-expression sound challenges, separate recall evidence, sourced phonemic transcriptions, phone-friendly controls, preserved backups and progress.
2. Phase 2: today's bounded task plan, remaining counts and configurable reminders defaulting to 20:00 Australia/Brisbane; durable private subscriptions, server delivery and installed-iPhone verification.
3. Deferred: leaderboards, competitive timers, and automatic acoustic pronunciation scores.

Both delivery slices are required. Local UI or mocked push tests do not establish completion.

## Acceptance

- Match reviewed target words to imported expressions and sentences without changing content IDs or lesson membership. Never turn an unverified transcription into a scored answer.
- Offer context plus IPA to recall a word, full IPA assembly including stress and distractors, and correction of one deliberately altered sound.
- Show the correction after every answer. Track independent first attempts separately from answers revealed or retried. Sound mistakes must not change meaning progress.
- Label the dictionary reference accent. Device speech is a listening aid and may differ from the reference transcription.
- Keep existing daily worlds, Dot, three destinations, readable mobile text, accessible focus and touch targets.
- Count only today's planned new expressions, reviews and sound challenges. Preserve a stable plan during the day; completion is not a claim of mastery.
- Default reminders to 20:00 Brisbane, allow pause/time changes, skip completed days, deduplicate delivery, and open unfinished work from the notification.
- Store only the minimum reminder state remotely. Keep private subscription endpoints and credentials out of public content and logs. Show stale/offline synchronization honestly.
- Verify existing storage compatibility, focused game and count rules, mobile WebKit flows, publication, and an actual push to the installed iPhone.

## Current evidence

Implementation started from clean main at 4c5a1df. The combined games, task plan, reminder UI and sourced-target import passed 85 unit/integration tests and 44 desktop/mobile browser tests, plus type checking, lint, formatting and production build. A mobile screenshot exposed excessive instructional height; the tightened phone layout and reachable action row were subsequently inspected. One additional regression verifies that imported targets take priority over incidental example words.

The in-app reminder defaults to 20:00 Brisbane, supports pause/time changes and persists dismissal. It explicitly states that phone push is not yet connected. Upstash Free provisioning was requested with automatic paid upgrades disabled; the CLI exited after timing out waiting for the owner's terms acceptance. No resource creation has been verified. Do not treat that expired process as a live installer. No backend reminder route or scheduled push is implemented yet.

Five dictionary-checked target words are available: vain, versatile, head, comfort and reassure. Reviewed feed imports can now carry up to three sourced targets per expression without a code release, and the source runbook specifies how to prepare them. A real scheduled import of that field remains to be verified, and broader existing-word coverage is still required.

The open-dict-data/ipa-dict UK wordlist was inspected privately at 972cd67dd5f96bc5660e28070cde26e3928abcd7. It uses stress placement/transcriptions that differ from the teaching reference and has ambiguous-reading limitations; it was not bundled or used for scoring. Unknown targets remain unavailable rather than receiving guessed IPA.
