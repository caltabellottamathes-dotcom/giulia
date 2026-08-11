import React from "react";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { Timer, Play, Pause, Square, Clock } from "lucide-react";

export default function TimeTracker() {
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin, weekMin, entries, perProject } = useTimeTracker();
  const { data: projects } = useEntityList("Project");
  const projName = (id) => projects.find((p) => p.id === id)?.title || "—";
  const projEntries = Object.entries(perProject).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="timetracker"
        image={IMAGES.hourglassJacket}
        icon={Timer}
        eyebrow="Uren"
        title="Tijdregistratie"
        subtitle="Track je uren per taak en project"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Timer</p>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Taak</label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              disabled={running || paused}
              className="mt-1.5 w-full glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none disabled:opacity-60"
            >
              <option value="">Kies een taak…</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-foreground/[0.04] border border-foreground/10 px-5 py-4">
            <Clock className="h-6 w-6 text-olive shrink-0" />
            <span className="text-4xl font-display font-semibold tabular-nums tracking-tight">{formatDuration(elapsed)}</span>
          </div>
          <div className="flex gap-2">
            {!running && !paused && (
              <GlassButton variant="primary" onClick={start} disabled={!taskId} className="flex-1"><Play className="h-4 w-4" /> Start</GlassButton>
            )}
            {running && (
              <GlassButton variant="outline" onClick={pause} className="flex-1"><Pause className="h-4 w-4" /> Pauze</GlassButton>
            )}
            {paused && (
              <GlassButton variant="primary" onClick={resume} className="flex-1"><Play className="h-4 w-4" /> Hervat</GlassButton>
            )}
            {(running || paused) && (
              <GlassButton variant="primary" onClick={stop} className="flex-1"><Square className="h-4 w-4" /> Stop</GlassButton>
            )}
          </div>
        </GlassPanel>

        <div className="grid grid-cols-2 gap-4 content-start">
          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vandaag</p>
            <p className="text-3xl font-display font-semibold mt-2">{formatMinutes(todayMin)}</p>
          </GlassPanel>
          <GlassPanel level={2} className="p-6">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Deze week</p>
            <p className="text-3xl font-display font-semibold mt-2">{formatMinutes(weekMin)}</p>
          </GlassPanel>
          <GlassPanel level={2} className="p-6 col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Uren per project</p>
            {projEntries.length ? projEntries.map(([id, min]) => (
              <div key={id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <span className="text-sm truncate">{projName(id)}</span>
                <span className="text-sm font-medium tabular-nums">{formatMinutes(min)}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Nog geen uren geregistreerd</p>}
          </GlassPanel>
        </div>
      </div>

      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Alle registraties</p>
        {entries.length ? (
          <div className="divide-y divide-border/30">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.task_title || "Onbekend"}</p>
                  <p className="text-xs text-muted-foreground">{projName(e.project_id)} · {new Date(e.end_time || e.start_time).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-sm font-display font-semibold tabular-nums shrink-0">{formatMinutes(e.duration_minutes || 0)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nog geen tijd geregistreerd. Start de timer bij een taak.</p>
        )}
      </GlassPanel>
    </div>
  );
}