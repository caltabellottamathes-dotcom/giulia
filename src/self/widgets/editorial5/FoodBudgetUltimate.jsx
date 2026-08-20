import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { fmtEuro } from "./helpers";

const R = 38, C = 2 * Math.PI * R;

/** FoodBudgetUltimate — grote type "FOOD" + budget-gauge van echte FoodWeek
 *  (uitgave vs budget, rood bij overschrijding) + maaltijden-teller. · 3:4 */
export default function FoodBudgetUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("FoodWeek", { sort: "-date_start", limit: 1, externalTick: learnTick });
  const week = (data || [])[0];
  const budget = week?.budget || 0;
  const spent = week?.total_cost || 0;
  const pct = budget ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget && budget > 0;
  const meals = week?.meals_count || 0;
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(pct), 250); return () => clearTimeout(t); }, [pct]);
  const off = C - (val / 100) * C;

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("food")} className="min-h-0" style={{ aspectRatio: "3 / 4", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="What's for Dinner?" count={week ? week.status : "—"} />
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          {loading ? <div className="h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} /> : (
            <>
              <svg viewBox="0 0 100 100" className="h-full w-full max-w-[150px] max-h-[150px]">
                <circle cx="50" cy="50" r={R} fill="none" stroke={PLUM_FAINT} strokeWidth="6" />
                <motion.circle cx="50" cy="50" r={R} fill="none" stroke={over ? "hsl(var(--destructive))" : SAGE} strokeWidth="6" strokeLinecap="round" transform="rotate(-90 50 50)" strokeDasharray={C} animate={{ strokeDashoffset: off }} transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[24px] font-display font-semibold tabular-nums leading-none">{fmtEuro(spent)}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-0.5">van {fmtEuro(budget)}</span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-end justify-between">
          <motion.h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>FOOD</motion.h3>
          <div className="text-right">
            <CountUp value={meals} className="text-[22px] font-display font-semibold tabular-nums leading-none" />
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-55">maaltijden</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}