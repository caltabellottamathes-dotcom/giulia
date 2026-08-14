import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { Play, Pause, Square } from "lucide-react";

/** Projectpagina — tijdregistratie voor dit project. Focus-stijl timer (naar
 *  /slick/focus-modus) in app-branding, met taakkeuze en echte registratie. */
export default function TimeSection({ project }) {
  const tt = useTimeTracker();
  const projTasks = (tt.tasks || []).filter((t) => t.project_id === project.id);
  const projEntries = (tt.entries || [])
    .filter((e) => e.project_id === project.id)
    .sort((a, b) => (b.end_time || "").localeCompare(a.end_time || ""));
  const projToday = projEntries
    .filter((e) => (e.end_time || "").slice(0, 10) === new Date().toLocaleDateString("sv-SE"))
    .reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const projTotal = projEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const pct = Math.min(100, (tt.elapsed / (25 * 60)) * 100);
  const r = 120, c = 2 * Math.PI * r;
  const task = (tt.tasks || []).find((t) => t.id === tt.taskId);

  return (
    <div className="space-y-6">
      <GlassPanel level={2} className="p-8 flex flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Huidige taak</p>
        <h2 className="text-foreground text-xl font-display font-semibold mt-2 max-w-md truncate">{task?.title || "Kies een taak"}</h2>
        <div className="mt-4 w-full max-w-xs">
          <select
            value={tt.taskId}
            onChange={(e) => tt.setTaskId(e.target.value)}
            disabled={tt.running || tt.paused}
            className="w-full rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-foreground outline-none disabled:opacity-60"
          >
            <option value="">Kies een taak…</option>
            {projTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        <div className="relative w-56 h-56 mt-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={r} fill="none" stroke="hsl(var(--foreground) / 0.10)" strokeWidth="10" />
            <circle cx="140" cy="140" r={r} fill="none" stroke="hsl(var(--olive))" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-foreground text-4xl font-display font-semibold tabular-nums">{formatDuration(tt.elapsed)}</div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          {!tt.running && !tt.paused && (
            <button onClick={tt.start} disabled={!tt.taskId} className="px-7 py-3 rounded-full bg-olive text-ivory text-sm font-semibold flex items-center gap-2 hover:bg-olive/90 active:scale-95 disabled:opacity-50 transition">
              <Play className="w-4 h-4" /> Start
            </button>
          )}
          {tt.running && (
            <button onClick={tt.pause} className="px-7 py-3 rounded-full border border-border bg-foreground/[0.04] text-foreground text-sm font-semibold flex items-center gap-2">
              <Pause className="w-4 h-4" /> Pauze
            </button>
          )}
          {tt.paused && (
            <button onClick={tt.resume} className="px-7 py-3 rounded-full bg-olive text-ivory text-sm font-semibold flex items-center gap-2">
              <Play className="w-4 h-4" /> Hervat
            </button>
          )}
          {(tt.running || tt.paused) && (
            <button onClick={tt.stop} className="px-5 py-3 rounded-full border border-border bg-foreground/[0.04] text-foreground text-sm font-semibold flex items-center gap-2">
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Totaal dit project</p>
          <p className="text-foreground text-3xl font-display font-semibold mt-1">{formatMinutes(projTotal)}</p>
        </GlassPanel>
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Vandaag</p>
          <p className="text-foreground text-3xl font-display font-semibold mt-1">{formatMinutes(projToday)}</p>
        </GlassPanel>
      </div>

      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-4">Registraties voor dit project</p>
        {projEntries.length ? (
          <div className="divide-y divide-border/30">
            {projEntries.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.task_title || "Taak"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.end_time || e.start_time).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-sm font-display font-semibold tabular-nums shrink-0">{formatMinutes(e.duration_minutes || 0)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nog geen tijd voor dit project.</p>
        )}
      </GlassPanel>
    </div>
  );
}