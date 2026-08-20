import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import CountUp from "@/system/widgets/CountUp";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** Risen — WAKE / MORNING · 9:16. Full-bleed ghosted figure + "OP GESTAAN"
 *  grote type + capacity-ring die vult (ochtend-gereedheid). */
const R = 30, C = 2 * Math.PI * R;

export default function Risen() {
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(82), 300); return () => clearTimeout(t); }, []);
  const off = C - (val / 100) * C;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "9 / 16", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.wakeFigure} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 8%, rgba(20,22,26,0.35) 48%, rgba(20,22,26,0.15) 100%)" }} />
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Goede morgen · gereed</motion.p>
          <div className="flex flex-col gap-3">
            <motion.h2 className="text-[36px] leading-[0.9] font-display font-bold tracking-[-0.04em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>OP<br />GESTAAN</motion.h2>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 80 80" className="h-14 w-14 shrink-0">
                <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
                <motion.circle cx="40" cy="40" r={R} fill="none" stroke={SAGE} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 40 40)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }} />
              </svg>
              <div>
                <CountUp value={val} className="text-[28px] font-display font-semibold tabular-nums leading-none block text-ivory" />
                <span className="text-[8px] uppercase tracking-[0.2em] opacity-65">gereed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}