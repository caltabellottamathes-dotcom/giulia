import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** SignalCard — SIGNAL · 9:16. Foto-kaart (macro mouth) boven als
 *  ontwerpelement, "SIGNAL" type + pulserende oranje accent + waveform. */
export default function SignalCard() {
  const pts = [10, 16, 8, 20, 14, 22, 12, 18, 10, 14, 8, 16];
  const path = `M ${pts.map((p, i) => `${(i / (pts.length - 1)) * 100},${30 - p}`).join(" L ")}`;
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "9 / 16", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="Signal" count="live" />
        <motion.div className="rounded-2xl overflow-hidden flex-1 min-h-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.macroMouth} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
        <div className="flex items-center gap-2">
          <motion.span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: "#d96924" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <motion.h3 className="text-[28px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>SIGNAL</motion.h3>
        </div>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full">
          <motion.path d={path} fill="none" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut" }} />
        </svg>
        <span className="text-[9px] uppercase tracking-[0.2em] opacity-55">82% helder · 3 sec geleden</span>
      </div>
    </WidgetShell>
  );
}