import { useCallback, useEffect, useRef, useState } from "react";
import type { PhoneReminderControls, ReminderUpdate } from "../types/push";
import {
  connectPush,
  disconnectPush,
  readPushDevice,
  syncPush,
  testPush,
} from "../api/pushReminders";

export function usePhoneReminders(
  update: ReminderUpdate,
): PhoneReminderControls {
  const [connected, setConnected] = useState(() =>
    Boolean(readPushDevice()?.connected),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const current = useRef(update);
  const sequence = useRef(Promise.resolve());
  useEffect(() => {
    current.current = update;
  }, [update]);
  const serialized = JSON.stringify(update);

  const sync = useCallback(async () => {
    const run = async () => {
      const device = readPushDevice();
      if (!device?.connected) return;
      try {
        await syncPush(device, current.current);
        setError("");
        setMessage(
          current.current.preferences.enabled
            ? "Phone reminder synced with this device’s remaining tasks."
            : "Phone reminders are paused.",
        );
      } catch (issue) {
        setError(
          `${(issue as Error).message} Your last synced reminder settings may still apply.`,
        );
      }
    };
    sequence.current = sequence.current.then(run, run);
    await sequence.current;
  }, []);

  useEffect(() => {
    if (!connected) return;
    const timer = window.setTimeout(() => void sync(), 1500);
    const resume = () => {
      void sync();
    };
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", resume);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [serialized, connected, sync]);

  async function enable() {
    setBusy(true);
    setError("");
    try {
      await connectPush(current.current);
      setConnected(true);
      setMessage("Phone reminders connected. Send a test to check delivery.");
    } catch (issue) {
      setError((issue as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    const device = readPushDevice();
    if (!device) return;
    setBusy(true);
    setError("");
    try {
      await sequence.current;
      await syncPush(device, current.current);
      await testPush(device);
      setMessage(
        "Test accepted by the push service. Check your phone’s notifications.",
      );
    } catch (issue) {
      setError((issue as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function disconnect() {
    const device = readPushDevice();
    if (!device) return;
    setBusy(true);
    setError("");
    try {
      await sequence.current;
      await disconnectPush(device);
      setConnected(false);
      setMessage(
        "Phone reminders disconnected. Your learning progress is unchanged.",
      );
    } catch (issue) {
      setError((issue as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { connected, busy, message, error, enable, test, disconnect, sync };
}
