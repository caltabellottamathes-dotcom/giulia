import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** Reflect — JOURNAL / CALM · 16:9. Corner-blur foto + "REFLECTIE" grote type
 *  + ademende cirkel in 4-7-8 ritme (ademruimte voor het schrijven). */
export default function Reflect() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.cornerBlur} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(20,22,26,0.9) 0%, rgba(20,22,26,0.4) 55%, rgba(20,22,26,0.15) 100%)" }} />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 h-28 w-28 flex items-center justify-center">
          <motion.div className="absolute h-full w-full rounded-full" style={{ border: `1.5px solid ${SAGE}` }} animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute h-full w-full rounded-full" style={{ border: `1px solid ${SAGE}` }} animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.3, 0, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        </div>
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Journal · ademruimte</motion.p>
          <div>
            <motion.h2 className="text-[44px] leading-[0.86] font-display font-bold tracking-[-0.05em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>REFLECTIE</motion.h2>
            <motion.div className="flex items-center gap-3 mt-2 text-[10px] uppercase tracking-[0.22em] font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
              <span style={{ color: SAGE }}>4</span><span className="opacity-40">in</span>
              <span style={{ color: SAGE }}>7</span><span className="opacity-40">hold</span>
              <span style={{ color: SAGE }}>8</span><span className="opacity-40">out</span>
            </motion.div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}