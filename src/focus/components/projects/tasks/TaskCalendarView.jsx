import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { startOfWeek, addDays, isSameDay, parseISO, format } from "date-fns";
import { nl } from "date-fns/locale";
import { taskStatusMeta, isTaskDone } from "@/lib/projectStatus";

/** TaskCalendarView — week grid. Tasks land on their deadline day; tasks
 *  without a deadline are listed underneath. Cards open the editor on click. */
export default function TaskCalendarView({ tasks, onEdit }) {
  const [start, setStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const onDay = (d) => tasks.filter((t) => t.deadline && isSameDay(parseISO(t.deadline), d));
  const noDate = tasks.filter((t) => !t.deadline);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setStart(addDays(start, -7))} className="h-8 w-8 rounded-lg glass-1 flex items-center justify-center hover:bg-foreground/5 transition"><ChevronLeft className="h-4 w-4" /></button>
        <p className="text-sm font-medium tabular-nums">{format(start, "d MMM", { locale: nl })} — {format(addDays(start, 6), "d MMM yyyy", { locale: nl })}</p>
        <button onClick={() => setStart(addDays(start, 7))} className="h-8 w-8 rounded-lg glass-1 flex items-center justify-center hover:bg-foreground/5 transition"><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        {days.map((d) => {
          const dayTasks = onDay(d);
          const isToday = isSameDay(d, new Date());
          return (
            <div key={d.toISOString()} className={cn("glass rounded-2xl p-2.5 min-h-[130px] flex flex-col", isToday && "ring-1 ring-olive/40")}>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(d, "EEEEEE", { locale: nl })}</span>
                <span className={cn("text-sm font-semibold tabular-nums", isToday && "text-olive")}>{format(d, "d")}</span>
              </div>
              <div className="space-y-1.5 flex-1">
                {dayTasks.map((t) => {
                  const meta = taskStatusMeta[t.status] || taskStatusMeta.te_specifieren;
                  return (
                    <button key={t.id} onClick={() => onEdit(t)} className="w-full text-left p-1.5 rounded-lg bg-foreground/[0.04] hover:bg-foreground/[0.08] transition">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dot)} />
                        <span className={cn("text-xs truncate flex-1", isTaskDone(t) && "line-through text-muted-foreground")}>{t.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {noDate.length > 0 && (
        <div className="glass rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Zonder deadline · {noDate.length}</p>
          <div className="flex flex-wrap gap-1.5">
            {noDate.map((t) => (
              <button key={t.id} onClick={() => onEdit(t)} className="px-2.5 py-1 rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] text-xs transition">{t.title}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}