import React, { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react";
import { SectionLabel, Empty } from "./previewParts";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7..20
const PXMIN = 1.05;
const iso = (d) => d.toISOString().slice(0, 10);
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** Agenda module paneel — een echt bruikbaar dag-agenda: datumnavigatie,
 *  snelle afspraak-toevoeging, dag-tijdlijn + komende afspraken. GIULIA-glass. */
export default function AgendaPreview({ onOpen }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", time: "09:00" });

  const load = useCallback(async () => {
    try {
      const data = await base44.entities.Event.list("start").catch(() => []);
      setEvents(data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shift = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(d); };
  const dIso = iso(date);
  const dayEvents = useMemo(
    () => events.filter((e) => (e.start || "").slice(0, 10) === dIso).sort((a, b) => (a.start || "").localeCompare(b.start || "")),
    [events, dIso]
  );
  const upcoming = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => new Date(e.start).getTime() >= now).sort((a, b) => (a.start || "").localeCompare(b.start || "")).slice(0, 6);
  }, [events]);
  const weekCount = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 7 * 86400000);
    return events.filter((e) => { const t = new Date(e.start).getTime(); return t >= start.getTime() && t < end.getTime(); }).length;
  }, [events]);

  const topFor = (start) => { const d = new Date(start); const h = d.getHours() + d.getMinutes() / 60; return Math.max(0, (h - 7)) * 60 * PXMIN; };
  const dur = (e) => { if (!e.start || !e.end) return 30; return Math.max(15, Math.round((new Date(e.end) - new Date(e.start)) / 60000)); };
  const now = new Date();
  const nowMin = (now.getHours() - 7) * 60 + now.getMinutes();
  const showNow = dIso === iso(now) && now.getHours() >= 7 && now.getHours() <= 20;

  const addEvent = async () => {
    if (!form.title.trim()) return;
    const start = new Date(`${dIso}T${form.time}:00`);
    const end = new Date(start.getTime() + 30 * 60000);
    try {
      await base44.entities.Event.create({ title: form.title.trim(), start: start.toISOString(), end: end.toISOString() });
      setForm({ title: "", time: "09:00" });
      setAdding(false);
      await load();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      {/* Date navigator */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ivory text-sm font-medium capitalize min-w-[180px] text-center">{date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(new Date())} className="text-ivory/60 hover:text-ivory text-xs">Vandaag</button>
          <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full bg-sand text-charcoal px-3 py-1.5 text-xs font-semibold hover:brightness-105 transition"><Plus className="w-3.5 h-3.5" /> Afspraak</button>
        </div>
      </div>

      {/* Quick add */}
      {adding && (
        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex flex-col sm:flex-row gap-3 sm:items-end animate-fade-up">
          <div className="flex-1">
            <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Titel</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Afspraak met…" className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Tijd</label>
            <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory outline-none" />
          </div>
          <button onClick={addEvent} disabled={!form.title.trim()} className="h-10 px-4 rounded-xl bg-ivory text-charcoal text-sm font-semibold disabled:opacity-50 hover:brightness-105 transition">Toevoegen</button>
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Day timeline */}
        <div className="lg:col-span-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Vandaag</SectionLabel>
            <span className="text-ivory/45 text-[10px] tabular-nums">{dayEvents.length} afspraak{dayEvents.length !== 1 ? "en" : ""}</span>
          </div>
          <div className="relative overflow-y-auto" style={{ maxHeight: 360 }}>
            <div className="relative" style={{ height: HOURS.length * 60 * PXMIN }}>
              {HOURS.map((h, i) => (
                <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: i * 60 * PXMIN }}>
                  <span className="w-10 text-ivory/45 text-[10px] tabular-nums">{String(h).padStart(2, "0")}:00</span>
                  <div className="flex-1 h-px bg-ivory/10" />
                </div>
              ))}
              {showNow && (
                <div className="absolute left-9 right-0 flex items-center" style={{ top: nowMin * PXMIN }}>
                  <div className="w-2 h-2 rounded-full bg-sand" />
                  <div className="flex-1 h-px bg-sand/60" />
                </div>
              )}
              {dayEvents.map((e) => (
                <div key={e.id} onClick={onOpen} className="absolute left-12 right-1 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-1.5 overflow-hidden flex gap-2 cursor-pointer hover:bg-white/12 transition-colors" style={{ top: topFor(e.start), height: Math.max(dur(e) * PXMIN, 34) }}>
                  <div className="w-1 rounded-full shrink-0 bg-sand" />
                  <div className="min-w-0">
                    <p className="text-ivory text-xs font-medium leading-tight truncate">{e.title}</p>
                    <p className="text-ivory/50 text-[10px] tabular-nums mt-0.5">{new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{e.location ? ` · ${e.location}` : ""}</p>
                  </div>
                </div>
              ))}
              {!loading && dayEvents.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-ivory/40 text-sm">Vrij — niets gepland</p>}
            </div>
          </div>
        </div>

        {/* Right column — stats + upcoming */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
              <p className="text-ivory/55 text-xs">Vandaag</p>
              <p className="text-ivory text-2xl font-display font-semibold mt-1">{dayEvents.length}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
              <p className="text-ivory/55 text-xs">Deze week</p>
              <p className="text-ivory text-2xl font-display font-semibold mt-1">{weekCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 flex-1">
            <SectionLabel>Komende afspraken</SectionLabel>
            {loading ? <Empty text="Laden…" /> : upcoming.length ? (
              <div className="mt-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto -mr-2 pr-2">
                {upcoming.map((e) => {
                  const d = new Date(e.start);
                  return (
                    <div key={e.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-11 shrink-0 rounded-lg bg-white/[0.06] py-1">
                        <span className="text-ivory/55 text-[9px] uppercase leading-none">{MONTHS[d.getMonth()]}</span>
                        <span className="text-ivory text-base font-semibold leading-none mt-0.5">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm font-medium truncate">{e.title}</p>
                        <p className="text-ivory/50 text-xs flex items-center gap-1.5"><Clock className="w-3 h-3" />{d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{e.location ? <><MapPin className="w-3 h-3 ml-1" />{e.location}</> : null}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty text="Niets op komst" />}
          </div>
        </div>
      </div>
    </div>
  );
}