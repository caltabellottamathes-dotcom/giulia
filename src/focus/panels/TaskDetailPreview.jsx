import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, LiveSparkline, BarGrow } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const MID = "#94925d", URG = "#d5e24a";

export default function TaskDetailPreview({ taskId, onOpen }) {
  const [task, setTask] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let t = null;
        if (taskId) t = await base44.entities.Task.get(taskId);
        else { const list = await base44.entities.Task.filter({ status: "todo" }, "-priority", 1); t = list?.[0]; }
        setTask(t);
        setSubs([
          { id: 1, title: "Data verzamelen", done: true },
          { id: 2, title: "Analyses uitvoeren", done: true },
          { id: 3, title: "Concept schrijven", done: false },
          { id: 4, title: "Visuals maken", done: false },
          { id: 5, title: "Review ronde 1", done: false },
        ]);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [taskId]);

  const done = subs.filter(s => s.done).length;
  const pct = subs.length ? Math.round((done / subs.length) * 100) : 0;
  const toggle = (id) => setSubs(ss => ss.map(s => s.id === id ? { ...s, done: !s.done } : s));

  const ACTIVITY = [
    { time: "10:00", text: "Taak aangemaakt" },
    { time: "11:30", text: "Giulia voegde commentaar toe" },
    { time: "13:15", text: "Tijd gelogd: 45m" },
    { time: "14:02", text: "Subtaak voltooid: Data verzamelen" },
  ];

  return (
    <PreviewShell index="10" section="TASK DETAIL" statement={task?.title || "Taak detail"} kicker={`${task?.project_id ? "PROJECT" : "ALGEMEEN"} · ${task?.priority?.toUpperCase() || "—"}`} accent={URG}
      context={[
        { label: "VOORTGANG", text: `${pct}% voltooid — ${done}/${subs.length} subtaken.` },
        { label: "TIJD", text: "2u 14m gelogd vandaag." },
        { label: "DEADLINE", text: task?.due_date ? new Date(task.due_date).toLocaleDateString("nl-NL", { day: "numeric", month: "long" }) : "Geen deadline." },
      ]}
      actions={[{ label: "Complete", primary: true, onClick: () => task && base44.entities.Task.update(task.id, { status: "done" }) }, { label: "Reassign", to: "/tasks" }, { label: "Comment", to: "/tasks" }, { label: "Open Taak", to: "/tasks" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={pct} size={150} color={pct === 100 ? URG : MID} label={`${pct}%`} sub="VOLTOOID" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-1">TIJD GEGENEREERD · VANDAAG</p>
            <p className="text-storm text-2xl font-bold tabular-nums">2h 14m</p>
            <div className="mt-2"><LiveSparkline color={MID} max={10} intervalMs={1800} height={36} /></div>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PRIORITEIT</p>
            <BarGrow value={task?.priority === "high" ? 85 : task?.priority === "medium" ? 50 : 25} max={100} color={URG} height={10} />
            <p className="text-urgent text-[10px] tracking-wider mt-2">{(task?.priority || "medium").toUpperCase()} · {task?.priority === "high" ? "85" : task?.priority === "medium" ? "50" : "25"}%</p>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">SUBTAKEN · KLIK OM TE WISSELEN</p>
          <div className="space-y-1.5 mb-4">
            {subs.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)} className="w-full flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-2.5 text-left transition-colors">
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${s.done ? "bg-sand border-sand" : "border-marble/40"}`}>{s.done && <Check className="w-3 h-3 text-storm" />}</span>
                <p className={`text-sm ${s.done ? "text-storm/40 line-through" : "text-storm"}`}>{s.title}</p>
              </button>
            ))}
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">ACTIVITEIT</p>
          <div className="flex-1 overflow-auto pr-1 space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-sand mt-2 shrink-0" />
                <div>
                  <p className="text-sm text-storm">{a.text}</p>
                  <p className="text-[10px] text-storm/50 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}