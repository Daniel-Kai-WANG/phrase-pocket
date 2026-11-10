import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve("dist");
const files = (await readdir(directory, { recursive: true }))
  .filter((file) => /\.(html|js|css|png|svg|webmanifest)$/.test(file))
  .filter((file) => file !== "sw.js")
  .sort();
const template = await readFile("scripts/service-worker.js", "utf8");
const hash = createHash("sha256").update(template);
for (const file of files) hash.update(await readFile(resolve(directory, file)));
const worker = template
  .replace("__VERSION__", hash.digest("hex").slice(0, 16))
  .replace('"__PRECACHE__"', JSON.stringify(files));
await writeFile(resolve(directory, "sw.js"), worker);
console.log(`Offline worker prepared with ${files.length} files.`);
