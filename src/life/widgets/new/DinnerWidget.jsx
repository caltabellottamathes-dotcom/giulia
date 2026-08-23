import React, { useMemo } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { currentWeek, mealsToday, mealState, fmtEuro, MEAL_LABELS } from "@/lib/foodUtils";

const PHOTO = IMAGES.lifeW5Dinner;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

/** DinnerWidget — P·4:3·B·SIDE · "What's for Dinner?"
 *  PhotoShell (boven): header + headline + maaltijd-telling. GlassShell (onder):
 *  vandaag-grid (breakfast/lunch/snack/dinner) met tijd + receptnaam + budget.
 *  Data: FoodWeek + Meal. */
export default function DinnerWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const today = useMemo(() => mealsToday(meals, week?.id), [meals, week]);

  const made = today.filter((m) => m.status === "eaten").length;
  const headline = !week ? "PLAN JE WEEK" : made >= (week.meals_count || 0) ? "WEEK KLAAR" : st.state === "MEAL_NOW" ? "NU ETEN" : "WEEK LOOPT";
  const sub = !week ? "Nog niets gepland" : st.state === "MEAL_NOW" ? (st.meal?.recipe_name || "Tijd om te eten") : st.state === "NEXT_MEAL" && st.meal ? `${MEAL_LABELS[st.meal.meal_type] || st.meal.meal_type}: ${st.meal.recipe_name || "—"}` : `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)}`;

  return (
    <div className="relative w-full h-[360px] rounded-[28px] overflow-hidden" onClick={() => openModule("food")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="What's for Dinner" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "55%", background: "linear-gradient(to bottom, rgba(0,0,0,0.38), rgba(0,0,0,0))" }}>
        <WidgetHeader type="briefing" label="What's for Dinner?" count={week ? `wk ${week.week_number}` : ""} />
        <h3 className="text-[24px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 truncate" style={{ color: LIGHT }}>{sub}</p>
        <div className="flex items-end gap-3 mt-auto">
          <span className="text-[40px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: st.state === "MEAL_NOW" ? URGENT : LIGHT }}>{week ? week.meals_count : 0}</span>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-55 mb-1 leading-tight">maaltijden<br />deze week</p>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[45%] bg-gradient-to-t from-black/52 via-black/24 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[45%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Vandaag</span>
          {st.state === "MEAL_NOW" && <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.16em] font-bold" style={{ color: URGENT }}><span className="h-1.5 w-1.5 rounded-full animate-pulse-soft" style={{ background: URGENT }} /> nu</span>}
        </div>
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {MEAL_ORDER.map((mt) => {
            const m = today.find((x) => x.meal_type === mt);
            const eaten = m?.status === "eaten";
            const now = st.state === "MEAL_NOW" && st.meal?.meal_type === mt;
            return (
              <div key={mt} className="rounded-xl px-2 py-2 flex flex-col justify-between" style={{ background: now ? URGENT + "18" : "rgba(255,255,255,0.06)", border: `1px solid ${now ? URGENT + "44" : "rgba(255,255,255,0.12)"}` }}>
                <span className="text-[8px] uppercase tracking-[0.12em] font-bold" style={{ color: now ? URGENT : "rgba(255,255,255,0.6)" }}>{MEAL_LABELS[mt]}</span>
                <span className="text-[10px] leading-tight mt-1.5" style={{ color: eaten ? "rgba(255,255,255,0.45)" : IVORY, textDecoration: eaten ? "line-through" : "none" }}>{m?.recipe_name || "—"}</span>
                <span className="text-[8px] tabular-nums mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{m?.time || ""}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[8px] uppercase tracking-[0.16em] mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>{week ? `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)} budget · ${week.quick_meals} quick` : "Tik om een eetweek te maken"}</p>
      </div>
    </div>
  );
}