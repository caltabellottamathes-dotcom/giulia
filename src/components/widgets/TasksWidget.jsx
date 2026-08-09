import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { CheckSquare, Check, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityDot = { high: "bg-ivory", medium: "bg-olive", low: "bg-blue-grey" };

function Stat({ label, value, tone }) {
  const tones = { olive: "text-olive", warn: "text-amber-600", ok: "text-emerald-600" };
  return (
    <div className="rounded-xl bg-ivory/[0.04] border border-ivory/10 px-3 py-2 text-center">
      <p className={cn("text-lg font-semibold tabular-nums leading-none", tones[tone])}>{value}</p>
      <p className="text-[9px] uppercase tracking-wider text-ivory/45 mt-1">{label}</p>
    </div>
  );
}

/**
 * TasksWidget — interactive: tick a task complete inline. Stat row instead of
 * prose.
 */
export default function TasksWidget() {
  const { openModule } = usePanel();
  const [expanded, setExpanded] = useState(false);
  const { data: tasks, loading, reload } = useEntityList("Task");
  const { data: projects } = useEntityList("Project");

  const active = tasks.filter((t) => ["today", "overdue", "upcoming"].includes(t.status));
  const overdue = tasks.filter((t) => t.status === "overdue");
  const done = tasks.filter((t) => t.status === "completed");
  const visible = expanded ? active.slice(0, 6) : active.slice(0, 3);
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const complete = async (e, task) => {
    e.stopPropagation();
    try {
      await base44.entities.Task.update(task.id, { status: "completed" });
      reload();
    } catch (err) {
      /* ignore */
    }
  };

  return (
    <WidgetShell size="2x1" radius="medium" glass="translucent" interactive onClick={() => openModule("tasks")} className="min-h-[240px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={CheckSquare} label="Taken" count={active.length ? `${active.length} open` : "alles klaar"} />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Open" value={active.length} tone="olive" />
          <Stat label="Te laat" value={overdue.length} tone="warn" />
          <Stat label="Klaar" value={done.length} tone="ok" />
        </div>

        {loading ? (
          <div className="flex-1 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {visible.map((task) => (
              <div key={task.id} className="flex items-start gap-2.5">
                <button
                  onClick={(e) => complete(e, task)}
                  className="h-5 w-5 rounded-md border border-ivory/25 shrink-0 mt-0.5 flex items-center justify-center hover:border-olive hover:bg-olive/10 transition group"
                  aria-label="Afvinken"
                >
                  <Check className="h-3 w-3 text-olive opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ivory leading-tight truncate">{task.title}</p>
                  <p className="text-[11px] text-ivory/55 truncate">
                    {task.project_id && projTitle(task.project_id) ? projTitle(task.project_id) : "Algemeen"}
                    {task.deadline ? ` · ${new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}
                  </p>
                </div>
                <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", priorityDot[task.priority] || priorityDot.medium, task.status === "overdue" && "animate-pulse-soft")} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-ivory/50 font-medium">Geen open taken</p>
            <p className="text-[11px] text-ivory/35 mt-1">Alles is afgehandeld</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-ivory/10 flex items-center justify-between">
          <button onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }} className="flex items-center gap-1 text-[11px] font-semibold text-ivory/70 hover:text-ivory transition">
            {active.length} open <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openModule("tasks"); }} className="flex items-center gap-1 text-[11px] font-semibold text-ivory hover:text-olive transition">
            Openen <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}