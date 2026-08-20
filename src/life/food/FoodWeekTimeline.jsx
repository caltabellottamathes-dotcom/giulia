import React, { useState } from "react";
import { motion } from "framer-motion";
import { MEAL_ORDER, DAY_FULL, DAY_LABELS, MEAL_LABELS, fmtEuro } from "@/lib/foodUtils";
import { SAND } from "./lifeColors";
import { Coffee, Sandwich, Apple, Soup } from "lucide-react";

const MEAL_ICON = { breakfast: Coffee, lunch: Sandwich, snack: Apple, dinner: Soup };

/** FoodWeekTimeline — dark-glas paneel met een interactieve horizontale
 *  week-tijdlijn (vloeiende voortgangsbalk + pulserende vandaag-mijlpaal) en
 *  daaronder de geselecteerde dag als verticale maaltijd-stappenlijn. */
export default function FoodWeekTimeline({ days, weekMeals, todayStr, onSelect }) {
  const todayIdx = Math.max(0, days.findIndex((d) => d.date === todayStr));
  const [active, setActive] = useState(todayIdx);
  const day = days[active];
  const dayMeals = MEAL_ORDER.map((mt) => weekMeals.find((m) => m.date === day.date && m.meal_type === mt));
  const isToday = day.date === todayStr;
  const dayCost = dayMeals.filter(Boolean).reduce((s, m) => s + (m.cost || 0), 0);
  const items = days.map((d) => ({ label: (DAY_LABELS[d.dayKey] || "").toUpperCase(), date: d.date, milestone: weekMeals.some((m) => m.date === d.date) }));

  const pct = items.length > 1 ? (active / (items.length - 1)) * 100 : 0;
  const lastFilled = dayMeals.map(Boolean).lastIndexOf(true);
  const fillPct = dayMeals.length > 1 && lastFilled >= 0 ? (lastFilled / (dayMeals.length - 1)) * 100 : lastFilled >= 0 ? 100 : 0;

  return (
    <div className="rounded-[28px] p-6" style={{ background: "rgba(38,40,44,0.94)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", color: "rgba(255,255,255,0.95)" }}>
      {/* header */}
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-55">Week tijdlijn</p>
          <motion.h3 key={`h-${day.date}`} className="text-[28px] font-display font-semibold leading-tight capitalize mt-0.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>{DAY_FULL[day.dayKey]}</motion.h3>
          <p className="text-xs opacity-55 mt-0.5">{new Date(day.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          {isToday && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: SAND, color: "hsl(var(--charcoal))" }}>Vandaag</span>}
          <span className="text-[11px] tabular-nums font-semibold opacity-70" style={{ color: SAND }}>{active + 1}/{items.length}</span>
        </div>
      </div>

      {/* horizontal day timeline */}
      <div className="relative pt-1 pb-5">
        <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }}>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: SAND }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
          <motion.div className="absolute inset-y-0 rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", width: "30%" }} animate={{ left: ["-30%", "100%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ padding: "0 2px" }}>
          {items.map((it, i) => {
            const itToday = it.date === todayStr;
            return (
              <button key={i} type="button" onClick={() => setActive(i)} className="relative -m-1 p-1 flex flex-col items-center" aria-label={it.label}>
                <motion.span className="block rounded-full" style={{ background: i <= active ? SAND : "rgba(255,255,255,0.4)", width: i === active ? 14 : 9, height: i === active ? 14 : 9 }} animate={{ scale: i === active ? 1 : 0.9 }} transition={{ type: "spring", stiffness: 300 }} />
                {itToday && <motion.span className="absolute rounded-full" style={{ border: `1px solid ${SAND}`, width: 18, height: 18, top: -2 }} animate={{ scale: [1, 2.1], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity }} />}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-[9px] uppercase tracking-wider font-semibold">
          {items.map((it, i) => <span key={i} className="text-center" style={{ opacity: i === active ? 1 : it.milestone ? 0.6 : 0.3, color: i === active ? SAND : undefined, width: 44 }}>{it.label}</span>)}
        </div>
      </div>

      {/* vertical meal steps */}
      <div className="relative flex flex-col pl-1 mt-2">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.16)" }} />
        <motion.div className="absolute left-[7px] top-2 w-0.5 rounded-full" style={{ background: SAND }} animate={{ height: `${fillPct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
        {dayMeals.map((m, i) => {
          const mt = MEAL_ORDER[i];
          const Icon = MEAL_ICON[mt];
          if (!m) {
            return (
              <div key={mt} className="relative flex items-center gap-3 py-2.5 opacity-40">
                <span className="relative z-10 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.18)", width: 14, height: 14 }} />
                <span className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}><Icon className="h-3.5 w-3.5 opacity-60" /></span>
                <p className="text-[13px] font-medium">{MEAL_LABELS[mt]}</p>
                <span className="text-[10px] opacity-50 ml-auto uppercase tracking-wider">vrij</span>
              </div>
            );
          }
          return (
            <button key={mt} type="button" onClick={() => onSelect?.(m)} className="relative flex items-center gap-3 py-2.5 text-left group">
              <motion.span className="relative z-10 rounded-full shrink-0" style={{ background: SAND, width: 14, height: 14 }} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }} />
              <span className="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}><Icon className="h-3.5 w-3.5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-55 font-semibold">{MEAL_LABELS[mt]}{m.time ? ` · ${m.time}` : ""}</p>
                <p className="text-[15px] font-display font-semibold leading-tight truncate group-hover:opacity-80 transition">{m.recipe_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] tabular-nums font-semibold" style={{ color: SAND }}>{fmtEuro(m.cost)}</p>
                {m.total_time ? <p className="text-[9px] uppercase opacity-50">{m.total_time} min</p> : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* day total */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider opacity-55">dagtotaal</span>
        <span className="text-lg font-display font-semibold tabular-nums" style={{ color: SAND }}>{fmtEuro(dayCost)}</span>
      </div>
    </div>
  );
}