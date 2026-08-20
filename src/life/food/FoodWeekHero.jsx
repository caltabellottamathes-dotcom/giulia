import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CountUp from "@/system/widgets/CountUp";
import { IMAGES } from "@/lib/images";
import { fmtEuro } from "@/lib/foodUtils";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";

const R = 52, C = 2 * Math.PI * R;

/** FoodWeekHero — full-bleed food-foto met donkere gradient, grote editorial
 *  "WEEK n" typografie en een zwevende dark-glas kaart: geanimeerde budget-ring,
 *  CountUp voor uitgave / maaltijden / gegeten / dagen. */
export default function FoodWeekHero({ week, weekMeals }) {
  const budget = week?.budget || 0;
  const spent = week?.total_cost || 0;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget && budget > 0;
  const meals = week?.meals_count || 0;
  const made = weekMeals.filter((m) => m.status === "eaten").length;
  const daysPlanned = new Set(weekMeals.map((m) => m.date)).size;

  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(pct), 300); return () => clearTimeout(t); }, [pct]);

  const range = `${new Date(week.date_start + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${new Date(week.date_end + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`;

  return (
    <div className="relative w-full overflow-hidden rounded-[28px] h-[400px] sm:h-[440px]">
      <motion.img
        src={IMAGES.lifeFood}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.14, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(38,40,44,0.82), rgba(38,40,44,0.26) 48%, transparent 82%)" }} />

      {/* editorial top */}
      <div className="absolute left-6 top-6 right-6" style={{ color: "rgba(255,255,255,0.96)", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
        <motion.p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>What's for Dinner?</motion.p>
        <motion.h2 className="text-[46px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-1" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}>WEEK {week.week_number}</motion.h2>
        <motion.p className="text-xs opacity-70 mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>{range}</motion.p>
      </div>

      {/* floating dark-glass card */}
      <div className="absolute left-4 right-4 bottom-4 rounded-[22px] p-5" style={{ background: "rgba(38,40,44,0.62)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.96)" }}>
        <div className="flex items-center gap-5">
          {/* budget ring */}
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full">
              <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" />
              <motion.circle cx="60" cy="60" r={R} fill="none" stroke={over ? "#e08a6a" : SAND} strokeWidth="7" strokeLinecap="round" transform="rotate(-90 60 60)" strokeDasharray={C} animate={{ strokeDashoffset: C - (val / 100) * C }} transition={{ duration: 1.4, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-display font-semibold tabular-nums leading-none">{Math.round(val)}<span className="text-base opacity-60">%</span></span>
              <span className="text-[9px] uppercase tracking-[0.18em] opacity-55 mt-1">budget</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-x-5 gap-y-3">
            <div>
              <span className="text-[26px] font-display font-semibold tabular-nums leading-none" style={{ color: SAND }}>{fmtEuro(spent)}</span>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 mt-1.5">van {fmtEuro(budget)}</p>
            </div>
            <div>
              <span className="text-[26px] font-display font-semibold tabular-nums leading-none"><CountUp value={meals} /></span>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 mt-1.5">maaltijden</p>
            </div>
            <div>
              <span className="text-[20px] font-display font-semibold tabular-nums leading-none" style={{ color: SAND }}><CountUp value={made} /></span>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 mt-1">gegeten</p>
            </div>
            <div>
              <span className="text-[20px] font-display font-semibold tabular-nums leading-none"><CountUp value={daysPlanned} /><span className="text-base opacity-50">/7</span></span>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 mt-1">dagen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}