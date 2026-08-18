import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";
import { GIULIA_AGENTS } from "@/lib/giuliaAgents";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

function when(a) { try { return formatDistanceToNowStrict(new Date(a.created_date), { addSuffix: true }); } catch { return ""; } }

export default function AgentsPreview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(GIULIA_AGENTS[0].key);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [msg, setMsg] = useState("");
  const [addrRun, setAddrRun] = useState(false);

  const load = async () => { try { const data = await base44.entities.Activity.filter({}, "-created_date", 200); setActs(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); const unsub = base44.entities.Activity.subscribe(() => load()); return unsub; }, []);

  const byAgent = useMemo(() => { const m = {}; for (const a of acts) { (m[a.source] ||= []).push(a); } return m; }, [acts]);

  // Agent activity chart
  const chartData = useMemo(() => GIULIA_AGENTS.map((a) => ({ label: a.label?.slice(0, 4) || a.key.slice(0, 4), value: (byAgent[a.key] || []).length, c: GIULIA.mid })).slice(0, 8), [byAgent]);

  const runAll = async () => {
    setRunning(true);
    try { const res = await base44.functions.invoke("runGiuliaCycle", {}); const d = res.data || {}; const ok = (d.agents || []).filter((r) => r.ok).length; const total = (d.agents || []).length; setLastRun({ ok, total, failed: ((d.agents || []).filter((r) => !r.ok)).length }); toast({ title: "Cyclus voltooid", description: `${ok}/${total} agenten bijgewerkt` }); await load(); }
    catch { toast({ title: "Cyclus mislukt", variant: "destructive" }); } finally { setRunning(false); }
  };

  const addressAgent = async () => {
    const m = msg.trim(); setAddrRun(true);
    try { await base44.functions.invoke(active, m ? { message: m } : {}); toast({ title: `${current?.label || "Agent"} aangesproken` }); setMsg(""); await load(); }
    catch { toast({ title: "Aanspreken mislukt", variant: "destructive" }); } finally { setAddrRun(false); }
  };

  const current = GIULIA_AGENTS.find((a) => a.key === active);
  const items = byAgent[active] || [];

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Agents</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{GIULIA_AGENTS.length} agenten</h2>
            {running && <PulseDot color={GIULIA.urgent} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{acts.length} activiteiten gelogd</p>
        </div>
        <OpenLink to="/agents" label="Open Agenten" color={GIULIA.light} />
      </div>

      {/* Run cycle + chart */}
      <div className="glass-1 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ivory">Alles updaten</p>
          <p className="text-xs text-ivory/50 mt-0.5 leading-snug">Synchroniseert alle bronnen en laat elke agent zijn werk doen.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAll} disabled={running} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold disabled:opacity-60 transition shrink-0 text-charcoal" style={{ background: GIULIA.light }}>
          <RefreshCw className={"h-3.5 w-3.5 " + (running ? "animate-spin" : "")} />
          {running ? "Bezig…" : "Start cyclus"}
        </motion.button>
      </div>

      {lastRun && (
        <div className="flex items-center gap-2 text-xs text-ivory/60">
          {lastRun.failed > 0 ? <AlertCircle className="h-3.5 w-3.5" style={{ color: GIULIA.urgent }} /> : <Check className="h-3.5 w-3.5" style={{ color: GIULIA.light }} />}
          <span>Laatste cyclus: {lastRun.ok}/{lastRun.total} agenten</span>
          {lastRun.failed > 0 && <span style={{ color: GIULIA.urgent }}>· {lastRun.failed} mislukt</span>}
        </div>
      )}

      {/* Agent activity chart */}
      <div className="glass-card-2 rounded-2xl p-5">
        <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Activiteit per agent</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${GIULIA.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
              {chartData.map((d, i) => <Cell key={i} fill={d.label === current?.label?.slice(0, 4) ? GIULIA.light : GIULIA.mid} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tab list + per-agent activity */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 min-h-[360px]">
        <div className="space-y-1 overflow-y-auto pr-1 max-h-[460px] sm:border-r sm:border-white/10 sm:pr-3">
          {GIULIA_AGENTS.map((a) => {
            const count = (byAgent[a.key] || []).length;
            const isActive = a.key === active;
            return (
              <button key={a.key} onClick={() => setActive(a.key)} className={"w-full text-left rounded-xl px-3 py-2.5 transition " + (isActive ? "glass-2 text-ivory" : "text-ivory/70 hover:bg-white/5")} style={isActive ? { borderLeft: `2px solid ${GIULIA.light}` } : {}}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{a.label}</span>
                  {count > 0 && <span className="text-[10px] tabular-nums opacity-50">{count}</span>}
                </div>
                {isActive && <span className="block text-[10px] uppercase tracking-wider opacity-40 mt-0.5">{a.role}</span>}
              </button>
            );
          })}
        </div>
        <div className="space-y-3 overflow-y-auto pr-1 max-h-[460px]">
          <div className="flex items-center gap-2 mb-1">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addressAgent(); }} placeholder={`Spreek ${current?.label || "agent"} aan…`} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:ring-1 focus:ring-white/20" />
            <button onClick={addressAgent} disabled={addrRun} className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold disabled:opacity-60 transition text-charcoal" style={{ background: GIULIA.light }}>{addrRun ? "Bezig…" : "Spreek aan"}</button>
          </div>
          <SectionLabel>{current?.label} · wat deze agent deed</SectionLabel>
          {loading ? <Empty text="Laden…" /> : items.length === 0 ? <Empty text="Nog niets gelogd — start een cyclus" /> : (
            items.slice(0, 20).map((a, i) => (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl px-4 py-3 glass-1">
                <p className="text-sm text-ivory leading-snug">{a.description}</p>
                <p className="text-[11px] text-ivory/40 mt-1">{a.action ? a.action + " · " : ""}{when(a)}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <ContextGrid items={[
        { label: "AGENTEN", text: `${GIULIA_AGENTS.length} actieve agenten in het systeem.` },
        { label: "ACTIVITEIT", text: `${acts.length} gebeurtenissen gelogd.` },
        { label: "LAATSTE", text: lastRun ? `Laatste cyclus: ${lastRun.ok}/${lastRun.total} geslaagd.` : "Nog geen cyclus gedraaid." },
      ]} />
      <ActionRow actions={[
        { label: "Start Cyclus", primary: true, color: GIULIA.light, onClick: runAll },
        { label: "Open Agenten", to: "/agents" },
      ]} />
    </div>
  );
}