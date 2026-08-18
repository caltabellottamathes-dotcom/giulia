import React, { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { BarGrow } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const WEEK = [{ d: "Ma", v: 6.5 }, { d: "Di", v: 8 }, { d: "Wo", v: 5 }, { d: "Do", v: 7.5 }, { d: "Vr", v: 4 }, { d: "Za", v: 1 }, { d: "Zo", v: 0 }];
const PROJ = [
  { n: "Concept Brons", v: 4.2, c: SAND }, { n: "Onderzoek", v: 2.8, c: OLIVE }, { n: "Identiteit", v: 1.5, c: "#6b6a4a" }, { n: "Overig", v: 0.9, c: URG },
];
const LOGS = [
  { id: 1, text: "Concept Brons — 1h 12m", time: "13:00" },
  { id: 2, text: "Onderzoek — 45m", time: "11:30" },
  { id: 3, text: "Identiteit — 30m", time: "10:00" },
  { id: 4, text: "Overig — 15m", time: "09:30" },
];

export default function TimeTrackerPreview() {
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <ModuleShell index="11" section="TIME TRACKER" statement={running ? "LOPEND" : "GEPAUZEERD"} kicker={fmt(secs)}
      context={[
        { label: "VANDAAG", text: "5.2 uur gelogd over 4 projecten." },
        { label: "WEEK", text: "32 uur — 4 uur boven doel." },
        { label: "NU", text: running ? "Timer loopt voor Concept Brons." : "Timer gepauzeerd." },
      ]}
      actions={[{ label: running ? "Pause" : "Start", primary: true }, { label: "Log" }, { label: "Reset" }, { label: "Open Tijd" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-marble/20 bg-marble/5 py-8">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">NU AAN HET TRACKEN</p>
            <p className={`text-storm text-5xl font-bold tabular-nums ${running ? "text-urgent" : ""}`}>{fmt(secs)}</p>
            <button onClick={() => setRunning(r => !r)} className={`mt-5 px-8 py-3 rounded-full text-xs font-semibold tracking-[0.15em] uppercase transition-all active:scale-95 ${running ? "bg-urgent text-plum" : "bg-sand text-storm"}`}>{running ? "Pause" : "Start"}</button>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">VANDAAG TOTAAL</p>
            <p className="text-storm text-4xl font-bold mt-1 tabular-nums">5.2h</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER PROJECT</p>
            {PROJ.map((p, i) => (
              <div key={p.n} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-storm/70">{p.n}</span><span className="text-storm tabular-nums">{p.v}h</span></div>
                <BarGrow value={p.v} max={5} color={p.c} delay={i * 0.1} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">DEZE WEEK · UREN PER DAG</p>
          <div className="h-40 rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {WEEK.map((w, i) => <Cell key={i} fill={i === 1 ? URG : SAND} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3 mt-4">RECENTE LOGS</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {LOGS.map(l => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-4 py-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SAND }} />
                <p className="text-sm text-storm flex-1 truncate">{l.text}</p>
                <span className="text-[10px] text-storm/40 tabular-nums shrink-0">{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}