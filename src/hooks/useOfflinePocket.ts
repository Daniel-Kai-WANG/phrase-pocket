import { useEffect, useRef, useState } from "react";

export function useOfflinePocket() {
  const [ready, setReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [error, setError] = useState("");
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const applying = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let disposed = false;
    const workerListeners: Array<() => void> = [];
    const controllerChanged = () => {
      if (applying.current) location.reload();
    };
    const checkForUpdate = () => {
      if (navigator.onLine) registration.current?.update().catch(() => {});
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      controllerChanged,
    );
    window.addEventListener("online", checkForUpdate);
    window.addEventListener("focus", checkForUpdate);
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: "none",
      })
      .then((result) => {
        if (disposed) return;
        registration.current = result;
        setUpdateAvailable(Boolean(result.waiting));
        const observeInstalling = () => {
          const worker = result.installing;
          if (!worker) return;
          const changed = () => {
            if (!disposed && worker.state === "installed") {
              setUpdateAvailable(Boolean(navigator.serviceWorker.controller));
            }
          };
          worker.addEventListener("statechange", changed);
          workerListeners.push(() =>
            worker.removeEventListener("statechange", changed),
          );
        };
        observeInstalling();
        result.addEventListener("updatefound", observeInstalling);
        workerListeners.push(() =>
          result.removeEventListener("updatefound", observeInstalling),
        );
        navigator.serviceWorker.ready.then(() => {
          if (!disposed) setReady(true);
        });
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Offline saving is unavailable. You can still use your pocket online.",
          );
      });
    return () => {
      disposed = true;
      workerListeners.forEach((remove) => remove());
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        controllerChanged,
      );
      window.removeEventListener("online", checkForUpdate);
      window.removeEventListener("focus", checkForUpdate);
    };
  }, []);

  function applyUpdate() {
    if (!registration.current?.waiting) return;
    applying.current = true;
    registration.current.waiting.postMessage({ type: "APPLY_UPDATE" });
  }

  return { ready, updateAvailable, error, applyUpdate };
}
