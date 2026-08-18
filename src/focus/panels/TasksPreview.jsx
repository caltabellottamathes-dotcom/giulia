import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Check } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot, LiveBarChart } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import TaskDetailPreview, { StatusBadge } from "./TaskDetailPreview";
import TaskArchivePreview from "./TaskArchivePreview";

const FILTERS = [{ key: "alle", label: "Alles" }, { key: "today", label: "Vandaag" }, { key: "upcoming", label: "Later" }, { key: "overdue", label: "Te laat" }, { key: "completed", label: "Klaar" }];
const PRIORITY = { high: { c: FOCUS.urgent, l: "HIGH" }, medium: { c: FOCUS.mid, l: "MED" }, low: { c: FOCUS.light, l: "LOW" } };

export default function TasksPreview({ onOpen }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("alle");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("actief");

  const load = async () => {
    try {
      const [t, p] = await Promise.all([base44.entities.Task.list("deadline", 80).catch(() => []), base44.entities.Project.list("-updated_date", 50).catch(() => [])]);
      setTasks(t || []); setProjects(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); const unsub = base44.entities.Task?.subscribe?.((ev) => { if (ev?.type) load(); }); return () => { try { unsub && unsub(); } catch { /* ignore */ } }; }, []);

  const filtered = useMemo(() => tasks.filter((t) => (filter === "alle" || t.status === filter) && (t.title || "").toLowerCase().includes(query.toLowerCase())).sort((a, b) => (a.deadline || "").localeCompare(b.deadline || "")), [tasks, filter, query]);
  const done = tasks.filter((t) => t.status === "completed").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const open = tasks.length - done;
  const counts = { high: 0, medium: 0, low: 0 };
  tasks.filter((t) => t.status !== "completed").forEach((t) => { const k = t.priority || "low"; counts[k] = (counts[k] || 0) + 1; });
  const prioData = [{ label: "HIGH", value: counts.high || 0 }, { label: "MED", value: counts.medium || 0 }, { label: "LOW", value: counts.low || 0 }];
  const prioBars = [FOCUS.urgent, FOCUS.mid, FOCUS.light];

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Tasks</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{open} open</h2>
            {open > 0 && <PulseDot color={counts.high > 0 ? FOCUS.urgent : FOCUS.mid} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{done} voltooid · {tasks.length} totaal</p>
        </div>
        <OpenLink to="/tasks" label="Open Taken" color={FOCUS.light} />
      </div>

      {/* Completion ring + priority chart */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <AnimatedRing pct={pct} size={140} stroke={8} color={FOCUS.mid}>
            <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={pct} />%</span>
            <span className="text-ivory/40 text-[9px] tracking-wider mt-1">VOLTOOID</span>
          </AnimatedRing>
        </div>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Prioriteit · open</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={prioData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {prioData.map((_, i) => <Cell key={i} fill={prioBars[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1.5">
        {[{ k: "actief", l: "Taken" }, { k: "archief", l: "Archief" }].map((v) => (
          <button key={v.k} onClick={() => setView(v.k)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${view === v.k ? "text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`} style={view === v.k ? { background: FOCUS.light } : {}}>{v.l}</button>
        ))}
      </div>

      {view === "archief" ? (
        <TaskArchivePreview tasks={tasks} projects={projects} onSelectTask={setSelected} />
      ) : (
        <>
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-xl glass-card-2 border border-white/15 px-3 py-2 w-fit">
              <Search className="w-4 h-4 text-ivory/55" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek taken…" className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none w-40 sm:w-44" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f.key ? "text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`} style={filter === f.key ? { background: FOCUS.light } : {}}>{f.label}</button>
              ))}
            </div>
          </div>

          <SectionLabel>{`Geplande taken (${filtered.length})`}</SectionLabel>
          {loading ? <Empty text="Laden…" /> : filtered.length ? (
            <div className="flex flex-col gap-2.5">
              <AnimatePresence>
                {filtered.map((t) => (
                  <motion.div key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => setSelected(t)} className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center w-12 shrink-0">
                      <span className="text-ivory/55 text-[10px] uppercase">{t.deadline ? new Date(t.deadline).toLocaleDateString("nl-NL", { month: "short" }) : "—"}</span>
                      <span className="text-ivory text-xl font-semibold leading-none">{t.deadline ? new Date(t.deadline).getDate() : "·"}</span>
                    </div>
                    <div className="w-px h-10 bg-ivory/15" />
                    <div className="flex-1 min-w-0">
                      <p className="text-ivory text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: t.priority ? PRIORITY[t.priority]?.c || "hsl(var(--smoke))" : "hsl(var(--smoke))" }}>{t.priority || "taak"}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${PRIORITY[t.priority || "low"]?.c || FOCUS.light}22`, color: PRIORITY[t.priority || "low"]?.c || FOCUS.light }}>{PRIORITY[t.priority || "low"]?.l || "LOW"}</span>
                    <StatusBadge status={t.status} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : <Empty text="Geen taken gevonden." />}
        </>
      )}

      <ContextGrid items={[
        { label: "OPEN", text: `${open} taken wachten op actie.` },
        { label: "DONE", text: `${done} taken voltooid.` },
        { label: "NEXT", text: filtered[0] ? `Hoogste prioriteit: ${filtered[0].title}` : "Geen open taken." },
      ]} />
      <ActionRow actions={[
        { label: "Nieuwe Taak", primary: true, color: FOCUS.light, to: "/tasks" },
        { label: "Open Taken", to: "/tasks" },
      ]} />

      <FloatingPanel open={!!selected} onClose={() => setSelected(null)} position="right" level={4} width={560} showOverlay={false} className="z-[60]">
        {selected && <TaskDetailPreview task={selected} tasks={tasks} onSelect={setSelected} />}
      </FloatingPanel>
    </div>
  );
}