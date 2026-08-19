import React from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import CountUp from "../../system/widgets/CountUp";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/** ProjectsWidget — photo floats over the glass (avg on the photo). */
export default function ProjectsWidget() {
  const { openModule } = usePanel();
  const { data: projects, loading, reload } = useEntityList("Project");
  const active = projects.filter((p) => ["planning", "in_progress", "waiting"].includes(p.status));
  const avg = active.length ? Math.round(active.reduce((s, p) => s + (p.progress || 0), 0) / active.length) : 0;
  const visible = active.slice(0, 3);
  const nudge = async (e, p, delta) => { e.stopPropagation(); const np = Math.max(0, Math.min(100, Math.round((p.progress || 0) + delta))); try { await base44.entities.Project.update(p.id, { progress: np }); reload(); } catch {} };

  return (
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("projects")} className="min-h-[260px]">
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.walkChairsHigh} className="h-24 -mb-8 rounded-b-[24px] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)] relative z-10" overlay="bg-gradient-to-t from-charcoal/45 via-transparent to-transparent">
          <div className="absolute inset-0 px-4 pb-3 flex items-end">
            <div className="flex items-end gap-2">
              <CountUp value={avg} className="text-4xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/75 mb-1">gem. klaar</p>
            </div>
          </div>
        </BrandPhoto>
        <div className="p-5 pt-10 flex-1 flex flex-col">
          <WidgetHeader label="What I'm Building." count={`${active.length} actief`} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : active.length > 0 ? (
            <>
              <div className="flex-1 space-y-4">
                {visible.map((p) => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-current truncate">{p.title}</p>
                      <span className="text-[11px] tabular-nums opacity-50">{p.progress || 0}%</span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-current/10 overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${Math.min(p.progress || 0, 100)}%`, background: "var(--tile-accent)" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={(e) => nudge(e, active[0], -10)} className="h-9 w-9 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">−</button>
                <button onClick={(e) => nudge(e, active[0], 10)} className="h-9 w-9 rounded-full border border-current/15 text-current text-lg leading-none flex items-center justify-center transition hover:bg-current/5">+</button>
                <span className="text-[11px] opacity-50 truncate">{active[0]?.title}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><p className="text-xs opacity-45">Geen actieve projecten</p></div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}