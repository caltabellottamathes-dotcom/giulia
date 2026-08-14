import React, { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7..19
const PXMIN = 1.2;
const iso = (d) => d.toISOString().slice(0, 10);

/** Agenda — dagweergave (naar /slick/dagplanning), GIULIA-glass met live events. */
export default function DayView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Event.list("start").catch(() => []);
        setEvents(data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const dayEvents = useMemo(
    () => events.filter((e) => (e.start || "").slice(0, 10) === iso(date)).sort((a, b) => (a.start || "").localeCompare(b.start || "")),
    [events, date]
  );
  const shift = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(d); };
  const topFor = (start) => { const d = new Date(start); const h = d.getHours() + d.getMinutes() / 60; return Math.max(0, (h - 7)) * 60 * PXMIN; };
  const dur = (e) => { if (!e.start || !e.end) return 30; return Math.max(15, Math.round((new Date(e.end) - new Date(e.start)) / 60000)); };

  const now = new Date();
  const nowMin = (now.getHours() - 7) * 60 + now.getMinutes();
  const showNow = iso(date) === iso(now) && now.getHours() >= 7 && now.getHours() <= 19;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ivory text-sm font-medium capitalize">{date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setDate(new Date())} className="text-ivory/60 hover:text-ivory text-xs">Vandaag</button>
      </div>

      <div className="relative" style={{ height: HOURS.length * 60 * PXMIN }}>
        {HOURS.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: i * 60 * PXMIN }}>
            <span className="w-12 text-ivory/50 text-[10px] tabular-nums">{String(h).padStart(2, "0")}:00</span>
            <div className="flex-1 h-px bg-ivory/12" />
          </div>
        ))}
        {showNow && (
          <div className="absolute left-10 right-0 flex items-center" style={{ top: nowMin * PXMIN }}>
            <div className="w-2 h-2 rounded-full bg-sand" />
            <div className="flex-1 h-px bg-sand/60" />
          </div>
        )}
        {dayEvents.map((e) => (
          <div key={e.id} className="absolute left-14 right-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 overflow-hidden flex gap-2" style={{ top: topFor(e.start), height: Math.max(dur(e) * PXMIN, 36) }}>
            <div className="w-1 rounded-full shrink-0 bg-sand" />
            <div className="min-w-0">
              <p className="text-ivory text-xs font-medium leading-tight truncate">{e.title}</p>
              <p className="text-ivory/50 text-[10px] tabular-nums mt-0.5">{new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{e.location ? ` · ${e.location}` : ""}</p>
            </div>
          </div>
        ))}
        {!loading && dayEvents.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-ivory/40 text-sm">Geen afspraken op deze dag</p>
        )}
      </div>
    </div>
  );
}