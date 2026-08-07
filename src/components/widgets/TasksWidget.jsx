import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockTasks, mockProjects } from "@/lib/mockData";
import { ChevronDown } from "lucide-react";

const priorityDot = {
  high: "bg-foreground",
  medium: "bg-olive",
  low: "bg-blue-grey",
};

/**
 * TasksWidget — due & overdue tasks, urgency dot, readable type.
 */
export default function TasksWidget() {
  const { openModule } = usePanel();
  const [expanded, setExpanded] = useState(false);

  const active = mockTasks.filter((t) =>
    ["today", "overdue", "upcoming"].includes(t.status)
  );
  const overdue = mockTasks.filter((t) => t.status === "overdue");
  const visible = expanded ? active.slice(0, 6) : active.slice(0, 3);

  return (
    <WidgetShell
      size="2x1"
      radius="medium"
      glass="translucent"
      interactive
      onClick={() => openModule("tasks")}
      style={{ animationDelay: "140ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
            Taken
          </h3>
          {overdue.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-olive" />
              {overdue.length} te laat
            </span>
          )}
        </div>

        {/* Task stack */}
        <div className="flex-1 space-y-3 overflow-hidden">
          {visible.map((task) => {
            const project = mockProjects.find((p) => p.id === task.project_id);
            const isOverdue = task.status === "overdue";
            return (
              <div key={task.id} className="flex items-start gap-3">
                <div className="h-4 w-4 rounded-md border border-foreground/25 shrink-0 mt-0.5 flex items-center justify-center">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      priorityDot[task.priority] || priorityDot.medium
                    } ${isOverdue ? "animate-pulse-soft" : ""}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight truncate">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-foreground/55 truncate">
                    {project?.title || "Algemeen"}
                    {task.deadline &&
                      ` · ${new Date(task.deadline).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                      })}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            {active.length} open
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModule("tasks");
            }}
            className="text-[11px] font-medium text-foreground hover:text-olive transition-colors"
          >
            Openen →
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}