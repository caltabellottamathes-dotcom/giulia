import React, { useState } from "react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { AnimatedRing } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const COLOR = { A: SAND, B: OLIVE, C: "#6b6a4a", U: URG };
const WEEK_TASKS = [
  { day: 1, t: "09:00", dur: 1.5, title: "Standup", cat: "A" },
  { day: 1, t: "11:00", dur: 2, title: "Marktanalyse", cat: "U" },
  { day: 2, t: "10:00", dur: 1, title: "Concept Brons", cat: "A" },
  { day: 2, t: "14:00", dur: 1.5, title: "Giulia", cat: "B" },
  { day: 3, t: "09:30", dur: 2.5, title: "Onderzoek", cat: "C" },
  { day: 4, t: "11:00", dur: 1, title: "Identiteit", cat: "A" },
  { day: 4, t: "15:00", dur: 2, title: "Review", cat: "U" },
  { day: 5, t: "10:00", dur: 1.5, title: "Pitch prep", cat: "A" },
  { day: 6, t: "12:00", dur: 1, title: "Vrije tijd", cat: "B" },
  { day: 7, t: "18:00", dur: 1, title: "Reflectie", cat: "B" },
];

export default function WeekView() {
  const today = new Date().getDay() || 7;
  const [sel, setSel] = useState(today);
  const pct = Math.round((today - 1) / 6 * 100);
  const selTasks = WEEK_TASKS.filter(t => t.day === sel);
  return (
    <ModuleShell index="12" section="WEEK" statement="WEEK 33" kicker="10 – 16 AUG"
      context={[
        { label: "VERLOPEN", text: `${pct}% van de week al gepasseerd.` },
        { label: "BELASTING", text: "Donderdag is de drukste dag — 3 taken." },
        { label: "VRIJ", text: "Zaterdag grotendeels open." },
      ]}
      actions={[{ label: "Today", primary: true }, { label: "Prev" }, { label: "Next" }, { label: "Open Weekplanning" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={pct} size={180} color={SAND} label={`${pct}%`} sub="WEEK VERLOPEN" /></div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">LEGENDA</p>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: SAND }} />Werk</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: OLIVE }} />Afspraak</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: "#6b6a4a" }} />Onderzoek</span>
              <span className="flex items-center gap-2 text-[10px] text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: URG }} />Belangrijk</span>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 text-center">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">NU</p>
            <p className="text-urgent text-2xl font-bold tabular-nums mt-1">{new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
            {DAYS.map((d, i) => {
              const day = i + 1;
              const tasks = WEEK_TASKS.filter(t => t.day === day);
              const load = Math.min(100, tasks.reduce((s, t) => s + t.dur, 0) / 8 * 100);
              const isToday = day === today;
              return (
                <button key={d} onClick={() => setSel(day)} className={`flex flex-col rounded-2xl border p-2 transition-colors ${sel === day ? "border-sand bg-marble/10" : "border-marble/20 bg-marble/5 hover:bg-marble/8"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] tracking-wider ${isToday ? "text-urgent" : "text-storm/70"}`}>{d}</span>
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-urgent" />}
                  </div>
                  <div className="relative flex-1 min-h-0 rounded-lg bg-marble/5 overflow-hidden">
                    {tasks.map((t, idx) => {
                      const sh = parseInt(t.t.split(":")[0]), sm = parseInt(t.t.split(":")[1]);
                      const top = ((sh + sm / 60 - 8) / 13) * 100;
                      const h = (t.dur / 13) * 100;
                      return (
                        <div key={idx} className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-[8px] text-storm leading-tight overflow-hidden" style={{ top: `${top}%`, height: `${h}%`, background: `${COLOR[t.cat]}55`, borderLeft: `2px solid ${COLOR[t.cat]}` }}>
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-marble/10 overflow-hidden">
                    <div className="h-full transition-all duration-700" style={{ width: `${load}%`, background: SAND }} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">{DAYS[sel - 1]} · {selTasks.length} TAKEN</p>
            <div className="flex flex-wrap gap-2">
              {selTasks.map((t, i) => (
                <span key={i} className="flex items-center gap-2 rounded-full border border-marble/20 bg-marble/5 px-3 py-1 text-[11px] text-storm">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLOR[t.cat] }} />{t.t} {t.title}
                </span>
              ))}
              {selTasks.length === 0 && <span className="text-storm/40 text-xs">Geen taken — vrije dag.</span>}
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}