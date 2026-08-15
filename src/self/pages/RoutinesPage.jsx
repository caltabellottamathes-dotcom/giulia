import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Progress, Stat } from "@/system/panels/previewParts";
import { todayRoutines, completedToday, routineStatusColor, routineStatusLabel, fmtTime, fmtDuration, streakLabel, fmtDate } from "@/lib/selfUtils";
import { Repeat, Plus, Search, Sliders, Play, Check, SkipForward, Flame, ArrowUpRight } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "routines", label: "Routines" },
  { key: "today", label: "Today" },
  { key: "progress", label: "Progress" },
  { key: "streaks", label: "Streaks" },
  { key: "editor", label: "Routine Editor" },
];

export default function RoutinesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "routines");
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15, frequency_days: 1 });

  const load = async () => {
    try { const list = await base44.entities.SelfRoutine.list().catch(() => []); setRoutines(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => todayRoutines(routines), [routines]);
  const done = useMemo(() => completedToday(routines), [routines]);
  const active = useMemo(() => routines.filter((r) => r.status === "active"), [routines]);
  const withStreaks = useMemo(() => routines.filter((r) => (r.streak_count || 0) >= 2).sort((a, b) => (b.streak_count || 0) - (a.streak_count || 0)), [routines]);

  const complete = async (id) => {
    try {
      const r = routines.find((x) => x.id === id);
      await base44.entities.SelfRoutine.update(id, { status: "completed", last_done: new Date().toISOString(), streak_count: (r?.streak_count || 0) + 1 });
      await load();
    } catch { /* ignore */ }
  };
  const skip = async (id) => { try { await base44.entities.SelfRoutine.update(id, { status: "skipped", streak_count: 0 }); await load(); } catch { /* ignore */ } };

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      const next = new Date(); next.setDate(next.getDate() + (Number(form.frequency_days) || 1));
      await base44.entities.SelfRoutine.create({
        title: form.title.trim(), frequency: form.frequency, preferred_time: form.preferred_time,
        duration_min: Number(form.duration_min) || 15, frequency_days: Number(form.frequency_days) || 1,
        status: "active", next_due: next.toISOString().slice(0, 10), streak_count: 0, agent_source: "manual",
      });
      setForm({ title: "", frequency: "daily", preferred_time: "morning", duration_min: 15, frequency_days: 1 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/self/routines?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-routines" image={IMAGES.selfRoutines} icon={Repeat} eyebrow="SELF" title="Routines" subtitle="Dagelijkse en terugkerende gewoontes"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Routine</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Routine toevoegen</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Naam" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["daily", "weekly", "monthly", "custom"].map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={form.preferred_time} onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["morning", "afternoon", "evening", "night"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--self-primary))" }}><Plus className="h-4 h-4" /> Voeg toe</button>
        </GlassPanel>
      )}

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab2(t.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition" style={tab === t.key ? { background: SAGE, color: "hsl(var(--self-primary))" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : (
        <>
          {tab === "routines" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.length ? active.map((r) => (
                <GlassPanel key={r.id} level={2} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold" style={{ color: routineStatusColor(r.status) }}>{routineStatusLabel(r.status)}</p>
                      <h3 className="text-xl font-display font-semibold mt-1">{r.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{fmtTime(r.preferred_time)} · {fmtDuration(r.duration_min)} · {r.frequency}</p>
                    </div>
                    {r.streak_count > 0 && <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: SAGE }}><Flame className="w-3 h-3" /> {r.streak_count}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => complete(r.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ivory" style={{ background: "hsl(var(--self-primary))" }}><Check className="w-3.5 h-3.5" /> Voltooi</button>
                    <button onClick={() => skip(r.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-border"><SkipForward className="w-3.5 h-3.5" /> Skip</button>
                  </div>
                </GlassPanel>
              )) : <Empty text="Geen actieve routines." />}
            </div>
          )}

          {tab === "today" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Vandaag" value={`${done.length} / ${today.length}`} accent={SAGE} />
                <Stat label="Resterend" value={today.length - done.length} accent="hsl(var(--self-accent-deep))" />
              </div>
              <div className="space-y-2">
                {today.length ? today.map((r) => (
                  <Card key={r.id} accent={routineStatusColor(r.status)}>
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: r.status === "completed" ? SAGE : "transparent", border: r.status === "completed" ? "none" : "1px solid rgba(255,255,255,0.3)" }} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${r.status === "completed" ? "line-through opacity-50" : ""}`}>{r.title}</p>
                        <p className="text-[11px] text-muted-foreground">{fmtTime(r.preferred_time)} · {fmtDuration(r.duration_min)}</p>
                      </div>
                      {r.status !== "completed" && (
                        <button onClick={() => complete(r.id)} className="h-7 w-7 rounded-full glass-button flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </Card>
                )) : <Empty text="Geen routines vandaag." />}
              </div>
            </div>
          )}

          {tab === "progress" && (
            <div className="space-y-6">
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Voortgang deze week</p>
                <div className="space-y-3">
                  {active.slice(0, 10).map((r) => (
                    <div key={r.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{r.title}</span>
                        <span className="text-[11px] text-muted-foreground">{routineStatusLabel(r.status)} · streak {streakLabel(r.streak_count)}</span>
                      </div>
                      <Progress value={r.status === "completed" ? 100 : 0} accent={SAGE} />
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          )}

          {tab === "streaks" && (
            <div className="space-y-4">
              {withStreaks.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {withStreaks.map((r) => (
                    <GlassPanel key={r.id} level={2} className="p-5 text-center">
                      <Flame className="w-8 h-8 mx-auto mb-2" style={{ color: SAGE }} />
                      <p className="text-3xl font-display font-semibold">{r.streak_count}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{fmtDate(r.last_done) === "—" ? "nog niet gestart" : `laatst: ${fmtDate(r.last_done)}`}</p>
                    </GlassPanel>
                  ))}
                </div>
              ) : <Empty text="Nog geen streaks — voltooi routines meerdere dagen." />}
            </div>
          )}

          {tab === "editor" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Bewerk je routines — frequentie, tijd, duur en koppelingen.</p>
              <div className="space-y-2">
                {routines.length ? routines.map((r) => (
                  <Card key={r.id} accent={routineStatusColor(r.status)} onClick={() => navigate("/self/routines")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground">{r.frequency} · {fmtTime(r.preferred_time)} · {fmtDuration(r.duration_min)}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Card>
                )) : <Empty text="Geen routines om te bewerken." />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}