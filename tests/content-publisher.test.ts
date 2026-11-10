import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";

const publisher = resolve("scripts/publish-content.mjs");
let directory: string;
let repository: string;
let remote: string;
let output: string;

function git(...args: string[]) {
  return execFileSync("git", args, {
    cwd: repository,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function publish() {
  return execFileSync(process.execPath, [publisher], {
    cwd: repository,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_REF: "refs/heads/main",
      GH_CONTENT_TOKEN: "local-fixture-only",
      GITHUB_OUTPUT: output,
    },
  });
}

beforeEach(async () => {
  directory = await mkdtemp(resolve(tmpdir(), "pocket-publisher-"));
  repository = resolve(directory, "checkout");
  remote = resolve(directory, "remote.git");
  output = resolve(directory, "outputs");
  await mkdir(resolve(repository, "public"), { recursive: true });
  git("init", "--bare", "--initial-branch=main", remote);
  git("init", "--initial-branch=main");
  git("config", "user.name", "Publication fixture");
  git("config", "user.email", "fixture@example.test");
  await writeFile(
    resolve(repository, "public/content.json"),
    '{"revision":1}\n',
  );
  await writeFile(resolve(repository, "unrelated.txt"), "Original\n");
  git("add", ".");
  git("commit", "-m", "test: seed isolated publication fixture");
  git("remote", "add", "origin", remote);
  git("push", "origin", "main");
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it("publishes only the content file and becomes a no-op on the same revision", async () => {
  await writeFile(
    resolve(repository, "public/content.json"),
    '{"revision":2}\n',
  );
  await writeFile(
    resolve(repository, "unrelated.txt"),
    "Keep this local change\n",
  );
  publish();
  const revision = git("rev-parse", "HEAD");
  expect(git("diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD")).toBe(
    "public/content.json",
  );
  expect(git("status", "--porcelain")).toBe("M unrelated.txt");
  expect(git("ls-remote", "origin", "refs/heads/main")).toContain(revision);
  expect(await readFile(output, "utf8")).toContain("changed=true");
  await writeFile(output, "");
  publish();
  expect(git("rev-parse", "HEAD")).toBe(revision);
  expect(await readFile(output, "utf8")).toContain("changed=false");
});

it("does not overwrite content published concurrently", async () => {
  const second = resolve(directory, "second");
  git("clone", remote, second);
  const firstRepository = repository;
  repository = second;
  git("config", "user.name", "Other publisher");
  git("config", "user.email", "other@example.test");
  await writeFile(resolve(second, "public/content.json"), '{"revision":3}\n');
  git("commit", "-am", "test: simulate concurrent publication");
  git("push", "origin", "main");
  const publishedRevision = git("rev-parse", "HEAD");
  repository = firstRepository;
  await writeFile(
    resolve(repository, "public/content.json"),
    '{"revision":2}\n',
  );
  expect(publish).toThrow();
  expect(git("ls-remote", "origin", "refs/heads/main")).toContain(
    publishedRevision,
  );
  await expect(readFile(output, "utf8")).rejects.toThrow();
});
