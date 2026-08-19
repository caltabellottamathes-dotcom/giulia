import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { taskStatusMeta, isTaskDone, parseContext } from "@/lib/projectStatus";
import { InlineText } from "@/focus/components/projects/InlineEdit";

/**
 * TaskListView — onderdelen as collapsible cards. Expanding reveals the
 * sub-onderdelen with their tasks (title + status dot + deadline), but no
 * deeper detail — exactly the onderverdeling without the smallest details.
 */
export default function TaskListView({ tasks, onEdit, onRenameOnd, onSchedule }) {
  const [open, setOpen] = useState({});

  const hierarchy = {};
  tasks.forEach((t) => {
    const { ond } = parseContext(t.context);
    (hierarchy[ond] ||= []).push(t);
  });

  const toggle = (ond) => setOpen((s) => ({ ...s, [ond]: !s[ond] }));

  return (
    <div className="space-y-2">
      {Object.entries(hierarchy).map(([ond, ondTasks]) => {
        const done = ondTasks.filter(isTaskDone).length;
        const pct = ondTasks.length ? Math.round((done / ondTasks.length) * 100) : 0;
        const isOpen = open[ond];
        const complete = ondTasks.length > 0 && done === ondTasks.length;

        const subs = {};
        ondTasks.forEach((t) => {
          const { sub } = parseContext(t.context);
          (subs[sub] ||= []).push(t);
        });

        return (
          <div key={ond} className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => toggle(ond)} className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition shrink-0">
                <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
              </button>
              <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-sm font-display font-bold tabular-nums shrink-0", complete ? "bg-olive text-ivory" : "bg-foreground/[0.04] text-muted-foreground")}>{pct}%</span>
              <InlineText value={ond} placeholder="Onderdeel" onCommit={(v) => onRenameOnd?.(ond, v)} className="text-sm font-display font-semibold flex-1 hover:bg-foreground/5 rounded px-1 -mx-1" />
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{done}/{ondTasks.length} klaar</span>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/30">
                {Object.entries(subs).map(([sub, subTasks]) => (
                  <div key={sub}>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80 mb-1.5 mt-3">{sub}</p>
                    <div className="space-y-0.5">
                      {subTasks.map((t) => {
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
      {Object.keys(hierarchy).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nog geen taken.</p>}
    </div>
  );
}