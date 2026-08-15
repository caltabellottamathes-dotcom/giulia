import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search } from "lucide-react";
import FloatingPanel from "@/system/components/glass/FloatingPanel";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import TaskDetailPreview, { StatusBadge } from "./TaskDetailPreview";
import TaskArchivePreview from "./TaskArchivePreview";

const FILTERS = [
  { key: "alle", label: "Alles" },
  { key: "today", label: "Vandaag" },
  { key: "upcoming", label: "Later" },
  { key: "overdue", label: "Te laat" },
  { key: "waiting", label: "Wacht" },
  { key: "completed", label: "Klaar" },
];
const PRIORITY_COLOR = { high: "hsl(var(--destructive))", medium: "hsl(var(--sand))", low: "hsl(var(--smoke))" };

/** Tasks module paneel — Takenoverzicht (naar /slick/takenoverzicht) + Archief
 *  (naar /slick/archief), GIULIA-glass. Klik op een taak opent Taak-details. */
export default function TasksPreview({ onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("alle");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("actief");

  const load = async () => {
    try {
      const [t, p] = await Promise.all([
        base44.entities.Task.list("deadline", 80).catch(() => []),
        base44.entities.Project.list("-updated_date", 50).catch(() => []),
      ]);
      setTasks(t || []);
      setProjects(p || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const unsub = base44.entities.Task?.subscribe?.((ev) => { if (ev?.type) load(); });
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, []);

  const filtered = useMemo(
    () => tasks
      .filter((t) => (filter === "alle" || t.status === filter) && (t.title || "").toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || "")),
    [tasks, filter, query]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {[{ k: "actief", l: "Taken" }, { k: "archief", l: "Archief" }].map((v) => (
          <button key={v.k} onClick={() => setView(v.k)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${view === v.k ? "bg-ivory text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`}>{v.l}</button>
        ))}
      </div>

      {view === "archief" ? (
        <TaskArchivePreview tasks={tasks} projects={projects} onSelectTask={setSelected} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-xl glass-card-2 border border-white/15 px-3 py-2 w-fit">
              <Search className="w-4 h-4 text-ivory/55" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek taken…" className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none w-40 sm:w-44" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f.key ? "bg-ivory text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`}>{f.label}</button>
              ))}
            </div>
          </div>

          <SectionLabel>{`Geplande taken (${filtered.length})`}</SectionLabel>

          {loading ? (
            <Empty text="Laden…" />
          ) : filtered.length ? (
            <div className="flex flex-col gap-2.5">
              {filtered.map((t) => (
                <div key={t.id} onClick={() => setSelected(t)} className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-12 shrink-0">
                    <span className="text-ivory/55 text-[10px] uppercase">{t.deadline ? new Date(t.deadline).toLocaleDateString("nl-NL", { month: "short" }) : "—"}</span>
                    <span className="text-ivory text-xl font-semibold leading-none">{t.deadline ? new Date(t.deadline).getDate() : "·"}</span>
                  </div>
                  <div className="w-px h-10 bg-ivory/15" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: t.priority ? PRIORITY_COLOR[t.priority] : "hsl(var(--smoke))" }}>{t.priority || "taak"}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Geen taken gevonden." />
          )}

          <div className="flex justify-end pt-1">
            <button onClick={onOpen} className="px-5 py-2.5 rounded-full bg-sand text-charcoal text-sm font-semibold hover:brightness-105 transition-all active:scale-95 flex items-center gap-2 shadow-[0_4px_20px_rgba(210,185,140,0.35)]">
              <Plus className="w-4 h-4" /> Nieuwe taak
            </button>
          </div>
        </>
      )}

      <FloatingPanel open={!!selected} onClose={() => setSelected(null)} position="right" level={4} width={560} showOverlay={false} className="z-[60]">
        {selected && <TaskDetailPreview task={selected} tasks={tasks} onSelect={setSelected} />}
      </FloatingPanel>
    </div>
  );
}