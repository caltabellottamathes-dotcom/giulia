import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** Ticking — TIME / FOCUS · 3:2. Stride-foto + "LOPEND" grote type + lopende
 * timer-sessie met voortgangsbalk en resterende tijd. */
export default function Ticking() {
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(58), 250); return () => clearTimeout(t); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 2", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.stride} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.95) 0%, rgba(20,22,26,0.5) 55%, rgba(20,22,26,0.1) 100%)" }} />
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Timer · 14:00 – 15:30</motion.p>
          <div>
            <motion.h2 className="text-[44px] leading-[0.86] font-display font-bold tracking-[-0.05em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>LOPEND</motion.h2>
            <div className="mt-4 max-w-[280px]">
              <div className="h-2 rounded-full overflow-hidden bg-white/15 relative">
                <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: SAGE }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.3, ease: "easeOut", delay: 0.5 }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[9px] uppercase tracking-[0.2em] opacity-70">
                <span>52 min gelogd</span><span>38m over</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}