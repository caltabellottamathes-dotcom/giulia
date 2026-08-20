import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** GoalThreads — GROWTH / SELF · 1:1. Glove-thread foto + radiale draden die
 *  naar buiten tekenen + centrale "verbonden %" teller + "DOELEN" type. */
export default function GoalThreads() {
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(68), 300); return () => clearTimeout(t); }, []);
  const lines = Array.from({ length: 14 });

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.gloveThread} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 55%, rgba(20,22,26,0.2), rgba(20,22,26,0.78) 90%)" }} />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {lines.map((_, i) => {
            const a = (i / lines.length) * 2 * Math.PI;
            return <motion.line key={i} x1="50" y1="55" x2={50 + Math.cos(a) * 42} y2={55 + Math.sin(a) * 42} stroke={SAGE} strokeWidth="0.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.55 }} transition={{ duration: 0.8, delay: 0.5 + i * 0.05, ease: "easeOut" }} />;
          })}
        </svg>
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <motion.span className="text-[40px] font-display font-bold tabular-nums leading-none text-ivory" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.5, ease: "backOut" }}>{val}</motion.span>
          <span className="text-[7px] uppercase tracking-[0.2em] text-ivory/70 mt-0.5">doelen verbonden %</span>
        </div>
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory pointer-events-none">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Groei · verbonden</motion.p>
          <motion.h2 className="text-[28px] leading-[0.9] font-display font-bold tracking-[-0.04em] self-end" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>DOELEN</motion.h2>
        </div>
      </div>
    </WidgetShell>
  );
}