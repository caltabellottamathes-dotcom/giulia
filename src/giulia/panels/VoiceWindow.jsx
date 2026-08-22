import React, { useRef, useEffect, useState, useMemo } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Mic, Phone, PhoneOff, Volume2, Loader2, X } from "lucide-react";
import Hotline2Widget from "@/giulia/widgets/new/Hotline2Widget";

/**
 * VoiceWindow — de persistente stem-widget van Giulia. Zweeft als een
 * refraction-paneel rechts in beeld, op Layout-niveau, zodat het open
 * blijft terwijl je tussen dashboards navigeert. Het gesprek loopt door.
 *
 * De stem-agent (directe Gemini, conversatie-only) doet ZELF geen acties.
 * Elke gesproken gebruikersbeurt wordt onderschept en naar chatWithGiulia
 * doorgestuurd — die het echte werk doet (entity-CRUD, navigatie via
 * AgentNavigation, geheugen). De gesproken reply is alleen bevestiging.
 * Omzeilt de ElevenLabs client-tool bug (#603).
 */
function VoiceWindowInner() {
  const { voiceOpen, closeVoice, openModule } = usePanel();
  const { toast } = useToast();
  const navigate = useNavigate();
  const endRef = useRef(null);

  const [transcript, setTranscript] = useState([]);
  const [giuliaWorking, setGiuliaWorking] = useState(false);
  const processedRef = useRef(new Set());

  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const { startSession, endSession, status, isSpeaking } = useConversation({
    agentId: ELEVEN_AGENT_ID,
    clientTools,
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

  // Sluit de sessie netjes af bij unmount.
  useEffect(() => {
    return () => { try { endSession(); } catch { /* ignore */ } };
  }, [endSession]);

  // Escape sluit het venster (niet het gesprek).
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && voiceOpen) closeVoice(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [voiceOpen, closeVoice]);

  const toggle = async () => {
    if (connected) {
      try { await endSession(); } catch {}
    } else {
      setTranscript([]);
      processedRef.current.clear();
      try { await startSession(); } catch {}
    }
  };

  if (!voiceOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/10 animate-fade-in" onClick={closeVoice} />

      {/* Hotline 2 — zwevende widget naast het voice-paneel (links), boven de backdrop */}
      <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-50 w-[560px] animate-fade-up">
        <Hotline2Widget />
      </div>

      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[560px] animate-slide-right">
        <div className="refraction-panel h-full flex flex-col">
          {/* Close — top-left */}
          <button
            onClick={closeVoice}
            className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="shrink-0 px-7 pt-7 pb-4 flex items-center gap-3 ml-12">
            <span className={cn("h-2.5 w-2.5 rounded-full", connected ? "bg-olive animate-pulse-soft" : "bg-ivory/30")} />
            <div>
              <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">
                GIULIA · VOICE
              </p>
              <p className="text-[11px] text-ivory/50 mt-1.5 tracking-wide">
                {connected ? (isSpeaking ? "Spreekt" : "Luistert") : "Bellen met Giulia"}
              </p>
            </div>
            {giuliaWorking && (
              <span className="ml-auto flex items-center gap-1.5 text-[11px] text-olive">
                <Loader2 className="h-3 w-3 animate-spin" /> voert uit…
              </span>
            )}
          </div>

          {/* Voice stage */}
          <div className="relative shrink-0 overflow-hidden mx-7 rounded-[20px] min-h-[240px]">
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
                    <div className="relative h-20 w-20 rounded-full bg-olive/20 backdrop-blur-xl border border-white/25 flex items-center justify-center">
                      <span className={cn("h-3 w-3 rounded-full bg-white/80", isSpeaking ? "animate-pulse-soft" : "")} />
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-full bg-olive/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-white/70" />
                  </div>
                )}
              </div>

              <p className="text-xs text-white/60 mb-4 max-w-[26ch]">
                {connecting
                  ? "Verbinden…"
                  : connected
                  ? "Live gesprek — spreek vrijuit"
                  : "Start een gesprek; Giulia regelt en opent voor je"}
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
                <div className="mt-4 flex items-center gap-1 h-6">
                  {Array.from({ length: 14 }).map((_, i) => (
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
          <div className="flex-1 min-h-0 flex flex-col px-7 pt-4 pb-7">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Volume2 className="h-4 w-4 text-olive" />
              <h2 className="text-sm font-display font-semibold text-ivory">Gesprek</h2>
            </div>

            {transcript.length === 0 ? (
              <p className="text-sm text-ivory/55 text-center py-8">
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
                          isUser ? "bg-charcoal text-ivory rounded-br-md" : "chat-bubble rounded-bl-md"
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
    </>
  );
}

export default function VoiceWindow() {
  return (
    <ConversationProvider>
      <VoiceWindowInner />
    </ConversationProvider>
  );
}