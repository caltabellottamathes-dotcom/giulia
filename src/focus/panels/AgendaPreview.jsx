import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot, LiveBarChart } from "@/self/components/SelfViz";
import DomainChip from "@/life/components/DomainChip";
import { DOMAIN_HEX } from "@/lib/domainUtils";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const PXMIN = 1.05;
const iso = (d) => d.toISOString().slice(0, 10);
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function AgendaPreview({ onOpen }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", time: "09:00" });

  const load = useCallback(async () => {
    try { const data = await base44.entities.Event.list("start").catch(() => []); setEvents(data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shift = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(d); };
  const dIso = iso(date);
  const dayEvents = useMemo(() => events.filter((e) => (e.start || "").slice(0, 10) === dIso).sort((a, b) => (a.start || "").localeCompare(b.start || "")), [events, dIso]);
  const upcoming = useMemo(() => { const now = Date.now(); return events.filter((e) => new Date(e.start).getTime() >= now).sort((a, b) => (a.start || "").localeCompare(b.start || "")).slice(0, 6); }, [events]);
  const weekCount = useMemo(() => { const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(start.getTime() + 7 * 86400000); return events.filter((e) => { const t = new Date(e.start).getTime(); return t >= start.getTime() && t < end.getTime(); }).length; }, [events]);

  // Weekly distribution chart data
  const weekStart = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d; }, []);
  const weekData = useMemo(() => DAYS.map((d, i) => { const day = new Date(weekStart); day.setDate(weekStart.getDate() + i); const count = events.filter((e) => (e.start || "").slice(0, 10) === iso(day)).length; return { label: d, count }; }), [events, weekStart]);

  const topFor = (start) => { const d = new Date(start); const h = d.getHours() + d.getMinutes() / 60; return Math.max(0, (h - 7)) * 60 * PXMIN; };
  const dur = (e) => { if (!e.start || !e.end) return 30; return Math.max(15, Math.round((new Date(e.end) - new Date(e.start)) / 60000)); };
  const now = new Date();
  const nowMin = (now.getHours() - 7) * 60 + now.getMinutes();
  const showNow = dIso === iso(now) && now.getHours() >= 7 && now.getHours() <= 20;

  const addEvent = async () => {
    if (!form.title.trim()) return;
    const start = new Date(`${dIso}T${form.time}:00`);
    const end = new Date(start.getTime() + 30 * 60000);
    try { await base44.entities.Event.create({ title: form.title.trim(), start: start.toISOString(), end: end.toISOString() }); setForm({ title: "", time: "09:00" }); setAdding(false); await load(); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Agenda</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{dayEvents.length} vandaag</h2>
            {dayEvents.length > 0 && <PulseDot color={FOCUS.light} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{weekCount} afspraken deze week</p>
        </div>
        <OpenLink to="/agenda" label="Open Agenda" color={FOCUS.light} />
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ivory text-sm font-medium capitalize min-w-[180px] text-center">{date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(new Date())} className="text-ivory/60 hover:text-ivory text-xs">Vandaag</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-charcoal transition" style={{ background: FOCUS.light }}><Plus className="w-3.5 h-3.5" /> Afspraak</motion.button>
        </div>
      </div>

      {/* Quick add */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Titel</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Afspraak met…" className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="text-ivory/55 text-[10px] uppercase tracking-wide block mb-1.5">Tijd</label>
                <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory outline-none" />
              </div>
              <button onClick={addEvent} disabled={!form.title.trim()} className="h-10 px-4 rounded-xl text-charcoal text-sm font-semibold disabled:opacity-50 transition" style={{ background: FOCUS.light }}>Toevoegen</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week distribution chart */}
      <div className="glass-card-2 rounded-2xl p-5">
        <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Deze week · verdeling</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1000}>
              {weekData.map((d, i) => <Cell key={i} fill={d.label === DAYS[(new Date().getDay() + 6) % 7] ? FOCUS.urgent : FOCUS.mid} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Main grid — day timeline + upcoming */}
      <div className="grid lg:grid-cols-5 gap-5">
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
                <motion.div className="absolute left-9 right-0 flex items-center" style={{ top: nowMin * PXMIN }} animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: FOCUS.urgent }} />
                  <div className="flex-1 h-px" style={{ background: `${FOCUS.urgent}60` }} />
                </motion.div>
              )}
              {dayEvents.map((e) => (
                <motion.div key={e.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} onClick={onOpen} className="absolute left-12 right-1 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-1.5 overflow-hidden flex gap-2 cursor-pointer hover:bg-white/12 transition-colors" style={{ top: topFor(e.start), height: Math.max(dur(e) * PXMIN, 34) }}>
                  <div className="w-1 rounded-full shrink-0" style={{ background: e.domain ? DOMAIN_HEX[e.domain] : FOCUS.mid }} />
                  <div className="min-w-0">
                    <p className="text-ivory text-xs font-medium leading-tight truncate">{e.title}</p>
                    <p className="text-ivory/50 text-[10px] tabular-nums mt-0.5">{new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{e.location ? ` · ${e.location}` : ""}</p>
                  </div>
                </motion.div>
              ))}
              {!loading && dayEvents.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-ivory/40 text-sm">Vrij — niets gepland</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
              <p className="text-ivory/55 text-xs">Vandaag</p>
              <p className="text-ivory text-2xl font-display font-semibold mt-1"><CountUp value={dayEvents.length} /></p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4">
              <p className="text-ivory/55 text-xs">Deze week</p>
              <p className="text-ivory text-2xl font-display font-semibold mt-1"><CountUp value={weekCount} /></p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 flex-1">
            <SectionLabel>Komende afspraken</SectionLabel>
            {loading ? <Empty text="Laden…" /> : upcoming.length ? (
              <div className="mt-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto -mr-2 pr-2">
                {upcoming.map((e) => { const d = new Date(e.start); return (
                  <motion.div key={e.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onClick={onOpen} className="flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-11 shrink-0 rounded-lg bg-white/[0.06] py-1">
                      <span className="text-ivory/55 text-[9px] uppercase leading-none">{MONTHS[d.getMonth()]}</span>
                      <span className="text-ivory text-base font-semibold leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><p className="text-ivory text-sm font-medium truncate">{e.title}</p>{e.domain && <DomainChip domain={e.domain} size="xs" />}</div>
                      <p className="text-ivory/50 text-xs flex items-center gap-1.5"><Clock className="w-3 h-3" />{d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{e.location ? <><MapPin className="w-3 h-3 ml-1" />{e.location}</> : null}</p>
                    </div>
                  </motion.div>
                ); })}
              </div>
            ) : <Empty text="Niets op komst" />}
          </div>
        </div>
      </div>

      {/* Context + Actions */}
      <ContextGrid items={[
        { label: "VANDAAG", text: `${dayEvents.length} afspraken gepland vandaag.` },
        { label: "DEZE WEEK", text: `${weekCount} afspraken in de komende 7 dagen.` },
        { label: "VOLGENDE", text: upcoming[0] ? `${upcoming[0].title} · ${new Date(upcoming[0].start).toLocaleString("nl-NL", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : "Niets op komst." },
      ]} />
      <ActionRow actions={[
        { label: "Nieuwe Afspraak", primary: true, color: FOCUS.light, onClick: () => setAdding((v) => !v) },
        { label: "Open Agenda", to: "/agenda" },
      ]} />
    </div>
  );
}