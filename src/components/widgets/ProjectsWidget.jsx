import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Briefcase, ArrowRight } from "lucide-react";

export default function ProjectsWidget() {
  const { openModule } = usePanel();
  const { data: projects, loading } = useEntityList("Project");
  const active = projects.filter((p) => ["planning", "in_progress", "waiting"].includes(p.status));
  const visible = active.slice(0, 3);

  return (
    <WidgetShell size="2x1" radius="medium" glass="card" interactive onClick={() => openModule("projects")} className="min-h-[220px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Briefcase} label="Projecten" count={`${active.length} actief`} />

        {loading ? (
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((p) => (
              <div key={p.id}>
                <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-olive rounded-full" style={{ width: `${Math.min(p.progress || 0, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-foreground/45 tabular-nums w-8 text-right">{p.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-foreground/45">Geen actieve projecten</p>
          </div>
        )}

        <button onClick={(ev) => { ev.stopPropagation(); openModule("projects"); }} className="mt-3 pt-3 border-t border-foreground/10 flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition">
          Openen <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </WidgetShell>
  );
}