export function speak(text: string): string | null {
  if (!("speechSynthesis" in window))
    return "Speech playback is not available in this browser.";
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-AU";
  utterance.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice =
    voices.find((voice) => voice.lang === "en-AU") ??
    voices.find((voice) => voice.lang.startsWith("en-")) ??
    null;
  window.speechSynthesis.speak(utterance);
  return null;
}
