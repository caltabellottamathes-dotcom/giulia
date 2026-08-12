import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";

/* ANALYSE — Projecten: gem. voortgang, actief aantal, top-projecten met
 * voortgangsbalken + bijsturen, nieuw project, health, volgende mijlpaal.
 * D2 "Project-skyline" (16:7) — balken per project als 'gebouwen'; health-
 * kleur; klik opent. Motion: balken rijzen op.
 * D3 "Focus-project-dial" (3:4) — één grote radiaal voor meest-aandacht-
 * nodigende project; volgende mijlpaal + dagen tot deadline; wissel met ←/→. */

const HEALTH = { good: "var(--tile-accent)", attention: "hsl(var(--sand))", critical: "hsl(var(--destructive))" };

export function ProjectsDesign2() {
  const { data: projects } = useEntityList("Project");
  const active = (projects || []).filter((p) => !["completed", "archived", "paused"].includes(p.status)).slice(0, 8);
  const max = Math.max(100, ...active.map((p) => p.progress || 0));
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Projecten · skyline</p>
        <span className="text-[10px] tabular-nums opacity-50">{active.length} actief</span>
      </div>
      <div className="flex items-end gap-1.5 h-[calc(100%-2rem)]">
        {active.map((p, i) => {
          const h = Math.max(8, ((p.progress || 0) / max) * 100);
          const color = HEALTH[p.health] || "var(--tile-accent)";
          return (
            <div key={p.id} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} className="w-full rounded-t-lg flex items-end justify-center pb-1" style={{ background: color }}>
                <span className="text-[9px] font-bold tabular-nums">{p.progress || 0}</span>
              </motion.div>
              <span className="text-[8px] truncate w-full text-center opacity-55">{p.title}</span>
            </div>
          );
        })}
        {active.length === 0 && <p className="text-xs opacity-40 m-auto">Geen actieve projecten</p>}
      </div>
    </div>
  );
}

export function ProjectsDesign3() {
  const { data: projects, reload } = useEntityList("Project");
  const active = (projects || []).filter((p) => !["completed", "archived", "paused"].includes(p.status))
    .sort((a, b) => (a.health === "critical" ? -1 : 1) - (b.health === "critical" ? -1 : 1));
  const [idx, setIdx] = useState(0);
  const p = active[idx] || active[0];
  const days = p?.deadline ? Math.ceil((new Date(p.deadline) - new Date()) / 86400000) : null;
  const nudge = async (d) => { if (!p) return; try { await base44.entities.Project.update(p.id, { progress: Math.max(0, Math.min(100, (p.progress || 0) + d)) }); reload(); } catch {} };
  const r = 56, c = 2 * Math.PI * r;
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Projecten · focus</p>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} className="h-6 w-6 rounded-full glass-1 text-xs">‹</button>
          <button onClick={() => setIdx((i) => Math.min(active.length - 1, i + 1))} className="h-6 w-6 rounded-full glass-1 text-xs">›</button>
        </div>
      </div>
      {p ? (
        <>
          <div className="flex-1 flex items-center justify-center">
            <svg width={140} height={140} viewBox="0 0 140 140">
              <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
              <motion.circle cx={70} cy={70} r={r} fill="none" stroke={HEALTH[p.health] || "var(--tile-accent)"} strokeWidth={10} strokeLinecap="round"
                strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * (p.progress || 0)) / 100 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} transform="rotate(-90 70 70)" />
              <text x={70} y={74} textAnchor="middle" className="fill-ivory font-bold" style={{ fontSize: 28 }}>{p.progress || 0}%</text>
            </svg>
          </div>
          <p className="text-sm font-semibold text-center truncate">{p.title}</p>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="opacity-60 truncate flex-1">{p.next_milestone || "geen mijlpaal"}</span>
            <span className={`tabular-nums ${days != null && days < 0 ? "text-destructive" : "opacity-70"}`}>{days == null ? "—" : days < 0 ? `${Math.abs(days)}d te laat` : `${days}d`}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => nudge(-10)} className="flex-1 rounded-full glass-1 py-1.5 text-xs font-semibold">−10%</button>
            <button onClick={() => nudge(10)} className="flex-1 rounded-full py-1.5 text-xs font-semibold" style={{ background: "var(--tile-accent)", color: "#fff" }}>+10%</button>
          </div>
        </>
      ) : <p className="m-auto text-xs opacity-40">Geen actieve projecten</p>}
    </div>
  );
}

export default { Design2: ProjectsDesign2, Design3: ProjectsDesign3 };