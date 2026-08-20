import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { MEAL_LABELS, MEAL_ORDER, currentWeek, mealsToday, mealsForWeek, weekDays, timeToMin, fmtEuro, DAY_LABELS } from "@/lib/foodUtils";
import CountUp from "@/system/widgets/CountUp";
import { BudgetDonut, DailyCostChart } from "@/life/food/foodCharts";
import MealCard from "@/life/food/MealCard";
import RecipeView from "@/life/components/RecipeView";
import { SAND, SAND_DEEP } from "@/life/food/lifeColors";
import { Loader2, Sparkles } from "lucide-react";
import { ContextGrid, ActionRow } from "@/self/components/SelfViz";

/** FoodPreview — grafisch glas-paneel in LIFE-stijl. Reusachtig tellend
 *  cijfer, geanimeerde budget-donut + dagkosten-grafiek (Recharts), en de
 *  maaltijden van vandaag met een live 'now'-pulser (Framer Motion). */
export default function FoodPreview() {
  const learnTick = useLearningSync();
  const { data: weeks, reload: reloadWeeks } = useEntityList("FoodWeek", { realtime: true, externalTick: learnTick });
  const { data: meals, reload: reloadMeals } = useEntityList("Meal", { realtime: true, externalTick: learnTick });
  const [selected, setSelected] = useState(null);
  const [planning, setPlanning] = useState(false);

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const today = useMemo(() => mealsToday(meals, week?.id), [meals, week]);
  const weekMeals = useMemo(() => mealsForWeek(meals, week?.id), [meals, week]);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const days = useMemo(() => (week ? weekDays(week) : []), [week]);
  const dailyData = useMemo(() => days.map((d) => ({
    day: (DAY_LABELS[d.dayKey] || "").toUpperCase(),
    cost: Math.round((weekMeals.filter((m) => m.date === d.date).reduce((s, m) => s + (m.cost || 0), 0)) * 100) / 100,
  })), [days, weekMeals]);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const made = weekMeals.filter((m) => m.status === "eaten").length;

  const planWeek = async () => {
    setPlanning(true);
    try { await base44.functions.invoke("planFoodWeek", {}); reloadWeeks(); reloadMeals(); } catch { /* ignore */ } finally { setPlanning(false); }
  };

  if (planning) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ivory/70">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Giulia plant je week…</p>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="space-y-6 text-ivory">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Food</p>
          <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">PLAN JE WEEK</h2>
          <p className="text-sm text-ivory/55 mt-2 italic">Laat Giulia een complete eetweek voor je maken binnen budget.</p>
        </div>
        <div className="glass-card-2 rounded-2xl p-7 text-center">
          <BudgetDonut cost={0} budget={50} size={140} thickness={16} accent={SAND} track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
          <button onClick={planWeek} className="mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-charcoal inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform" style={{ background: SAND }}><Sparkles className="h-4 w-4" /> Plan new week</button>
        </div>
      </div>
    );
  }

  const byType = {};
  today.forEach((m) => { byType[m.meal_type] = m; });
  const counts = `${made}/${week.meals_count} gegeten · ${week.quick_meals} quick · ${week.promotions_count} aanbieding`;

  return (
    <div className="space-y-6 text-ivory">
      {/* HERO */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Food · week {week.week_number}</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">DEZE WEEK</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">{fmtEuro(week.total_cost)} van je {fmtEuro(week.budget)} budget — {week.meals_count} maaltijden gepland.</p>
      </div>

      {/* Reusachtig cijfer */}
      <div className="glass-card-2 rounded-2xl p-5 flex items-end gap-5">
        <span className="text-[72px] leading-[0.78] font-display font-semibold tabular-nums" style={{ color: SAND }}><CountUp value={week.meals_count} /></span>
        <div className="mb-3 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">maaltijden deze week</p>
          <p className="text-xs text-ivory/45 mt-1.5 truncate">{counts}</p>
        </div>
      </div>

      {/* Grafieken */}
      <div className="glass-card-2 rounded-2xl p-5">
        <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
          <BudgetDonut cost={week.total_cost} budget={week.budget} size={132} thickness={15} accent={SAND} track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-2">Kost per dag</p>
            <DailyCostChart data={dailyData} height={120} accent={SAND} baseColor="hsl(var(--ivory) / 0.22)" tickColor="hsl(var(--ivory) / 0.5)" highlightIndex={todayIdx} />
          </div>
        </div>
      </div>

      {/* Vandaag */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Vandaag</p>
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {MEAL_ORDER.map((mt) => {
              const m = byType[mt];
              if (!m) return <MealCard key={mt} tone="dark" empty />;
              const active = Math.abs(timeToMin(m.time) - nowMin) <= 60;
              return (
                <motion.div key={mt} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <MealCard meal={m} active={active} onClick={() => setSelected(m)} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {selected && <RecipeView meal={selected} onClose={() => setSelected(null)} onEaten={() => { setSelected(null); reloadMeals(); }} />}

      <ContextGrid items={[
        { label: "BUDGET", text: `${fmtEuro(week.total_cost)} van ${fmtEuro(week.budget)} — ${Math.round((week.total_cost / week.budget) * 100)}%.` },
        { label: "MAALTIJDEN", text: `${week.meals_count} gepland · ${made} gegeten.` },
        { label: "VOLGENDE", text: today[0] ? `${MEAL_LABELS[today[0].meal_type] || "Maaltijd"}: ${today[0].recipe_name}` : "Geen volgende maaltijd." },
      ]} />
      <ActionRow actions={[
        { label: "Open Food", primary: true, color: "#d8dab3", to: "/life/food" },
        { label: "Plan Nieuwe Week", onClick: planWeek },
      ]} />
    </div>
  );
}