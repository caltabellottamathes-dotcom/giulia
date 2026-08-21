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
 *  glas (zoals de What-Matters-checklist) bevat slechts twee grafische items —
 *  chat openen + Giulia bellen — en één live actie-indicator die afgaat telkens
 *  als Giulia spreekt (ElevenLabs `isSpeaking`), zodat het voelt alsof Giulia
 *  echt praat. Giulia-kleuren (olijf / pistachio / urgent). */
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
      <div className="absolute bottom-0 inset-x-0 h-[62%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* transparant glas — afgeronde bovenhoeken, omhooglopende schaduw */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] px-4 pt-5 pb-6 flex flex-col items-center"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 -28px 60px -14px rgba(0,0,0,0.50), 0 -10px 22px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* live actie-indicator — gaat af telkens als Giulia spreekt */}
        <div className="relative flex items-center justify-center h-[84px] w-full">
          {isSpeaking && [0, 1, 2].map((i) => (
            <motion.span
              key={i} className="absolute rounded-full"
              style={{ border: `1px solid ${URGENT}` }}
              initial={{ width: 56, height: 56, opacity: 0.55 }}
              animate={{ width: 132, height: 132, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
            />
          ))}
          {isSpeaking && (
            <span className="absolute rounded-full pointer-events-none" style={{ width: 64, height: 64, boxShadow: "0 0 42px 10px rgba(213,226,74,0.35)" }} />
          )}
          <div
            className="relative h-14 w-14 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: `1px solid ${isSpeaking ? URGENT : connected ? LIGHT : "rgba(255,255,255,0.18)"}`,
            }}
          >
            {isSpeaking ? (
              <div className="flex items-end gap-[3px] h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i} className="w-[3px] rounded-full" style={{ background: URGENT }}
                    animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                  />
                ))}
              </div>
            ) : connected ? (
              <motion.span
                className="h-3 w-3 rounded-full" style={{ background: LIGHT }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} />
            )}
          </div>
        </div>

        {/* mini status (enkel woord) */}
        <p className="text-[9px] uppercase tracking-[0.28em] font-bold mt-1.5" style={{ color: statusColor }}>{statusLabel}</p>

        {/* twee grafische items: chat openen + Giulia bellen */}
        <div className="flex items-center justify-center gap-5 mt-4">
          <button
            onClick={openChat}
            aria-label="Chat met Giulia"
            className="h-14 w-14 rounded-full flex items-center justify-center transition hover:scale-105"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: IVORY }} />
          </button>
          <button
            onClick={toggle}
            aria-label={connected ? "Ophangen" : "Bel Giulia"}
            className="h-16 w-16 rounded-full flex items-center justify-center transition hover:scale-105"
            style={{
              background: connected ? "rgba(200,40,40,0.9)" : DEEP,
              border: `1px solid ${connected ? "rgba(255,255,255,0.25)" : "transparent"}`,
              boxShadow: connected ? "0 0 26px rgba(200,40,40,0.45)" : "0 0 22px rgba(0,0,0,0.30)",
            }}
          >
            {connected ? <PhoneOff className="h-6 w-6 text-white" /> : <Phone className="h-6 w-6 text-white" />}
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