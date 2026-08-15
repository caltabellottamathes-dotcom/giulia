import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { PageShell, GlassButton } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const FULL = 25 * 60;
const ACTIVE = TASKS.filter((t) => t.status !== "voltooid");

export default function FocusModus() {
  const [idx, setIdx] = useState(0);
  const task = ACTIVE[idx] || TASKS[0];
  const [seconds, setSeconds] = useState(FULL);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
      return () => clearInterval(ref.current);
    }
  }, [running]);
  useEffect(() => { if (seconds === 0) setRunning(false); }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const pct = ((FULL - seconds) / FULL) * 100;
  const r = 120, c = 2 * Math.PI * r;
  const next = () => { setIdx((i) => (i + 1) % ACTIVE.length); setRunning(false); setSeconds(FULL); };

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Concentratie</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Focus Modus</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-8 flex flex-col items-center text-center min-h-[60vh] justify-center">
        <p className="text-marble/50 text-xs uppercase tracking-wide">Huidige taak</p>
        <h2 className="text-storm text-2xl sm:text-3xl font-semibold mt-2 max-w-xl">{task.title}</h2>
        <p className="text-marble/50 text-sm mt-2">{task.category} · {task.duration} min gepland</p>

        <div className="relative w-72 h-72 mt-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(224,222,211,0.12)" strokeWidth="10" />
            <circle cx="140" cy="140" r={r} fill="none" stroke="#d5e24a" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-storm text-5xl font-bold tabular-nums">{mm}:{ss}</div>
        </div>

        <div className="flex items-center gap-3 mt-10">
          <button onClick={() => setRunning((r) => !r)} className="px-8 py-3.5 rounded-full bg-urgent text-metal text-sm font-semibold flex items-center gap-2 hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(213,226,74,0.4)]">
            {running ? <><Pause className="w-4 h-4" /> Pauze</> : <><Play className="w-4 h-4" /> Start</>}
          </button>
          <button onClick={() => { setRunning(false); setSeconds(FULL); }} className="p-3.5 rounded-full border border-marble/30 bg-marble/10 text-storm hover:bg-marble/20 transition-colors"><RotateCcw className="w-4 h-4" /></button>
          <button onClick={next} className="p-3.5 rounded-full border border-marble/30 bg-marble/10 text-storm hover:bg-marble/20 transition-colors"><SkipForward className="w-4 h-4" /></button>
        </div>
      </div>
    </PageShell>
  );
}