import React, { useState } from "react";
import { Check } from "lucide-react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { AnimatedRing, LiveSparkline, BarGrow } from "@/glass/components/modules/viz";

const SAND = "#94925d", URG = "#d5e24a";
const SUB = [
  { id: 1, title: "Data verzamelen", done: true },
  { id: 2, title: "Analyses uitvoeren", done: true },
  { id: 3, title: "Concept schrijven", done: false },
  { id: 4, title: "Visuals maken", done: false },
  { id: 5, title: "Review ronde 1", done: false },
];
const ACTIVITY = [
  { time: "10:00", text: "Taak aangemaakt" },
  { time: "11:30", text: "Giulia voegde commentaar toe" },
  { time: "13:15", text: "Tijd gelogd: 45m" },
  { time: "14:02", text: "Subtaak voltooid: Data verzamelen" },
];

export default function TaskDetailPreview() {
  const [subs, setSubs] = useState(SUB);
  const done = subs.filter(s => s.done).length;
  const pct = Math.round((done / subs.length) * 100);
  const toggle = (id) => setSubs(ss => ss.map(s => s.id === id ? { ...s, done: !s.done } : s));
  return (
    <ModuleShell index="10" section="TASK DETAIL" statement="Marktanalyse rapport" kicker="CONCEPT BRONS · HOOG"
      context={[
        { label: "VOORTGANG", text: `${pct}% voltooid — ${done}/${subs.length} subtaken.` },
        { label: "TIJD", text: "2u 14m gelogd vandaag." },
        { label: "DEADLINE", text: "Vandaag — hoge prioriteit." },
      ]}
      actions={[{ label: "Complete", primary: true }, { label: "Reassign" }, { label: "Comment" }, { label: "Open Taak" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={pct} size={180} color={pct === 100 ? URG : SAND} label={`${pct}%`} sub="VOLTOOID" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-1">TIJD GEGENEREERD · VANDAAG</p>
            <p className="text-storm text-3xl font-bold tabular-nums">2h 14m</p>
            <div className="mt-2"><LiveSparkline color={SAND} max={10} intervalMs={1800} height={36} /></div>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PRIORITEIT</p>
            <BarGrow value={85} max={100} color={URG} height={10} />
            <p className="text-urgent text-[10px] tracking-wider mt-2">HOOG · 85%</p>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">SUBTAKEN · KLIK OM TE WISSELEN</p>
          <div className="space-y-1.5 mb-4">
            {subs.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} className="w-full flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-2.5 text-left transition-colors">
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${s.done ? "bg-sand border-sand" : "border-marble/40"}`}>{s.done && <Check className="w-3 h-3 text-storm" />}</span>
                <p className={`text-sm ${s.done ? "text-storm/40 line-through" : "text-storm"}`}>{s.title}</p>
              </button>
            ))}
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">ACTIVITEIT</p>
          <div className="flex-1 overflow-auto pr-1 space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-sand mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-storm">{a.text}</p>
                  <p className="text-[10px] text-storm/50 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}