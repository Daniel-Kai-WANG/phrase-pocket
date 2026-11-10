export interface ServerConfig {
  apiKey: string;
  accessToken: string;
  allowedOrigins: string[];
  textModel: string;
  audioModel: string;
  transcribeModel: string;
}

export function readConfig(): ServerConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    accessToken: process.env.COACH_ACCESS_TOKEN ?? "",
    allowedOrigins: (
      process.env.ALLOWED_ORIGIN ??
      "http://localhost:5177,http://127.0.0.1:5177"
    )
      .split(",")
      .map((origin) => origin.trim()),
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-6-luna",
    audioModel: process.env.OPENAI_AUDIO_MODEL || "gpt-audio-1.5",
    transcribeModel:
      process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe",
  };
}
