import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS11, PLUM, SAGE } from "@/self/widgets/editorial11/editorial11Data";

/** Spend — BUDGET / LIFE · 4:3. Plafond-foto + "UIT GAVEN" grote type + klimmende
 *  weekuitgaven-staven die in sage omslaan bij overschrijding. */
const BARS = [0.4, 0.52, 0.68, 0.9, 0.62];

export default function Spend() {
  const [grow, setGrow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrow(true), 200); return () => clearTimeout(t); }, []);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "4 / 3", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS11.ceiling} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(20,22,26,0.92) 0%, rgba(20,22,26,0.55) 45%, rgba(20,22,26,0.2) 100%)" }} />
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Weekbudget · 5/7 dagen</motion.p>
          <div>
            <motion.h2 className="text-[40px] leading-[0.86] font-display font-bold tracking-[-0.05em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>UIT<span className="inline-block" style={{ color: SAGE }}>GAVEN</span></motion.h2>
            <div className="mt-3 flex items-end gap-4">
              <div className="flex items-end gap-1.5 h-12">
                {BARS.map((b, i) => (
                  <motion.span key={i} className="w-2 rounded-sm" style={{ background: i === 3 ? SAGE : "rgba(255,255,255,0.85)" }} initial={{ height: 0 }} animate={{ height: grow ? `${b * 100}%` : 0 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}>
                <span className="text-[26px] font-display font-semibold tabular-nums leading-none">€42</span>
                <p className="text-[8px] uppercase tracking-[0.2em] opacity-65 mt-0.5">van €50 deze week</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}