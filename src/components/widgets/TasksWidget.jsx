import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import Ring from "./Ring";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

/**
 * TasksWidget — a bespoke completion ring (done / total) with the open count
 * centered; an accent pulse flags overdue. A branded photo bleeds off the
 * bottom edge for depth.
 */
export default function TasksWidget() {
  const { openModule } = usePanel();
  const { data: tasks, loading, reload } = useEntityList("Task");
  const active = tasks.filter((t) => ["today", "overdue", "upcoming"].includes(t.status));
  const overdue = tasks.filter((t) => t.status === "overdue");
  const done = tasks.filter((t) => t.status === "completed");
  const total = tasks.length;
  const top = overdue[0] || active[0];

  const complete = async (e, task) => { e.stopPropagation(); try { await base44.entities.Task.update(task.id, { status: "completed" }); reload(); } catch {} };

  return (
    <WidgetShell size="2x1" radius="medium" interactive onClick={() => openModule("tasks")} className="min-h-[208px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader label="Taken" count={active.length ? `${active.length} open` : "alles klaar"} />
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
        ) : (
          <div className="flex-1 flex items-center gap-5">
            <Ring value={done.length} max={total || 1} size={116} stroke={12}>
              <div className="text-center">
                <CountUp value={active.length} className="text-3xl font-display font-semibold leading-none text-current" />
                <p className="text-[9px] uppercase tracking-wider opacity-45 mt-1">open</p>
              </div>
            </Ring>
            <div className="flex-1 min-w-0">
              {overdue.length > 0 && (
                <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft" />
                  <span className="text-[11px] font-semibold tabular-nums">{overdue.length} te laat</span>
                </div>
              )}
              {top ? (
                <>
                  <p className="text-sm font-semibold text-current leading-tight line-clamp-2">{top.title}</p>
                  <button onClick={(e) => complete(e, top)} className="mt-3 rounded-full px-4 py-2 text-[12px] font-semibold transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Voltooi</button>
                </>
              ) : (
                <p className="text-sm opacity-50">Geen open taken</p>
              )}
            </div>
          </div>
        )}
      </div>
      <BrandPhoto src={IMAGES.feetChairs} className="h-10 w-full" overlay="bg-gradient-to-t from-black/30 to-transparent" />
    </WidgetShell>
  );
}