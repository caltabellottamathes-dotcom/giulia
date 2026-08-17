import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import {
  MEAL_LABELS, MEAL_ORDER, currentWeek, mealsToday, timeToMin, fmtEuro,
} from "@/lib/foodUtils";
import { BudgetRing } from "@/life/food/foodVisuals";
import MealCard from "@/life/food/MealCard";
import RecipeView from "@/life/components/RecipeView";
import { Loader2, Sparkles } from "lucide-react";

/**
 * FoodPreview — grafisch FoodPanel. Boven: budgetring + weekstatus. Daaronder
 * de maaltijden van vandaag als grafische kaarten (actuele krijgt nadruk).
 * Zonder week → PLAN NEW WEEK.
 */
export default function FoodPreview() {
  const learnTick = useLearningSync();
  const { data: weeks, reload: reloadWeeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals, reload: reloadMeals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });
  const [selected, setSelected] = useState(null);
  const [planning, setPlanning] = useState(false);

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const today = useMemo(() => mealsToday(meals, week?.id), [meals, week]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const planWeek = async () => {
    setPlanning(true);
    try { await base44.functions.invoke("planFoodWeek", {}); reloadWeeks(); reloadMeals(); } catch { /* ignore */ } finally { setPlanning(false); }
  };

  if (planning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ivory/70">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Giulia plant je week…</p>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="space-y-5 text-ivory">
        <Header />
        <div className="glass-card-2 rounded-2xl p-7 text-center">
          <p className="text-sm text-ivory/60 italic mb-5">Nog geen week gepland. Laat Giulia een complete week voor je maken.</p>
          <button onClick={planWeek} className="rounded-full px-5 py-2.5 text-sm font-bold bg-ivory text-charcoal inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform"><Sparkles className="h-4 w-4" /> Plan new week</button>
        </div>
      </div>
    );
  }

  const byType = {};
  today.forEach((m) => { byType[m.meal_type] = m; });

  return (
    <div className="space-y-5 text-ivory">
      <Header week={week} />

      {/* Weekstatus — grafisch */}
      <div className="glass-card-2 rounded-2xl p-5 flex items-center gap-5">
        <BudgetRing cost={week.total_cost} budget={week.budget} size={104} />
        <div className="grid grid-cols-3 gap-3 flex-1">
          <div><p className="text-xl font-display font-semibold tabular-nums">{week.meals_count}</p><p className="text-[9px] uppercase tracking-wider text-ivory/50">maaltijden</p></div>
          <div><p className="text-xl font-display font-semibold tabular-nums">{week.quick_meals}</p><p className="text-[9px] uppercase tracking-wider text-ivory/50">quick</p></div>
          <div><p className="text-xl font-display font-semibold tabular-nums">{week.promotions_count}</p><p className="text-[9px] uppercase tracking-wider text-ivory/50">aanbiedingen</p></div>
        </div>
      </div>

      {/* Vandaag */}
      <div className="space-y-2.5">
        {MEAL_ORDER.map((mt) => {
          const m = byType[mt];
          if (!m) return <MealCard key={mt} tone="dark" empty />;
          const active = Math.abs(timeToMin(m.time) - nowMin) <= 60;
          return <MealCard key={mt} meal={m} active={active} onClick={() => setSelected(m)} />;
        })}
      </div>

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reloadMeals(); }} />}
    </div>
  );
}

function Header({ week }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Today</p>
      <h2 className="text-2xl font-display font-semibold tracking-tight mt-1 capitalize">{dateLabel}</h2>
      {week && <p className="text-xs text-ivory/55 mt-1.5">Week {week.week_number} · {fmtEuro(week.total_cost)} / {fmtEuro(week.budget)}</p>}
    </div>
  );
}