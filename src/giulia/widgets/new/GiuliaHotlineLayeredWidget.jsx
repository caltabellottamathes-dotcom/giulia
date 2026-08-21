import React, { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { ELEVEN_AGENT_ID } from "@/lib/voiceNavigation";
import { buildVoiceClientTools } from "@/lib/voiceClientTools";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const IVORY = "hsl(var(--ivory))";

/** GiuliaHotlineLayeredWidget — "GIULIA'S HOTLINE!" op P·2x3·B·SIDE (gelaagd).
 *  Foto-shell: header + titel "Spill the tea!" net boven het glas. Glazen card
 *  onderaan: status + audio-reactieve gradient-bloom (alleen de 2 GIULIA-kleuren)
 *  die via ElevenLabs `getOutputVolume()` op Giulia's stem reageert. Klik op de
 *  bloom = bellen starten / nog eens klikken = stoppen. */

function HotlineInner() {
  const { openModule } = usePanel();
  const navigate = useNavigate();
  const clientTools = useMemo(() => buildVoiceClientTools({ navigate, openModule }), [navigate, openModule]);

  const { startSession, endSession, status, isSpeaking, getOutputVolume } = useConversation({ agentId: ELEVEN_AGENT_ID, clientTools });
  const connected = status === "connected";
  const connecting = status === "connecting";

  const bloomRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);

  // rAF — lees Giulia's audio-output en laat de bloom op haar stem reageren.
  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const raw = connected && typeof getOutputVolume === "function" ? (getOutputVolume() || 0) : 0;
      levelRef.current = levelRef.current * 0.82 + raw * 0.18;
      const level = Math.min(1, levelRef.current);
      const breath = 0.05 * Math.sin(t * 1.1);
      const baseScale = connected ? 0.62 : 0.5;
      const baseOpacity = connected ? 0.5 : 0.3;
      const scale = baseScale + level * 1.3 + breath;
      const opacity = baseOpacity + level * 0.5;
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
  const statusColor = connected ? LIGHT : "rgba(255,255,255,0.55)";
  const dotColor = connected ? LIGHT : "rgba(255,255,255,0.4)";

  return (
    <div className="w-[280px]">
      <PhotoGlassLayeredWidget
        shape="2:3"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.50}
        overhang={0.08}
        domain="giulia"
        radius="large"
        glassBlur={6}
        glassBorder="1px solid rgba(255,255,255,0.30)"
        overlay="bg-gradient-to-t from-black/5 via-transparent to-black/50"
        photoChildren={
          <div className="absolute top-0 inset-x-0 p-4 flex flex-col" style={{ height: "50%", color: IVORY }}>
            <WidgetHeader label="GIULIA'S HOTLINE!" type="pulse" />
            <div className="flex-1" />
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">
              Spill the tea!
            </h3>
          </div>
        }
      >
        {/* status — bovenin de glazen card */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: dotColor }}
            animate={isSpeaking ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, repeat: isSpeaking ? Infinity : 0, ease: "easeInOut" }}
          />
          <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        {/* dynamische gradient-bloom — klikken = bellen starten/stoppen */}
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
              className="h-[150px] w-[150px] rounded-full will-change-transform cursor-pointer"
              style={{
                background: `radial-gradient(circle at 38% 34%, ${LIGHT} 0%, ${DEEP} 48%, transparent 72%)`,
                filter: "blur(5px)",
                opacity: 0.3,
                border: "none",
              }}
            />
          </motion.div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}

export default function GiuliaHotlineLayeredWidget() {
  return (
    <ConversationProvider>
      <HotlineInner />
    </ConversationProvider>
  );
}