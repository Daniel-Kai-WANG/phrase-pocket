import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../server/app";
import type { ServerConfig } from "../server/config";
import { initialPhrases } from "../src/data/catalog";
import { encodeWave } from "../src/utils/audio";
import { decodeRecording } from "../server/audio";

const config: ServerConfig = {
  apiKey: "test-provider-key",
  accessToken: "test-access-code-at-least-24-characters",
  allowedOrigins: ["https://pocket.example"],
  textModel: "test-text",
  audioModel: "test-audio",
  transcribeModel: "test-transcribe",
};
const headers = {
  Authorization: `Bearer ${config.accessToken}`,
  "Content-Type": "application/json",
  Origin: "https://pocket.example",
};
const input = {
  phrase: initialPhrases[0],
  scenario: initialPhrases[0].scenarios[0].prompt,
  answer: "Shall we split the bill?",
  hintLevel: 0,
  attemptNumber: 1,
};
const result = {
  meaning: "correct",
  targetUsed: true,
  naturalness: "natural",
  feedback: "That works.",
  nextHint: "",
};
function reply(data: unknown) {
  return new Response(
    JSON.stringify({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(data) }],
        },
      ],
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

describe("private coaching boundary", () => {
  beforeEach(() =>
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply(result))),
  );
  afterEach(() => vi.unstubAllGlobals());

  it("rejects missing credentials and unauthorized origins without calling the model", async () => {
    const app = createApp(config);
    const missing = await app.request("/api/assess", {
      method: "POST",
      body: JSON.stringify(input),
    });
    expect(missing.status).toBe(401);
    const foreign = await app.request("/api/assess", {
      method: "POST",
      headers: { ...headers, Origin: "https://other.example" },
      body: JSON.stringify(input),
    });
    expect(foreign.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("fails closed when the access code is not configured", async () => {
    const app = createApp({ ...config, accessToken: "" });
    expect(
      (
        await app.request("/api/assess", {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        })
      ).status,
    ).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("allows approved preflight and forwards valid assessments without exposing the provider key", async () => {
    const app = createApp(config);
    const options = await app.request("/api/assess", {
      method: "OPTIONS",
      headers: { Origin: headers.Origin },
    });
    expect(options.status).toBe(204);
    expect(options.headers.get("Access-Control-Allow-Origin")).toBe(
      headers.Origin,
    );
    const response = await app.request("/api/assess", {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("does not fabricate a grade when the model response is incomplete", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "incomplete", output: [] })),
    );
    const response = await createApp(config).request("/api/assess", {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    expect(response.status).toBe(502);
    expect(await response.json()).not.toHaveProperty("meaning");
  });
  it("checks payload shape and size before calling the provider", async () => {
    const app = createApp(config);
    expect(
      (
        await app.request("/api/assess", {
          method: "POST",
          headers,
          body: "{}",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await app.request("/api/assess", {
          method: "POST",
          headers,
          body: "x".repeat(2_100_001),
        })
      ).status,
    ).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("limits bursts within a server instance", async () => {
    const app = createApp(config);
    for (let i = 0; i < 12; i++)
      await app.request("/api/assess", { method: "POST", headers, body: "{}" });
    const response = await app.request("/api/assess", {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    expect(response.status).toBe(429);
    expect(fetch).not.toHaveBeenCalled();
  });
});

it("accepts app-generated WAV and rejects other byte formats before provider transmission", () => {
  const wave = Buffer.from(encodeWave(new Float32Array(16000), 16000));
  expect(decodeRecording(wave.toString("base64")).length).toBe(wave.length);
  expect(() =>
    decodeRecording(Buffer.from("not audio").toString("base64")),
  ).toThrow("another take");
});
