import { z } from "zod";
import type { ServerConfig } from "./config";

export class ProviderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function providerRequest(
  config: ServerConfig,
  path: string,
  body: unknown | FormData,
): Promise<unknown> {
  if (!config.apiKey)
    throw new ProviderError(
      503,
      "The online coach is not configured yet. Your progress is unchanged.",
    );
  const multipart = body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`https://api.openai.com/v1/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        ...(multipart ? {} : { "Content-Type": "application/json" }),
      },
      body: multipart ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new ProviderError(
      503,
      "The coach could not respond in time. Please try again. Your progress is unchanged.",
    );
  }
  if (!response.ok)
    throw new ProviderError(
      response.status === 429 ? 429 : 502,
      response.status === 429
        ? "The coach has reached its current usage limit. Please try again later."
        : "The coaching service is unavailable. Please try again later.",
    );
  return response.json();
}

export async function structuredReply<T>(
  config: ServerConfig,
  name: string,
  instructions: string,
  input: unknown,
  schema: z.ZodType<T>,
  maxTokens = 1500,
): Promise<T> {
  const jsonSchema = z.toJSONSchema(schema);
  delete jsonSchema.$schema;
  const raw = await providerRequest(config, "responses", {
    model: config.textModel,
    store: false,
    instructions,
    input: [{ role: "user", content: JSON.stringify(input) }],
    max_output_tokens: maxTokens,
    text: {
      format: { type: "json_schema", name, strict: true, schema: jsonSchema },
    },
  });
  const envelope = z
    .object({
      status: z.string(),
      output: z.array(
        z.object({
          type: z.string(),
          content: z
            .array(z.object({ type: z.string(), text: z.string().optional() }))
            .optional(),
        }),
      ),
    })
    .safeParse(raw);
  if (!envelope.success || envelope.data.status !== "completed")
    throw new ProviderError(
      502,
      "The coach did not finish this response. Please try again.",
    );
  const parts = envelope.data.output.flatMap((item) => item.content ?? []);
  if (parts.some((item) => item.type === "refusal"))
    throw new ProviderError(
      422,
      "The coach could not review this reply. Try a different example.",
    );
  const text = parts
    .filter((item) => item.type === "output_text")
    .map((item) => item.text ?? "")
    .join("");
  try {
    return schema.parse(JSON.parse(text));
  } catch {
    throw new ProviderError(
      502,
      "The coach returned an incomplete review. Please try again. Your progress is unchanged.",
    );
  }
}
