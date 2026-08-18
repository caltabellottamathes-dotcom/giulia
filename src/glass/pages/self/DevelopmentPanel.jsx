import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";

const POS = ["top", "right", "bottom", "left"];

export default function DevelopmentPanel() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SelfGoal.list().then((g) => setGoals(g || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);
  const areas = useMemo(() => {
    const map = new Map();
    for (const g of active) { const a = g.area || "Algemeen"; if (!map.has(a)) map.set(a, []); map.get(a).push(g); }
    return Array.from(map.entries());
  }, [active]);

  const NODES = areas.slice(0, 4).map(([name, items], i) => {
    const avg = Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length);
    const stalled = items.every((g) => (g.progress || 0) < 15);
    const status = stalled ? "STALLED" : avg >= 50 ? "MOVING" : "ACTIVE";
    return { label: name.toUpperCase(), pos: POS[i], status, progress: avg, sub: `${items.length} doelen` };
  });

  const addGoal = async () => {
    try { await base44.entities.SelfGoal.create({ title: "Nieuw doel", type: "goal", status: "active", progress: 0 }); const g = await base44.entities.SelfGoal.list(); setGoals(g || []); } catch { /* ignore */ }
  };
  const recordProgress = async () => {
    const g = active[0];
    if (!g) return;
    try { await base44.entities.SelfGoal.update(g.id, { progress: Math.min(100, (g.progress || 0) + 10) }); const list = await base44.entities.SelfGoal.list(); setGoals(list || []); } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="06" section="DEVELOPMENT" statement="LADEN…">{null}</PanelShell>;

  const tone = { MOVING: BLUE, ACTIVE: SAND, STALLED: "rgba(255,255,255,0.4)" };

  function Node({ n }) {
    const cls = { top: "top-0 left-1/2 -translate-x-1/2", bottom: "bottom-0 left-1/2 -translate-x-1/2", left: "left-0 top-1/2 -translate-y-1/2", right: "right-0 top-1/2 -translate-y-1/2" }[n.pos];
    return (
      <div className={`absolute ${cls} w-44`}>
        <div className="rounded-2xl border border-marble/25 bg-marble/5 px-4 py-3">
          <p className="text-storm text-base font-semibold">{n.label}</p>
          <p className="text-[10px] tracking-[0.2em] mt-0.5" style={{ color: tone[n.status] }}>{n.status}</p>
          <div className="mt-2.5 h-1.5 rounded-full bg-marble/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${n.progress}%`, background: tone[n.status] }} />
          </div>
          <p className="text-storm/50 text-[10px] mt-2">{n.sub}</p>
        </div>
      </div>
    );
  }

  return (
    <PanelShell
      index="06"
      section={`DEVELOPMENT · ${NODES.length} ACTIVE AREAS`}
      statement={NODES.length ? `${NODES.length} ACTIVE AREAS` : "GEEN GEBIEDEN"}
      context={[
        { label: "MOVING", text: areas.filter(([n, items]) => items.some((g) => (g.progress || 0) >= 50)).length ? "Eén of meer gebieden tonen voortgang." : "Nog geen zichtbare voortgang." },
        { label: "STALLED", text: areas.filter(([n, items]) => items.every((g) => (g.progress || 0) < 15)).length ? "Eén of meer gebieden zijn stil komen te staan." : "Geen stilstand." },
        { label: "NEXT", text: active[0] ? `Volgende stap: ${active[0].title}.` : "Voeg een doel toe." },
      ]}
      actions={[
        { label: "Add Goal", primary: true, onClick: addGoal },
        { label: "Record Progress", onClick: recordProgress },
        { label: "Open Development", to: "/self/personal-development" },
      ]}
    >
      <div className="relative w-full max-w-2xl mx-auto h-[420px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 420" preserveAspectRatio="none">
          <line x1="240" y1="60" x2="240" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="240" y1="210" x2="240" y2="360" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="60" y1="210" x2="240" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="240" y1="210" x2="420" y2="210" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="240" cy="210" r="44" fill="none" stroke="rgba(225,231,239,0.4)" strokeWidth="1" />
          <circle cx="240" cy="210" r="60" fill="none" stroke="rgba(225,231,239,0.2)" strokeWidth="1" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <span className="block w-7 h-7 rounded-full" style={{ background: SAND, boxShadow: "0 0 0 12px rgba(216,218,179,0.15)" }} />
          <span className="text-storm/40 text-[9px] tracking-[0.2em] mt-3">NOW</span>
        </div>
        {NODES.map((n) => <Node key={n.label} n={n} />)}
        {NODES.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-storm/40 text-sm">Voeg doelen toe met een gebied om dit te vullen.</p>}
      </div>

      <div className="flex justify-center gap-6 mt-2">
        {Object.entries(tone).map(([k, v]) => (
          <span key={k} className="flex items-center gap-2 text-[10px] tracking-wider uppercase">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: v }} />
            <span style={{ color: v }}>{k}</span>
          </span>
        ))}
      </div>
    </PanelShell>
  );
}