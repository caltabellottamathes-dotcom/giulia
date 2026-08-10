import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Empty, SectionLabel } from "./previewParts";
import { GIULIA_AGENTS } from "@/lib/giuliaAgents";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

function when(a) {
  try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); }
  catch { return ""; }
}

/**
 * AgentsPreview — Niveau 02 onderdeelpaneel voor de Giulia-agenten.
 * Eén "Alles updaten"-knop start de handmatige cyclus (runGiuliaCycle).
 * Daarnaast een tab-lijst met elke agent; per tab zie je wat die agent deed
 * (Activity feed, gefilterd op source === agent.key).
 */
export default function AgentsPreview() {
  const { toast } = useToast();
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(GIULIA_AGENTS[0].key);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const load = async () => {
    try {
      const data = await base44.entities.Activity.filter({}, "-created_date", 200);
      setActs(data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // live mee-evolueren terwijl de cyclus draait
  useEffect(() => {
    const unsub = base44.entities.Activity.subscribe(() => load());
    return unsub;
  }, []);

  const byAgent = useMemo(() => {
    const m = {};
    for (const a of acts) { (m[a.source] ||= []).push(a); }
    return m;
  }, [acts]);

  const runAll = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("runGiuliaCycle", {});
      const d = res.data || {};
      const ok = (d.agents || []).filter((r) => r.ok).length;
      const total = (d.agents || []).length;
      setLastRun({ ok, total, failed: ((d.agents || []).filter((r) => !r.ok)).length });
      toast({ title: "Cyclus voltooid", description: `${ok}/${total} agenten bijgewerkt` });
      await load();
    } catch (e) {
      toast({ title: "Cyclus mislukt", variant: "destructive" });
    } finally { setRunning(false); }
  };

  const current = GIULIA_AGENTS.find((a) => a.key === active);
  const items = byAgent[active] || [];

  return (
    <div className="space-y-5">
      {/* Alles updaten — de handmatige cyclus-knop */}
      <div className="glass-1 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Alles updaten</p>
          <p className="text-xs text-foreground/50 mt-0.5 leading-snug">
            Synchroniseert alle bronnen en laat elke agent zijn werk doen met de nieuwe gegevens.
          </p>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-full bg-charcoal text-ivory px-4 py-2.5 text-xs font-semibold disabled:opacity-60 hover:bg-charcoal/90 transition shrink-0"
        >
          <RefreshCw className={"h-3.5 w-3.5 " + (running ? "animate-spin" : "")} />
          {running ? "Bezig…" : "Start cyclus"}
        </button>
      </div>

      {lastRun && (
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          {lastRun.failed > 0
            ? <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            : <Check className="h-3.5 w-3.5 text-olive" />}
          <span>Laatste cyclus: {lastRun.ok}/{lastRun.total} agenten</span>
          {lastRun.failed > 0 && <span className="text-destructive">· {lastRun.failed} mislukt</span>}
        </div>
      )}

      {/* Tab-lijst + per-agent activiteit */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 min-h-[360px]">
        <div className="space-y-1 overflow-y-auto pr-1 max-h-[460px] sm:border-r sm:border-foreground/10 sm:pr-3">
          {GIULIA_AGENTS.map((a) => {
            const count = (byAgent[a.key] || []).length;
            const isActive = a.key === active;
            return (
              <button
                key={a.key}
                onClick={() => setActive(a.key)}
                className={
                  "w-full text-left rounded-xl px-3 py-2.5 transition " +
                  (isActive ? "glass-2 text-foreground" : "text-foreground/70 hover:bg-foreground/5")
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{a.label}</span>
                  {count > 0 && <span className="text-[10px] tabular-nums opacity-50">{count}</span>}
                </div>
                {isActive && (
                  <span className="block text-[10px] uppercase tracking-wider opacity-40 mt-0.5">{a.role}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 overflow-y-auto pr-1 max-h-[460px]">
          <SectionLabel>{current?.label} · wat deze agent deed</SectionLabel>
          {loading ? (
            <Empty text="Laden…" />
          ) : items.length === 0 ? (
            <Empty text="Nog niets gelogd — start een cyclus" />
          ) : (
            items.slice(0, 30).map((a) => (
              <div key={a.id} className="rounded-2xl px-4 py-3 glass-1">
                <p className="text-sm text-foreground leading-snug">{a.description}</p>
                <p className="text-[11px] text-foreground/40 mt-1">
                  {a.action ? a.action + " · " : ""}{when(a)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}