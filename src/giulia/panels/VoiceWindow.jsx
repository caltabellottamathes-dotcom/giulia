import React, { useRef, useEffect, useState, useMemo } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { X } from "lucide-react";
import { Image } from "@/components/ui/image";
import VoiceChatWidget from "@/giulia/widgets/new/VoiceChatWidget";
import { useAudio } from "@/lib/useAudio";
import SineLayers from "@/giulia/widgets/new/SineLayers";

const VOICE_PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0439bb842_Giulia_VOICE.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const IVORY = "hsl(var(--ivory))";

/** stripAudioTags — verwijdert bracketed audio-effect-tags (bv. [sigh], [laughs])
 *  uit de live voice-transcript vóór weergave. Raw tekst blijft in state. */
const stripAudioTags = (s) => String(s || "").replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();

/**
 * VoiceWindow — #35 · P·9x16·B·SIDE · onder.
 * PhotoShell = de voice-window foto (9:16 portret, full-bleed).
 * GlassCard onder = de live transcriptie + audio-reactieve bloom om te bellen.
 * De bloom ademt en reageert op Giulia's audio-output (getOutputVolume).
 *
 * De stem-agent (directe Gemini, conversatie-only) doet ZELF geen acties.
 * Elke gesproken gebruikersbeurt wordt onderschept en naar chatWithGiulia
 * doorgestuurd — die het echte werk doet. Omzeilt de ElevenLabs client-tool bug.
 */
function VoiceWindowInner() {
  const { voiceOpen, closeVoice, openModule } = usePanel();
  const navigate = useNavigate();
  const endRef = useRef(null);

  const [transcript, setTranscript] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const processedRef = useRef(new Set());

  // Audio-reactieve bloom.
  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);

  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  // Tijdens een voice-call wordt het gesprek NIET in de chat opgenomen. De
  // ElevenLabs-agent voert acties direct uit via de client-tools; chat-Giulia
  // krijgt niets en schrijft dus niets in de chat. Het live transcript blijft
  // lokaal op dit oppervlak (geen Message-entities).
  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({
    agentId: ELEVEN_AGENT_ID,
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Bloom — ademt + reageert op Giulia's audio-output.
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
      if (el) {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = String(opacity);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [connected, getOutputVolume]);

  useEffect(() => {
    return () => { try { endSession(); } catch { /* ignore */ } };
  }, [endSession]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && voiceOpen) closeVoice(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [voiceOpen, closeVoice]);

  const toggle = async () => {
    if (connected) {
      try { await endSession(); } catch { /* ignore */ }
    } else {
      setTranscript([]);
      processedRef.current.clear();
      setVideoPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setVideoPlaying(false);
    try { startSession(); } catch { /* ignore */ }
  };

  if (!voiceOpen) return null;

  const statusLabel = connecting ? "Verbinden…" : connected ? (isSpeaking ? "Spreekt" : "Luistert") : "Tik om te bellen";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/10 animate-fade-in" onClick={closeVoice} />

      {/* Compact chat-window naast het voice-paneel (links) */}
      <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-50">
        <VoiceChatWidget />
      </div>

      {/* Voice paneel — zelfde formaat als de andere panelen (rechts, volledige hoogte, schuift in) */}
      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] lg:w-[720px] z-50 animate-slide-right">
        <div className="relative w-full h-full rounded-[28px] overflow-hidden">
          {/* PhotoShell — Image-component voor snelle WebP-load */}
          <Image src={VOICE_PHOTO} fittingType="fill" alt="" className="absolute inset-0 w-full h-full" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30" />

          {/* Close — linksboven */}
          <button
            onClick={closeVoice}
            className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header op de foto */}
          <div className="absolute top-0 inset-x-0 px-5 pt-5 pb-10 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-3 ml-12">
            <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", connected ? "bg-olive animate-pulse-soft" : "bg-ivory/30")} />
            <div className="min-w-0">
              <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">
                GIULIA · VOICE
              </p>
              <p className="text-[11px] text-ivory/60 mt-1.5 tracking-wide truncate">
                {statusLabel}
              </p>
            </div>
          </div>

          {/* GlassCard onder — bloom + transcript */}
          <div
            className="absolute left-0 right-0 bottom-0 h-[64%] rounded-t-[28px] flex flex-col px-4 pt-3 pb-4 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px) saturate(1.35)",
              WebkitBackdropFilter: "blur(12px) saturate(1.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)",
              color: IVORY,
            }}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }}
            />

            {/* Audio-reactieve bloom — veel groter, gecentreerd in de glasscard */}
            <div className="relative flex-1 flex items-center justify-center min-h-0 py-4 -mx-4 w-[calc(100%+2rem)]">
              <SineLayers bandsRef={bandsRef} className="absolute bottom-2 left-0 right-0 w-full opacity-80 pointer-events-none" />
              <button
                ref={bloomRef}
                onClick={toggle}
                aria-label={connected ? "Gesprek stoppen" : "Giulia bellen"}
                className="h-[320px] w-[320px] rounded-full will-change-transform cursor-pointer"
                style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 46%, transparent 74%)`, filter: "blur(3px)", opacity: 0.95, border: "none" }}
              />
            </div>

            {/* Live transcript — compact onder de bloom */}
            <div className="shrink-0 min-h-0 max-h-[34%] flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
                {transcript.length === 0 ? (
                  <p className="text-[12px] text-ivory/55 text-center py-6">
                    {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
                  </p>
                ) : (
                  transcript.map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                            isUser ? "bg-charcoal text-ivory rounded-br-md" : "chat-bubble rounded-bl-md"
                          )}
                        >
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

          {videoPlaying && (
            <video
              src="https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/2e63d396b_GiuliaPhone.mp4"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 60 }}
              autoPlay
              playsInline
              onEnded={handleVideoEnd}
            />
          )}
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