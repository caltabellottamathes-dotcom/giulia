import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";

/** GiuliaConciergeWidget — "GIULIA'S HOTLINE".
 *  Foto als grote shell; bovenaan de beweegde header op de foto. Het transparante
 *  glas toont bovenaan Giulia's status, daarna een dynamische gradient-bloom die
 *  via ElevenLabs `getOutputVolume()` op de echte audio-output reageert (beweegt
 *  en pulseert) zodat het lijkt alsof Giulia echt praat, en onderaan twee
 *  minimalistische full-caps teksten: CHAT + BEL. Giulia-kleuren, geen rood. */
const DEEP = "hsl(var(--d-giulia-deep))";     // olijf
const LIGHT = "hsl(var(--d-giulia-light))";   // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent geelgroen
const IVORY = "hsl(var(--ivory))";

function ConciergeInner() {
  const { openModule } = usePanel();
  const navigate = useNavigate();
  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({ agentId: ELEVEN_AGENT_ID, clientTools });
  const connected = status === "connected";
  const connecting = status === "connecting";

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);

  // rAF — lees Giulia's audio-output en laat de bloom echt op haar stem reageren.
  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const raw = connected && typeof getOutputVolume === "function" ? (getOutputVolume() || 0) : 0;
      levelRef.current = levelRef.current * 0.82 + raw * 0.18;
      const level = Math.min(1, levelRef.current);
      const breath = 0.045 * Math.sin(t * 1.1);
      const scale = 0.5 + level * 1.25 + breath;
      const opacity = 0.5 + level * 0.5;
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

  const toggle = async () => {
    if (connected) { try { await endSession(); } catch { /* ignore */ } }
    else { try { await startSession(); } catch { /* ignore */ } }
  };

  const statusLabel = connecting ? "VERBINDEN" : connected ? (isSpeaking ? "SPREEKT" : "LUISTERT") : "TIK OM TE BELLEN";
  const statusColor = isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.55)";
  const dotColor = isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.35)";

  return (
    <WidgetShell domain="giulia" radius="large" className="aspect-[9/16] w-[290px] min-h-0">
      {/* foto als grote shell */}
      <img src={PHOTO} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />

      {/* bovenaan in de foto: beweegde header + titel */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent" style={{ color: IVORY }}>
        <WidgetHeader label="GIULIA'S HOTLINE" type="pulse" />
      </div>

      {/* donkere gloed achter het glas voor leesbaarheid */}
      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* transparant glas — afgeronde bovenhoeken, omhooglopende schaduw */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] h-[272px] flex flex-col items-center px-4 pt-3.5 pb-5 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 -28px 60px -14px rgba(0,0,0,0.50), 0 -10px 22px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* status — bovenin het glas */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.span
            className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }}
            animate={isSpeaking ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, repeat: isSpeaking ? Infinity : 0, ease: "easeInOut" }}
          />
          <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        {/* dynamische gradient-bloom — reageert op Giulia's audio-output */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ x: [-14, 14, -14], y: [-10, 10, -10] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <button
              ref={bloomRef}
              onClick={toggle}
              aria-label={connected ? "Gesprek stoppen" : "Giulia bellen"}
              className="h-[220px] w-[220px] rounded-full will-change-transform cursor-pointer"
              style={{
                background: `radial-gradient(circle at 38% 34%, ${URGENT} 0%, ${DEEP} 38%, ${LIGHT} 58%, transparent 72%)`,
                filter: "blur(7px)",
                opacity: 0.5,
                border: "none",
              }}
            />
          </motion.div>
        </div>


      </div>
    </WidgetShell>
  );
}

export default function GiuliaConciergeWidget() {
  return (
    <ConversationProvider>
      <ConciergeInner />
    </ConversationProvider>
  );
}