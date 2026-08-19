import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassButton from "@/system/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { Plus, List, LayoutGrid, CalendarDays } from "lucide-react";
import { parseContext } from "@/lib/projectStatus";
import TaskEditPanel from "@/focus/components/projects/TaskEditPanel";
import TaskListView from "@/focus/components/projects/tasks/TaskListView";
import TaskBoardView from "@/focus/components/projects/tasks/TaskBoardView";
import TaskCalendarView from "@/focus/components/projects/tasks/TaskCalendarView";

const VIEWS = [
  { id: "lijst", label: "Lijst", icon: List },
  { id: "bord", label: "Bord", icon: LayoutGrid },
  { id: "kalender", label: "Kalender", icon: CalendarDays },
];

/**
 * TasksSection — three views: Lijst (collapsible onderdelen → subonderdelen),
 * Bord (kanban per status) and Kalender (weekgrid op deadline).
 */
export default function TasksSection({ project, tasks, reload }) {
  const [view, setView] = useState("lijst");
  const [editTask, setEditTask] = useState(null);
  const [newContext, setNewContext] = useState(null);

  const renameOnd = async (oldOnd, newOnd) => {
    if (!newOnd || newOnd === oldOnd) return;
    const updates = tasks
      .filter((t) => parseContext(t.context).ond === oldOnd)
      .map((t) => ({ id: t.id, context: `${newOnd} · ${parseContext(t.context).sub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };

  // Inplannen — een project-onderdeel wordt een echte taak: status naar "today"
  // en deadline vandaag, zodat het in de takenlijst verschijnt.
  const scheduleTask = async (t) => {
    const today = new Date().toISOString().split("T")[0];
    await base44.entities.Task.update(t.id, { status: "today", deadline: t.deadline || today });
    reload();
  };

  const ondCount = new Set(tasks.map((t) => parseContext(t.context).ond)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-display font-semibold">Taken</h3>
          <p className="text-[11px] text-muted-foreground">{tasks.length} taken · {ondCount} onderdelen</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex glass-1 rounded-full p-0.5">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => setView(v.id)} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", view === v.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                <v.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
          <GlassButton variant="glass" size="sm" onClick={() => { setEditTask(null); setNewContext(""); }}>
            <Plus className="h-3.5 w-3.5" /> Nieuwe taak
          </GlassButton>
        </div>
      </div>

      {view === "lijst" && <TaskListView tasks={tasks} onEdit={setEditTask} onRenameOnd={renameOnd} onSchedule={scheduleTask} />}
      {view === "bord" && <TaskBoardView tasks={tasks} onEdit={setEditTask} />}
      {view === "kalender" && <TaskCalendarView tasks={tasks} onEdit={setEditTask} />}

      <TaskEditPanel open={newContext !== null || !!editTask} onClose={() => { setNewContext(null); setEditTask(null); }} task={editTask} context={newContext ?? undefined} projectId={project.id} onSaved={reload} />
    </div>
  );
}