import React, { useEffect, useMemo, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";
import { X } from "lucide-react";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";
const LIGHT = "hsl(var(--d-giulia-light))";
const URGENT = "hsl(var(--d-giulia-urgent))";
const IVORY = "hsl(var(--ivory))";

/** DraggableHotline — de sleepbare, persistente GIULIA'S HOTLINE.
 *  Zweeft op Layout-niveau (blijft open tussen pagina's), vierkante glas-card
 *  flush onderaan met de audio-reactieve bloom. Sleep aan de header; tik op de
 *  bloom om te bellen/ophangen. */
function HotlineInner() {
  const { hotlineOpen, closeHotline, openModule } = usePanel();
  const navigate = useNavigate();
  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);
  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({ agentId: ELEVEN_AGENT_ID, clientTools });
  const connected = status === "connected";
  const connecting = status === "connecting";

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();

  // rAF — gradient bloom ademt én reageert op Giulia's audio-output.
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

  // Sluit de stem-sessie als het venster wordt gesloten.
  useEffect(() => {
    if (!hotlineOpen && connected) { try { endSession(); } catch { /* ignore */ } }
  }, [hotlineOpen, connected, endSession]);

  const toggle = async () => {
    if (connected) { try { await endSession(); } catch { /* ignore */ } }
    else { try { await startSession(); } catch { /* ignore */ } }
  };

  if (!hotlineOpen) return null;

  const statusLabel = connecting ? "VERBINDEN" : connected ? (isSpeaking ? "SPREEKT" : "LUISTERT") : "TIK OM TE BELLEN";
  const statusColor = isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.55)";
  const dotColor = isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.35)";

  return (
    <div ref={constraintsRef} className="fixed inset-0 z-[60] pointer-events-none">
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={false}
        className="fixed bottom-24 left-4 lg:bottom-6 lg:left-6 pointer-events-auto w-[280px] h-[392px] rounded-[24px] overflow-hidden select-none"
        style={{ boxShadow: "0 28px 64px -20px rgba(0,0,0,0.55)" }}
      >
        {/* foto achtergrond */}
        <img src={PHOTO} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />

        {/* header — sleepgreep + status + sluiten */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute top-0 inset-x-0 px-3.5 pt-3.5 pb-10 bg-gradient-to-b from-black/55 to-transparent flex items-start justify-between cursor-grab active:cursor-grabbing"
          style={{ color: IVORY }}
        >
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-80">GIULIA'S HOTLINE</span>
            <span className="flex items-center gap-1.5 mt-1.5">
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }}
                animate={isSpeaking ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, repeat: isSpeaking ? Infinity : 0, ease: "easeInOut" }} />
              <span className="text-[8px] uppercase tracking-[0.3em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
            </span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); closeHotline(); }} className="h-7 w-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition" aria-label="Sluiten">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* vierkante glas-card flush onderaan */}
        <div className="absolute inset-x-0 bottom-0 h-[280px] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            boxShadow: "0 -24px 52px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22)",
          }}>
          <button
            ref={bloomRef}
            onClick={toggle}
            aria-label={connected ? "Gesprek stoppen" : "Giulia bellen"}
            className="h-[150px] w-[150px] rounded-full will-change-transform cursor-pointer"
            style={{ background: `radial-gradient(circle, ${URGENT} 0%, ${DEEP} 45%, transparent 72%)`, filter: "blur(3px)", opacity: 0.72, border: "none" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function DraggableHotline() {
  return (
    <ConversationProvider>
      <HotlineInner />
    </ConversationProvider>
  );
}