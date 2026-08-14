import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { Plus, Flag } from "lucide-react";
import { SectionLabel, Empty } from "./previewParts";
import ProjectAddPanel from "./ProjectAddPanel";

const COLS = [
  { key: "lopend", label: "Lopend", accent: "text-sand", dot: "bg-sand" },
  { key: "gepland", label: "Gepland", accent: "text-blue-grey", dot: "bg-blue-grey" },
  { key: "voltooid", label: "Voltooid", accent: "text-olive", dot: "bg-olive" },
];
const statusCol = (s) =>
  ["in_progress", "review", "waiting"].includes(s) ? "lopend"
  : s === "completed" ? "voltooid"
  : s === "planning" || s === "idea" ? "gepland"
  : null;

/** Projects module paneel — kolomweergave (naar /slick/projecten) met foto's,
 *  GIULIA-glass met live projectdata. */
export default function ProjectsPreview({ onOpen }) {
  const navigate = useNavigate();
  const { closeModule } = usePanel();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Project.list("-last_activity_date", 100);
      setProjects((data || []).filter((p) => !["archived", "paused"].includes(p.status)));
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = { lopend: 0, gepland: 0, voltooid: 0 };
    projects.forEach((p) => { const col = statusCol(p.status); if (col) c[col]++; });
    return c;
  }, [projects]);

  const ref = new Date();
  const daysLeft = (d) => (d ? Math.ceil((new Date(d) - ref) / 86400000) : null);

  return (
    <div className="space-y-5">
      <button
        onClick={() => setAddOpen(true)}
        className="w-full animate-fade-up inline-flex items-center justify-center gap-2 rounded-2xl glass-card-2 px-4 py-3 text-sm font-semibold text-ivory hover:bg-white/10 transition"
      >
        <Plus className="h-4 w-4" /> Nieuw project
      </button>

      <div className="grid grid-cols-3 gap-3">
        {COLS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-white/15 bg-white/[0.05] p-4 flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            <div>
              <p className={`text-xs ${c.accent}`}>{c.label}</p>
              <p className="text-ivory text-2xl font-semibold leading-none mt-1">{counts[c.key]}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel>Lopende projecten</SectionLabel>

      {loading ? (
        <Empty text="Laden…" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLS.map((col) => {
            const items = projects.filter((p) => statusCol(p.status) === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className={`text-xs font-semibold ${col.accent}`}>{col.label}</span>
                  <span className="text-ivory/45 text-[10px] tabular-nums">{items.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((p) => {
                    const dl = daysLeft(p.deadline);
                    const risk = dl != null && dl <= 7 && p.status !== "completed";
                    return (
                      <div
                        key={p.id}
                        onClick={() => { navigate(`/projects/${p.id}`); closeModule(); }}
                        className="rounded-xl border border-white/15 bg-white/[0.06] p-3 cursor-pointer hover:bg-white/10 transition-colors overflow-hidden"
                      >
                        {p.image && (
                          <div className="relative -mx-3 -mt-3 mb-3 h-20 overflow-hidden">
                            <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                          </div>
                        )}
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-ivory text-sm font-medium truncate">{p.title}</p>
                            <p className="text-ivory/50 text-xs truncate">{p.category || "Project"}</p>
                          </div>
                          {risk && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive border border-destructive/40">⚠ {dl}d</span>}
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-ivory/55">Voortgang</span>
                            <span className="text-ivory tabular-nums">{p.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-sand" style={{ width: `${p.progress || 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-right">
                            <p className="text-ivory/45 text-[9px]">Deadline</p>
                            <p className="text-ivory text-[10px] tabular-nums">{p.deadline || "—"}</p>
                          </div>
                        </div>
                        {p.next_milestone && (
                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5">
                            <Flag className="w-3 h-3 text-ivory/55" />
                            <span className="text-ivory/65 text-[10px] truncate">{p.next_milestone}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {items.length === 0 && <p className="text-ivory/35 text-[10px] text-center py-4">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectAddPanel open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </div>
  );
}