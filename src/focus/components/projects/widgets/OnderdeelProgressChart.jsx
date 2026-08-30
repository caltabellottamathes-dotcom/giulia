import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { buildBreakdown } from "@/lib/projectEngine";

const PLUM = "#301728";
const PISTACHIO = "#d8dab3";
const OLIVE = "#94925d";
const FOCUS_COLORS = [PISTACHIO, OLIVE, PLUM];
const EASE = [0.16, 1, 0.3, 1];

/** OnderdeelProgressChart — Focus-versie van WalletBarChartWidget. Capsule-
 *  bars per onderdeel (theme); hoogte = voortgang %. Rechts een Plum paneel met
 *  de legenda; tik een bar → detail met subonderdelen. */
export default function OnderdeelProgressChart({ tasks = [], themes = [] }) {
  const breakdown = useMemo(() => buildBreakdown(tasks, themes), [tasks, themes]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const items = breakdown.map((o, i) => ({ ...o, color: FOCUS_COLORS[i % FOCUS_COLORS.length], idx: i }));
  const selected = selectedIdx != null ? items[selectedIdx] : null;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden glass-2">
      {/* bars links */}
      <div className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10 overflow-visible">
        <p className="text-[9px] uppercase tracking-[0.2em] font-medium" style={{ color: PLUM, opacity: 0.6 }}>tap a bar → detail</p>
        <div className="flex-1 flex items-end gap-[clamp(3px,0.5vw,7px)] mt-7 min-h-0 overflow-visible">
          {items.length === 0 && <p className="text-[11px] self-center w-full text-center" style={{ color: PLUM, opacity: 0.4 }}>Geen onderdelen.</p>}
          {items.map((o) => {
            const solidH = Math.max(2, Math.min(100, o.pct));
            return (
              <button key={o.name} onClick={() => setSelectedIdx(o.idx)} className="relative flex-1 h-full hover:opacity-90 transition min-w-0 overflow-visible" title={o.name}>
                {solidH > 8 && (
                  <span className="absolute left-1/2 -translate-x-1/2 text-[8px] font-mono font-semibold whitespace-nowrap z-20" style={{ bottom: `calc(${solidH}% + 3px)`, color: PLUM }}>{o.pct}%</span>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: "82%", height: `${solidH}%`, background: o.color, boxShadow: "0 14px 28px -12px rgba(0,0,0,0.45)" }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Plum paneel rechts */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[14px]"
        initial={false}
        animate={{ left: selected ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ width: "50%", background: PLUM, boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.45)" }}
        onClick={selected ? (e) => { e.stopPropagation(); setSelectedIdx(null); } : undefined}
      >
        {selected ? (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected.color }} />
            <h3 className="text-[20px] leading-tight font-display font-semibold tracking-[-0.02em] mt-2">{selected.name}</h3>
            <p className="text-[11px] mt-1 opacity-70">{selected.done}/{selected.total} taken · {selected.pct}%</p>
            <div className="mt-3 space-y-1.5 overflow-y-auto no-scrollbar">
              {selected.subs.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[11px]">
                  <span className="truncate opacity-80">{s.name}</span>
                  <span className="font-mono opacity-70">{s.pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] mt-auto opacity-55">tap → back</p>
          </div>
        ) : (
          <div className="absolute inset-0 p-4 flex flex-col text-ivory">
            <p className="text-[9px] uppercase tracking-[0.22em] font-semibold opacity-75">Voortgang</p>
            <h3 className="text-[18px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">per onderdeel</h3>
            <div className="mt-auto space-y-1.5 max-h-[70%] overflow-hidden">
              {items.map((o) => (
                <div key={o.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: o.color }} />
                  <span className="text-[11px] font-medium truncate flex-1">{o.name}</span>
                  <span className="text-[10px] font-mono opacity-70">{o.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}