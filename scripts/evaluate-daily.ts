import { readFile } from "node:fs/promises";
import { generateDailyPage } from "../server/daily";
import { readConfig } from "../server/config";
import { parseContentFeed } from "../src/utils/contentFeed";
import { learningDay } from "../src/utils/dates";

const feed = parseContentFeed(
  JSON.parse(await readFile("public/content.json", "utf8")),
);
const lastDate = [learningDay(), ...feed.lessons.map((lesson) => lesson.date)]
  .sort()
  .at(-1)!;
const date = new Date(Date.parse(`${lastDate}T00:00:00Z`) + 86_400_000)
  .toISOString()
  .slice(0, 10);
const config = readConfig();
if (!config.apiKey) throw new Error("Configure OPENAI_API_KEY first.");

const candidate = await generateDailyPage(config, feed, date);
console.log(
  JSON.stringify(
    {
      date,
      published: false,
      lesson: candidate.lessons.at(-1),
      phrases: candidate.phrases.slice(feed.phrases.length),
    },
    null,
    2,
  ),
);
console.log("Daily generation verified. Published content was not changed.");
