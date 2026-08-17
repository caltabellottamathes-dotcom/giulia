import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { currentWeek, mealsForWeek, mealState, fmtEuro, DAY_LABELS } from "@/lib/foodUtils";
import { BudgetDonut } from "@/life/food/foodCharts";

/** FoodWidget — LIFE-banner-widget (span 2). Links status + groot tellend
 *  cijfer, rechts een geanimeerde budget-donut (Recharts), smalle BrandPhoto
 *  met de uitsplitsing. Live: CountUp (rAF) + pulserende now-dot. */
export default function FoodWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const open = () => openModule("food");

  if (!week) {
    return (
      <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-[0.82fr_1.18fr] flex-1 min-h-[150px]">
            <div className="p-5 flex flex-col">
              <WidgetHeader label="Food" />
              <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em] mt-1">PLAN JE WEEK</h3>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">Nog niets gepland</p>
              <div className="flex-1" />
              <button onClick={(e) => { e.stopPropagation(); open(); }} className="self-start rounded-full px-4 py-2 text-xs font-bold text-charcoal transition hover:scale-[1.02]" style={{ background: "var(--tile-accent)" }}>Plan new week</button>
            </div>
            <div className="p-5 border-l border-white/10 flex flex-col items-center justify-center">
              <BudgetDonut cost={0} budget={50} size={120} thickness={14} accent="var(--tile-accent)" track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
            </div>
          </div>
          <BrandPhoto src={IMAGES.lifeFood} className="h-12 w-full" overlay="bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent">
            <div className="absolute inset-0 flex items-center px-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/85 font-semibold">Tik om een eetweek te maken</p>
            </div>
          </BrandPhoto>
        </div>
      </WidgetShell>
    );
  }

  const made = weekMeals.filter((m) => m.status === "eaten").length;
  const daysPlanned = new Set(weekMeals.map((m) => m.date)).size;
  const headline = made >= week.meals_count ? "WEEK KLAAR" : daysPlanned >= 7 ? "WEEK GEPLAND" : "WEEK LOOPT";
  const sub = st.state === "MEAL_NOW" ? "Nu eten" : st.state === "NEXT_MEAL" ? "Eerstvolgende maaltijd" : `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)}`;

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-[0.82fr_1.18fr] flex-1 min-h-[150px]">
          <div className="p-5 flex flex-col">
            <WidgetHeader label="Food" count={`wk ${week.week_number}`} />
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">{headline}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[48px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: "var(--tile-accent)" }}>
                <CountUp value={week.meals_count} />
              </span>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1.5 leading-tight">maaltijden<br />deze week</p>
            </div>
          </div>
          <div className="p-5 border-l border-white/10 flex flex-col items-center justify-center">
            <BudgetDonut cost={week.total_cost} budget={week.budget} size={124} thickness={14} accent="var(--tile-accent)" track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-2">budget</p>
            {st.state === "MEAL_NOW" && (
              <motion.div className="absolute bottom-3 right-4 flex items-center gap-1.5" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tile-accent)" }} />
                <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--tile-accent)" }}>now</span>
              </motion.div>
            )}
          </div>
        </div>
        <BrandPhoto src={IMAGES.lifeFood} className="h-12 w-full" overlay="bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/85 font-semibold">{fmtEuro(week.total_cost)} / {fmtEuro(week.budget)} · {week.quick_meals} quick{week.promotions_count ? ` · ${week.promotions_count} aanbieding` : ""}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}