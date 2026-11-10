import { coachRequest, hasCoachConnection } from "./client";
import type { PushDevice, ReminderUpdate } from "../types/push";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");
const DEVICE_KEY = "phrase-pocket.push-device";

export function readPushDevice(): PushDevice | null {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
export function forgetPushDevice() {
  localStorage.removeItem(DEVICE_KEY);
}
function saveDevice(device: PushDevice) {
  localStorage.setItem(DEVICE_KEY, JSON.stringify(device));
}

export function nextDeviceRevision(device: PushDevice) {
  const current = readPushDevice();
  const next = {
    ...device,
    revision: Math.max(
      Date.now(),
      (current?.revision ?? 0) + 1,
      device.revision + 1,
    ),
  };
  saveDevice(next);
  return next;
}

async function reminderRequest<T>(
  path: string,
  device?: PushDevice,
  body?: object,
): Promise<T> {
  if (!API_BASE)
    throw new Error("Phone reminders are unavailable in this pocket.");
  const response = await fetch(`${API_BASE}/api/reminders/${path}`, {
    method: device ? "POST" : "GET",
    headers: device
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${device.token}`,
        }
      : {},
    body: device ? JSON.stringify({ ...body, id: device.id }) : undefined,
    signal: AbortSignal.timeout(20000),
    keepalive: path === "sync" && JSON.stringify(body).length < 60000,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error ?? "Phone reminders could not sync. Try again online.",
    );
  return result as T;
}

export function pushAvailability() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  )
    return "On iPhone, open your installed home-screen pocket to enable notifications.";
  if (Notification.permission === "denied")
    return "Notifications are blocked. Allow them in your phone or browser settings, then return here.";
  return "";
}

export async function connectPush(update: ReminderUpdate) {
  const unavailable = pushAvailability();
  if (unavailable) throw new Error(unavailable);
  if (!hasCoachConnection())
    throw new Error("Enter your private coach access code below first.");
  // Permission must start inside the button gesture on iPhone.
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error(
      "Notifications were not allowed. In-app reminders still work.",
    );
  const config = await reminderRequest<{
    configured: boolean;
    publicKey: string;
  }>("config");
  if (!config.configured)
    throw new Error("The phone reminder service is not ready yet.");
  const registration = await navigator.serviceWorker.getRegistration(
    import.meta.env.BASE_URL,
  );
  if (!registration?.active)
    throw new Error("Let the pocket finish its offline setup, then try again.");
  const publicKey = Uint8Array.from(
    atob(config.publicKey.replace(/-/g, "+").replace(/_/g, "/")),
    (char) => char.charCodeAt(0),
  );
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    }));
  const device = nextDeviceRevision(
    readPushDevice() ?? {
      id: crypto.randomUUID(),
      token: btoa(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
      )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""),
      revision: 0,
    },
  );
  await coachRequest("reminders/register", {
    ...update,
    id: device.id,
    token: device.token,
    revision: device.revision,
    subscription: subscription.toJSON(),
  });
  const connected = { ...device, connected: true };
  saveDevice(connected);
  return connected;
}

export async function syncPush(device: PushDevice, update: ReminderUpdate) {
  const next = nextDeviceRevision(device);
  await reminderRequest("sync", next, { ...update, revision: next.revision });
}
export async function testPush(device: PushDevice) {
  await reminderRequest("test", device);
}
export async function disconnectPush(device: PushDevice) {
  await reminderRequest("stop", device);
  forgetPushDevice();
  try {
    const registration = await navigator.serviceWorker.getRegistration(
      import.meta.env.BASE_URL,
    );
    await (await registration?.pushManager.getSubscription())?.unsubscribe();
  } catch {
    /* The server has already stopped this device's reminders. */
  }
}
