import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import { assessAnswer, assessmentRequestSchema } from "./assessment.js";
import { reviewSpeaking, speakingRequestSchema } from "./audio.js";
import { preparePlan, planRequestSchema } from "./plans.js";
import { ProviderError } from "./provider.js";
import { readConfig, type ServerConfig } from "./config.js";
import { isAuthorized } from "./auth.js";
import { createReminderRoutes } from "./reminders/routes.js";
import { prepareInboxReply } from "./learning-inbox.js";
import { inboxRequestSchema } from "../src/types/learningInbox.js";

const MAX_REQUEST_BYTES = 2_100_000;
const REQUESTS_PER_MINUTE = 12;

export function createApp(
  config: ServerConfig = readConfig(),
  app = new Hono(),
) {
  let windowStarted = Date.now();
  let requestCount = 0;

  app.use("/api/*", async (c, next) => {
    const origin = c.req.header("Origin");
    c.header("Cache-Control", "no-store");
    c.header("X-Content-Type-Options", "nosniff");
    if (origin && !config.allowedOrigins.includes(origin))
      return c.json(
        { error: "This site is not connected to this coach." },
        403,
      );
    if (origin) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Vary", "Origin");
    }
    if (c.req.method === "OPTIONS") {
      c.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
      return c.body(null, 204);
    }
    await next();
  });
  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      coachConfigured: Boolean(
        config.apiKey && config.accessToken.length >= 24,
      ),
    }),
  );
  app.route("/api/reminders", createReminderRoutes(config.accessToken));
  app.use("/api/*", async (c, next) => {
    if (!config.accessToken || config.accessToken.length < 24)
      return c.json({ error: "The private coach is not configured yet." }, 503);
    if (!isAuthorized(c.req.header("Authorization"), config.accessToken))
      return c.json(
        {
          error:
            "That coach access code was not accepted. Check Pocket settings.",
        },
        401,
      );
    if (Date.now() - windowStarted >= 60_000) {
      windowStarted = Date.now();
      requestCount = 0;
    }
    if (++requestCount > REQUESTS_PER_MINUTE) {
      c.header("Retry-After", "60");
      return c.json(
        { error: "Let’s take a short breath. Please try again in a minute." },
        429,
      );
    }
    await next();
  });
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: MAX_REQUEST_BYTES,
      onError: (c) =>
        c.json(
          {
            error:
              "This recording or reply is too large. Please make a shorter take.",
          },
          413,
        ),
    }),
  );
  app.post("/api/learning-inbox", async (c) =>
    c.json(
      await prepareInboxReply(
        config,
        inboxRequestSchema.parse(await c.req.json()),
      ),
    ),
  );
  app.post("/api/assess", async (c) =>
    c.json(
      await assessAnswer(
        config,
        assessmentRequestSchema.parse(await c.req.json()),
      ),
    ),
  );
  app.post("/api/plan", async (c) =>
    c.json(
      await preparePlan(config, planRequestSchema.parse(await c.req.json())),
    ),
  );
  app.post("/api/speaking", async (c) =>
    c.json(
      await reviewSpeaking(
        config,
        speakingRequestSchema.parse(await c.req.json()),
      ),
    ),
  );
  app.notFound((c) =>
    c.json({ error: "This coach route does not exist." }, 404),
  );
  app.onError((error, c) => {
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return c.json(
        {
          error: "This request was incomplete. Please try again from the app.",
        },
        400,
      );
    if (error instanceof ProviderError)
      return c.json(
        { error: error.message },
        error.status as 400 | 422 | 429 | 502 | 503,
      );
    return c.json(
      {
        error:
          "Something interrupted the coach. Your progress is unchanged. Please try again.",
      },
      500,
    );
  });
  return app;
}
