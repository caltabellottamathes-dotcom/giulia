import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

/** MilestoneJourney — TIMELINE · 3:4. Verticale reis-tijdlijn met
 *  mijlpaal-nodes (done / nu / upcoming) en een voortgangslijn die tekent. */
const MS = [
  { t: "Kick-off", d: "12 jun", done: true },
  { t: "Onderzoek", d: "28 jun", done: true },
  { t: "Prototype", d: "15 jul", done: true },
  { t: "Testronde", d: "nu", current: true },
  { t: "Lancering", d: "30 aug", done: false },
];
const doneCount = MS.filter((m) => m.done).length;
const pct = Math.round((doneCount / MS.length) * 100);

export default function MilestoneJourney() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 4", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Reis · mijlpalen" />
          <span className="text-[16px] font-display font-semibold tabular-nums">{pct}%</span>
        </div>
        <div className="flex-1 relative pl-5 pr-8 min-h-0 flex flex-col justify-between py-1">
          <div className="absolute right-0 top-0 bottom-0 w-6 rounded-lg overflow-hidden">
            <img src={SELF_PHOTO.journal} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          <svg viewBox="0 0 4 100" preserveAspectRatio="none" className="absolute left-1.5 top-0 h-full w-1">
            <line x1="2" y1="0" x2="2" y2="100" stroke={PLUM_FAINT} strokeWidth="2" />
            <motion.line x1="2" y1="0" x2="2" y2="100" stroke={SAGE} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 1.2, ease: "easeOut" }} />
          </svg>
          {MS.map((m, i) => (
            <motion.div key={i} className="relative flex items-center gap-2.5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}>
              <span className="absolute -left-3.5 h-2.5 w-2.5 rounded-full" style={{ background: m.current ? PLUM : m.done ? SAGE : PLUM_FAINT, border: m.current ? `2px solid ${PLUM}` : "none" }} />
              {m.current && <motion.span className="absolute -left-3.5 h-2.5 w-2.5 rounded-full" style={{ border: `1px solid ${PLUM}` }} animate={{ scale: [1, 2.2], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate leading-tight">{m.t}</p>
                <p className="text-[8px] uppercase tracking-wider opacity-55">{m.d}</p>
              </div>
              {m.current && <span className="text-[7px] uppercase tracking-[0.16em] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: PLUM, color: "white" }}>nu</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}