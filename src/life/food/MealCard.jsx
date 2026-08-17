import React from "react";
import { cn } from "@/lib/utils";
import { MEAL_LABELS, fmtEuro } from "@/lib/foodUtils";
import { MealTypeIcon } from "./foodVisuals";

/**
 * MealCard — grafische maaltijdkaart. Donker (glas, panel) of licht (pagina).
 * Toont meal-type icoon, type + tijd, naam, tijd/kosten/keuken, en een "Now"-badge.
 */
export default function MealCard({ meal, onClick, active, compact, tone = "dark", empty }) {
  if (!meal || empty) {
    return (
      <div className={cn(
        "rounded-2xl p-4 border border-dashed text-sm",
        tone === "dark" ? "border-ivory/15 text-ivory/30" : "border-border text-muted-foreground/50"
      )}>
        —
      </div>
    );
  }
  const sub = tone === "dark" ? "text-ivory/55" : "text-muted-foreground";
  const iconBg = tone === "dark" ? "bg-ivory/10" : "bg-muted";
  const card = tone === "dark" ? "glass-card-2 hover:bg-ivory/10" : "bg-card hover:bg-muted/60 border border-border";
  return (
    <button onClick={onClick} className={cn("w-full text-left rounded-2xl p-4 transition group", card, active && "ring-1 ring-olive")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", iconBg)}>
            <MealTypeIcon type={meal.meal_type} className={cn("h-4 w-4", sub)} />
          </span>
          <p className={cn("text-[10px] uppercase tracking-[0.18em] font-semibold truncate", sub)}>
            {MEAL_LABELS[meal.meal_type] || meal.meal_type}{meal.time ? ` · ${meal.time}` : ""}
          </p>
        </div>
        {active && <span className="text-[10px] uppercase tracking-wider text-olive font-bold shrink-0">Now</span>}
      </div>
      <p className={cn("font-display font-semibold mt-2 leading-tight", compact ? "text-base" : "text-lg")}>{meal.recipe_name}</p>
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs", sub)}>
        {meal.total_time ? <span>{meal.total_time} min</span> : null}
        {meal.cost ? <span>{fmtEuro(meal.cost)}</span> : null}
        {meal.cuisine ? <span className="capitalize">{meal.cuisine}</span> : null}
      </div>
    </button>
  );
}