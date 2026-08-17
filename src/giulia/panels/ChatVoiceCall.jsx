import React, { useState, useEffect, useRef } from "react";
import { askGiuliaOnce } from "@/lib/useGiuliaChat";
import { cn } from "@/lib/utils";
import { PhoneOff, Languages } from "lucide-react";

/**
 * ChatVoiceCall — inline spraakgesprek in de ChatWindow. Browser
 * SpeechRecognition (NL/EN) → GIULIA-GIULIA (interpretInput, snel) óf
 * GIULIA-SYSTEM (GIULIA-CONNECT / chatWithGiulia → GIULIA-CORE / giuliaLeader,
 * vollere redenering) → SpeechSynthesis. Continue luisterloop met barge-in
 * (Giulia's eigen stem wordt niet opgepakt).
 */
const LANGS = {
  nl: { rec: "nl-NL", tts: "nl-NL", label: "NL" },
  en: { rec: "en-US", tts: "en-US", label: "EN" },
};

export default function ChatVoiceCall({ superagent, onEnd }) {
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState("nl");
  const [transcript, setTranscript] = useState([]);
  const recRef = useRef(null);
  const activeRef = useRef(true);
  const mutedRef = useRef(false);
  const langRef = useRef("nl");
  const superRef = useRef(superagent);
  const endRef = useRef(null);

  useEffect(() => { superRef.current = superagent; }, [superagent]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const pickVoice = (ttsLang) => {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    return (
      voices.find((v) => v.lang === ttsLang && /female|giulia|google|natural|samantha|zira|ellen|maría/i.test(v.name)) ||
      voices.find((v) => v.lang === ttsLang) ||
      voices.find((v) => v.lang && v.lang.startsWith(ttsLang.slice(0, 2)))
    );
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    mutedRef.current = true;
    try { recRef.current?.stop(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    const ttsLang = LANGS[langRef.current].tts;
    u.lang = ttsLang;
    const v = pickVoice(ttsLang);
    if (v) u.voice = v;
    u.rate = 0.98;
    u.pitch = 1.04;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      mutedRef.current = false;
      if (activeRef.current) { try { recRef.current?.start(); } catch {} }
    };
    window.speechSynthesis.speak(u);
  };

  const handleUserText = async (text) => {
    setTranscript((p) => [...p, { role: "user", text }]);
    try {
      const reply = await askGiuliaOnce(text) || "Ik heb even niks teruggekregen.";
      setTranscript((p) => [...p, { role: "giulia", text: reply }]);
      speak(reply);
    } catch {
      setTranscript((p) => [...p, { role: "giulia", text: "Er ging iets mis bij het bereiken van Giulia." }]);
    }
  };

  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recRef.current) { try { recRef.current.stop(); } catch {} }
    const rec = new SR();
    rec.lang = LANGS[langRef.current].rec;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).filter((r) => r.isFinal).map((r) => r[0].transcript).join("").trim();
      if (t) handleUserText(t);
    };
    rec.onend = () => { if (activeRef.current && !mutedRef.current) { try { rec.start(); } catch {} } };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    recRef.current = rec;
  };

  useEffect(() => {
    startRec();
    return () => {
      activeRef.current = false;
      try { recRef.current?.stop(); } catch {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  const endCall = () => {
    activeRef.current = false;
    mutedRef.current = false;
    try { recRef.current?.stop(); } catch {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    onEnd?.();
  };

  const toggleLang = () => setLang((l) => (l === "nl" ? "en" : "nl"));

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-charcoal/45 backdrop-blur-2xl rounded-[32px] overflow-hidden animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <button
          onClick={toggleLang}
          disabled={speaking}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-ivory/15 border border-white/25 px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:bg-ivory/25 transition disabled:opacity-50"
        >
          <Languages className="h-3.5 w-3.5" /> {LANGS[lang].label}
        </button>

        <button
          onClick={() => { if (!speaking) startRec(); }}
          className="relative mb-5 outline-none"
          aria-label="Tap om te (her)starten"
        >
          {speaking && <span className="absolute inset-0 rounded-full bg-olive/30 animate-ping" />}
          <span className="relative h-24 w-24 rounded-full bg-olive/20 border border-white/25 flex items-center justify-center">
            <span className={cn("h-3 w-3 rounded-full bg-white/80", speaking ? "animate-pulse-soft" : "")} />
          </span>
        </button>

        <h2 className="text-lg font-display font-semibold text-ivory mb-1">
          {speaking ? "GIULIA-GIULIA spreekt" : "GIULIA-GIULIA luistert"}
        </h2>
        <p className="text-xs text-ivory/55 mb-5">
          {superagent ? "GIULIA-SYSTEM" : "GIULIA-GIULIA"} · {LANGS[lang].label}
        </p>

        <button
          onClick={endCall}
          className="h-14 w-14 rounded-full bg-red-500/80 border border-white/25 flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Gesprek beëindigen"
        >
          <PhoneOff className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="shrink-0 max-h-[40%] overflow-y-auto px-6 pb-5 space-y-2">
        {transcript.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed text-ivory", m.role === "user" ? "bg-ivory/15 rounded-br-md" : "glass-1 rounded-bl-md")}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}