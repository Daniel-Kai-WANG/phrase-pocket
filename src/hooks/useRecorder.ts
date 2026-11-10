import { useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 45;

export function useRecorder() {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [clip, setClip] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearInterval(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  useEffect(() => {
    if (!clip) {
      setUrl("");
      return;
    }
    const source = URL.createObjectURL(clip);
    setUrl(source);
    return () => URL.revokeObjectURL(source);
  }, [clip]);

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function start() {
    setError("");
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Recording needs a supported browser on HTTPS or localhost. Try Safari or Chrome.",
      );
      return;
    }
    setRequesting(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const nextRecorder = new MediaRecorder(
        media,
        mimeType ? { mimeType } : undefined,
      );
      recorder.current = nextRecorder;
      const chunks: Blob[] = [];
      nextRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      nextRecorder.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        if (timer.current) clearInterval(timer.current);
        if (!mounted.current) return;
        setRecording(false);
        setClip(new Blob(chunks, { type: nextRecorder.mimeType }));
      };
      nextRecorder.onerror = () => {
        stop();
        if (mounted.current)
          setError(
            "The microphone stopped unexpectedly. Please record another take.",
          );
      };
      setClip(null);
      setSeconds(0);
      nextRecorder.start();
      setRecording(true);
      const started = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - started) / 1000);
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORDING_SECONDS) stop();
      }, 250);
    } catch (issue) {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (mounted.current)
        setError(
          issue instanceof DOMException && issue.name === "NotAllowedError"
            ? "Microphone access was not allowed. Enable it for this site, then try again."
            : "The microphone could not be opened. Check that it is connected and try again.",
        );
    } finally {
      if (mounted.current) setRequesting(false);
    }
  }

  return {
    recording,
    requesting,
    seconds,
    clip,
    url,
    error,
    start,
    stop,
    clear: () => setClip(null),
  };
}
