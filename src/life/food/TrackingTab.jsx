import React, { useMemo } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { MEAL_LABELS, DAY_FULL, mealsForWeek, weekDays, fmtEuro } from "@/lib/foodUtils";
import { MealTypeIcon } from "./foodVisuals";
import { RatingsChart } from "./foodCharts";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { Check, X } from "lucide-react";

const RATINGS = [
  { key: "slecht", label: "Slecht", color: "hsl(var(--destructive))" },
  { key: "gewoon", label: "Gewoon", color: "hsl(var(--steel))" },
  { key: "goed", label: "Goed", color: SAND_DEEP },
  { key: "super", label: "Super", color: SAND },
];

/** TAB 3 — TRACKING. Per maaltijd: MADE/NOT MADE + beoordeling. Een Recharts
 *  verdeling toont wat Giulia leert. */
export default function TrackingTab({ week, meals, reload }) {
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);
  if (!week) return <GlassPanel level={1} className="p-10 text-center text-muted-foreground">Plan eerst een week.</GlassPanel>;

  const days = weekDays(week);
  const counts = weekMeals.reduce((acc, m) => { if (m.rating) acc[m.rating] = (acc[m.rating] || 0) + 1; return acc; }, {});
  const rated = weekMeals.filter((m) => m.rating).length;

  const setStatus = async (m, status) => { try { await base44.entities.Meal.update(m.id, { status }); reload(); } catch { /* ignore */ } };
  const setRating = async (m, rating) => {
    try {
      await base44.entities.Meal.update(m.id, { rating });
      if (m.recipe_id) { try { await base44.entities.Recipe.update(m.recipe_id, { rating }); } catch { /* ignore */ } }
      reload();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <GlassPanel level={2} className="p-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Tracking</p>
            <p className="text-[40px] leading-[0.9] font-display font-semibold tracking-[-0.03em] tabular-nums mt-1" style={{ color: PLUM }}>{rated}</p>
            <p className="text-sm text-muted-foreground mt-1">beoordelingen deze week — Giulia leert ervan.</p>
          </div>
          {rated > 0 && (
            <div className="w-full max-w-[280px]">
              <RatingsChart counts={counts} height={130} tickColor="hsl(var(--muted-foreground))" />
            </div>
          )}
        </div>
      </GlassPanel>

      {days.map((d) => {
        const dayMeals = weekMeals.filter((m) => m.date === d.date);
        if (!dayMeals.length) return null;
        return (
          <div key={d.date} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{DAY_FULL[d.dayKey]} · {new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</h4>
            <div className="space-y-2">
              {dayMeals.map((m) => {
                const made = m.status === "eaten";
                const notMade = m.status === "skipped";
                return (
                  <GlassPanel key={m.id} level={1} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--life-sand) / 0.2)" }}><MealTypeIcon type={m.meal_type} className="h-4 w-4 text-foreground" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold leading-tight truncate">{m.recipe_name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{MEAL_LABELS[m.meal_type]} · {fmtEuro(m.cost)}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setStatus(m, made ? "planned" : "eaten")} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition", made ? "text-ivory" : "bg-muted text-muted-foreground hover:text-foreground")} style={made ? { background: SAND } : {}} title="Made"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setStatus(m, notMade ? "planned" : "skipped")} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition", notMade ? "bg-destructive text-ivory" : "bg-muted text-muted-foreground hover:text-foreground")} title="Not made"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {made && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">Hoe was het?</p>
                        <div className="flex gap-2">
                          {RATINGS.map((r) => (
                            <button key={r.key} onClick={() => setRating(m, r.key)} className={cn("flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition border", m.rating === r.key ? "text-ivory border-transparent" : "bg-background border-border text-muted-foreground hover:text-foreground")} style={m.rating === r.key ? { background: r.color } : undefined}>{r.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </GlassPanel>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}