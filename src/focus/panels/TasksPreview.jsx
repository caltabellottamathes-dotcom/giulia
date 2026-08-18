import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, BarGrow, LiveSparkline } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3";
const PRIO = { high: { c: URG, l: "HIGH" }, medium: { c: DEEP, l: "MED" }, low: { c: LIGHT, l: "LOW" } };

export default function TasksPreview({ onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Task.filter({}, "-priority", 50); setTasks(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    const newStatus = t.status === "done" ? "todo" : "done";
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
    try { await base44.entities.Task.update(t.id, { status: newStatus }); } catch { load(); }
  };

  const done = tasks.filter(t => t.status === "done").length;
  const open = tasks.length - done;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const counts = { high: 0, medium: 0, low: 0 };
  tasks.filter(t => t.status !== "done").forEach(t => { const p = t.priority || "medium"; if (counts[p] !== undefined) counts[p]++; });

  return (
    <PreviewShell
      index="01" section="TASKS" statement={`${open} OPEN`} kicker="VANDAAG" accent={URG}
      context={[
        { label: "OPEN", text: `${open} taken wachten op actie.` },
        { label: "DONE", text: `${done} taken voltooid.` },
        { label: "NEXT", text: tasks.find(t => t.priority === "high" && t.status !== "done") ? tasks.find(t => t.priority === "high").title : "Geen hoge prioriteit open." },
      ]}
      actions={[{ label: "New Task", primary: true, to: "/tasks" }, { label: "Filter", to: "/tasks" }, { label: "Sort", to: "/tasks" }, { label: "Open Taken", to: "/tasks" }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center">
            <AnimatedRing pct={pct} size={160} color={URG} label={`${pct}%`} sub="DONE" />
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">ACTIVITY · LIVE</p>
            <LiveSparkline color={DEEP} max={12} intervalMs={1700} />
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PRIORITY · OPEN</p>
            {["high", "medium", "low"].map((k, i) => (
              <div key={k} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-storm/70">{PRIO[k].l}</span>
                  <span className="text-storm tabular-nums">{counts[k]}</span>
                </div>
                <BarGrow value={counts[k]} max={tasks.length} color={PRIO[k].c} delay={i * 0.15} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">{tasks.length} TAKEN · KLIK OM TE WISSELEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            <AnimatePresence>
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : tasks.length === 0 ? <p className="text-storm/40 text-sm">Geen taken.</p> : tasks.map(t => (
                <motion.button key={t.id} layout
                  onClick={() => toggle(t)}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${t.status === "done" ? "border-marble/15 bg-marble/5" : "border-marble/25 bg-marble/8 hover:bg-marble/15"}`}>
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${t.status === "done" ? "bg-urgent border-urgent" : "border-marble/40"}`}>
                    {t.status === "done" && <Check className="w-3 h-3 text-plum" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.status === "done" ? "text-storm/40 line-through" : "text-storm"}`}>{t.title}</p>
                    <p className="text-[10px] text-storm/50 mt-0.5">{t.project_id ? "Project" : "Algemeen"} · {t.due_date || "—"}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${(PRIO[t.priority] || PRIO.medium).c}22`, color: (PRIO[t.priority] || PRIO.medium).c }}>{(PRIO[t.priority] || PRIO.medium).l}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}