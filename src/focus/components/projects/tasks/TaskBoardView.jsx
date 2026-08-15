import React from "react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { isTaskDone, parseContext, taskStatusMeta } from "@/lib/projectStatus";

const COLUMNS = ["te_specifieren", "gepland", "actief", "wacht", "klaar"];

const bucket = (t) => {
  if (isTaskDone(t)) return "klaar";
  const s = t.status;
  if (s === "actief" || s === "in_progress" || s === "today") return "actief";
  if (s === "gepland" || s === "upcoming") return "gepland";
  if (s === "wacht" || s === "waiting" || s === "gepauzeerd" || s === "paused" || s === "delegated") return "wacht";
  return "te_specifieren";
};

/** TaskBoardView — kanban columns by status. Cards open the editor on click. */
export default function TaskBoardView({ tasks, onEdit }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => bucket(t) === col);
        const meta = taskStatusMeta[col];
        return (
          <div key={col} className="glass rounded-2xl p-3 flex flex-col min-h-[180px]">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
              <span className="text-xs font-semibold uppercase tracking-wider">{meta.label}</span>
              <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{colTasks.length}</span>
            </div>
            <div className="space-y-2 flex-1">
              {colTasks.map((t) => {
                const { ond } = parseContext(t.context);
                return (
                  <button key={t.id} onClick={() => onEdit(t)} className="w-full text-left p-3 rounded-xl bg-foreground/[0.04] hover:bg-foreground/[0.07] transition">
                    <p className="text-sm font-medium leading-snug">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">{ond}</p>
                    {t.deadline && <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">{format(parseISO(t.deadline), "d MMM", { locale: nl })}</p>}
                  </button>
                );
              })}
              {colTasks.length === 0 && <p className="text-[11px] text-muted-foreground/50 text-center py-4">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}