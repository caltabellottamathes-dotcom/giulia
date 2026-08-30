import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-life-deep))";    // blue-grey
const LIGHT = "hsl(var(--d-life-light))";  // pistachio
const IVORY = "hsl(var(--ivory))";

/** PlayTimeWidget — "MATTIA'S PLAYTIME!" op het LIFE-dashboard. Gelaagde
 *  foto-shell met Mattia's branding-foto. Klik op de foto-shell opent de
 *  /playtime pagina; klik op de bloem belt Mattia rechtstreeks (opent de
 *  globale MattiaVoiceWindow). */
export default function PlayTimeWidget() {
  const { openModule } = usePanel();
  const navigate = useNavigate();

  return (
    <div className="w-[280px]">
      <PhotoGlassLayeredWidget
        shape="2:3"
        photo={IMAGES.mattiaPlayTime}
        glassPosition="bottom"
        glassFraction={0.50}
        overhang={0.08}
        domain="life"
        radius="large"
        glassBlur={6}
        glassBorder="1px solid rgba(255,255,255,0.30)"
        overlay="bg-gradient-to-t from-black/5 via-transparent to-black/50"
        photoChildren={
          <button
            onClick={() => navigate("/playtime")}
            className="absolute top-0 inset-x-0 p-4 flex flex-col items-start text-left cursor-pointer"
            style={{ height: "50%", color: IVORY }}
            aria-label="Open PlayTime"
          >
            <WidgetHeader label="MATTIA'S PLAYTIME!" type="pulse" />
            <div className="flex-1" />
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">
              Play time!
            </h3>
          </button>
        }
      >
        {/* status — bovenin de glazen card */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: LIGHT }}
            animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[9px] uppercase tracking-[0.32em] font-bold" style={{ color: LIGHT }}>TIK OM TE BELLEN</span>
        </div>

        {/* zwevende bloem — klikken = Mattia bellen (globale voicewindow) */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ x: [-14, 14, -14], y: [-10, 10, -10] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <button
              onClick={() => openModule("mattiaVoice")}
              aria-label="Mattia bellen"
              className="h-[150px] w-[150px] rounded-full will-change-transform cursor-pointer"
              style={{
                background: `radial-gradient(circle at 38% 34%, ${LIGHT} 0%, ${DEEP} 48%, transparent 72%)`,
                filter: "blur(5px)",
                opacity: 0.5,
                border: "none",
              }}
            />
          </motion.div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}