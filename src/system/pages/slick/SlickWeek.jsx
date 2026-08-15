import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell, GlassButton, Divider, CATEGORY_HEX } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const DAYSHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function startOfWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
const iso = (d) => d.toISOString().slice(0, 10);

export default function Weekplanning() {
  const [ref, setRef] = useState(new Date("2026-08-17"));
  const weekStart = startOfWeek(ref);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const tasksByDay = useMemo(() => {
    const map = {};
    days.forEach((d) => (map[iso(d)] = []));
    TASKS.forEach((t) => { if (map[t.date]) map[t.date].push(t); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [ref]);
  const weekEnd = days[6];
  const shift = (n) => { const d = new Date(ref); d.setDate(d.getDate() + n * 7); setRef(d); };
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Planning</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Weekplanning</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-marble/30 bg-marble/10 text-marble hover:bg-marble/20 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-storm text-sm font-medium">{weekStart.getDate()} {weekStart.toLocaleDateString("nl-NL", { month: "long" })} – {weekEnd.getDate()} {weekEnd.toLocaleDateString("nl-NL", { month: "long" })} {weekEnd.getFullYear()}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-marble/30 bg-marble/10 text-marble hover:bg-marble/20 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setRef(new Date())} className="text-marble/70 hover:text-storm text-xs">Vandaag</button>
      </div>

      <Divider className="mb-5" />

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {days.map((d, i) => {
            const items = tasksByDay[iso(d)] || [];
            const isToday = iso(d) === todayIso;
            return (
              <div key={i} className="rounded-2xl border border-marble/20 bg-marble/5 p-3 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-marble/60 text-[11px]">{DAYSHORT[i]}</span>
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-urgent text-metal" : "text-storm"}`}>{d.getDate()}</span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {items.length === 0 && <span className="text-marble/30 text-[10px] mt-2">—</span>}
                  {items.map((t) => (
                    <div key={t.id} className="rounded-lg bg-marble/10 px-2 py-1.5 border-l-2" style={{ borderColor: CATEGORY_HEX[t.category] }}>
                      <p className="text-storm text-[11px] font-medium leading-tight truncate">{t.title}</p>
                      <p className="text-marble/50 text-[9px] tabular-nums mt-0.5">{t.time} · {t.duration}min</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}