import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { todayRoutines, completedToday, fmtTime, fmtDuration } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK, timeForPref, toMin } from "@/glass/components/self/palette";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/life/components/SelfViz";
import { Check, SkipForward, Plus, Flame } from "lucide-react";

const START = 6, END = 24;
const toPct = (time) => ((toMin(time) - START * 60) / ((END - START) * 60)) * 100;
const wPct = (dur) => ((dur || 30) / 60) / (END - START) * 100;
const HOURS = [6, 9, 12, 15, 18, 21, 24];

export default function RoutinesPanel() {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15 });

  const load = async () => {
    try { const list = await base44.entities.SelfRoutine.list().catch(() => []); setRoutines(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => todayRoutines(routines), [routines]);
  const done = useMemo(() => completedToday(routines), [routines]);
  const bestStreak = useMemo(() => routines.reduce((max, r) => Math.max(max, r.streak_count || 0), 0), [routines]);

  const complete = async (id) => { try { const r = routines.find((x) => x.id === id); await base44.entities.SelfRoutine.update(id, { status: "completed", last_done: new Date().toISOString(), streak_count: (r?.streak_count || 0) + 1 }); await load(); } catch { /* ignore */ } };
  const skip = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "skipped", streak_count: 0 }); await load(); } catch { /* ignore */ } };

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.SelfRoutine.create({ title: form.title.trim(), frequency: form.frequency, preferred_time: form.preferred_time, duration_min: Number(form.duration_min) || 15, status: "active", agent_source: "manual" }); setForm({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15 }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const pct = today.length ? Math.round((done.length / today.length) * 100) : 0;
  const nowTime = new Date().toTimeString().slice(0, 5);
  const ROUTINES = today.map((rt) => ({
    time: timeForPref(rt.preferred_time), label: rt.title.toUpperCase().slice(0, 16), dur: rt.duration_min || 30,
    done: rt.status === "completed", current: rt.status !== "completed" && toMin(timeForPref(rt.preferred_time)) <= toMin(nowTime), id: rt.id,
  })).sort((a, b) => toMin(a.time) - toMin(b.time));
  const currentRt = ROUTINES.find((x) => x.current);
  const pendingRt = ROUTINES.find((x) => !x.done && toMin(x.time) > toMin(nowTime));

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Routines</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{done.length} / {today.length}</h2>
            {currentRt && <PulseDot color={SAND} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{today.length ? `${today.length - done.length} resterend vandaag` : "Geen routines vandaag"}</p>
        </div>
        <OpenLink to="/life/household?tab=selfcare" label="Open Routines" />
      </div>

      {/* Progress ring + description */}
      <div className="flex items-center gap-6">
        <AnimatedRing pct={pct} size={120} stroke={8} color={BLUE}>
          <span className="text-ivory text-2xl font-bold tabular-nums leading-none"><CountUp value={done.length} />/<CountUp value={today.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">VOLTOOID</span>
        </AnimatedRing>
        <p className="text-ivory/60 text-sm leading-relaxed max-w-sm">De dag loopt in routines. {today.length ? `${today.length} gepland, ${today.length - done.length} te gaan.` : "Niets gepland vandaag — voeg er een toe."}</p>
      </div>

      {/* Timeline */}
      <div className="glass-card-2 rounded-2xl p-5">
        <div className="relative h-28">
          <div className="absolute top-0 left-0 right-0 flex justify-between text-ivory/40 text-[10px] tabular-nums">
            {HOURS.map((h) => <span key={h}>{String(h).padStart(2, "0")}</span>)}
          </div>
          <div className="absolute top-5 left-0 right-0 h-px bg-ivory/15" />
          <motion.div className="absolute top-4 bottom-0 w-px" style={{ left: `${Math.max(0, Math.min(100, toPct(nowTime)))}%`, background: SAND }}
            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{ background: SAND }} />
          </motion.div>
          <div className="absolute top-7 bottom-2 left-0 right-0">
            {ROUTINES.length ? ROUTINES.map((rt, i) => (
              <motion.div key={rt.id || i} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                className={`absolute h-7 rounded-lg flex items-center px-2 ${rt.current ? "text-charcoal animate-pulse" : rt.done ? "text-charcoal" : "text-ivory/50 border border-ivory/15"}`}
                style={{ left: `${Math.max(0, toPct(rt.time))}%`, width: `${Math.max(10, wPct(rt.dur))}%`, top: `${i * 12}px`, background: rt.current ? SAND : rt.done ? BLUE : "rgba(255,255,255,0.06)" }}>
                <span className="text-[9px] font-medium tracking-wide truncate">{rt.label}</span>
              </motion.div>
            )) : <p className="text-ivory/40 text-xs px-2">Geen routines vandaag.</p>}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] tracking-wider">
          <span className="flex items-center gap-1.5 text-ivory/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />DONE</span>
          <span className="flex items-center gap-1.5" style={{ color: SAND }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: SAND }} />NOW</span>
          <span className="flex items-center gap-1.5 text-ivory/40"><span className="w-2.5 h-2.5 rounded-sm border border-ivory/20" />UPCOMING</span>
        </div>
      </div>

      {/* Streak */}
      {bestStreak > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card-2 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="w-5 h-5" style={{ color: SAND }} />
          <div>
            <p className="text-sm font-semibold">Beste streak: {bestStreak} dagen</p>
            <p className="text-[11px] text-ivory/45">{routines.filter((r) => (r.streak_count || 0) >= 3).length} routines met streak ≥ 3</p>
          </div>
        </motion.div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "CURRENT", text: currentRt?.label ? `${currentRt.label} — nu` : "Geen actieve routine op dit moment." },
        { label: "NEXT", text: pendingRt?.label ? `${pendingRt.label} om ${pendingRt.time}.` : "Geen routines meer vandaag." },
        { label: "PROGRESS", text: `${done.length} van ${today.length} routines voltooid vandaag.` },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Complete", primary: true, onClick: () => { const next = today.find((r) => r.status !== "completed"); if (next) complete(next.id); } },
        { label: "Skip", onClick: () => { const next = today.find((r) => r.status !== "completed"); if (next) skip(next.id); } },
        { label: "Add Routine", onClick: () => setShowAdd((v) => !v) },
        { label: "Open Routines", to: "/self/routines" },
      ]} />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Routine naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
              <div className="flex gap-2">
                <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                  {["daily", "weekly", "monthly", "custom"].map((f) => <option key={f} value={f} className="text-charcoal">{f}</option>)}
                </select>
                <select value={form.preferred_time} onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                  {["morning", "afternoon", "evening", "night"].map((t) => <option key={t} value={t} className="text-charcoal">{t}</option>)}
                </select>
                <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="w-20 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none" />
              </div>
              <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}