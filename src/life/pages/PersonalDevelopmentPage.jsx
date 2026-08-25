import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Stat, Progress } from "@/system/panels/previewParts";
import { goalStatusColor, goalStatusLabel, goalTypeLabel, fmtDate } from "@/lib/selfUtils";
import { Target, Plus, Search, Sliders, Award, BookOpen, TrendingUp, ArrowUpRight } from "lucide-react";
import TherapyPanel from "@/self/panels/TherapyPanel";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "development", label: "Development" },
  { key: "goals", label: "Goals" },
  { key: "growth", label: "Growth" },
  { key: "learning", label: "Learning" },
  { key: "therapy", label: "Therapy" },
];

export default function PersonalDevelopmentPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "development");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "goal", area: "", deadline: "" });

  const load = async () => {
    try { const list = await base44.entities.SelfGoal.list().catch(() => []); setGoals(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);
  const areas = useMemo(() => {
    const map = new Map();
    for (const g of active) { const a = g.area || "Algemeen"; if (!map.has(a)) map.set(a, []); map.get(a).push(g); }
    return Array.from(map.entries());
  }, [active]);
  const milestones = useMemo(() => active.filter((g) => g.type === "milestone"), [active]);
  const learning = useMemo(() => active.filter((g) => g.type === "learning"), [active]);
  const regularGoals = useMemo(() => active.filter((g) => g.type === "goal" || g.type === "development"), [active]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.SelfGoal.create({ title: form.title.trim(), type: form.type, area: form.area || undefined, deadline: form.deadline || undefined, status: "active", progress: 0 }); setForm({ title: "", type: "goal", area: "", deadline: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const updateProgress = async (g) => { try { await base44.entities.SelfGoal.update(g.id, { progress: Math.min(100, (g.progress || 0) + 10) }); await load(); } catch { /* ignore */ } };
  const setTab2 = (t) => { setTab(t); navigate(`/life/development?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-development" image={IMAGES.selfDevelopment} icon={Target} eyebrow="LIFE" title="Becoming Me." subtitle="Groei, doelen en leren"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Doel</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Doel toevoegen</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Naam" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["development", "goal", "milestone", "learning", "activity"].map((t) => <option key={t} value={t}>{goalTypeLabel(t)}</option>)}
            </select>
            <input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Gebied" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
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
          {tab === "development" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areas.length ? areas.map(([name, items]) => {
                  const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
                  return (
                    <GlassPanel key={name} level={2} className="p-5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Ontwikkelgebied</p>
                      <h3 className="text-xl font-display font-semibold mt-1">{name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{items.length} doelen</p>
                      <div className="mt-3"><Progress value={avg} accent={SAGE} /></div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">{avg}% gemiddeld</p>
                    </GlassPanel>
                  );
                }) : <Empty text="Geen ontwikkelgebieden." />}
              </div>
            </div>
          )}

          {tab === "goals" && (
            <div className="space-y-2">
              {regularGoals.length ? regularGoals.map((g) => (
                <Card key={g.id} accent={goalStatusColor(g.status)} onClick={() => updateProgress(g)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{g.title}</p>
                      <p className="text-[11px] text-muted-foreground">{g.area || "—"} · {goalStatusLabel(g.status)}{g.deadline ? ` · ${fmtDate(g.deadline)}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-display font-semibold tabular-nums" style={{ color: SAGE }}>{g.progress || 0}%</span>
                    </div>
                  </div>
                </Card>
              )) : <Empty text="Geen actieve doelen." />}
            </div>
          )}

          {tab === "growth" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.length ? milestones.map((m) => (
                <GlassPanel key={m.id} level={2} className="p-5">
                  <Award className="w-5 h-5 mb-2" style={{ color: SAGE }} />
                  <h3 className="text-lg font-display font-semibold">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{m.area || "—"}</p>
                  <div className="mt-3"><Progress value={m.progress} accent={SAGE} /></div>
                </GlassPanel>
              )) : <Empty text="Geen milestones." />}
            </div>
          )}

          {tab === "learning" && (
            <div className="space-y-2">
              {learning.length ? learning.map((g) => (
                <Card key={g.id} accent={SAGE} onClick={() => updateProgress(g)}>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 shrink-0" style={{ color: SAGE }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{g.title}</p>
                      <p className="text-[11px] text-muted-foreground">{g.area || "—"}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: SAGE }}>{g.progress || 0}%</span>
                  </div>
                </Card>
              )) : <Empty text="Geen leerdoelen — voeg er een toe." />}
            </div>
          )}

          {tab === "therapy" && (
            <div className="rounded-[28px] bg-charcoal p-6 text-ivory">
              <TherapyPanel />
            </div>
          )}
        </>
      )}
    </div>
  );
}