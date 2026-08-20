import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PHOTOS4, PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** HandsMedallion — ON HAND · 16:9. Cirkelvormige foto (hands) als medaillon
 *  links, "TOUCH" type + stat-chips rechts in glas. */
const CHIPS = [{ k: "Tasks", v: 12 }, { k: "People", v: 4 }, { k: "Ideas", v: 7 }];

export default function HandsMedallion() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex h-full p-3 items-center gap-3" style={{ color: PLUM }}>
        <motion.div className="h-[70%] aspect-square rounded-full overflow-hidden ring-2 shrink-0 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.4)]" style={{ "--tw-ring-color": SAGE }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTOS4.handsMetal} alt="" className="h-full w-full object-cover" draggable={false} />
        </motion.div>
        <div className="flex-1 flex flex-col justify-between min-w-0 h-full py-1">
          <WidgetHeader label="On Hand" count="vandaag" />
          <motion.h3 className="text-[30px] leading-[0.88] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>TOUCH</motion.h3>
          <div className="flex gap-2">
            {CHIPS.map((c, i) => (
              <motion.div key={c.k} className="rounded-lg px-2.5 py-1.5 flex-1" style={{ background: PLUM_FAINT }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}>
                <span className="text-[16px] font-display font-semibold tabular-nums leading-none block">{c.v}</span>
                <span className="text-[7px] uppercase tracking-[0.18em] opacity-60">{c.k}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}