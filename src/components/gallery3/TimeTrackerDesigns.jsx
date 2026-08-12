import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { accentVars } from "@/lib/widgetAccent2";
import { Play, Pause, Square } from "lucide-react";

/* ANALYSE — Tijdregistratie: totaal vandaag/week, taakkiezer, start/pauze/
 * stop, duur-display, recente registraties. Focus: live timer + tijd loggen
 * per taak.
 * D2 "Live-timer-ring + week" (3:4) — grote live timer-ring, vandaag/week,
 * recente entries onder. Motion: ring tikt per seconde bij draaien.
 * D3 "Taakkiezer + stopwatch" (4:3) — links taaklijst, rechts grote stopwatch
 * + controls. Motion: cijfers tikken. */

export function TimeTrackerDesign2() {
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop, todayMin, weekMin, entries } = useTimeTracker();
  const r = 54, c = 2 * Math.PI * r;
  const sec = Math.floor(elapsed % 60);
  const pct = (sec / 60) * 100;
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Tijd · live</p>
        <span className="text-[10px] tabular-nums opacity-50">{formatMinutes(todayMin)} vandaag</span>
      </div>
      <div className="flex items-center justify-center my-3">
        <svg width={132} height={132} viewBox="0 0 132 132">
          <circle cx={66} cy={66} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
          <motion.circle cx={66} cy={66} r={r} fill="none" stroke="var(--tile-accent)" strokeWidth={8} strokeLinecap="round"
            strokeDasharray={c} animate={{ strokeDashoffset: c - (c * pct) / 100 }} transition={{ duration: 0.3 }} transform="rotate(-90 66 66)" />
          <text x={66} y={62} textAnchor="middle" className="fill-ivory font-bold" style={{ fontSize: 22 }}>{formatDuration(elapsed)}</text>
          <text x={66} y={80} textAnchor="middle" className="fill-ivory opacity-50" style={{ fontSize: 10 }}>{formatMinutes(weekMin)} week</text>
        </svg>
      </div>
      <select value={taskId} onChange={(e) => setTaskId(e.target.value)} disabled={running || paused} className="w-full glass-1 rounded-xl px-3 py-2 text-[11px] text-ivory focus:outline-none disabled:opacity-60 mb-2">
        <option value="">Kies taak…</option>
        {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
      <div className="flex gap-2 mb-2">
        {!running && !paused && <button onClick={start} disabled={!taskId} className="flex-1 rounded-full py-2 text-xs font-semibold disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "#fff" }}><Play className="inline h-3.5 w-3.5" /> Start</button>}
        {running && <button onClick={pause} className="flex-1 rounded-full glass-1 py-2 text-xs font-semibold"><Pause className="inline h-3.5 w-3.5" /> Pauze</button>}
        {paused && <button onClick={resume} className="flex-1 rounded-full py-2 text-xs font-semibold" style={{ background: "var(--tile-accent)", color: "#fff" }}><Play className="inline h-3.5 w-3.5" /> Hervat</button>}
        {(running || paused) && <button onClick={stop} className="flex-1 rounded-full bg-ivory text-charcoal py-2 text-xs font-semibold"><Square className="inline h-3.5 w-3.5" /> Stop</button>}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden min-h-0">
        {entries.slice(0, 3).map((e) => (
          <div key={e.id} className="text-[10px] glass-1 rounded-lg px-2 py-1 truncate"><span className="opacity-60">{formatMinutes(e.duration_minutes || 0)}</span> · {e.task_title || "?"}</div>
        ))}
      </div>
    </div>
  );
}

export function TimeTrackerDesign3() {
  const { tasks, taskId, setTaskId, running, paused, elapsed, start, pause, resume, stop } = useTimeTracker();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "4/3", ...accentVars("olive") }}>
      <div className="w-[42%] flex flex-col min-h-0">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65 mb-2">Tijd · taken</p>
        <div className="flex-1 space-y-1 overflow-hidden">
          {tasks.slice(0, 6).map((t) => (
            <button key={t.id} onClick={() => !running && !paused && setTaskId(t.id)} className={`w-full text-left rounded-lg px-2 py-1.5 text-[10px] truncate transition ${taskId === t.id ? "text-ivory" : "opacity-55 hover:opacity-80"}`} style={taskId === t.id ? { background: "var(--tile-accent)" } : { background: "rgba(255,255,255,0.08)" }}>
              {t.title}
            </button>
          ))}
        </div>
      </div>
      <div className="w-px bg-ivory/10 mx-3" />
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <motion.div key={Math.floor(elapsed)} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} className="text-4xl font-display font-bold tabular-nums tracking-tight">{formatDuration(elapsed)}</motion.div>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">{running ? "loopt" : paused ? "gepauzeerd" : "klaar"}</p>
        <div className="flex gap-2 mt-4">
          {!running && !paused && <button onClick={start} disabled={!taskId} className="h-11 w-11 rounded-full flex items-center justify-center disabled:opacity-40" style={{ background: "var(--tile-accent)", color: "#fff" }}><Play className="h-4 w-4" /></button>}
          {running && <button onClick={pause} className="h-11 w-11 rounded-full glass-1 flex items-center justify-center"><Pause className="h-4 w-4" /></button>}
          {paused && <button onClick={resume} className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: "var(--tile-accent)", color: "#fff" }}><Play className="h-4 w-4" /></button>}
          {(running || paused) && <button onClick={stop} className="h-11 w-11 rounded-full bg-ivory text-charcoal flex items-center justify-center"><Square className="h-4 w-4" /></button>}
        </div>
      </div>
    </div>
  );
}

export default { Design2: TimeTrackerDesign2, Design3: TimeTrackerDesign3 };