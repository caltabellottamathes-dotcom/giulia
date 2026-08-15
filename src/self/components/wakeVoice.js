/**
 * Wake Mode voice — uses the browser's built-in SpeechSynthesis + Speech
 * Recognition APIs. No integration credits are consumed; everything runs
 * client-side. Giulia speaks in a calm, slow, low-volume voice.
 */

export function speak(text, { rate = 0.8, pitch = 1.0, volume = 0.7 } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /Samantha|Karen|Google US English|Google UK English Female/i.test(v.name)) ||
      voices.find((v) => /en-GB/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

export function voicesAvailable() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

export function recognitionAvailable() {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createRecognizer(onResult, onEnd) {
  if (typeof window === "undefined") return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.continuous = false;
  r.interimResults = false;
  r.lang = "en-US";
  r.onresult = (e) => onResult(e.results[0][0].transcript.toLowerCase().trim());
  r.onend = () => onEnd && onEnd();
  r.onerror = () => onEnd && onEnd();
  return r;
}