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
const IVORY = "hsl(var(--ivory))";

/* Vandaag: actieve cel = lichtblauwe achtergrond, inactief = enkel blauwe tekst.
 * Morgen: tekst in een andere (warm-olive) kleur. */
const BLUE_TEXT = "#6b8ca3";
const BLUE_BG = "#c4d6e0";
const BLUE_BG_TEXT = "#2f4a5a";
const MORGEN_TEXT = "#8a7d5e";

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mealsForDate(meals, weekId, dateStr) {
  return mealsForWeek(meals, weekId).filter((m) => m.date === dateStr);
}
/** Actieve maaltijd op basis van huidig tijdstip — de lichtblauwe cel verplaatst
 *  zich door de dag heen. */
function activeMealType() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 15 && h < 18) return "snack";
  return "dinner";
}

function MealGrid({ meals, mode, dateLabel }) {
  const active = mode === "today" ? activeMealType() : null;
  const headColor = mode === "today" ? BLUE_TEXT : MORGEN_TEXT;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: headColor }}>{dateLabel}</span>
        {mode === "today" && (
          <span className="text-[8px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE_TEXT, opacity: 0.75 }}>nu · {MEAL_LABELS[active]}</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1 min-h-0">
        {MEAL_ORDER.map((mt) => {
          const m = meals.find((x) => x.meal_type === mt);
          const eaten = m?.status === "eaten";
          const isActive = mode === "today" && mt === active;
          const text = mode === "today" ? (isActive ? BLUE_BG_TEXT : BLUE_TEXT) : MORGEN_TEXT;
          return (
            <div key={mt} className="rounded-xl px-2 py-2 flex flex-col justify-between transition-colors"
              style={{ background: isActive ? BLUE_BG : "transparent", border: isActive ? "1px solid rgba(47,74,90,0.28)" : "1px solid transparent" }}>
              <span className="text-[8px] uppercase tracking-[0.12em] font-bold" style={{ color: text, opacity: isActive ? 1 : 0.85 }}>{MEAL_LABELS[mt]}</span>
              <span className="text-[11px] leading-tight mt-1.5 font-medium" style={{ color: text, textDecoration: eaten ? "line-through" : "none", opacity: eaten ? 0.45 : 1 }}>{m?.recipe_name || "—"}</span>
              <span className="text-[8px] tabular-nums mt-1" style={{ color: text, opacity: 0.6 }}>{m?.time || ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** DinnerWidget — G·4:3·SLIDE · "What's for Dinner?"
 *  GlassShell met daarin flush: boven de "Vandaag"-planning (actieve cel =
 *  lichtblauw op tijdstip, rest blauwe tekst) en onder de "Morgen"-planning
 *  (andere kleur). De fotokaart (4 afgeronde hoeken, zachte overlay) schuift van
 *  beneden naar boven en blijft daar hangen — tikken togglet heen en weer. */
export default function DinnerWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: weeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const st = useMemo(() => mealState(meals, week?.id), [meals, week]);
  const today = useMemo(() => mealsForDate(meals, week?.id, localTodayStr()), [meals, week]);
  const tomorrow = useMemo(() => mealsForDate(meals, week?.id, tomorrowStr()), [meals, week]);

  const [up, setUp] = useState(false);

  const made = today.filter((m) => m.status === "eaten").length;
  const headline = !week ? "PLAN JE WEEK" : made >= (week.meals_count || 0) ? "WEEK KLAAR" : st.state === "MEAL_NOW" ? "NU ETEN" : "WEEK LOOPT";
  const sub = !week ? "Nog niets gepland" : st.state === "MEAL_NOW" ? (st.meal?.recipe_name || "Tijd om te eten") : st.state === "NEXT_MEAL" && st.meal ? `${MEAL_LABELS[st.meal.meal_type] || st.meal.meal_type}: ${st.meal.recipe_name || "—"}` : `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)}`;

  return (
    <div className="relative w-full h-[360px] rounded-[28px] overflow-hidden p-2" style={{ "--tile-accent": DEEP, color: IVORY }}>
      {/* glass shell */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-20" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* today planning — boven in de shell (opent food-module) */}
      <div className="absolute top-2 left-2 right-2 h-[calc(50%-12px)] z-0 cursor-pointer" onClick={() => openModule("food")}>
        <MealGrid meals={today} mode="today" dateLabel="Vandaag" />
      </div>

      {/* morgen planning — onder in de shell */}
      <div className="absolute bottom-2 left-2 right-2 h-[calc(50%-12px)] z-0">
        <MealGrid meals={tomorrow} mode="morgen" dateLabel="Morgen" />
      </div>

      {/* fotokaart — flush, 4 afgeronde hoeken, schuift onder ↔ boven */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-2 right-2 top-2 h-[calc(50%-12px)] rounded-[20px] overflow-hidden text-left block z-10"
        initial={false}
        animate={{ y: up ? 0 : 176 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: "0 -10px 30px -14px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)" }}
      >
        <img src={PHOTO} alt="What's for Dinner" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        {/* zachte overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/12 to-black/8" />
        <div className="absolute inset-0 p-3.5 flex flex-col" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
          <WidgetHeader type="briefing" label="What's for Dinner?" count={week ? `wk ${week.week_number}` : ""} />
          <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{sub}</p>
          <div className="flex items-end gap-3 mt-auto">
            <span className="text-[30px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: st.state === "MEAL_NOW" ? "hsl(var(--d-life-urgent))" : "hsl(var(--d-life-light))" }}>{week ? week.meals_count : 0}</span>
            <p className="text-[9px] uppercase tracking-[0.18em] opacity-60 mb-0.5 leading-tight">maaltijden<br />deze week</p>
          </div>
          <p className="text-[8px] uppercase tracking-[0.2em] mt-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>{up ? "tik → vandaag" : "tik → morgen"}</p>
        </div>
      </motion.button>
    </div>
  );
}