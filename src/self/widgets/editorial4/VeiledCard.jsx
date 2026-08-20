import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** VeiledCard — CLARITY · 4:3. Foto-kaart (lace drape) links als
 *  ontwerpelement, "VEILED" type + helderheidsmeter rechts in glas. */
export default function VeiledCard() {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(68), 250); return () => clearTimeout(t); }, []);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "4 / 3", "--tile-accent": PLUM }}>
      <div className="flex h-full p-3 gap-3" style={{ color: PLUM }}>
        <motion.div className="w-[44%] rounded-2xl overflow-hidden shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.laceDrape} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <WidgetHeader label="Clarity" count="filtered" />
          <motion.h3 className="text-[32px] leading-[0.88] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>VEILED</motion.h3>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] uppercase tracking-[0.2em] opacity-55">helder</span>
              <span className="text-[14px] font-display font-semibold tabular-nums">{v}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
              <motion.div className="h-full rounded-full" style={{ background: SAGE }} animate={{ width: `${v}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} />
            </div>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}