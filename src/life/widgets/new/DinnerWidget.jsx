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

/* Vandaag = blauwe familie (actief = lichtblauwe cel), morgen = warm-olive. */
const BLUE = "#6b8ca3";
const BLUE_BG = "#c4d6e0";
const BLUE_INK = "#2f4a5a";
const OLIVE = "#8a7d5e";
const OLIVE_BG = "#e7e1cf";

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];
const DAY_START = 6 * 60;
const DAY_END = 23 * 60;

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function mealsForDate(meals, weekId, dateStr) {
  return mealsForWeek(meals, weekId).filter((m) => m.date === dateStr);
}
function timeToMin(t) {
  if (!t) return 9999;
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
/** positie op de tijdlijn (06:00→23:00), geclamped zodat labels binnen de shell blijven. */
function timeToX(time, fallbackIdx) {
  if (!time) return [10, 37, 60, 87][fallbackIdx] ?? 50;
  const mins = Math.max(DAY_START, Math.min(DAY_END, timeToMin(time)));
  const pct = ((mins - DAY_START) / (DAY_END - DAY_START)) * 100;
  return Math.max(7, Math.min(93, pct));
}
function nowX() {
  const d = new Date();
  const mins = Math.max(DAY_START, Math.min(DAY_END, d.getHours() * 60 + d.getMinutes()));
  return Math.max(4, Math.min(96, ((mins - DAY_START) / (DAY_END - DAY_START)) * 100));
}
function activeMealType() {
  const h = new Date().getHours();
  if (h >= 6 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 15 && h < 18) return "snack";
  return "dinner";
}

/** DayTimeline — visuele dag-tijdlijn met maaltijd-nodes op hun tijdstip, een
 *  meebewegende "nu"-markering (vandaag) en een detail-chip van de actieve /
 *  eerste maaltijd. */
function DayTimeline({ meals, mode, dateLabel, dayName }) {
  const isToday = mode === "today";
  const active = isToday ? activeMealType() : null;
  const accent = isToday ? BLUE : OLIVE;
  const now = isToday ? nowX() : null;
  const lead = MEAL_ORDER.map((mt) => meals.find((x) => x.meal_type === mt)).filter(Boolean)[0] || meals[0];

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: accent }}>{dateLabel}</span>
          {dayName && <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: accent, opacity: 0.55 }}>{dayName}</span>}
        </div>
        {isToday ? (
          <span className="text-[8px] uppercase tracking-[0.16em] font-bold px-2 py-0.5 rounded-full" style={{ background: BLUE_BG, color: BLUE_INK }}>nu · {MEAL_LABELS[active]}</span>
        ) : (
          <span className="text-[8px] uppercase tracking-[0.16em] font-semibold" style={{ color: OLIVE, opacity: 0.7 }}>{meals.length} maaltijden</span>
        )}
      </div>

      {/* tijdlijn */}
      <div className="relative h-[74px] mt-3 shrink-0">
        {/* track */}
        <div className="absolute left-0 right-0 top-7 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}55 12%, ${accent}55 88%, transparent)` }} />
        {/* nu-markering (vandaag) */}
        {now != null && (
          <div className="absolute top-0 z-20" style={{ left: `${now}%` }}>
            <span className="absolute -translate-x-1/2 top-0 text-[7px] uppercase tracking-[0.18em] font-bold px-1 rounded leading-none py-[1px]" style={{ background: BLUE_INK, color: BLUE_BG }}>nu</span>
            <div className="absolute top-4 left-0 -translate-x-1/2 h-7 w-px animate-pulse-soft" style={{ background: BLUE_INK }} />
          </div>
        )}
        {/* nodes */}
        {MEAL_ORDER.map((mt, idx) => {
          const m = meals.find((x) => x.meal_type === mt);
          const x = timeToX(m?.time, idx);
          const isActive = isToday && mt === active;
          return (
            <div key={mt} className="absolute -translate-x-1/2" style={{ left: `${x}%`, top: 22 }}>
              {isActive ? (
                <span className="relative block h-4 w-4 rounded-full" style={{ background: BLUE_BG, boxShadow: `0 0 0 5px ${BLUE_BG}40` }}>
                  <span className="absolute inset-0 rounded-full animate-pulse-soft" style={{ background: BLUE_BG, opacity: 0.55 }} />
                </span>
              ) : (
                <span className="block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: accent, background: "transparent" }} />
              )}
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 text-center w-[70px]" style={{ marginLeft: "-35px" }}>
                <span className="text-[7.5px] uppercase tracking-[0.12em] font-bold block leading-none" style={{ color: isActive ? BLUE_INK : accent, opacity: isActive ? 1 : 0.85 }}>{MEAL_LABELS[mt]}</span>
                <span className="text-[8px] tabular-nums block mt-0.5" style={{ color: isActive ? BLUE_INK : accent, opacity: 0.55 }}>{m?.time || "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* detail-chip */}
      <div className="mt-2 shrink-0">
        {(() => {
          const m = isToday ? meals.find((x) => x.meal_type === active) : lead;
          const bg = isToday ? BLUE_BG : OLIVE_BG;
          const ink = isToday ? BLUE_INK : OLIVE;
          return (
            <div className="relative overflow-hidden rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: bg, color: ink }}>
              {isToday && (
                <motion.span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  initial={{ x: "-120%" }} animate={{ x: "320%" }} transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }} />
              )}
              <div className="flex items-center gap-2 min-w-0 relative">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ink }} />
                <span className="text-[9px] uppercase tracking-[0.16em] font-bold">{isToday ? MEAL_LABELS[active] : "eerste"}</span>
                <span className="text-[12px] font-display font-semibold truncate">{m?.recipe_name || "niets gepland"}</span>
              </div>
              <span className="text-[10px] tabular-nums font-bold shrink-0 ml-2 relative">{m?.time || "—"}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/** DinnerWidget — G·4:3·SLIDE · "What's for Dinner?"
 *  GlassShell, opgesplitst: boven "Vandaag"-tijdlijn (actieve cel lichtblauw op
 *  tijdstip + meebewegende nu-markering), onder "Morgen"-tijdlijn (olive). De
 *  fotokaart is flush tegen de shellranden met vier afgeronde hoeken en schuift
 *  bij een tik van onder naar boven (en weer terug) om beide plannings te tonen. */
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

  const tDate = new Date();
  const mDate = new Date(); mDate.setDate(mDate.getDate() + 1);
  const todayDay = `${tDate.getDate()} ${tDate.toLocaleDateString("nl-NL", { month: "short" })}`;
  const morgenDay = mDate.toLocaleDateString("nl-NL", { weekday: "long" });

  const made = today.filter((m) => m.status === "eaten").length;
  const headline = !week ? "PLAN JE WEEK" : made >= (week.meals_count || 0) ? "WEEK KLAAR" : st.state === "MEAL_NOW" ? "NU ETEN" : "WEEK LOOPT";
  const sub = !week ? "Nog niets gepland" : st.state === "MEAL_NOW" ? (st.meal?.recipe_name || "Tijd om te eten") : st.state === "NEXT_MEAL" && st.meal ? `${MEAL_LABELS[st.meal.meal_type] || st.meal.meal_type}: ${st.meal.recipe_name || "—"}` : `${fmtEuro(week.total_cost)} / ${fmtEuro(week.budget)}`;

  return (
    <div className="relative w-full h-[380px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: IVORY }}>
      {/* glass shell */}
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={{ background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-20" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* vandaag — boven in de shell */}
      <div className="absolute top-0 left-0 right-0 h-1/2 z-0 cursor-pointer p-3 pb-1" onClick={() => openModule("food")}>
        <DayTimeline meals={today} mode="today" dateLabel="Vandaag" dayName={todayDay} />
      </div>

      {/* morgen — onder in de shell */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-0 cursor-pointer p-3 pt-1" onClick={() => openModule("food")}>
        <DayTimeline meals={tomorrow} mode="morgen" dateLabel="Morgen" dayName={morgenDay} />
      </div>

      {/* fotokaart — flush tegen de randen, 4 afgeronde hoeken, schuift onder ↔ boven */}
      <motion.button
        type="button"
        onClick={() => setUp((v) => !v)}
        className="absolute left-0 right-0 top-0 h-1/2 rounded-[24px] overflow-hidden text-left block z-10"
        initial={false}
        animate={{ y: up ? "0%" : "100%" }}
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