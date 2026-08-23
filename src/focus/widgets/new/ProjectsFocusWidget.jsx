import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { buildBreakdown, weightedProgress } from "@/lib/projectEngine";

const PHOTO = IMAGES.focusBuild;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const OLIVE = "hsl(var(--olive))";
const IVORY = "hsl(var(--ivory))";
const ACTIVE = ["in_progress", "planning", "review", "afwerking"];
const progressColor = (pct) => (pct < 30 ? DEEP : pct < 70 ? OLIVE : LIGHT);

/** ProjectsFocusWidget — G·4:3·R·SIDE · "What I'm Building."
 *  GlassCard (links): gauge (aantal actieve projecten + gem. % klaar) in
 *  plum/olive, dan project-rijen. Tik een project → de PhotoCard (rechts)
 *  schuift links weg en onthult de voortgang per onderdeel, met uitklapbare
 *  subonderdelen (zoals de individuele projectpagina). Geen ghost-getal. */
export default function ProjectsFocusWidget() {
  const { openModule } = usePanel();
  const { data: projects, loading } = useEntityList("Project", { sort: "-created_date", limit: 80, realtime: true });
  const { data: tasks } = useEntityList("Task", { sort: "-created_date", limit: 200, realtime: true });
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const active = useMemo(() => (projects || []).filter((p) => ACTIVE.includes(p.status)), [projects]);
  const total = active.length;
  const avgPct = total ? Math.round(active.reduce((s, p) => s + (p.progress || 0), 0) / total) : 0;
  const top = active.slice(0, 6);
  const selected = (projects || []).find((p) => p.id === selectedId);
  const selTasks = useMemo(() => (tasks || []).filter((t) => t.project_id === selectedId), [tasks, selectedId]);
  const breakdown = useMemo(() => (selected ? buildBreakdown(selTasks) : []), [selected, selTasks]);
  const selProgress = selected ? weightedProgress(selTasks) : 0;

  return (
    <div className="relative w-full h-[340px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: IVORY }}>
      {/* glass shell basislaag */}
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${OLIVE} 18%, ${OLIVE} 82%, transparent)` }} />

      {/* content links */}
      <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col p-4 z-10">
        <div className="mb-2">
          <WidgetHeader type="tasks" label="What I'm Building." count={total ? String(total) : ""} />
        </div>
        {/* gauge verhuisd naar de PhotoCard */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-2 justify-end">
          {loading ? (
            <div className="flex items-center justify-center py-4"><div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : top.length === 0 ? (
            <p className="text-[12px] py-2" style={{ color: "rgba(255,255,255,0.65)" }}>Geen actieve projecten.</p>
          ) : top.map((p, i) => {
            const color = progressColor(p.progress || 0);
            const sel = selectedId === p.id;
            return (
              <button key={p.id} onClick={(e) => { e.stopPropagation(); setSelectedId(sel ? null : p.id); }} className="group w-full text-left rounded-lg px-1.5 -mx-1.5 py-1 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-display font-bold uppercase leading-tight truncate transition-transform group-hover:translate-x-0.5" style={{ color: sel ? OLIVE : IVORY }}>{p.title}</span>
                  <span className="text-[11px] font-mono font-bold tabular-nums shrink-0" style={{ color: DEEP }}>{p.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${p.progress || 0}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.08 }} style={{ backgroundColor: color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* photo card rechts — schuift links weg bij selectie */}
      <div className="absolute inset-y-0 right-0 w-[42%] rounded-[28px] overflow-hidden z-20" style={{ boxShadow: "-16px 0 36px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)" }}>
        {/* status panel achter */}
        <AnimatePresence>
          {selected && (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 flex flex-col p-3 overflow-hidden"
              style={{ background: "rgba(48,23,40,0.92)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(216,218,179,0.28)" }}>
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: LIGHT }}><ArrowLeft className="h-3 w-3" /> dicht</button>
                <span className="text-[12px] font-mono tabular-nums" style={{ color: LIGHT }}>{selProgress}%</span>
              </div>
              <p className="text-[13px] font-display font-bold leading-tight truncate mb-0.5" style={{ color: IVORY }}>{selected.title}</p>
              <p className="text-[8px] uppercase tracking-[0.18em] mb-2" style={{ color: OLIVE }}>voortgang per onderdeel</p>
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
                {breakdown.length === 0 ? (
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>Geen onderdelen — voeg taken toe op de projectpagina.</p>
                ) : breakdown.map((o) => {
                  const open = expanded === o.name;
                  return (
                    <div key={o.name}>
                      <button onClick={() => setExpanded(open ? null : o.name)} className="w-full">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: LIGHT }} />
                          <span className="text-[10px] flex-1 text-left truncate" style={{ color: IVORY }}>{o.name}</span>
                          <span className="text-[9px] tabular-nums" style={{ color: "rgba(255,255,255,0.55)" }}>{o.done}/{o.total}</span>
                          <span className="text-[11px] font-display font-semibold tabular-nums w-8 text-right" style={{ color: LIGHT }}>{o.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.max(o.pct, 2)}%`, background: progressColor(o.pct) }} />
                        </div>
                      </button>
                      {open && o.subs.length > 1 && (
                        <div className="ml-5 mt-1.5 space-y-1">
                          {o.subs.map((s) => (
                            <div key={s.name} className="flex items-center gap-2">
                              <span className="text-[9px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{s.name}</span>
                              <div className="w-12 h-1 bg-white/15 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: progressColor(s.pct) }} /></div>
                              <span className="text-[8px] tabular-nums w-6 text-right" style={{ color: "rgba(255,255,255,0.55)" }}>{s.pct}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* foto laag boven — schuift links weg */}
        <motion.div className="absolute inset-0" animate={{ x: selectedId ? "-102%" : "0%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
          <img src={PHOTO} alt="What I'm Building" className="absolute inset-0 w-full h-full object-cover" />
          {/* XL ghost getal — wit, volledig onderaan, iets minder transparant */}
          <span className="pointer-events-none absolute -bottom-6 -right-3 text-[128px] font-display font-bold leading-none tabular-nums" style={{ color: IVORY, opacity: 0.55 }}>{avgPct}%</span>
          {/* onder: gem. klaar net boven actieve projecten */}
          <div className="absolute bottom-0 inset-x-0 p-3" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <p className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY, opacity: 0.8 }}>gem. klaar</p>
            <p className="text-[9px] uppercase tracking-[0.14em] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{total} actieve projecten</p>
          </div>
          <button onClick={() => openModule("projects")} className="absolute inset-0 cursor-pointer" aria-label="Open projecten" />
        </motion.div>
      </div>
    </div>
  );
}