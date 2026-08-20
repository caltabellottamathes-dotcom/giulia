import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { PHOTOS3, PLUM, SAGE } from "@/self/widgets/editorial3/editorial3Data";

/** CountStars — NUMERIC / TYPOGRAPHY · 3:4. Numbers-neck foto + "14 / 30" grote
 *  cijfers + constellation die verbindt (getekende lijnen tussen dots). */
const PTS = [
  { x: 22, y: 26, n: 3 }, { x: 48, y: 18, n: 8 }, { x: 74, y: 30, n: 14 },
  { x: 34, y: 50, n: 11 }, { x: 66, y: 56, n: 19 }, { x: 50, y: 72, n: 23 },
  { x: 26, y: 80, n: 27 }, { x: 76, y: 84, n: 30 },
];
const LINKS = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [4, 5], [5, 6], [5, 7]];

export default function CountStars() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 4", "--tile-accent": PLUM }}>
      <div className="relative h-full w-full overflow-hidden">
        <motion.img src={PHOTOS3.numbersNeck} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1.14, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,22,26,0.92) 4%, rgba(20,22,26,0.3) 55%, rgba(20,22,26,0.25) 100%)" }} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {LINKS.map(([a, b], i) => (
            <motion.line key={i} x1={PTS[a].x} y1={PTS[a].y} x2={PTS[b].x} y2={PTS[b].y} stroke={SAGE} strokeWidth="0.4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 0.7, delay: 0.7 + i * 0.12, ease: "easeOut" }} />
          ))}
        </svg>
        {PTS.map((p, i) => (
          <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.09, duration: 0.4, ease: "backOut" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} />
            <span className="text-[7px] tabular-nums text-ivory/80 mt-0.5">{p.n}</span>
          </motion.div>
        ))}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-ivory pointer-events-none">
          <motion.p className="text-[9px] uppercase tracking-[0.28em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>Maand · 14 van 30</motion.p>
          <div className="flex items-end gap-2">
            <motion.span className="text-[64px] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>14</motion.span>
            <motion.span className="text-[20px] font-display font-semibold opacity-60 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>/ 30</motion.span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}