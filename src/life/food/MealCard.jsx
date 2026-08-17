import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MEAL_LABELS, fmtEuro } from "@/lib/foodUtils";
import { MealTypeIcon } from "./foodVisuals";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";

/** MealCard — grafische maaltijdkaart in LIFE-stijl.
 *  tone="dark" (glas-paneel) of "light" (lichte pagina). */
export default function MealCard({ meal, onClick, active, compact, tone = "dark", empty }) {
  if (!meal || empty) {
    return (
      <div className={cn("rounded-2xl p-4 border border-dashed text-sm", tone === "dark" ? "border-ivory/15 text-ivory/30" : "border-border text-muted-foreground/50")}>—</div>
    );
  }
  const sub = tone === "dark" ? "text-ivory/55" : "text-muted-foreground";
  const iconBg = tone === "dark" ? "bg-ivory/10" : "bg-[hsl(var(--life-sand)/0.2)]";
  const iconColor = tone === "dark" ? "text-ivory/65" : "text-foreground";
  const card = tone === "dark" ? "glass-card-2 hover:bg-ivory/10" : "bg-card hover:bg-muted/60 border border-border";
  return (
    <button onClick={onClick} className={cn("w-full text-left rounded-2xl p-4 transition group relative", card, active && "ring-1 ring-olive")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", iconBg)}>
            <MealTypeIcon type={meal.meal_type} className={cn("h-4 w-4", iconColor)} />
          </span>
          <p className={cn("text-[10px] uppercase tracking-[0.18em] font-semibold truncate", sub)}>
            {MEAL_LABELS[meal.meal_type] || meal.meal_type}{meal.time ? ` · ${meal.time}` : ""}
          </p>
        </div>
        {active && (
          <motion.span className="h-2 w-2 rounded-full shrink-0" style={{ background: tone === "dark" ? SAND : PLUM }} animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
        )}
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