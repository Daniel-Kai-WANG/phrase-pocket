import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { importSourceBatch } from "../server/content-import";
import { parseContentFeed } from "../src/utils/contentFeed";

try {
  const input = process.argv[2];
  if (!input)
    throw new Error("Pass the path to a reviewed English source batch.");
  const destination = resolve("public/content.json");
  const current = parseContentFeed(
    JSON.parse(await readFile(destination, "utf8")),
  );
  const next = importSourceBatch(
    current,
    JSON.parse(await readFile(resolve(input), "utf8")),
  );
  if (next === current) console.log("This source batch is already imported.");
  else {
    await writeFile(`${destination}.tmp`, `${JSON.stringify(next, null, 2)}\n`);
    await rename(`${destination}.tmp`, destination);
    console.log(
      `Imported revision ${next.revision}: ${next.phrases.length} expressions, ${next.lessons.length} daily pages.`,
    );
  }
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "The source import did not finish.",
  );
  process.exitCode = 1;
}
