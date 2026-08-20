import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial/selfEditorial";

/** DayAgendaStack — AGENDA VISUAL · 3:4. Verticale tijdgrid met blokken, uur-
 *  labels, en een bewegende "nu"-lijn met puls. */
const MIN = 8, MAX = 17;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const BLOCKS = [
  { start: 9, end: 10, label: "FOCUS", tone: PLUM },
  { start: 12, end: 13, label: "LUNCH", tone: SAGE },
  { start: 14, end: 15.5, label: "FUSION", tone: PLUM },
];
const NOW = 11.4;

const pos = (h) => ((h - MIN) / (MAX - MIN)) * 100;

export default function DayAgendaStack() {
  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => {}} className="min-h-0" style={{ aspectRatio: "3 / 4", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3" style={{ color: PLUM }}>
        <WidgetHeader label="Vandaag · Agenda" count="3 blokken" />
        <div className="flex-1 relative min-h-0 pl-5">
          {HOURS.map((h) => (
            <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: `${pos(h)}%` }}>
              <span className="text-[7px] tabular-nums opacity-45 w-5 -ml-5">{String(h).padStart(2, "0")}</span>
              <span className="flex-1 h-px" style={{ background: PLUM_FAINT }} />
            </div>
          ))}
          {BLOCKS.map((b, i) => (
            <motion.div key={b.label} className="absolute left-5 right-1 rounded-lg flex items-center justify-center" style={{ top: `${pos(b.start)}%`, height: `${pos(b.end) - pos(b.start)}%`, background: b.tone, color: b.tone === SAGE ? PLUM : "white" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: i === 0 ? 0.95 : 0.82, x: 0 }} transition={{ delay: i * 0.12, duration: 0.5 }}>
              <span className="text-[8px] uppercase tracking-[0.16em] font-bold">{b.label}</span>
            </motion.div>
          ))}
          <motion.div className="absolute left-0 right-0 flex items-center z-10" style={{ top: `${pos(NOW)}%` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-[7px] font-bold w-5 -ml-5" style={{ color: PLUM }}>NU</span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: PLUM }} />
            <span className="flex-1 h-px" style={{ background: PLUM }} />
          </motion.div>
        </div>
      </div>
    </WidgetShell>
  );
}