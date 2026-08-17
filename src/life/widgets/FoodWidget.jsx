import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { cn } from "@/lib/utils";
import {
  currentWeek, mealState, remainingInWeek, MEAL_LABELS, MEAL_ORDER, fmtEuro,
} from "@/lib/foodUtils";

/**
 * FoodWidget — toont de actuele eetstatus. States:
 * MEAL NOW · NEXT MEAL · RUNNING LOW · NO PLAN. Opent het FoodPanel.
 */
export default function FoodWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const remaining = useMemo(() => remainingInWeek(meals, week?.id), [meals, week]);

  const open = () => openModule("food");

  // NO PLAN
  if (!week) {
    return (
      <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
        <div className="flex flex-col h-full p-5">
          <WidgetHeader label="Food" />
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold">No meal planned</p>
            <button
              onClick={(e) => { e.stopPropagation(); open(); }}
              className="mt-4 self-start rounded-full px-5 py-2.5 text-sm font-bold bg-ivory text-charcoal hover:scale-[1.02] transition-transform"
            >
              Plan meal
            </button>
          </div>
        </div>
      </WidgetShell>
    );
  }

  // RUNNING LOW
  if (st.state !== "MEAL_NOW" && remaining > 0 && remaining <= 3) {
    return (
      <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
        <div className="flex flex-col h-full p-5">
          <WidgetHeader label="Food" count={`${remaining} over`} />
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold mb-2">Running low</p>
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">{remaining} meals remaining</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={(e) => { e.stopPropagation(); open(); }} className="rounded-full px-4 py-2 text-xs font-bold bg-ivory text-charcoal">Adjust plan</button>
              <button onClick={(e) => { e.stopPropagation(); openModule("household"); }} className="rounded-full px-4 py-2 text-xs font-bold glass-button">Household</button>
            </div>
          </div>
        </div>
      </WidgetShell>
    );
  }

  const m = st.meal;

  // Week exists but no concrete next meal to show
  if (!m) {
    return (
      <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
        <div className="flex flex-col h-full p-5">
          <WidgetHeader label="Food" count={`week ${week.week_number}`} />
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold">This week</p>
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em] mt-1">
              {fmtEuro(week.total_cost)} <span className="opacity-50 text-base font-body">/ {fmtEuro(week.budget)}</span>
            </h3>
            <p className="text-xs opacity-50 mt-2">{week.meals_count} maaltijden gepland</p>
          </div>
        </div>
      </WidgetShell>
    );
  }

  const now = st.state === "MEAL_NOW";

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
      <div className="flex flex-col h-full p-5">
        <WidgetHeader label="Food" count={now ? "now" : "next"} />
        <p className="text-[10px] uppercase tracking-[0.28em] opacity-50 font-semibold">{now ? "Now" : "Next"}</p>
        <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em] mt-1">{m.recipe_name}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-2">
          {MEAL_LABELS[m.meal_type] || m.meal_type}{m.time ? ` · ${m.time}` : ""}{m.total_time ? ` · ${m.total_time} min` : ""}
        </p>

        {/* compacte maaltijdlijn */}
        <div className="flex items-center gap-2.5 mt-3">
          {MEAL_ORDER.map((mt) => {
            const has = st.today.some((t) => t.meal_type === mt);
            const active = m.meal_type === mt;
            return (
              <span key={mt} className="flex items-center gap-1">
                <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-current" : has ? "bg-current/60" : "bg-current/20")} />
                <span className="text-[9px] uppercase tracking-wider opacity-40">{mt.slice(0, 3)}</span>
              </span>
            );
          })}
        </div>

        <div className="flex-1" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-display font-semibold tabular-nums">{fmtEuro(m.cost)}</span>
          {now ? (
            <button onClick={(e) => { e.stopPropagation(); open(); }} className="rounded-full px-4 py-2 text-xs font-bold bg-ivory text-charcoal">Cook</button>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.18em] opacity-40">{st.today.length} vandaag</span>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}