import React from "react";
import { motion } from "framer-motion";
import { accentFor, fmtDate } from "@/lib/adminUtils";

/** AdminTimeline — heldere deadline-nabijheidstijdlijn. Elke aanstaande
 *  verplichting: "dagen tot deadline", titel, bedrag en een proximity-bar die
 *  vult naarmate de deadline nadert (geanimeerd, staggered). life-blue →
 *  life-sand (dichtbij) → urgent #d5e24a (te laat). Leest in één oogopslag. */
export default function AdminTimeline({ events = [], max, tone = "light", onSelect }) {
  const dark = tone === "dark";
  const list = max ? events.slice(0, max) : events;
  if (!list.length) return <p className={`text-sm italic ${dark ? "text-ivory/50" : "text-muted-foreground"}`}>Niets op komst.</p>;
  const trackBg = dark ? "rgba(255,255,255,0.10)" : "hsl(var(--foreground)/0.08)";
  const txt = dark ? "text-ivory" : "text-foreground";
  const sub = dark ? "text-ivory/55" : "text-muted-foreground";

  return (
    <div className="space-y-3.5">
      {list.map((e, i) => {
        const c = accentFor(e.status);
        const fill = Math.round((1 - e.norm) * 100);
        const overdue = e.days < 0;
        return (
          <button key={e.id || i} onClick={() => onSelect && onSelect(e)} className="w-full text-left group">
            <div className="flex items-center gap-3">
              <div className="w-11 shrink-0 text-right">
                <p className="text-2xl font-display font-semibold tabular-nums leading-none" style={{ color: c }}>{overdue ? Math.abs(e.days) : e.days === 0 ? "·" : e.days}</p>
                <p className={`text-[8px] uppercase tracking-wide mt-0.5 font-semibold ${sub}`}>{overdue ? "te laat" : "dagen"}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold truncate ${txt}`}>{e.title}</p>
                  {Number(e.amount) > 0 && <span className="text-sm font-display font-semibold tabular-nums shrink-0" style={{ color: c }}>€{e.amount}</span>}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: trackBg }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${fill}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ background: c, boxShadow: overdue ? `0 0 10px ${c}` : "none" }} />
                </div>
                <p className={`text-[9px] uppercase tracking-wide mt-1 font-semibold ${sub}`}>{fmtDate(e.due_date)}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}