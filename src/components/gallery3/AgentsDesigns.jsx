import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";
import { GIULIA_AGENTS } from "@/lib/giuliaAgents";
import { RefreshCw } from "lucide-react";

/* ANALYSE — Agenten: run-knop, voortgangs-ring 0→100%, agentlijst met per-
 * agent counts, agent aanspreken, last-run status. Focus: agenten-zwerm
 * orkestreren, cyclus draaien, per-agent activiteit.
 * D2 "Agent-rooster met run" (4:3) — grid van agent-tegels, elk met laatste-
 * actietijd; "Run all" veegt highlight over heen. Motion: veeg, tegels lichten
 * op in volgorde.
 * D3 "Orkestrator-constellatie" (1:1) — centrale Giulia-knoop met agenten in
 * baan; run = puls naar buiten; actieve agenten helder. Motion: baan draait. */

export function AgentsDesign2() {
  const { data: acts, reload } = useEntityList("Activity", { sort: "-created_date" });
  const [running, setRunning] = useState(false);
  const byAgent = useMemo(() => { const m = {}; (acts || []).forEach((a) => { (m[a.source] ||= []).push(a); }); return m; }, [acts]);
  const run = async () => { setRunning(true); try { await base44.functions.invoke("runGiuliaCycle", {}); reload(); } catch {} setRunning(false); };
  const agents = GIULIA_AGENTS.slice(0, 12);
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Agenten · rooster</p>
        <button onClick={run} disabled={running} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold transition hover:-translate-y-0.5 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "#fff" }}><RefreshCw className={`h-3 w-3 ${running ? "animate-spin" : ""}`} />Run</button>
      </div>
      <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-1.5 min-h-0 relative">
        {agents.map((a, i) => {
          const count = (byAgent[a.key] || []).length;
          const fresh = count > 0;
          return (
            <motion.div key={a.key} initial={{ opacity: 0, scale: 0.8 }} animate={running ? { backgroundColor: ["rgba(255,255,255,0.08)", "var(--tile-accent)", "rgba(255,255,255,0.08)"] } : { opacity: 1, scale: 1 }} transition={{ delay: running ? i * 0.06 : i * 0.04, duration: running ? 0.4 : 0.3 }}
              className="rounded-lg p-1.5 flex flex-col justify-between min-w-0" style={{ background: fresh ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)" }}>
              <span className="text-[8px] font-medium leading-tight line-clamp-2">{a.label}</span>
              <span className="text-[9px] tabular-nums opacity-60">{count}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function AgentsDesign3() {
  const { data: acts } = useEntityList("Activity", { sort: "-created_date" });
  const [running, setRunning] = useState(false);
  const byAgent = useMemo(() => { const m = {}; (acts || []).forEach((a) => { (m[a.source] ||= []).push(a); }); return m; }, [acts]);
  const orbit = GIULIA_AGENTS.slice(0, 12);
  const run = async () => { setRunning(true); try { await base44.functions.invoke("runGiuliaCycle", {}); } catch {} setRunning(false); };
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col items-center shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "1/1", ...accentVars("olive") }}>
      <div className="flex items-center justify-between w-full mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Agenten · zwerm</p>
        <button onClick={run} disabled={running} className="rounded-full px-3 py-1 text-[10px] font-semibold transition hover:-translate-y-0.5 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "#fff" }}>{running ? "…" : "Run"}</button>
      </div>
      <div className="relative flex-1 w-full flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute inset-[8%] rounded-full border border-ivory/10" />
        {orbit.map((a, i) => {
          const ang = (i / orbit.length) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + 42 * Math.cos(ang); const y = 50 + 42 * Math.sin(ang);
          const fresh = (byAgent[a.key] || []).length > 0;
          return (
            <motion.span key={a.key} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}
              className="absolute h-7 w-7 rounded-full flex items-center justify-center text-[8px] font-bold border-2"
              style={{ left: `${x}%`, top: `${y}%`, marginLeft: -14, marginTop: -14, background: fresh ? "var(--tile-accent)" : "rgba(255,255,255,0.14)", borderColor: fresh ? "var(--tile-accent)" : "rgba(255,255,255,0.25)", color: fresh ? "#fff" : undefined }}>
              {a.label.slice(0, 2)}
            </motion.span>
          );
        })}
        {running && <motion.span initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: [0, 3], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute h-12 w-12 rounded-full" style={{ background: "var(--tile-accent)" }} />}
        <div className="relative z-10 h-12 w-12 rounded-full glass-1 flex items-center justify-center text-[10px] font-bold">Giulia</div>
      </div>
    </div>
  );
}

export default { Design2: AgentsDesign2, Design3: AgentsDesign3 };