import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import BrandPhoto from "./BrandPhoto";
import TaskSelect from "./TaskSelect";
import { usePanel } from "@/lib/PanelContext";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { IMAGES } from "@/lib/images";
import { Play, Pause, Square, Timer } from "lucide-react";

/**
 * TimeTrackerWidget — "Tijd · Tracker". A photo floats over the top of the
 * glass; an elegant TaskSelect + a bold timer display + start/pauze/stop
 * controls. On stop a TimeEntry is logged against the task's project.
 * Tap → timetracker paneel.
 */
export default function TimeTrackerWidget() {
  const { openModule } = usePanel();
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin } = useTimeTracker();

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("timetracker")} className="min-h-[360px]">
      <div className="flex flex-col h-full">
        <BrandPhoto
          src={IMAGES.hourglassJacket}
          className="h-24 -mb-8 rounded-b-[24px] z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)]"
          overlay="bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent"
        >
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Tijd · Tracker</p>
              <p className="text-lg font-display font-semibold text-ivory mt-0.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>Vandaag {formatMinutes(todayMin)}</p>
            </div>
            <Timer className="h-6 w-6 text-ivory/70" />
          </div>
        </BrandPhoto>

        <div className="flex-1 p-5 pt-10 flex flex-col text-current min-h-0" onClick={(e) => e.stopPropagation()}>
          <WidgetHeader label="Tracker" count={formatMinutes(todayMin)} />

          <TaskSelect tasks={tasks} value={taskId} onChange={setTaskId} disabled={running || paused} />

          <div className="mt-5 flex items-center justify-center gap-3 py-3">
            <Timer className="h-5 w-5 opacity-60" style={{ color: "var(--tile-accent)" }} />
            <span className="text-4xl font-display font-semibold tabular-nums tracking-tight">{formatDuration(elapsed)}</span>
          </div>

          <div className="mt-auto flex gap-2">
            {!running && !paused && (
              <button
                onClick={start}
                disabled={!taskId}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
              >
                <Play className="h-4 w-4" /> Start
              </button>
            )}
            {running && (
              <button onClick={pause} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold glass-1 hover:bg-white/10 transition">
                <Pause className="h-4 w-4" /> Pauze
              </button>
            )}
            {paused && (
              <button
                onClick={resume}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
              >
                <Play className="h-4 w-4" /> Hervat
              </button>
            )}
            {(running || paused) && (
              <button onClick={stop} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border border-current/20 hover:bg-current/5 transition">
                <Square className="h-4 w-4" /> Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}