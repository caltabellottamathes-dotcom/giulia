import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Plus } from "lucide-react";
import { taskStatusMeta, isTaskDone, parseContext } from "@/lib/projectStatus";
import { InlineText } from "@/components/projects/InlineEdit";
import TaskEditPanel from "@/components/projects/TaskEditPanel";

const tierColor = (pct) => (pct >= 100 ? "bg-olive" : pct >= 50 ? "bg-powder" : pct > 0 ? "bg-steel" : "bg-steel/30");

const deriveStatus = (ondTasks) => {
  if (!ondTasks.length) return "te_specifieren";
  if (ondTasks.every(isTaskDone)) return "klaar";
  if (ondTasks.some((t) => t.status === "actief")) return "actief";
  if (ondTasks.some((t) => t.status === "wacht")) return "wacht";
  if (ondTasks.every((t) => t.status === "gepland")) return "gepland";
  return "gepland";
};

/**
 * TasksSection — shows only the main tasks: the onderdeel-level work items with
 * their aggregate progress and status. No drill-down into sub-tasks. Mobile
 * friendly (single column on small screens).
 */
export default function TasksSection({ project, tasks, reload }) {
  const [editTask, setEditTask] = useState(null);
  const [newContext, setNewContext] = useState(null);

  const hierarchy = {};
  tasks.forEach((t) => {
    const { ond } = parseContext(t.context);
    if (!hierarchy[ond]) hierarchy[ond] = [];
    hierarchy[ond].push(t);
  });

  const renameOnd = async (oldOnd, newOnd) => {
    if (!newOnd || newOnd === oldOnd) return;
    const updates = tasks
      .filter((t) => parseContext(t.context).ond === oldOnd)
      .map((t) => ({ id: t.id, context: `${newOnd} · ${parseContext(t.context).sub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-display font-semibold">Hoofdtaken</h3>
          <p className="text-[11px] text-muted-foreground">{Object.keys(hierarchy).length} onderdelen</p>
        </div>
        <GlassButton variant="glass" size="sm" onClick={() => { setEditTask(null); setNewContext(""); }}>
          <Plus className="h-3.5 w-3.5" /> Nieuwe taak
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4 items-start">
        {Object.entries(hierarchy).map(([ond, ondTasks]) => {
          const done = ondTasks.filter(isTaskDone).length;
          const pct = ondTasks.length ? Math.round((done / ondTasks.length) * 100) : 0;
          const complete = ondTasks.length > 0 && done === ondTasks.length;
          const meta = taskStatusMeta[deriveStatus(ondTasks)] || taskStatusMeta.te_specifieren;
          return (
            <div key={ond} className="glass rounded-2xl p-4 lg:p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", complete ? "bg-olive text-ivory" : "bg-foreground/[0.04] text-muted-foreground")}>
                  {complete ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-display font-bold tabular-nums">{pct}%</span>}
                </span>
                <InlineText value={ond} placeholder="Onderdeel" onCommit={(v) => renameOnd(ond, v)} className="text-base font-display font-semibold flex-1 hover:bg-foreground/5" />
              </div>
              <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden mb-3">
                <div className={cn("h-full rounded-full transition-all duration-700", tierColor(pct))} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>{done}/{ondTasks.length} klaar</span>
                <span className={cn("uppercase tracking-wider font-semibold", meta.color)}>{meta.label}</span>
              </div>
            </div>
          );
        })}
        {Object.keys(hierarchy).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center col-span-full">Nog geen taken. Voeg er een toe.</p>}
      </div>

      <TaskEditPanel open={newContext !== null || !!editTask} onClose={() => { setNewContext(null); setEditTask(null); }} task={editTask} context={newContext ?? undefined} projectId={project.id} onSaved={reload} />
    </div>
  );
}