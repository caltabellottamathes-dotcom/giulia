import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { MessageSquare, Phone, PhoneOff } from "lucide-react";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";

/** GiuliaConciergeWidget — "GIULIA'S HOTLINE".
 *  Foto als grote shell; bovenaan de beweegde header op de foto. Het transparante
 *  glas bevat slechts een gekleurde blob-wave die levendiger en urgent wordt
 *  telkens als Giulia spreekt (ElevenLabs `isSpeaking`), en onderaan twee
 *  verfijnde, minimalistische grafische items: chat openen + Giulia bellen. */
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

      {/* bovenaan in de foto: beweegde header + titel */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent" style={{ color: IVORY }}>
        <WidgetHeader label="GIULIA'S HOTLINE" type="pulse" />
      </div>

      {/* donkere gloed achter het glas voor leesbaarheid */}
      <div className="absolute bottom-0 inset-x-0 h-[64%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* transparant glas — afgeronde bovenhoeken, omhooglopende schaduw */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] h-[272px] flex flex-col items-center px-4 pt-6 pb-5"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 -28px 60px -14px rgba(0,0,0,0.50), 0 -10px 22px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* gekleurde blob-wave — levendiger en urgent telkens als Giulia spreekt */}
        <div className="relative flex items-center justify-center h-[128px] w-full">
          {/* zachte halo achter de blob */}
          <motion.div
            className="absolute rounded-full blur-2xl"
            style={{ width: 104, height: 104, background: isSpeaking ? URGENT : LIGHT, opacity: isSpeaking ? 0.45 : 0.28 }}
            animate={{ scale: isSpeaking ? [1.25, 1.6, 1.25] : [1.05, 1.2, 1.05] }}
            transition={{ duration: isSpeaking ? 1.6 : 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* de blob zelf — morpheert, draait en ademt; sneller + urgent bij spreken */}
          <motion.div
            className="relative h-24 w-24"
            animate={{
              borderRadius: isSpeaking
                ? ["42% 58% 64% 36% / 42% 44% 56% 58%", "58% 42% 36% 64% / 56% 58% 42% 44%", "42% 58% 64% 36% / 42% 44% 56% 58%"]
                : ["46% 54% 54% 46% / 54% 46% 54% 46%", "54% 46% 46% 54% / 46% 54% 46% 54%", "46% 54% 54% 46% / 54% 46% 54% 46%"],
              rotate: isSpeaking ? [0, 16, 0] : [0, 8, 0],
              scale: isSpeaking ? [1, 1.12, 1] : [1, 1.04, 1],
            }}
            transition={{
              borderRadius: { duration: isSpeaking ? 3 : 6.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: isSpeaking ? 5 : 12, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: isSpeaking ? 1.4 : 3, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              background: isSpeaking
                ? `radial-gradient(circle at 35% 30%, ${URGENT}, ${DEEP} 72%)`
                : `radial-gradient(circle at 35% 30%, ${LIGHT}, ${DEEP} 80%)`,
              boxShadow: isSpeaking ? "0 0 36px 6px rgba(213,226,74,0.32)" : "0 0 22px 2px rgba(0,0,0,0.24)",
            }}
          />
        </div>

        {/* mini status (enkel woord) */}
        <p className="text-[9px] uppercase tracking-[0.28em] font-bold mt-1" style={{ color: statusColor }}>{statusLabel}</p>

        {/* ruimte om de knoppen naar de onderkant te duwen */}
        <div className="flex-1" />

        {/* twee verfijnde, minimalistische grafische items — onderaan */}
        <div className="flex items-center justify-center gap-7">
          <button
            onClick={openChat}
            aria-label="Chat met Giulia"
            className="h-10 w-10 rounded-full flex items-center justify-center transition hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.16)" }}
          >
            <MessageSquare className="h-4 w-4" style={{ color: IVORY }} />
          </button>
          <button
            onClick={toggle}
            aria-label={connected ? "Ophangen" : "Bel Giulia"}
            className="h-10 w-10 rounded-full flex items-center justify-center transition hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.16)" }}
          >
            {connected ? <PhoneOff className="h-4 w-4" style={{ color: "rgba(220,40,40,0.92)" }} /> : <Phone className="h-4 w-4" style={{ color: IVORY }} />}
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