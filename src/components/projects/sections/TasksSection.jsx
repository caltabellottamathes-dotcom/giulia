import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassButton from "@/components/glass/GlassButton";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Plus, Trash2, Pencil } from "lucide-react";
import { taskStatusMeta, taskStatusOptions, isTaskDone, parseContext } from "@/lib/projectStatus";
import { InlineText } from "@/components/projects/InlineEdit";
import TaskEditPanel from "@/components/projects/TaskEditPanel";
import StatusGrid from "@/components/projects/StatusGrid";
import FoldOutCard from "@/components/projects/FoldOutCard";

const BOARD_COLUMNS = [
  { key: "te_specifieren", label: "Te specificeren" },
  { key: "gepland", label: "Gepland" },
  { key: "actief", label: "Actief" },
  { key: "wacht", label: "Wacht op" },
  { key: "klaar", label: "Klaar" },
];

const viewTabs = [
  { key: "hierarchy", label: "Structuur" },
  { key: "board", label: "Bord" },
  { key: "list", label: "Lijst" },
];

export default function TasksSection({ project, tasks, reload }) {
  const [view, setView] = useState("hierarchy");
  const [openCards, setOpenCards] = useState({});
  const [editTask, setEditTask] = useState(null);
  const [newContext, setNewContext] = useState(null);
  const [listSort, setListSort] = useState("context");

  const toggle = (k) => setOpenCards((c) => ({ ...c, [k]: !c[k] }));

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

  const renameOnd = async (oldOnd, newOnd) => {
    if (!newOnd || newOnd === oldOnd) return;
    const updates = tasks
      .filter((t) => parseContext(t.context).ond === oldOnd)
      .map((t) => ({ id: t.id, context: `${newOnd} · ${parseContext(t.context).sub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };
  const renameSub = async (ond, oldSub, newSub) => {
    if (!newSub || newSub === oldSub) return;
    const updates = tasks
      .filter((t) => { const p = parseContext(t.context); return p.ond === ond && p.sub === oldSub; })
      .map((t) => ({ id: t.id, context: `${ond} · ${newSub}` }));
    if (updates.length) await base44.entities.Task.bulkUpdate(updates);
    reload();
  };

  const hierarchy = {};
  tasks.forEach((t) => {
    const { ond, sub } = parseContext(t.context);
    if (!hierarchy[ond]) hierarchy[ond] = {};
    if (!hierarchy[ond][sub]) hierarchy[ond][sub] = [];
    hierarchy[ond][sub].push(t);
  });

  const splitCode = (ond) => {
    const idx = ond.indexOf(" — ");
    if (idx > 0) return { code: ond.slice(0, idx), name: ond.slice(idx + 3) };
    return { code: "", name: ond };
  };

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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl glass-1 p-1">
          {viewTabs.map((v) => (
            <button key={v.key} onClick={() => setView(v.key)} className={cn("px-3.5 py-1.5 text-xs rounded-lg transition", view === v.key ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground")}>
              {v.label}
            </button>
          ))}
        </div>
        <GlassButton variant="glass" size="sm" onClick={() => { setEditTask(null); setNewContext(""); }}>
          <Plus className="h-3.5 w-3.5" /> Nieuwe taak
        </GlassButton>
      </div>

      {view === "hierarchy" && (
        <div className="space-y-7">
          {Object.entries(hierarchy).map(([ond, subs]) => {
            const ondTasks = Object.values(subs).flat();
            const ondDone = ondTasks.filter(isTaskDone).length;
            const { code, name } = splitCode(ond);
            return (
              <div key={ond}>
                {/* Onderdeel header — big code as graphic, name editable */}
                <div className="flex items-baseline gap-3 mb-3 px-1">
                  {code && <span className="text-3xl font-display font-bold text-foreground/12 tabular-nums leading-none select-none">{code}</span>}
                  <InlineText value={name} placeholder="Onderdeel" onCommit={(v) => renameOnd(ond, v ? (code ? `${code} — ${v}` : v) : ond)} className="text-lg font-display font-semibold hover:bg-foreground/5" />
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums shrink-0">{ondDone}/{ondTasks.length} klaar</span>
                  <button onClick={() => { setEditTask(null); setNewContext(`${ond} · `); }} className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0" title="Subonderdeel toevoegen">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Subonderdelen as fold-out cards */}
                <div className="space-y-2.5">
                  {Object.entries(subs).map(([sub, subTasks]) => {
                    const d = subTasks.filter(isTaskDone).length;
                    const cardKey = `${ond}::${sub}`;
                    const isOpen = !!openCards[cardKey];
                    const isFlat = sub === ond; // onderdeel without real subonderdeel
                    const label = isFlat ? "Taken" : sub;
                    return (
                      <FoldOutCard
                        key={cardKey}
                        open={isOpen}
                        onToggle={() => toggle(cardKey)}
                        header={
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {!isFlat ? (
                                <InlineText value={sub} placeholder="Subonderdeel" onCommit={(v) => renameSub(ond, sub, v)} className="text-sm font-medium truncate hover:bg-foreground/5" />
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                              )}
                              <span className="text-[11px] text-muted-foreground tabular-nums ml-auto shrink-0">{d}/{subTasks.length}</span>
                            </div>
                            <StatusGrid tasks={subTasks} size="sm" />
                          </div>
                        }
                      >
                        <div className="space-y-0.5 pt-3">
                          {[...subTasks].sort((a, b) => isTaskDone(a) - isTaskDone(b)).map((task) => {
                            const done = isTaskDone(task);
                            const meta = taskStatusMeta[task.status] || taskStatusMeta.te_specifieren;
                            return (
                              <div key={task.id} className="group flex items-center gap-3 p-2 -mx-1 rounded-lg hover:bg-foreground/[0.04] transition">
                                <button onClick={() => toggleDone(task)} className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition", done ? "bg-emerald-500 border-emerald-500" : "border-border/60 hover:border-olive")}>
                                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />}
                                </button>
                                <span className={cn("text-sm flex-1 leading-snug min-w-0 truncate", done ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</span>
                                <select
                                  value={task.status}
                                  onChange={(e) => setStatus(task, e.target.value)}
                                  className="text-[10px] uppercase tracking-wider bg-foreground/[0.04] border border-border/40 rounded-full px-2 py-0.5 outline-none cursor-pointer shrink-0 hover:bg-foreground/[0.08]"
                                >
                                  {taskStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <button onClick={() => { setNewContext(null); setEditTask(task); }} className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 transition" title="Bewerken">
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button onClick={() => delTask(task)} className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 shrink-0 transition" title="Verwijderen">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                          <button onClick={() => { setEditTask(null); setNewContext(`${ond} · ${sub}`); }} className="w-full flex items-center gap-2 mt-1 px-2 py-2 -mx-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition text-sm">
                            <Plus className="h-3.5 w-3.5" /> Taak toevoegen
                          </button>
                        </div>
                      </FoldOutCard>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {Object.keys(hierarchy).length === 0 && <p className="text-sm text-muted-foreground py-12 text-center">Nog geen taken. Voeg er een toe.</p>}
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

function normalizeStatus(s) {
  if (["klaar", "done", "completed"].includes(s)) return "klaar";
  if (["actief", "in_progress", "today"].includes(s)) return "actief";
  if (["gepland", "upcoming"].includes(s)) return "gepland";
  if (["wacht", "waiting"].includes(s)) return "wacht";
  if (["gepauzeerd", "paused"].includes(s)) return "te_specifieren";
  return "te_specifieren";
}