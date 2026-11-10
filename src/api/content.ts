import { parseContentFeed } from "../utils/contentFeed";

export async function fetchContentFeed(signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.BASE_URL}content.json`, {
      cache: "no-store",
      signal,
    });
  } catch {
    throw new Error(
      "New pages could not be reached. Your saved cards are still here. Please try again when connected.",
    );
  }
  if (!response.ok)
    throw new Error(
      "New pages could not be reached. Your saved cards are still here.",
    );
  try {
    return parseContentFeed(await response.json());
  } catch {
    throw new Error(
      "This update is incomplete. Your existing cards have been kept.",
    );
  }
}
