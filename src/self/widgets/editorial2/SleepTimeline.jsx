import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";

/** SleepTimeline — TIMELINE · 2:3. Zeven nachten verticaal met geanimeerde
 *  duurbaren, bedtijd/ontwaak micro-labels en een gemarkeerde beste nacht. */
const NIGHTS = [
  { d: "Za", bed: "23:40", wake: "07:10", dur: 7.5 },
  { d: "Vr", bed: "00:15", wake: "07:30", dur: 7.25 },
  { d: "Do", bed: "23:10", wake: "06:50", dur: 7.7, best: true },
  { d: "Wo", bed: "00:40", wake: "08:00", dur: 7.3 },
  { d: "Di", bed: "23:25", wake: "07:00", dur: 7.6 },
  { d: "Ma", bed: "00:05", wake: "07:15", dur: 7.2 },
  { d: "Zo", bed: "23:55", wake: "08:30", dur: 8.5 },
];
const MAX = 9;

export default function SleepTimeline() {
  const avg = (NIGHTS.reduce((s, n) => s + n.dur, 0) / NIGHTS.length).toFixed(1);
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "2 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Slaap · 7 nachten" count={`avg ${avg}u`} />
        <div className="flex-1 flex flex-col min-h-0 pl-3">
          {NIGHTS.map((n, i) => (
            <div key={i} className="relative flex-1 flex items-center gap-2 min-h-0">
              <span className="absolute left-[-9px] h-2 w-2 rounded-full" style={{ background: n.best ? PLUM : SAGE }} />
              <span className="text-[8px] uppercase tracking-wider opacity-60 w-5 shrink-0">{n.d}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
                <motion.div className="h-full rounded-full" style={{ background: n.best ? PLUM : SAGE }} initial={{ width: 0 }} animate={{ width: `${(n.dur / MAX) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.06 }} />
              </div>
              <span className="text-[8px] tabular-nums opacity-70 w-9 text-right shrink-0">{n.dur}u</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1 text-[7px] uppercase tracking-[0.18em] opacity-50">
          <span>best · Do 7.7u</span><span>doel · 8u</span>
        </div>
      </div>
    </WidgetShell>
  );
}