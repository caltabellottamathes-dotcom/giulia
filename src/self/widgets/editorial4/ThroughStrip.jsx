import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** ThroughStrip — FOCUS · 3:2. Type + gauge links, foto-strook (tulle veil)
 *  rechts als ontwerpelement in glas. */
const R = 30, C = 2 * Math.PI * R;

export default function ThroughStrip() {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(71), 250); return () => clearTimeout(t); }, []);
  const off = C - (v / 100) * C;
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 2", "--tile-accent": PLUM }}>
      <div className="flex h-full p-3 gap-3" style={{ color: PLUM }}>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <WidgetHeader label="Focus" count="diep" />
          <motion.h3 className="text-[26px] leading-[0.9] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>SEEING<br />THROUGH</motion.h3>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 80 80" className="h-12 w-12 shrink-0">
              <circle cx="40" cy="40" r={R} fill="none" stroke={PLUM_FAINT} strokeWidth="5" />
              <motion.circle cx="40" cy="40" r={R} fill="none" stroke={SAGE} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 40 40)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }} />
            </svg>
            <div>
              <span className="text-[24px] font-display font-semibold tabular-nums leading-none">{v}%</span>
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">in flow</p>
            </div>
          </div>
        </div>
        <motion.div className="w-[38%] rounded-2xl overflow-hidden shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.tulleVeil} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
      </div>
    </WidgetShell>
  );
}