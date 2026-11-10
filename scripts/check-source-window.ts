import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { inspectSourceWindow } from "../server/source-window";

try {
  const [snapshotPath, checkpointPath] = process.argv.slice(2);
  if (!snapshotPath)
    throw new Error(
      "Pass a private source snapshot and optional published checkpoint path.",
    );
  const snapshot: unknown = JSON.parse(
    await readFile(resolve(snapshotPath), "utf8"),
  );
  const checkpoint: unknown = checkpointPath
    ? JSON.parse(await readFile(resolve(checkpointPath), "utf8"))
    : null;
  const result = inspectSourceWindow(snapshot, checkpoint);
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "ready" && result.status !== "unchanged")
    process.exitCode = 2;
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Source continuity could not be checked.",
  );
  process.exitCode = 1;
}
