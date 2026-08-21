import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { WidgetShell } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";

/** GiuliaConciergeWidget — "GIULIA'S HOTLINE".
 *  Foto als grote shell. Bovenaan de header met Giulia's status. Het transparante
 *  glas toont een dynamische gradient-bloom die beweegt en pulseert en levendiger
 *  (urgent) wordt telkens als Giulia spreekt (ElevenLabs `isSpeaking`) — alsof ze
 *  echt praat. Onderaan twee minimalistische tekstknoppen: CHAT + BEL. Geen rood. */
const DEEP = "hsl(var(--d-giulia-deep))";     // olijf
const LIGHT = "hsl(var(--d-giulia-light))";   // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent geelgroen
const IVORY = "hsl(var(--ivory))";

function ConciergeInner() {
  const { openChat, openModule } = usePanel();
  const navigate = useNavigate();
  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const { startSession, endSession, status, isSpeaking } = useConversation({ agentId: ELEVEN_AGENT_ID, clientTools });
  const connected = status === "connected";
  const connecting = status === "connecting";

  const toggle = async () => {
    if (connected) { try { await endSession(); } catch { /* ignore */ } }
    else { try { await startSession(); } catch { /* ignore */ } }
  };

  const statusLabel = connecting ? "VERBINDEN" : connected ? (isSpeaking ? "SPREEKT" : "LUISTERT") : "STANDBY";
  const statusColor = isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.45)";

  return (
    <WidgetShell domain="giulia" radius="large" className="aspect-[9/16] w-[290px] min-h-0">
      {/* foto als grote shell */}
      <img src={PHOTO} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />

      {/* header op de foto — titel links, Giulia's status rechts */}
      <div
        className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-center justify-between"
        style={{ color: IVORY }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex items-center justify-center h-3 w-3">
            <motion.span
              className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${DEEP}` }}
              animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: DEEP }} />
          </span>
          <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-60">GIULIA'S HOTLINE</h3>
        </div>
        <span className="text-[9px] font-bold tracking-[0.24em] uppercase" style={{ color: statusColor }}>{statusLabel}</span>
      </div>

      {/* donkere gloed achter het glas voor leesbaarheid */}
      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* transparant glas — afgeronde bovenhoeken, omhooglopende schaduw */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] h-[280px] flex flex-col items-center px-4 pt-6 pb-5"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 -28px 60px -14px rgba(0,0,0,0.50), 0 -10px 22px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* dynamische spraakgolf-bloom — beweegt en pulseert, reageert op isSpeaking */}
        <div className="relative flex-1 flex items-center justify-center w-full">
          {/* grote zachte bloom */}
          <motion.div
            className="absolute rounded-full blur-2xl"
            style={{ width: 190, height: 190, background: `radial-gradient(circle, ${isSpeaking ? URGENT : LIGHT}, transparent 70%)` }}
            animate={{
              x: isSpeaking ? [-14, 14, -14] : [-6, 6, -6],
              y: isSpeaking ? [-10, 10, -10] : [-4, 4, -4],
              scale: isSpeaking ? [1, 1.28, 1] : [1, 1.1, 1],
              opacity: isSpeaking ? [0.7, 1, 0.7] : [0.4, 0.6, 0.4],
            }}
            transition={{ duration: isSpeaking ? 2 : 5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* middelste bloom, contrasterende kleur */}
          <motion.div
            className="absolute rounded-full blur-xl"
            style={{ width: 116, height: 116, background: `radial-gradient(circle, ${DEEP}, transparent 72%)` }}
            animate={{
              x: isSpeaking ? [12, -12, 12] : [5, -5, 5],
              scale: isSpeaking ? [1.1, 0.9, 1.1] : [1, 1.05, 1],
              opacity: isSpeaking ? [0.8, 1, 0.8] : [0.5, 0.7, 0.5],
            }}
            transition={{ duration: isSpeaking ? 1.6 : 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* urgente kern — alleen wanneer Giulia spreekt */}
          {isSpeaking && (
            <motion.div
              className="absolute rounded-full blur-md"
              style={{ width: 64, height: 64, background: `radial-gradient(circle, ${URGENT}, transparent 70%)` }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* twee minimalistische tekstknoppen — full caps, geen rood */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={openChat}
            className="text-[10px] uppercase tracking-[0.28em] font-bold transition hover:opacity-70"
            style={{ color: IVORY }}
          >
            Chat
          </button>
          <span className="h-3 w-px bg-white/20" />
          <button
            onClick={toggle}
            className="text-[10px] uppercase tracking-[0.28em] font-bold transition hover:opacity-70"
            style={{ color: IVORY }}
          >
            {connected ? "Hang op" : "Bel"}
          </button>
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