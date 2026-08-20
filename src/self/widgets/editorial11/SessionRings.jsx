import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import CountUp from "@/system/widgets/CountUp";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** SessionRings — THERAPY / SELF · 1:1. Vase-petal foto + giant "12" + "sessies
 *  afgerond" + pulserende ringen rond de oranje accent (recente sessie). */
export default function SessionRings() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.vasePetal} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 6%, rgba(20,22,26,0.2) 55%, rgba(20,22,26,0.1) 100%)" }} />
        <div className="absolute right-9 top-1/2 -translate-y-1/2 h-20 w-20 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="absolute h-16 w-16 rounded-full" style={{ border: `1px solid ${SAGE}` }} animate={{ scale: [0.5, 1.6], opacity: [0.7, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }} />
          ))}
          <span className="h-3 w-3 rounded-full" style={{ background: "#d96924" }} />
        </div>
        <div className="absolute inset-0 p-4 flex flex-col justify-end text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70 mb-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Therapie · traject</motion.p>
          <div className="flex items-end gap-2">
            <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <CountUp value={12} className="text-[68px] leading-[0.8] font-display font-bold tabular-nums tracking-[-0.05em] block" />
            </motion.span>
            <motion.span className="text-[13px] font-display font-semibold opacity-70 mb-2 leading-tight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>sessies<br />afgerond</motion.span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}