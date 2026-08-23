import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { currentWeek, mealsForWeek, mealState, fmtEuro, MEAL_LABELS, localTodayStr } from "@/lib/foodUtils";

const PHOTO = IMAGES.lifeW5Dinner;
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const IVORY = "hsl(var(--ivory))";

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mealsForDate(meals, weekId, dateStr) {
  return mealsForWeek(meals, weekId).filter((m) => m.date === dateStr);
}

/** MealGrid — vier maaltijd-cellen (breakfast/lunch/snack/dinner) voor één dag. */
function MealGrid({ meals, dateLabel, highlight, onBack }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>{dateLabel}</span>
        {highlight ? (
          <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.16em] font-bold" style={{ color: URGENT }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse-soft" style={{ background: URGENT }} /> nu
          </span>
        ) : onBack ? (
          <button onClick={onBack} className="text-[8px] uppercase tracking-[0.16em] font-bold flex items-center gap-1 hover:opacity-80 transition" style={{ color: "rgba(255,255,255,0.6)" }}>vandaag ↓</button>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1 min-h-0">
        {MEAL_ORDER.map((mt) => {
          const m = meals.find((x) => x.meal_type === mt);
          const eaten = m?.status === "eaten";
          return (
            <div key={mt} className="rounded-xl px-2 py-2 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-[8px] uppercase tracking-[0.12em] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{MEAL_LABELS[mt]}</span>
              <span className="text-[10px] leading-tight mt-1.5" style={{ color: eaten ? "rgba(255,255,255,0.45)" : IVORY, textDecoration: eaten ? "line-through" : "none" }}>{m?.recipe_name || "—"}</span>
              <span className="text-[8px] tabular-nums mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{m?.time || ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** DinnerWidget — G·4:3·FLIP · "What's for Dinner?"
 *  GlassShell (heel de widget). Boven in de shell: de "Vandaag"-grid. Onder: een
 *  fotokaart met de samenvatting (header/headline/telling). Tik op de kaart → hij
 *  schuift omhoog weg en onthult onder in de shell de "Morgen"-food-indeling. */
export default function DinnerWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const today = useMemo(() => mealsForDate(meals, week?.id, localTodayStr()), [meals, week]);
  const tomorrow = useMemo(() => mealsForDate(meals, week?.id, tomorrowStr()), [meals, week]);

  const [revealed, setRevealed] = useState(false);

  const made = today.filter((m) => m.status === "eaten").length;
  const headline = !week ? "PLAN JE WEEK" : made >= (week.meals_count || 0) ? "WEEK KLAAR" : st.state === "MEAL_NOW" ? "NU ETEN" : "WEEK LOOPT";
  const sub = !week ? "Nog niets gepland" : st.state === "MEAL_NOW" ? (st.meal?.recipe_name || "Tijd om te eten") : st.state === "NEXT_MEAL" && st.meal ? `${MEAL_LABELS[st.meal.meal_type] || st.meal.meal_type}: ${st.meal.recipe_name || "—"}` : `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)}`;

  return (
    <div className="relative w-full h-[360px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: IVORY }}>
      {/* glass shell */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      <div className="absolute inset-0 p-4 flex flex-col z-10">
        {/* boven in de shell: "Vandaag" (was in de kaart) — opent food-module */}
        <div className="h-[150px] shrink-0 cursor-pointer" onClick={() => openModule("food")}>
          <MealGrid meals={today} dateLabel="Vandaag" highlight={st.state === "MEAL_NOW"} />
        </div>

        {/* onder: fotokaart (standaard) of morgen-indeling (onthuld) */}
        <div className="relative flex-1 mt-3 min-h-0">
          {/* morgen — onthuld onder in de shell */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 22 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: revealed ? "auto" : "none" }}
          >
            <MealGrid meals={tomorrow} dateLabel="Morgen" onBack={() => setRevealed(false)} />
          </motion.div>

          {/* fotokaart — schuift omhoog bij tik */}
          <motion.button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 rounded-[20px] overflow-hidden text-left block"
            initial={false}
            animate={{ y: revealed ? "-118%" : 0, opacity: revealed ? 0 : 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ pointerEvents: revealed ? "none" : "auto", boxShadow: "0 -10px 30px -14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)" }}
          >
            <img src={PHOTO} alt="What's for Dinner" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/20 to-black/25" />
            <div className="absolute inset-0 p-3.5 flex flex-col">
              <WidgetHeader type="briefing" label="What's for Dinner?" count={week ? `wk ${week.week_number}` : ""} />
              <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 truncate" style={{ color: LIGHT }}>{sub}</p>
              <div className="flex items-end gap-3 mt-auto">
                <span className="text-[34px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: st.state === "MEAL_NOW" ? URGENT : LIGHT }}>{week ? week.meals_count : 0}</span>
                <p className="text-[9px] uppercase tracking-[0.18em] opacity-55 mb-1 leading-tight">maaltijden<br />deze week</p>
              </div>
              <p className="text-[8px] uppercase tracking-[0.2em] mt-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>tik → morgen</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}