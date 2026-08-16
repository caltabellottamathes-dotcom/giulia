import React, { useMemo, useRef, useEffect } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { Mic, Phone, PhoneOff, Volume2 } from "lucide-react";

/**
 * Voice — een echt stemgesprek met de ElevenLabs voice agent (inline).
 * Werkt zowel als losse pagina (/voice) als in het ModulePanel.
 *
 * De agent kan:
 *  - proactief navigeren (navigate_to_page / open_panel / scroll / highlight)
 *  - direct acties uitvoeren (taken, notities, geheugen, agenda, journal,
 *    check-ins, needs, notificaties) — "meteen doorgestuurde acties"
 *  - externe verzending klaarzetten (create_approval) en complexe opdrachten
 *    delegeren (delegate_to_giulia → chatWithGiulia function-calling loop).
 */
function VoiceInner() {
  const navigate = useNavigate();
  const { openModule, activeModule } = usePanel();
  const endRef = useRef(null);
  const inPanel = activeModule === "voice";

  const clientTools = useMemo(
    () => buildVoiceClientTools({ navigate, openModule }),
    [navigate, openModule]
  );

  const { startSession, endSession, status, isSpeaking, messages } = useConversation({
    agentId: ELEVEN_AGENT_ID,
  });
  const connected = status === "connected";
  const connecting = status === "connecting";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      try { await startSession({ clientTools }); } catch {}
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
              backgroundImage: `url(${IMAGES.giuliaConcierge})`,
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
          </div>

          {(!messages || messages.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
            </p>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {messages.map((m, i) => {
                const text = String(m.message || m.content || m.text || "");
                const isUser = m.role === "user";
                return (
                  <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isUser ? "bg-charcoal text-ivory rounded-br-md" : "glass-1 rounded-bl-md"
                      )}
                    >
                      {text}
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