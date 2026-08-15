import React from "react";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { Play, Pause, Square } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";

/** Tijd-timer module paneel — focus-stijl (naar /slick/focus-modus) met
 *  taakkeuze en echte registratie, GIULIA-glass. */
export default function TimeTrackerPreview({ onOpen }) {
  const tt = useTimeTracker();
  const pct = Math.min(100, (tt.elapsed / (25 * 60)) * 100);
  const r = 120, c = 2 * Math.PI * r;
  const task = (tt.tasks || []).find((t) => t.id === tt.taskId);
  const recent = (tt.entries || []).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-6 flex flex-col items-center text-center">
        <p className="text-ivory/55 text-xs uppercase tracking-wide">Huidige taak</p>
        <h2 className="text-ivory text-xl font-display font-semibold mt-2 max-w-md truncate">{task?.title || "Kies een taak"}</h2>

        <div className="mt-4 w-full max-w-[260px]">
          <select
            value={tt.taskId}
            onChange={(e) => tt.setTaskId(e.target.value)}
            disabled={tt.running || tt.paused}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory outline-none disabled:opacity-60"
          >
            <option value="">Kies een taak…</option>
            {(tt.tasks || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div className="relative w-56 h-56 mt-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
            <circle cx="140" cy="140" r={r} fill="none" stroke="hsl(var(--sand))" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-ivory text-4xl font-display font-semibold tabular-nums">{formatDuration(tt.elapsed)}</div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {!tt.running && !tt.paused && (
            <button onClick={tt.start} disabled={!tt.taskId} className="px-6 py-3 rounded-full bg-sand text-charcoal text-sm font-semibold flex items-center gap-2 hover:brightness-105 active:scale-95 disabled:opacity-50 transition">
              <Play className="w-4 h-4" /> Start
            </button>
          )}
          {tt.running && (
            <button onClick={tt.pause} className="px-6 py-3 rounded-full glass-button text-ivory text-sm font-semibold flex items-center gap-2"><Pause className="w-4 h-4" /> Pauze</button>
          )}
          {tt.paused && (
            <button onClick={tt.resume} className="px-6 py-3 rounded-full bg-sand text-charcoal text-sm font-semibold flex items-center gap-2"><Play className="w-4 h-4" /> Hervat</button>
          )}
          {(tt.running || tt.paused) && (
            <button onClick={tt.stop} className="px-5 py-3 rounded-full glass-button text-ivory text-sm font-semibold flex items-center gap-2"><Square className="w-4 h-4" /> Stop</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4"><p className="text-ivory/55 text-xs">Vandaag</p><p className="text-ivory text-2xl font-display font-semibold mt-1">{formatMinutes(tt.todayMin)}</p></div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4"><p className="text-ivory/55 text-xs">Deze week</p><p className="text-ivory text-2xl font-display font-semibold mt-1">{formatMinutes(tt.weekMin)}</p></div>
      </div>

      <SectionLabel>Recente registraties</SectionLabel>
      {recent.length ? (
        <div className="flex flex-col gap-2">
          {recent.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-ivory text-sm font-medium truncate">{e.task_title || "Taak"}</p>
                <p className="text-ivory/50 text-xs">{new Date(e.end_time || e.start_time).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p>
              </div>
              <span className="text-ivory font-display font-semibold tabular-nums text-sm">{formatMinutes(e.duration_minutes || 0)}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen tijd gelogd — start de timer" />
      )}
    </div>
  );
}