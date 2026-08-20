import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoCard from "./PhotoCard";
import { usePanel } from "@/lib/PanelContext";
import { SELF_PHOTO, PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 30 L 18 30 L 24 30 L 30 12 L 36 48 L 42 20 L 48 30 L 60 30 L 66 30 L 72 16 L 78 44 L 84 30 L 100 30";

/** GiuliaPhotoCard — grote foto + glas-kaart: Giulia's levende kern (state + heartbeat). · 1:1 */
export default function GiuliaPhotoCard() {
  const { openModule } = usePanel();
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800); return () => clearInterval(id); }, []);
  return (
    <PhotoCard photo={SELF_PHOTO.wake} onClick={() => openModule("chat")} aspectRatio="1 / 1" accent={PLUM}
      top={<><p className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70">Giulia</p><h3 className="text-[34px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">GIULIA</h3></>}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.18em] font-bold">
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />online
        </span>
      </div>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-10 w-full mt-1.5">
        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.16)" strokeWidth="0.4" />
        <motion.path d={PATH} fill="none" stroke={SAGE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }} />
      </svg>
      <div className="h-[26px] overflow-hidden flex items-center mt-1.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={idx} className="text-[18px] font-display font-semibold tracking-[-0.02em]" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>{STATES[idx]}</motion.span>
        </AnimatePresence>
      </div>
    </PhotoCard>
  );
}