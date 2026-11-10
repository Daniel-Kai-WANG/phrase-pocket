import { Hono } from "hono";
import { z } from "zod";
import { expect, it, vi } from "vitest";
import { createReminderRoutes } from "../server/reminders/routes";
import {
  deviceToken,
  memoryReminderStore,
  reminderDevice,
} from "./fixtures/reminder-device";
import { subscriptionSchema } from "../server/reminders/schema";

const coach = "private-coach-test-token-long-enough";
const config = {
  redisUrl: "https://example.com",
  redisToken: "test",
  publicKey: "public",
  privateKey: "private-test",
  subject: "https://example.com",
  cronSecret: "cron-test-only-secret-long-enough",
};
function fixture(registered = true) {
  const device = reminderDevice();
  const store = memoryReminderStore(registered ? [device] : []);
  const send = vi.fn().mockResolvedValue(undefined);
  const app = new Hono().route(
    "/api/reminders",
    createReminderRoutes(coach, config, { store, send }),
  );
  app.onError((error, c) =>
    c.json({ error: "Rejected" }, error instanceof z.ZodError ? 400 : 500),
  );
  const post = (path: string, body: unknown, token = deviceToken) =>
    app.request(`/api/reminders/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  const update = {
    id: device.id,
    revision: 2,
    preferences: device.preferences,
    snapshot: device.snapshot,
  };
  return { device, store, send, app, post, update };
}
it("requires coach authentication for registration and reveals no server keys in config", async () => {
  const { device, store, app, post, update } = fixture(false);
  const input = {
    ...update,
    token: deviceToken,
    subscription: device.subscription,
  };
  expect((await post("register", input, "wrong-token")).status).toBe(401);
  expect(store.save).not.toHaveBeenCalled();
  expect((await post("register", input, coach)).status).toBe(200);
  expect(await (await app.request("/api/reminders/config")).json()).toEqual({
    configured: true,
    publicKey: "public",
  });
  const stored = await store.get(device.id);
  expect(stored).not.toHaveProperty("token");
});
it("rejects another device's writes, tests and deletions without changing state", async () => {
  const { device, store, send, post, update } = fixture();
  for (const action of ["sync", "stop", "test"]) {
    expect(
      (
        await post(
          action,
          action === "sync" ? update : { id: device.id },
          "b".repeat(43),
        )
      ).status,
    ).toBe(401);
  }
  expect(store.save).not.toHaveBeenCalled();
  expect(store.remove).not.toHaveBeenCalled();
  expect(send).not.toHaveBeenCalled();
  expect((await post("dispatch", {}, coach)).status).toBe(401);
});
it("syncs pauses, ignores old writes, and disconnects without requiring the coach session", async () => {
  const { device, store, post, update } = fixture();
  const pause = {
    ...update,
    preferences: { ...update.preferences, enabled: false },
  };
  expect((await post("sync", pause)).status).toBe(200);
  expect((await post("sync", { ...update, revision: 1 })).status).toBe(409);
  expect((await store.get(device.id))?.preferences.enabled).toBe(false);
  expect((await post("stop", { id: device.id })).status).toBe(200);
  expect(await store.get(device.id)).toBeNull();
  expect((await post("sync", update)).status).toBe(401);
});
it("limits test sends and rejects extra private fields in snapshots", async () => {
  const { device, send, post, update } = fixture();
  expect((await post("test", { id: device.id })).status).toBe(200);
  expect((await post("test", { id: device.id })).status).toBe(429);
  expect(send).toHaveBeenCalledTimes(1);
  expect(
    (
      await post("sync", {
        ...update,
        snapshot: { ...update.snapshot, answer: "private answer" },
      })
    ).status,
  ).toBe(400);
});
it("accepts only supported HTTPS push services before any network delivery", () => {
  const subscription = reminderDevice().subscription;
  for (const endpoint of [
    "http://web.push.apple.com/x",
    "https://localhost/x",
    "https://web.push.apple.com.evil.test/x",
    "https://user:pass@web.push.apple.com/x",
    "https://web.push.apple.com:444/x",
  ]) {
    expect(
      subscriptionSchema.safeParse({ ...subscription, endpoint }).success,
    ).toBe(false);
  }
  expect(subscriptionSchema.safeParse(subscription).success).toBe(true);
});
