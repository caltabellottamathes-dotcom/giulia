import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, Progress } from "@/system/panels/previewParts";
import { goalStatusColor, goalStatusLabel, goalTypeLabel, fmtDate } from "@/lib/selfUtils";
import { Plus, Target, ArrowUpRight, Award, BookOpen, TrendingUp } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const SUBNAV = [
  { key: "", label: "Gebieden" },
  { key: "?tab=goals", label: "Doelen" },
  { key: "?tab=growth", label: "Milestones" },
  { key: "?tab=learning", label: "Leren" },
  { key: "?tab=timeline", label: "Tijdlijn" },
];

/** Personal Development panel — actieve gebieden, doelen en voortgang. */
export default function PersonalDevelopmentPanel() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "goal", area: "" });

  const load = async () => {
    try { const list = await base44.entities.SelfGoal.list().catch(() => []); setGoals(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);
  const areas = useMemo(() => {
    const map = new Map();
    for (const g of active) { const a = g.area || "Algemeen"; if (!map.has(a)) map.set(a, []); map.get(a).push(g); }
    return Array.from(map.entries()).slice(0, 4);
  }, [active]);
  const milestones = useMemo(() => active.filter((g) => g.type === "milestone"), [active]);
  const learning = useMemo(() => active.filter((g) => g.type === "learning"), [active]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.SelfGoal.create({ title: form.title.trim(), type: form.type, area: form.area || undefined, status: "active" }); setForm({ title: "", type: "goal", area: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const updateProgress = async (g) => { try { await base44.entities.SelfGoal.update(g.id, { progress: Math.min(100, (g.progress || 0) + 10) }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Personal Development</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} actief</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{areas.length} ontwikkelgebieden · {milestones.length} milestones</p>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {SUBNAV.map((s) => (
            <button key={s.key} onClick={() => navigate(`/self/personal-development${s.key}`)} className="text-[11px] uppercase tracking-[0.16em] font-medium text-ivory/45 hover:text-ivory transition-colors border-b border-transparent hover:border-ivory/30 pb-0.5">
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active areas */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Actieve gebieden</p>
        {areas.length ? (
          <div className="flex flex-col gap-2">
            {areas.map(([name, items]) => {
              const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
              return (
                <Card key={name} accent={SAGE} onClick={() => navigate("/self/personal-development")}>
                  <div className="mb-1.5">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <p className="text-[11px] text-ivory/45">{items.length} doelen · {goalTypeLabel(items[0].type)}</p>
                  </div>
                  <Progress value={avg} accent={SAGE} />
                </Card>
              );
            })}
          </div>
        ) : <Empty text="Geen actieve doelen." />}
      </div>

      {/* Learning */}
      {learning.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Leren</p>
          <div className="flex flex-col gap-1.5">
            {learning.slice(0, 3).map((g) => (
              <div key={g.id} className="flex items-center justify-between glass-card-2 rounded-xl px-3.5 py-2.5">
                <p className="text-sm font-medium truncate">{g.title}</p>
                <span className="text-[10px] tabular-nums text-ivory/55">{g.progress || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Doel" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Milestone" icon={Award} onClick={() => navigate("/self/personal-development?tab=growth")} />
          <ActionBtn label="Leren" icon={BookOpen} onClick={() => navigate("/self/personal-development?tab=learning")} />
          <ActionBtn label="Voortgang" icon={TrendingUp} onClick={() => updateProgress(active[0])} />
          <ActionBtn label="Doelen" icon={Target} onClick={() => navigate("/self/personal-development?tab=goals")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/personal-development")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Doel naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
              {["development", "goal", "milestone", "learning", "activity"].map((t) => <option key={t} value={t} className="text-charcoal">{goalTypeLabel(t)}</option>)}
            </select>
            <input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Ontwikkelgebied" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}