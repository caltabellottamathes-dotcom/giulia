import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import {
  currentWeek, mealsForWeek, mealState, MEAL_LABELS, fmtEuro,
} from "@/lib/foodUtils";
import { BudgetRing, DayDots, Stat } from "@/life/food/foodVisuals";

/**
 * FoodWidget — grote grafische widget. Live-geanimeerde budgetring, dag-dots
 * en de actuele/volgende maaltijd. States: MEAL NOW / NEXT / RUNNING LOW / NO PLAN.
 */
export default function FoodWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const open = () => openModule("food");

  // NO PLAN
  if (!week) {
    return (
      <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[280px]">
        <div className="flex flex-col h-full p-6">
          <WidgetHeader label="Food" />
          <div className="flex-1 flex flex-col justify-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold">No meal planned</motion.p>
            <h3 className="text-[30px] leading-[1.0] font-display font-semibold tracking-[-0.02em] mt-2">Plan je week</h3>
            <p className="text-xs opacity-50 mt-2 max-w-[30ch]">Laat Giulia een complete eetweek voor je maken binnen budget.</p>
            <button onClick={(e) => { e.stopPropagation(); open(); }} className="mt-5 self-start rounded-full px-5 py-2.5 text-sm font-bold bg-ivory text-charcoal hover:scale-[1.02] transition-transform">Plan new week</button>
          </div>
        </div>
      </WidgetShell>
    );
  }

  const m = st.meal;
  const now = st.state === "MEAL_NOW";
  const daysPlanned = new Set(weekMeals.map((x) => x.date)).size;
  const made = weekMeals.filter((x) => x.status === "eaten").length;

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[280px]">
      <div className="flex flex-col h-full p-6">
        <WidgetHeader label="Food" count={`week ${week.week_number}`} />

        <div className="flex-1 grid grid-cols-[auto_1fr] gap-5 items-center mt-1">
          <BudgetRing cost={week.total_cost} budget={week.budget} size={128} />
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-3 gap-3">
              <Stat value={`${daysPlanned}/7`} label="dagen" />
              <Stat value={week.meals_count} label="maaltijden" />
              <Stat value={made} label="gegeten" accent="hsl(var(--olive))" />
            </div>
            <DayDots week={week} weekMeals={weekMeals} />
          </div>
        </div>

        {/* Actuele / volgende maaltijd */}
        <div className="mt-5 pt-4 border-t border-current/10">
          {m ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <motion.span className="h-2 w-2 rounded-full bg-olive" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  <p className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold">{now ? "Now" : "Next"} · {MEAL_LABELS[m.meal_type] || m.meal_type}{m.time ? ` ${m.time}` : ""}</p>
                </div>
                <h3 className="text-xl font-display font-semibold tracking-tight truncate mt-1">{m.recipe_name}</h3>
                <p className="text-[11px] opacity-50 mt-0.5">{m.total_time ? `${m.total_time} min · ` : ""}{fmtEuro(m.cost)}</p>
              </div>
              {now && <button onClick={(e) => { e.stopPropagation(); open(); }} className="shrink-0 rounded-full px-4 py-2 text-xs font-bold bg-ivory text-charcoal">Cook</button>}
            </div>
          ) : (
            <p className="text-sm opacity-50 italic">Geen maaltijd meer vandaag — bekijk de week.</p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}