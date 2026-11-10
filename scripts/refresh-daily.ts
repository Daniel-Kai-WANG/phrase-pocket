import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { generateDailyPage, missingDailyDates } from "../server/daily";
import { readConfig } from "../server/config";
import { parseContentFeed } from "../src/utils/contentFeed";
import { learningDay } from "../src/utils/dates";

const file = resolve("public/content.json");
const config = readConfig();
const MAX_PAGES_PER_RUN = 7;

try {
  let feed = parseContentFeed(JSON.parse(await readFile(file, "utf8")));
  const missing = missingDailyDates(feed, learningDay());
  if (missing.length && !config.apiKey)
    throw new Error(
      "Configure OPENAI_API_KEY before preparing new daily pages.",
    );
  for (const date of missing.slice(0, MAX_PAGES_PER_RUN)) {
    feed = await generateDailyPage(config, feed, date);
    await writeFile(`${file}.tmp`, `${JSON.stringify(feed, null, 2)}\n`);
    await rename(`${file}.tmp`, file);
    console.log(`Prepared three expressions for ${date}.`);
  }
  if (!missing.length) console.log("Daily pages are already up to date.");
  if (missing.length > MAX_PAGES_PER_RUN)
    console.warn(
      `${missing.length - MAX_PAGES_PER_RUN} pages remain for the next publication run.`,
    );
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Daily publication did not finish.",
  );
  process.exitCode = 1;
}
