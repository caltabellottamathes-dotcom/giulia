import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import {
  MEAL_LABELS, MEAL_ORDER, currentWeek, mealsToday, timeToMin, fmtEuro,
} from "@/lib/foodUtils";
import RecipeView from "@/life/components/RecipeView";
import { Loader2, Sparkles } from "lucide-react";

/**
 * FoodPreview — het FoodPanel (LEVEL 02). Toont het menu van vandaag; elke
 * maaltijd opent het recept. De actuele of eerstvolgende maaltijd krijgt
 * nadruk. Zonder week → PLAN NEW WEEK.
 */
export default function FoodPreview() {
  const learnTick = useLearningSync();
  const { data: weeks, reload: reloadWeeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals, reload: reloadMeals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });
  const [selected, setSelected] = useState(null);
  const [planning, setPlanning] = useState(false);

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const today = useMemo(() => mealsToday(meals, week?.id), [meals, week]);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dateLabel = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  const planWeek = async () => {
    setPlanning(true);
    try {
      await base44.functions.invoke("planFoodWeek", {});
      reloadWeeks();
      reloadMeals();
    } catch { /* ignore */ } finally {
      setPlanning(false);
    }
  };

  if (planning) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ivory/70">
        <Loader2 className="h-7 w-7 animate-spin mb-3" />
        <p className="text-sm">Giulia plant je week…</p>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="space-y-5 text-ivory">
        <Header dateLabel={dateLabel} />
        <div className="glass-card-2 rounded-2xl p-6 text-center">
          <p className="text-sm text-ivory/60 italic mb-4">Nog geen week gepland. Laat Giulia een complete week voor je maken.</p>
          <button onClick={planWeek} className="rounded-full px-5 py-2.5 text-sm font-bold bg-ivory text-charcoal inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform">
            <Sparkles className="h-4 w-4" /> Plan new week
          </button>
        </div>
      </div>
    );
  }

  const byType = {};
  today.forEach((m) => { byType[m.meal_type] = m; });

  return (
    <div className="space-y-5 text-ivory">
      <Header dateLabel={dateLabel} week={week} />

      <div className="space-y-2.5">
        {MEAL_ORDER.map((mt) => {
          const m = byType[mt];
          if (!m) {
            return (
              <div key={mt} className="glass-card-2 rounded-2xl p-4 opacity-60">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold">{MEAL_LABELS[mt]}</p>
                <p className="text-sm text-ivory/50 italic mt-1">Niet gepland</p>
              </div>
            );
          }
          const active = Math.abs(timeToMin(m.time) - nowMin) <= 60;
          return (
            <button
              key={mt}
              onClick={() => setSelected(m)}
              className={`w-full text-left glass-card-2 rounded-2xl p-4 transition hover:bg-ivory/10 ${active ? "ring-1 ring-olive" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold">
                  {MEAL_LABELS[mt]}{m.time ? ` · ${m.time}` : ""}
                </p>
                {active && <span className="text-[10px] uppercase tracking-wider text-olive font-bold">Now</span>}
              </div>
              <p className="text-lg font-display font-semibold mt-1">{m.recipe_name}</p>
              <p className="text-xs text-ivory/55 mt-0.5">{m.total_time ? `${m.total_time} min · ` : ""}{fmtEuro(m.cost)}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <RecipeView
          meal={selected}
          onClose={() => setSelected(null)}
          onEaten={() => { setSelected(null); reloadMeals(); }}
        />
      )}
    </div>
  );
}

function Header({ dateLabel, week }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Today</p>
      <h2 className="text-2xl font-display font-semibold tracking-tight mt-1 capitalize">{dateLabel}</h2>
      {week && (
        <p className="text-xs text-ivory/55 mt-1.5">
          Week {week.week_number} · {fmtEuro(week.total_cost)} / {fmtEuro(week.budget)}
        </p>
      )}
    </div>
  );
}