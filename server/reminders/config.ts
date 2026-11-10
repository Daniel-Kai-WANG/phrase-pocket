export function readReminderConfig() {
  return {
    redisUrl: process.env.KV_REST_API_URL ?? "",
    redisToken: process.env.KV_REST_API_TOKEN ?? "",
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? "",
    subject: "https://daniel-kai-wang.github.io/phrase-pocket/",
    cronSecret: process.env.REMINDER_CRON_SECRET ?? "",
  };
}
export type ReminderConfig = ReturnType<typeof readReminderConfig>;
export function remindersConfigured(config: ReminderConfig) {
  return Boolean(
    config.redisUrl &&
    config.redisToken &&
    config.publicKey &&
    config.privateKey &&
    config.cronSecret.length >= 24,
  );
}
