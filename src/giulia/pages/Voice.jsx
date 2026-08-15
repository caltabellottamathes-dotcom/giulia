import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import PageHero from "@/system/components/glass/PageHero";
import { Mic, Phone, PhoneOff, Volume2, Languages } from "lucide-react";

/**
 * Voice — een echt gesprek met GIULIA-GIULIA.
 * Browser SpeechRecognition (STT, NL of EN) → interpretInput (GIULIA-GIULIA) →
 * SpeechSynthesis (TTS). Continue luisterloop met barge-in: Giulia's eigen
 * stem wordt niet opgepakt door de mic. Volledig in het Nederlands óf Engels.
 */
const LANGS = {
  nl: { rec: "nl-NL", tts: "nl-NL", label: "NL" },
  en: { rec: "en-US", tts: "en-US", label: "EN" },
};

export default function Voice() {
  const [callActive, setCallActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState("nl");

  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const mutedRef = useRef(false); // true terwijl Giulia spreekt (barge-in)
  const langRef = useRef("nl");
  const endRef = useRef(null);

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    window.speechSynthesis?.getVoices?.();
  }, []);

  useEffect(() => {
    if (callActive) {
      const t = setInterval(() => setDuration((d) => d + 1), 1000);
      return () => clearInterval(t);
    }
  }, [callActive]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  useEffect(() => () => {
    activeRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    window.speechSynthesis?.cancel();
  }, []);

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
    // barge-in: pauzeer de mic terwijl Giulia spreekt (geen echo-loop)
    mutedRef.current = true;
    try { recognitionRef.current?.stop(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    const ttsLang = LANGS[langRef.current].tts;
    u.lang = ttsLang;
    const v = pickVoice(ttsLang);
    if (v) u.voice = v;
    u.rate = 0.98;
    u.pitch = 1.04; // lichte, levendige toon — afwisseling
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      mutedRef.current = false;
      if (activeRef.current) { try { recognitionRef.current?.start(); } catch {} }
    };
    window.speechSynthesis.speak(u);
  };

  const handleUserText = async (text) => {
    setTranscript((prev) => [...prev, { role: "user", text }]);
    try {
      // GIULIA-GIULIA — dezelfde agent als de chat
      const res = await base44.functions.invoke("interpretInput", { message: text });
      const reply = res?.data?.giulia_response || "Ik heb even niks teruggekregen.";
      setTranscript((prev) => [...prev, { role: "giulia", text: reply }]);
      speak(reply);
    } catch (e) {
      setTranscript((prev) => [...prev, { role: "giulia", text: "Er ging iets mis bij het bereiken van Giulia." }]);
    }
  };

  const startCall = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setCallActive(true);
    setDuration(0);
    setTranscript([]);
    activeRef.current = true;
    mutedRef.current = false;

    const rec = new SR();
    rec.lang = LANGS[langRef.current].rec;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).filter((r) => r.isFinal).map((r) => r[0].transcript).join("").trim();
      if (text) handleUserText(text);
    };
    rec.onend = () => {
      if (activeRef.current && !mutedRef.current) { try { rec.start(); } catch {} }
    };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    recognitionRef.current = rec;
  };

  const endCall = () => {
    activeRef.current = false;
    mutedRef.current = false;
    setCallActive(false);
    try { recognitionRef.current?.stop(); } catch {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const toggleLang = () => {
    setLang((l) => (l === "nl" ? "en" : "nl"));
    // pas direct aan als een call loopt (bijvolgende herstart van herkenning)
    if (recognitionRef.current) recognitionRef.current.lang = LANGS[langRef.current === "nl" ? "en" : "nl"].rec;
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <PageHero
        page="voice"
        icon={Mic}
        eyebrow="GIULIA-GIULIA"
        title="Bellen met Giulia"
        subtitle="Echt gesprek, stemgestuurd — Nederlands of Engels"
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Voice stage */}
        <div className="relative overflow-hidden rounded-[24px] min-h-[360px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.giuliaConcierge})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/40" />

          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            {/* Taal-schakelaar */}
            <button
              onClick={toggleLang}
              disabled={callActive && speaking}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-ivory/15 backdrop-blur-xl border border-white/25 px-3 py-1.5 text-[11px] font-semibold text-white/90 hover:bg-ivory/25 transition disabled:opacity-50"
            >
              <Languages className="h-3.5 w-3.5" /> {LANGS[lang].label}
            </button>

            <div className="relative mb-6">
              {callActive ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-olive/20 animate-ping" />
                  <div className="relative h-28 w-28 rounded-full bg-olive/20 backdrop-blur-xl border border-white/25 flex items-center justify-center">
                    <span className={cn("h-3 w-3 rounded-full bg-white/80", speaking ? "animate-pulse-soft" : "")} />
                  </div>
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-olive/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-white/70" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-display font-semibold text-white mb-1">
              {callActive ? (speaking ? "Giulia spreekt" : "Giulia luistert") : "Bel Giulia"}
            </h2>
            <p className="text-sm text-white/60 mb-6">
              {callActive ? formatTime(duration) : `Spreek ${lang === "en" ? "Engels" : "Nederlands"} — Giulia volgt`}
            </p>

            {!supported && (
              <p className="text-xs text-white/50 mb-4 max-w-xs">
                Spraakherkenning wordt niet ondersteund in deze browser. Gebruik Chrome of Safari.
              </p>
            )}

            <button
              onClick={callActive ? endCall : startCall}
              className={cn(
                "h-16 w-16 rounded-full backdrop-blur-xl border border-white/25 flex items-center justify-center hover:scale-105 transition-transform",
                callActive ? "bg-red-500/80" : "bg-olive/80"
              )}
            >
              {callActive ? <PhoneOff className="h-6 w-6 text-white" /> : <Phone className="h-6 w-6 text-white" />}
            </button>

            {callActive && (
              <div className="mt-6 flex items-center gap-1 h-8">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/40 animate-pulse-soft"
                    style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live transcript */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="h-4 w-4 text-olive" />
            <h2 className="text-sm font-display font-semibold">Gesprek</h2>
          </div>

          {transcript.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              {callActive ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
            </p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {transcript.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user" ? "bg-charcoal text-ivory rounded-br-md" : "glass-1 rounded-bl-md"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}