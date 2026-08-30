import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildBreakdown } from "@/lib/projectEngine";

const PLUM = "#301728";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const FOCUS_COLORS = [PISTACHIO, OLIVE, PLUM];
const EASE = [0.16, 1, 0.3, 1];
const textOn = (c) => (c === PISTACHIO ? "#301728" : "rgba(255,255,255,0.92)");

/** ProjectSubDetailsPills — Focus-versie van WalletTreemapBar. Horizontale
 *  pills per onderdeel, breedte naar aantal taken. Hover → breakdown van de
 *  subonderdelen. Focus-kleuren; Plum labels. */
export default function ProjectSubDetailsPills({ tasks = [], themes = [] }) {
  const breakdown = useMemo(() => buildBreakdown(tasks, themes), [tasks, themes]);
  const [hovered, setHovered] = useState(null);
  const resetTimer = useRef(null);
  const hoverIn = (id) => { clearTimeout(resetTimer.current); setHovered(id); resetTimer.current = setTimeout(() => setHovered(null), 3500); };
  const hoverOut = () => { clearTimeout(resetTimer.current); setHovered(null); };

  const segments = breakdown.map((o, i) => ({
    id: i,
    name: o.name,
    color: FOCUS_COLORS[i % FOCUS_COLORS.length],
    weight: Math.max(1, o.total),
    items: o.subs.length > 1 ? o.subs.map((s) => `${s.name} ${s.pct}%`) : [`${o.done}/${o.total} klaar · ${o.pct}%`],
  }));
  const total = segments.reduce((s, x) => s + x.weight, 0) || 1;
  const LINE_H = [10, 30, 20, 6, 36, 14];

  return (
    <div className="w-full h-full rounded-[18px] glass-2 flex flex-col px-4 py-3 overflow-visible">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: PLUM, opacity: 0.6 }}>Project sub details</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: PLUM, opacity: 0.5 }}>{segments.length} onderdelen</p>
      </div>

      <div className="flex-1 min-h-0 flex items-end gap-[3px] mt-1">
        {segments.map((s, i) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : (s.weight / total) * 100;
          if (w <= 0) return <div key={s.id} style={{ width: 0 }} />;
          const lineH = LINE_H[i % LINE_H.length];
          return (
            <div key={s.id} className="relative flex flex-col items-start justify-end min-w-0" style={{ width: `${w}%` }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] leading-tight whitespace-nowrap" style={{ color: PLUM }}>{s.name.split(" ")[0]} {Math.round((s.weight / total) * 100)}%</p>
              <div className="w-px mt-[6px]" style={{ height: `${lineH}px`, background: PLUM }} />
            </div>
          );
        })}
      </div>

      <div className="flex items-stretch w-full h-[clamp(22px,2.6vw,34px)] gap-[3px]">
        {segments.length === 0 && <p className="text-[10px] self-center" style={{ color: PLUM, opacity: 0.4 }}>Geen onderdelen.</p>}
        {segments.map((s) => {
          const w = hovered ? (hovered === s.id ? 100 : 0) : (s.weight / total) * 100;
          return (
            <motion.div key={s.id} className="relative h-full overflow-hidden rounded-full" style={{ background: s.color }} animate={{ width: `${w}%` }} transition={{ duration: 0.4, ease: EASE }} onMouseEnter={() => hoverIn(s.id)} onMouseLeave={hoverOut}>
              {w > 18 && !hovered && <span className="absolute inset-0 flex items-center px-2 text-[8px] font-mono whitespace-nowrap" style={{ color: textOn(s.color) }}>{Math.round((s.weight / total) * 100)}%</span>}
              <AnimatePresence>
                {hovered === s.id && (
                  <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="absolute inset-0 flex items-stretch">
                    {s.items.map((label, idx) => {
                      const segPct = 100 / s.items.length;
                      return (
                        <div key={idx} className="h-full flex items-center justify-center min-w-0" style={{ width: `${segPct}%`, background: s.color, borderLeft: idx > 0 ? "1px solid rgba(255,255,255,0.28)" : "none" }}>
                          {segPct > 8 && <span className="text-[8px] font-mono truncate px-1 whitespace-nowrap" style={{ color: textOn(s.color) }}>{label}</span>}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}