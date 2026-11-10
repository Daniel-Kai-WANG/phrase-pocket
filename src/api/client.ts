const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const TOKEN_KEY = "phrase-pocket.coach-session";

export function setCoachToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token.trim());
}
export function hasCoachConnection() {
  return Boolean(API_BASE && sessionStorage.getItem(TOKEN_KEY));
}

export async function coachRequest<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (!API_BASE)
    throw new Error(
      "The online coach is not connected yet. Your saved cards and offline review are still available.",
    );
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token)
    throw new Error(
      "Open Pocket settings and enter your private coach access code first.",
    );
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new Error(
      "The coach could not be reached. Check your connection and try again. Your progress has not been marked wrong.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      result?.error ?? "The coach is unavailable. Please try again shortly.",
    );
  return result as T;
}
