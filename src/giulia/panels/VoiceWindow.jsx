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
import { Loader2, Volume2, X } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";

const DEEP = "hsl(var(--d-giulia-deep))";
const LIGHT = "hsl(var(--d-giulia-light))";
const IVORY = "hsl(var(--ivory))";

/**
 * VoiceWindow — het GIULIA'S HOTLINE stemvenster. Ziet eruit als de widget:
 * foto + header + zwevende glas-card (4 hoeken) met audio-reactieve bloom.
 * Daaronder het live transcript.
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

  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({
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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);
  useEffect(() => { return () => { try { endSession(); } catch {} }; }, [endSession]);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && voiceOpen) closeVoice(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [voiceOpen, closeVoice]);

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);
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

  const toggle = async () => {
    if (connected) { try { await endSession(); } catch {} }
    else { setTranscript([]); processedRef.current.clear(); try { await startSession(); } catch {} }
  };

  if (!voiceOpen) return null;

  const statusLabel = connecting ? "VERBINDEN" : connected ? (isSpeaking ? "SPREEKT" : "LUISTERT") : "TIK OM TE BELLEN";
  const statusColor = connected ? LIGHT : "rgba(255,255,255,0.55)";
  const dotColor = connected ? LIGHT : "rgba(255,255,255,0.35)";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/10 animate-fade-in" onClick={closeVoice} />

      <div className="fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 z-50 w-[calc(100%-2rem)] lg:w-[420px] animate-slide-right">
        <div className="relative h-full flex flex-col overflow-hidden rounded-[32px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
          <button onClick={closeVoice} className="absolute top-4 left-4 z-40 h-9 w-9 rounded-full bg-ivory/10 border border-ivory/15 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors" aria-label="Sluiten">
            <X className="h-4 w-4" />
          </button>

          {/* Photo stage — identiek aan de widget */}
          <div className="relative shrink-0 h-[360px] overflow-hidden">
            <img src={IMAGES.wHotline} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-0 inset-x-0 px-5 pt-5 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-start justify-between" style={{ color: IVORY }}>
              <WidgetHeader label="GIULIA'S HOTLINE." type="pulse" />
              <span className="flex items-center gap-1.5 pt-1">
                <span className="h-1 w-1 rounded-full" style={{ background: dotColor, opacity: connected ? 1 : 0.4 }} />
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-[70%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />
            <div
              className="absolute left-1/2 bottom-4 -translate-x-1/2 w-[300px] h-[200px] rounded-[24px] flex flex-col items-center px-4 pt-3.5 pb-4 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.22)" }}
            >
              <div className="flex items-center gap-2 shrink-0 self-start">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor, opacity: connected ? 1 : 0.6 }} />
                <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
              </div>
              <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
                <button
                  ref={bloomRef}
                  onClick={toggle}
                  aria-label={connected ? "Gesprek stoppen" : "Giulia bellen"}
                  className="h-[150px] w-[150px] rounded-full will-change-transform cursor-pointer"
                  style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92, border: "none" }}
                />
              </div>
            </div>
          </div>

          {/* Live transcript */}
          <div className="flex-1 min-h-0 flex flex-col px-5 pt-4 pb-6" style={{ color: IVORY }}>
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <Volume2 className="h-4 w-4" style={{ color: "hsl(var(--olive))" }} />
              <h2 className="text-sm font-display font-semibold uppercase tracking-[0.16em]">GESPREK</h2>
              {giuliaWorking && (
                <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: "hsl(var(--olive))" }}>
                  <Loader2 className="h-3 w-3 animate-spin" /> voert uit…
                </span>
              )}
            </div>
            {transcript.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.55)" }}>
                {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
              </p>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {transcript.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", isUser ? "bg-charcoal text-ivory rounded-br-md" : "rounded-bl-md")} style={!isUser ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" } : {}}>
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