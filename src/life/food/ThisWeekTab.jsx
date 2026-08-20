import React, { useMemo, useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { useEntityList } from "@/hooks/useEntity";
import { MEAL_ORDER, DAY_LABELS, mealsForWeek, weekDays, fmtEuro, localTodayStr } from "@/lib/foodUtils";
import { BudgetDonut } from "./foodCharts";
import { DayDots } from "./foodVisuals";
import MealCard from "./MealCard";
import FoodProfileCard from "./FoodProfileCard";
import WeekTimelineGrid from "./WeekTimelineGrid";
import RecipeView from "@/life/components/RecipeView";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";
import { Utensils, CalendarDays, Wallet, Zap, Layers, Tag } from "lucide-react";

/** TAB 1 — DEZE WEEK. Cohesief weekoverzicht: profiel, status-hero en een
 *  7-koloms tijdlijn-grid met vandaag gehighlight en dagtotalen. */
export default function ThisWeekTab({ week, meals, reload }) {
  const { data: profiles } = useEntityList("FoodProfile", { realtime: true });
  const profile = profiles[0];
  const [selected, setSelected] = useState(null);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);

  if (!week) {
    return (
      <GlassPanel level={1} className="p-10 text-center">
        <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nog geen week actief. Ga naar de <b>Giulia</b>-tab om een nieuwe week te plannen.</p>
      </GlassPanel>
    );
  }

  const days = weekDays(week);
  const todayStr = localTodayStr();
  const made = weekMeals.filter((m) => m.status === "eaten").length;
  const daysPlanned = new Set(weekMeals.map((m) => m.date)).size;
  const range = `${new Date(week.date_start + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${new Date(week.date_end + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`;

  return (
    <div className="space-y-4">
      <FoodProfileCard profile={profile} />

      {/* Status-hero */}
      <GlassPanel level={2} className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold">Week {week.week_number} · {range}</p>
            </div>
            <div className="flex items-end gap-3 mt-1.5">
              <p className="text-[64px] leading-[0.8] font-display font-semibold tracking-[-0.04em] tabular-nums" style={{ color: PLUM }}>
                {made}<span className="text-muted-foreground/40">/{week.meals_count || 28}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-2">gegeten</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
              <Wallet className="h-3.5 w-3.5" />
              <span className="tabular-nums">{fmtEuro(week.total_cost)} / {fmtEuro(week.budget)}</span>
              <span className="opacity-40">·</span>
              <span>{daysPlanned}/7 dagen gepland</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Pill icon={Zap} label="quick" value={week.quick_meals} color={SAND_DEEP} />
              <Pill icon={Layers} label="batch" value={week.batch_meals} color={PLUM} />
              <Pill icon={Tag} label="aanbieding" value={week.promotions_count} color={SAND_DEEP} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <BudgetDonut cost={week.total_cost} budget={week.budget} size={148} thickness={18} accent={PLUM} />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">budget verbruikt</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-foreground/8">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Voortgang door de week</p>
          <DayDots week={week} weekMeals={weekMeals} todayStr={todayStr} />
        </div>
      </GlassPanel>

      {/* Week tijdlijn — cohesief 7-koloms grid */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">Week tijdlijn</p>
          <p className="text-xs text-muted-foreground">Scroll → voor meer dagen</p>
        </div>
        <WeekTimelineGrid days={days} weekMeals={weekMeals} todayStr={todayStr} onSelect={setSelected} />
      </div>

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reload(); }} />}
    </div>
  );
}

function Pill({ icon: Icon, label, value, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: `${color}22`, color }}>
      <Icon className="h-3 w-3" /> {value} {label}
    </span>
  );
}