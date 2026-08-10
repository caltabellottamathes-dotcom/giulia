import React, { useState, useEffect } from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import PhotoCard from "@/components/projects/PhotoCard";
import { IMAGES } from "@/lib/images";
import { base44 } from "@/api/base44Client";
import { isTaskDone } from "@/lib/projectStatus";
import { cn } from "@/lib/utils";

const PHASES = ["Idee", "Planning", "Uitvoering", "Afwering", "Klaar"];
const statusToPhase = { idea: 0, planning: 1, in_progress: 2, review: 2, waiting: 2, afwerking: 3, completed: 4, paused: 2, archived: 4 };

/** Timeline — a visual project journey. With dates it becomes a proportional
 *  track (start → vandaag → eind) with milestone markers; without dates it
 *  shows the phase progression so the timeline still reads visually. */
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

  const start = project.start_date ? new Date(project.start_date) : null;
  const end = (project.deadline || project.end_date) ? new Date(project.deadline || project.end_date) : null;
  const today = new Date();
  const hasDates = start && end && end > start;

  const pos = (d) => {
    if (!hasDates) return 0;
    const p = (new Date(d) - start) / (end - start);
    return Math.max(0, Math.min(100, p * 100));
  };
  const todayPos = hasDates ? pos(today) : 0;
  const daysLeft = hasDates ? Math.max(0, Math.ceil((end - today) / 86400000)) : null;
  const datedMilestones = milestones.filter((m) => m.date);

  const items = [
    ...events.map((e) => ({ id: e.id, date: e.start, title: e.title, type: "Afspraak" })),
    ...tasks.filter((t) => t.deadline).map((t) => ({ id: t.id, date: t.deadline, title: t.title, type: "Deadline", done: isTaskDone(t) })),
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
    <div className="space-y-4">
      <PhotoCard src={IMAGES.hourglassJacket} stripHeight="h-20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Projecttijdlijn</p>
            <h2 className="text-lg font-display font-semibold">
              {hasDates
                ? `${start.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} → ${end.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`
                : "Doorlooptijd nog in te plannen"}
            </h2>
          </div>
          {daysLeft !== null && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resterend</p>
              <p className="text-sm font-display font-semibold tabular-nums">{daysLeft} dagen</p>
            </div>
          )}
        </div>

        {hasDates ? (
          <div className="relative mt-7">
            {todayPos > 5 && todayPos < 95 && (
              <span className="absolute -top-5 -translate-x-1/2 text-[9px] uppercase tracking-wider text-charcoal font-semibold" style={{ left: `${todayPos}%` }}>Vandaag</span>
            )}
            <div className="relative h-2.5 rounded-full bg-steel/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-olive transition-all duration-700" style={{ width: `${Math.max(todayPos, 1)}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 bg-charcoal" style={{ left: `${todayPos}%` }} />
              {datedMilestones.map((m) => (
                <div
                  key={m.id}
                  className={cn("absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 rounded-full border-2 border-background shadow-sm", m.status === "done" ? "bg-olive" : "bg-powder")}
                  style={{ left: `${pos(m.date)}%` }}
                  title={m.name}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{start.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
              <span>{end.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        ) : (
          <PhaseTrack project={project} milestones={milestones} />
        )}
      </PhotoCard>

      <GlassPanel level={2} className="p-6">
        <h2 className="text-sm font-display font-semibold mb-5">Detail</h2>
        <div className="space-y-7">
          {Object.entries(months).map(([k, m]) => (
            <div key={k}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{m.label}</p>
              <div className="space-y-1">
                {m.items.map((i) => {
                  const d = new Date(i.date);
                  const dot = i.done ? "bg-olive" : i.type.startsWith("Milestone") ? "bg-powder" : i.type === "Deadline" ? "bg-steel" : "bg-steel/50";
                  return (
                    <div key={i.id} className="flex items-center gap-4 py-1.5">
                      <span className="text-xs text-muted-foreground tabular-nums w-14 shrink-0">{d.toLocaleDateString("nl-NL", { day: "numeric" })} {d.toLocaleDateString("nl-NL", { month: "short" })}</span>
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dot)} />
                      <span className={cn("text-sm", i.done ? "line-through text-muted-foreground" : "text-foreground")}>{i.title}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">{i.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">Nog geen datums of deadlines gekoppeld — voeg start- en einddatum toe aan het project om de tijdlijn te activeren.</p>}
        </div>
      </GlassPanel>
    </div>
  );
}

function PhaseTrack({ project, milestones }) {
  const current = statusToPhase[project.status] ?? 1;
  return (
    <div className="mt-6">
      <div className="flex gap-1.5">
        {PHASES.map((p, i) => (
          <div key={p} className={cn("flex-1 h-2.5 rounded-full transition-colors", i < current ? "bg-olive" : i === current ? "bg-powder" : "bg-steel/20")} />
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        {PHASES.map((p, i) => (
          <span key={p} className={cn("flex-1 text-[10px] uppercase tracking-wider text-center", i === current ? "text-powder font-semibold" : "text-muted-foreground")}>{p}</span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        {milestones.length > 0
          ? `${milestones.length} milestone${milestones.length !== 1 ? "s" : ""} vastgelegd — voeg datums toe om ze op de tijdlijn te plaatsen.`
          : "Voeg start- en einddatum toe aan het project voor een datum-tijdlijn."}
      </p>
    </div>
  );
}