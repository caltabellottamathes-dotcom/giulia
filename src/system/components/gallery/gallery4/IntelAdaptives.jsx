import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Play, RotateCw, Check, Timer, Pause, Square, Sparkles } from "lucide-react";
import { Tile, SIZES, WidgetHeader, CountUp, Ring, BrandPhoto } from "./shared";

/* AgentActivityWidget — photo over the glass; Run button fills a ring 0→100%. */
const DURATION = 3200;
export function AgentActivityAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const run = () => { if (running) return; setRunning(true); setProgress(0); base44.functions.invoke("startGiulia", {}).catch(() => {}); const start = Date.now(); timer.current = setInterval(() => { const p = Math.min(100, Math.round(((Date.now() - start) / DURATION) * 100)); setProgress(p); if (p >= 100) { clearInterval(timer.current); timer.current = null; setRunning(false); } }, 50); };
  const reset = (e) => { e.stopPropagation(); setProgress(0); };
  const done = progress >= 100 && !running;
  return (
    <Tile ratio={ratio} radius="large" onClick={() => openModule("agents")}>
      <div className="flex flex-col h-full">
        <BrandPhoto src={IMAGES.feetChair} className={cn("-mb-6 rounded-b-[20px] z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)]", ratio === "tall" ? "h-20" : "h-16")} overlay="bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent">
          <div className="absolute inset-0 p-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Giulia · Agenten</p>
              <p className="text-base font-display font-semibold text-ivory mt-0.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{done ? "Klaar" : running ? "Activeren…" : "Klaar om te starten"}</p>
            </div>
            <div className="text-right"><span className="text-2xl font-display font-bold text-ivory tabular-nums leading-none">{progress}%</span><p className="text-[10px] uppercase tracking-wider text-ivory/60 mt-1">actief</p></div>
          </div>
        </BrandPhoto>
        <div className="flex-1 p-4 pt-8 flex flex-col items-center justify-center text-current min-h-0" onClick={(e) => e.stopPropagation()}>
          <Ring value={progress} max={100} size={ratio === "wide" ? 92 : 120} stroke={12}>
            <div className="text-center">
              {done ? <Check className="h-6 w-6 mx-auto" style={{ color: "var(--tile-accent)" }} /> : <CountUp value={progress} className="text-2xl font-display font-semibold tabular-nums leading-none" />}
              <p className="text-[9px] uppercase tracking-wider opacity-50 mt-1">{done ? "alle actief" : "agenten"}</p>
            </div>
          </Ring>
          {done ? <button onClick={reset} className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 border border-current/20"><RotateCw className="h-3.5 w-3.5" /> Opnieuw</button>
            : <button onClick={run} disabled={running} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}><Play className="h-3.5 w-3.5" /> {running ? "Laden…" : "Run"}</button>}
        </div>
      </div>
    </Tile>
  );
}

/* InsightsWidget — glass floats over a bottom photo; count + confidence
 * sparkline + research button. */
const ICATS = ["Opportunity", "Risk", "Research", "Suggestion", "Follow-up", "Trend"];
export function InsightsAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { data: insights, loading, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [busy, setBusy] = useState(false);
  const recent = insights.slice(0, 8);
  const fresh = insights.filter((i) => i.status === "new");
  const pts = recent.length ? recent.map((ins, i) => `${recent.length === 1 ? 0 : (i / (recent.length - 1)) * 100},${30 - (ins.confidence || 0.5) * 30}`).join(" ") : "";
  const research = async (e) => { e.stopPropagation(); setBusy(true); try { const out = await base44.functions.invoke("researchInsights", { topic: "", count: 1 }); const d = out?.data ?? out ?? {}; const x = (d.insights || [])[0] || {}; await base44.entities.Insight.create({ title: x.title || "Nieuw inzicht", content: x.content || "", category: ICATS.includes(x.category) ? x.category : "Suggestion", confidence: typeof x.confidence === "number" ? x.confidence : 0.6, source: "Giulia · web onderzoek", status: "new" }); reload(); } catch {} setBusy(false); };
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("insights")}>
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-6 rounded-b-[20px] glass-3 p-4 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col min-h-0">
          <WidgetHeader label="Giulia · Inzichten" count={insights.length ? `${insights.length}` : ""} />
          {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div> : insights.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-end gap-3"><CountUp value={fresh.length} className={cn("font-display font-semibold tracking-[-0.04em] leading-none text-ivory", ratio === "wide" ? "text-5xl" : s.big)} /><p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">nieuw</p></div>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-3 w-full h-9"><polyline points={pts} fill="none" stroke="var(--tile-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
              <p className="text-[10px] uppercase tracking-wider text-ivory/45 mt-1">betrouwbaarheid over tijd</p>
              {insights[0] && <p className="text-sm font-medium text-ivory/85 line-clamp-2 mt-2">{insights[0].title}</p>}
            </div>
          ) : <div className="flex-1 flex flex-col items-center justify-center text-center"><span className="text-4xl font-display font-semibold text-ivory/30">0</span><p className="text-sm text-ivory/55 mt-1">Giulia denkt na</p></div>}
          <button onClick={research} disabled={busy} className="mt-3 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>{busy ? "Onderzoeken…" : "Laat Giulia onderzoeken"}</button>
        </div>
        <div className={cn("relative shrink-0 overflow-hidden", s.photo)}><BrandPhoto src={IMAGES.feetChair} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" /></div>
      </div>
    </Tile>
  );
}

