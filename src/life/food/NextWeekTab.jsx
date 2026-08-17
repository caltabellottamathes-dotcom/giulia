import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { MEAL_ORDER, DAY_FULL, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import MealCard from "./MealCard";
import RecipeView from "@/life/components/RecipeView";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { CalendarClock } from "lucide-react";

/** TAB 4 — VOLGENDE WEEK. Voorlopige planning; wordt DEZE WEEK bij start. */
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
      {/* Hero banner — LIFE-stijl */}
      <div className="relative rounded-3xl overflow-hidden h-40">
        <img src={IMAGES.lifeFood} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/80 font-semibold">Next week</p>
            <h2 className="text-[40px] font-display font-semibold tracking-tight text-ivory leading-none">WEEK {week.week_number}</h2>
            <p className="text-sm text-ivory/70 mt-1">{new Date(week.date_start + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} t/m {new Date(week.date_end + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}</p>
          </div>
        </div>
      </div>

      <GlassPanel level={2} className="p-6 flex flex-wrap gap-8">
        <div><p className="text-[40px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: PLUM }}>{fmtEuro(week.total_cost)}</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mt-1">/ {fmtEuro(week.budget)} budget</p></div>
        <div><p className="text-[40px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: SAND_DEEP }}>{week.meals_count}</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mt-1">maaltijden</p></div>
        <div><p className="text-[40px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: PLUM }}>{week.quick_meals}</p><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mt-1">quick</p></div>
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