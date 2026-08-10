import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { isTaskDone } from "@/lib/projectStatus";

/** Timeline — chronological events, task deadlines and milestones. */
export default function TimelineSection({ project, tasks }) {
  const [events, setEvents] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    (async () => {
      const [ev, ms] = await Promise.all([
        base44.entities.Event.list(),
        base44.entities.Milestone.list(),
      ]);
      setEvents(ev.filter((e) => e.project_id === project.id));
      setMilestones(ms.filter((m) => m.project_id === project.id));
    })();
  }, [project.id]);

  const items = [
    ...events.map((e) => ({ id: e.id, date: e.start, title: e.title, type: "Afspraak" })),
    ...tasks.filter((t) => t.deadline).map((t) => ({ id: t.id, date: t.deadline, title: t.title, type: "Taak deadline", done: isTaskDone(t) })),
    ...milestones.map((m) => ({ id: m.id, date: m.date, title: m.name, type: m.status === "done" ? "Milestone ✓" : "Milestone", done: m.status === "done" })),
  ].filter((i) => i.date).sort((a, b) => new Date(a.date) - new Date(b.date));

  const months = {};
  items.forEach((i) => {
    const d = new Date(i.date);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!months[k]) months[k] = { label: d.toLocaleDateString("nl-NL", { month: "long", year: "numeric" }), items: [] };
    months[k].items.push(i);
  });

  return (
    <GlassPanel level={2} className="p-6">
      <h2 className="text-sm font-display font-semibold mb-5">Tijdlijn</h2>
      <div className="space-y-7">
        {Object.entries(months).map(([k, m]) => (
          <div key={k}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{m.label}</p>
            <div className="space-y-1">
              {m.items.map((i) => {
                const d = new Date(i.date);
                return (
                  <div key={i.id} className="flex items-center gap-4 py-1.5">
                    <span className="text-xs text-muted-foreground tabular-nums w-14 shrink-0">{d.toLocaleDateString("nl-NL", { day: "numeric" })} {d.toLocaleDateString("nl-NL", { month: "short" })}</span>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${i.done ? "bg-emerald-500" : i.type === "Milestone" ? "bg-olive" : "bg-foreground/40"}`} />
                    <span className={`text-sm ${i.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{i.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">{i.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Geen datums of deadlines gekoppeld.</p>}
      </div>
    </GlassPanel>
  );
}