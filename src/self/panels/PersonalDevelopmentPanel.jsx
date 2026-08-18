import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { goalStatusLabel, goalTypeLabel } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { Plus, ArrowUpRight, Award, TrendingUp, Target } from "lucide-react";

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
        <button onClick={() => navigate("/self/personal-development")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Development <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Active areas — node-style cards with progress bars */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Actieve gebieden</p>
        {areas.length ? (
          <div className="flex flex-col gap-2">
            {areas.map(([name, items], idx) => {
              const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
              const stalled = items.every((g) => (g.progress || 0) < 15);
              const tone = stalled ? "rgba(255,255,255,0.35)" : avg >= 50 ? BLUE : SAND;
              const status = stalled ? "STALLED" : avg >= 50 ? "MOVING" : "ACTIVE";
              return (
                <div key={name} className="glass-card-2 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <span className="text-[9px] tracking-[0.15em] font-semibold" style={{ color: tone }}>{status}</span>
                  </div>
                  <p className="text-[10px] text-ivory/45 mb-2">{items.length} doelen · {goalTypeLabel(items[0].type)}</p>
                  <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${avg}%`, background: tone }} />
                  </div>
                  <p className="text-ivory/50 text-[10px] mt-1.5 tabular-nums">{avg}%</p>
                </div>
              );
            })}
          </div>
        ) : <Empty text="Geen actieve doelen." />}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Doel" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Voortgang" icon={TrendingUp} onClick={() => active[0] && updateProgress(active[0])} />
          <ActionBtn label="Milestone" icon={Award} onClick={() => navigate("/self/personal-development?tab=growth")} />
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
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}