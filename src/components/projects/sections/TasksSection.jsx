import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Plus, Trash2, ChevronDown, Pencil } from "lucide-react";
import { taskStatusMeta, taskStatusOptions, isTaskDone, parseContext } from "@/lib/projectStatus";
import { InlineText } from "@/components/projects/InlineEdit";
import TaskEditPanel from "@/components/projects/TaskEditPanel";

const BOARD_COLUMNS = [
  { key: "te_specifieren", label: "Te specificeren" },
  { key: "gepland", label: "Gepland" },
  { key: "actief", label: "Actief" },
  { key: "wacht", label: "Wacht op" },
  { key: "klaar", label: "Klaar" },
];

const viewTabs = [
  { key: "hierarchy", label: "Hiërarchisch" },
  { key: "board", label: "Bord" },
  { key: "list", label: "Lijst" },
];

export default function TasksSection({ project, tasks, reload }) {
  const [view, setView] = useState("hierarchy");
  const [collapsed, setCollapsed] = useState({});
  const [editTask, setEditTask] = useState(null);   // existing task
  const [newContext, setNewContext] = useState(null); // context for new task
  const [listSort, setListSort] = useState("context");

  const toggle = (k) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));

  const toggleDone = async (task) => {
    const next = isTaskDone(task) ? "actief" : "klaar";
    await base44.entities.Task.update(task.id, { status: next });
    reload();
  };

  const setStatus = async (task, status) => {
    await base44.entities.Task.update(task.id, { status });
    reload();
  };

  const delTask = async (task) => {
    if (!window.confirm("Taak verwijderen?")) return;
    await base44.entities.Task.delete(task.id);
    reload();
  };

  // Rename an onderdeel across all its tasks
  const renameOnd = async (oldOnd, newOnd) => {
    if (!newOnd || newOnd === oldOnd) return;
    const updates = tasks
      .filter((t) => parseContext(t.context).ond === oldOnd)
      .map((t) => ({ id: t.id, context: `${newOnd} · ${parseContext(t.context).sub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };

  // Rename a subonderdeel across its tasks
  const renameSub = async (ond, oldSub, newSub) => {
    if (!newSub || newSub === oldSub) return;
    const updates = tasks
      .filter((t) => {
        const p = parseContext(t.context);
        return p.ond === ond && p.sub === oldSub;
      })
      .map((t) => ({ id: t.id, context: `${ond} · ${newSub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };

  // Build hierarchy
  const hierarchy = {};
  tasks.forEach((t) => {
    const { ond, sub } = parseContext(t.context);
    if (!hierarchy[ond]) hierarchy[ond] = {};
    if (!hierarchy[ond][sub]) hierarchy[ond][sub] = [];
    hierarchy[ond][sub].push(t);
  });

  const newTaskPanel = (
    <TaskEditPanel
      open={newContext !== null || !!editTask}
      onClose={() => { setNewContext(null); setEditTask(null); }}
      task={editTask}
      context={newContext ?? undefined}
      projectId={project.id}
      onSaved={reload}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl glass-1 p-1">
          {viewTabs.map((v) => (
            <button key={v.key} onClick={() => setView(v.key)} className={cn("px-3 py-1.5 text-xs rounded-lg transition", view === v.key ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground")}>
              {v.label}
            </button>
          ))}
        </div>
        <GlassButton variant="glass" size="sm" onClick={() => { setEditTask(null); setNewContext(""); }}>
          <Plus className="h-3.5 w-3.5" /> Nieuwe taak
        </GlassButton>
      </div>

      {view === "hierarchy" && (
        <div className="space-y-5">
          {Object.entries(hierarchy).map(([ond, subs]) => {
            const ondTasks = Object.values(subs).flat();
            const ondDone = ondTasks.filter(isTaskDone).length;
            return (
              <div key={ond} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => toggle(ond)} className="h-6 w-6 rounded-lg glass-1 flex items-center justify-center shrink-0">
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed[ond] && "-rotate-90")} />
                  </button>
                  <InlineText value={ond} placeholder="Onderdeel" onCommit={(v) => renameOnd(ond, v)} className="text-base font-display font-semibold flex-1 hover:bg-foreground/5" />
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{ondDone}/{ondTasks.length} klaar</span>
                  <button onClick={() => { setEditTask(null); setNewContext(`${ond} · `); }} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0" title="Subonderdeel toevoegen">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {!collapsed[ond] && (
                  <div className="space-y-4 pl-9">
                    {Object.entries(subs).map(([sub, subTasks]) => {
                      const d = subTasks.filter(isTaskDone).length;
                      return (
                        <div key={sub} className="rounded-xl bg-foreground/[0.02] p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <InlineText value={sub} placeholder="Subonderdeel" onCommit={(v) => renameSub(ond, sub, v)} className="text-sm font-medium flex-1 hover:bg-foreground/5" />
                            <span className="text-[11px] text-muted-foreground tabular-nums">{d}/{subTasks.length}</span>
                            <button onClick={() => { setEditTask(null); setNewContext(`${ond} · ${sub}`); }} className="h-6 w-6 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground" title="Taak toevoegen">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="space-y-0.5">
                            {[...subTasks].sort((a, b) => isTaskDone(a) - isTaskDone(b)).map((task) => {
                              const done = isTaskDone(task);
                              const meta = taskStatusMeta[task.status] || taskStatusMeta.te_specifieren;
                              return (
                                <div key={task.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/[0.04] transition">
                                  <button onClick={() => toggleDone(task)} className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition", done ? "bg-emerald-500 border-emerald-500" : "border-border/60")}>
                                    {done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />}
                                  </button>
                                  <span className={cn("text-sm flex-1 leading-snug", done ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</span>
                                  <select value={task.status} onChange={(e) => setStatus(task, e.target.value)} className="text-[10px] uppercase tracking-wider bg-transparent border border-border/40 rounded-lg px-1.5 py-0.5 outline-none cursor-pointer shrink-0">
                                    {taskStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                  <button onClick={() => { setNewContext(null); setEditTask(task); }} className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0" title="Bewerken">
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button onClick={() => delTask(task)} className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 shrink-0" title="Verwijderen">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(hierarchy).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nog geen taken. Voeg er een toe.</p>}
        </div>
      )}

      {view === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {BOARD_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => normalizeStatus(t.status) === col.key);
            return (
              <div key={col.key} className="glass rounded-2xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{col.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => {
                    const done = isTaskDone(task);
                    return (
                      <div key={task.id} onClick={() => { setNewContext(null); setEditTask(task); }} className="cursor-pointer rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] p-3 transition">
                        <p className={cn("text-sm leading-snug", done && "line-through text-muted-foreground")}>{task.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">{parseContext(task.context).sub}</p>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <p className="text-[11px] text-muted-foreground/60 text-center py-4">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "list" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Sorteren:</span>
            {["context", "status", "deadline"].map((s) => (
              <button key={s} onClick={() => setListSort(s)} className={cn("text-xs px-2 py-1 rounded-lg", listSort === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{s}</button>
            ))}
          </div>
          <div className="divide-y divide-border/30">
            {[...tasks].sort((a, b) => {
              if (listSort === "deadline") return (a.deadline || "9999").localeCompare(b.deadline || "9999");
              if (listSort === "status") return (a.status || "").localeCompare(b.status || "");
              return (a.context || "").localeCompare(b.context || "");
            }).map((task) => {
              const done = isTaskDone(task);
              const meta = taskStatusMeta[task.status] || taskStatusMeta.te_specifieren;
              const { ond, sub } = parseContext(task.context);
              return (
                <div key={task.id} onClick={() => { setNewContext(null); setEditTask(task); }} className="group flex items-center gap-3 px-4 py-3 hover:bg-foreground/[0.03] cursor-pointer transition">
                  <button onClick={(e) => { e.stopPropagation(); toggleDone(task); }} className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0", done ? "bg-emerald-500 border-emerald-500" : "border-border/60")}>
                    {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </button>
                  <span className={cn("text-sm flex-1", done && "line-through text-muted-foreground")}>{task.title}</span>
                  <span className="text-[11px] text-muted-foreground hidden md:block">{ond}</span>
                  <span className="text-[11px] text-muted-foreground hidden lg:block">{sub}</span>
                  <span className={cn("text-[10px] uppercase tracking-wider font-semibold shrink-0", meta.color)}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {newTaskPanel}
    </div>
  );
}

// Map legacy statuses to canonical board columns
function normalizeStatus(s) {
  if (["klaar", "done", "completed"].includes(s)) return "klaar";
  if (["actief", "in_progress", "today"].includes(s)) return "actief";
  if (["gepland", "upcoming"].includes(s)) return "gepland";
  if (["wacht", "waiting"].includes(s)) return "wacht";
  if (["gepauzeerd", "paused"].includes(s)) return "te_specifieren";
  return "te_specifieren";
}