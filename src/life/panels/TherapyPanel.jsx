import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { therapyStatusLabel, fmtDate, fmtTime } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { ContextGrid, ActionRow, OpenLink } from "@/life/components/SelfViz";
import { Plus, Calendar, ArrowLeft } from "lucide-react";

function TrajectoryViz({ name, progress, notes }) {
  const nodes = ["START", "MID", "NOW", "NEXT"];
  const currentIdx = progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 25 ? 1 : 0;
  return (
    <div className="glass-card-2 rounded-2xl p-5">
      <p className="text-ivory/80 text-[10px] uppercase tracking-[0.22em] mb-5 font-semibold truncate">{name}</p>
      <div className="relative flex items-center justify-between px-4">
        <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-ivory/15 -translate-y-1/2" />
        {nodes.map((n, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-3 z-10">
              <motion.span className={`w-5 h-5 rounded-full border-2 ${current ? "animate-pulse" : ""}`}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}
                style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.24)" }} />
              <span className={`text-[10px] tracking-wide ${current ? "" : done ? "text-ivory/70" : "text-ivory/40"}`} style={current ? { color: SAND } : {}}>{n}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-ivory/40 text-[9px] tracking-wider px-4">
        <span>0%</span><span>{notes?.length || 0}N</span><span>{progress || 0}%</span><span>—</span>
      </div>
    </div>
  );
}

export default function TherapyPanel() {
  const navigate = useNavigate();
  const [trajectories, setTrajectories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "therapy", therapist_name: "" });

  const load = async () => {
    try {
      const [list, evs] = await Promise.all([
        base44.entities.TherapyTrajectory.list().catch(() => []),
        base44.entities.CalendarEvent.filter({ domain: "self" }).catch(() => []),
      ]);
      setTrajectories(list || []); setEvents(evs || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const nextAppt = useMemo(() => {
    const all = (events || []).filter((e) => e.therapy_trajectory_id || active.some((t) => (t.event_ids || []).includes(e.id)));
    const future = all.filter((e) => e.start && new Date(e.start) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start));
    return future[0] || null;
  }, [events, active]);
  const totalGoals = useMemo(() => active.reduce((n, t) => n + (t.goals?.length || 0), 0), [active]);
  const totalNotes = useMemo(() => active.reduce((n, t) => n + (t.notes?.length || 0), 0), [active]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.TherapyTrajectory.create({ title: form.title.trim(), type: form.type, therapist_name: form.therapist_name || undefined, status: "active" }); setForm({ title: "", type: "therapy", therapist_name: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const upcoming = (events || []).filter((e) => e.therapy_trajectory_id || active.some((t) => (t.event_ids || []).includes(e.id))).filter((e) => e.start && new Date(e.start) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Therapy</SectionLabel>
          <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} actief</h2>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{nextAppt ? `Volgende: ${fmtDate(nextAppt.start)} ${fmtTime(nextAppt.start)}` : "Geen afspraak gepland"}</p>
        </div>
        <OpenLink to="/life/daily-state?tab=therapy" label="Open Therapy" />
      </div>

      {/* Goals / Notes stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card-2 rounded-2xl px-5 py-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Open doelen</span>
          <span className="text-3xl font-display font-semibold tabular-nums" style={{ color: BLUE }}><CountUp value={totalGoals} /></span>
        </div>
        <div className="glass-card-2 rounded-2xl px-5 py-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Notities</span>
          <span className="text-3xl font-display font-semibold tabular-nums" style={{ color: SAND }}><CountUp value={totalNotes} /></span>
        </div>
      </div>

      {/* Trajectory progress — full glass visualization */}
      {active.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {active.slice(0, 2).map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <TrajectoryViz name={t.title.toUpperCase()} progress={t.progress || 0} notes={t.notes} />
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Geen actieve trajecten." />}

      {/* Next appointment — full glass card */}
      {nextAppt && (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="glass-card-2 rounded-2xl px-6 py-6 flex items-center gap-6 border-l-4" style={{ borderColor: SAND }}>
          <div className="text-center">
            <p className="text-5xl font-bold leading-none" style={{ color: SAND }}>{fmtDate(nextAppt.start).split(" ")[0]}</p>
            <p className="text-ivory text-2xl font-semibold tabular-nums mt-2">{fmtTime(nextAppt.start)}</p>
          </div>
          <div className="h-16 w-px bg-ivory/15" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: SAND }}>Next appointment</p>
            <p className="text-ivory text-lg font-medium mt-2 truncate">{nextAppt.title}</p>
            <p className="text-ivory/50 text-sm mt-1 truncate">{nextAppt.location || "—"}</p>
          </div>
        </motion.div>
      )}

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-5">
          <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em] mb-4">Upcoming</p>
          <div className="flex flex-col gap-3">
            {upcoming.map((u, i) => {
              const trj = active.find((t) => t.id === u.therapy_trajectory_id);
              return (
                <motion.div key={u.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center justify-between">
                  <span className="text-ivory text-sm font-medium">{fmtDate(u.start)} · {fmtTime(u.start)}</span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: BLUE, color: "#2D2D23" }}>{trj?.title?.slice(0, 8) || "TRJ"}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "CURRENT", text: active[0] ? `${active[0].title} — ${active[0].therapist_name || "therapeut"}.` : "Geen actieve trajecten." },
        { label: "RECENT", text: active[0]?.notes?.length ? `Laatste notitie: ${active[0].notes[active[0].notes.length - 1]}` : "Nog geen notities." },
        { label: "NEXT", text: nextAppt ? `${fmtDate(nextAppt.start)} · ${fmtTime(nextAppt.start)}` : "Geen afspraak gepland." },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Add Note", onClick: async () => { const t = active[0]; if (!t) return; await base44.entities.TherapyTrajectory.update(t.id, { notes: [...(t.notes || []), "Nieuwe notitie"] }); await load(); } },
        { label: "Add Appointment", primary: true, to: "/life/daily-state?tab=therapy" },
        { label: "Open Therapy", to: "/life/daily-state?tab=therapy" },
      ]} />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Traject naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
              <div className="flex gap-2">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                  {["therapy", "coaching", "counseling", "support", "other"].map((t) => <option key={t} value={t} className="text-charcoal">{therapyStatusLabel(t) || t}</option>)}
                </select>
                <input value={form.therapist_name} onChange={(e) => setForm((f) => ({ ...f, therapist_name: e.target.value }))} placeholder="Therapeut naam" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
              </div>
              <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}