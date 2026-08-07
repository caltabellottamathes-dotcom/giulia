import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockTasks, mockProjects } from "@/lib/mockData";
import { CheckSquare, ArrowUpRight, ChevronDown } from "lucide-react";

const priorityDot = {
  high: "bg-[#2D2D23]",
  medium: "bg-[#868564]",
  low: "bg-[#B1BEC6]",
};

/**
 * TasksWidget — due & overdue tasks stacked, urgency dot indicator.
 * Max 4 visible, tap to expand; opens Tasks module.
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
      interactive
      onClick={() => openModule("tasks")}
      style={{ animationDelay: "140ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center">
              <CheckSquare className="h-3.5 w-3.5 text-[#2D2D23]" />
            </div>
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#2D2D23]/55">
              Taken
            </h3>
          </div>
          {overdue.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-[#2D2D23]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#868564]" />
              {overdue.length} te laat
            </span>
          )}
        </div>

        {/* Task stack */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {visible.map((task) => {
            const project = mockProjects.find((p) => p.id === task.project_id);
            const isOverdue = task.status === "overdue";
            return (
              <div
                key={task.id}
                className="flex items-start gap-2.5 group/task"
              >
                <div className="h-4 w-4 rounded-md border border-[#868564]/40 shrink-0 mt-0.5 flex items-center justify-center">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      priorityDot[task.priority] || priorityDot.medium
                    } ${isOverdue ? "animate-pulse-soft" : ""}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2D2D23] leading-tight truncate">
                    {task.title}
                  </p>
                  <p className="text-[10px] text-[#2D2D23]/45 truncate">
                    {project?.title || "Algemeen"}
                    {task.deadline && ` · ${new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[#868564]/15 flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center gap-1 text-[11px] text-[#868564] hover:text-[#2D2D23] transition-colors"
          >
            {active.length} open
            <ChevronDown
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <ArrowUpRight className="h-4 w-4 text-[#2D2D23]/40" />
        </div>
      </div>
    </WidgetShell>
  );
}