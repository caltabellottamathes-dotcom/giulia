import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** StackCard — LAYERS · 3:4. Type + staafgrafiek links, foto-kaart (suit on
 *  chairs) rechts als ontwerpelement in glas. */
const BARS = [0.5, 0.68, 0.84];

export default function StackCard() {
  const [grow, setGrow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrow(true), 200); return () => clearTimeout(t); }, []);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 4", "--tile-accent": PLUM }}>
      <div className="flex h-full p-3 gap-3" style={{ color: PLUM }}>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <WidgetHeader label="Layers" count="3" />
          <div>
            <motion.h3 className="text-[36px] leading-[0.86] font-display font-semibold tracking-[-0.05em]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>STACK</motion.h3>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-1">depth · 3 lagen</p>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {BARS.map((b, i) => (
              <motion.span key={i} className="flex-1 rounded-md" style={{ background: i === 2 ? SAGE : PLUM }} initial={{ height: 0 }} animate={{ height: grow ? `${b * 100}%` : 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: "easeOut" }} />
            ))}
          </div>
        </div>
        <motion.div className="w-[42%] rounded-2xl overflow-hidden shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.suitChairs} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
      </div>
    </WidgetShell>
  );
}