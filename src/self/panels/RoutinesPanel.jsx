import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { todayRoutines, completedToday, fmtTime, fmtDuration } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK, timeForPref, toMin } from "@/glass/components/self/palette";
import { Play, Check, SkipForward, Plus, ArrowUpRight, Flame } from "lucide-react";

const START = 6, END = 24;
const toPct = (time) => ((toMin(time) - START * 60) / ((END - START) * 60)) * 100;
const wPct = (dur) => ((dur || 30) / 60) / (END - START) * 100;
const HOURS = [6, 9, 12, 15, 18, 21, 24];
const circ = (r) => 2 * Math.PI * r;

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
  const upcoming = useMemo(() => today.filter((r) => r.status !== "completed").slice(0, 5), [today]);
  const bestStreak = useMemo(() => routines.reduce((max, r) => Math.max(max, r.streak_count || 0), 0), [routines]);

  const complete = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "completed", last_done: new Date().toISOString(), streak_count: (routines.find((r) => r.id === id)?.streak_count || 0) + 1 }); await load(); } catch { /* ignore */ } };
  const skip = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "skipped", streak_count: 0 }); await load(); } catch { /* ignore */ } };

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      await base44.entities.SelfRoutine.create({ title: form.title.trim(), frequency: form.frequency, preferred_time: form.preferred_time, duration_min: Number(form.duration_min) || 15, status: "active", agent_source: "manual" });
      setForm({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const pct = today.length ? Math.round((done.length / today.length) * 100) : 0;
  const r = 30, c = circ(r);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const ROUTINES = today.map((rt) => ({
    time: timeForPref(rt.preferred_time),
    label: rt.title.toUpperCase().slice(0, 14),
    dur: rt.duration_min || 30,
    done: rt.status === "completed",
    current: rt.status !== "completed" && toMin(timeForPref(rt.preferred_time)) <= toMin(nowTime),
    id: rt.id,
  })).sort((a, b) => toMin(a.time) - toMin(b.time));

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Routines</SectionLabel>
        <div className="flex items-center gap-4 mt-1">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke={TRACK} strokeWidth="5" />
              <circle cx="36" cy="36" r={r} fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-ivory text-lg font-bold tabular-nums leading-none">{done.length}/{today.length || 0}</span>
              <span className="text-ivory/40 text-[8px] tracking-wider mt-0.5">DONE</span>
            </div>
          </div>
          <div>
            <h2 className="text-[28px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{done.length} / {today.length}</h2>
            <p className="text-sm text-ivory/55 italic">{today.length ? `${today.length - done.length} resterend` : "Geen routines vandaag"}</p>
          </div>
        </div>
        <button onClick={() => navigate("/self/routines")} className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Routines <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Timeline */}
      <div className="glass-card-2 rounded-2xl p-4">
        <div className="relative h-20">
          <div className="absolute top-0 left-0 right-0 flex justify-between text-ivory/40 text-[9px] tabular-nums">
            {HOURS.map((h) => <span key={h}>{String(h).padStart(2, "0")}</span>)}
          </div>
          <div className="absolute top-4 left-0 right-0 h-px bg-ivory/15" />
          <div className="absolute top-3 bottom-0 w-px" style={{ left: `${Math.max(0, Math.min(100, toPct(nowTime)))}%`, background: SAND }}>
            <span className="absolute -top-0.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: SAND }} />
          </div>
          <div className="absolute top-6 bottom-1 left-0 right-0">
            {ROUTINES.length ? ROUTINES.map((rt, i) => (
              <div key={rt.id || i}
                className={`absolute h-5 rounded-md flex items-center px-1.5 ${rt.current ? "text-charcoal animate-pulse" : rt.done ? "text-charcoal" : "text-ivory/50 border border-ivory/15"}`}
                style={{ left: `${Math.max(0, toPct(rt.time))}%`, width: `${Math.max(8, wPct(rt.dur))}%`, top: `${i * 10}px`, background: rt.current ? SAND : rt.done ? BLUE : "rgba(255,255,255,0.06)" }}
              >
                <span className="text-[8px] font-medium tracking-wide truncate">{rt.label}</span>
              </div>
            )) : <p className="text-ivory/40 text-xs">Geen routines vandaag.</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-1 text-[9px] tracking-wider">
          <span className="flex items-center gap-1 text-ivory/70"><span className="w-2 h-2 rounded-sm" style={{ background: BLUE }} />DONE</span>
          <span className="flex items-center gap-1" style={{ color: SAND }}><span className="w-2 h-2 rounded-sm" style={{ background: SAND }} />NOW</span>
          <span className="flex items-center gap-1 text-ivory/40"><span className="w-2 h-2 rounded-sm border border-ivory/20" />UPCOMING</span>
        </div>
      </div>

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Volgende</p>
          <div className="flex flex-col gap-1.5">
            {upcoming.slice(0, 3).map((rt) => (
              <div key={rt.id} className="glass-card-2 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-ivory/55 w-12">{fmtTime(timeForPref(rt.preferred_time))}</span>
                <p className="text-sm font-medium truncate flex-1">{rt.title}</p>
                <span className="text-[10px] text-ivory/45">{fmtDuration(rt.duration_min)}</span>
                <button onClick={() => complete(rt.id)} className="h-6 w-6 rounded-full glass-button flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></button>
                <button onClick={() => skip(rt.id)} className="h-6 w-6 rounded-full glass-button flex items-center justify-center shrink-0"><SkipForward className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      {bestStreak > 0 && (
        <div className="glass-card-2 rounded-2xl p-3.5 flex items-center gap-3">
          <Flame className="w-5 h-5" style={{ color: SAND }} />
          <div>
            <p className="text-sm font-semibold">Beste streak: {bestStreak} dagen</p>
            <p className="text-[11px] text-ivory/45">{routines.filter((r) => (r.streak_count || 0) >= 3).length} routines met streak ≥ 3</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Routine" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Volgende" icon={Play} onClick={() => upcoming[0] && complete(upcoming[0].id)} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/routines")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
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
      )}
    </div>
  );
}