import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** SteadyCard — STATE · 1:1. Grote foto-kaart (tweed) als ontwerpelement in
 *  glas, "STEADY" grote type eronder + capacity-balk. */
export default function SteadyCard() {
  const [cap, setCap] = useState(0);
  useEffect(() => { const t = setTimeout(() => setCap(78), 250); return () => clearTimeout(t); }, []);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="How I'm Doing" count="calm" />
        <motion.div className="rounded-2xl overflow-hidden flex-1 min-h-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.greenTweed} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
        <div className="flex items-end justify-between">
          <motion.h3 className="text-[30px] leading-[0.9] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>STEADY</motion.h3>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
              <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: `${cap}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} />
            </div>
            <CountUp value={cap} className="text-[16px] font-display font-semibold tabular-nums" />
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}