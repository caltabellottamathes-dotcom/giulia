import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { MEAL_LABELS, MEAL_ORDER, DAY_LABELS, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import { MealTypeIcon } from "./foodVisuals";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import RecipeView from "@/life/components/RecipeView";

/** TAB 2 — PLANNING. Weekraster (dagen × maaltijden); klik op een gerecht
 *  opent het recept met verplaats/verwijder-acties. */
export default function PlanningTab({ week, meals, reload }) {
  const [selected, setSelected] = useState(null);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

  if (!week) return <GlassPanel level={1} className="p-10 text-center text-muted-foreground">Plan eerst een week in de Giulia-tab.</GlassPanel>;

  const days = weekDays(week);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="space-y-4">
      <GlassPanel level={2} className="p-6">
        <div className="flex items-end justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Weekplanning</p>
          <p className="text-sm font-display font-semibold tabular-nums" style={{ color: PLUM }}>{fmtEuro(week.total_cost)} / {fmtEuro(week.budget)}</p>
        </div>
        <p className="text-sm text-muted-foreground">Klik een gerecht aan om het recept te openen, te verplaatsen of te verwijderen.</p>
      </GlassPanel>

      <div className="overflow-x-auto">
        <div className="min-w-[640px] grid grid-cols-[84px_repeat(4,1fr)] gap-2">
          <div />
          {MEAL_ORDER.map((mt) => (
            <div key={mt} className="flex items-center gap-2 px-2 pb-1">
              <MealTypeIcon type={mt} className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">{MEAL_LABELS[mt]}</span>
            </div>
          ))}
          {days.map((d, di) => (
            <React.Fragment key={d.date}>
              <div className="flex flex-col justify-center px-1 py-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${di === todayIdx ? "" : "text-foreground/70"}`} style={di === todayIdx ? { color: PLUM } : undefined}>{DAY_LABELS[d.dayKey]}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
              </div>
              {MEAL_ORDER.map((mt) => {
                const m = weekMeals.find((x) => x.date === d.date && x.meal_type === mt);
                return (
                  <button key={mt} onClick={m ? () => setSelected(m) : undefined} className={`text-left rounded-xl p-2.5 border transition min-h-[56px] ${m ? "bg-card border-border hover:border-olive hover:bg-muted/60" : "border-dashed border-border/60"} ${di === todayIdx ? "ring-1 ring-life-blue-deep/20" : ""}`}>
                    {m ? (
                      <>
                        <p className="text-sm font-display font-semibold leading-tight">{m.recipe_name}</p>
                        <p className="text-[10px] mt-1" style={{ color: SAND_DEEP }}>{m.total_time ? `${m.total_time}m · ` : ""}{fmtEuro(m.cost)}</p>
                      </>
                    ) : <span className="text-muted-foreground/40">—</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {selected && (
        <RecipeView meal={selected} days={days} onClose={() => setSelected(null)} onDelete={() => { setSelected(null); reload(); }} onMove={() => { setSelected(null); reload(); }} onEaten={() => { setSelected(null); reload(); }} />
      )}
    </div>
  );
}