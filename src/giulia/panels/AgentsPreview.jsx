import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, PulseWave, CountUp } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { GIULIA_AGENTS } from "@/lib/giuliaAgents";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNowStrict } from "date-fns";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3";

export default function AgentsPreview({ onOpen }) {
  const { toast } = useToast();
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(GIULIA_AGENTS[0].key);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const load = async () => { try { const data = await base44.entities.Activity.filter({}, "-created_date", 200); setActs(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); const unsub = base44.entities.Activity.subscribe(() => load()); return unsub; }, []);

  const byAgent = useMemo(() => { const m = {}; for (const a of acts) { (m[a.source] ||= []).push(a); } return m; }, [acts]);

  const runAll = async () => {
    setRunning(true);
    try { const res = await base44.functions.invoke("runGiuliaCycle", {}); const d = res.data || {}; const ok = (d.agents || []).filter(r => r.ok).length; const total = (d.agents || []).length; setLastRun({ ok, total, failed: ((d.agents || []).filter(r => !r.ok)).length }); toast({ title: "Cyclus voltooid", description: `${ok}/${total} agenten bijgewerkt` }); await load(); }
    catch { toast({ title: "Cyclus mislukt", variant: "destructive" }); } finally { setRunning(false); }
  };

  const current = GIULIA_AGENTS.find(a => a.key === active);
  const items = byAgent[active] || [];
  const totalActs = acts.length;

  return (
    <PreviewShell index="17" section="AGENTS" statement={`${GIULIA_AGENTS.length} AGENTEN`} kicker="GIULIA TEAM" accent={URG}
      context={[
        { label: "AGENTEN", text: `${GIULIA_AGENTS.length} actieve agenten in het systeem.` },
        { label: "ACTIVITEIT", text: `${totalActs} gebeurtenissen gelogd.` },
        { label: "LAATSTE", text: lastRun ? `Laatste cyclus: ${lastRun.ok}/${lastRun.total} geslaagd.` : "Nog geen cyclus gedraaid." },
      ]}
      actions={[{ label: running ? "Bezig…" : "Start Cyclus", primary: true, onClick: runAll }, { label: "Open Agenten", to: "/agents" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-storm/50 text-[10px] tracking-[0.25em]">ACTIVITEIT</p>
              <p className="text-storm text-3xl font-bold tabular-nums mt-1"><CountUp to={totalActs} /></p>
            </div>
            <AnimatedRing pct={running ? 100 : 0} size={56} stroke={5} color={URG} />
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CYCLUS · LIVE</p>
            <PulseWave color={URG} bars={16} height={32} />
          </div>
          <div className="space-y-1 overflow-auto pr-1 max-h-[200px]">
            {GIULIA_AGENTS.map(a => {
              const count = (byAgent[a.key] || []).length;
              const isActive = a.key === active;
              return (
                <button key={a.key} onClick={() => setActive(a.key)} className={"w-full text-left rounded-xl px-3 py-2.5 transition " + (isActive ? "glass-2 text-storm" : "text-storm/70 hover:bg-white/5")} style={isActive ? { borderLeft: `2px solid ${URG}` } : {}}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{a.label}</span>
                    {count > 0 && <span className="text-[10px] tabular-nums opacity-50">{count}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-storm text-sm font-semibold">{current?.label}</span>
            <span className="text-[10px] uppercase tracking-wider text-storm/40">{current?.role}</span>
          </div>
          {lastRun && (
            <div className="flex items-center gap-2 text-xs text-storm/60 mb-3">
              {lastRun.failed > 0 ? <AlertCircle className="h-3.5 w-3.5" style={{ color: URG }} /> : <Check className="h-3.5 w-3.5" style={{ color: URG }} />}
              <span>Laatste cyclus: {lastRun.ok}/{lastRun.total} agenten</span>
            </div>
          )}
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-sm">Nog niets gelogd — start een cyclus.</p> : items.slice(0, 20).map((a, i) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl px-4 py-3 border border-marble/20 bg-marble/5">
                <p className="text-sm text-storm leading-snug">{a.description}</p>
                <p className="text-[11px] text-storm/40 mt-1">{a.action ? a.action + " · " : ""}{(() => { try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); } catch { return ""; } })()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}