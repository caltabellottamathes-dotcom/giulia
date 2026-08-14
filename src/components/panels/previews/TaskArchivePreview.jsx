import React from "react";
import { Archive, CheckCircle2 } from "lucide-react";
import { SectionLabel } from "./previewParts";

/** Taken-archief (naar /slick/archief), GIULIA-glass met live data. */
export default function TaskArchivePreview({ tasks, projects, onSelectTask }) {
  const doneTasks = (tasks || []).filter((t) => t.status === "completed");
  const doneProjects = (projects || []).filter((p) => p.status === "completed");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-5">
        <SectionLabel>{`Voltooide taken (${doneTasks.length})`}</SectionLabel>
        <div className="mt-3 flex flex-col gap-2">
          {doneTasks.length === 0 && <p className="text-ivory/45 text-sm text-center py-6">Nog niets voltooid.</p>}
          {doneTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTask?.(t)}
              className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 opacity-80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-sand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-ivory text-sm line-through truncate">{t.title}</p>
                <p className="text-ivory/50 text-xs capitalize">{t.priority || "taak"}</p>
              </div>
              <span className="text-ivory/40 text-xs tabular-nums">{t.deadline || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-5">
        <SectionLabel>{`Afgesloten projecten (${doneProjects.length})`}</SectionLabel>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {doneProjects.length === 0 && <p className="text-ivory/45 text-sm text-center py-6 col-span-2">Geen afgesloten projecten.</p>}
          {doneProjects.map((p) => (
            <div key={p.id} className="rounded-xl border border-white/12 bg-white/[0.06] p-4 opacity-80">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-ivory/50" />
                <p className="text-ivory text-sm font-medium truncate">{p.title}</p>
              </div>
              <p className="text-ivory/50 text-xs mt-1">{p.category || "Project"} · afgerond {p.deadline || "—"}</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-sand/60" style={{ width: "100%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}