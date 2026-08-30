import React, { useRef, useEffect, useState, useMemo } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAudio } from "@/lib/useAudio";
import SineLayers from "@/giulia/widgets/new/SineLayers";
import { IMAGES } from "@/lib/images";

const MATTIA_AGENT_ID = "agent_0301m14xfjxhfnh86pd8m19mdgvb";
const VOICE_PHOTO = IMAGES.mattiaPortrait;
const DEEP = "#94925d";    // olive
const LIGHT = "#d8dab3";    // whipped pistachio
const INK = "#2a2c30";

/** stripAudioTags — verwijdert bracketed audio-effect-tags (bv. [sigh], [laughs])
 *  uit de live voice-transcript vóór weergave. Raw tekst blijft in state. */
const stripAudioTags = (s) => String(s || "").replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();

/**
 * MattiaVoiceWindow — MATTIA'S HOTLINE · voice. Full-screen rechtsschuivend
 * paneel, parallel aan Giulia's VoiceWindow, in pistache/olive. Verbindt met
 * de Mattia ElevenLabs-agent (custom Gemini LLM + client-tools, geen end_call).
 */
function MattiaVoiceWindowInner() {
  const { mattiaVoiceOpen, closeMattiaVoice, openModule } = usePanel();
  const navigate = useNavigate();
  const endRef = useRef(null);

  const [transcript, setTranscript] = useState([]);
  const processedRef = useRef(new Set());

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);

  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({
    agentId: MATTIA_AGENT_ID,
    clientTools,
    onMessage: (payload) => {
      const text = String(payload?.message || "").trim();
      const role = payload?.role || (payload?.source === "ai" ? "assistant" : payload?.source || "user");
      if (!text || processedRef.current.has(text)) return;
      processedRef.current.add(text);
      setTranscript((t) => [...t, { id: `${Date.now()}-${Math.random()}`, role, text }]);
    },
  });

  const connected = status === "connected";
  const connecting = status === "connecting";
  const bandsRef = useAudio({ getOutputVolume, connected });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  // Bloom — ademt + reageert op Mattia's audio-output.
  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const raw = connected && typeof getOutputVolume === "function" ? (getOutputVolume() || 0) : 0;
      levelRef.current = levelRef.current * 0.82 + raw * 0.18;
      const level = Math.min(1, levelRef.current);
      const breath = 0.08 * Math.sin(t * 1.1);
      const scale = 0.9 + level * 0.5 + breath;
      const opacity = 0.6 + level * 0.32 + 0.04 * Math.sin(t * 1.1);
      const el = bloomRef.current;
      if (el) { el.style.transform = `scale(${scale})`; el.style.opacity = String(opacity); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connected, getOutputVolume]);

  useEffect(() => { return () => { try { endSession(); } catch { /* ignore */ } }; }, [endSession]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && mattiaVoiceOpen) closeMattiaVoice(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mattiaVoiceOpen, closeMattiaVoice]);

  const toggle = async () => {
    if (connected) {
      try { await endSession(); } catch { /* ignore */ }
    } else {
      setTranscript([]);
      processedRef.current.clear();
      try { await startSession(); } catch { /* ignore */ }
    }
  };

  if (!mattiaVoiceOpen) return null;

  const statusLabel = connecting ? "Verbinden…" : connected ? (isSpeaking ? "Spreekt" : "Luistert") : "Tik om te bellen";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/10 animate-fade-in" onClick={closeMattiaVoice} />

      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] lg:w-[720px] z-50 animate-slide-right">
        <div className="relative w-full h-full rounded-[28px] overflow-hidden">
          <Image src={VOICE_PHOTO} fittingType="fill" alt="" className="absolute inset-0 w-full h-full" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30" />

          <button
            onClick={closeMattiaVoice}
            className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute top-0 inset-x-0 px-5 pt-5 pb-10 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-3 ml-12">
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", connected ? "bg-[#94925d] animate-pulse-soft" : "bg-ivory/30")} />
            <div className="min-w-0">
              <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">
                MATTIA · VOICE
              </p>
              <p className="text-[11px] text-ivory/60 mt-1.5 tracking-wide truncate">
                {statusLabel}
              </p>
            </div>
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 h-[64%] rounded-t-[28px] flex flex-col px-4 pt-3 pb-4 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px) saturate(1.35)",
              WebkitBackdropFilter: "blur(12px) saturate(1.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)",
              color: "hsl(var(--ivory))",
            }}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

            <div className="relative flex-1 flex items-center justify-center min-h-0 py-4 -mx-4 w-[calc(100%+2rem)]">
              <SineLayers bandsRef={bandsRef} className="absolute bottom-2 left-0 right-0 w-full opacity-80 pointer-events-none" />
              <button
                ref={bloomRef}
                onClick={toggle}
                aria-label={connected ? "Gesprek stoppen" : "Mattia bellen"}
                className="h-[320px] w-[320px] rounded-full will-change-transform cursor-pointer"
                style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 46%, transparent 74%)`, filter: "blur(3px)", opacity: 0.95, border: "none" }}
              />
            </div>

            <div className="shrink-0 min-h-0 max-h-[34%] flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
                {transcript.length === 0 ? (
                  <p className="text-[12px] text-ivory/55 text-center py-6">
                    {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Mattia's antwoorden live te zien"}
                  </p>
                ) : (
                  transcript.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", isUser ? "bg-charcoal text-ivory rounded-br-md" : "chat-bubble rounded-bl-md")}>
                          {stripAudioTags(m.text)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MattiaVoiceWindow() {
  return (
    <ConversationProvider>
      <MattiaVoiceWindowInner />
    </ConversationProvider>
  );
}