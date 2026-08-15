import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell, GlassButton, Divider, CATEGORY_HEX } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7..19
const PXMIN = 1.2;
const iso = (d) => d.toISOString().slice(0, 10);

export default function Dagplanning() {
  const [date, setDate] = useState(new Date("2026-08-14"));
  const dayTasks = useMemo(
    () => TASKS.filter((t) => t.date === iso(date)).sort((a, b) => a.time.localeCompare(b.time)),
    [date]
  );
  const shift = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(d); };
  const topFor = (time) => { const [h, m] = time.split(":").map(Number); return (h - 7) * 60 * PXMIN + m * PXMIN; };

  const now = new Date();
  const nowMin = (now.getHours() - 7) * 60 + now.getMinutes();
  const showNow = iso(date) === iso(now) && now.getHours() >= 7 && now.getHours() <= 19;

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Planning</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Dagplanning</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-marble/30 bg-marble/10 text-marble hover:bg-marble/20 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-storm text-sm font-medium capitalize">{date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-marble/30 bg-marble/10 text-marble hover:bg-marble/20 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setDate(new Date())} className="text-marble/70 hover:text-storm text-xs">Vandaag</button>
      </div>

      <Divider className="mb-5" />

      <div className="relative" style={{ height: HOURS.length * 60 * PXMIN }}>
        {HOURS.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: i * 60 * PXMIN }}>
            <span className="w-12 text-marble/50 text-[10px] tabular-nums">{String(h).padStart(2, "0")}:00</span>
            <div className="flex-1 h-px bg-marble/15" />
          </div>
        ))}

        {showNow && (
          <div className="absolute left-10 right-0 flex items-center" style={{ top: nowMin * PXMIN }}>
            <div className="w-2 h-2 rounded-full bg-urgent" />
            <div className="flex-1 h-px bg-urgent/60" />
          </div>
        )}

        {dayTasks.map((t) => (
          <div
            key={t.id}
            className="absolute left-14 right-2 rounded-xl border border-marble/20 bg-marble/10 px-3 py-1.5 overflow-hidden flex gap-2"
            style={{ top: topFor(t.time), height: Math.max(t.duration * PXMIN, 36) }}
          >
            <div className="w-1 rounded-full shrink-0" style={{ background: CATEGORY_HEX[t.category] }} />
            <div className="min-w-0">
              <p className="text-storm text-xs font-medium leading-tight truncate">{t.title}</p>
              <p className="text-marble/50 text-[10px] tabular-nums mt-0.5">{t.time} · {t.duration}min · {t.category}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}