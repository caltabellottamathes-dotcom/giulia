import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** LacedRing — CONNECTION · 1:1. Cirkelvormige foto (legs lacing) als
 *  medaillon in glas, met ring-gauge eromheen + "LACED" type. */
const R = 46, C = 2 * Math.PI * R;

export default function LacedRing() {
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(82), 250); return () => clearTimeout(t); }, []);
  const off = C - (val / 100) * C;
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 items-center gap-2" style={{ color: PLUM }}>
        <div className="self-stretch"><WidgetHeader label="Connection" count="linked" /></div>
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <svg viewBox="0 0 100 100" className="absolute h-full w-full max-w-[180px] max-h-[180px]">
            <circle cx="50" cy="50" r={R} fill="none" stroke={PLUM_FAINT} strokeWidth="2.5" />
            <motion.circle cx="50" cy="50" r={R} fill="none" stroke={SAGE} strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 50 50)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }} />
          </svg>
          <motion.div className="relative h-[58%] aspect-square rounded-full overflow-hidden ring-2 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" style={{ "--tw-ring-color": PLUM }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <img src={PHOTOS4.legsLacing} alt="" className="h-full w-full object-cover" draggable={false} />
          </motion.div>
        </div>
        <div className="flex items-end justify-between self-stretch">
          <motion.h3 className="text-[28px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>LACED</motion.h3>
          <span className="text-[20px] font-display font-semibold tabular-nums">{val}%</span>
        </div>
      </div>
    </WidgetShell>
  );
}