import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS3, PLUM, SAGE } from "@/self/widgets/editorial3/editorial3Data";

/** TwoWorlds — NETWORK / CROSS-DOMAIN · 2:3. Split-coats foto + "TWO WORLDS"
 *  grote type + netwerk-dots die met lijnen over de naad verbinden. */
const DOTS = [
  { x: 22, y: 30 }, { x: 78, y: 22 }, { x: 30, y: 52 }, { x: 72, y: 58 },
  { x: 50, y: 40 }, { x: 26, y: 74 }, { x: 74, y: 78 },
];
const LINKS = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [4, 6], [2, 5], [3, 6]];

export default function TwoWorlds() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "2 / 3", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS3.twoCoats} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.9) 6%, rgba(20,22,26,0.25) 50%, rgba(20,22,26,0.1) 100%)" }} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {LINKS.map(([a, b], i) => (
            <motion.line key={i} x1={DOTS[a].x} y1={DOTS[a].y} x2={DOTS[b].x} y2={DOTS[b].y} stroke={SAGE} strokeWidth="0.4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }} transition={{ duration: 0.9, delay: 0.6 + i * 0.12, ease: "easeOut" }} />
          ))}
        </svg>
        {DOTS.map((d, i) => (
          <motion.span key={i} className="absolute h-2 w-2 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${d.x}%`, top: `${d.y}%`, background: i === 4 ? SAGE : "rgba(255,255,255,0.9)" }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: "backOut" }} />
        ))}
        <div className="absolute inset-0 p-4 flex flex-col justify-end text-ivory">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70 mb-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Cross-Domain · mapping</motion.p>
          <motion.h2 className="text-[34px] leading-[0.88] font-display font-bold tracking-[-0.05em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>TWO<br />WORLDS</motion.h2>
        </div>
      </div>
    </WidgetShell>
  );
}