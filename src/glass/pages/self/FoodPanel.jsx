import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import PanelShell from "@/glass/components/self/PanelShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";

const PLUM = "#301728", OLIVE = "#d8dab3", URG = "#d5e24a";

const MEALS = [
  {
    id: "ontbijt", type: "ONTBIJT", name: "Havermout met bessen", kcal: 380, time: "07:30",
    accent: URG,
    ingredients: ["Havermout 50g", "Amandelmelk 200ml", "Bosbessen 60g", "Honing 1 tl", "Chiazaden 1 el"],
    steps: ["Verwarm de amandelmelk zachtjes.", "Voeg havermout toe en kook 5 min.", "Roer de chiazaden erdoor.", "Garneer met bosbessen en honing."],
  },
  {
    id: "lunch", type: "LUNCH", name: "Quinoasalade met avocado", kcal: 540, time: "12:30",
    accent: PLUM,
    ingredients: ["Quinoa 80g", "Avocado 1/2", "Kerstomaatjes 8", "Komkommer 1/2", "Olijfolie 1 el", "Citroensap"],
    steps: ["Kook quinoa volgens verpakking.", "Laat afkoelen tot kamertemperatuur.", "Snijd groenten in stukjes.", "Meng quinoa met groenten.", "Maak een dressing van olie en citroensap."],
  },
  {
    id: "snack", type: "SNACK", name: "Griekse yoghurt met noten", kcal: 240, time: "15:30",
    accent: OLIVE,
    ingredients: ["Griekse yoghurt 150g", "Walnoten 20g", "Honing 1 tl", "Banaan 1/2"],
    steps: ["Schep de yoghurt in een kom.", "Voeg de gesneden banaan toe.", "Strooi de walnoten erover.", "Druppel honing naar smaak."],
  },
  {
    id: "diner", type: "DINER", name: "Zalm met geroosterde groenten", kcal: 620, time: "19:00",
    accent: PLUM,
    ingredients: ["Zalmfilet 150g", "Broccoli 200g", "Zoete aardappel 1", "Olijfolie 2 el", "Knoflook 1 teentje", "Peper & zout"],
    steps: ["Verwarm de oven op 200°C.", "Snijd zoete aardappel en broccoli.", "Besprenkel met olie en geperste knoflook.", "Bak de groenten 20 min.", "Bak de zalm 8 min in de pan.", "Serveer samen op een bord."],
  },
];

const TARGET = 1830;
const consumed = MEALS.reduce((s, m) => s + m.kcal, 0);

export default function FoodPanel() {
  const [sel, setSel] = useState(null);
  const pct = Math.round((consumed / TARGET) * 100);

  return (
    <PanelShell
      index="09" section="FOOD · TODAY'S MENU" statement="MENU VAN VANDAAG" kicker="KLIK EEN MAALTIJD VOOR HET RECEPT"
      context={[
        { label: "INNAME", text: `${consumed} kcal van ${TARGET} — ${pct}% van je doel.` },
        { label: "MAALETIJDEN", text: "4 gepland: ontbijt, lunch, snack, diner." },
        { label: "VOLGENDE", text: "Diner om 19:00 — zalm met groenten." },
      ]}
      actions={[{ label: "Plan Meal", primary: true }, { label: "Swap" }, { label: "Add" }, { label: "Open Food" }]}
    >
      <AnimatePresence mode="wait">
        {!sel ? (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
            <div className="flex flex-col gap-6 overflow-auto pr-1">
              <div className="flex flex-col items-center">
                <AnimatedRing pct={pct} size={180} color={URG} label={`${consumed}`} sub={`VAN ${TARGET} KCAL`} />
              </div>
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAALTIJD · KCAL</p>
                {MEALS.map((m, i) => (
                  <div key={m.id} className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-storm/70">{m.type}</span><span className="text-storm tabular-nums">{m.kcal}</span></div>
                    <BarGrow value={m.kcal} max={620} color={m.accent} delay={i * 0.12} />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">INNAME · LIVE</p>
                <LiveSparkline color={PLUM} max={620} intervalMs={1800} />
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
                      <span className="text-urgent text-sm font-bold tabular-nums">{m.kcal} kcal</span>
                      <ArrowRight className="w-4 h-4 text-storm/40 group-hover:text-urgent group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10" style={{ background: m.accent }} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="recipe" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="h-full overflow-auto pr-1">
            <button onClick={() => setSel(null)} className="flex items-center gap-2 text-storm/60 hover:text-storm text-sm mb-4"><ArrowLeft className="w-4 h-4" />Terug naar menu</button>
            <div className="flex items-baseline gap-4">
              <span className="text-[10px] tracking-[0.25em] text-storm/50">{sel.type} · {sel.time}</span>
              <span className="text-urgent text-sm font-bold tabular-nums">{sel.kcal} kcal</span>
            </div>
            <h2 className="text-storm text-2xl font-bold tracking-tight mt-1">{sel.name}</h2>
            <div className="h-px bg-marble/20 my-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">INGREDIENTEN</p>
                <div className="space-y-2">
                  {sel.ingredients.map((ing, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-4 py-2.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sel.accent }} />
                      <span className="text-sm text-storm">{ing}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">BEREIDING</p>
                <div className="space-y-3">
                  {sel.steps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-plum text-storm text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-storm/80 pt-1.5 leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PanelShell>
  );
}