import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { isAuthorized } from "../auth.js";
import { learningDay } from "../../src/utils/dates.js";
import { reminderMessage } from "../../src/utils/reminders.js";
import {
  readReminderConfig,
  remindersConfigured,
  type ReminderConfig,
} from "./config.js";
import { createReminderStore, type ReminderStore } from "./store.js";
import { createPushSender, dispatchReminders } from "./delivery.js";
import {
  deviceRequestSchema,
  deviceTokenSchema,
  hashDeviceToken,
  registrationSchema,
  syncSchema,
} from "./schema.js";

export function createReminderRoutes(
  coachToken: string,
  config: ReminderConfig = readReminderConfig(),
  dependencies?: {
    store: ReminderStore;
    send: ReturnType<typeof createPushSender>;
  },
) {
  const app = new Hono();
  const configured = remindersConfigured(config);
  const store =
    dependencies?.store ?? (configured ? createReminderStore(config) : null);
  const send = dependencies?.send ?? createPushSender(config);
  app.get("/config", (c) =>
    c.json({ configured, publicKey: configured ? config.publicKey : "" }),
  );
  app.use(
    "/*",
    bodyLimit({
      maxSize: 350000,
      onError: (c) =>
        c.json({ error: "This reminder update is too large." }, 413),
    }),
  );
  app.use("/*", async (c, next) => {
    if (!configured || !store)
      return c.json({ error: "Phone reminders are not connected yet." }, 503);
    await next();
  });
  app.post("/register", async (c) => {
    if (!isAuthorized(c.req.header("Authorization"), coachToken))
      return c.json(
        {
          error:
            "Connect your private coach access code before enabling phone reminders.",
        },
        401,
      );
    const { token, ...input } = registrationSchema.parse(await c.req.json());
    const result = await store!.save(
      {
        ...input,
        tokenHash: hashDeviceToken(token),
        syncedAt: new Date().toISOString(),
      },
      true,
    );
    if (result < 0)
      return c.json({ error: "This device could not be connected." }, 409);
    return c.json({ connected: true });
  });
  app.post("/dispatch", async (c) => {
    if (!isAuthorized(c.req.header("Authorization"), config.cronSecret))
      return c.json(
        { error: "This reminder scheduler is not authorized." },
        401,
      );
    const result = await dispatchReminders(store!, send);
    return c.json(result, result.failed ? 502 : 200);
  });
  app.post("/:action", async (c) => {
    const action = c.req.param("action");
    if (!["sync", "stop", "test"].includes(action))
      return c.json({ error: "Unknown reminder action." }, 404);
    const body = await c.req.json();
    const { id } =
      action === "sync"
        ? syncSchema.parse(body)
        : deviceRequestSchema.parse(body);
    const supplied = deviceTokenSchema.safeParse(
      c.req.header("Authorization")?.replace(/^Bearer /, ""),
    );
    if (!supplied.success)
      return c.json(
        { error: "Reconnect phone reminders on this device." },
        401,
      );
    const tokenHash = hashDeviceToken(supplied.data);
    const device = await store!.get(id);
    if (!device || !isAuthorized(`Bearer ${tokenHash}`, device.tokenHash))
      return c.json(
        { error: "Reconnect phone reminders on this device." },
        401,
      );
    if (action === "stop") {
      await store!.remove(id, tokenHash);
      return c.json({ connected: false });
    }
    if (action === "sync") {
      const input = syncSchema.parse(body);
      const result = await store!.save(
        { ...device, ...input, syncedAt: new Date().toISOString() },
        false,
      );
      if (result < 0)
        return c.json(
          { error: "Reconnect phone reminders on this device." },
          401,
        );
      if (result === 0)
        return c.json(
          {
            error:
              "Newer reminder settings are already saved. Sync again from this device.",
          },
          409,
        );
      return c.json({ synced: true });
    }
    if (!(await store!.claim(id, "test", 60)))
      return c.json(
        { error: "Wait a minute before sending another test." },
        429,
      );
    try {
      await send(device, reminderMessage(device.snapshot), learningDay(), true);
      return c.json({ sent: true });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await store!.remove(id, tokenHash);
        return c.json(
          {
            error:
              "This phone subscription expired. Reconnect phone reminders.",
          },
          410,
        );
      }
      return c.json(
        {
          error:
            "The push service did not confirm delivery. Try again shortly.",
        },
        502,
      );
    }
  });
  return app;
}
