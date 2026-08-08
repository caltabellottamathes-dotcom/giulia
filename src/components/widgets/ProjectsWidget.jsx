import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Briefcase, Minus, Plus } from "lucide-react";

/**
 * ProjectsWidget — nudge each project's progress with in-card +/- controls.
 */
export default function ProjectsWidget() {
  const { openModule } = usePanel();
  const { data: projects, loading, reload } = useEntityList("Project");
  const active = projects.filter((p) => ["planning", "in_progress", "waiting"].includes(p.status));
  const visible = active.slice(0, 3);

  const nudge = async (e, p, delta) => {
    e.stopPropagation();
    const np = Math.max(0, Math.min(100, Math.round((p.progress || 0) + delta)));
    try { await base44.entities.Project.update(p.id, { progress: np }); reload(); } catch {}
  };

  return (
    <WidgetShell size="2x2" radius="medium" glass="card" interactive onClick={() => openModule("projects")} className="min-h-[300px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Briefcase} label="Projecten" count={`${active.length} actief`} />

        {loading ? (
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-4">
            {visible.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <span className="text-[10px] text-foreground/50 tabular-nums">{p.progress || 0}%</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={(e) => nudge(e, p, -10)} className="h-6 w-6 rounded-md bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition" aria-label="Minder">
                    <Minus className="h-3 w-3" />
                  </button>
                  <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-olive rounded-full transition-all duration-300" style={{ width: `${Math.min(p.progress || 0, 100)}%` }} />
                  </div>
                  <button onClick={(e) => nudge(e, p, 10)} className="h-6 w-6 rounded-md bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition" aria-label="Meer">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen actieve projecten</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}