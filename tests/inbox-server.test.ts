import { afterEach, expect, it, vi } from "vitest";
import { createApp } from "../server/app";
import { inboxReply } from "./fixtures/inbox";
const config = {
  apiKey: "test-key",
  accessToken: "test-private-access-code-12345",
  allowedOrigins: ["https://pocket.example"],
  textModel: "test-text",
  audioModel: "test-audio",
  transcribeModel: "test-transcribe",
};
const headers = {
  "Content-Type": "application/json",
  Origin: "https://pocket.example",
  Authorization: `Bearer ${config.accessToken}`,
};
afterEach(() => vi.unstubAllGlobals());
it("rejects unauthorized, unapproved-origin and oversized inputs without provider calls", async () => {
  vi.stubGlobal("fetch", vi.fn());
  const app = createApp(config);
  for (const [auth, origin, status] of [
    ["Bearer wrong", headers.Origin, 401],
    [headers.Authorization, "https://other.example", 403],
  ] as const) {
    expect(
      (
        await app.request("/api/learning-inbox", {
          method: "POST",
          headers: { ...headers, Authorization: auth, Origin: origin },
          body: JSON.stringify({ text: "a question", mode: "question" }),
        })
      ).status,
    ).toBe(status);
  }
  expect(
    (
      await app.request("/api/learning-inbox", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: "a".repeat(12001), mode: "question" }),
      })
    ).status,
  ).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it("returns validated cards without persisting provider input and rejects incomplete responses", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                { type: "output_text", text: JSON.stringify(inboxReply) },
              ],
            },
          ],
        }),
      ),
    ),
  );
  const app = createApp(config);
  const input = {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: "Please explain this expression",
      mode: "conversation",
    }),
  };
  const response = await app.request("/api/learning-inbox", input);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(inboxReply);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
  expect(body.store).toBe(false);
  expect(body.instructions).toContain("untrusted");
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ status: "incomplete", output: [] })),
  );
  expect((await app.request("/api/learning-inbox", input)).status).toBe(502);
});
