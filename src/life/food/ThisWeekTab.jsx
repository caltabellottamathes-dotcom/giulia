import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { useEntityList } from "@/hooks/useEntity";
import { MEAL_LABELS, MEAL_ORDER, DAY_FULL, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import { BudgetRing, DayDots, Stat } from "./foodVisuals";
import MealCard from "./MealCard";
import FoodProfileCard from "./FoodProfileCard";
import RecipeView from "@/life/components/RecipeView";
import { Utensils } from "lucide-react";

/** TAB 1 — DEZE WEEK. Food Profile, week-status en alle maaltijden per dag. */
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

  return (
    <div className="space-y-5">
      <FoodProfileCard profile={profile} />

      {/* WEEK STATUS */}
      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-5">Week status</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <BudgetRing cost={week.total_cost} budget={week.budget} size={140} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 flex-1">
            <Stat value={`${daysPlanned}/7`} label="dagen gepland" />
            <Stat value={`${made}/${week.meals_count || 28}`} label="maaltijden gemaakt" />
            <Stat value={week.quick_meals} label="quick" accent="hsl(var(--olive))" />
            <Stat value={week.promotions_count} label="aanbiedingen" />
          </div>
        </div>
        <div className="mt-6"><DayDots week={week} weekMeals={weekMeals} /></div>
      </GlassPanel>

      {/* MAALTIJDEN */}
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Maaltijden</h3>
        {days.map((d) => {
          const dayMeals = MEAL_ORDER.map((mt) => weekMeals.find((m) => m.date === d.date && m.meal_type === mt));
          return (
            <div key={d.date}>
              <div className="flex items-baseline gap-3 mb-2.5">
                <h4 className="font-display font-semibold capitalize">{DAY_FULL[d.dayKey]}</h4>
                <span className="text-xs text-muted-foreground">{new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dayMeals.map((m, i) => (
                  <MealCard key={i} meal={m} tone="light" onClick={m ? () => setSelected(m) : undefined} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reload(); }} />}
    </div>
  );
}