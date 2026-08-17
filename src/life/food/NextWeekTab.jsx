import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { MEAL_LABELS, MEAL_ORDER, DAY_FULL, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import MealCard from "./MealCard";
import RecipeView from "@/life/components/RecipeView";
import { CalendarClock } from "lucide-react";

/** TAB 4 — VOLGENDE WEEK. Voorlopige planning van de komende week, zodat
 *  boodschappen op tijd op het lijstje kunnen. Wordt DEZE WEEK zodra de
 *  week begint. */
export default function NextWeekTab({ week, meals }) {
  const [selected, setSelected] = useState(null);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

  if (!week) {
    return (
      <GlassPanel level={1} className="p-10 text-center">
        <CalendarClock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nog geen volgende week gepland. Ga naar de <b>Giulia</b>-tab om er een te maken.</p>
      </GlassPanel>
    );
  }

  const days = weekDays(week);

  return (
    <div className="space-y-5">
      <GlassPanel level={2} className="p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Next week</p>
          <h2 className="text-2xl font-display font-semibold mt-1">Week {week.week_number}</h2>
          <p className="text-xs text-muted-foreground mt-1">{new Date(week.date_start + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} t/m {new Date(week.date_end + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex gap-6">
          <div><p className="text-2xl font-display font-semibold tabular-nums">{fmtEuro(week.total_cost)}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">/ {fmtEuro(week.budget)}</p></div>
          <div><p className="text-2xl font-display font-semibold tabular-nums">{week.meals_count}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">maaltijden</p></div>
        </div>
      </GlassPanel>

      <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
        <CalendarClock className="h-3.5 w-3.5" /> Deze planning kan nog veranderen. Zodra de week begint, wordt dit automatisch DEZE WEEK.
      </div>

      <div className="space-y-4">
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

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}