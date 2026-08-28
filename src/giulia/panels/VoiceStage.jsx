import React, { useRef, useEffect, useState, useMemo } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { Image } from "@/components/ui/image";
import { useAudio } from "@/lib/useAudio";
import SineLayers from "@/giulia/widgets/new/SineLayers";

const VOICE_PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0439bb842_Giulia_VOICE.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const IVORY = "hsl(var(--ivory))";

/**
 * VoiceStage — de voice-view van het multi-functionele GlassPanel.
 * PhotoShell + audio-reactieve bloom + live transcript. Vult het paneel;
 * sluiten/overlay/Escape door het FloatingPanel. De stem-agent doet zelf geen
 * acties — gesproken beurten gaan naar chatWithGiulia via de client-tools.
 */
function VoiceStageInner() {
  const { openModule } = usePanel();
  const navigate = useNavigate();
  const endRef = useRef(null);

  const [transcript, setTranscript] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const processedRef = useRef(new Set());

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);

  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

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

  const statusLabel = connecting ? "Verbinden…" : connected ? (isSpeaking ? "Spreekt" : "Luistert") : "Tik om te bellen";

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 42%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 42%)" }}>
        <Image src={VOICE_PHOTO} fittingType="fill" alt="" className="w-full h-full" draggable={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30" />

      {/* Header op de foto — ml-12 om de FloatingPanel-close-knop vrij te houden */}
      <div className="absolute top-0 inset-x-0 px-5 pt-5 pb-10 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", connected ? "bg-olive animate-pulse-soft" : "bg-ivory/30")} />
        <div className="min-w-0">
          <p className="font-display font-semibold tracking-[0.22em] text-[13px] uppercase text-ivory leading-none">GIULIA · VOICE</p>
          <p className="text-[11px] text-ivory/60 mt-1.5 tracking-wide truncate">{statusLabel}</p>
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
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

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
                    <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", isUser ? "bg-charcoal text-ivory rounded-br-md" : "chat-bubble rounded-bl-md")}>
                      {m.text}
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
  );
}

export default function VoiceStage() {
  return (
    <ConversationProvider>
      <VoiceStageInner />
    </ConversationProvider>
  );
}