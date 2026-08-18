import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { therapyStatusLabel, fmtDate, fmtTime } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { Plus, Calendar, ArrowUpRight, FileText, Target } from "lucide-react";

function TrajectoryMini({ name, progress, notes }) {
  const nodes = ["START", "MID", "NOW", "NEXT"];
  const currentIdx = progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 25 ? 1 : 0;
  return (
    <div className="glass-card-2 rounded-2xl p-4">
      <p className="text-ivory/80 text-[9px] uppercase tracking-[0.2em] mb-3 font-semibold truncate">{name}</p>
      <div className="relative flex items-center justify-between px-2">
        <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-ivory/15 -translate-y-1/2" />
        {nodes.map((n, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 z-10">
              <span className={`w-3 h-3 rounded-full border-2 ${current ? "animate-pulse" : ""}`} style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.25)" }} />
              <span className={`text-[7px] tracking-wide ${current ? "" : done ? "text-ivory/60" : "text-ivory/35"}`} style={current ? { color: SAND } : {}}>{n}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-ivory/35 text-[8px] tracking-wider px-2">
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
      setTrajectories(list || []);
      setEvents(evs || []);
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

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Therapy</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} actief</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{nextAppt ? `Volgende: ${fmtDate(nextAppt.start)} ${fmtTime(nextAppt.start)}` : "Geen afspraak gepland"}</p>
        <button onClick={() => navigate("/self/therapy")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Therapy <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Goals / Notes stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass-card-2 rounded-2xl px-4 py-3.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Open doelen</span>
          <span className="text-2xl font-display font-semibold text-ivory tabular-nums" style={{ color: BLUE }}>{totalGoals}</span>
        </div>
        <div className="glass-card-2 rounded-2xl px-4 py-3.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Notities</span>
          <span className="text-2xl font-display font-semibold text-ivory tabular-nums" style={{ color: SAND }}>{totalNotes}</span>
        </div>
      </div>

      {/* Trajectory progress */}
      {active.length ? (
        <div className="flex flex-col gap-2">
          {active.slice(0, 2).map((t) => (
            <TrajectoryMini key={t.id} name={t.title.toUpperCase()} progress={t.progress || 0} notes={t.notes} />
          ))}
        </div>
      ) : <Empty text="Geen actieve trajecten." />}

      {/* Next appointment */}
      {nextAppt && (
        <div className="glass-card-2 rounded-2xl px-5 py-4 flex items-center gap-4 border-l-2" style={{ borderColor: SAND }}>
          <div className="text-center">
            <p className="text-3xl font-bold leading-none" style={{ color: SAND }}>{fmtDate(nextAppt.start).split(" ")[0]}</p>
            <p className="text-ivory text-sm font-semibold tabular-nums mt-1">{fmtTime(nextAppt.start)}</p>
          </div>
          <div className="h-12 w-px bg-ivory/15" />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: SAND }}>Next appointment</p>
            <p className="text-ivory text-sm font-medium mt-1 truncate">{nextAppt.title}</p>
            <p className="text-ivory/50 text-xs mt-0.5 truncate">{nextAppt.location || "—"}</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Traject" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Afspraak" icon={Calendar} onClick={() => navigate("/self/therapy?tab=appointments")} />
          <ActionBtn label="Notitie" icon={FileText} onClick={() => navigate("/self/therapy?tab=notes")} />
          <ActionBtn label="Doel" icon={Target} onClick={() => navigate("/self/therapy?tab=goals")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/therapy")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Traject naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
              {["therapy", "coaching", "counseling", "support", "other"].map((t) => <option key={t} value={t} className="text-charcoal">{therapyStatusLabel(t) || t}</option>)}
            </select>
            <input value={form.therapist_name} onChange={(e) => setForm((f) => ({ ...f, therapist_name: e.target.value }))} placeholder="Therapeut naam" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}