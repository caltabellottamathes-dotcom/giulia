import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Layers } from "lucide-react";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { taskStatusMeta, isTaskDone, parseContext } from "@/lib/projectStatus";
import { InlineText } from "@/focus/components/projects/InlineEdit";

/**
 * TaskListView — collapsible cards. When ProjectTheme records exist and
 * tasks carry theme_id, groups by theme (themes → subthemes). Otherwise
 * falls back to context-based (onderdeel · sub) grouping. Unthemed tasks
 * land in an "Algemeen" bucket.
 */
export default function TaskListView({ tasks, themes = [], onEdit, onRenameOnd, onSchedule }) {
  const [open, setOpen] = useState({});

  const themeMap = new Map((themes || []).map((t) => [t.id, t]));
  const hasThemed = tasks.some((t) => t.theme_id && themeMap.has(t.theme_id));

  const buckets = hasThemed ? themeBuckets(tasks, themes, themeMap) : contextBuckets(tasks);
  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-2">
      {buckets.map((b) => {
        const isOpen = open[b.key];
        const complete = b.tasks.length > 0 && b.done === b.tasks.length;
        return (
          <div key={b.key} className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => toggle(b.key)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition shrink-0">
                <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
              </button>
              <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-sm font-display font-bold tabular-nums shrink-0", complete ? "bg-olive text-ivory" : "bg-foreground/[0.04] text-muted-foreground")}>{b.pct}%</span>
              {b.isTheme ? (
                <span className="text-sm font-display font-semibold flex-1 flex items-center gap-1.5 truncate">
                  <Layers className="h-3.5 w-3.5 text-olive shrink-0" />
                  {b.name}
                </span>
              ) : (
                <InlineText value={b.name} placeholder="Onderdeel" onCommit={(v) => onRenameOnd?.(b.name, v)} className="text-sm font-display font-semibold flex-1 hover:bg-foreground/5 rounded px-1 -mx-1" />
              )}
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{b.done}/{b.tasks.length} klaar</span>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/30">
                {b.subs.map((s) => (
                  <div key={s.key}>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 mb-1.5 mt-3">{s.name}</p>
                    <div className="space-y-0.5">
                      {s.tasks.map((t) => {
                        const meta = taskStatusMeta[t.status] || taskStatusMeta.te_specifieren;
                        const isUnscheduled = t.status === "unscheduled";
                        return (
                          <div key={t.id} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-foreground/[0.04] transition text-left group">
                            <button onClick={() => onEdit(t)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                              <span className={cn("h-2 w-2 rounded-full shrink-0", meta.dot)} />
                              <span className={cn("text-sm flex-1 truncate", isTaskDone(t) && "line-through text-muted-foreground")}>{t.title}</span>
                              {t.deadline && <span className="text-[10px] text-muted-foreground tabular-nums">{format(parseISO(t.deadline), "d MMM", { locale: nl })}</span>}
                              {!isUnscheduled && <span className={cn("text-[10px] uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition", meta.color)}>{meta.label}</span>}
                            </button>
                            {isUnscheduled && onSchedule && (
                              <button onClick={() => onSchedule(t)} className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-olive/15 text-olive hover:bg-olive hover:text-ivory transition shrink-0">
                                Inplannen
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {buckets.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nog geen taken.</p>}
    </div>
  );
}

function themeBuckets(tasks, themes, themeMap) {
  const topLevel = themes.filter((t) => !t.parent_theme_id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const subByParent = {};
  themes.filter((t) => t.parent_theme_id).forEach((t) => { (subByParent[t.parent_theme_id] ||= []).push(t); });

  const buckets = topLevel.map((th) => {
    const all = tasks.filter((t) => t.theme_id === th.id);
    const subs = [];
    const direct = all.filter((t) => !(subByParent[th.id] || []).some((st) => st.id === t.theme_id));
    if (direct.length) subs.push(makeSub("Algemeen", direct));
    (subByParent[th.id] || []).forEach((st) => {
      const ts = tasks.filter((t) => t.theme_id === st.id);
      if (ts.length) subs.push(makeSub(st.title, ts));
    });
    const done = all.filter(isTaskDone).length;
    return { key: `theme:${th.id}`, name: th.title, isTheme: true, tasks: all, done, pct: all.length ? Math.round((done / all.length) * 100) : 0, subs };
  });

  const unthemed = tasks.filter((t) => !t.theme_id || !themeMap.has(t.theme_id));
  if (unthemed.length) {
    const byCtx = {};
    unthemed.forEach((t) => {
      const { sub } = parseContext(t.context);
      (byCtx[sub] ||= []).push(t);
    });
    const subs = Object.entries(byCtx).map(([name, ts]) => makeSub(name, ts));
    const done = unthemed.filter(isTaskDone).length;
    buckets.push({ key: "ctx:_algemeen", name: "Algemeen", isTheme: false, tasks: unthemed, done, pct: unthemed.length ? Math.round((done / unthemed.length) * 100) : 0, subs });
  }
  return buckets;
}

function contextBuckets(tasks) {
  const map = {};
  tasks.forEach((t) => {
    const { ond, sub } = parseContext(t.context);
    if (!map[ond]) map[ond] = {};
    (map[ond][sub] ||= []).push(t);
  });
  return Object.entries(map).map(([ond, subsMap]) => {
    const all = Object.values(subsMap).flat();
    const subs = Object.entries(subsMap).map(([name, ts]) => makeSub(name, ts));
    const done = all.filter(isTaskDone).length;
    return { key: `ctx:${ond}`, name: ond, isTheme: false, tasks: all, done, pct: all.length ? Math.round((done / all.length) * 100) : 0, subs };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function makeSub(name, tasks) {
  const done = tasks.filter(isTaskDone).length;
  return { key: `${name}:${tasks[0]?.id || name}`, name, tasks, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}