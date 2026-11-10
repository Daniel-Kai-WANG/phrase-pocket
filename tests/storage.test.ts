import { expect, it } from "vitest";
import {
  emptyStore,
  loadStore,
  parseBackup,
  saveStore,
} from "../src/utils/storage";

it("round-trips progress without completing lessons or inventing stamps", () => {
  const data = emptyStore();
  expect(parseBackup(JSON.stringify(data))).toEqual(data);
});
it("rejects malformed and future-format backups instead of replacing current progress", () => {
  expect(() => parseBackup("{")).toThrow("JSON");
  expect(() => parseBackup('{"version":2}')).toThrow("unsupported");
  expect(loadStore({ getItem: () => "{" }).error).toContain(
    "could not be opened",
  );
});
it("reports full or unavailable browser storage", () => {
  expect(
    saveStore(
      {
        setItem: () => {
          throw new Error("QuotaExceeded");
        },
      },
      emptyStore(),
    ),
  ).toContain("could not save");
});

it("retains damaged storage byte-for-byte for recovery instead of exporting an empty fallback", () => {
  const raw = '{"version":1,"progress":{"important":"unfinished';
  const loaded = loadStore({ getItem: () => raw });
  expect(loaded.recoveryText).toBe(raw);
  expect(loaded.error).not.toBeNull();
  expect(
    loadStore({ getItem: () => JSON.stringify(emptyStore()) }).recoveryText,
  ).toBeNull();
});
