import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { goalStatusLabel, goalTypeLabel } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { Plus, TrendingUp, Target, Award } from "lucide-react";

const POS = ["top", "right", "bottom", "left"];

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
    return Array.from(map.entries());
  }, [active]);
  const milestones = useMemo(() => active.filter((g) => g.type === "milestone"), [active]);

  const NODES = areas.slice(0, 4).map(([name, items], i) => {
    const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
    const stalled = items.every((g) => (g.progress || 0) < 15);
    const status = stalled ? "STALLED" : avg >= 50 ? "MOVING" : "ACTIVE";
    return { label: name.toUpperCase(), pos: POS[i], status, progress: avg, sub: `${items.length} doelen`, tone: stalled ? "rgba(255,255,255,0.4)" : avg >= 50 ? BLUE : SAND };
  });

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.SelfGoal.create({ title: form.title.trim(), type: form.type, area: form.area || undefined, status: "active" }); setForm({ title: "", type: "goal", area: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const updateProgress = async (g) => { try { await base44.entities.SelfGoal.update(g.id, { progress: Math.min(100, (g.progress || 0) + 10) }); await load(); } catch { /* ignore */ } };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const movingCount = areas.filter(([n, items]) => items.some((g) => (g.progress || 0) >= 50)).length;
  const stalledCount = areas.filter(([n, items]) => items.every((g) => (g.progress || 0) < 15)).length;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Personal Development</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{active.length} actief</h2>
            {movingCount > 0 && <PulseDot color={BLUE} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{areas.length} ontwikkelgebieden · {milestones.length} milestones</p>
        </div>
        <OpenLink to="/life/development" label="Open Development" />
      </div>

      {/* Node diagram — full glass visualization */}
      <div className="glass-card-2 rounded-2xl p-6">
        <p className="text-ivory/50 text-[10px] uppercase tracking-[0.22em] mb-4">{NODES.length} active areas</p>
        <div className="relative w-full max-w-lg mx-auto h-72">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 280" preserveAspectRatio="none">
            <line x1="240" y1="50" x2="240" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="240" y1="140" x2="240" y2="230" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="60" y1="140" x2="240" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="240" y1="140" x2="420" y2="140" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <motion.circle cx="240" cy="140" r="30" fill="none" stroke={SAND} strokeWidth="1" initial={{ scale: 0 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: "240px 140px" }} />
            <circle cx="240" cy="140" r="44" fill="none" stroke="rgba(225,231,239,0.3)" strokeWidth="1" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="block w-8 h-8 rounded-full" style={{ background: SAND, boxShadow: "0 0 0 16px rgba(216,218,179,0.12)" }} />
            <span className="text-ivory/40 text-[9px] tracking-[0.2em] mt-3">NOW</span>
          </div>
          {NODES.map((n, i) => {
            const cls = { top: "top-0 left-1/2 -translate-x-1/2", bottom: "bottom-0 left-1/2 -translate-x-1/2", left: "left-0 top-1/2 -translate-y-1/2", right: "right-0 top-1/2 -translate-y-1/2" }[n.pos];
            return (
              <motion.div key={n.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12 }} className={`absolute ${cls} w-40`}>
                <div className="rounded-2xl border border-ivory/15 bg-ivory/5 px-4 py-3">
                  <p className="text-ivory text-sm font-semibold truncate">{n.label}</p>
                  <p className="text-[10px] tracking-[0.18em] mt-0.5" style={{ color: n.tone }}>{n.status}</p>
                  <div className="mt-2.5 h-1.5 rounded-full bg-ivory/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: n.tone }} initial={{ width: 0 }} animate={{ width: `${n.progress}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.12 }} />
                  </div>
                  <p className="text-ivory/50 text-[10px] mt-2">{n.sub}</p>
                </div>
              </motion.div>
            );
          })}
          {NODES.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-ivory/40 text-sm">Voeg doelen toe met een gebied om dit te vullen.</p>}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {[
            { l: "MOVING", c: BLUE }, { l: "ACTIVE", c: SAND }, { l: "STALLED", c: "rgba(255,255,255,0.4)" },
          ].map((x) => (
            <span key={x.l} className="flex items-center gap-2 text-[10px] tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: x.c }} />
              <span style={{ color: x.c }}>{x.l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Active areas list */}
      {areas.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Alle gebieden</p>
          <div className="flex flex-col gap-2">
            {areas.map(([name, items], i) => {
              const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
              const stalled = items.every((g) => (g.progress || 0) < 15);
              const tone = stalled ? "rgba(255,255,255,0.35)" : avg >= 50 ? BLUE : SAND;
              return (
                <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card-2 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold truncate">{name}</p>
                    <span className="text-[9px] tracking-[0.15em] font-semibold" style={{ color: tone }}>{stalled ? "STALLED" : avg >= 50 ? "MOVING" : "ACTIVE"}</span>
                  </div>
                  <p className="text-[10px] text-ivory/45 mb-2">{items.length} doelen · {goalTypeLabel(items[0].type)}</p>
                  <div className="h-2 rounded-full bg-ivory/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: tone }} initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.06 }} />
                  </div>
                  <p className="text-ivory/50 text-[10px] mt-1.5 tabular-nums">{avg}%</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "MOVING", text: movingCount ? "Eén of meer gebieden tonen voortgang." : "Nog geen zichtbare voortgang." },
        { label: "STALLED", text: stalledCount ? "Eén of meer gebieden zijn stil komen te staan." : "Geen stilstand." },
        { label: "NEXT", text: active[0] ? `Volgende stap: ${active[0].title}.` : "Voeg een doel toe." },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Add Goal", primary: true, onClick: () => setShowAdd((v) => !v) },
        { label: "Record Progress", onClick: () => active[0] && updateProgress(active[0]) },
        { label: "Open Development", to: "/self/personal-development" },
      ]} />

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4 space-y-2.5">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Doel naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
              <div className="flex gap-2">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
                  {["development", "goal", "milestone", "learning", "activity"].map((t) => <option key={t} value={t} className="text-charcoal">{goalTypeLabel(t)}</option>)}
                </select>
                <input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder="Ontwikkelgebied" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
              </div>
              <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 w-4" /> Voeg toe</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}