import React, { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYSHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
function startOfWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
const iso = (d) => d.toISOString().slice(0, 10);

/** Agenda — weekweergave (naar /slick/weekplanning), GIULIA-glass met live events. */
export default function WeekView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Event.list("start").catch(() => []);
        setEvents(data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const weekStart = startOfWeek(ref);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const byDay = useMemo(() => {
    const map = {};
    days.forEach((d) => (map[iso(d)] = []));
    events.forEach((e) => {
      const d = (e.start || "").slice(0, 10);
      if (map[d]) map[d].push(e);
    });
    Object.values(map).forEach((a) => a.sort((x, y) => (x.start || "").localeCompare(y.start || "")));
    return map;
  }, [events, ref]);
  const weekEnd = days[6];
  const shift = (n) => { const d = new Date(ref); d.setDate(d.getDate() + n * 7); setRef(d); };
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ivory text-sm font-medium">{weekStart.getDate()} {weekStart.toLocaleDateString("nl-NL", { month: "long" })} – {weekEnd.getDate()} {weekEnd.toLocaleDateString("nl-NL", { month: "long" })} {weekEnd.getFullYear()}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setRef(new Date())} className="text-ivory/60 hover:text-ivory text-xs">Vandaag</button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[640px]">
          {days.map((d, i) => {
            const items = byDay[iso(d)] || [];
            const isToday = iso(d) === todayIso;
            return (
              <div key={i} className="rounded-2xl border border-white/15 bg-white/[0.04] p-3 min-h-[260px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ivory/55 text-[11px]">{DAYSHORT[i]}</span>
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-sand text-charcoal" : "text-ivory"}`}>{d.getDate()}</span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {loading ? (
                    <span className="text-ivory/30 text-[10px]">…</span>
                  ) : items.length === 0 ? (
                    <span className="text-ivory/30 text-[10px]">—</span>
                  ) : (
                    items.map((e) => (
                      <div key={e.id} className="rounded-lg bg-white/[0.06] border-l-2 px-2 py-1.5" style={{ borderColor: "hsl(var(--sand))" }}>
                        <p className="text-ivory text-[11px] font-medium leading-tight truncate">{e.title}</p>
                        <p className="text-ivory/50 text-[9px] tabular-nums mt-0.5">{new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}