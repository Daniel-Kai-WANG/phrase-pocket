import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { expect, it } from "vitest";

it("boots the emitted server in native Node without the development import resolver", () => {
  const root = process.cwd();
  const output = mkdtempSync(join(tmpdir(), "phrase-pocket-runtime-"));
  const visited = new Set<string>();
  function emit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    const javascript = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
      fileName: file,
    }).outputText;
    const target = join(output, relative(root, file)).replace(/\.ts$/, ".js");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, javascript);
    const parsed = ts.createSourceFile(
      target,
      javascript,
      ts.ScriptTarget.ES2022,
      true,
      ts.ScriptKind.JS,
    );
    for (const statement of parsed.statements) {
      if (
        !ts.isImportDeclaration(statement) &&
        !ts.isExportDeclaration(statement)
      )
        continue;
      const specifier = statement.moduleSpecifier;
      if (
        !specifier ||
        !ts.isStringLiteral(specifier) ||
        !specifier.text.startsWith(".")
      )
        continue;
      const dependency = resolve(dirname(file), specifier.text);
      emit(
        dependency.endsWith(".js")
          ? dependency.slice(0, -3) + ".ts"
          : dependency + ".ts",
      );
    }
  }
  try {
    writeFileSync(join(output, "package.json"), '{"type":"module"}');
    symlinkSync(
      join(root, "node_modules"),
      join(output, "node_modules"),
      "dir",
    );
    emit(join(root, "index.ts"));
    const url = pathToFileURL(join(output, "index.js")).href;
    const result = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `const { default: app } = await import(${JSON.stringify(url)}); const r = await app.request('/api/health'); console.log(JSON.stringify({status:r.status,body:await r.json()}));`,
      ],
      { encoding: "utf8", env: { PATH: process.env.PATH }, timeout: 15000 },
    );
    expect(JSON.parse(result)).toEqual({
      status: 200,
      body: { status: "ok", coachConfigured: false },
    });
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
