import { afterEach, expect, it, vi } from "vitest";
import { readConfig } from "../server/config";

afterEach(() => vi.unstubAllEnvs());

it("uses model defaults when optional workflow variables are empty", () => {
  vi.stubEnv("OPENAI_TEXT_MODEL", "");
  vi.stubEnv("OPENAI_AUDIO_MODEL", "");
  vi.stubEnv("OPENAI_TRANSCRIBE_MODEL", "");
  const config = readConfig();
  expect(config.textModel).toBe("gpt-6-luna");
  expect(config.audioModel).toBe("gpt-audio-1.5");
  expect(config.transcribeModel).toBe("gpt-4o-mini-transcribe");
});

it("keeps explicit model selections and separates approved origins", () => {
  vi.stubEnv("OPENAI_TEXT_MODEL", "selected-text-model");
  vi.stubEnv(
    "ALLOWED_ORIGIN",
    "https://pocket.example, https://preview.example",
  );
  const config = readConfig();
  expect(config.textModel).toBe("selected-text-model");
  expect(config.allowedOrigins).toEqual([
    "https://pocket.example",
    "https://preview.example",
  ]);
});
