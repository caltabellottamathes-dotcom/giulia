import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { Mic, Phone, PhoneOff, Volume2 } from "lucide-react";

/**
 * Voice — a real voice call with Giulia.
 * Browser SpeechRecognition (STT) → chatWithGiulia backend function →
 * SpeechSynthesis (TTS). Continuous listen loop while the call is active.
 */
export default function Voice() {
  const [callActive, setCallActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const endRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  useEffect(() => {
    if (callActive) {
      const t = setInterval(() => setDuration((d) => d + 1), 1000);
      return () => clearInterval(t);
    }
  }, [callActive]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(
    () => () => {
      activeRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      window.speechSynthesis?.cancel();
    },
    []
  );

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "nl-NL";
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleUserText = async (text) => {
    setTranscript((prev) => [...prev, { role: "user", text }]);
    try {
      const res = await base44.functions.invoke("chatWithGiulia", { message: text });
      const reply = res?.data?.response || "Ik heb geen antwoord ontvangen.";
      setTranscript((prev) => [...prev, { role: "giulia", text: reply }]);
      speak(reply);
    } catch (e) {
      setTranscript((prev) => [
        ...prev,
        { role: "giulia", text: "Er ging iets mis bij het bereiken van Giulia." },
      ]);
    }
  };

  const startCall = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setCallActive(true);
    setDuration(0);
    setTranscript([]);
    activeRef.current = true;

    const rec = new SR();
    rec.lang = "nl-NL";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join("")
        .trim();
      if (text) handleUserText(text);
    };
    rec.onend = () => {
      if (activeRef.current) {
        try {
          rec.start();
        } catch {}
      }
    };
    rec.onerror = () => {};
    try {
      rec.start();
    } catch {}
    recognitionRef.current = rec;
  };

  const endCall = () => {
    activeRef.current = false;
    setCallActive(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <div className="mb-4">
        <h1 className="text-2xl font-display font-semibold tracking-tight">Voice met Giulia</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spreek met je assistent — echt, stemgestuurd
        </p>
      </div>

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
            <div className="relative mb-6">
              {callActive ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-olive/20 animate-ping" />
                  <div className="relative h-28 w-28 rounded-full bg-olive/20 backdrop-blur-xl border border-white/25 flex items-center justify-center">
                    <span
                      className={cn(
                        "h-3 w-3 rounded-full bg-white/80",
                        speaking ? "animate-pulse-soft" : ""
                      )}
                    />
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
              {callActive ? formatTime(duration) : "Intelligente begeleiding, stemgestuurd"}
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
              {callActive ? (
                <PhoneOff className="h-6 w-6 text-white" />
              ) : (
                <Phone className="h-6 w-6 text-white" />
              )}
            </button>

            {callActive && (
              <div className="mt-6 flex items-center gap-1 h-8">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/40 animate-pulse-soft"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
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
              {callActive
                ? "Zeg iets om te beginnen…"
                : "Start een gesprek om Giulia's antwoorden live te zien"}
            </p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {transcript.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-charcoal text-ivory rounded-br-md"
                        : "glass-1 rounded-bl-md"
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