import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

if (
  process.env.GITHUB_ACTIONS !== "true" ||
  process.env.GITHUB_REF !== "refs/heads/main" ||
  !process.env.GH_CONTENT_TOKEN ||
  !process.env.GITHUB_OUTPUT
) {
  throw new Error("Content publication runs only in the main-branch workflow.");
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const file = "public/content.json";
const changed = Boolean(git("diff", "--name-only", "--", file));
if (changed) {
  git("config", "user.name", "github-actions[bot]");
  git(
    "config",
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com",
  );
  git("add", "--", file);
  git("commit", "-m", "feat: add daily expressions", "--", file);
  const authorization = Buffer.from(
    `x-access-token:${process.env.GH_CONTENT_TOKEN}`,
  ).toString("base64");
  execFileSync("git", ["push", "origin", "HEAD:main"], {
    stdio: "inherit",
    env: {
      ...process.env,
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
      GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${authorization}`,
    },
  });
}
appendFileSync(
  process.env.GITHUB_OUTPUT,
  `changed=${changed}\nrevision=${git("rev-parse", "HEAD")}\n`,
);
