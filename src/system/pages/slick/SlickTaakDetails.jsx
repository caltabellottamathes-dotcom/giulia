import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Flag, CheckCircle2, Circle } from "lucide-react";
import { PageShell, GlassButton, SectionHeader, Divider, StatusBadge, CATEGORY_COLORS } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const NOTES = "Klant wil focus op Q3 cijfers en concurrentiepositie. Verzamel data uit marktrapporten en interview Giulia voor extra context. Rapport uiterlijk vrijdag klaar.";
const SUBTASKS = [
  { t: "Data verzamelen", done: true },
  { t: "Giulia interviewen", done: true },
  { t: "Concept opstellen", done: false },
  { t: "Rapport schrijven", done: false },
];

export default function TaakDetails() {
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [subs, setSubs] = useState(SUBTASKS);
  const task = TASKS.find((t) => t.id === taskId);
  const toggle = (i) => setSubs((s) => s.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)));

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Taak</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Taak Details</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {TASKS.slice(0, 8).map((t) => (
          <button key={t.id} onClick={() => setTaskId(t.id)} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${t.id === taskId ? "bg-urgent text-metal border-urgent" : "border-marble/30 bg-marble/10 text-marble hover:bg-marble/20"}`}>
            {t.title.slice(0, 22)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-storm text-xl font-semibold">{task.title}</h2>
            <p className={`${CATEGORY_COLORS[task.category]} text-xs mt-1`}>{task.category}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>

        <Divider className="my-5" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Datum", value: task.date },
            { icon: Clock, label: "Tijd", value: task.time },
            { icon: Clock, label: "Duur", value: `${task.duration} min` },
            { icon: Flag, label: "Type", value: task.type },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-marble/50 text-[10px] uppercase">{m.label}</p>
              <p className="text-storm text-sm font-medium mt-1 flex items-center gap-1.5"><m.icon className="w-3.5 h-3.5 text-marble/60" />{m.value}</p>
            </div>
          ))}
        </div>

        <Divider className="my-5" />
        <SectionHeader number={1} title="Notities" />
        <p className="text-marble/80 text-sm leading-relaxed mt-3">{NOTES}</p>

        <Divider className="my-5" />
        <SectionHeader number={2} title="Subtaken" />
        <div className="mt-3 flex flex-col gap-2">
          {subs.map((s, i) => (
            <button key={i} onClick={() => toggle(i)} className="flex items-center gap-2.5 text-left">
              {s.done ? <CheckCircle2 className="w-4 h-4 text-urgent" /> : <Circle className="w-4 h-4 text-marble/40" />}
              <span className={`text-sm ${s.done ? "text-marble/50 line-through" : "text-storm"}`}>{s.t}</span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}