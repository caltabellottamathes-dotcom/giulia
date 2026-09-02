import { useState, useRef, useEffect, useCallback } from "react";

/**
 * ReadAloudButton — leest een bericht hardop voor via de ingebouwde browser
 * SpeechSynthesis API. Instant, gratis, géén netwerk/credits. Klikt aan/uit.
 * Taal wordt automatisch gedetecteerd (NL vs EN) aan de hand van het bericht.
 * Stijl: editorial tekstknop zonder icoon — past in Mattia's chat-esthetiek.
 */
const DUTCH_RE = /\b(hallo|hoi|hey|ja|nee|goedemorgen|goedeavond|ik|jij|wij|wat|hoe|waarom|want|maar|een|de|het|is|zijn|hebben|willen|gaan|doen|maken|zien|horen|mooi|leuk|goed|slecht|bedankt|graag)\b/i;

export default function ReadAloudButton({ text, color = "#595c64", label = "Lees voor" }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance !== "undefined";
  const speakingRef = useRef(false);

  const stop = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    speakingRef.current = false;
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text) return;
    if (speakingRef.current) { stop(); return; }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).slice(0, 1000));
      u.lang = DUTCH_RE.test(text) ? "nl-NL" : "en-US";
      u.rate = 1.02;
      u.pitch = 1;
      u.onend = () => { speakingRef.current = false; setSpeaking(false); };
      u.onerror = () => { speakingRef.current = false; setSpeaking(false); };
      speakingRef.current = true;
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch { speakingRef.current = false; setSpeaking(false); }
  }, [text, supported, stop]);

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }, []);

  if (!supported || !text) return null;
  return (
    <button
      type="button"
      onClick={speak}
      className="font-mono text-[10px] uppercase tracking-[0.18em] hover:underline transition mt-1"
      style={{ color }}
    >
      {speaking ? "■ Stop" : label}
    </button>
  );
}