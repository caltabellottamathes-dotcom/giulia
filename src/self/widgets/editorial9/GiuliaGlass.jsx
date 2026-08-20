import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassPhotoCard, { BURG, SAGE_SOFT } from "./GlassPhotoCard";
import { usePanel } from "@/lib/PanelContext";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/125b8e087_A_high-contrast_medium_shot_of_2026062702281.jpeg";
const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 30 L 18 30 L 24 30 L 30 12 L 36 48 L 42 20 L 48 30 L 60 30 L 66 30 L 72 16 L 78 44 L 84 30 L 100 30";

/** GiuliaGlass — glas-groot + foto-klein: Giulia's levende kern. · 1:1 */
export default function GiuliaGlass() {
  const { openModule } = usePanel();
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800); return () => clearInterval(id); }, []);
  return (
    <GlassPhotoCard photo={PHOTO} onClick={() => openModule("chat")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Giulia</p><h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">GIULIA</h3></>}>
      <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] font-bold opacity-70 mb-1">
        <motion.span className="h-2 w-2 rounded-full" style={{ background: SAGE_SOFT }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />online
      </div>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-10 w-full">
        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(45,45,45,0.14)" strokeWidth="0.5" />
        <motion.path d={PATH} fill="none" stroke={BURG} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }} />
      </svg>
      <div className="h-[24px] overflow-hidden flex items-center mt-1.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={idx} className="text-[18px] font-display font-semibold tracking-[-0.02em]" style={{ color: BURG }} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>{STATES[idx]}</motion.span>
        </AnimatePresence>
      </div>
    </GlassPhotoCard>
  );
}