/* TimeTrackerWidget — LayeredWidgetTile styling: task select + live timer +
 * controls. Reimplemented on the glass shell so it reflows per ratio. */
export function TimeTrackerAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin } = useTimeTracker();
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("timetracker")}>
      <div className="p-4 flex flex-col h-full text-current min-h-0">
        <WidgetHeader label="Tijd" count={formatMinutes(todayMin)} />
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-current/55">Taak</label>
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={running || paused} onClick={(e) => e.stopPropagation()} className="mt-1 w-full glass-1 rounded-xl px-3 py-2 text-sm text-current focus:outline-none disabled:opacity-60">
              <option value="">Kies een taak…</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-current/[0.06] border border-current/10 px-4 py-3">
            <Timer className="h-5 w-5 text-olive shrink-0" />
            <span className="text-2xl font-display font-semibold tabular-nums tracking-tight">{formatDuration(elapsed)}</span>
          </div>
          <div className="flex gap-2 mt-auto">
            {!running && !paused && <button onClick={(e) => { e.stopPropagation(); start(); }} disabled={!taskId} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-olive text-ivory px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-olive/90 transition"><Play className="h-4 w-4" /> Start</button>}
            {running && <button onClick={(e) => { e.stopPropagation(); pause(); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-current/10 text-current px-4 py-2.5 text-sm font-semibold hover:bg-current/15 transition"><Pause className="h-4 w-4" /> Pauze</button>}
            {paused && <button onClick={(e) => { e.stopPropagation(); resume(); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-olive text-ivory px-4 py-2.5 text-sm font-semibold hover:bg-olive/90 transition"><Play className="h-4 w-4" /> Hervat</button>}
            {(running || paused) && <button onClick={(e) => { e.stopPropagation(); stop(); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-current text-background px-4 py-2.5 text-sm font-semibold hover:bg-current/90 transition"><Square className="h-4 w-4" /> Stop</button>}
          </div>
        </div>
      </div>
    </Tile>
  );
}

/* UpdatesWidget — "Achter de schermen · Wat er nieuw is": completed-task list. */
export function UpdatesAdaptive({ ratio = "square" }) {
  const s = SIZES[ratio];
  const { openModule } = usePanel();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const done = await base44.entities.Task.filter({ status: "completed" }, "-updated_date", 4).catch(() => []); setCompleted(done || []); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <Tile ratio={ratio} radius="medium" onClick={() => openModule("updates")}>
      <div className="p-4 flex flex-col h-full text-current min-h-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Achter de schermen</p>
          <Sparkles className="h-4 w-4" style={{ color: "var(--tile-accent)" }} />
        </div>
        <h3 className="text-base font-display font-semibold text-current leading-tight mb-2">Wat er nieuw is</h3>
        {loading ? <div className="flex-1 flex items-center justify-center"><div className="h-5 w-5 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          : completed.length === 0 ? <p className="text-[12px] text-current/55">Nog niets afgerond.</p>
          : <ul className="space-y-1.5 flex-1 min-h-0">{completed.slice(0, 3).map((t) => <li key={t.id} className="flex items-center gap-2 glass-1 rounded-lg px-2.5 py-1.5"><Check className="h-3 w-3 text-olive shrink-0" /><span className="text-[11px] truncate text-current/85">{t.title}</span></li>)}</ul>}
      </div>
    </Tile>
  );
}