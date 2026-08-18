import React, { useEffect, useMemo, useState } from "react";
import { Flag } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";

const MID = "#94925d", URG = "#d5e24a", LIGHT = "#d8dab3";
const COLUMNS = [
  { key: "active", label: "Lopend", dot: "bg-sand", accent: "text-sand" },
  { key: "planned", label: "Gepland", dot: "bg-marble", accent: "text-marble" },
  { key: "completed", label: "Voltooid", dot: "bg-urgent", accent: "text-urgent" },
];

export default function ProjectsPreview({ onOpen }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list("-updated_date").then(data => setProjects(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    active: projects.filter(p => p.status === "active").length,
    planned: projects.filter(p => p.status === "planned" || p.status === "on_hold").length,
    completed: projects.filter(p => p.status === "completed").length,
  }), [projects]);

  return (
    <PreviewShell index="08" section="PROJECTS" statement={`${counts.active} LOPEND`} kicker={`${projects.length} PROJECTEN`} accent={URG}
      context={[
        { label: "LOPEND", text: `${counts.active} projecten nu actief.` },
        { label: "GEPLAND", text: `${counts.planned} projecten in de wachtrij.` },
        { label: "VOLTOOID", text: `${counts.completed} projecten afgerond.` },
      ]}
      actions={[{ label: "New Project", primary: true, to: "/projects" }, { label: "Filter", to: "/projects" }, { label: "Archive", to: "/projects" }, { label: "Open Projecten", to: "/projects" }]}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {COLUMNS.map(c => (
            <div key={c.key} className="rounded-2xl border border-marble/20 bg-marble/5 p-3 flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <div>
                <p className={`text-[10px] ${c.accent}`}>{c.label}</p>
                <p className="text-storm text-xl font-semibold leading-none mt-1">{counts[c.key]}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COLUMNS.map(col => {
              const items = projects.filter(p => p.status === col.key || (col.key === "planned" && p.status === "on_hold"));
              return (
                <div key={col.key} className="rounded-2xl border border-marble/15 bg-marble/5 p-3">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={`text-xs font-semibold ${col.accent}`}>{col.label}</span>
                    <span className="text-marble/50 text-[10px] tabular-nums">{items.length}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {loading ? <p className="text-storm/40 text-xs">Laden…</p> : items.length === 0 ? <p className="text-storm/40 text-xs">Geen projecten.</p> : items.slice(0, 4).map(p => (
                      <div key={p.id} onClick={onOpen} className="rounded-xl border border-marble/20 bg-marble/10 p-3 cursor-pointer hover:bg-marble/15 transition-colors">
                        <p className="text-storm text-sm font-medium truncate">{p.name || p.title}</p>
                        <p className="text-marble/50 text-xs truncate">{p.client || p.description?.slice(0, 40) || "—"}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-marble/60">Voortgang</span>
                            <span className="text-storm tabular-nums">{p.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-marble/10 overflow-hidden">
                            <div className="h-full rounded-full bg-urgent" style={{ width: `${p.progress || 0}%` }} />
                          </div>
                        </div>
                        {p.deadline && (
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                              <Flag className="w-3 h-3 text-marble/60" />
                              <span className="text-marble/70 text-[10px] truncate">{p.next_milestone || "Geen milestone"}</span>
                            </div>
                            <p className="text-storm text-[10px] tabular-nums">{p.deadline}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}