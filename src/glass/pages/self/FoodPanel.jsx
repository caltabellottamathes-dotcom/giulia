import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { currentWeek, mealsToday, MEAL_LABELS, fmtEuro } from "@/lib/foodUtils";

const MEAL_ACCENT = { breakfast: SAND, lunch: BLUE, snack: SAND, dinner: BLUE };

export default function FoodPanel() {
  const [meals, setMeals] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Meal.list().catch(() => []),
      base44.entities.FoodWeek.list().catch(() => []),
    ]).then(([m, w]) => { setMeals(m || []); setWeeks(w || []); }).finally(() => setLoading(false));
  }, []);

  const week = useMemo(() => currentWeek(weeks), [weeks]);
  const today = useMemo(() => mealsToday(meals, week?.id), [meals, week]);

  const MEALS = today.map((m) => ({
    id: m.id,
    type: (MEAL_LABELS[m.meal_type] || m.meal_type || "MEAL").toUpperCase(),
    name: m.recipe_name || "Maaltijd",
    cost: m.cost || 0,
    time: m.time || "—",
    accent: MEAL_ACCENT[m.meal_type] || BLUE,
    ingredients: (m.ingredients || []).map((i) => `${i.name}${i.amount ? ` ${i.amount}${i.unit || ""}` : ""}`),
    steps: m.method || [],
  }));

  const consumed = MEALS.reduce((s, m) => s + m.cost, 0);
  const target = week?.budget || 50;
  const pct = target ? Math.round((consumed / target) * 100) : 0;

  if (loading) return <PanelShell index="09" section="FOOD" statement="LADEN…">{null}</PanelShell>;

  return (
    <PanelShell
      index="09" section="FOOD · TODAY'S MENU" statement={MEALS.length ? "MENU VAN VANDAAG" : "NIETS GEPLAND"} kicker={MEALS.length ? "KLIK EEN MAALTIJD VOOR HET RECEPT" : "PLAN EEN MAALTIJD"}
      context={[
        { label: "UITGAVEN", text: `${fmtEuro(consumed)} van ${fmtEuro(target)} — ${pct}% van je budget.` },
        { label: "MAALTIJDEN", text: `${MEALS.length} gepland vandaag.` },
        { label: "VOLGENDE", text: MEALS.find((m) => m.time !== "—") ? `${MEALS[0].type} om ${MEALS[0].time}.` : "Geen volgende maaltijd." },
      ]}
      actions={[{ label: "Open Food", primary: true, to: "/life/food" }, { label: "Plan Meal", to: "/life/food" }]}
    >
      <AnimatePresence mode="wait">
        {!sel ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
            <div className="flex flex-col gap-6 overflow-auto pr-1">
              <div className="flex flex-col items-center">
                <div className="relative" style={{ width: 180, height: 180 }}>
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke={TRACK} strokeWidth="12" />
                    <motion.circle cx="100" cy="100" r="80" fill="none" stroke={SAND} strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 80} initial={{ strokeDashoffset: 2 * Math.PI * 80 }} animate={{ strokeDashoffset: 2 * Math.PI * 80 - (pct / 100) * 2 * Math.PI * 80 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-storm text-3xl font-bold tabular-nums">{fmtEuro(consumed)}</span>
                    <span className="text-storm/50 text-[10px] tracking-[0.25em] mt-1">VAN {fmtEuro(target)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAALTIJD · KOSTEN</p>
                {MEALS.map((m, i) => (
                  <div key={m.id} className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-storm/70">{m.type}</span><span className="text-storm tabular-nums">{fmtEuro(m.cost)}</span></div>
                    <div className="w-full rounded-full bg-marble/10 overflow-hidden" style={{ height: 10 }}>
                      <motion.div className="h-full rounded-full" style={{ background: m.accent }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (m.cost / Math.max(...MEALS.map((x) => x.cost), 1)) * 100)}%` }} transition={{ duration: 1, delay: i * 0.12 }} />
                    </div>
                  </div>
                ))}
                {MEALS.length === 0 && <p className="text-storm/40 text-xs">Geen maaltijden vandaag.</p>}
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">VANDAAG · KLIK VOOR RECEPT</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start overflow-auto pr-1">
                {MEALS.map((m, i) => (
                  <motion.button key={m.id} layout onClick={() => setSel(m)}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="group relative overflow-hidden rounded-2xl border border-marble/25 bg-marble/8 p-5 text-left hover:bg-marble/15 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-storm/50">{m.type}</span>
                      <span className="text-[10px] tabular-nums text-storm/40">{m.time}</span>
                    </div>
                    <h3 className="text-storm text-lg font-semibold mt-3 leading-tight">{m.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-bold tabular-nums" style={{ color: SAND }}>{fmtEuro(m.cost)}</span>
                      <ArrowRight className="w-4 h-4 text-storm/40 group-hover:translate-x-1 transition-all" style={{ color: m.accent }} />
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10" style={{ background: m.accent }} />
                  </motion.button>
                ))}
                {MEALS.length === 0 && <p className="text-storm/40 text-sm">Nog geen maaltijden gepland vandaag — ga naar Food om te plannen.</p>}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="recipe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-auto pr-1">
            <button onClick={() => setSel(null)} className="flex items-center gap-2 text-storm/60 hover:text-storm text-sm mb-4"><ArrowLeft className="w-4 h-4" />Terug naar menu</button>
            <div className="flex items-baseline gap-4">
              <span className="text-[10px] tracking-[0.25em] text-storm/50">{sel.type} · {sel.time}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: SAND }}>{fmtEuro(sel.cost)}</span>
            </div>
            <h2 className="text-storm text-2xl font-bold tracking-tight mt-1">{sel.name}</h2>
            <div className="h-px bg-marble/20 my-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">INGREDIENTEN</p>
                <div className="space-y-2">
                  {sel.ingredients.length ? sel.ingredients.map((ing, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-4 py-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sel.accent }} />
                      <span className="text-sm text-storm">{ing}</span>
                    </motion.div>
                  )) : <p className="text-storm/40 text-sm">Geen ingredienten vastgelegd.</p>}
                </div>
              </div>
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">BEREIDING</p>
                <div className="space-y-3">
                  {sel.steps.length ? sel.steps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full text-metal text-xs font-bold flex items-center justify-center shrink-0" style={{ background: BLUE }}>{i + 1}</span>
                      <p className="text-sm text-storm/80 pt-1.5 leading-relaxed">{step}</p>
                    </motion.div>
                  )) : <p className="text-storm/40 text-sm">Geen bereidingsstappen vastgelegd.</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelShell>
  );
}