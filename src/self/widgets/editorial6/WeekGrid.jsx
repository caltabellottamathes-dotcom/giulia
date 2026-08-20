import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** WeekGrid — AGENDA · 2:3. Zeven dagen als horizontale sporen met
 *  gebeurtenis-blokken gekleurd per domein + dichtheid + vandaag-markering. */
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const WEEK = [
  [{ s: 10, w: 20, d: "focus" }, { s: 55, w: 15, d: "life" }],
  [{ s: 20, w: 30, d: "focus" }],
  [{ s: 15, w: 10, d: "life" }, { s: 50, w: 25, d: "focus" }, { s: 80, w: 10, d: "self" }],
  [{ s: 10, w: 40, d: "focus" }],
  [{ s: 30, w: 20, d: "life" }],
  [{ s: 20, w: 35, d: "life" }],
  [],
];
const COL = { focus: PLUM, life: SAGE, self: "hsl(var(--d-life-deep))" };
const todayIdx = 3;

export default function WeekGrid() {
  const total = WEEK.reduce((a, d) => a + d.length, 0);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "2 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Week · grid" />
          <span className="text-[14px] font-display font-semibold tabular-nums">{total}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 min-h-0 justify-center">
          {DAYS.map((d, i) => (
            <div key={d} className="flex items-center gap-2" style={{ opacity: i === todayIdx ? 1 : 0.8 }}>
              <span className="text-[9px] font-semibold w-5 shrink-0" style={{ color: i === todayIdx ? PLUM : undefined }}>{d}</span>
              <div className="flex-1 h-4 rounded-md relative" style={{ background: PLUM_FAINT }}>
                {WEEK[i].map((e, j) => (
                  <motion.span key={j} className="absolute top-0 bottom-0 rounded-md" style={{ left: `${e.s}%`, width: `${e.w}%`, background: COL[e.d] || PLUM }} initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + i * 0.06 + j * 0.04, duration: 0.4 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 text-[7px] uppercase tracking-wider opacity-60">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: PLUM }} />focus</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: SAGE }} />life</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--d-life-deep))" }} />self</span>
        </div>
      </div>
    </WidgetShell>
  );
}