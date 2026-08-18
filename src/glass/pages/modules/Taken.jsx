import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";

const PLUM = "#301728", URG = "#d5e24a", OLIVE = "#d8dab3";

const INITIAL = [
  { id: 1, title: "Marktanalyse rapport — eerste concept", prio: "high", cat: "Onderzoek", due: "vandaag", done: false },
  { id: 2, title: "Concept Brons — presentatie voorbereiden", prio: "high", cat: "Concept Brons", due: "morgen", done: false },
  { id: 3, title: "Identiteit kleurenpallet definitie", prio: "med", cat: "Identiteit", due: "vr", done: false },
  { id: 4, title: "Afspraak Giulia inplannen", prio: "med", cat: "Afspraken", due: "vandaag", done: true },
  { id: 5, title: "Marktonderzoek data verzamelen", prio: "low", cat: "Marktonderzoek", due: "next wk", done: false },
  { id: 6, title: "Notities vergadering uitwerken", prio: "low", cat: "Onderzoek", due: "—", done: true },
];
const PRIO = { high: { c: URG, l: "HIGH" }, med: { c: PLUM, l: "MED" }, low: { c: OLIVE, l: "LOW" } };

export default function Taken() {
  const [tasks, setTasks] = useState(INITIAL);
  const toggle = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const done = tasks.filter(t => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const counts = { high: 0, med: 0, low: 0 };
  tasks.filter(t => !t.done).forEach(t => counts[t.prio]++);

  return (
    <ModuleShell
      index="01" section="TASKS" statement={`${tasks.length - done} OPEN`} kicker="VANDAAG"
      context={[
        { label: "OPEN", text: `${tasks.length - done} taken wachten op actie.` },
        { label: "DONE", text: `${done} taken voltooid vandaag.` },
        { label: "NEXT", text: "Hoogste prioriteit: Marktanalyse rapport." },
      ]}
      actions={[{ label: "New Task", primary: true }, { label: "Filter" }, { label: "Sort" }, { label: "Open Taken" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center">
            <AnimatedRing pct={pct} size={200} color={URG} label={`${pct}%`} sub="DONE TODAY" />
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">ACTIVITY · LIVE</p>
            <LiveSparkline color={PLUM} max={12} intervalMs={1700} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PRIORITY · OPEN</p>
            {["high", "med", "low"].map((k, i) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-storm/70">{PRIO[k].l}</span>
                  <span className="text-storm tabular-nums">{counts[k]}</span>
                </div>
                <BarGrow value={counts[k]} max={tasks.length} color={PRIO[k].c} delay={i * 0.15} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">{tasks.length} TAKEN · KLIK OM TE WISSELEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence>
              {tasks.map(t => (
                <motion.button key={t.id} layout
                  onClick={() => toggle(t.id)}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${t.done ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/8 hover:bg-marble/15"}`}>
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${t.done ? "bg-urgent border-urgent" : "border-marble/40"}`}>
                    {t.done && <Check className="w-3 h-3 text-plum" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.done ? "text-storm/40 line-through" : "text-storm"}`}>{t.title}</p>
                    <p className="text-[10px] text-storm/50 mt-0.5">{t.cat} · {t.due}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${PRIO[t.prio].c}22`, color: PRIO[t.prio].c }}>{PRIO[t.prio].l}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}