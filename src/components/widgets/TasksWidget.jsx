import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockTasks, mockProjects } from "@/lib/mockData";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const priorityColor = {
  high: "bg-sienna",
  medium: "bg-olive",
  low: "bg-clay",
};

/**
 * TasksWidget — due & overdue tasks with color priority dots + row hover.
 */
export default function TasksWidget() {
  const { openModule } = usePanel();
  const [expanded, setExpanded] = useState(false);

  const active = mockTasks.filter(
    (t) => t.status === "today" || t.status === "overdue" || t.status === "upcoming"
  );
  const overdue = mockTasks.filter((t) => t.status === "overdue");
  const visible = expanded ? active.slice(0, 6) : active.slice(0, 3);

  return (
    <WidgetShell
      size="2x1"
      radius="medium"
      depth={2}
      interactive
      onClick={() => openModule("tasks")}
      style={{ animationDelay: "180ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Taken
          </h3>
          {overdue.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-sienna">
              <span className="h-1.5 w-1.5 rounded-full bg-sienna animate-pulse-soft" />
              {overdue.length} te laat
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1.5 overflow-hidden">
          {visible.map((task) => {
            const project = mockProjects.find((p) => p.id === task.project_id);
            const isOverdue = task.status === "overdue";
            return (
              <div
                key={task.id}
                className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-all duration-300 hover:bg-foreground/[0.03] hover:translate-x-1"
              >
                <div className="h-4 w-4 rounded-md border border-border shrink-0 mt-0.5 flex items-center justify-center">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      priorityColor[task.priority] || priorityColor.medium
                    } ${isOverdue ? "animate-pulse-soft" : ""}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-tight truncate">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {project?.title || "Algemeen"}
                    {task.deadline && ` · ${new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="flex items-center gap-1 text-[11px] text-olive hover:text-foreground transition-colors"
          >
            {active.length} open
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </div>
    </WidgetShell>
  );
}