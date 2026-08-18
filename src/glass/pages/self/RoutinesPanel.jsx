import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, TRACK, timeForPref, toMin } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { todayRoutines, completedToday } from "@/lib/selfUtils";

const START = 6, END = 24;
const toPct = (time) => ((toMin(time) - START * 60) / ((END - START) * 60)) * 100;
const wPct = (dur) => ((dur || 30) / 60) / (END - START) * 100;
const HOURS = [6, 9, 12, 15, 18, 21, 24];

export default function RoutinesPanel() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SelfRoutine.list().then((r) => setRoutines(r || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => todayRoutines(routines), [routines]);
  const done = useMemo(() => completedToday(routines), [routines]);

  const ROUTINES = today.map((r) => ({
    time: timeForPref(r.preferred_time),
    label: r.title.toUpperCase().slice(0, 18),
    dur: r.duration_min || 30,
    done: r.status === "completed",
    current: r.status === "active" && toMin(timeForPref(r.preferred_time)) <= toMin(new Date().toTimeString().slice(0, 5)),
    pending: r.status !== "completed" && toMin(timeForPref(r.preferred_time)) > toMin(new Date().toTimeString().slice(0, 5)),
    id: r.id,
  })).sort((a, b) => toMin(a.time) - toMin(b.time));

  const completeNext = async () => {
    const next = today.find((r) => r.status !== "completed");
    if (!next) return;
    try {
      await base44.entities.SelfRoutine.update(next.id, { status: "completed", last_done: new Date().toISOString(), streak_count: (next.streak_count || 0) + 1 });
      const r = await base44.entities.SelfRoutine.list(); setRoutines(r || []);
    } catch { /* ignore */ }
  };

  const skipNext = async () => {
    const next = today.find((r) => r.status !== "completed");
    if (!next) return;
    try { await base44.entities.SelfRoutine.update(next.id, { status: "skipped", streak_count: 0 }); const r = await base44.entities.SelfRoutine.list(); setRoutines(r || []); } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="02" section="ROUTINES" statement="LADEN…">{null}</PanelShell>;

  const pct = today.length ? Math.round((done.length / today.length) * 100) : 0;
  const r = 54, c = 2 * Math.PI * r;
  const nowTime = new Date().toTimeString().slice(0, 5);

  return (
    <PanelShell
      index="02"
      section="ROUTINES"
      statement={today.length ? `${done.length}/${today.length} VOLTOOID` : "GEEN ROUTINES"}
      context={[
        { label: "CURRENT", text: ROUTINES.find((x) => x.current)?.label ? `${ROUTINES.find((x) => x.current).label} — nu` : "Geen actieve routine op dit moment." },
        { label: "NEXT", text: ROUTINES.find((x) => x.pending)?.label ? `${ROUTINES.find((x) => x.pending).label} om ${ROUTINES.find((x) => x.pending).time}.` : "Geen routines meer vandaag." },
        { label: "PROGRESS", text: `${done.length} van ${today.length} routines voltooid vandaag.` },
      ]}
      actions={[
        { label: "Complete", primary: true, onClick: completeNext },
        { label: "Skip", onClick: skipNext },
        { label: "Open Routines", to: "/self/routines" },
      ]}
    >
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={r} fill="none" stroke={TRACK} strokeWidth="7" />
            <circle cx="64" cy="64" r={r} fill="none" stroke={BLUE} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-storm text-2xl font-bold tabular-nums leading-none">{done.length}/{today.length || 0}</span>
            <span className="text-storm/50 text-[9px] tracking-wider mt-1">COMPLETE</span>
          </div>
        </div>
        <p className="text-storm/60 text-sm leading-relaxed max-w-sm">De dag loopt in routines. {today.length ? `${today.length} gepland, ${today.length - done.length} te gaan.` : "Niets gepland vandaag — voeg er een toe."}</p>
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
        <div className="relative h-28">
          <div className="absolute top-0 left-0 right-0 flex justify-between text-storm/40 text-[10px] tabular-nums px-2">
            {HOURS.map((h) => <span key={h}>{String(h).padStart(2, "0")}</span>)}
          </div>
          <div className="absolute top-5 left-0 right-0 h-px bg-marble/20" />
          <div className="absolute top-4 bottom-0 w-px bg-sand" style={{ left: `${Math.max(0, Math.min(100, toPct(nowTime)))}%` }}>
            <span className="absolute -top-1 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: SAND }} />
          </div>
          <div className="absolute top-7 bottom-2 left-0 right-0">
            {ROUTINES.length ? ROUTINES.map((rt, i) => (
              <div key={rt.id || i}
                className={`absolute h-7 rounded-lg flex items-center px-2 ${rt.current ? "text-metal animate-pulse" : rt.done ? "text-metal" : "text-storm/50 border border-marble/20"}`}
                style={{ left: `${Math.max(0, toPct(rt.time))}%`, width: `${Math.max(8, wPct(rt.dur))}%`, top: `${i * 12}px`, background: rt.current ? SAND : rt.done ? BLUE : "rgba(255,255,255,0.06)" }}
              >
                <span className="text-[9px] font-medium tracking-wide truncate">{rt.label}</span>
              </div>
            )) : <p className="text-storm/40 text-xs px-2">Geen routines vandaag.</p>}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] tracking-wider">
          <span className="flex items-center gap-1.5 text-storm"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />DONE</span>
          <span className="flex items-center gap-1.5" style={{ color: SAND }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: SAND }} />NOW</span>
          <span className="flex items-center gap-1.5 text-storm/50"><span className="w-2.5 h-2.5 rounded-sm border border-marble/30" />UPCOMING</span>
        </div>
      </div>
    </PanelShell>
  );
}