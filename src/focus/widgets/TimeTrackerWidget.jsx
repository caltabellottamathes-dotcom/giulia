import React from "react";
import LayeredWidgetTile from "@/system/components/experiment/LayeredWidgetTile";
import { usePanel } from "@/lib/PanelContext";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { IMAGES } from "@/lib/images";
import { Play, Pause, Square, Timer } from "lucide-react";

export default function TimeTrackerWidget() {
  const { openModule } = usePanel();
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin } = useTimeTracker();

  return (
    <LayeredWidgetTile image={IMAGES.hourglassJacket} label="Where My Time Goes." count={formatMinutes(todayMin)} onHeaderClick={() => openModule("timetracker")}>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Taak</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            disabled={running || paused}
            className="mt-1 w-full glass-1 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-60"
          >
            <option value="">Kies een taak…</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.04] border border-foreground/10 px-4 py-3">
          <Timer className="h-5 w-5 text-d-focus-light shrink-0" />
          <span className="text-3xl font-display font-semibold tabular-nums tracking-tight">{formatDuration(elapsed)}</span>
        </div>
        <div className="flex gap-2">
          {!running && !paused && (
            <button onClick={start} disabled={!taskId} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-d-focus-deep text-ivory px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-d-focus-deep/90 transition">
              <Play className="h-4 w-4" /> Start
            </button>
          )}
          {running && (
            <button onClick={pause} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground/10 text-foreground px-4 py-2.5 text-sm font-semibold hover:bg-foreground/15 transition">
              <Pause className="h-4 w-4" /> Pauze
            </button>
          )}
          {paused && (
            <button onClick={resume} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-d-focus-deep text-ivory px-4 py-2.5 text-sm font-semibold hover:bg-d-focus-deep/90 transition">
              <Play className="h-4 w-4" /> Hervat
            </button>
          )}
          {(running || paused) && (
            <button onClick={stop} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition">
              <Square className="h-4 w-4" /> Stop
            </button>
          )}
        </div>
      </div>
    </LayeredWidgetTile>
  );
}