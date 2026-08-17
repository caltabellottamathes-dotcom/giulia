import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { useEntityList } from "@/hooks/useEntity";
import { MEAL_ORDER, DAY_FULL, DAY_LABELS, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import { BudgetDonut, DailyCostChart } from "./foodCharts";
import MealCard from "./MealCard";
import FoodProfileCard from "./FoodProfileCard";
import RecipeView from "@/life/components/RecipeView";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { Utensils } from "lucide-react";

/** TAB 1 — DEZE WEEK. Food Profile, week-status (donut + dagkosten-grafiek),
 *  en alle maaltijden per dag. */
export default function ThisWeekTab({ week, meals, reload }) {
  const { data: profiles } = useEntityList("FoodProfile", { realtime: true });
  const profile = profiles[0];
  const [selected, setSelected] = useState(null);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

  if (!week) {
    return (
      <GlassPanel level={1} className="p-10 text-center">
        <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nog geen week actief. Ga naar de <b>Giulia</b>-tab om een nieuwe week te plannen.</p>
      </GlassPanel>
    );
  }

  const days = weekDays(week);
  const made = weekMeals.filter((m) => m.status === "eaten").length;
  const daysPlanned = new Set(weekMeals.map((m) => m.date)).size;
  const dailyData = days.map((d) => ({
    day: (DAY_LABELS[d.dayKey] || "").toUpperCase(),
    cost: Math.round(weekMeals.filter((m) => m.date === d.date).reduce((s, m) => s + (m.cost || 0), 0) * 100) / 100,
  }));
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="space-y-4">
      <FoodProfileCard profile={profile} />

      <GlassPanel level={2} className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Week status</p>
            <p className="text-[64px] leading-[0.8] font-display font-semibold tracking-[-0.04em] tabular-nums mt-1" style={{ color: PLUM }}>
              {made}<span className="text-muted-foreground/40">/{week.meals_count || 28}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{fmtEuro(week.total_cost)} / {fmtEuro(week.budget)} · {daysPlanned}/7 dagen gepland</p>
          </div>
          <BudgetDonut cost={week.total_cost} budget={week.budget} size={140} thickness={16} accent={PLUM} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-foreground/8 pt-5">
          <Stat label="dagen gepland" value={`${daysPlanned}/7`} color={PLUM} />
          <Stat label="quick" value={week.quick_meals} color={SAND_DEEP} />
          <Stat label="aanbiedingen" value={week.promotions_count} color={PLUM} />
          <Stat label="gegeten" value={made} color={SAND_DEEP} />
        </div>
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-2">Kost per dag</p>
          <DailyCostChart data={dailyData} height={130} accent={PLUM} baseColor="hsl(var(--foreground) / 0.22)" tickColor="hsl(var(--muted-foreground))" highlightIndex={todayIdx} />
        </div>
      </GlassPanel>

      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Maaltijden</p>
        {days.map((d) => {
          const dayMeals = MEAL_ORDER.map((mt) => weekMeals.find((m) => m.date === d.date && m.meal_type === mt));
          return (
            <div key={d.date}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <h4 className="font-display font-semibold capitalize">{DAY_FULL[d.dayKey]}</h4>
                <span className="text-xs text-muted-foreground">{new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dayMeals.map((m, i) => <MealCard key={i} meal={m} tone="light" onClick={m ? () => setSelected(m) : undefined} />)}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reload(); }} />}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className="text-2xl font-display font-semibold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold mt-1">{label}</p>
    </div>
  );
}