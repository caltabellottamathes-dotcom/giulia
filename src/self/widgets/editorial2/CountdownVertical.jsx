import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE } from "@/self/widgets/editorial/selfEditorial";

/** CountdownVertical — NUMERIC · 9:16. Giant verticale countdown met
 *  cijfer-morph, progressie-balk en puls-punten. */
const TOTAL = 7 * 3600 + 12 * 60 + 45;

export default function CountdownVertical() {
  const [secs, setSecs] = useState(TOTAL);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : TOTAL)), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "9 / 16", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Tot volgende check-in" count="06:00" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 min-h-0">
          <div className="flex items-end gap-0.5 font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: PLUM }}>
            {[hh, mm, ss].map((part, i) => (
              <React.Fragment key={i}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={part} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.25 }} className="text-[26px] leading-none">
                    {part}
                  </motion.span>
                </AnimatePresence>
                {i < 2 && <span className="text-[26px] leading-none opacity-40">:</span>}
              </React.Fragment>
            ))}
          </div>
          <span className="text-[7px] uppercase tracking-[0.24em] opacity-55">uren : min : sec</span>
          <div className="mt-2 h-1 w-14 rounded-full overflow-hidden" style={{ background: SAGE }}>
            <motion.div className="h-full rounded-full" style={{ background: PLUM }} animate={{ width: `${(secs / TOTAL) * 100}%` }} transition={{ duration: 0.9 }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: PLUM }} animate={{ opacity: i === 1 ? 1 : 0.3 }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}