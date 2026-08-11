import React from "react";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { HeroStat, SectionLabel, Row, Empty } from "./previewParts";
import { Play, Pause, Square } from "lucide-react";

export default function TimeTrackerPreview({ onOpen }) {
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin, weekMin, entries } = useTimeTracker();
  const recent = entries.slice(0, 6);

  return (
    <div className="space-y-4">
      <HeroStat value={formatMinutes(todayMin)} label="Tijd vandaag" accent="hsl(var(--olive))" sub={`${formatMinutes(weekMin)} deze week`} />

      <div className="glass-card-2 rounded-2xl p-4 space-y-3">
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          disabled={running || paused}
          className="w-full glass-button rounded-xl px-3 py-2 text-sm text-ivory focus:outline-none disabled:opacity-60"
        >
          <option value="">Kies een taak…</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-display font-semibold tabular-nums text-ivory">{formatDuration(elapsed)}</span>
          <div className="flex gap-1.5">
            {!running && !paused && (
              <button onClick={start} disabled={!taskId} className="h-8 w-8 rounded-full bg-olive text-ivory flex items-center justify-center disabled:opacity-50 transition"><Play className="h-3.5 w-3.5" /></button>
            )}
            {running && (
              <button onClick={pause} className="h-8 w-8 rounded-full glass-button text-ivory flex items-center justify-center transition"><Pause className="h-3.5 w-3.5" /></button>
            )}
            {paused && (
              <button onClick={resume} className="h-8 w-8 rounded-full bg-olive text-ivory flex items-center justify-center transition"><Play className="h-3.5 w-3.5" /></button>
            )}
            {(running || paused) && (
              <button onClick={stop} className="h-8 w-8 rounded-full bg-ivory text-charcoal flex items-center justify-center transition"><Square className="h-3.5 w-3.5" /></button>
            )}
          </div>
        </div>
      </div>

      <SectionLabel>Recente registraties</SectionLabel>
      {recent.length ? (
        recent.map((e) => (
          <Row
            key={e.id}
            title={e.task_title || "Onbekend"}
            sub={`${formatMinutes(e.duration_minutes || 0)} · ${new Date(e.end_time || e.start_time).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`}
            accent="hsl(var(--olive))"
            onClick={onOpen}
          />
        ))
      ) : (
        <Empty text="Nog geen tijd gelogd — start de timer" />
      )}
    </div>
  );
}