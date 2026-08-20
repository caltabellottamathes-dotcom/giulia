import React from "react";
import { cn } from "@/lib/utils";
import { MEAL_ORDER, DAY_FULL, fmtEuro } from "@/lib/foodUtils";
import MealCard from "./MealCard";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";

/** WeekTimelineGrid — 7 dagkolommen naast elkaar (horizontal scrol op mobile).
 *  Eén cohesief overzicht van de hele week: vandaag gehighlight, maaltijden
 *  gestapeld per kolom, dagtotaal onderaan. */
export default function WeekTimelineGrid({ days, weekMeals, todayStr, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
      {days.map((d) => {
        const dayMeals = MEAL_ORDER.map((mt) => weekMeals.find((m) => m.date === d.date && m.meal_type === mt)).filter(Boolean);
        const isToday = d.date === todayStr;
        const dayCost = dayMeals.reduce((s, m) => s + (m.cost || 0), 0);
        const dateObj = new Date(d.date + "T00:00:00");
        return (
          <div
            key={d.date}
            className={cn(
              "snap-start shrink-0 w-[190px] rounded-2xl p-3 flex flex-col transition",
              isToday ? "border-2" : "border border-border bg-card/40"
            )}
            style={isToday ? { borderColor: SAND, background: "hsl(var(--life-sand) / 0.16)" } : undefined}
          >
            {/* Dag-header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: isToday ? SAND_DEEP : undefined, opacity: isToday ? 1 : 0.6 }}>
                  {DAY_FULL[d.dayKey]?.slice(0, 3)}
                </p>
                <p className="font-display font-semibold text-lg leading-tight capitalize">{DAY_FULL[d.dayKey]}</p>
                <p className="text-xs text-muted-foreground">{dateObj.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>
              </div>
              {isToday && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-charcoal" style={{ background: SAND }}>Vandaag</span>
              )}
            </div>

            {/* Maaltijden gestapeld */}
            <div className="flex flex-col gap-2 flex-1">
              {dayMeals.length ? (
                MEAL_ORDER.map((mt) => {
                  const m = weekMeals.find((mm) => mm.date === d.date && mm.meal_type === mt);
                  return m ? <MealCard key={mt} meal={m} tone="light" compact onClick={() => onSelect?.(m)} /> : null;
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground/50 flex-1 flex items-center justify-center min-h-[120px]">
                  Niet gepland
                </div>
              )}
            </div>

            {/* Dagtotaal */}
            {dayMeals.length > 0 && (
              <div className="mt-3 pt-2 border-t border-foreground/8 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">dagtotaal</span>
                <span className="text-sm font-display font-semibold tabular-nums" style={{ color: PLUM }}>{fmtEuro(dayCost)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}