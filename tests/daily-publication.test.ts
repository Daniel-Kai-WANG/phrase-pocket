import { afterEach, expect, it, vi } from "vitest";
import { generateDailyPage, missingDailyDates } from "../server/daily";
import { readConfig } from "../server/config";
import { initialFeed } from "../src/data/initialFeed";

afterEach(() => vi.unstubAllGlobals());
const candidates = ["On the same page", "Keep me posted", "A heads-up"].map(
  (expression) => ({ ...initialFeed.phrases[0], expression }),
);
function response(phrases = candidates) {
  return new Response(
    JSON.stringify({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify({ phrases }) }],
        },
      ],
    }),
  );
}

it("creates exactly three new expressions without changing previous pages or claiming a source sync", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
  const next = await generateDailyPage(
    { ...readConfig(), apiKey: "test" },
    initialFeed,
    "2026-11-10",
  );
  expect(next.phrases).toHaveLength(initialFeed.phrases.length + 3);
  expect(next.lessons).toHaveLength(9);
  expect(next.lessons.slice(0, 8)).toEqual(initialFeed.lessons);
  expect(next.lessons[8].phraseIds).toHaveLength(3);
  expect(next.lessons[8].theme).toBe("relationships");
  expect(next.lessons[8].origin).toBe("generated");
  expect(next.personalCheckedAt).toBeNull();
  expect(next.dailyCheckedAt).toBeNull();
});

it("is idempotent for a day already supplied by the source conversation", async () => {
  vi.stubGlobal("fetch", vi.fn());
  const next = await generateDailyPage(readConfig(), initialFeed, "2026-11-09");
  expect(next).toBe(initialFeed);
  expect(fetch).not.toHaveBeenCalled();
});

it("rejects repeated known expressions without modifying the feed", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        response([initialFeed.phrases[0], ...candidates.slice(1)]),
      ),
  );
  await expect(
    generateDailyPage(
      { ...readConfig(), apiKey: "test" },
      initialFeed,
      "2026-11-10",
    ),
  ).rejects.toThrow("repeated");
  expect(initialFeed.lessons).toHaveLength(8);
});

it("finds missing daily pages without skipping gaps or adding future dates", () => {
  const feed = {
    ...initialFeed,
    lessons: initialFeed.lessons.filter(
      (lesson) => lesson.date !== "2026-11-05",
    ),
  };
  expect(missingDailyDates(feed, "2026-11-11")).toEqual([
    "2026-11-05",
    "2026-11-10",
    "2026-11-11",
  ]);
  expect(missingDailyDates(initialFeed, "2026-11-09")).toEqual([]);
});
