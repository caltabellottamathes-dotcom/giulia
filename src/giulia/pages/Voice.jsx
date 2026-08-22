import React, { useRef, useEffect, useState } from "react";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Volume2 } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";

const DEEP = "hsl(var(--d-giulia-deep))";
const LIGHT = "hsl(var(--d-giulia-light))";
const IVORY = "hsl(var(--ivory))";

/**
 * Voice — het GIULIA'S HOTLINE oppervlak. In het ModulePanel opent het
 * full-bleed (exact de widget); als losse pagina (/voice) krijgt het een
 * header + live transcript ernaast.
 */
function VoiceInner() {
  const { activeModule } = usePanel();
  const { toast } = useToast();
  const endRef = useRef(null);
  const inPanel = activeModule === "voice";

  const [transcript, setTranscript] = useState([]);
  const [giuliaWorking, setGiuliaWorking] = useState(false);
  const processedRef = useRef(new Set());

  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({
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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);
  useEffect(() => { return () => { try { endSession(); } catch {} }; }, [endSession]);

  // audio-reactieve bloom (identiek aan de Concierge-widget)
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

  const statusLabel = connecting ? "VERBINDEN" : connected ? (isSpeaking ? "SPREEKT" : "LUISTERT") : "TIK OM TE BELLEN";
  const statusColor = connected ? LIGHT : "rgba(255,255,255,0.55)";
  const dotColor = connected ? LIGHT : "rgba(255,255,255,0.35)";

  // De stage — identiek aan de GIULIA'S HOTLINE widget.
  const stage = (bleed) => (
    <div className={cn("relative overflow-hidden", bleed ? "h-full w-full" : "rounded-[28px] min-h-[300px]")}>
      <img src={IMAGES.wHotline} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-start justify-between" style={{ color: IVORY }}>
        <WidgetHeader label="GIULIA'S HOTLINE!" type="pulse" />
        <span className="flex items-center gap-1.5 pt-1">
          <span className="h-1 w-1 rounded-full" style={{ background: dotColor, opacity: connected ? 1 : 0.4 }} />
        </span>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[300px] h-[210px] rounded-[24px] flex flex-col items-center px-4 pt-3.5 pb-4 overflow-hidden"
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
            className="h-[170px] w-[170px] rounded-full will-change-transform cursor-pointer"
            style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92, border: "none" }}
          />
        </div>
      </div>
    </div>
  );

  if (inPanel) {
    return <div className="h-full w-full animate-fade-up">{stage(true)}</div>;
  }

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <div className="shrink-0 px-1 pb-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/70 mb-1.5 font-semibold">GIULIA · VOICE</p>
        <h1 className="text-3xl font-display font-semibold tracking-[-0.02em] leading-none">GIULIA'S HOTLINE!</h1>
        <p className="text-sm text-foreground/60 mt-1.5">Echt gesprek met Giulia — voert direct acties uit en navigeert door je systeem.</p>
      </div>
      <div className="flex-1 grid grid-cols-1 gap-4 min-h-0 lg:grid-cols-2 lg:gap-6">
        {stage(false)}
        <div className="rounded-[20px] p-5 flex flex-col min-h-0" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)", color: IVORY }}>
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="h-4 w-4" style={{ color: "hsl(var(--olive))" }} />
            <h2 className="text-sm font-display font-semibold uppercase tracking-[0.16em]">GESPREK</h2>
            {giuliaWorking && (
              <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: "hsl(var(--olive))" }}>
                <Loader2 className="h-3 w-3 animate-spin" /> Giulia voert uit…
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
  );
}

export default function Voice() {
  return (
    <ConversationProvider>
      <VoiceInner />
    </ConversationProvider>
  );
}