import React, { useEffect, useState } from "react";
import { Clock, Calendar, Flag, ListTree, CheckCircle2, Circle } from "lucide-react";
import { SectionLabel } from "./previewParts";

/** Status-badge + labels — gedeeld met TasksPreview (geen circulaire import hier). */
export const STATUS_BADGE = {
  today: "bg-sand/20 text-sand border-sand/40",
  overdue: "bg-destructive/20 text-destructive border-destructive/40",
  upcoming: "bg-blue-grey/20 text-blue-grey border-blue-grey/40",
  waiting: "bg-smoke/20 text-smoke border-smoke/40",
  in_progress: "bg-olive/20 text-olive border-olive/40",
  delegated: "bg-powder/20 text-powder border-powder/40",
  completed: "bg-ivory/15 text-ivory border-ivory/30",
  todo: "bg-ivory/10 text-ivory/70 border-ivory/25",
};
export const STATUS_LABEL = {
  today: "Vandaag", overdue: "Te laat", upcoming: "Later", waiting: "Wacht",
  in_progress: "Bezig", delegated: "Giulia", completed: "Klaar", todo: "Open",
};
export function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || STATUS_BADGE.todo;
  const lbl = STATUS_LABEL[status] || status;
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border capitalize ${cls}`}>{lbl}</span>;
}

/** Taak-details paneel — naar het ontwerp van /slick/taak-details, in GIULIA-glass.
 *  Rendered binnen een geneste FloatingPanel (door TasksPreview). */
export default function TaskDetailPreview({ task, tasks, onSelect }) {
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    const arr = Array.isArray(task.subtasks) ? task.subtasks : [];
    setSubs(arr.map((s) => (typeof s === "string" ? { t: s, done: false } : s)));
  }, [task.id]);

  const toggle = (i) => setSubs((s) => s.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)));

  const meta = [
    { icon: Calendar, label: "Deadline", value: task.deadline || "—" },
    { icon: Clock, label: "Energie", value: task.energy_level || "—" },
    { icon: Flag, label: "Prioriteit", value: task.priority || "—" },
    { icon: ListTree, label: "Status", value: task.status || "—" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-7 pt-14 pb-8">
        <p className="text-ivory/55 text-[10px] uppercase tracking-[0.24em]">Taak</p>
        <h1 className="text-ivory text-2xl font-display font-semibold tracking-tight mt-1">Taak Details</h1>

        {/* Taak-wisselaar */}
        <div className="flex flex-wrap gap-2 mt-5">
          {(tasks || []).slice(0, 8).map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors truncate max-w-[160px] ${
                t.id === task.id
                  ? "bg-sand text-charcoal border-sand"
                  : "border-white/15 bg-white/5 text-ivory/70 hover:bg-white/10"
              }`}
            >
              {(t.title || "").slice(0, 22)}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-6 mt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-ivory text-xl font-semibold truncate">{task.title}</h2>
              <p className="text-xs text-ivory/55 mt-1 capitalize">{task.priority || "taak"}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>

          <div className="h-px bg-ivory/15 my-5" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {meta.map((m) => (
              <div key={m.label}>
                <p className="text-ivory/55 text-[10px] uppercase">{m.label}</p>
                <p className="text-ivory text-sm font-medium mt-1 flex items-center gap-1.5 capitalize">
                  <m.icon className="w-3.5 h-3.5 text-ivory/55" />
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {task.description ? (
            <>
              <div className="h-px bg-ivory/15 my-5" />
              <SectionLabel>Notities</SectionLabel>
              <p className="text-ivory/80 text-sm leading-relaxed mt-3 whitespace-pre-wrap">{task.description}</p>
            </>
          ) : null}

          {subs.length > 0 ? (
            <>
              <div className="h-px bg-ivory/15 my-5" />
              <SectionLabel>Subtaken</SectionLabel>
              <div className="mt-3 flex flex-col gap-2">
                {subs.map((s, i) => (
                  <button key={i} onClick={() => toggle(i)} className="flex items-center gap-2.5 text-left">
                    {s.done ? <CheckCircle2 className="w-4 h-4 text-sand" /> : <Circle className="w-4 h-4 text-ivory/40" />}
                    <span className={`text-sm ${s.done ? "text-ivory/45 line-through" : "text-ivory"}`}>{s.t}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}