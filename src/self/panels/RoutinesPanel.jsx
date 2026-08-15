import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, Progress } from "@/system/panels/previewParts";
import { todayRoutines, completedToday, routineStatusColor, routineStatusLabel, fmtTime, fmtDuration, streakLabel } from "@/lib/selfUtils";
import { Play, Check, SkipForward, Pause, Edit, ArrowUpRight, Plus, Flame } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

/** Routines panel — vandaag overzicht met snelle bediening. */
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

  const complete = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "completed", last_done: new Date().toISOString() }); await load(); } catch { /* ignore */ } };
  const skip = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "skipped" }); await load(); } catch { /* ignore */ } };
  const pause = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "paused" }); await load(); } catch { /* ignore */ } };

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      await base44.entities.SelfRoutine.create({ title: form.title.trim(), frequency: form.frequency, preferred_time: form.preferred_time, duration_min: Number(form.duration_min) || 15, status: "active", agent_source: "manual" });
      setForm({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Routines</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{done.length} / {today.length}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{today.length ? `${today.length - done.length} resterend vandaag` : "Geen routines vandaag"}</p>
      </div>

      {/* Today */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Vandaag</p>
        {upcoming.length ? (
          <div className="flex flex-col gap-2">
            {upcoming.map((r) => (
              <Card key={r.id} accent={routineStatusColor(r.status)} onClick={() => navigate("/self/routines")}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <p className="text-[11px] text-ivory/45">{fmtTime(r.preferred_time)} · {fmtDuration(r.duration_min)} · {routineStatusLabel(r.status)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); complete(r.id); }} className="h-7 w-7 rounded-full glass-button flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); skip(r.id); }} className="h-7 w-7 rounded-full glass-button flex items-center justify-center shrink-0"><SkipForward className="w-3.5 h-3.5" /></button>
                </div>
              </Card>
            ))}
          </div>
        ) : done.length ? <Empty text="Alles vandaag voltooid." /> : <Empty text="Geen routines vandaag." />}
      </div>

      {/* Streaks */}
      {bestStreak > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Streaks</p>
          <div className="glass-card-2 rounded-2xl p-4 flex items-center gap-3">
            <Flame className="w-5 h-5" style={{ color: SAGE }} />
            <div>
              <p className="text-sm font-semibold">Beste streak: {streakLabel(bestStreak)}</p>
              <p className="text-[11px] text-ivory/45">{routines.filter((r) => (r.streak_count || 0) >= 3).length} routines met streak ≥ 3</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Routine" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Bewerk" icon={Edit} onClick={() => navigate("/self/routines?tab=editor")} />
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
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}