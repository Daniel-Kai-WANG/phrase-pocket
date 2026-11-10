const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const TOKEN_KEY = "phrase-pocket.coach-session";
const DEVICE_TOKEN_KEY = "phrase-pocket.coach-device";

export class CoachAccessError extends Error {}

function readCoachToken() {
  try {
    return (
      localStorage.getItem(DEVICE_TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

export function setCoachToken(token: string, rememberDevice = true) {
  if (rememberDevice) {
    localStorage.setItem(DEVICE_TOKEN_KEY, token.trim());
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token.trim());
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  }
}

export function forgetCoachToken() {
  localStorage.removeItem(DEVICE_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
export function hasCoachConnection() {
  return Boolean(API_BASE && readCoachToken());
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
  const token = readCoachToken();
  if (!token)
    throw new CoachAccessError(
      "Your coach access code is missing. Connect below or in Pocket settings. Your answer has not been marked wrong.",
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
  if (response.status === 401)
    throw new CoachAccessError(
      "That coach access code was not accepted. Enter it again below or in Pocket settings. Your answer has not been marked wrong.",
    );
  if (!response.ok)
    throw new Error(
      result?.error ?? "The coach is unavailable. Please try again shortly.",
    );
  return result as T;
}
