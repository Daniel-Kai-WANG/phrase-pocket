import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import type { ReminderConfig } from "./config.js";
import type { ReminderDevice } from "./schema.js";

const DEVICE_TTL = 35 * 86400;
const INDEX = "reminders:devices";
const keyFor = (id: string) => `reminders:device:${id}`;
const endpointKey = (endpoint: string) =>
  `reminders:endpoint:${createHash("sha256").update(endpoint).digest("hex")}`;

export function createReminderStore(config: ReminderConfig) {
  const redis = new Redis({ url: config.redisUrl, token: config.redisToken });
  return {
    get: (id: string) => redis.get<ReminderDevice>(keyFor(id)),
    async save(device: ReminderDevice, allowCreate: boolean) {
      return Number(
        await redis.eval(
          `
        local previous = redis.call('GET', KEYS[1])
        if previous then
          local row = cjson.decode(previous)
          if row.tokenHash ~= ARGV[2] then return -1 end
          if row.revision >= tonumber(ARGV[3]) then return 0 end
        elseif ARGV[7] ~= '1' then return -1 end
        local owner = redis.call('GET', KEYS[3])
        if owner and owner ~= ARGV[6] then
          if ARGV[7] ~= '1' then return -1 end
          redis.call('DEL', 'reminders:device:' .. owner)
          redis.call('ZREM', KEYS[2], owner)
        end
        redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[4])
        redis.call('SET', KEYS[3], ARGV[6], 'EX', ARGV[4])
        redis.call('ZADD', KEYS[2], ARGV[5], ARGV[6])
        return 1
      `,
          [keyFor(device.id), INDEX, endpointKey(device.subscription.endpoint)],
          [
            JSON.stringify(device),
            device.tokenHash,
            device.revision,
            DEVICE_TTL,
            Date.parse(device.syncedAt),
            device.id,
            allowCreate ? "1" : "0",
          ],
        ),
      );
    },
    async remove(id: string, tokenHash: string) {
      return Number(
        await redis.eval(
          `
        local previous = redis.call('GET', KEYS[1])
        if not previous then return 1 end
        if cjson.decode(previous).tokenHash ~= ARGV[1] then return 0 end
        redis.call('DEL', KEYS[1])
        redis.call('ZREM', KEYS[2], ARGV[2])
        return 1
      `,
          [keyFor(id), INDEX],
          [tokenHash, id],
        ),
      );
    },
    async list(now: Date) {
      await redis.zremrangebyscore(INDEX, 0, now.getTime() - DEVICE_TTL * 1000);
      const ids = await redis.zrange<string[]>(INDEX, 0, -1);
      if (!ids.length) return [];
      const devices = await redis.mget<Array<ReminderDevice | null>>(
        ...ids.map(keyFor),
      );
      return devices.filter((device): device is ReminderDevice =>
        Boolean(device),
      );
    },
    async claim(id: string, slot: string, ttl = 2 * 86400) {
      return (
        (await redis.set(`reminders:sent:${id}:${slot}`, "1", {
          nx: true,
          ex: ttl,
        })) === "OK"
      );
    },
  };
}
export type ReminderStore = ReturnType<typeof createReminderStore>;
