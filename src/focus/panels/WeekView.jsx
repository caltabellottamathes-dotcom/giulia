import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionLabel } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";

const DAYSHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
function startOfWeek(d) { const date = new Date(d); const day = (date.getDay() + 6) % 7; date.setDate(date.getDate() - day); date.setHours(0, 0, 0, 0); return date; }
const iso = (d) => d.toISOString().slice(0, 10);

export default function WeekView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState(new Date());

  useEffect(() => { (async () => { try { const data = await base44.entities.Event.list("start").catch(() => []); setEvents(data || []); } catch { /* ignore */ } finally { setLoading(false); } })(); }, []);

  const weekStart = startOfWeek(ref);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });
  const byDay = useMemo(() => { const map = {}; days.forEach((d) => (map[iso(d)] = [])); events.forEach((e) => { const d = (e.start || "").slice(0, 10); if (map[d]) map[d].push(e); }); Object.values(map).forEach((a) => a.sort((x, y) => (x.start || "").localeCompare(y.start || ""))); return map; }, [events, ref]);
  const weekEnd = days[6];
  const shift = (n) => { const d = new Date(ref); d.setDate(d.getDate() + n * 7); setRef(d); };
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekTotal = events.filter((e) => { const t = new Date(e.start).getTime(); return t >= weekStart.getTime() && t < weekEnd.getTime() + 86400000; }).length;
  const dayCounts = days.map((d) => (byDay[iso(d)] || []).length);
  const maxDay = Math.max(1, ...dayCounts);
  const pct = Math.round(((new Date().getDay() + 6) % 7 + 1) / 7 * 100);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Week Planning</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{weekTotal} deze week</h2>
            {weekTotal > 0 && <PulseDot color={FOCUS.mid} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{weekStart.getDate()} {weekStart.toLocaleDateString("nl-NL", { month: "long" })} – {weekEnd.getDate()} {weekEnd.toLocaleDateString("nl-NL", { month: "long" })}</p>
        </div>
        <OpenLink to="/planning" label="Open Planning" color={FOCUS.light} />
      </div>

      {/* Week progress ring */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={pct} size={120} stroke={8} color={FOCUS.mid}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={pct} />%</span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">VERLOPEN</span>
        </AnimatedRing>
        <div className="flex-1">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Belasting per dag</p>
          <div className="flex items-end gap-2 h-20">
            {dayCounts.map((v, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max(8, (v / maxDay) * 100)}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="flex-1 rounded-t-md flex flex-col justify-end gap-1">
                <div className="h-full rounded-t-md" style={{ background: i === (new Date().getDay() + 6) % 7 ? FOCUS.urgent : v ? FOCUS.mid : "rgba(255,255,255,0.1)" }} />
                <span className="text-[9px] text-center text-ivory/40">{DAYSHORT[i]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-ivory text-sm font-medium">{weekStart.getDate()} {weekStart.toLocaleDateString("nl-NL", { month: "long" })} – {weekEnd.getDate()} {weekEnd.toLocaleDateString("nl-NL", { month: "long" })} {weekEnd.getFullYear()}</span>
          <button onClick={() => shift(1)} className="p-2 rounded-full border border-white/15 glass-1 text-ivory/70 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <button onClick={() => setRef(new Date())} className="text-ivory/60 hover:text-ivory text-xs">Vandaag</button>
      </div>

      {/* Week grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[640px]">
          {days.map((d, i) => {
            const items = byDay[iso(d)] || [];
            const isToday = iso(d) === todayIso;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`rounded-2xl border p-3 min-h-[260px] flex flex-col ${isToday ? "border-white/30 bg-white/[0.08]" : "border-white/15 bg-white/[0.04]"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ivory/55 text-[11px]">{DAYSHORT[i]}</span>
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? "text-charcoal" : "text-ivory"}`} style={isToday ? { background: FOCUS.light } : {}}>{d.getDate()}</span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {loading ? <span className="text-ivory/30 text-[10px]">…</span> : items.length === 0 ? <span className="text-ivory/30 text-[10px]">—</span> : items.map((e) => (
                    <motion.div key={e.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-white/[0.06] border-l-2 px-2 py-1.5" style={{ borderColor: FOCUS.mid }}>
                      <p className="text-ivory text-[11px] font-medium leading-tight truncate">{e.title}</p>
                      <p className="text-ivory/50 text-[9px] tabular-nums mt-0.5">{new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ContextGrid items={[
        { label: "VERLOPEN", text: `${pct}% van de week al gepasseerd.` },
        { label: "BELASTING", text: dayCounts.indexOf(maxDay) >= 0 ? `${DAYSHORT[dayCounts.indexOf(maxDay)]} is de drukste dag — ${maxDay} afspraken.` : "Geen afspraken." },
        { label: "VRIJ", text: dayCounts.filter((c) => c === 0).length > 0 ? `${dayCounts.filter((c) => c === 0).length} dagen grotendeels open.` : "Geen vrije dagen." },
      ]} />
      <ActionRow actions={[
        { label: "Open Planning", primary: true, color: FOCUS.light, to: "/planning" },
      ]} />
    </div>
  );
}