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

const tierColor = (pct) => {
  if (pct >= 100) return "bg-olive";
  if (pct >= 50) return "bg-powder";
  if (pct > 0) return "bg-steel";
  return "bg-steel/30";
};

const deriveOndStatus = (ondTasks) => {
  if (!ondTasks.length) return "te_specifieren";
  if (ondTasks.every(isTaskDone)) return "klaar";
  if (ondTasks.some((t) => t.status === "actief")) return "actief";
  if (ondTasks.some((t) => t.status === "wacht")) return "wacht";
  if (ondTasks.every((t) => t.status === "gepland")) return "gepland";
  return "gepland";
};

export default function TasksSection({ project, tasks, reload }) {
  const [view, setView] = useState("hierarchy");
  const [expanded, setExpanded] = useState(null);
  const [editTask, setEditTask] = useState(null);   // existing task
  const [newContext, setNewContext] = useState(null); // context for new task
  const [listSort, setListSort] = useState("context");

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {Object.entries(hierarchy).map(([ond, subs]) => {
            const ondTasks = Object.values(subs).flat();
            const ondDone = ondTasks.filter(isTaskDone).length;
            const pct = ondTasks.length ? Math.round((ondDone / ondTasks.length) * 100) : 0;
            const isOpen = expanded === ond;
            const complete = ondTasks.length > 0 && ondDone === ondTasks.length;
            return (
              <div key={ond} className={cn("glass rounded-2xl overflow-hidden transition-all duration-300", isOpen && "sm:col-span-2 xl:col-span-3")}>
                <button onClick={() => setExpanded(isOpen ? null : ond)} className="w-full p-5 flex items-center gap-3 text-left">
                  <span className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", isOpen ? "bg-olive text-ivory" : "bg-foreground/[0.04] text-muted-foreground")}>
                    {complete ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-display font-bold tabular-nums">{pct}%</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <InlineText value={ond} placeholder="Onderdeel" onCommit={(v) => renameOnd(ond, v)} className="text-base font-display font-semibold hover:bg-foreground/5" />
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{ondDone}/{ondTasks.length} klaar · {Object.keys(subs).length} subonderdelen</p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-180")} />
                </button>
                <div className="px-5 pb-4">
                  <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", tierColor(pct))} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {isOpen && (
                  <div className="p-5 pt-3 space-y-4 border-t border-border/40">
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
                                  <button onClick={() => toggleDone(task)} className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition", done ? "bg-olive border-olive" : "border-border/60")}>
                                    {done ? <CheckCircle2 className="h-4 w-4 text-ivory" /> : <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />}
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
                    <button onClick={() => { setEditTask(null); setNewContext(`${ond} · `); }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] transition border border-dashed border-border/50">
                      <Plus className="h-3.5 w-3.5" /> Subonderdeel toevoegen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(hierarchy).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center col-span-full">Nog geen taken. Voeg er een toe.</p>}
        </div>
      )}

      {view === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3 items-start">
          {BOARD_COLUMNS.map((col) => {
            const ondList = Object.entries(hierarchy).map(([ond, subs]) => {
              const ondTasks = Object.values(subs).flat();
              const ondDone = ondTasks.filter(isTaskDone).length;
              const pct = ondTasks.length ? Math.round((ondDone / ondTasks.length) * 100) : 0;
              return { ond, subs, ondTasks, ondDone, pct, status: deriveOndStatus(ondTasks) };
            }).filter((o) => o.status === col.key);
            const accent = col.key === "klaar" ? "bg-olive" : col.key === "actief" ? "bg-powder" : col.key === "gepland" ? "bg-powder/55" : col.key === "wacht" ? "bg-steel" : "bg-steel/40";
            return (
              <div key={col.key} className="glass rounded-2xl p-3 flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full", accent)} />
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex-1">{col.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{ondList.length}</span>
                </div>
                <div className="space-y-2">
                  {ondList.map((o) => {
                    const isOpen = expanded === o.ond;
                    const complete = o.ondTasks.length > 0 && o.ondDone === o.ondTasks.length;
                    return (
                      <div key={o.ond} className="rounded-xl bg-foreground/[0.03] overflow-hidden">
                        <button onClick={() => setExpanded(isOpen ? null : o.ond)} className="w-full p-3 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0", complete ? "bg-olive text-ivory" : "bg-muted text-muted-foreground")}>
                              {complete && <CheckCircle2 className="h-3 w-3" />}
                            </span>
                            <span className="text-sm font-medium flex-1 truncate">{o.ond}</span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">{o.ondDone}/{o.ondTasks.length}</span>
                          </div>
                          <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-700", tierColor(o.pct))} style={{ width: `${o.pct}%` }} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-border/30">
                            {Object.entries(o.subs).map(([sub, subTasks]) => {
                              const d = subTasks.filter(isTaskDone).length;
                              return (
                                <div key={sub}>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 tabular-nums">{sub} · {d}/{subTasks.length}</p>
                                  <div className="space-y-1">
                                    {subTasks.map((t) => {
                                      const done = isTaskDone(t);
                                      return (
                                        <div key={t.id} className="flex items-center gap-2">
                                          <span className={cn("h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0", done ? "bg-olive border-olive" : "border-border/60")}>
                                            {done && <CheckCircle2 className="h-2.5 w-2.5 text-ivory" />}
                                          </span>
                                          <span className={cn("text-[11px] flex-1 truncate", done && "line-through text-muted-foreground")}>{t.title}</span>
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
                  {ondList.length === 0 && <p className="text-[11px] text-muted-foreground/50 text-center py-4">—</p>}
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
                  <button onClick={(e) => { e.stopPropagation(); toggleDone(task); }} className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0", done ? "bg-olive border-olive" : "border-border/60")}>
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