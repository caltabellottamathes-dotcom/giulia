import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { Plus, Flag } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import ProjectAddPanel from "./ProjectAddPanel";

const COLS = [
  { key: "lopend", label: "Lopend", c: FOCUS.deep },
  { key: "gepland", label: "Gepland", c: FOCUS.mid },
  { key: "voltooid", label: "Voltooid", c: FOCUS.light },
];
const statusCol = (s) => ["in_progress", "review", "waiting"].includes(s) ? "lopend" : s === "completed" ? "voltooid" : s === "planning" || s === "idea" ? "gepland" : null;

export default function ProjectsPreview({ onOpen }) {
  const navigate = useNavigate();
  const { closeModule } = usePanel();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const data = await base44.entities.Project.list("-last_activity_date", 100); setProjects((data || []).filter((p) => !["archived", "paused"].includes(p.status))); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => { const c = { lopend: 0, gepland: 0, voltooid: 0 }; projects.forEach((p) => { const col = statusCol(p.status); if (col) c[col]++; }); return c; }, [projects]);
  const avgProgress = useMemo(() => { const active = projects.filter((p) => p.status !== "completed"); return active.length ? Math.round(active.reduce((s, p) => s + (p.progress || 0), 0) / active.length) : 0; }, [projects]);
  const ref = new Date();
  const daysLeft = (d) => (d ? Math.ceil((new Date(d) - ref) / 86400000) : null);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Projects</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{projects.length} projecten</h2>
            {counts.lopend > 0 && <PulseDot color={FOCUS.mid} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">Gem. voortgang {avgProgress}%</p>
        </div>
        <OpenLink to="/projects" label="Open Projecten" color={FOCUS.light} />
      </div>

      {/* Add button */}
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setAddOpen(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl glass-card-2 px-4 py-3 text-sm font-semibold text-ivory hover:bg-white/10 transition">
        <Plus className="h-4 w-4" /> Nieuw project
      </motion.button>

      {/* Status stats */}
      <div className="grid grid-cols-3 gap-3">
        {COLS.map((c) => (
          <motion.div key={c.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.c }} />
            <div>
              <p className="text-xs" style={{ color: c.c }}>{c.label}</p>
              <p className="text-ivory text-2xl font-semibold leading-none mt-1"><CountUp value={counts[c.key]} /></p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kanban columns */}
      <SectionLabel>Lopende projecten</SectionLabel>
      {loading ? <Empty text="Laden…" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLS.map((col, ci) => {
            const items = projects.filter((p) => statusCol(p.status) === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-semibold" style={{ color: col.c }}>{col.label}</span>
                  <span className="text-ivory/45 text-[10px] tabular-nums">{items.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((p, i) => {
                    const dl = daysLeft(p.deadline);
                    const risk = dl != null && dl <= 7 && p.status !== "completed";
                    return (
                      <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} onClick={() => { navigate(`/projects/${p.id}`); closeModule(); }} className="rounded-xl border border-white/15 bg-white/[0.06] p-3 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden">
                        {p.image && (<div className="relative -mx-3 -mt-3 mb-3 h-20 overflow-hidden"><img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" /></div>)}
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0"><p className="text-ivory text-sm font-medium truncate">{p.title}</p><p className="text-ivory/50 text-xs truncate">{p.category || "Project"}</p></div>
                          {risk && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${FOCUS.urgent}20`, color: FOCUS.urgent, border: `1px solid ${FOCUS.urgent}40` }}>⚠ {dl}d</span>}
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1"><span className="text-ivory/55">Voortgang</span><span className="text-ivory tabular-nums">{p.progress || 0}%</span></div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div className="h-full rounded-full" style={{ background: col.c }} initial={{ width: 0 }} animate={{ width: `${p.progress || 0}%` }} transition={{ duration: 1, delay: 0.2 }} />
                          </div>
                        </div>
                        {p.next_milestone && (<div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5"><Flag className="w-3 h-3 text-ivory/55" /><span className="text-ivory/65 text-[10px] truncate">{p.next_milestone}</span></div>)}
                      </motion.div>
                    );
                  })}
                  {items.length === 0 && <p className="text-ivory/35 text-[10px] text-center py-4">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ContextGrid items={[
        { label: "LOPEND", text: `${counts.lopend} projecten in uitvoering.` },
        { label: "GEMIDDELD", text: `Gemiddelde voortgang: ${avgProgress}%.` },
        { label: "DEADLINE", text: projects.find((p) => { const dl = daysLeft(p.deadline); return dl != null && dl <= 7 && p.status !== "completed"; }) ? "Eén of meer projecten naderen de deadline." : "Geen urgente deadlines." },
      ]} />
      <ActionRow actions={[
        { label: "Nieuw Project", primary: true, color: FOCUS.light, onClick: () => setAddOpen(true) },
        { label: "Open Projecten", to: "/projects" },
      ]} />

      <ProjectAddPanel open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </div>
  );
}