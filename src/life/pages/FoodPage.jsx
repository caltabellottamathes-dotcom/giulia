import React, { useMemo, useState } from "react";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import {
  MEAL_LABELS, MEAL_ORDER, DAY_LABELS, currentWeek, mealsForWeek, fmtEuro,
} from "@/lib/foodUtils";
import RecipeView from "@/life/components/RecipeView";
import { Loader2, Sparkles, Utensils } from "lucide-react";

/**
 * FoodPage — /life/food · de volledige Food-omgeving (Overview).
 * THIS WEEK met PLAN NEW WEEK, budgetbalk, en de 7-daagse weekvisualisatie.
 * Elke maaltijd opent het recept.
 */
export default function FoodPage() {
  const learnTick = useLearningSync();
  const { data: weeks, reload: reloadWeeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals, reload: reloadMeals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });
  const [selected, setSelected] = useState(null);
  const [planning, setPlanning] = useState(false);

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

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

  const budgetPct = week ? Math.min(100, Math.round((week.total_cost / (week.budget || 1)) * 100)) : 0;
  const over = week && week.total_cost > week.budget;

  const days = week
    ? Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(week.date_start + "T00:00:00");
        d.setDate(d.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        const dayKey = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][i];
        return { dayKey, date: ds, meals: weekMeals.filter((m) => m.date === ds) };
      })
    : [];

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="life"
        image={IMAGES.lifeFood}
        icon={Utensils}
        eyebrow="LIFE · FOOD"
        title="Smart Food Planner"
        subtitle="Wat eet je deze week — binnen budget, op basis van wat je hebt en wat je lekker vindt"
      />

      {/* THIS WEEK */}
      <GlassPanel level={2} className="p-7">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">This week</p>
            {week ? (
              <>
                <div className="flex items-end gap-3 mt-2">
                  <span className="text-4xl font-display font-semibold tabular-nums">{fmtEuro(week.total_cost)}</span>
                  <span className="text-muted-foreground mb-1">/ {fmtEuro(week.budget)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-3 max-w-xs">
                  <div className={over ? "bg-destructive h-full" : "bg-olive h-full"} style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-muted-foreground">
                  <span><b className="text-foreground">{week.meals_count}</b> maaltijden</span>
                  <span><b className="text-foreground">{week.quick_meals}</b> quick</span>
                  {week.promotions_count ? <span><b className="text-foreground">{week.promotions_count}</b> aanbiedingen</span> : null}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mt-2">Nog geen week gepland.</p>
            )}
          </div>
          <button
            onClick={planWeek}
            disabled={planning}
            className="rounded-full px-6 py-3 text-sm font-bold bg-charcoal text-ivory inline-flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {planning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {planning ? "Giulia plant…" : "Plan new week"}
          </button>
        </div>
      </GlassPanel>

      {/* WEEK VISUALIZATION */}
      {week ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {days.map((d) => (
            <GlassPanel key={d.dayKey} level={1} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/60">{DAY_LABELS[d.dayKey]}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(d.date + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="space-y-2.5">
                {MEAL_ORDER.map((mt) => {
                  const m = d.meals.find((x) => x.meal_type === mt);
                  if (!m) return <div key={mt} className="text-xs text-muted-foreground/60 italic">{MEAL_LABELS[mt]} —</div>;
                  return (
                    <button key={mt} onClick={() => setSelected(m)} className="w-full text-left group">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {MEAL_LABELS[mt]}{m.time ? ` · ${m.time}` : ""}
                      </p>
                      <p className="text-sm font-display font-semibold text-foreground group-hover:text-olive transition-colors leading-tight">
                        {m.recipe_name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <GlassPanel level={1} className="p-10 text-center">
          <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Druk op <b>Plan new week</b> en Giulia stelt je week samen.</p>
        </GlassPanel>
      )}

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