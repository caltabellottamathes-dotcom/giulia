import React, { useRef, useEffect, useState } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Mic, Phone, PhoneOff, Volume2, Loader2 } from "lucide-react";

/**
 * Voice — een echt stemgesprek met de ElevenLabs voice agent (inline).
 * Werkt zowel als losse pagina (/voice) als in het ModulePanel.
 *
 * De stem-agent (directe Gemini, conversatie-only) doet ZELF geen acties.
 * Elke uitgesproken gebruikersbeurt wordt hier onderschept en naar
 * chatWithGiulia doorgestuurd — die het echte werk doet: entity-CRUD,
 * navigatie (via AgentNavigation), geheugen, etc. De gesproken reply is
 * alleen bevestiging; het resultaat verschijnt op het scherm + in het
 * chat-paneel. Omzeilt de ElevenLabs client-tool bug (#603).
 */
function VoiceInner() {
  const { activeModule } = usePanel();
  const { toast } = useToast();
  const endRef = useRef(null);
  const inPanel = activeModule === "voice";

  // ── Stem → chatWithGiulia pijplijn ──────────────────────────────────────
  // useConversation (v1.12.1) geeft GEEN messages-array terug, alleen `message`
  // (enkelvoudig). Daarom gebruiken we de onMessage-callback: bij elke
  // gesproken beurt bouwen we hier het transcript op EN sturen we de
  // gebruikersbeurt direct naar chatWithGiulia — die het echte werk doet
  // (entity-CRUD, navigatie via AgentNavigation, geheugen). De stem-agent
  // zelf doet alleen conversatie (directe Gemini, geen tools) en geeft een
  // korte mondelinge bevestiging. Omzeilt ElevenLabs client-tool bug (#603).
  const [transcript, setTranscript] = useState([]);
  const [giuliaWorking, setGiuliaWorking] = useState(false);
  const processedRef = useRef(new Set());

  const { startSession, endSession, status, isSpeaking } = useConversation({
    agentId: ELEVEN_AGENT_ID,
    onMessage: (payload) => {
      const text = String(payload?.message || "").trim();
      const role = payload?.role || (payload?.source === "ai" ? "assistant" : payload?.source || "user");
      if (!text) return;
      setTranscript((t) => [...t, { id: `${Date.now()}-${Math.random()}`, role, text }]);
      if (role === "user" && !processedRef.current.has(text)) {
        processedRef.current.add(text);
        setGiuliaWorking(true);
        base44.functions.invoke("chatWithGiulia", { message: text, source: "chat" })
          .then(() => setGiuliaWorking(false))
          .catch((e) => {
            setGiuliaWorking(false);
            toast({ title: "Giulia kon het niet uitvoeren", description: String(e?.message || e), variant: "destructive" });
          });
      }
    },
  });
  const connected = status === "connected";
  const connecting = status === "connecting";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Sluit de sessie netjes af bij unmount (voorkomt hangend mic bij paneel-sluiten).
  useEffect(() => {
    return () => {
      try { endSession(); } catch { /* ignore */ }
    };
  }, [endSession]);

  const toggle = async () => {
    if (connected) {
      try { await endSession(); } catch {}
    } else {
      setTranscript([]);
      processedRef.current.clear();
      try { await startSession(); } catch {}
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      {!inPanel && (
        <div className="shrink-0 px-1 pb-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/70 mb-1.5 font-semibold">GIULIA · VOICE</p>
          <h1 className="text-3xl font-display font-semibold tracking-[-0.02em] leading-none">Bellen met Giulia</h1>
          <p className="text-sm text-foreground/60 mt-1.5">Echt gesprek met de ElevenLabs agent — voert direct acties uit en navigeert door je systeem.</p>
        </div>
      )}

      <div className={cn("flex-1 grid grid-cols-1 gap-4 min-h-0", inPanel ? "" : "lg:grid-cols-2 lg:gap-6")}>
        {/* Voice stage */}
        <div className="relative overflow-hidden rounded-[20px] min-h-[300px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.wHotline})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/40" />

          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-5">
              {connected ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-olive/20 animate-ping" />
                  <div className="relative h-24 w-24 rounded-full bg-olive/20 backdrop-blur-xl border border-white/25 flex items-center justify-center">
                    <span className={cn("h-3 w-3 rounded-full bg-white/80", isSpeaking ? "animate-pulse-soft" : "")} />
                  </div>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-olive/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Mic className="h-9 w-9 text-white/70" />
                </div>
              )}
            </div>

            <h2 className="text-lg font-display font-semibold text-white mb-1">
              {connected ? (isSpeaking ? "Giulia spreekt" : "Giulia luistert") : "Bel Giulia"}
            </h2>
            <p className="text-xs text-white/60 mb-5 max-w-[26ch]">
              {connecting
                ? "Verbinden…"
                : connected
                ? "Live gesprek — spreek vrijuit, Giulia doet voor je wat nodig is"
                : "Start een gesprek; Giulia voert acties uit en opent schermen voor je"}
            </p>

            <button
              onClick={toggle}
              className={cn(
                "h-14 w-14 rounded-full backdrop-blur-xl border border-white/25 flex items-center justify-center hover:scale-105 transition-transform",
                connected ? "bg-red-500/80" : "bg-olive/80"
              )}
            >
              {connected ? <PhoneOff className="h-5 w-5 text-white" /> : <Phone className="h-5 w-5 text-white" />}
            </button>

            {connected && (
              <div className="mt-5 flex items-center gap-1 h-7">
                {Array.from({ length: 16 }).map((_, i) => (
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
        <div className="glass-card rounded-[20px] p-5 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-4 w-4 text-olive" />
            <h2 className="text-sm font-display font-semibold">Gesprek</h2>
            {giuliaWorking && (
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-olive">
                <Loader2 className="h-3 w-3 animate-spin" />
                Giulia voert uit…
              </span>
            )}
          </div>

          {transcript.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
            </p>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {transcript.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isUser ? "bg-charcoal text-ivory rounded-br-md" : "glass-1 rounded-bl-md"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Voice() {
  return (
    <ConversationProvider>
      <VoiceInner />
    </ConversationProvider>
  );
}