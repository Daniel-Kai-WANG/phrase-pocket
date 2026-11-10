# Phone reminders

Reminders default to 20:00 Australia/Brisbane. Enable notifications from Pocket settings in the installed iPhone app, then send a test. The checkbox pauses both in-app and connected phone reminders; an online sync must succeed for changes to reach the server. A disconnected or offline phone shows the synchronization error instead of claiming the server was updated.

## Private state

Each browser installation has a separate random device credential, kept outside learning backups. The server stores its hash, push subscription, reminder preferences, remaining task counts and review due dates in the dedicated Upstash Free resource. It does not receive expression text, answers, recordings or conversation exports. A new registration for the same push endpoint replaces the old device record.

Current-day reminders use the last synchronized task plan. On a later unopened day, counts use the published Daily Three lesson, previously synchronized review due dates capped at six, and the daily sound allowance capped at three. Offline practice cannot update remote counts until the app reconnects. Records expire 35 days after the last successful sync.

## Delivery

The GitHub `Send phone reminders` workflow checks every five minutes when `PHONE_REMINDERS_ENABLED=true`. Scheduled runners and push services can delay delivery; this is not an exact alarm. The server only sends within the first hour after the chosen time, skips completed days, and claims each device's day atomically before sending. Ambiguous delivery failures are not automatically retried that day, preventing duplicate notifications. A failed delivery makes the workflow fail for inspection. Test notifications use a separate one-minute rate limit and do not consume the daily reminder.

Expired push subscriptions are removed. Tapping a notification opens the remaining-task card; an already open practice is preserved rather than reloaded.

## Configuration and recovery

The coaching service needs Production-scoped `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `REMINDER_CRON_SECRET`. The scheduler uses the matching `REMINDER_CRON_SECRET` GitHub repository secret. Only the public VAPID key is returned to browsers. Registration requires the existing private coach access code; subsequent synchronization uses the device credential.

Keep the delivery variable disabled until the backend, service worker and phone subscription have been verified. To stop scheduled delivery, set `PHONE_REMINDERS_ENABLED=false`; this does not delete learning progress or alter Daily Three generation. Disconnecting a phone deletes its server subscription and preserves local learning data. Reconnecting needs the coach access code again. Keep VAPID keys stable across deployments, because replacing them requires phones to subscribe again.

Unit tests cover due windows, count rollover, completed-day skips, duplicate dispatches, expired subscriptions and ownership checks. Browser tests simulate permission and subscription APIs and cover synchronization and failure feedback. These tests do not establish actual iPhone push delivery; that requires a separate device check.
